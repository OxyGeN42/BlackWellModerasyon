const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');

// Configuration - Railway Variables'dan oku (config.json KULLANMA!)
const config = {
    token: process.env.token,
    ownerId: process.env.ownerId || "685921707667619908",
    logChannelId: process.env.logChannelId,
    bossRoles: process.env.bossRoles ? process.env.bossRoles.split(',') : ["1435010471391657984"],
    ogRoles: process.env.ogRoles ? process.env.ogRoles.split(',') : ["1435017895947145298"]
};

console.log('🔍 Config:', {
    tokenVarMi: !!config.token,
    ownerId: config.ownerId,
    logChannelId: config.logChannelId,
    bossRoles: config.bossRoles,
    ogRoles: config.ogRoles
});

if (!config.token) {
    console.error('❌ HATA: Token bulunamadı! Railway Variables kısmına token eklediğinden emin ol.');
    process.exit(1);
}

// GIF linkleri
const GIFS = {
    welcome: 'https://media.giphy.com/media/26gR2qGRnxxXAvHvW/giphy.gif',
    ban: 'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
    kick: 'https://media.giphy.com/media/l0MYEqE4MWVdlV5Z2/giphy.gif',
    mute: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
    warn: 'https://media.giphy.com/media/3o7TKoBHRKjPoeXyM/giphy.gif',
    success: 'https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif',
    error: 'https://media.giphy.com/media/3o7TKzR5QkqFJZzZ2/giphy.gif'
};

// Veritabanı
let warnings = {};
let otorol = {};
let modLog = [];
let duyuruLog = [];

if (fs.existsSync('./warnings.json')) {
    warnings = JSON.parse(fs.readFileSync('./warnings.json'));
}
if (fs.existsSync('./otorol.json')) {
    otorol = JSON.parse(fs.readFileSync('./otorol.json'));
}
if (fs.existsSync('./modlog.json')) {
    modLog = JSON.parse(fs.readFileSync('./modlog.json'));
}
if (fs.existsSync('./duyurulog.json')) {
    duyuruLog = JSON.parse(fs.readFileSync('./duyurulog.json'));
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} olarak giriş yapıldı!`);
    console.log(`📊 Sunucu sayısı: ${client.guilds.cache.size}`);
    console.log(`👑 BOSS Rolü: <@&1435010471391657984>`);
    console.log(`👥 OG Rolü: <@&1435017895947145298>`);
    
    const activities = [
        '🛡️ Blackwell Moderasyon',
        '👑 BOSS & OG Yetkili',
        '📋 !panel yaz',
        '🔨 Ban & Kick & Mute'
    ];
    let i = 0;
    setInterval(() => {
        client.user.setActivity(activities[i % activities.length], { type: 3 });
        i++;
    }, 10000);
});

// ===================== YETKİ KONTROL =====================
function isBoss(member) {
    return member.permissions.has(PermissionsBitField.Flags.Administrator) || 
           member.roles.cache.has("1435010471391657984");
}

function isOG(member) {
    return member.roles.cache.has("1435017895947145298");
}

function isStaff(member) {
    return isBoss(member) || isOG(member);
}

// ===================== LOG FONKSİYONU =====================
async function sendLog(guild, embed) {
    if (!config.logChannelId) return;
    try {
        const logChannel = await client.channels.fetch(config.logChannelId);
        if (logChannel) await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Log hatası:', error.message);
    }
}

// ===================== PANEL KOMUTU =====================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!panel') {
        if (!isStaff(message.member)) {
            return message.reply({ 
                content: '❌ Bu komutu kullanmak için yetkiniz yok!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const staffLevel = isBoss(message.member) ? '👑 **BOSS**' : '👥 **OG**';
        const staffColor = isBoss(message.member) ? 0xFFD700 : 0x00FF00;

        const panelEmbed = new EmbedBuilder()
            .setColor(staffColor)
            .setTitle('🛡️ **BlackWell Moderasyon Paneli**')
            .setDescription(`
> ✨ Hoş geldin, ${message.member}!
> **Yetki Seviyen:** ${staffLevel}

\`\`\`ascii
╔════════════════════════════════════╗
║        📋 PANEL BİLGİLERİ          ║
╠════════════════════════════════════╣
║ 🔨 Ban İşlemleri    - BOSS/OG      ║
║ 👢 Kick İşlemleri   - BOSS/OG      ║
║ 🔇 Mute İşlemleri   - BOSS/OG      ║
║ ⚠️ Uyarı İşlemleri  - BOSS/OG      ║
║ 📋 Ban Listesi      - BOSS/OG      ║
║ 🧹 Mesaj Temizle    - BOSS/OG      ║
║ 📜 Moderasyon Logları- BOSS/OG     ║
║ 📢 Duyuru Gönderme  - BOSS/OG      ║
║ ⚙️ Otorol Ayarları  - BOSS/OG      ║
╚════════════════════════════════════╝
\`\`\`

**⬇️ İşlem yapmak için bir buton seçin ⬇️**
            `)
            .setThumbnail(message.guild.iconURL() || 'https://i.imgur.com/6XU3c6j.png')
            .setImage(GIFS.welcome)
            .setFooter({ 
                text: `BlackWell Moderasyon • ${message.member.user.tag}`, 
                iconURL: message.author.displayAvatarURL() 
            })
            .setTimestamp();

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ban_menu')
                    .setLabel('🔨 Ban')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔨'),
                new ButtonBuilder()
                    .setCustomId('kick_menu')
                    .setLabel('👢 Kick')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👢'),
                new ButtonBuilder()
                    .setCustomId('mute_menu')
                    .setLabel('🔇 Mute')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔇'),
                new ButtonBuilder()
                    .setCustomId('warn_menu')
                    .setLabel('⚠️ Uyarı')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚠️')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ban_list')
                    .setLabel('📋 Ban Listesi')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('clear_menu')
                    .setLabel('🧹 Mesaj Temizle')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🧹'),
                new ButtonBuilder()
                    .setCustomId('mod_logs')
                    .setLabel('📜 Moderasyon Logları')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📜'),
                new ButtonBuilder()
                    .setCustomId('duyuru_menu')
                    .setLabel('📢 Duyuru')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📢')
            );

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('otorol_menu')
                    .setLabel('⚙️ Otorol')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️'),
                new ButtonBuilder()
                    .setCustomId('istatistik')
                    .setLabel('📊 İstatistik')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📊')
            );

        await message.channel.send({ 
            embeds: [panelEmbed], 
            components: [row1, row2, row3] 
        });
        await message.delete().catch(() => {});
    }
});

