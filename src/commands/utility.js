const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('utility')
        .setDescription('Utility commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ping')
                .setDescription('Replies with Pong!'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Display info about this server.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Display info about a user.')
                .addUserOption(option => option.setName('target').setDescription('The user'))),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'ping') {
            const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: true });
            interaction.editReply(`Pong! 🏓\nLatency is ${sent.createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(interaction.client.ws.ping)}ms`);
        }
        else if (interaction.options.getSubcommand() === 'server') {
            const guild = interaction.guild;
            const embed = new EmbedBuilder()
                .setTitle(guild.name)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    { name: 'Server Owner', value: `<@${guild.ownerId}>`, inline: true },
                    { name: 'Members', value: `${guild.memberCount}`, inline: true },
                    { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                    { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                    { name: 'Boosts', value: `${guild.premiumSubscriptionCount} (Level ${guild.premiumTier})`, inline: true }
                )
                .setColor('Blue')
                .setFooter({ text: `ID: ${guild.id}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('target') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id);

            const embed = new EmbedBuilder()
                .setTitle(user.tag)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Roles', value: member.roles.cache.filter(r => r.name !== '@everyone').map(r => r).join(' ') || 'None' }
                )
                .setColor(member.displayHexColor)
                .setFooter({ text: `ID: ${user.id}` });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
