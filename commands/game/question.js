const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');

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
        if (!interaction.client.activePlayerGames.get(interaction.user.id)){
            return await interaction.reply(`You don't have any games started. <@${interaction.user.id}>`);
        }

        
		const userToAsk = interaction.options.getUser('user');


        const gameArray = interaction.client.activePlayerGames.get(interaction.user.id);

        let game;
        if (userToAsk){
             for (let i=0;i<gameArray.length;i++){
                if (gameArray[i].player1.id === userToAsk.id || gameArray[i].player2.id === userToAsk.id){
                    game = gameArray[i];
                    break;
                }
                if (i===gameArray.length-1){
                    return await interaction.reply("You don't have a game with that user");
                }
             }
             
        }else{
             game = gameArray[0];
        }
        
        let playerAsking,playerToAsk;
        if (game.player1.id === interaction.user.id){
            playerAsking = game.player1;
            playerToAsk = game.player2;
        }else{
            playerAsking = game.player2;
            playerToAsk = game.player1;
        }

        if(playerAsking.activeQuestion !== undefined){
            return await interaction.reply("You already have an active Question.");
        }

        const question = new Question(interaction.options.getString("question"));
        playerAsking.activeQuestion = question;
        

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

        const collectorFilter  = i => i.user.id === playerToAsk.id;

        try {
            const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 2147483646 });

            if (confirmation.customId === 'yes') {
                question.true = true;
                await confirmation.message.delete();
                await interaction.followUp({ content: `✅ ${question.question} <@${playerAsking.id}>`, components: [] });
            } else if (confirmation.customId === 'no') {
                question.true = false;
                playerAsking.noAmount[playerAsking.round]++;
                await confirmation.message.delete();
                await interaction.followUp({ content: `❌ ${question.question} <@${playerAsking.id}>\n Current Round No's: ${playerAsking.noAmount[playerAsking.round]} \n Total No's: ${playerAsking.noAmount.reduce((a, b) => a + b, 0)}`, components: [] });
            } else if(confirmation.customId === "cancel"){
                playerAsking.activeQuestion = undefined;
                await confirmation.message.delete();
                return await interaction.followUp({ content: `Your question was cancelled, please ask a new one. <@${playerAsking.id}>`, flags: MessageFlags.Ephemeral });
            }
           
                
            playerAsking.questions[playerAsking.round].push(question);
            playerAsking.activeQuestion = undefined;
        } catch(error) {
            console.error(error);
            playerAsking.activeQuestion = undefined;
            await interaction.editReply({ content: 'Confirmation not received within timelimit, cancelling', components: [] });
        }
    },
};