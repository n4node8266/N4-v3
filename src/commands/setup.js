const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChannelSelectMenuBuilder,
    ChannelType
} = require('discord.js');
const { getGuildConfig, saveGuildConfig } = require('../utils/jsonDb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup bot configurations')
        .addSubcommand(subcommand =>
            subcommand
                .setName('welcome')
                .setDescription('Configure the welcome message system'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reaction_roles')
                .setDescription('Configure reaction roles'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('button_roles')
                .setDescription('Configure button roles')),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'welcome') {
            await this.showDashboard(interaction);
        } else if (interaction.options.getSubcommand() === 'reaction_roles') {
            await this.showReactionRoleDashboard(interaction);
        } else if (interaction.options.getSubcommand() === 'button_roles') {
            await this.showButtonRoleDashboard(interaction);
        }
    },

    async showDashboard(interaction, update = false) {
        const guildId = interaction.guildId;
        let config = getGuildConfig(guildId);

        const embed = new EmbedBuilder()
            .setTitle('Welcome System Setup')
            .setDescription('Configure how new members are welcomed.')
            .addFields(
                { name: 'Channel', value: config.channelId ? `<#${config.channelId}>` : 'Not Set', inline: true },
                { name: 'Log Channel', value: config.logChannelId ? `<#${config.logChannelId}>` : 'Not Set', inline: true },
                { name: 'Status', value: config.channelId ? '🟢 Active' : '🔴 Inactive (Set Channel)', inline: true },
                { name: 'Embed Settings', value: `**Title:** ${config.embed.title || 'None'}\n**Color:** ${config.embed.color}` },
                { name: 'Options', value: `Mention User: ${config.options.mentionUser ? '✅' : '❌'}\nUser Avatar in Thumb: ${config.options.useUserAvatarInThumbnail ? '✅' : '❌'}` }
            )
            .setColor(config.embed.color || '#00FF00');

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('setup_btn_channels').setLabel('Channels').setStyle(ButtonStyle.Primary).setEmoji('📢'),
            new ButtonBuilder().setCustomId('setup_btn_embed').setLabel('Embed Content').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
            new ButtonBuilder().setCustomId('setup_btn_images').setLabel('Images').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'),
            new ButtonBuilder().setCustomId('setup_btn_options').setLabel('Options').setStyle(ButtonStyle.Secondary).setEmoji('⚙️'),
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('setup_btn_preview').setLabel('Test / Preview').setStyle(ButtonStyle.Success).setEmoji('▶️')
        );

        const payload = { embeds: [embed], components: [row1, row2], ephemeral: true };

        if (update) {
            await interaction.update(payload);
        } else {
            await interaction.reply(payload);
        }
    },

    async showReactionRoleDashboard(interaction, update = false) {
        const guildId = interaction.guildId;
        const config = getGuildConfig(guildId);

        const embed = new EmbedBuilder()
            .setTitle('Reaction Roles Setup')
            .setDescription('Configure messages where users can react to get roles.')
            .setColor('#3498db')
            .addFields({
                name: 'Active Reaction Roles',
                value: config.reactionRoles.length > 0
                    ? config.reactionRoles.map((rr, i) => `${i + 1}. [Message Link](https://discord.com/channels/${guildId}/${rr.channelId}/${rr.messageId}) - ${rr.emoji} -> <@&${rr.roleId}>`).join('\n')
                    : 'None active.'
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('rr_btn_create').setLabel('Create New Panel').setStyle(ButtonStyle.Primary).setEmoji('✨'),
            new ButtonBuilder().setCustomId('rr_btn_delete').setLabel('Delete Last').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
            new ButtonBuilder().setCustomId('rr_btn_refresh').setLabel('Refresh').setStyle(ButtonStyle.Secondary).setEmoji('🔄')
        );

        const payload = { embeds: [embed], components: [row], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(payload);
        } else if (update) {
            await interaction.update(payload);
        } else {
            await interaction.reply(payload);
        }
    },

    async showButtonRoleDashboard(interaction, update = false) {
        const guildId = interaction.guildId;
        const config = getGuildConfig(guildId);

        const embed = new EmbedBuilder()
            .setTitle('Button Roles Setup')
            .setDescription('Configure messages where users can click buttons to get roles.')
            .setColor('#e74c3c')
            .addFields({
                name: 'Active Button Roles',
                value: config.buttonRoles.length > 0
                    ? config.buttonRoles.map((br, i) => `${i + 1}. [Link](https://discord.com/channels/${guildId}/${br.channelId}/${br.messageId}) - ${br.label} -> <@&${br.roleId}>`).join('\n')
                    : 'None active.'
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_role_create').setLabel('Create Button Panel').setStyle(ButtonStyle.Success).setEmoji('🔘'),
            new ButtonBuilder().setCustomId('btn_role_delete').setLabel('Delete Last').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
            new ButtonBuilder().setCustomId('btn_role_refresh').setLabel('Refresh').setStyle(ButtonStyle.Secondary).setEmoji('🔄')
        );

        const payload = { embeds: [embed], components: [row], ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(payload);
        } else if (update) {
            try { await interaction.update(payload); } catch (e) { await interaction.reply(payload); }
        } else {
            await interaction.reply(payload);
        }
    },

    async handleInteraction(interaction) {
        const guildId = interaction.guildId;
        let config = getGuildConfig(guildId);
        let shouldSave = false;

        // --- BUTTONS ---
        if (interaction.customId === 'setup_btn_channels') {
            const row1 = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('setup_select_welcome_channel')
                    .setPlaceholder('Select Welcome Channel')
                    .setChannelTypes(ChannelType.GuildText)
            );
            const row2 = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('setup_select_log_channel')
                    .setPlaceholder('Select Log Channel')
                    .setChannelTypes(ChannelType.GuildText)
            );
            const row3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('setup_btn_back').setLabel('Back').setStyle(ButtonStyle.Secondary)
            );
            await interaction.update({ content: 'Select Channels:', embeds: [], components: [row1, row2, row3] });
        }
        else if (interaction.customId === 'setup_btn_embed') {
            const modal = new ModalBuilder().setCustomId('setup_modal_embed').setTitle('Edit Embed Content');

            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Title').setStyle(TextInputStyle.Short).setRequired(false).setValue(config.embed.title || '')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description').setStyle(TextInputStyle.Paragraph).setRequired(true).setValue(config.embed.description || 'Welcome {user} to {server}!')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('footerText').setLabel('Footer Text').setStyle(TextInputStyle.Short).setRequired(false).setValue(config.embed.footerText || '')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('color').setLabel('Color (Hex)').setStyle(TextInputStyle.Short).setRequired(false).setValue(config.embed.color || '#00FF00'))
            );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'setup_btn_images') {
            const modal = new ModalBuilder().setCustomId('setup_modal_images').setTitle('Edit Embed Images');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('image').setLabel('Main Image URL').setStyle(TextInputStyle.Short).setRequired(false).setValue(config.embed.image || '')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('thumbnail').setLabel('Thumbnail URL').setStyle(TextInputStyle.Short).setRequired(false).setValue(config.embed.thumbnail || '')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('footerImage').setLabel('Footer Icon URL').setStyle(TextInputStyle.Short).setRequired(false).setValue(config.embed.footerImage || ''))
            );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'setup_btn_options') {
            // Options Menu
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('setup_toggle_mention').setLabel(`Mention User: ${config.options.mentionUser ? 'ON' : 'OFF'}`).setStyle(config.options.mentionUser ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('setup_toggle_authumb').setLabel(`User Avatar Thumb: ${config.options.useUserAvatarInThumbnail ? 'ON' : 'OFF'}`).setStyle(config.options.useUserAvatarInThumbnail ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('setup_btn_back').setLabel('Back').setStyle(ButtonStyle.Secondary)
            );
            await interaction.update({ content: 'Toggle Options:', embeds: [], components: [row] });
        }
        else if (interaction.customId === 'setup_toggle_mention') {
            config.options.mentionUser = !config.options.mentionUser;
            shouldSave = true;
            // Re-render
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('setup_toggle_mention').setLabel(`Mention User: ${config.options.mentionUser ? 'ON' : 'OFF'}`).setStyle(config.options.mentionUser ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('setup_toggle_authumb').setLabel(`User Avatar Thumb: ${config.options.useUserAvatarInThumbnail ? 'ON' : 'OFF'}`).setStyle(config.options.useUserAvatarInThumbnail ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('setup_btn_back').setLabel('Back').setStyle(ButtonStyle.Secondary)
            );
            await interaction.update({ components: [row] });
        }
        else if (interaction.customId === 'setup_toggle_authumb') {
            config.options.useUserAvatarInThumbnail = !config.options.useUserAvatarInThumbnail;
            shouldSave = true;
            // Re-render
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('setup_toggle_mention').setLabel(`Mention User: ${config.options.mentionUser ? 'ON' : 'OFF'}`).setStyle(config.options.mentionUser ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('setup_toggle_authumb').setLabel(`User Avatar Thumb: ${config.options.useUserAvatarInThumbnail ? 'ON' : 'OFF'}`).setStyle(config.options.useUserAvatarInThumbnail ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('setup_btn_back').setLabel('Back').setStyle(ButtonStyle.Secondary)
            );
            await interaction.update({ components: [row] });
        }
        else if (interaction.customId === 'setup_btn_back') {
            await this.showDashboard(interaction, true);
        }
        else if (interaction.customId === 'setup_btn_preview') {
            // Generate a fake welcome message
            await interaction.deferReply({ ephemeral: true });
            const member = interaction.member;

            let description = config.embed.description
                .replace(/{user}/g, member.toString())
                .replace(/{server}/g, interaction.guild.name)
                .replace(/{memberCount}/g, interaction.guild.memberCount);

            const embed = new EmbedBuilder()
                .setDescription(description)
                .setColor(config.embed.color);

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

            let content = config.options.mentionUser ? `${member}` : undefined;

            await interaction.editReply({ content: content, embeds: [embed] });
        }

        // --- SELECTS ---
        else if (interaction.customId === 'setup_select_welcome_channel') {
            config.channelId = interaction.values[0];
            shouldSave = true;
            await interaction.deferUpdate();
        }
        else if (interaction.customId === 'setup_select_log_channel') {
            config.logChannelId = interaction.values[0];
            shouldSave = true;
            await interaction.deferUpdate();
        }

        // --- MODALS ---
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'setup_modal_embed') {
                config.embed.title = interaction.fields.getTextInputValue('title');
                config.embed.description = interaction.fields.getTextInputValue('description');
                config.embed.footerText = interaction.fields.getTextInputValue('footerText');
                config.embed.color = interaction.fields.getTextInputValue('color');
                shouldSave = true;
                // Just update the dashboard directly, which calls update()
                await this.showDashboard(interaction, true);
            }
            else if (interaction.customId === 'setup_modal_images') {
                config.embed.image = interaction.fields.getTextInputValue('image');
                config.embed.thumbnail = interaction.fields.getTextInputValue('thumbnail');
                config.embed.footerImage = interaction.fields.getTextInputValue('footerImage');
                shouldSave = true;
                await this.showDashboard(interaction, true);
            }
            // --- REACTION ROLES MODALS ---
            else if (interaction.customId === 'rr_modal_create') {
                await interaction.deferUpdate(); // Defer to prevent timeout
                try {
                    const messageId = interaction.fields.getTextInputValue('message_id');
                    const emojiRaw = interaction.fields.getTextInputValue('emoji');
                    const roleId = interaction.fields.getTextInputValue('role_id');
                    const channelId = interaction.fields.getTextInputValue('channel_id');

                    // Validation
                    const channel = await interaction.guild.channels.fetch(channelId);
                    if (!channel) throw new Error('Invalid Channel ID');

                    const message = await channel.messages.fetch(messageId);
                    if (!message) throw new Error('Invalid Message ID');

                    // Parse Emoji
                    let emoji = emojiRaw.trim();
                    const customEmojiMatch = emoji.match(/<:.+:(\d+)>/);
                    if (customEmojiMatch) {
                        emoji = customEmojiMatch[1];
                    }

                    // Add reaction
                    await message.react(emoji);

                    // Save
                    if (!config.reactionRoles) config.reactionRoles = [];
                    config.reactionRoles.push({
                        messageId,
                        channelId,
                        emoji, // Store the ID or unicode
                        roleId
                    });

                    shouldSave = true;
                    saveGuildConfig(guildId, config);

                    await this.showReactionRoleDashboard(interaction, true);

                } catch (error) {
                    console.error('RR Error:', error);
                    await interaction.followUp({ content: `Error: ${error.message}. Ensure bot has permissions and IDs are correct.`, ephemeral: true });
                }
            }
            else if (interaction.customId.startsWith('rr_mod_new_')) {
                await interaction.deferUpdate();
                try {
                    const channelId = interaction.customId.replace('rr_mod_new_', '');
                    const title = interaction.fields.getTextInputValue('title');
                    const description = interaction.fields.getTextInputValue('description');
                    const image = interaction.fields.getTextInputValue('image');
                    const emojiRaw = interaction.fields.getTextInputValue('emoji');
                    const roleId = interaction.fields.getTextInputValue('role_id');

                    // Validation
                    const channel = await interaction.guild.channels.fetch(channelId);
                    if (!channel) throw new Error('Invalid Channel ID');

                    // Create and Send Embed
                    const embed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(description)
                        .setColor('#3498db');

                    if (image) embed.setImage(image);

                    const message = await channel.send({ embeds: [embed] });

                    // Parse Emoji
                    let emoji = emojiRaw.trim();
                    const customEmojiMatch = emoji.match(/<:.+:(\d+)>/);
                    if (customEmojiMatch) {
                        emoji = customEmojiMatch[1];
                    }

                    // Add reaction
                    await message.react(emoji);

                    // Save
                    if (!config.reactionRoles) config.reactionRoles = [];
                    config.reactionRoles.push({
                        messageId: message.id,
                        channelId,
                        emoji,
                        roleId
                    });

                    shouldSave = true;
                    saveGuildConfig(guildId, config);
                    shouldSave = false;

                    await this.showReactionRoleDashboard(interaction, true);

                } catch (error) {
                    console.error('RR Embed Error:', error);
                    await interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true });
                }
            }
        }

        // --- REACTION ROLE BUTTONS ---
        if (interaction.customId === 'rr_btn_create') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('rr_creates_embed').setLabel('Create New Embed').setStyle(ButtonStyle.Success).setEmoji('📝'),
                new ButtonBuilder().setCustomId('rr_use_existing').setLabel('Use Existing Message').setStyle(ButtonStyle.Secondary).setEmoji('🔗')
            );
            await interaction.reply({ content: 'How do you want to set up the reaction role?', components: [row], ephemeral: true });
        }
        else if (interaction.customId === 'rr_use_existing') {
            const modal = new ModalBuilder().setCustomId('rr_modal_create').setTitle('Add Reaction Role (Existing Msg)');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('channel_id').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('message_id').setLabel('Message ID').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('🔥')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_id').setLabel('Role ID').setStyle(TextInputStyle.Short).setRequired(true))
            );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'rr_creates_embed') {
            const row = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('rr_select_channel_new')
                    .setPlaceholder('Select Channel for New Panel')
                    .setChannelTypes(ChannelType.GuildText)
            );
            await interaction.update({ content: 'Select target channel first:', components: [row] });
        }
        else if (interaction.customId === 'rr_select_channel_new') {
            const channelId = interaction.values[0];
            const modal = new ModalBuilder().setCustomId(`rr_mod_new_${channelId}`).setTitle('Create Reaction Role Embed');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Embed Title').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Embed Description').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('image').setLabel('Image URL').setStyle(TextInputStyle.Short).setRequired(false)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setRequired(true).setPlaceholder('🔥')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_id').setLabel('Role ID').setStyle(TextInputStyle.Short).setRequired(true))
            );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'rr_btn_delete') {
            if (config.reactionRoles && config.reactionRoles.length > 0) {
                config.reactionRoles.pop();
                shouldSave = true;
                await this.showReactionRoleDashboard(interaction, true);
            } else {
                await interaction.reply({ content: 'No reaction roles to delete.', ephemeral: true });
            }
        }
        else if (interaction.customId === 'rr_btn_refresh') {
            await this.showReactionRoleDashboard(interaction, true);
        }

        // --- BUTTON ROLE HANDLERS ---
        // --- BUTTON ROLE HANDLERS ---
        else if (interaction.customId === 'btn_role_create') {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_creates_new').setLabel('Create New Panel').setStyle(ButtonStyle.Success).setEmoji('📝'),
                new ButtonBuilder().setCustomId('btn_use_existing').setLabel('Add to Existing').setStyle(ButtonStyle.Secondary).setEmoji('➕')
            );
            await interaction.reply({ content: 'How do you want to set up the button role?', components: [row], ephemeral: true });
        }
        else if (interaction.customId === 'btn_creates_new') {
            const modal = new ModalBuilder().setCustomId('btn_role_modal_create').setTitle('Create Button Role Panel');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('channel_id').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Embed Title').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Embed Description').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('image').setLabel('Image URL').setStyle(TextInputStyle.Short).setRequired(false)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('label').setLabel('Button Label').setStyle(TextInputStyle.Short).setRequired(true))
            );
            // We need 6 inputs for Role ID? Max is 5 per modal.
            // Problem: I can't fit Role ID in the same modal if I add Image.
            // Solution: Remove 'Channel ID' and assume current channel? No, user wants valid channel.
            // Solution: Remove 'Description' or make it shorter? No.
            // Solution: Chain Modals? Not possible.
            // Solution: Ask for Role ID in a separate step?
            // Solution: Combine Title/Desc? No.
            // Solution: Use "Add to Existing" logic for adding more buttons.
            // Wait, for "Create New", we need at least 1 button.
            // Let's remove 'description' for now? Or 'image'?
            // User requested Image.
            // Let's combine Channel ID into a Select Menu beforehand?
            // "Create New" -> Select Channel -> Show Modal.
            // Yes.

            // Actually, let's keep it simple: 
            // 1. Channel ID
            // 2. Title
            // 3. Image
            // 4. Label (Button)
            // 5. Role ID
            // Description can be "Title" for now or we skip description in this wizard?
            // Or we skip Title?
            // Let's skip 'Description' in the modal and default it to empty or same as title.
            // Or better: Remove 'Channel ID' and force them to use the command IN the channel they want?
            // No, that's annoying.
            // Let's remove 'Channel ID' from Modal and use a Channel Select Menu first!

            // Let's implement Channel Select for "Create New".
            const row = new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                    .setCustomId('btn_select_channel_new')
                    .setPlaceholder('Select Channel for New Panel')
                    .setChannelTypes(ChannelType.GuildText)
            );
            await interaction.update({ content: 'Select target channel first:', components: [row] });
        }
        else if (interaction.customId === 'btn_use_existing') {
            const modal = new ModalBuilder().setCustomId('btn_role_modal_add').setTitle('Add Button to Panel');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('channel_id').setLabel('Channel ID').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('message_id').setLabel('Message ID').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('label').setLabel('Button Label').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setRequired(false).setPlaceholder('🔥')),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_id').setLabel('Role ID').setStyle(TextInputStyle.Short).setRequired(true))
            );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'btn_select_channel_new') {
            const channelId = interaction.values[0];
            // Pass channelId via customId of the modal? No, max length.
            // Store in a temp cache? Too complex.
            // Ask for it in Modal again? Pointless.
            // Actually, I can put the channelId in the Modal's CustomID! "btn_new_modal_CID"
            const modal = new ModalBuilder().setCustomId(`btn_mod_new_${channelId}`).setTitle('Create Panel Details');
            modal.addComponents(
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('title').setLabel('Title').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('description').setLabel('Description').setStyle(TextInputStyle.Paragraph).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('image').setLabel('Image URL').setStyle(TextInputStyle.Short).setRequired(false)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('label').setLabel('First Button Label').setStyle(TextInputStyle.Short).setRequired(true)),
                new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('role_id').setLabel('First Role ID').setStyle(TextInputStyle.Short).setRequired(true))
            );
            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'btn_role_delete') {
            if (config.buttonRoles && config.buttonRoles.length > 0) {
                config.buttonRoles.pop();
                shouldSave = true;
                await this.showButtonRoleDashboard(interaction, true);
            } else {
                await interaction.reply({ content: 'No button roles to delete.', ephemeral: true });
            }
        }
        else if (interaction.customId === 'btn_role_refresh') {
            await this.showButtonRoleDashboard(interaction, true);
        }
        // --- BUTTON ROLE MODAL SUBMIT (ADD EXISTING) ---
        else if (interaction.isModalSubmit() && interaction.customId === 'btn_role_modal_add') {
            await interaction.deferUpdate();
            try {
                const channelId = interaction.fields.getTextInputValue('channel_id');
                const messageId = interaction.fields.getTextInputValue('message_id');
                const label = interaction.fields.getTextInputValue('label');
                const emojiRaw = interaction.fields.getTextInputValue('emoji');
                const roleId = interaction.fields.getTextInputValue('role_id');

                const channel = await interaction.guild.channels.fetch(channelId);
                if (!channel) throw new Error('Invalid Channel ID');

                const message = await channel.messages.fetch(messageId);
                if (!message) throw new Error('Invalid Message ID');

                // Prepare new button
                const button = new ButtonBuilder()
                    .setCustomId(`role_btn_${roleId}`)
                    .setLabel(label)
                    .setStyle(ButtonStyle.Primary);

                if (emojiRaw) {
                    let emoji = emojiRaw.trim();
                    const customEmojiMatch = emoji.match(/<:.+:(\d+)>/);
                    if (customEmojiMatch) emoji = customEmojiMatch[1];
                    button.setEmoji(emoji);
                }

                // Append to rows
                let rows = message.components.map(c => ActionRowBuilder.from(c));
                let added = false;

                for (let row of rows) {
                    if (row.components.length < 5) {
                        row.addComponents(button);
                        added = true;
                        break;
                    }
                }

                if (!added) {
                    if (rows.length < 5) {
                        const newRow = new ActionRowBuilder().addComponents(button);
                        rows.push(newRow);
                    } else {
                        throw new Error('Message has reached maximum button capacity (5x5).');
                    }
                }

                await message.edit({ components: rows });

                if (!config.buttonRoles) config.buttonRoles = [];
                config.buttonRoles.push({
                    messageId: messageId,
                    channelId,
                    roleId,
                    label,
                    style: 'Primary'
                });

                shouldSave = true;
                saveGuildConfig(guildId, config);
                shouldSave = false;

                await this.showButtonRoleDashboard(interaction, true);

            } catch (error) {
                console.error('Button Role Add Error:', error);
                await interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true });
            }
        }
        // --- BUTTON ROLE MODAL SUBMIT (CREATE NEW - DYNAMIC ID) ---
        else if (interaction.isModalSubmit() && interaction.customId.startsWith('btn_mod_new_')) {
            await interaction.deferUpdate();
            try {
                const channelId = interaction.customId.replace('btn_mod_new_', '');
                const title = interaction.fields.getTextInputValue('title');
                const description = interaction.fields.getTextInputValue('description');
                const image = interaction.fields.getTextInputValue('image');
                const label = interaction.fields.getTextInputValue('label');
                const roleId = interaction.fields.getTextInputValue('role_id');

                const channel = await interaction.guild.channels.fetch(channelId);
                if (!channel) throw new Error('Invalid Channel ID');

                const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor('#e74c3c');
                if (image) embed.setImage(image);

                const button = new ButtonBuilder()
                    .setCustomId(`role_btn_${roleId}`)
                    .setLabel(label)
                    .setStyle(ButtonStyle.Primary);

                const row = new ActionRowBuilder().addComponents(button);

                const message = await channel.send({ embeds: [embed], components: [row] });

                if (!config.buttonRoles) config.buttonRoles = [];
                config.buttonRoles.push({
                    messageId: message.id,
                    channelId,
                    roleId,
                    label,
                    style: 'Primary'
                });

                shouldSave = true;
                saveGuildConfig(guildId, config);
                shouldSave = false;

                await this.showButtonRoleDashboard(interaction, true);

            } catch (error) {
                console.error('Button Role Create New Error:', error);
                await interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true });
            }
        }
        // --- BUTTON ROLE MODAL SUBMIT ---
        else if (interaction.isModalSubmit() && interaction.customId === 'btn_role_modal_create') {
            await interaction.deferUpdate();
            try {
                const channelId = interaction.fields.getTextInputValue('channel_id');
                const title = interaction.fields.getTextInputValue('title');
                const description = interaction.fields.getTextInputValue('description');
                const label = interaction.fields.getTextInputValue('label');
                const roleId = interaction.fields.getTextInputValue('role_id');

                const channel = await interaction.guild.channels.fetch(channelId);
                if (!channel) throw new Error('Invalid Channel ID');

                const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor('#e74c3c');
                const button = new ButtonBuilder()
                    .setCustomId(`role_btn_${roleId}`)
                    .setLabel(label)
                    .setStyle(ButtonStyle.Primary); // Default to Primary

                const row = new ActionRowBuilder().addComponents(button);

                const message = await channel.send({ embeds: [embed], components: [row] });

                if (!config.buttonRoles) config.buttonRoles = [];
                config.buttonRoles.push({
                    messageId: message.id,
                    channelId,
                    roleId,
                    label,
                    style: 'Primary'
                });

                shouldSave = true;
                saveGuildConfig(guildId, config);
                shouldSave = false;

                await this.showButtonRoleDashboard(interaction, true);

            } catch (error) {
                console.error('Button Role Error:', error);
                await interaction.followUp({ content: `Error: ${error.message}`, ephemeral: true });
            }
        }

        if (shouldSave) {
            saveGuildConfig(guildId, config);
        }
    }
};
