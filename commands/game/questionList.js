const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');
const { findGameByPlayerIds, findGamesByPlayerId } = require("../../util.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('questionlist')
		.setDescription('Get a list of all the Questions for your currenct Character')
        .addBooleanOption(option =>
            option.setName(`opponent`)
                .setDescription('Whether or not to get your opponnents list instead of your own'))
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

        let replyString = "Questions for your current Character: \n";
        const player = interaction.options.getBoolean(`opponent`) ? playerToAsk : playerAsking;
        if(player.questions[player.round]){
            for (let i=0;i<player.questions[player.round].length;i++){
                const question = player.questions[player.round][i];
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