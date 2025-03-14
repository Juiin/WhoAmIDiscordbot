const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');
const { findGameByPlayerIds, findGamesByPlayerId, findGameWithUser, findUser } = require("../../util.js")

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
            const databaseUser = await findUser(interaction.user.id);
            game = findGameWithUser(game, databaseUser.defaultUser);
        }

        
        let playerAsking,playerToAsk;
        if (game.player1.id === interaction.user.id){
            playerAsking = game.player1;
            playerToAsk = game.player2;
        }else{
            playerAsking = game.player2;
            playerToAsk = game.player1;
        }

        if (playerAsking.activeQuestion.question !== undefined){
            const cancelActive = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);
        
            const row = new ActionRowBuilder().addComponents(cancelActive);
        
            const response = await interaction.reply({
                content: `You already have an active question: **"${playerAsking.activeQuestion.question}"**\nDo you want to cancel it?`,
                components: [row],
                flags: MessageFlags.Ephemeral,
            });
        
            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: i => i.user.id === playerAsking.id,
                    time: 15000 
                });
        
                if (confirmation.customId === 'cancel') {
                    playerAsking.activeQuestion = {};
                    game.save();
                    await confirmation.update({ content: `Your active question has been cancelled. You can now ask a new one.`, components: [], flags: MessageFlags.Ephemeral });
                } 
            } catch {
                await interaction.editReply({ content: `No response received. Your question remains active.`, components: [], flags: MessageFlags.Ephemeral  });
            }
        
            return;
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
            
            game = await findGameByPlayerIds(playerAsking.id, playerToAsk.id);

            if (!game) {
                return await interaction.reply("The game could not be found. Please try again.");
            }
            
            // Fetch the latest state of the player (from the database)
            playerAsking = game.player1.id === playerAsking.id ? game.player1 : game.player2;
            
            // Check if they still have an active question
            if (playerAsking.activeQuestion.question == question.question) {

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
            }else{
                return await confirmation.update({ content: `Sorry, this question was already cancelled by another command.`, components: [] });
            }
            
        } catch(error) {
            console.error(error);
            playerAsking.activeQuestion = {};
            game.save();
            await interaction.editReply({ content: 'Confirmation not received within timelimit, cancelling', components: [] });
        }
    },
};