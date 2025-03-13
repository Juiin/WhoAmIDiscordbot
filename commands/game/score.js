const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');
const { findGameByPlayerIds, findGamesByPlayerId, findGameWithUser, findUser  } = require("../../util.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('score')
		.setDescription('Get all the info about the current score.')
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

        let replyString = `<@${playerAsking.id}>\nScore: ${playerAsking.roundsWon}\nCurrent Rounds No's: ${playerAsking.noAmount[playerAsking.round]}\nTotal No's: ${playerAsking.noAmount.reduce((a, b) => a + b, 0)}\nGuessed Characters: `;
        for (let i=0;i<playerAsking.guessedCharacters.length;i++){
            replyString += playerAsking.guessedCharacters[i] + ",";
        }
        replyString += `\n\n<@${playerToAsk.id}>\nScore: ${playerToAsk.roundsWon}\nCurrent Rounds No's: ${playerToAsk.noAmount[playerToAsk.round]}\nTotal No's: ${playerToAsk.noAmount.reduce((a, b) => a + b, 0)}\nGuessed Characters: `;
        for (let i=0;i<playerToAsk.guessedCharacters.length;i++){
            replyString += i > 0 ? "," : "" 
            replyString += playerToAsk.guessedCharacters[i];
        }

        await interaction.reply(replyString);
    },
};