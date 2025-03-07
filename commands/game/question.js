const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');
const { findGameByPlayerIds, findGamesByPlayerId } = require("../../util.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('question')
		.setDescription('Ask a new question about yourself.')
        .addStringOption(option =>
			option.setName('question')
				.setDescription('The question to ask.')
				.setRequired(true))
		.addUserOption(option =>
			option.setName('user')
				.setDescription(`If you have multiple Games going on at the same time, specificy with whom you are playing.`)
				.setRequired(false))
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {

        
		const userToAsk = interaction.options.getUser('user');

        let game = await findGamesByPlayerId(interaction.user.id);
		
		if (game.length <= 0){
			return await interaction.reply(`You don't have any games started. <@${interaction.user.id}>`);
		} 

        if (userToAsk){
            game = await findGameByPlayerIds(interaction.user.id, userToAsk.id);

            if (!game){
                return await interaction.reply("You don't have a game with that user");
            }
        }else{
            game = game[0];
        }

        
        let playerAsking,playerToAsk;
        if (game.player1.id === interaction.user.id){
            playerAsking = game.player1;
            playerToAsk = game.player2;
        }else{
            playerAsking = game.player2;
            playerToAsk = game.player1;
        }

        if(playerAsking.activeQuestion.question !== undefined){
            return await interaction.reply("You already have an active Question.");
        }

        const question = new Question(interaction.options.getString("question"));
        playerAsking.activeQuestion = question;
        game.save();
        

        const yes = new ButtonBuilder()
			.setCustomId('yes')
			.setLabel('Yes')
			.setStyle(ButtonStyle.Success);

		const no = new ButtonBuilder()
			.setCustomId('no')
			.setLabel('No')
			.setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(yes, no, cancel);

        const response = await interaction.reply({
			content: `${question.question} <@${playerToAsk.id}>`,
			components: [row],
            withResponse: true,
		});


        const collectorFilter = i => 
            (i.customId === 'yes' || i.customId === 'no') && i.user.id === playerToAsk.id || 
            (i.customId === 'cancel' && (i.user.id === playerToAsk.id || i.user.id === playerAsking.id));

        try {
            const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 2147483646 });

            if (confirmation.customId === 'yes') {
                question.true = true;
                await confirmation.update({ content: `✅ ${question.question} <@${playerAsking.id}>`, components: [] });
            } else if (confirmation.customId === 'no') {
                question.true = false;
                playerAsking.noAmount[playerAsking.round]++;
                await confirmation.update({ content: `❌ ${question.question} <@${playerAsking.id}>\n Current Round No's: ${playerAsking.noAmount[playerAsking.round]} \n Total No's: ${playerAsking.noAmount.reduce((a, b) => a + b, 0)}`, components: [] });
            } else if(confirmation.customId === "cancel"){
                playerAsking.activeQuestion = {};
                game.save();
                return await confirmation.update({ content: `Your question was cancelled, please ask a new one. <@${playerAsking.id}>`, components: [] });
            }
           
                
            playerAsking.questions[playerAsking.round].push(question);
            playerAsking.activeQuestion = {};
            game.save();
        } catch(error) {
            console.error(error);
            playerAsking.activeQuestion = {};
            game.save();
            await interaction.editReply({ content: 'Confirmation not received within timelimit, cancelling', components: [] });
        }
    },
};