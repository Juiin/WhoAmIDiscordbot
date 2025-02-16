const { SlashCommandBuilder } = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('newgame')
		.setDescription('Starts a new Game with a user.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User to play with')
				.setRequired(true))
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const userToPlayWith = interaction.options.getUser('user');
		const user = interaction.user;
        if (userToPlayWith === interaction.user){
            return await interaction.reply("You can't start a game with yourself");
        }

		const gameArray = interaction.client.activePlayerGames.get(user.id);
        if (gameArray){
             for (let i=0;i<gameArray.length;i++){
                if (gameArray[i].player1.id === userToPlayWith.id || gameArray[i].player2.id === userToPlayWith.id){
                    return await interaction.reply("You already have a game started with that user.");
                }
             }
        }

		//Make Game and push to gameslist
        const game = new Game(user, userToPlayWith);
        interaction.client.activeGames.push(game);

		//push game to activePlayerGames to better serach for it by player username
		if (interaction.client.activePlayerGames.get(user.id)){
			interaction.client.activePlayerGames.get(user.id).push(game);
		} else {
			interaction.client.activePlayerGames.set(user.id, [game]);
		}

		if (interaction.client.activePlayerGames.get(userToPlayWith.id)){
			interaction.client.activePlayerGames.get(userToPlayWith.id).push(game);
		} else {
			interaction.client.activePlayerGames.set(userToPlayWith.id, [game]);
		}

		await interaction.reply(`Started game with <@${userToPlayWith.id}> **Have Fun!**`);
	},
};