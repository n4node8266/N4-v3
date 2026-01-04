const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database.json');

// Ensure DB file exists
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}, null, 4));
}

const readDb = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading database:', err);
        return {};
    }
};

const writeDb = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 4));
        return true;
    } catch (err) {
        console.error('Error writing database:', err);
        return false;
    }
};

const getGuildConfig = (guildId) => {
    const db = readDb();
    if (!db[guildId]) {
        // Return default structure if not found
        return {
            guildId: guildId,
            channelId: null,
            logChannelId: null,
            embed: {
                title: null,
                description: "Welcome {user} to {server}!",
                image: null,
                thumbnail: null,
                footerText: null,
                footerImage: null,
                color: '#00FF00',
                timestamp: true
            },
            options: {
                mentionUser: true,
                useUserAvatarInThumbnail: false
            },
            reactionRoles: [], // Array of { messageId, emoji, roleId, channelId }
            buttonRoles: [] // Array of { messageId, channelId, roleId, label, emoji, style }
        };
    }
    const config = db[guildId];
    if (!config.reactionRoles) config.reactionRoles = [];
    if (!config.buttonRoles) config.buttonRoles = [];
    return config;
};

const saveGuildConfig = (guildId, config) => {
    const db = readDb();
    db[guildId] = config;
    writeDb(db);
};

module.exports = {
    getGuildConfig,
    saveGuildConfig
};
