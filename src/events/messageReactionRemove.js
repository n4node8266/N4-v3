const { getGuildConfig } = require('../utils/jsonDb');

module.exports = {
    name: 'messageReactionRemove',
    async execute(reaction, user) {
        if (user.bot) return;

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
            (r.emoji === reaction.emoji.name || r.emoji === reaction.emoji.id)
        );

        if (rr) {
            try {
                const member = await reaction.message.guild.members.fetch(user.id);
                await member.roles.remove(rr.roleId);
            } catch (err) {
                console.error('Failed to remove role', err);
            }
        }
    },
};
