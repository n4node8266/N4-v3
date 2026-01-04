# N4 v3 - Advanced Discord Bot

A powerful, fully-featured Discord bot built with **Discord.js v14**. This bot features a dynamic Welcome system, Reaction Roles, Button Roles, and useful utility commands, all managed through an interactive **in-Discord Dashboard**.

## 🚀 Features

### 🌟 Advanced Welcome System
- **Fully Customizable Embeds**: Set title, description, colors, and footer.
- **Image Support**: Add main images, thumbnails, and footer icons.
- **Dynamic Variables**: Use `{user}`, `{server}`, and `{memberCount}` in your messages.
- **Toggle Options**: Enable/disable user mentions or using the user's avatar as a thumbnail.
- **Log Channels**: Send logs of new joins to a separate channel.
- **Preview Mode**: Test your welcome message before making it live.

### 🔥 Reaction Roles
- **Interactive Setup**: No manual config files! use `/setup reaction_roles`.
- **Create New Panels**: Create beautiful embeds with **Images** directly from the bot.
- **Support for Existing Messages**: Add reaction roles to any message you've already sent.
- **Smart Emoji Parsing**: Supports both standard emojis (🔥) and custom server emojis.

### 🔘 Button Roles
- **Modern Interface**: Use clickable buttons instead of reactions for roles.
- **Create New Panels**: Wizard to create stylized embeds with images and an initial button.
- **Add to Existing**: Append up to **25 buttons** to a single message/panel!
- **Toggle Logic**: Clicking a button grants the role; clicking again removes it.
- **Ephemeral Feedback**: Users get a private "✅ Added" or "❌ Removed" message.

### 🛠️ Utility Commands
- **/clear [amount]**: Bulk delete messages (1-100) to keep channels clean.
- **/utility user [target]**: Get detailed info about a user (Join date, Roles, ID).
- **/utility server**: View server stats (Member count, Boost level, Owner).
- **/utility ping**: Check the bot's latency.

---

## 📦 Installation & Setup


1. **Install Dependencies**
   ```bash
   npm install
   ```
   *Prerequisite: Node.js v16.9.0 or higher is required.*

2. **Configuration**
   Create a `.env` file in the root directory (copy from default if available) and add:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

3. **Start the Bot**
   ```bash
   npm start
   ```

---

## 🎮 Usage Guide

### 1. Welcome System
Run: `/setup welcome`
- Click **"Channels"** to set your Welcome and Log channels.
- Click **"Embed Content"** to design your message.
- Click **"Images"** to add URLs for banners/thumbnails.
- Click **"Test / Preview"** to see how it looks!

### 2. Reaction Roles
Run: `/setup reaction_roles`
- **Create New Panel**:
    1. Select a Channel.
    2. Fill in Title, Description, Image URL, Emoji, and Role ID.
    3. The bot posts it for you!
- **Use Existing Message**:
    1. Get the Message ID and Channel ID.
    2. Input the Emoji and Role ID.

### 3. Button Roles
Run: `/setup button_roles`
- **Create New Panel**: Just like reaction roles, but creates a button!
- **Add to Existing**: Want 5 roles on one message? Use this to add more buttons to an existing panel.

### 4. Admin Commands
- **/clear 50**: Deletes the last 50 messages in the channel.

---

## 📂 Project Structure
- `src/index.js`: Main entry point.
- `src/commands/`: All slash commands (`setup`, `clear`, `utility`).
- `src/events/`: Event handlers (`interactionCreate`, `messageReactionAdd/Remove`).
- `src/utils/jsonDb.js`: Local JSON database manager for persistence.
- `database.json`: Stores all your configs locally.

## 📝 Requirements
- Node.js 16.9+
- Discord Bot Token with **Message Content Intent** enabled in Developer Portal.

---
*Built with ❤️ by Node.*
