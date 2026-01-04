const { getGuildConfig } = require('../utils/jsonDb');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        if (user.bot) return;

        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                return;
            }
        }

        const guildId = reaction.message.guildId;
        const config = getGuildConfig(guildId);

        if (!config.reactionRoles) return;

        const rr = config.reactionRoles.find(r =>
            r.messageId === reaction.message.id &&
            (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id) // Check both unicode and custom ID
        );

        if (rr) {
            try {
                const member = await reaction.message.guild.members.fetch(user.id);
                await member.roles.add(rr.roleId);
            } catch (err) {
                console.error('Failed to add role', err);
            }
        }
    },
};
