const { Game, Question} = require('../../classes.js');
const { intersection } = require('lodash');
const { findGameByPlayerIds, getOpponents, findUser } = require("../../util.js")
const mongoose = require(`mongoose`);
const { gameSchema } = require("../../gameSchema.js");
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('defaultuser')
		.setDescription('Select the user you want to default to, when not specifying one.')
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
	async execute(interaction) {

        const databaseUser = await findUser(interaction.user.id);

        if(!databaseUser){
            return await interaction.reply("You have never been part of any games, start a game first.");
        }

        const opponentIds = await getOpponents(interaction.user.id);

        const options = opponentIds.map(opponent =>
            new StringSelectMenuOptionBuilder()
            .setLabel(opponent.globalName ?? opponent.username)
            .setValue(opponent.id)
            .setDefault(opponent.id === databaseUser.defaultUser)
        )

        const select = new StringSelectMenuBuilder()
			.setCustomId('defaultuser')
			.setPlaceholder('Make a selection!')
			.addOptions(...options);

        const row = new ActionRowBuilder()
        .addComponents(select);

		const response = await interaction.reply({
			content: 'Choose your default user!',
			components: [row],
            flags: MessageFlags.Ephemeral,
            withResponse: true,
		});


        try {
            const confirmation = await response.resource.message.awaitMessageComponent();
            databaseUser.defaultUser = confirmation.values[0];
            databaseUser.save();
            return await confirmation.update({ content: `Your new default user is: <@${confirmation.values[0]}>`, components: [] });

        } catch(error) {
            console.error(error);
            await interaction.editReply({ content: 'Confirmation not received within timelimit, cancelling', components: [] });
        }
	},
};