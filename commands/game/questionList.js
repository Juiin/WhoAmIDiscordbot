const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('questionlist')
		.setDescription('Get a list of all the Questions for your currenct Character')
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

        let replyString = "Questions for your current Character: \n";
        if(playerAsking.questions[playerAsking.round]){
            for (let i=0;i<playerAsking.questions[playerAsking.round].length;i++){
                const question = playerAsking.questions[playerAsking.round][i];
                replyString += question.true ? "✅ " : "❌ ";
                replyString += question.question;
                replyString += "\n";
            }
        }else{
            replyString = "You haven't asked any questions yet.";
        }
        
        //replyString = replyString === "" ? "You haven't asked any questions." : replyString;
        await interaction.reply({ content: replyString, flags: MessageFlags.Ephemeral });
    },
};