// ===================== BUTON İŞLEMLERİ =====================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
    
    if (!isStaff(interaction.member)) {
        return interaction.reply({ 
            content: '❌ Bu işlem için yetkiniz yok!', 
            flags: MessageFlags.Ephemeral 
        });
    }

    // ===== BAN LİSTESİ =====
    if (interaction.customId === 'ban_list') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        try {
            const bans = await interaction.guild.bans.fetch();
            
            if (bans.size === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('📋 Ban Listesi')
                    .setDescription('```\n✨ Sunucuda banlanmış kullanıcı bulunmuyor!\n```')
                    .setImage(GIFS.success)
                    .setTimestamp();
                return interaction.editReply({ embeds: [embed] });
            }

            let banList = '';
            let index = 1;
            
            bans.forEach(ban => {
                banList += `**${index}.** \`${ban.user.tag}\` (${ban.user.id})\n`;
                banList += `   ╰➤ **Sebep:** ${ban.reason || 'Belirtilmemiş'}\n\n`;
                index++;
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`📋 Ban Listesi (${bans.size} Kişi)`)
                .setDescription(banList.substring(0, 4000))
                .setThumbnail(interaction.guild.iconURL())
                .setImage(GIFS.ban)
                .setFooter({ 
                    text: `Görüntüleyen: ${interaction.user.tag} • Toplam: ${bans.size} ban`, 
                    iconURL: interaction.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            const logEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📋 Ban Listesi Görüntülendi')
                .setDescription(`**${interaction.user.tag}** ban listesini görüntüledi`)
                .addFields(
                    { name: '👤 Yetkili', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                    { name: '📊 Ban Sayısı', value: bans.size.toString(), inline: true }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();
            
            await sendLog(interaction.guild, logEmbed);

        } catch (error) {
            console.error('Ban listesi hatası:', error);
            await interaction.editReply({ content: '❌ Ban listesi alınırken hata oluştu!' });
        }
    }

    // ===== BAN MENÜSÜ =====
    if (interaction.customId === 'ban_menu') {
        await interaction.guild.members.fetch();
        
        const members = interaction.guild.members.cache
            .filter(m => !m.user.bot)
            .map(m => ({
                label: m.user.tag.length > 100 ? m.user.tag.substring(0, 97) + '...' : m.user.tag,
                value: m.id,
                description: `ID: ${m.id}`
            }));

        if (members.length === 0) {
            return interaction.reply({
                content: '❌ Banlanacak kullanıcı bulunamadı!',
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ban_select')
                    .setPlaceholder('👤 Banlanacak kullanıcı seç')
                    .addOptions(members.slice(0, 25))
            );

        await interaction.reply({
            content: '🔨 **Banlanacak kullanıcıyı seçin:**',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    // ===== BAN SEÇİMİ =====
    if (interaction.isStringSelectMenu() && interaction.customId === 'ban_select') {
        const userId = interaction.values[0];
        const user = await client.users.fetch(userId);
        
        await interaction.reply({
            content: `🔨 **${user.tag}** banlanacak.\nBan sebebini yazın (iptal için "iptal" yazın):`,
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (m) => {
            if (m.content.toLowerCase() === 'iptal') {
                await m.delete().catch(() => {});
                return interaction.followUp({ content: '❌ İşlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }

            const reason = m.content;
            await m.delete().catch(() => {});

            try {
                const member = await interaction.guild.members.fetch(userId);
                await member.ban({ reason: `${interaction.user.tag} tarafından: ${reason}` });

                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('🔨 Kullanıcı Banlandı')
                    .setDescription(`**${user.tag}** sunucudan banlandı!`)
                    .addFields(
                        { name: '👤 Banlanan', value: `${user.tag} (${user.id})`, inline: true },
                        { name: '👮 Banlayan', value: interaction.user.tag, inline: true },
                        { name: '📝 Sebep', value: reason, inline: false }
                    )
                    .setThumbnail(user.displayAvatarURL())
                    .setImage(GIFS.ban)
                    .setTimestamp();

                await sendLog(interaction.guild, embed);
                
                modLog.push({
                    type: 'BAN',
                    user: user.tag,
                    userId: user.id,
                    mod: interaction.user.tag,
                    modId: interaction.user.id,
                    reason: reason,
                    date: new Date().toISOString()
                });
                fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));

                await interaction.followUp({ 
                    content: `✅ **${user.tag}** başarıyla banlandı!`, 
                    flags: MessageFlags.Ephemeral 
                });

            } catch (error) {
                console.error(error);
                await interaction.followUp({ content: '❌ Banlama başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ content: '⏰ Süre doldu, işlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }
        });
    }

    // ===== KICK MENÜSÜ =====
    if (interaction.customId === 'kick_menu') {
        await interaction.guild.members.fetch();
        
        const members = interaction.guild.members.cache
            .filter(m => !m.user.bot)
            .map(m => ({
                label: m.user.tag.length > 100 ? m.user.tag.substring(0, 97) + '...' : m.user.tag,
                value: m.id,
                description: `ID: ${m.id}`
            }));

        if (members.length === 0) {
            return interaction.reply({
                content: '❌ Kicklenecek kullanıcı bulunamadı!',
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('kick_select')
                    .setPlaceholder('👤 Kicklenecek kullanıcı seç')
                    .addOptions(members.slice(0, 25))
            );

        await interaction.reply({
            content: '👢 **Kicklenecek kullanıcıyı seçin:**',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    // ===== KICK SEÇİMİ =====
    if (interaction.isStringSelectMenu() && interaction.customId === 'kick_select') {
        const userId = interaction.values[0];
        const user = await client.users.fetch(userId);
        
        await interaction.reply({
            content: `👢 **${user.tag}** kicklenecek.\nKick sebebini yazın (iptal için "iptal" yazın):`,
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (m) => {
            if (m.content.toLowerCase() === 'iptal') {
                await m.delete().catch(() => {});
                return interaction.followUp({ content: '❌ İşlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }

            const reason = m.content;
            await m.delete().catch(() => {});

            try {
                const member = await interaction.guild.members.fetch(userId);
                await member.kick(`${interaction.user.tag} tarafından: ${reason}`);

                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('👢 Kullanıcı Kicklendi')
                    .setDescription(`**${user.tag}** sunucudan kicklendi!`)
                    .addFields(
                        { name: '👤 Kicklenen', value: `${user.tag} (${user.id})`, inline: true },
                        { name: '👮 Kickleyen', value: interaction.user.tag, inline: true },
                        { name: '📝 Sebep', value: reason, inline: false }
                    )
                    .setThumbnail(user.displayAvatarURL())
                    .setImage(GIFS.kick)
                    .setTimestamp();

                await sendLog(interaction.guild, embed);
                
                modLog.push({
                    type: 'KICK',
                    user: user.tag,
                    userId: user.id,
                    mod: interaction.user.tag,
                    modId: interaction.user.id,
                    reason: reason,
                    date: new Date().toISOString()
                });
                fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));

                await interaction.followUp({ 
                    content: `✅ **${user.tag}** başarıyla kicklendi!`, 
                    flags: MessageFlags.Ephemeral 
                });

            } catch (error) {
                console.error(error);
                await interaction.followUp({ content: '❌ Kick işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ content: '⏰ Süre doldu, işlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }
        });
    }

    // ===== MUTE MENÜSÜ =====
    if (interaction.customId === 'mute_menu') {
        await interaction.guild.members.fetch();
        
        const members = interaction.guild.members.cache
            .filter(m => !m.user.bot)
            .map(m => ({
                label: m.user.tag.length > 100 ? m.user.tag.substring(0, 97) + '...' : m.user.tag,
                value: m.id,
                description: `ID: ${m.id}`
            }));

        if (members.length === 0) {
            return interaction.reply({
                content: '❌ Mute\'lenebilecek kullanıcı bulunamadı!',
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('mute_select')
                    .setPlaceholder('👤 Mute\'lenecek kullanıcı seç')
                    .addOptions(members.slice(0, 25))
            );

        await interaction.reply({
            content: '🔇 **Mute\'lenecek kullanıcıyı seçin:**',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    // ===== MUTE SEÇİMİ =====
    if (interaction.isStringSelectMenu() && interaction.customId === 'mute_select') {
        const userId = interaction.values[0];
        const user = await client.users.fetch(userId);
        
        await interaction.reply({
            content: `🔇 **${user.tag}** mute'lenecek.\nSüre ve sebep yazın (örn: "10m küfür" veya "iptal"):`,
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (m) => {
            if (m.content.toLowerCase() === 'iptal') {
                await m.delete().catch(() => {});
                return interaction.followUp({ content: '❌ İşlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }

            const args = m.content.split(' ');
            const timeStr = args[0];
            const reason = args.slice(1).join(' ') || 'Belirtilmedi';
            
            const timeMs = parseTime(timeStr);
            if (!timeMs) {
                await m.delete().catch(() => {});
                return interaction.followUp({ content: '❌ Geçersiz süre formatı! (10m, 1h, 1d)', flags: MessageFlags.Ephemeral });
            }

            await m.delete().catch(() => {});

            try {
                const member = await interaction.guild.members.fetch(userId);
                await member.timeout(timeMs, `${interaction.user.tag} tarafından: ${reason}`);

                const bitisZamani = new Date(Date.now() + timeMs);

                const embed = new EmbedBuilder()
                    .setColor(0xFFFF00)
                    .setTitle('🔇 Kullanıcı Mute\'lendi')
                    .setDescription(`**${user.tag}** susturuldu!`)
                    .addFields(
                        { name: '👤 Mute\'lenen', value: `${user.tag} (${user.id})`, inline: true },
                        { name: '👮 Mute\'leyen', value: interaction.user.tag, inline: true },
                        { name: '⏱️ Süre', value: timeStr, inline: true },
                        { name: '⏰ Bitiş', value: `<t:${Math.floor(bitisZamani / 1000)}:R>`, inline: true },
                        { name: '📝 Sebep', value: reason, inline: false }
                    )
                    .setThumbnail(user.displayAvatarURL())
                    .setImage(GIFS.mute)
                    .setTimestamp();

                await sendLog(interaction.guild, embed);
                
                modLog.push({
                    type: 'MUTE',
                    user: user.tag,
                    userId: user.id,
                    mod: interaction.user.tag,
                    modId: interaction.user.id,
                    duration: timeStr,
                    reason: reason,
                    date: new Date().toISOString()
                });
                fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));

                await interaction.followUp({ 
                    content: `✅ **${user.tag}** ${timeStr} süreyle mute'lendi!`, 
                    flags: MessageFlags.Ephemeral 
                });

            } catch (error) {
                console.error(error);
                await interaction.followUp({ content: '❌ Mute işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ content: '⏰ Süre doldu, işlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }
        });
    }

    // ===== UYARI MENÜSÜ =====
    if (interaction.customId === 'warn_menu') {
        await interaction.guild.members.fetch();
        
        const members = interaction.guild.members.cache
            .filter(m => !m.user.bot)
            .map(m => ({
                label: m.user.tag.length > 100 ? m.user.tag.substring(0, 97) + '...' : m.user.tag,
                value: m.id,
                description: `ID: ${m.id}`
            }));

        if (members.length === 0) {
            return interaction.reply({
                content: '❌ Uyarılabilecek kullanıcı bulunamadı!',
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('warn_select')
                    .setPlaceholder('👤 Uyarılacak kullanıcı seç')
                    .addOptions(members.slice(0, 25))
            );

        await interaction.reply({
            content: '⚠️ **Uyarılacak kullanıcıyı seçin:**',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    // ===== UYARI SEÇİMİ - DM BİLDİRİMLİ =====
    if (interaction.isStringSelectMenu() && interaction.customId === 'warn_select') {
        const userId = interaction.values[0];
        const user = await client.users.fetch(userId);
        
        await interaction.reply({
            content: `⚠️ **${user.tag}** uyarılacak.\nUyarı sebebini yazın (iptal için "iptal" yazın):`,
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (m) => {
            if (m.content.toLowerCase() === 'iptal') {
                await m.delete().catch(() => {});
                return interaction.followUp({ content: '❌ İşlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }

            const reason = m.content;
            await m.delete().catch(() => {});

            if (!warnings[user.id]) warnings[user.id] = [];
            warnings[user.id].push({
                reason: reason,
                mod: interaction.user.tag,
                modId: interaction.user.id,
                date: new Date().toISOString()
            });
            
            fs.writeFileSync('./warnings.json', JSON.stringify(warnings, null, 2));

            // DM BİLDİRİMİ
            let dmStatus = '✅ Gönderildi';
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('⚠️ **Uyarı Aldınız!**')
                    .setDescription(`**${interaction.guild.name}** sunucusunda uyarı aldınız!`)
                    .addFields(
                        { name: '📝 Uyarı Sebebi', value: `\`\`\`${reason}\`\`\``, inline: false },
                        { name: '👮 Uyaran Yetkili', value: interaction.user.tag, inline: true },
                        { name: '📊 Toplam Uyarı', value: `**${warnings[user.id].length}**`, inline: true },
                        { name: '🕐 Uyarı Tarihi', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setThumbnail(interaction.guild.iconURL())
                    .setImage(GIFS.warn)
                    .setFooter({ text: 'BlackWell Moderasyon', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                dmStatus = '❌ Gönderilemedi (DM kapalı)';
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ Kullanıcı Uyarıldı')
                .setDescription(`**${user.tag}** uyarıldı!`)
                .addFields(
                    { name: '👤 Uyarılan', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 Uyaran', value: interaction.user.tag, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false },
                    { name: '📊 Toplam Uyarı', value: warnings[user.id].length.toString(), inline: true },
                    { name: '📨 DM Durumu', value: dmStatus, inline: true }
                )
                .setThumbnail(user.displayAvatarURL())
                .setImage(GIFS.warn)
                .setTimestamp();

            await sendLog(interaction.guild, embed);
            
            modLog.push({
                type: 'UYARI',
                user: user.tag,
                userId: user.id,
                mod: interaction.user.tag,
                modId: interaction.user.id,
                reason: reason,
                date: new Date().toISOString()
            });
            fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));

            await interaction.followUp({ 
                content: `✅ **${user.tag}** uyarıldı! (Toplam: ${warnings[user.id].length} uyarı)`, 
                flags: MessageFlags.Ephemeral 
            });
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ 
                    content: '⏰ Süre doldu, işlem iptal edildi.', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        });
    }

    // ===== MESAJ TEMİZLE =====
    if (interaction.customId === 'clear_menu') {
        await interaction.reply({
            content: '🧹 **Kaç mesaj silinecek?** (1-100 arası bir sayı yazın)',
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id && !isNaN(parseInt(m.content)) && parseInt(m.content) > 0 && parseInt(m.content) <= 100;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (m) => {
            const amount = parseInt(m.content);
            await m.delete().catch(() => {});

            try {
                const messages = await interaction.channel.bulkDelete(amount, true);
                
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('🧹 Mesajlar Silindi')
                    .addFields(
                        { name: 'Silinen Mesaj', value: messages.size.toString(), inline: true },
                        { name: 'Kanal', value: interaction.channel.toString(), inline: true },
                        { name: 'Silen', value: interaction.user.tag, inline: true }
                    )
                    .setImage(GIFS.success)
                    .setTimestamp();

                await sendLog(interaction.guild, embed);
                
                await interaction.followUp({ 
                    content: `✅ ${messages.size} mesaj silindi!`, 
                    flags: MessageFlags.Ephemeral 
                });

            } catch (error) {
                await interaction.followUp({ 
                    content: '❌ 14 günden eski mesajlar silinemez!', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ 
                    content: '⏰ Süre doldu, işlem iptal edildi.', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        });
    }

    // ===== MODERASYON LOGLARI =====
    if (interaction.customId === 'mod_logs') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const guildLogs = modLog.slice(-20).reverse();
        
        if (guildLogs.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📜 Moderasyon Logları')
                .setDescription('```\n✨ Henüz moderasyon işlemi yapılmamış.\n```')
                .setImage(GIFS.success)
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }

        let logText = '';
        guildLogs.forEach((log, i) => {
            const tarih = new Date(log.date).toLocaleString('tr-TR');
            logText += `**${i+1}.** \`${log.type}\` • ${log.user}\n`;
            logText += `   ╰➤ **Yetkili:** ${log.mod}\n`;
            logText += `   ╰➤ **Sebep:** ${log.reason}\n`;
            if (log.duration) logText += `   ╰➤ **Süre:** ${log.duration}\n`;
            logText += `   ╰➤ **Tarih:** ${tarih}\n\n`;
        });

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`📜 Son ${guildLogs.length} Moderasyon İşlemi`)
            .setDescription(logText.substring(0, 4000))
            .setThumbnail(interaction.guild.iconURL())
            .setImage(GIFS.welcome)
            .setFooter({ 
                text: `Görüntüleyen: ${interaction.user.tag} • Toplam: ${modLog.length} işlem`, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }

    // ===== DUYURU MENÜSÜ =====
    if (interaction.customId === 'duyuru_menu') {
        await interaction.reply({
            content: '📢 **Duyuru mesajını yazın:**\nNot: DM\'si kapalı olanlara mesaj gitmez.',
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async (m) => {
            const duyuruMesaj = m.content;
            await m.delete().catch(() => {});

            await interaction.followUp({ 
                content: '📨 Duyuru gönderiliyor, bu biraz zaman alabilir...', 
                flags: MessageFlags.Ephemeral 
            });

            const members = await interaction.guild.members.fetch();
            let successCount = 0;
            let failCount = 0;
            let basariliListe = [];
            let dmKapaliListe = [];

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📢 **BlackWell Sunucu Duyurusu**')
                .setDescription(`\`\`\`\n${duyuruMesaj}\n\`\`\``)
                .addFields(
                    { name: '👤 Gönderen', value: interaction.user.tag, inline: true },
                    { name: '🏠 Sunucu', value: interaction.guild.name, inline: true },
                    { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setImage(GIFS.success)
                .setFooter({ text: 'BlackWell Moderasyon', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            let gecikme = 0;
            for (const [id, member] of members) {
                if (member.user.bot) continue;

                setTimeout(async () => {
                    try {
                        await member.send({ embeds: [embed] });
                        successCount++;
                        basariliListe.push(member.user.tag);
                    } catch (error) {
                        failCount++;
                        if (error.code === 50007) {
                            dmKapaliListe.push(member.user.tag);
                        }
                    }
                }, gecikme * 1000);
                gecikme++;
            }

            setTimeout(async () => {
                const basariliGoster = basariliListe.slice(0, 20).join('\n');
                const dmKapaliGoster = dmKapaliListe.slice(0, 20).join('\n');

                const sonucEmbed = new EmbedBuilder()
                    .setColor(successCount > 0 ? 0x00FF00 : 0xFF0000)
                    .setTitle('📊 **Duyuru Raporu**')
                    .setDescription(`Duyuru tamamlandı! Detaylar aşağıda:`)
                    .addFields(
                        { name: '✅ Başarılı', value: `**${successCount}** kişi`, inline: true },
                        { name: '❌ Başarısız', value: `**${failCount}** kişi`, inline: true },
                        { name: '📨 Duyuru Mesajı', value: `\`\`\`${duyuruMesaj.substring(0, 100)}${duyuruMesaj.length > 100 ? '...' : ''}\`\`\``, inline: false }
                    )
                    .setImage(GIFS.success)
                    .setTimestamp();

                if (basariliListe.length > 0) {
                    sonucEmbed.addFields({ 
                        name: `✅ Başarılı Olanlar (İlk 20)`, 
                        value: `\`\`\`${basariliGoster || 'Yok'}\`\`\``, 
                        inline: false 
                    });
                }

                if (dmKapaliListe.length > 0) {
                    sonucEmbed.addFields({ 
                        name: `🔇 DM'si Kapalı Olanlar (İlk 20)`, 
                        value: `\`\`\`${dmKapaliGoster || 'Yok'}\`\`\``, 
                        inline: false 
                    });
                }

                await sendLog(interaction.guild, sonucEmbed);

                duyuruLog.push({
                    mod: interaction.user.tag,
                    modId: interaction.user.id,
                    mesaj: duyuruMesaj,
                    basarili: successCount,
                    basarisiz: failCount,
                    dmKapali: dmKapaliListe.length,
                    tarih: new Date().toISOString()
                });
                fs.writeFileSync('./duyurulog.json', JSON.stringify(duyuruLog, null, 2));

                await interaction.followUp({ 
                    embeds: [sonucEmbed], 
                    flags: MessageFlags.Ephemeral 
                });
            }, gecikme * 1000 + 1000);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ 
                    content: '⏰ Süre doldu, işlem iptal edildi.', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        });
    }

    // ===== İSTATİSTİK =====
    if (interaction.customId === 'istatistik') {
        await interaction.guild.members.fetch();
        
        const totalMembers = interaction.guild.memberCount;
        const botCount = interaction.guild.members.cache.filter(m => m.user.bot).size;
        const userCount = totalMembers - botCount;
        const onlineCount = interaction.guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const banCount = (await interaction.guild.bans.fetch()).size;
        const roleCount = interaction.guild.roles.cache.size;
        const channelCount = interaction.guild.channels.cache.size;

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`📊 ${interaction.guild.name} İstatistikleri`)
            .setThumbnail(interaction.guild.iconURL())
            .addFields(
                { name: '👥 Toplam Üye', value: `**${totalMembers}**`, inline: true },
                { name: '👤 Kullanıcı', value: `**${userCount}**`, inline: true },
                { name: '🤖 Bot', value: `**${botCount}**`, inline: true },
                { name: '🟢 Çevrimiçi', value: `**${onlineCount}**`, inline: true },
                { name: '🔨 Ban Sayısı', value: `**${banCount}**`, inline: true },
                { name: '🎭 Rol Sayısı', value: `**${roleCount}**`, inline: true },
                { name: '📺 Kanal Sayısı', value: `**${channelCount}**`, inline: true },
                { name: '📜 Moderasyon İşlemi', value: `**${modLog.length}**`, inline: true },
                { name: '📢 Duyuru Sayısı', value: `**${duyuruLog.length}**`, inline: true }
            )
            .setImage(GIFS.welcome)
            .setFooter({ text: `BlackWell Moderasyon`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // ===== OTOROL MENÜSÜ =====
    if (interaction.customId === 'otorol_menu') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('otorol_ayarla')
                    .setLabel('⚙️ Otorol AYARLA')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⚙️'),
                new ButtonBuilder()
                    .setCustomId('otorol_kapat')
                    .setLabel('🔴 Otorol KAPAT')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔴'),
                new ButtonBuilder()
                    .setCustomId('otorol_sorgula')
                    .setLabel('🔍 Otorol SORGULA')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍')
            );

        await interaction.reply({
            content: '⚙️ **Otorol işlemi seçin:**',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    // ===== OTOROL AYARLA =====
    if (interaction.customId === 'otorol_ayarla') {
        await interaction.reply({
            content: '📝 **Otorol olarak ayarlanacak rolü etiketleyin:**',
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id && m.mentions.roles.first();
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (m) => {
            const role = m.mentions.roles.first();
            await m.delete().catch(() => {});

            const botMember = interaction.guild.members.cache.get(client.user.id);
            if (botMember.roles.highest.position <= role.position) {
                return interaction.followUp({ 
                    content: '❌ Bu rolü veremem! Bot rolü, verilecek rolden **yüksek** olmalı!', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            otorol[interaction.guild.id] = role.id;
            fs.writeFileSync('./otorol.json', JSON.stringify(otorol, null, 2));

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('⚙️ Otorol Ayarlandı')
                .setDescription(`✅ Otorol **${role.name}** olarak ayarlandı!`)
                .addFields(
                    { name: '🎭 Rol', value: `${role} (${role.id})`, inline: true },
                    { name: '👤 Ayarlayan', value: interaction.user.tag, inline: true },
                    { name: '🕐 Zaman', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setThumbnail(interaction.guild.iconURL())
                .setImage(GIFS.success)
                .setTimestamp();

            await sendLog(interaction.guild, embed);
            await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ 
                    content: '⏰ Süre doldu, işlem iptal edildi.', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        });
    }

    // ===== OTOROL KAPAT =====
    if (interaction.customId === 'otorol_kapat') {
        if (!otorol[interaction.guild.id]) {
            return interaction.reply({ 
                content: '❌ Bu sunucuda otorol ayarlı değil!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        delete otorol[interaction.guild.id];
        fs.writeFileSync('./otorol.json', JSON.stringify(otorol, null, 2));

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('⚙️ Otorol Kapatıldı')
            .setDescription(`❌ Otorol sistemi kapatıldı!`)
            .addFields(
                { name: '👤 Kapatan', value: interaction.user.tag, inline: true },
                { name: '🕐 Zaman', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setImage(GIFS.error)
            .setTimestamp();

        await sendLog(interaction.guild, embed);
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // ===== OTOROL SORGULA =====
    if (interaction.customId === 'otorol_sorgula') {
        if (!otorol[interaction.guild.id]) {
            return interaction.reply({ 
                content: '❌ Bu sunucuda otorol ayarlı değil!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const role = await interaction.guild.roles.fetch(otorol[interaction.guild.id]);
        const botMember = interaction.guild.members.cache.get(client.user.id);
        const canGive = botMember.roles.highest.position > role.position;

        const embed = new EmbedBuilder()
            .setColor(canGive ? 0x00FF00 : 0xFF0000)
            .setTitle('🔍 Otorol Bilgisi')
            .addFields(
                { name: '🎭 Otorol', value: `${role} (${role.id})`, inline: false },
                { name: '🤖 Bot Rolü', value: `${botMember.roles.highest.name} (Seviye: ${botMember.roles.highest.position})`, inline: true },
                { name: '🎯 Otorol Seviyesi', value: `Seviye: ${role.position}`, inline: true },
                { name: '✅ Verilebilir mi?', value: canGive ? '**EVET**' : '**HAYIR** (Bot rolü daha yüksek olmalı!)', inline: false }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setImage(canGive ? GIFS.success : GIFS.error)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
});

// ===================== ÜYE GİRİŞ LOG =====================
client.on('guildMemberAdd', async (member) => {
    console.log(`👋 ${member.user.tag} sunucuya katıldı!`);
    
    if (otorol[member.guild.id]) {
        try {
            const role = await member.guild.roles.fetch(otorol[member.guild.id]);
            if (role) {
                await member.roles.add(role);
                console.log(`✅ Otorol verildi: ${member.user.tag} -> ${role.name}`);
                
                const logEmbed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('⚙️ Otorol Verildi')
                    .setDescription(`${member.user.tag} kullanıcısına otomatik rol verildi!`)
                    .addFields(
                        { name: '👤 Kullanıcı', value: `${member.user.tag} (${member.user.id})`, inline: true },
                        { name: '🎭 Rol', value: `${role.name} (${role.id})`, inline: true }
                    )
                    .setThumbnail(member.user.displayAvatarURL())
                    .setImage(GIFS.success)
                    .setTimestamp();
                
                await sendLog(member.guild, logEmbed).catch(() => {});
            }
        } catch (error) {
            console.error('❌ Otorol hatası:', error);
        }
    }
    
    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('👋 **Yeni Üye Katıldı**')
        .setDescription(`${member.user.tag} sunucumuza katıldı!`)
        .addFields(
            { name: '👤 Kullanıcı', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '📊 Üye Sırası', value: `**${member.guild.memberCount}**. üye`, inline: true },
            { name: '🎭 Otorol', value: otorol[member.guild.id] ? `<@&${otorol[member.guild.id]}> verildi` : 'Ayarlanmamış', inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setImage(GIFS.welcome)
        .setFooter({ text: `BlackWell Moderasyon • ${new Date().toLocaleString('tr-TR')}`, iconURL: member.guild.iconURL() })
        .setTimestamp();
    
    await sendLog(member.guild, embed);
});

// ===================== ÜYE AYRILMA LOG =====================
client.on('guildMemberRemove', async (member) => {
    console.log(`👋 ${member.user.tag} sunucudan ayrıldı!`);
    
    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('👋 **Üye Ayrıldı**')
        .setDescription(`${member.user.tag} sunucumuzdan ayrıldı!`)
        .addFields(
            { name: '👤 Kullanıcı', value: `${member.user.tag} (${member.user.id})`, inline: true },
            { name: '📅 Katılma Tarihi', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt / 1000)}:R>` : 'Bilinmiyor', inline: true },
            { name: '⏱️ Kalma Süresi', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt / 1000)}:R>` : 'Bilinmiyor', inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setImage(GIFS.error)
        .setFooter({ text: `BlackWell Moderasyon • ${new Date().toLocaleString('tr-TR')}`, iconURL: member.guild.iconURL() })
        .setTimestamp();
    
    await sendLog(member.guild, embed);
});

// ===================== MESAJ SİLME LOG - FİLTRELİ =====================
client.on('messageDelete', async (message) => {
    if (!message.author) return;
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content) return;
    if (message.content.length < 2) return;
    
    const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('✉️ **Mesaj Silindi**')
        .setDescription(`${message.author.tag} tarafından gönderilen mesaj silindi`)
        .addFields(
            { name: '📢 Kanal', value: `${message.channel} (${message.channel.id})`, inline: true },
            { name: '👤 Yazar', value: message.author.tag, inline: true },
            { name: '📝 Silinen Mesaj', value: `\`\`\`${message.content.substring(0, 500)}\`\`\``, inline: false }
        )
        .setThumbnail(message.author.displayAvatarURL())
        .setImage(GIFS.warn)
        .setFooter({ text: `Mesaj ID: ${message.id} • Silinme: ${new Date().toLocaleString('tr-TR')}` })
        .setTimestamp();

    await sendLog(message.guild, embed).catch(() => {});
});

// ===================== MESAJ DÜZENLEME LOG - FİLTRELİ =====================
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.author?.bot) return;
    if (!oldMessage.guild) return;
    if (oldMessage.content === newMessage.content) return;
    if (!oldMessage.content || !newMessage.content) return;
    if (oldMessage.content.length < 2 && newMessage.content.length < 2) return;
    
    const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('✏️ **Mesaj Düzenlendi**')
        .setDescription(`${oldMessage.author?.tag || 'Bilinmeyen Kullanıcı'} mesajını düzenledi`)
        .addFields(
            { name: '📢 Kanal', value: `${oldMessage.channel} (${oldMessage.channel.id})`, inline: true },
            { name: '👤 Yazar', value: oldMessage.author?.tag || 'Bilinmiyor', inline: true },
            { name: '📝 Eski Mesaj', value: `\`\`\`${oldMessage.content.substring(0, 500)}\`\`\``, inline: false },
            { name: '📝 Yeni Mesaj', value: `\`\`\`${newMessage.content.substring(0, 500)}\`\`\``, inline: false }
        )
        .setThumbnail(oldMessage.author?.displayAvatarURL() || null)
        .setImage(GIFS.warn)
        .setFooter({ text: `Mesaj ID: ${oldMessage.id} • Düzenlenme: ${new Date().toLocaleString('tr-TR')}` })
        .setTimestamp();

    await sendLog(oldMessage.guild, embed).catch(() => {});
});

// ===================== TOPLU MESAJ SİLME LOG =====================
client.on('messageDeleteBulk', async (messages) => {
    const firstMessage = messages.first();
    if (!firstMessage?.guild) return;
    
    const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('🧹 **Toplu Mesaj Silindi**')
        .setDescription(`**${messages.size}** mesaj toplu olarak silindi!`)
        .addFields(
            { name: '📢 Kanal', value: `${firstMessage.channel} (${firstMessage.channel.id})`, inline: true }
        )
        .setImage(GIFS.warn)
        .setTimestamp();

    await sendLog(firstMessage.guild, embed).catch(() => {});
});

// ===================== KOMUTLAR =====================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;
    
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (!isStaff(message.member) && command !== 'yardım' && command !== 'help') {
        return message.reply({ 
            content: '❌ Bu komutu kullanmak için yetkiniz yok!', 
            flags: MessageFlags.Ephemeral 
        });
    }

    // ===== YARDIM KOMUTU =====
    if (command === 'yardım' || command === 'help') {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('📚 **BlackWell Moderasyon Komutları**')
            .setDescription(`
\`\`\`ascii
╔════════════════════════════════════╗
║        🛡️ MODERASYON KOMUTLARI     ║
╠════════════════════════════════════╣
║ !panel      - Paneli açar          ║
║ !ban        - Kullanıcı banlar     ║
║ !kick       - Kullanıcı atar       ║
║ !mute       - Kullanıcı susturur   ║
║ !unmute     - Susturmayı kaldırır  ║
║ !warn       - Uyarı verir          ║
║ !warnings   - Uyarıları gösterir   ║
║ !warnsil    - Belirli uyarıyı siler║
║ !warntemizle- Tüm uyarıları temizler║
║ !clear      - Mesaj temizler       ║
║ !banlist    - Ban listesini açar   ║
║ !duyuru     - Duyuru gönderir      ║
║ !dm         - Özel mesaj gönderir  ║
║ !otorol     - Otorol ayarlar       ║
║ !otorolkontrol - Otorol kontrol    ║
║ !istatistik - Sunucu istatistiği   ║
╚════════════════════════════════════╝
\`\`\`
            `)
            .addFields(
                { name: '👑 BOSS Rolü', value: '<@&1435010471391657984>', inline: true },
                { name: '👥 OG Rolü', value: '<@&1435017895947145298>', inline: true },
                { name: '📌 Not', value: 'Her iki rol de **eşit yetkiye** sahiptir!', inline: false }
            )
            .setThumbnail(message.guild.iconURL())
            .setImage(GIFS.welcome)
            .setFooter({ text: `BlackWell Moderasyon • ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // ===== UYARI KOMUTU - DM BİLDİRİMLİ =====
    if (command === 'warn') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        const reason = args.slice(1).join(' ') || 'Belirtilmedi';
        
        if (!warnings[user.id]) warnings[user.id] = [];
        warnings[user.id].push({
            reason: reason,
            mod: message.author.tag,
            modId: message.author.id,
            date: new Date().toISOString()
        });
        
        fs.writeFileSync('./warnings.json', JSON.stringify(warnings, null, 2));
        
        // DM BİLDİRİMİ
        let dmStatus = '✅ Gönderildi';
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ **Uyarı Aldınız!**')
                .setDescription(`**${message.guild.name}** sunucusunda uyarı aldınız!`)
                .addFields(
                    { name: '📝 Uyarı Sebebi', value: `\`\`\`${reason}\`\`\``, inline: false },
                    { name: '👮 Uyaran Yetkili', value: message.author.tag, inline: true },
                    { name: '📊 Toplam Uyarı', value: `**${warnings[user.id].length}**`, inline: true },
                    { name: '🕐 Uyarı Tarihi', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(message.guild.iconURL())
                .setImage(GIFS.warn)
                .setFooter({ text: 'BlackWell Moderasyon', iconURL: message.guild.iconURL() })
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            dmStatus = '❌ Gönderilemedi (DM kapalı)';
        }
        
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('⚠️ **Kullanıcı Uyarıldı**')
            .setDescription(`${user.tag} adlı kullanıcı uyarıldı!`)
            .addFields(
                { name: '👤 Uyarılan', value: `${user.tag} (${user.id})`, inline: true },
                { name: '👮 Uyaran', value: message.author.tag, inline: true },
                { name: '📝 Sebep', value: reason, inline: false },
                { name: '📊 Toplam Uyarı', value: warnings[user.id].length.toString(), inline: true },
                { name: '📨 DM Durumu', value: dmStatus, inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setImage(GIFS.warn)
            .setFooter({ text: `Uyarı ID: ${Date.now()}`, iconURL: message.guild.iconURL() })
            .setTimestamp();
        
        await sendLog(message.guild, embed);
        await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        
        modLog.push({
            type: 'UYARI',
            user: user.tag,
            userId: user.id,
            mod: message.author.tag,
            modId: message.author.id,
            reason: reason,
            date: new Date().toISOString()
        });
        fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));
    }

    // ===== UYARILARI GÖSTER =====
    if (command === 'warnings') {
        const user = message.mentions.users.first() || message.author;
        
        if (!warnings[user.id] || warnings[user.id].length === 0) {
            return message.reply({ 
                embeds: [new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('📋 Uyarı Geçmişi')
                    .setDescription(`✅ ${user.tag} kullanıcısının hiç uyarısı yok.`)
                    .setThumbnail(user.displayAvatarURL())
                    .setImage(GIFS.success)
                    .setTimestamp()
                ], 
                flags: MessageFlags.Ephemeral 
            });
        }
        
        let warnList = '';
        warnings[user.id].forEach((w, i) => {
            const tarih = new Date(w.date).toLocaleString('tr-TR');
            warnList += `**${i+1}.** 📝 **Sebep:** ${w.reason}\n`;
            warnList += `   ╰➤ **Uyaran:** ${w.mod}\n`;
            warnList += `   ╰➤ **Tarih:** ${tarih}\n\n`;
        });
        
        const embed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle(`⚠️ ${user.tag} - Uyarı Geçmişi (${warnings[user.id].length})`)
            .setDescription(warnList.substring(0, 4000))
            .setThumbnail(user.displayAvatarURL())
            .setImage(GIFS.warn)
            .setFooter({ text: `Sorgulayan: ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        
        await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // ===== UYARI SİLME =====
    if (command === 'warnsil' || command === 'warnremove') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        const warnNumber = parseInt(args[1]);
        if (isNaN(warnNumber) || warnNumber < 1) {
            return message.reply({ content: '❌ Geçerli bir uyarı numarası belirtmelisiniz!', flags: MessageFlags.Ephemeral });
        }
        
        if (!warnings[user.id] || warnings[user.id].length === 0) {
            return message.reply({ content: `❌ ${user.tag} kullanıcısının hiç uyarısı yok!`, flags: MessageFlags.Ephemeral });
        }
        
        if (warnNumber > warnings[user.id].length) {
            return message.reply({ content: `❌ Bu kullanıcının sadece ${warnings[user.id].length} uyarısı var!`, flags: MessageFlags.Ephemeral });
        }
        
        const silinenUyari = warnings[user.id][warnNumber - 1];
        
        warnings[user.id].splice(warnNumber - 1, 1);
        
        if (warnings[user.id].length === 0) {
            delete warnings[user.id];
        }
        
        fs.writeFileSync('./warnings.json', JSON.stringify(warnings, null, 2));
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ **Uyarı Silindi**')
            .setDescription(`${user.tag} kullanıcısının ${warnNumber}. uyarısı silindi!`)
            .addFields(
                { name: '👤 Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
                { name: '👮 İşlemi Yapan', value: message.author.tag, inline: true },
                { name: '📝 Silinen Uyarı', value: `\`\`\`${silinenUyari.reason}\`\`\``, inline: false },
                { name: '👤 Uyaran', value: silinenUyari.mod, inline: true },
                { name: '🕐 Uyarı Tarihi', value: new Date(silinenUyari.date).toLocaleString('tr-TR'), inline: true },
                { name: '📊 Kalan Uyarı', value: warnings[user.id] ? warnings[user.id].length.toString() : '0', inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setImage(GIFS.success)
            .setFooter({ text: `İşlem ID: ${Date.now()}`, iconURL: message.guild.iconURL() })
            .setTimestamp();
        
        await sendLog(message.guild, embed);
        await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ **Uyarınız Silindi**')
                .setDescription(`**${message.guild.name}** sunucusunda bir uyarınız silindi!`)
                .addFields(
                    { name: '📝 Silinen Uyarı', value: `\`\`\`${silinenUyari.reason}\`\`\``, inline: false },
                    { name: '👮 İşlemi Yapan', value: message.author.tag, inline: true },
                    { name: '📊 Kalan Uyarı', value: warnings[user.id] ? warnings[user.id].length.toString() : '0', inline: true }
                )
                .setThumbnail(message.guild.iconURL())
                .setImage(GIFS.success)
                .setTimestamp();
            
            await user.send({ embeds: [dmEmbed] }).catch(() => {});
        } catch (e) {}
        
        modLog.push({
            type: 'UYARI SİLME',
            user: user.tag,
            userId: user.id,
            mod: message.author.tag,
            modId: message.author.id,
            reason: `${warnNumber}. uyarı silindi (Sebep: ${silinenUyari.reason})`,
            date: new Date().toISOString()
        });
        fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));
    }

    // ===== TÜM UYARILARI TEMİZLE =====
    if (command === 'warntemizle' || command === 'warnclear') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        if (!warnings[user.id] || warnings[user.id].length === 0) {
            return message.reply({ content: `✅ ${user.tag} kullanıcısının zaten hiç uyarısı yok!`, flags: MessageFlags.Ephemeral });
        }
        
        const uyariSayisi = warnings[user.id].length;
        
        delete warnings[user.id];
        fs.writeFileSync('./warnings.json', JSON.stringify(warnings, null, 2));
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🧹 **Tüm Uyarılar Temizlendi**')
            .setDescription(`${user.tag} kullanıcısının **${uyariSayisi}** uyarısı temizlendi!`)
            .addFields(
                { name: '👤 Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
                { name: '👮 İşlemi Yapan', value: message.author.tag, inline: true },
                { name: '📊 Temizlenen Uyarı', value: `**${uyariSayisi}** uyarı`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setImage(GIFS.success)
            .setFooter({ text: `İşlem ID: ${Date.now()}`, iconURL: message.guild.iconURL() })
            .setTimestamp();
        
        await sendLog(message.guild, embed);
        await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🧹 **Tüm Uyarılarınız Temizlendi**')
                .setDescription(`**${message.guild.name}** sunucusunda **${uyariSayisi}** uyarınız temizlendi!`)
                .addFields(
                    { name: '👮 İşlemi Yapan', value: message.author.tag, inline: true },
                    { name: '📊 Temizlenen Uyarı', value: `**${uyariSayisi}** uyarı`, inline: true }
                )
                .setThumbnail(message.guild.iconURL())
                .setImage(GIFS.success)
                .setTimestamp();
            
            await user.send({ embeds: [dmEmbed] }).catch(() => {});
        } catch (e) {}
        
        modLog.push({
            type: 'UYARI TEMİZLEME',
            user: user.tag,
            userId: user.id,
            mod: message.author.tag,
            modId: message.author.id,
            reason: `${uyariSayisi} uyarı temizlendi`,
            date: new Date().toISOString()
        });
        fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));
    }

    // ===== BAN KOMUTU =====
    if (command === 'ban') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        const reason = args.slice(1).join(' ') || 'Belirtilmedi';
        
        try {
            const member = await message.guild.members.fetch(user.id);
            await member.ban({ reason: `${message.author.tag} tarafından: ${reason}` });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔨 Kullanıcı Banlandı')
                .setDescription(`**${user.tag}** sunucudan banlandı!`)
                .addFields(
                    { name: '👤 Banlanan', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 Banlayan', value: message.author.tag, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setImage(GIFS.ban)
                .setTimestamp();

            await sendLog(message.guild, embed);
            await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            
            modLog.push({
                type: 'BAN',
                user: user.tag,
                userId: user.id,
                mod: message.author.tag,
                modId: message.author.id,
                reason: reason,
                date: new Date().toISOString()
            });
            fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));

        } catch (error) {
            console.error(error);
            await message.reply({ content: '❌ Banlama başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
        }
    }

    // ===== KICK KOMUTU =====
    if (command === 'kick') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        const reason = args.slice(1).join(' ') || 'Belirtilmedi';
        
        try {
            const member = await message.guild.members.fetch(user.id);
            await member.kick(`${message.author.tag} tarafından: ${reason}`);

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('👢 Kullanıcı Kicklendi')
                .setDescription(`**${user.tag}** sunucudan kicklendi!`)
                .addFields(
                    { name: '👤 Kicklenen', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 Kickleyen', value: message.author.tag, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setImage(GIFS.kick)
                .setTimestamp();

            await sendLog(message.guild, embed);
            await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            
            modLog.push({
                type: 'KICK',
                user: user.tag,
                userId: user.id,
                mod: message.author.tag,
                modId: message.author.id,
                reason: reason,
                date: new Date().toISOString()
            });
            fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));

        } catch (error) {
            console.error(error);
            await message.reply({ content: '❌ Kick işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
        }
    }

    // ===== MUTE KOMUTU =====
    if (command === 'mute') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        const timeStr = args[0];
        if (!timeStr) return message.reply({ content: '❌ Süre belirtmelisiniz! (10m, 1h, 1d)', flags: MessageFlags.Ephemeral });
        
        const reason = args.slice(1).join(' ') || 'Belirtilmedi';
        const timeMs = parseTime(timeStr);
        
        if (!timeMs) return message.reply({ content: '❌ Geçersiz süre formatı! (10m, 1h, 1d)', flags: MessageFlags.Ephemeral });
        
        try {
            const member = await message.guild.members.fetch(user.id);
            await member.timeout(timeMs, `${message.author.tag} tarafından: ${reason}`);
            const bitisZamani = new Date(Date.now() + timeMs);

            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('🔇 Kullanıcı Mute\'lendi')
                .setDescription(`**${user.tag}** susturuldu!`)
                .addFields(
                    { name: '👤 Mute\'lenen', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 Mute\'leyen', value: message.author.tag, inline: true },
                    { name: '⏱️ Süre', value: timeStr, inline: true },
                    { name: '⏰ Bitiş', value: `<t:${Math.floor(bitisZamani / 1000)}:R>`, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setImage(GIFS.mute)
                .setTimestamp();

            await sendLog(message.guild, embed);
            await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            
            modLog.push({
                type: 'MUTE',
                user: user.tag,
                userId: user.id,
                mod: message.author.tag,
                modId: message.author.id,
                duration: timeStr,
                reason: reason,
                date: new Date().toISOString()
            });
            fs.writeFileSync('./modlog.json', JSON.stringify(modLog, null, 2));

        } catch (error) {
            console.error(error);
            await message.reply({ content: '❌ Mute işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
        }
    }

    // ===== UNMUTE KOMUTU =====
    if (command === 'unmute') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        try {
            const member = await message.guild.members.fetch(user.id);
            await member.timeout(null);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔊 Mute Kaldırıldı')
                .setDescription(`**${user.tag}** kullanıcısının susturması kaldırıldı!`)
                .addFields(
                    { name: '👤 Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 İşlemi Yapan', value: message.author.tag, inline: true }
                )
                .setThumbnail(user.displayAvatarURL())
                .setImage(GIFS.success)
                .setTimestamp();

            await sendLog(message.guild, embed);
            await message.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error(error);
            await message.reply({ content: '❌ Mute kaldırma başarısız!', flags: MessageFlags.Ephemeral });
        }
    }

    // ===== CLEAR KOMUTU =====
    if (command === 'clear') {
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            await message.reply({ 
                content: '❌ 1-100 arası bir sayı belirtmelisiniz!', 
                flags: MessageFlags.Ephemeral 
            });
            return;
        }
        
        try {
            const messages = await message.channel.bulkDelete(amount, true);
            
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🧹 Mesajlar Silindi')
                .addFields(
                    { name: 'Silinen Mesaj', value: messages.size.toString(), inline: true },
                    { name: 'Kanal', value: message.channel.toString(), inline: true },
                    { name: 'Silen', value: message.author.tag, inline: true }
                )
                .setImage(GIFS.success)
                .setTimestamp();

            await sendLog(message.guild, embed);
            
            const reply = await message.channel.send({ 
                content: `✅ ${messages.size} mesaj silindi!` 
            });
            
            setTimeout(() => reply.delete().catch(() => {}), 3000);

        } catch (error) {
            await message.channel.send({ 
                content: '❌ 14 günden eski mesajlar silinemez!' 
            }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 3000));
        }
    }

    // ===== BANLIST KOMUTU =====
    if (command === 'banlist') {
        try {
            const bans = await message.guild.bans.fetch();
            
            if (bans.size === 0) {
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00)
                    .setTitle('📋 Ban Listesi')
                    .setDescription('```\n✨ Sunucuda banlanmış kullanıcı bulunmuyor!\n```')
                    .setImage(GIFS.success)
                    .setTimestamp();
                return message.reply({ embeds: [embed] });
            }

            let banList = '';
            let index = 1;
            
            bans.forEach(ban => {
                banList += `**${index}.** \`${ban.user.tag}\` (${ban.user.id})\n`;
                banList += `   ╰➤ **Sebep:** ${ban.reason || 'Belirtilmemiş'}\n\n`;
                index++;
            });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle(`📋 Ban Listesi (${bans.size} Kişi)`)
                .setDescription(banList.substring(0, 4000))
                .setThumbnail(message.guild.iconURL())
                .setImage(GIFS.ban)
                .setFooter({ 
                    text: `Görüntüleyen: ${message.author.tag} • Toplam: ${bans.size} ban`, 
                    iconURL: message.author.displayAvatarURL() 
                })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Ban listesi hatası:', error);
            await message.reply({ content: '❌ Ban listesi alınırken hata oluştu!' });
        }
    }

    // ===== DUYURU KOMUTU =====
    if (command === 'duyuru') {
        const duyuruMesaj = args.join(' ');
        if (!duyuruMesaj) return message.reply({ content: '❌ Bir duyuru mesajı yazmalısınız!', flags: MessageFlags.Ephemeral });
        
        await message.reply({ content: '📨 Duyuru gönderiliyor, bu biraz zaman alabilir...', flags: MessageFlags.Ephemeral });
        
        const members = await message.guild.members.fetch();
        let successCount = 0;
        let failCount = 0;
        let basariliListe = [];
        let dmKapaliListe = [];

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('📢 **BlackWell Sunucu Duyurusu**')
            .setDescription(`\`\`\`\n${duyuruMesaj}\n\`\`\``)
            .addFields(
                { name: '👤 Gönderen', value: message.author.tag, inline: true },
                { name: '🏠 Sunucu', value: message.guild.name, inline: true },
                { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setThumbnail(message.guild.iconURL())
            .setImage(GIFS.success)
            .setFooter({ text: 'BlackWell Moderasyon', iconURL: message.guild.iconURL() })
            .setTimestamp();

        for (const [id, member] of members) {
            if (member.user.bot) continue;

            try {
                await member.send({ embeds: [embed] });
                successCount++;
                basariliListe.push(member.user.tag);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                failCount++;
                if (error.code === 50007) {
                    dmKapaliListe.push(member.user.tag);
                }
            }
        }

        const basariliGoster = basariliListe.slice(0, 20).join('\n');
        const dmKapaliGoster = dmKapaliListe.slice(0, 20).join('\n');

        const sonucEmbed = new EmbedBuilder()
            .setColor(successCount > 0 ? 0x00FF00 : 0xFF0000)
            .setTitle('📊 **Duyuru Raporu**')
            .setDescription(`Duyuru tamamlandı! Detaylar aşağıda:`)
            .addFields(
                { name: '✅ Başarılı', value: `**${successCount}** kişi`, inline: true },
                { name: '❌ Başarısız', value: `**${failCount}** kişi`, inline: true },
                { name: '📨 Duyuru Mesajı', value: `\`\`\`${duyuruMesaj.substring(0, 100)}${duyuruMesaj.length > 100 ? '...' : ''}\`\`\``, inline: false }
            )
            .setImage(GIFS.success)
            .setTimestamp();

        if (basariliListe.length > 0) {
            sonucEmbed.addFields({ 
                name: `✅ Başarılı Olanlar (İlk 20)`, 
                value: `\`\`\`${basariliGoster || 'Yok'}\`\`\``, 
                inline: false 
            });
        }

        if (dmKapaliListe.length > 0) {
            sonucEmbed.addFields({ 
                name: `🔇 DM'si Kapalı Olanlar (İlk 20)`, 
                value: `\`\`\`${dmKapaliGoster || 'Yok'}\`\`\``, 
                inline: false 
            });
        }

        await sendLog(message.guild, sonucEmbed);
        await message.reply({ embeds: [sonucEmbed], flags: MessageFlags.Ephemeral });

        duyuruLog.push({
            mod: message.author.tag,
            modId: message.author.id,
            mesaj: duyuruMesaj,
            basarili: successCount,
            basarisiz: failCount,
            dmKapali: dmKapaliListe.length,
            tarih: new Date().toISOString()
        });
        fs.writeFileSync('./duyurulog.json', JSON.stringify(duyuruLog, null, 2));
    }

    // ===== İSTATİSTİK KOMUTU =====
    if (command === 'istatistik') {
        await message.guild.members.fetch();
        
        const totalMembers = message.guild.memberCount;
        const botCount = message.guild.members.cache.filter(m => m.user.bot).size;
        const userCount = totalMembers - botCount;
        const onlineCount = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const banCount = (await message.guild.bans.fetch()).size;
        const roleCount = message.guild.roles.cache.size;
        const channelCount = message.guild.channels.cache.size;

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`📊 ${message.guild.name} İstatistikleri`)
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { name: '👥 Toplam Üye', value: `**${totalMembers}**`, inline: true },
                { name: '👤 Kullanıcı', value: `**${userCount}**`, inline: true },
                { name: '🤖 Bot', value: `**${botCount}**`, inline: true },
                { name: '🟢 Çevrimiçi', value: `**${onlineCount}**`, inline: true },
                { name: '🔨 Ban Sayısı', value: `**${banCount}**`, inline: true },
                { name: '🎭 Rol Sayısı', value: `**${roleCount}**`, inline: true },
                { name: '📺 Kanal Sayısı', value: `**${channelCount}**`, inline: true },
                { name: '📜 Moderasyon İşlemi', value: `**${modLog.length}**`, inline: true },
                { name: '📢 Duyuru Sayısı', value: `**${duyuruLog.length}**`, inline: true }
            )
            .setImage(GIFS.welcome)
            .setFooter({ text: `BlackWell Moderasyon`, iconURL: message.guild.iconURL() })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // ===== OTOROL KOMUTU =====
    if (command === 'otorol') {
        const role = message.mentions.roles.first();
        if (!role) return message.reply({ content: '❌ Bir rol etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        const botMember = message.guild.members.cache.get(client.user.id);
        if (botMember.roles.highest.position <= role.position) {
            return message.reply({ 
                content: '❌ Bu rolü veremem! Bot rolü, verilecek rolden **yüksek** olmalı!', 
                flags: MessageFlags.Ephemeral 
            });
        }
        
        otorol[message.guild.id] = role.id;
        fs.writeFileSync('./otorol.json', JSON.stringify(otorol, null, 2));
        
        await message.reply({ content: `✅ Otorol ${role} olarak ayarlandı!`, flags: MessageFlags.Ephemeral });
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('⚙️ Otorol Ayarlandı')
            .addFields(
                { name: '🎭 Rol', value: role.name, inline: true },
                { name: '👤 Ayarlayan', value: message.author.tag, inline: true }
            )
            .setImage(GIFS.success)
            .setTimestamp();
        
        await sendLog(message.guild, embed);
    }

    // ===== OTOROLKONTROL KOMUTU =====
    if (command === 'otorolkontrol') {
        if (!otorol[message.guild.id]) {
            return message.reply({ content: '❌ Bu sunucuda otorol ayarlı değil!', flags: MessageFlags.Ephemeral });
        }

        const role = await message.guild.roles.fetch(otorol[message.guild.id]);
        const botMember = message.guild.members.cache.get(client.user.id);
        const canGive = botMember.roles.highest.position > role.position;

        const embed = new EmbedBuilder()
            .setColor(canGive ? 0x00FF00 : 0xFF0000)
            .setTitle('🔍 Otorol Kontrol')
            .addFields(
                { name: '🎭 Otorol', value: `${role} (${role.id})`, inline: false },
                { name: '🤖 Bot Rolü', value: `${botMember.roles.highest.name} (Seviye: ${botMember.roles.highest.position})`, inline: true },
                { name: '🎯 Otorol Seviyesi', value: `Seviye: ${role.position}`, inline: true },
                { name: '✅ Verilebilir mi?', value: canGive ? '**EVET**' : '**HAYIR** (Bot rolü daha yüksek olmalı!)', inline: false }
            )
            .setImage(canGive ? GIFS.success : GIFS.error)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // ===== DM KOMUTU =====
    if (command === 'dm') {
        const user = message.mentions.users.first();
        if (!user) return message.reply({ content: '❌ Bir kullanıcı etiketlemelisiniz!', flags: MessageFlags.Ephemeral });
        
        const dmMesaj = args.slice(1).join(' ');
        if (!dmMesaj) return message.reply({ content: '❌ Bir mesaj yazmalısınız!', flags: MessageFlags.Ephemeral });
        
        try {
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('📨 Özel Mesaj')
                .setDescription(dmMesaj)
                .addFields(
                    { name: '👤 Gönderen', value: message.author.tag, inline: true },
                    { name: '🏠 Sunucu', value: message.guild.name, inline: true }
                )
                .setThumbnail(message.guild.iconURL())
                .setImage(GIFS.success)
                .setTimestamp();

            await user.send({ embeds: [embed] });
            await message.reply({ content: `✅ ${user.tag} adlı kullanıcıya mesaj gönderildi!`, flags: MessageFlags.Ephemeral });

        } catch (error) {
            await message.reply({ content: `❌ ${user.tag} adlı kullanıcıya mesaj gönderilemedi! (DM'si kapalı)`, flags: MessageFlags.Ephemeral });
        }
    }
});

// ===================== SÜRE PARSE =====================
function parseTime(time) {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1));
    
    if (isNaN(value)) return null;
    
    switch(unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

client.login(config.token);
