module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isButton() || interaction.isModalSubmit() || interaction.isAnySelectMenu()) {
            // Setup Command Interaction Routing
            if (interaction.customId.startsWith('setup_') || interaction.customId.startsWith('rr_') || interaction.customId.startsWith('btn_')) {
                const command = interaction.client.commands.get('setup');
                if (command && command.handleInteraction) {
                    try {
                        await command.handleInteraction(interaction);
                    } catch (error) {
                        console.error('Error handling setup interaction:', error);
                        if (!interaction.replied && !interaction.deferred) {
                            await interaction.reply({ content: 'An error occurred processing this interaction.', ephemeral: true });
                        }
                    }
                }
            }
            // Handle Role Button Clicks
            else if (interaction.customId.startsWith('role_btn_')) {
                const roleId = interaction.customId.replace('role_btn_', '');
                const member = interaction.member;

                await interaction.deferReply({ ephemeral: true });

                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(roleId);
                    await interaction.editReply({ content: `❌ Removed <@&${roleId}>` });
                } else {
                    await member.roles.add(roleId);
                    await interaction.editReply({ content: `✅ Added <@&${roleId}>` });
                }
            }
        }
    },
};
