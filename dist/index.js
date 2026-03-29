"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const env_1 = require("./config/env");
const customer_keyboard_1 = require("./bot/keyboards/customer.keyboard");
const order_scene_1 = require("./bot/scenes/order.scene");
const order_actions_handler_1 = require("./bot/handlers/order-actions.handler");
const order_service_1 = require("./services/order.service");
const bot = new telegraf_1.Telegraf(env_1.env.BOT_TOKEN);
// Scene setup
const stage = new telegraf_1.Scenes.Stage([order_scene_1.orderScene]);
bot.use((0, telegraf_1.session)());
bot.use(stage.middleware());
// START
bot.start(async (ctx) => {
    await ctx.reply(`Assalomu alaykum, ${ctx.from?.first_name || 'foydalanuvchi'}!\n\nVoha Yuk xizmatiga xush kelibsiz 🚚`, (0, customer_keyboard_1.customerMainKeyboard)());
});
// ORDER START
bot.hears('📦 Buyurtma berish', async (ctx) => {
    await ctx.scene.enter('order-scene');
});
// HELP
bot.hears('ℹ️ Yordam', async (ctx) => {
    await ctx.reply(`Buyurtma berish uchun tugmani bosing.`);
});
// STATS
bot.command('stats', async (ctx) => {
    try {
        const stats = await order_service_1.orderService.getStats();
        const driverStats = await order_service_1.orderService.getDriverStats();
        let driverText = '';
        if (driverStats.length > 0) {
            driverText = driverStats
                .map((driver, index) => `${index + 1}. 🚚 ${driver.driverName}${driver.driverUsername ? ` (@${driver.driverUsername})` : ''}\n   📦 Olingan: ${driver.totalAssigned}\n   ✅ Yetkazilgan: ${driver.delivered}`)
                .join('\n\n');
        }
        else {
            driverText = 'Hozircha driver statistikasi yo‘q';
        }
        await ctx.reply(`📊 Voha Yuk statistikasi

📦 Jami orderlar: ${stats.total}
🆕 Yangi: ${stats.newOrders}
🚚 Olingan: ${stats.assigned}
✅ Yetkazilgan: ${stats.delivered}
❌ Bekor qilingan: ${stats.cancelled}

👨‍✈️ Driverlar statistikasi:
${driverText}`);
    }
    catch (error) {
        console.error(error);
        await ctx.reply('Statistikani olishda xatolik yuz berdi');
    }
});
// ORDER ACTION HANDLERS
(0, order_actions_handler_1.registerOrderActionHandlers)(bot);
// ✅ COMMAND MENU
(async () => {
    await bot.telegram.setMyCommands([
        { command: 'start', description: 'Botni ishga tushirish' },
        { command: 'order', description: 'Buyurtma berish' },
        { command: 'status', description: 'Buyurtma holati' },
        { command: 'help', description: 'Yordam' },
        { command: 'stats', description: 'Statistika' },
    ]);
    await bot.launch();
    console.log('🚀 Bot ishga tushdi');
})();
