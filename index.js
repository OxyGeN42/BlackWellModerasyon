const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, StringSelectMenuBuilder, MessageFlags, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const canvas = require('canvas');
const { createCanvas, loadImage, registerFont } = canvas;

// Configuration - Railway Variables'dan oku
const config = {
    token: process.env.token || "MTQ4NDM1MTgxNzcxMzE4OTAyNA.GNR-84.P2zHhGfZlvzczR8NYpivgEStJMKVKHE_srsg64",
    ownerId: process.env.ownerId || "685921707667619908",
    logChannelId: process.env.logChannelId || "1484352505620987964",
    bossRoles: process.env.bossRoles ? process.env.bossRoles.split(',') : ["1435010471391657984"],
    ogRoles: process.env.ogRoles ? process.env.ogRoles.split(',') : ["1435017895947145298"],
    guildId: process.env.guildId,
    clientId: process.env.clientId
};

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

console.log('🔍 Config:', {
    tokenVarMi: !!config.token,
    ownerId: config.ownerId,
    logChannelId: config.logChannelId,
    bossRoles: config.bossRoles,
    ogRoles: config.ogRoles,
    guildId: config.guildId,
    clientId: config.clientId
});

if (!config.token) {
    console.error('❌ HATA: Token bulunamadı!');
    process.exit(1);
}

// Veritabanı
let warnings = {};
let otorol = {};
let modLog = [];
let duyuruLog = [];
let tagSistemi = {};

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
if (fs.existsSync('./tag.json')) {
    tagSistemi = JSON.parse(fs.readFileSync('./tag.json'));
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

// ===================== CANVAS HOŞGELDİN KARTI =====================
async function createWelcomeCard(member) {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Arkaplan gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Çerçeve
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Avatar
    try {
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 120, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, width / 2 - 80, 40, 160, 160);
        ctx.restore();

        // Avatar çerçevesi
        ctx.beginPath();
        ctx.arc(width / 2, 120, 82, 0, Math.PI * 2);
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 4;
        ctx.stroke();
    } catch (err) {
        console.error('Avatar yüklenemedi:', err);
    }

    // Yazılar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('HOŞ GELDİN!', width / 2, 240);

    ctx.font = 'bold 28px "Segoe UI"';
    ctx.fillStyle = '#e94560';
    ctx.fillText(member.user.tag, width / 2, 290);

    ctx.font = '20px "Segoe UI"';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Sunucumuza katıldın! • Üye #${member.guild.memberCount}`, width / 2, 340);

    ctx.font = '16px "Segoe UI"';
    ctx.fillStyle = '#888888';
    ctx.fillText(`ID: ${member.user.id} • Hesap: ${new Date(member.user.createdTimestamp).toLocaleDateString('tr-TR')}`, width / 2, 380);

    return canvas.toBuffer();
}

async function createLeaveCard(member) {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    try {
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 256 }));
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 120, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, width / 2 - 80, 40, 160, 160);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(width / 2, 120, 82, 0, Math.PI * 2);
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 4;
        ctx.stroke();
    } catch (err) {}

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('GÜLE GÜLE!', width / 2, 240);

    ctx.font = 'bold 28px "Segoe UI"';
    ctx.fillStyle = '#e94560';
    ctx.fillText(member.user.tag, width / 2, 290);

    ctx.font = '20px "Segoe UI"';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Sunucumuzdan ayrıldı...', width / 2, 340);

    ctx.font = '16px "Segoe UI"';
    ctx.fillStyle = '#888888';
    ctx.fillText(`ID: ${member.user.id} • Kalma süresi: ${member.joinedAt ? new Date().toLocaleDateString() : 'Bilinmiyor'}`, width / 2, 380);

    return canvas.toBuffer();
}

// ===================== TAG SİSTEMİ =====================
async function checkAndAddTag(member) {
    if (!tagSistemi[member.guild.id]) return;
    
    const tag = tagSistemi[member.guild.id];
    if (!member.user.username.startsWith(tag)) {
        try {
            await member.setNickname(`${tag} ${member.user.username}`);
            console.log(`✅ Tag eklendi: ${member.user.tag} -> ${tag} ${member.user.username}`);
        } catch (error) {
            console.error('Tag eklenemedi:', error.message);
        }
    }
}

