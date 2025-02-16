const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Calls the user cool.'))
		
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		const target = interaction.options.getUser('user');

		await interaction.reply(`This command was run by ${interaction.user.username}, Channel ${interaction.channel} ChannelId: ${interaction.channelId}. And ${target} is cool!`);
	},
};