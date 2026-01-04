const { EmbedBuilder } = require('discord.js');
const { getGuildConfig } = require('../utils/jsonDb');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const config = getGuildConfig(member.guild.id);
            if (!config) return; // Should return default if not there, but just in case

            // Welcome Message
            if (config.channelId) {
                const channel = member.guild.channels.cache.get(config.channelId);
                if (channel) {
                    let description = config.embed.description || 'Welcome {user} to {server}!';
                    description = description
                        .replace(/{user}/g, member.toString())
                        .replace(/{server}/g, member.guild.name)
                        .replace(/{memberCount}/g, member.guild.memberCount);

                    const embed = new EmbedBuilder()
                        .setDescription(description)
                        .setColor(config.embed.color || '#00FF00');

                    if (config.embed.title) embed.setTitle(config.embed.title);
                    if (config.embed.image) embed.setImage(config.embed.image);

                    if (config.options.useUserAvatarInThumbnail) {
                        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
                    } else if (config.embed.thumbnail) {
                        embed.setThumbnail(config.embed.thumbnail);
                    }

                    if (config.embed.footerText) {
                        embed.setFooter({ text: config.embed.footerText, iconURL: config.embed.footerImage });
                    }
                    if (config.embed.timestamp) {
                        embed.setTimestamp();
                    }

                    let content = config.options.mentionUser ? `${member}` : undefined;

                    await channel.send({ content, embeds: [embed] }).catch(console.error);
                }
            }

            // Log Message
            if (config.logChannelId) {
                const logChannel = member.guild.channels.cache.get(config.logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('User Joined')
                        .setDescription(`${member} (${member.user.tag}) has joined the server.\nUser ID: ${member.id}\nCreated At: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
                        .setColor('#00FF00') // Green for join
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] }).catch(console.error);
                }
            }

        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
    },
};