// ===================== SLASH KOMUTLAR =====================
async function registerSlashCommands() {
    if (!config.clientId || !config.guildId) {
        console.log('⚠️ Slash komutlar için clientId ve guildId gerekli!');
        return;
    }

    const commands = [
        new SlashCommandBuilder().setName('panel').setDescription('🛡️ Moderasyon panelini açar'),
        new SlashCommandBuilder().setName('ban').setDescription('🔨 Bir kullanıcıyı banlar').addUserOption(opt => opt.setName('kullanici').setDescription('Banlanacak kullanıcı').setRequired(true)).addStringOption(opt => opt.setName('sebep').setDescription('Ban sebebi').setRequired(false)),
        new SlashCommandBuilder().setName('kick').setDescription('👢 Bir kullanıcıyı kickler').addUserOption(opt => opt.setName('kullanici').setDescription('Kicklenecek kullanıcı').setRequired(true)).addStringOption(opt => opt.setName('sebep').setDescription('Kick sebebi').setRequired(false)),
        new SlashCommandBuilder().setName('mute').setDescription('🔇 Bir kullanıcıyı susturur').addUserOption(opt => opt.setName('kullanici').setDescription('Mute\'lenecek kullanıcı').setRequired(true)).addStringOption(opt => opt.setName('sure').setDescription('Süre (10m, 1h, 1d)').setRequired(true)).addStringOption(opt => opt.setName('sebep').setDescription('Mute sebebi').setRequired(false)),
        new SlashCommandBuilder().setName('unmute').setDescription('🔊 Susturulmuş kullanıcının susturmasını kaldırır').addUserOption(opt => opt.setName('kullanici').setDescription('Mute\'i kaldırılacak kullanıcı').setRequired(true)),
        new SlashCommandBuilder().setName('warn').setDescription('⚠️ Bir kullanıcıyı uyarır').addUserOption(opt => opt.setName('kullanici').setDescription('Uyarılacak kullanıcı').setRequired(true)).addStringOption(opt => opt.setName('sebep').setDescription('Uyarı sebebi').setRequired(false)),
        new SlashCommandBuilder().setName('warnings').setDescription('📋 Bir kullanıcının uyarılarını gösterir').addUserOption(opt => opt.setName('kullanici').setDescription('Uyarıları görüntülenecek kullanıcı').setRequired(false)),
        new SlashCommandBuilder().setName('clear').setDescription('🧹 Mesaj temizler').addIntegerOption(opt => opt.setName('miktar').setDescription('Silinecek mesaj sayısı (1-100)').setRequired(true)),
        new SlashCommandBuilder().setName('banlist').setDescription('📋 Ban listesini gösterir'),
        new SlashCommandBuilder().setName('duyuru').setDescription('📢 Duyuru gönderir').addStringOption(opt => opt.setName('mesaj').setDescription('Duyuru mesajı').setRequired(true)),
        new SlashCommandBuilder().setName('istatistik').setDescription('📊 Sunucu istatistiklerini gösterir'),
        new SlashCommandBuilder().setName('yardım').setDescription('📚 Tüm komutları listeler'),
        new SlashCommandBuilder().setName('otorol-ayarla').setDescription('⚙️ Otorol ayarlar').addRoleOption(opt => opt.setName('rol').setDescription('Otorol olarak ayarlanacak rol').setRequired(true)),
        new SlashCommandBuilder().setName('otorol-kapat').setDescription('🔴 Otorol sistemini kapatır'),
        new SlashCommandBuilder().setName('tag-ayarla').setDescription('🏷️ Tag sistemi ayarlar').addStringOption(opt => opt.setName('tag').setDescription('Eklenecek tag (örn: BLW |)').setRequired(true)),
        new SlashCommandBuilder().setName('tag-kapat').setDescription('🏷️ Tag sistemini kapatır')
    ];

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log('🔄 Slash komutlar kaydediliyor...');
        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
        console.log('✅ Slash komutlar başarıyla kaydedildi!');
    } catch (error) {
        console.error('❌ Slash komut kaydedilemedi:', error);
    }
}

