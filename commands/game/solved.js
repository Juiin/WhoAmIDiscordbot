const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');
const { findGameByPlayerIds, findGamesByPlayerId, findGameWithUser, findUser  } = require("../../util.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('solved')
		.setDescription('Let your opponent know they solved it.')
        .addStringOption(option =>
			option.setName('character')
				.setDescription(`Your opponent's character`)
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

        const character = interaction.options.getString('character')
        
        playerToAsk.guessedCharacters[playerToAsk.round] = character;
        playerToAsk.round++;
        playerToAsk.noAmount[playerToAsk.round] = 0;
        playerToAsk.questions[playerToAsk.round] = [];
        playerToAsk.roundsWon++;
        game.save();

        let replyString = `Congratulations! Your character was **${character}**! It took you **${playerToAsk.noAmount[playerToAsk.round-1]}** No's to guess it. Your Total No Count is: **${playerToAsk.noAmount.reduce((a, b) => a + b, 0)}** <@${playerToAsk.id}>\n`;
        replyString += `You won **${playerToAsk.roundsWon}** ${playerToAsk.roundsWon === 1 ? 'Round' : 'Rounds'}.\nYou guessed these Characters so far:\n`;
        for (let i=0;i<playerToAsk.guessedCharacters.length;i++){
            replyString += playerToAsk.guessedCharacters[i] + "\n";
        }

        await interaction.reply(replyString);
    },
};