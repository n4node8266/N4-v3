const { REST, Routes, ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        console.log('Bot Description: Built by Node');

        client.user.setPresence({
            activities: [{ name: 'with Node', type: ActivityType.Watching }],
            status: 'online',
        });

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

        try {
            console.log(`Started refreshing ${client.commands.size} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.commands.map(c => c.data.toJSON()) },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    },
};