// ===================== CLIENT READY =====================
client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} olarak giriş yapıldı!`);
    console.log(`📊 Sunucu sayısı: ${client.guilds.cache.size}`);
    console.log(`👑 BOSS Rolü: <@&1435010471391657984>`);
    console.log(`👥 OG Rolü: <@&1435017895947145298>`);
    
    await registerSlashCommands();
    
    const activities = [
        '🛡️ Blackwell Moderasyon',
        '👑 BOSS & OG Yetkili',
        '📋 /panel yaz',
        '🔨 Ban & Kick & Mute'
    ];
    let i = 0;
    setInterval(() => {
        client.user.setActivity(activities[i % activities.length], { type: 3 });
        i++;
    }, 10000);
});

// ===================== SLASH KOMUT İŞLEMLERİ =====================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const { commandName, options, member, guild } = interaction;
    
    if (!isStaff(member) && commandName !== 'yardım' && commandName !== 'istatistik') {
        return interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok!', flags: MessageFlags.Ephemeral });
    }
    
    // ===== YARDIM =====
    if (commandName === 'yardım') {
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('📚 **BlackWell Moderasyon Komutları**')
            .setDescription(`
\`\`\`ascii
╔════════════════════════════════════════════════════╗
║              🛡️ MODERASYON KOMUTLARI                ║
╠════════════════════════════════════════════════════╣
║ /panel      - Moderasyon panelini açar             ║
║ /ban        - Kullanıcı banlar                     ║
║ /kick       - Kullanıcı atar                       ║
║ /mute       - Kullanıcı susturur                   ║
║ /unmute     - Susturmayı kaldırır                  ║
║ /warn       - Uyarı verir                          ║
║ /warnings   - Uyarıları gösterir                   ║
║ /clear      - Mesaj temizler                       ║
║ /banlist    - Ban listesini açar                   ║
║ /duyuru     - Duyuru gönderir                      ║
║ /istatistik - Sunucu istatistiği                   ║
║ /otorol-ayarla - Otorol ayarlar                    ║
║ /otorol-kapat   - Otorol kapatır                   ║
║ /tag-ayarla     - Tag sistemi ayarlar              ║
║ /tag-kapat      - Tag sistemini kapatır            ║
╚════════════════════════════════════════════════════╝
\`\`\`
            `)
            .addFields(
                { name: '👑 BOSS Rolü', value: '<@&1435010471391657984>', inline: true },
                { name: '👥 OG Rolü', value: '<@&1435017895947145298>', inline: true },
                { name: '📌 Not', value: 'Her iki rol de **eşit yetkiye** sahiptir!', inline: false }
            )
            .setThumbnail(guild.iconURL())
            .setImage(GIFS.welcome)
            .setFooter({ text: `BlackWell Moderasyon • ${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
            .setTimestamp();
        
        return interaction.reply({ embeds: [embed] });
    }
    
    // ===== İSTATİSTİK =====
    if (commandName === 'istatistik') {
        await guild.members.fetch();
        
        const totalMembers = guild.memberCount;
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        const userCount = totalMembers - botCount;
        const onlineCount = guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const banCount = (await guild.bans.fetch()).size;
        const roleCount = guild.roles.cache.size;
        const channelCount = guild.channels.cache.size;

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`📊 ${guild.name} İstatistikleri`)
            .setThumbnail(guild.iconURL())
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
            .setFooter({ text: `BlackWell Moderasyon`, iconURL: guild.iconURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
    
    // ===== BAN =====
    if (commandName === 'ban') {
        const user = options.getUser('kullanici');
        const reason = options.getString('sebep') || 'Belirtilmedi';
        
        try {
            const member = await guild.members.fetch(user.id);
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

            await sendLog(guild, embed);
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            
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

        } catch (error) {
            await interaction.reply({ content: '❌ Banlama başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
        }
    }
    
    // ===== KICK =====
    if (commandName === 'kick') {
        const user = options.getUser('kullanici');
        const reason = options.getString('sebep') || 'Belirtilmedi';
        
        try {
            const member = await guild.members.fetch(user.id);
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

            await sendLog(guild, embed);
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            
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

        } catch (error) {
            await interaction.reply({ content: '❌ Kick işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
        }
    }
    
    // ===== MUTE =====
    if (commandName === 'mute') {
        const user = options.getUser('kullanici');
        const timeStr = options.getString('sure');
        const reason = options.getString('sebep') || 'Belirtilmedi';
        const timeMs = parseTime(timeStr);
        
        if (!timeMs) {
            return interaction.reply({ content: '❌ Geçersiz süre formatı! (10m, 1h, 1d)', flags: MessageFlags.Ephemeral });
        }
        
        try {
            const member = await guild.members.fetch(user.id);
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

            await sendLog(guild, embed);
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            
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

        } catch (error) {
            await interaction.reply({ content: '❌ Mute işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
        }
    }
    
    // ===== UNMUTE =====
    if (commandName === 'unmute') {
        const user = options.getUser('kullanici');
        
        try {
            const member = await guild.members.fetch(user.id);
            await member.timeout(null);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🔊 Mute Kaldırıldı')
                .setDescription(`**${user.tag}** kullanıcısının susturması kaldırıldı!`)
                .addFields(
                    { name: '👤 Kullanıcı', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 İşlemi Yapan', value: interaction.user.tag, inline: true }
                )
                .setThumbnail(user.displayAvatarURL())
                .setImage(GIFS.success)
                .setTimestamp();

            await sendLog(guild, embed);
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

        } catch (error) {
            await interaction.reply({ content: '❌ Mute kaldırma başarısız!', flags: MessageFlags.Ephemeral });
        }
    }
    
    // ===== UYARI =====
    if (commandName === 'warn') {
        const user = options.getUser('kullanici');
        const reason = options.getString('sebep') || 'Belirtilmedi';
        
        if (!warnings[user.id]) warnings[user.id] = [];
        warnings[user.id].push({
            reason: reason,
            mod: interaction.user.tag,
            modId: interaction.user.id,
            date: new Date().toISOString()
        });
        
        fs.writeFileSync('./warnings.json', JSON.stringify(warnings, null, 2));
        
        let dmStatus = '✅ Gönderildi';
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⚠️ **Uyarı Aldınız!**')
                .setDescription(`**${guild.name}** sunucusunda uyarı aldınız!`)
                .addFields(
                    { name: '📝 Uyarı Sebebi', value: `\`\`\`${reason}\`\`\``, inline: false },
                    { name: '👮 Uyaran Yetkili', value: interaction.user.tag, inline: true },
                    { name: '📊 Toplam Uyarı', value: `**${warnings[user.id].length}**`, inline: true },
                    { name: '🕐 Uyarı Tarihi', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setThumbnail(guild.iconURL())
                .setImage(GIFS.warn)
                .setFooter({ text: 'BlackWell Moderasyon', iconURL: guild.iconURL() })
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
                { name: '👮 Uyaran', value: interaction.user.tag, inline: true },
                { name: '📝 Sebep', value: reason, inline: false },
                { name: '📊 Toplam Uyarı', value: warnings[user.id].length.toString(), inline: true },
                { name: '📨 DM Durumu', value: dmStatus, inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setImage(GIFS.warn)
            .setFooter({ text: `Uyarı ID: ${Date.now()}`, iconURL: guild.iconURL() })
            .setTimestamp();
        
        await sendLog(guild, embed);
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        
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
    }
    
    // ===== UYARILARI GÖSTER =====
    if (commandName === 'warnings') {
        const user = options.getUser('kullanici') || interaction.user;
        
        if (!warnings[user.id] || warnings[user.id].length === 0) {
            return interaction.reply({ 
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
            .setFooter({ text: `Sorgulayan: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
    
    // ===== CLEAR =====
    if (commandName === 'clear') {
        const amount = options.getInteger('miktar');
        
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: '❌ 1-100 arası bir sayı belirtmelisiniz!', flags: MessageFlags.Ephemeral });
        }
        
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

            await sendLog(guild, embed);
            await interaction.reply({ content: `✅ ${messages.size} mesaj silindi!`, flags: MessageFlags.Ephemeral });

        } catch (error) {
            await interaction.reply({ content: '❌ 14 günden eski mesajlar silinemez!', flags: MessageFlags.Ephemeral });
        }
    }
    
    // ===== BANLIST =====
    if (commandName === 'banlist') {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        try {
            const bans = await guild.bans.fetch();
            
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
                .setThumbnail(guild.iconURL())
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
            
            await sendLog(guild, logEmbed);

        } catch (error) {
            await interaction.editReply({ content: '❌ Ban listesi alınırken hata oluştu!' });
        }
    }
    
    // ===== PANEL =====
    if (commandName === 'panel') {
        const staffLevel = isBoss(member) ? '👑 **BOSS**' : '👥 **OG**';
        const staffColor = isBoss(member) ? 0xFFD700 : 0x00FF00;

        const panelEmbed = new EmbedBuilder()
            .setColor(staffColor)
            .setTitle('🛡️ **BlackWell Moderasyon Paneli**')
            .setDescription(`
> ✨ Hoş geldin, ${member}!
> **Yetki Seviyen:** ${staffLevel}

\`\`\`ascii
╔════════════════════════════════════════════════════╗
║                  📋 PANEL BİLGİLERİ                ║
╠════════════════════════════════════════════════════╣
║ 🔨 Ban İşlemleri    - BOSS/OG                      ║
║ 👢 Kick İşlemleri   - BOSS/OG                      ║
║ 🔇 Mute İşlemleri   - BOSS/OG                      ║
║ ⚠️ Uyarı İşlemleri  - BOSS/OG                      ║
║ 📋 Ban Listesi      - BOSS/OG                      ║
║ 🧹 Mesaj Temizle    - BOSS/OG                      ║
║ 📜 Moderasyon Logları- BOSS/OG                     ║
║ 📢 Duyuru Gönderme  - BOSS/OG                      ║
║ ⚙️ Otorol Ayarları  - BOSS/OG                      ║
║ 🏷️ Tag Sistemi      - BOSS/OG                      ║
╚════════════════════════════════════════════════════╝
\`\`\`

**⬇️ İşlem yapmak için bir buton seçin ⬇️**
            `)
            .setThumbnail(guild.iconURL())
            .setImage(GIFS.welcome)
            .setFooter({ 
                text: `BlackWell Moderasyon • ${member.user.tag}`, 
                iconURL: member.user.displayAvatarURL() 
            })
            .setTimestamp();

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ban_menu')
                    .setLabel('🔨 Ban')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('kick_menu')
                    .setLabel('👢 Kick')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('mute_menu')
                    .setLabel('🔇 Mute')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('warn_menu')
                    .setLabel('⚠️ Uyarı')
                    .setStyle(ButtonStyle.Secondary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ban_list')
                    .setLabel('📋 Ban Listesi')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('clear_menu')
                    .setLabel('🧹 Mesaj Temizle')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('mod_logs')
                    .setLabel('📜 Moderasyon Logları')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('duyuru_menu')
                    .setLabel('📢 Duyuru')
                    .setStyle(ButtonStyle.Primary)
            );

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('otorol_menu')
                    .setLabel('⚙️ Otorol')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('tag_menu')
                    .setLabel('🏷️ Tag Sistemi')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('istatistik')
                    .setLabel('📊 İstatistik')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.reply({ embeds: [panelEmbed], components: [row1, row2, row3] });
    }
    
    // ===== DUYURU =====
    if (commandName === 'duyuru') {
        const duyuruMesaj = options.getString('mesaj');
        
        await interaction.reply({ content: '📨 Duyuru gönderiliyor, bu biraz zaman alabilir...', flags: MessageFlags.Ephemeral });
        
        const members = await guild.members.fetch();
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
                { name: '🏠 Sunucu', value: guild.name, inline: true },
                { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setThumbnail(guild.iconURL())
            .setImage(GIFS.success)
            .setFooter({ text: 'BlackWell Moderasyon', iconURL: guild.iconURL() })
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

        await sendLog(guild, sonucEmbed);
        await interaction.followUp({ embeds: [sonucEmbed], flags: MessageFlags.Ephemeral });

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
    }
    
    // ===== OTOROL AYARLA =====
    if (commandName === 'otorol-ayarla') {
        const role = options.getRole('rol');
        
        const botMember = guild.members.cache.get(client.user.id);
        if (botMember.roles.highest.position <= role.position) {
            return interaction.reply({ 
                content: '❌ Bu rolü veremem! Bot rolü, verilecek rolden **yüksek** olmalı!', 
                flags: MessageFlags.Ephemeral 
            });
        }
        
        otorol[guild.id] = role.id;
        fs.writeFileSync('./otorol.json', JSON.stringify(otorol, null, 2));
        
        await interaction.reply({ content: `✅ Otorol ${role} olarak ayarlandı!`, flags: MessageFlags.Ephemeral });
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('⚙️ Otorol Ayarlandı')
            .addFields(
                { name: '🎭 Rol', value: role.name, inline: true },
                { name: '👤 Ayarlayan', value: interaction.user.tag, inline: true }
            )
            .setImage(GIFS.success)
            .setTimestamp();
        
        await sendLog(guild, embed);
    }
    
    // ===== OTOROL KAPAT =====
    if (commandName === 'otorol-kapat') {
        if (!otorol[guild.id]) {
            return interaction.reply({ content: '❌ Bu sunucuda otorol ayarlı değil!', flags: MessageFlags.Ephemeral });
        }
        
        delete otorol[guild.id];
        fs.writeFileSync('./otorol.json', JSON.stringify(otorol, null, 2));
        
        await interaction.reply({ content: '✅ Otorol kapatıldı!', flags: MessageFlags.Ephemeral });
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('⚙️ Otorol Kapatıldı')
            .addFields(
                { name: '👤 Kapatan', value: interaction.user.tag, inline: true }
            )
            .setImage(GIFS.error)
            .setTimestamp();
        
        await sendLog(guild, embed);
    }
    
    // ===== TAG AYARLA =====
    if (commandName === 'tag-ayarla') {
        const tag = options.getString('tag');
        
        tagSistemi[guild.id] = tag;
        fs.writeFileSync('./tag.json', JSON.stringify(tagSistemi, null, 2));
        
        await interaction.reply({ content: `✅ Tag sistemi aktif! Yeni girenlere **${tag}** eklenecek.`, flags: MessageFlags.Ephemeral });
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🏷️ Tag Sistemi Ayarlandı')
            .addFields(
                { name: '📝 Tag', value: `\`${tag}\``, inline: true },
                { name: '👤 Ayarlayan', value: interaction.user.tag, inline: true }
            )
            .setImage(GIFS.success)
            .setTimestamp();
        
        await sendLog(guild, embed);
    }
    
    // ===== TAG KAPAT =====
    if (commandName === 'tag-kapat') {
        if (!tagSistemi[guild.id]) {
            return interaction.reply({ content: '❌ Tag sistemi zaten kapalı!', flags: MessageFlags.Ephemeral });
        }
        
        delete tagSistemi[guild.id];
        fs.writeFileSync('./tag.json', JSON.stringify(tagSistemi, null, 2));
        
        await interaction.reply({ content: '✅ Tag sistemi kapatıldı!', flags: MessageFlags.Ephemeral });
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🏷️ Tag Sistemi Kapatıldı')
            .addFields(
                { name: '👤 Kapatan', value: interaction.user.tag, inline: true }
            )
            .setImage(GIFS.error)
            .setTimestamp();
        
        await sendLog(guild, embed);
    }
});

// ===================== ÜYE GİRİŞ =====================
client.on('guildMemberAdd', async (member) => {
    console.log(`👋 ${member.user.tag} sunucuya katıldı!`);
    
    // Tag sistemi
    await checkAndAddTag(member);
    
    // Otorol
    if (otorol[member.guild.id]) {
        try {
            const role = await member.guild.roles.fetch(otorol[member.guild.id]);
            if (role) {
                await member.roles.add(role);
                console.log(`✅ Otorol verildi: ${member.user.tag} -> ${role.name}`);
            }
        } catch (error) {
            console.error('Otorol hatası:', error);
        }
    }
    
    // Canvas hoşgeldin kartı
    try {
        const welcomeBuffer = await createWelcomeCard(member);
        const attachment = { attachment: welcomeBuffer, name: 'welcome.png' };
        
        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✨ **Yeni Üye Katıldı** ✨')
            .setDescription(`${member.user.tag} aramıza katıldı!`)
            .setImage('attachment://welcome.png')
            .setTimestamp();
        
        const logChannel = await client.channels.fetch(config.logChannelId);
        if (logChannel) await logChannel.send({ embeds: [embed], files: [attachment] });
    } catch (error) {
        console.error('Canvas hatası:', error);
    }
});

// ===================== ÜYE AYRILMA =====================
client.on('guildMemberRemove', async (member) => {
    console.log(`👋 ${member.user.tag} sunucudan ayrıldı!`);
    
    try {
        const leaveBuffer = await createLeaveCard(member);
        const attachment = { attachment: leaveBuffer, name: 'leave.png' };
        
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('👋 **Üye Ayrıldı** 👋')
            .setDescription(`${member.user.tag} sunucumuzdan ayrıldı!`)
            .setImage('attachment://leave.png')
            .setTimestamp();
        
        const logChannel = await client.channels.fetch(config.logChannelId);
        if (logChannel) await logChannel.send({ embeds: [embed], files: [attachment] });
    } catch (error) {
        console.error('Canvas hatası:', error);
    }
});

// ===================== MESAJ SİLME LOG =====================
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

// ===================== MESAJ DÜZENLEME LOG =====================
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

// ===================== BUTON İŞLEMLERİ =====================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (!isStaff(interaction.member)) {
        return interaction.reply({ content: '❌ Bu işlem için yetkiniz yok!', flags: MessageFlags.Ephemeral });
    }

    // BAN LİSTESİ
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
            await interaction.editReply({ content: '❌ Ban listesi alınırken hata oluştu!' });
        }
    }
    
    // BAN MENÜSÜ
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

    // BAN SEÇİMİ
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
                await interaction.followUp({ content: '❌ Banlama başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ content: '⏰ Süre doldu, işlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }
        });
    }

    // KICK MENÜSÜ
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

    // KICK SEÇİMİ
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
                await interaction.followUp({ content: '❌ Kick işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ content: '⏰ Süre doldu, işlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }
        });
    }

    // MUTE MENÜSÜ
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

    // MUTE SEÇİMİ
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
                await interaction.followUp({ content: '❌ Mute işlemi başarısız! Hata: ' + error.message, flags: MessageFlags.Ephemeral });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.followUp({ content: '⏰ Süre doldu, işlem iptal edildi.', flags: MessageFlags.Ephemeral });
            }
        });
    }

    // UYARI MENÜSÜ
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

    // UYARI SEÇİMİ
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

    // MESAJ TEMİZLE
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

    // MODERASYON LOGLARI
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

    // DUYURU MENÜSÜ
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

    // İSTATİSTİK
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

    // OTOROL MENÜSÜ
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

    // OTOROL AYARLA
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

    // OTOROL KAPAT
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

    // OTOROL SORGULA
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

    // TAG MENÜSÜ
    if (interaction.customId === 'tag_menu') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tag_ayarla')
                    .setLabel('🏷️ Tag AYARLA')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🏷️'),
                new ButtonBuilder()
                    .setCustomId('tag_kapat')
                    .setLabel('🔴 Tag KAPAT')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔴'),
                new ButtonBuilder()
                    .setCustomId('tag_sorgula')
                    .setLabel('🔍 Tag SORGULA')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍')
            );

        await interaction.reply({
            content: '🏷️ **Tag işlemi seçin:**',
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    // TAG AYARLA
    if (interaction.customId === 'tag_ayarla') {
        await interaction.reply({
            content: '📝 **Tag olarak ayarlanacak metni yazın (örn: BLW |):**',
            flags: MessageFlags.Ephemeral
        });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });

        collector.on('collect', async (m) => {
            const tag = m.content;
            await m.delete().catch(() => {});

            tagSistemi[interaction.guild.id] = tag;
            fs.writeFileSync('./tag.json', JSON.stringify(tagSistemi, null, 2));

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🏷️ Tag Sistemi Ayarlandı')
                .setDescription(`✅ Tag **${tag}** olarak ayarlandı!`)
                .addFields(
                    { name: '📝 Tag', value: `\`${tag}\``, inline: true },
                    { name: '👤 Ayarlayan', value: interaction.user.tag, inline: true }
                )
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

    // TAG KAPAT
    if (interaction.customId === 'tag_kapat') {
        if (!tagSistemi[interaction.guild.id]) {
            return interaction.reply({ 
                content: '❌ Tag sistemi zaten kapalı!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        delete tagSistemi[interaction.guild.id];
        fs.writeFileSync('./tag.json', JSON.stringify(tagSistemi, null, 2));

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🏷️ Tag Sistemi Kapatıldı')
            .setDescription(`❌ Tag sistemi kapatıldı!`)
            .addFields(
                { name: '👤 Kapatan', value: interaction.user.tag, inline: true }
            )
            .setImage(GIFS.error)
            .setTimestamp();

        await sendLog(interaction.guild, embed);
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }

    // TAG SORGULA
    if (interaction.customId === 'tag_sorgula') {
        if (!tagSistemi[interaction.guild.id]) {
            return interaction.reply({ 
                content: '❌ Tag sistemi ayarlı değil!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const tag = tagSistemi[interaction.guild.id];

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🔍 Tag Sistemi Bilgisi')
            .addFields(
                { name: '📝 Aktif Tag', value: `\`${tag}\``, inline: true }
            )
            .setImage(GIFS.success)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
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
