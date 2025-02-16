const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');

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

        const character = interaction.options.getString('character')
        
        playerToAsk.characters[playerToAsk.round] = character;
        playerToAsk.round++;
        playerToAsk.noAmount[playerToAsk.round] = 0;
        playerToAsk.questions[playerToAsk.round] = [];
        playerToAsk.roundsWon++;

        let replyString = `Congratulations! Your character was **${character}**! It took you **${playerToAsk.noAmount[playerToAsk.round]}** No's to guess it. Your Total No Count is: **${playerToAsk.noAmount.reduce((a, b) => a + b, 0)}** <@${playerToAsk.id}>\n`;
        replyString += `You won **${playerToAsk.roundsWon}** ${playerToAsk.roundsWon === 1 ? 'Round' : 'Rounds'}.\nYou guessed these Characters so far:\n`;
        for (let i=0;i<playerToAsk.characters.length;i++){
            replyString += playerToAsk.characters[i] + "\n";
        }

        await interaction.reply(replyString);
    },
};