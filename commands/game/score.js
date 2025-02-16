const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');

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

        let replyString = `<@${playerAsking.id}>\nScore: ${playerAsking.roundsWon}\nCurrent Rounds No's: ${playerAsking.noAmount[playerAsking.round]}\nTotal No's: ${playerAsking.noAmount.reduce((a, b) => a + b, 0)}\nGuessed Characters: `;
        for (let i=0;i<playerAsking.characters.length;i++){
            replyString += playerAsking.characters[i] + ",";
        }
        replyString += `\n\n<@${playerToAsk.id}>\nScore: ${playerToAsk.roundsWon}\nCurrent Rounds No's: ${playerToAsk.noAmount[playerToAsk.round]}\nTotal No's: ${playerToAsk.noAmount.reduce((a, b) => a + b, 0)}\nGuessed Characters: `;
        for (let i=0;i<playerToAsk.characters.length;i++){
            replyString += i > 0 ? "," : "" 
            replyString += playerToAsk.characters[i];
        }

        await interaction.reply(replyString);
    },
};