const { SlashCommandBuilder } = require('discord.js');
const { Game, Question} = require('../../classes.js');
const { gameSchema } = require("../../gameSchema.js");
const { intersection } = require('lodash');
const mongoose = require(`mongoose`);
const { findGameByPlayerIds } = require("../../util.js")

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

		game = await findGameByPlayerIds(user.id, userToPlayWith.id);
		
		if (game){
			return await interaction.reply("You already have a game started with that user.");
		} 
		else {
			const schema = new gameSchema(new Game(user, userToPlayWith));
			await schema.save();
			await interaction.reply(`Started game with <@${userToPlayWith.id}> **Have Fun!**`);
		}
	},
};