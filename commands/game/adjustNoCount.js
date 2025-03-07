const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');
const { findGameByPlayerIds, findGamesByPlayerId } = require("../../util.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adjustnocount')
		.setDescription(`Adjust your opponent's No Count incase you made a mistake`)
        .addIntegerOption(option =>
			option.setName('amount')
				.setDescription(`Amount to adjust No Count, can be negative.`)
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

        const noCountAdjustment = interaction.options.getInteger("amount");

        playerToAsk.noAmount[playerToAsk.round] += noCountAdjustment;
        game.save();

        let replyString = `You adjusted <@${playerToAsk.id}>'s No Count by **${noCountAdjustment}**! You new No Count is **${playerToAsk.noAmount[playerToAsk.round]}**. Your Total No Count is: **${playerToAsk.noAmount.reduce((a, b) => a + b, 0)}**`;

        await interaction.reply(replyString);
    },
};