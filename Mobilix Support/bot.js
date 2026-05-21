require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});

const ADMIN_ID = process.env.ADMIN_ID;

console.log('Mobilix Support Bot started');

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        'Вітаємо в підтримці Mobilix 👋\nОберіть потрібний розділ або напишіть своє питання.',
        {
            reply_markup: {
                keyboard: [
                    ['📦 Доставка', '💳 Оплата'],
                    ['🔄 Повернення', '🛡 Гарантія'],
                    ['🛒 Каталог', '🌐 Сайт'],
                    ['💬 Написати в підтримку']
                ],
                resize_keyboard: true
            }
        }
    );
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') return;

    if (text === '📦 Доставка') {
        return bot.sendMessage(chatId, '📦 Доставка Новою Поштою по Україні. Термін: 1–2 робочі дні.');
    }

    if (text === '💳 Оплата') {
        return bot.sendMessage(chatId, '💳 Оплата карткою, онлайн або післяплатою при отриманні.');
    }

    if (text === '🔄 Повернення') {
        return bot.sendMessage(chatId, '🔄 Повернення або обмін можливі протягом 14 днів після отримання.');
    }

    if (text === '🛡 Гарантія') {
        return bot.sendMessage(chatId, '🛡 Усі товари перевіряються перед відправкою. Якщо є проблема — напишіть нам.');
    }

    if (text === '🛒 Каталог') {
        return bot.sendMessage(chatId, '🛒 Каталог:\nhttps://ferentrix-dev.github.io/mobilix-store/');
    }

    if (text === '🌐 Сайт') {
        return bot.sendMessage(chatId, '🌐 Сайт Mobilix:\nhttps://ferentrix-dev.github.io/mobilix-store/');
    }

    if (text === '💬 Написати в підтримку') {
        return bot.sendMessage(chatId, 'Напишіть ваше питання одним повідомленням. Ми отримаємо його та відповімо.');
    }

    if (ADMIN_ID) {
        bot.sendMessage(ADMIN_ID,
            `📩 Нове звернення в підтримку Mobilix\n\n` +
            `👤 Користувач: ${msg.from.first_name || 'Без імені'}\n` +
            `🆔 ID: ${chatId}\n` +
            `💬 Повідомлення:\n${text}`
        );
    }

    bot.sendMessage(chatId, 'Дякуємо! Ваше повідомлення передано в підтримку Mobilix ✅');
});