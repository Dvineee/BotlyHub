
/**
 * BotlyHub V3 - Telegram Bot Core (Node.js)
 * Kütüphane: telegraf
 * Veritabanı: @supabase/supabase-js
 */

const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Yapılandırma
const BOT_TOKEN = 'YOUR_BOT_TOKEN_FROM_BOTFATHER';
const MINI_APP_URL = 'https://your-frontend-url.com'; // Uygulamanızın yayınlandığı URL
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * 1. KARŞILAMA MANTIĞI
 * Kullanıcı botu başlattığında Mini App butonunu gösterir.
 */
bot.start(async (ctx) => {
    const name = ctx.from.first_name;
    const welcomeMsg = `👋 Merhaba ${name}!\n\nBotlyHub V3 Market'e hoş geldin. Buradan botlarını yönetebilir, yeni botlar keşfedebilir ve kanal gelirlerini takip edebilirsin.`;

    return ctx.replyWithHTML(welcomeMsg, Markup.inlineKeyboard([
        [Markup.button.webApp('🚀 Market'i Aç', MINI_APP_URL)],
        [Markup.button.url('📢 Resmi Kanal', 'https://t.me/your_channel')]
    ]));
});

/**
 * 2. KANAL KEŞİF (DISCOVERY) MANTIĞI
 * Bot bir kanala eklendiğinde bu veriyi Supabase'e "İmzasız" olarak atar.
 * Daha sonra Web App üzerinden kullanıcı "Senkronize Et" dediğinde bu loglar sahiplenilir.
 */
bot.on('my_chat_member', async (ctx) => {
    const chat = ctx.myChatMember.chat;
    const status = ctx.myChatMember.new_chat_member.status;
    const ownerId = ctx.myChatMember.from.id; // Botu ekleyen kişi (Potansiyel sahip)

    // Bot bir kanala admin olarak eklendiyse
    if ((chat.type === 'channel' || chat.type === 'group' || chat.type === 'supergroup') && status === 'administrator') {
        
        try {
            // Kanal bilgilerini al
            const memberCount = await ctx.getChatMembersCount();
            let chatPhoto = '';
            
            if (chat.photo) {
                // Not: Gerçek senaryoda file_id üzerinden file_path alınıp URL oluşturulur
                chatPhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.title)}&background=1e293b&color=fff`;
            }

            // Supabase'e Keşif Logu At (Discovery)
            const { error } = await supabase.from('bot_discovery_logs').insert({
                owner_id: ownerId.toString(),
                bot_id: ctx.botInfo.id.toString(), // Mevcut botun ID'si
                chat_id: chat.id.toString(),
                channel_name: chat.title,
                channel_icon: chatPhoto,
                member_count: memberCount,
                is_synced: false,
                created_at: new Date().toISOString()
            });

            if (!error) {
                console.log(`[Discovery] Yeni kanal kaydedildi: ${chat.title}`);
                // Sahibe bilgi ver (Sadece botu ekleyen kişiye)
                await ctx.telegram.sendMessage(ownerId, `✅ <b>${chat.title}</b> başarıyla algılandı!\n\nKanalını yönetmek için BotlyHub uygulamasını açıp 'Kanallarım' sekmesinden senkronize edebilirsin.`, { parse_mode: 'HTML' });
            }
        } catch (err) {
            console.error('Discovery Log Error:', err);
        }
    }
});

// Botu Başlat
bot.launch();
console.log('--- BotlyHub V3 Core Aktif ---');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
