const { SlashCommandBuilder } = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('closegame')
		.setDescription('Closes the Game with a user.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User to close game with')
				.setRequired(true))
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const userToPlayWith = interaction.options.getUser('user');
		const user = interaction.user;
        if (userToPlayWith === interaction.user){
            return await interaction.reply("You can't close a game with yourself");
        }

		const gameArray = interaction.client.activePlayerGames.get(user.id);
		let game;
        if (gameArray){
             for (let i=0;i<gameArray.length;i++){
                if (gameArray[i].player1.id === userToPlayWith.id || gameArray[i].player2.id === userToPlayWith.id){
                    game = gameArray[i];
					gameArray.splice(i, 1);
                }
             }
        }

		if (!game){
			return await interaction.reply(`You don't have any games started with that user. <@${interaction.user.id}>`);
		}


		await interaction.reply(`Closed game with <@${userToPlayWith.id}>`);
	},
};