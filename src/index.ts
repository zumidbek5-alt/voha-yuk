import { Telegraf, session, Scenes } from 'telegraf';
import { env } from './config/env';
import { customerMainKeyboard } from './bot/keyboards/customer.keyboard';
import { orderScene } from './bot/scenes/order.scene';
import { registerOrderActionHandlers } from './bot/handlers/order-actions.handler';
import { orderService } from './services/order.service';

const bot = new Telegraf<any>(env.BOT_TOKEN);

// Scene setup
const stage = new Scenes.Stage<any>([orderScene]);

bot.use(session());
bot.use(stage.middleware());

// START
bot.start(async (ctx) => {
  await ctx.reply(
    `Assalomu alaykum, ${ctx.from?.first_name || 'foydalanuvchi'}!\n\nVoha Yuk xizmatiga xush kelibsiz 🚚`,
    customerMainKeyboard()
  );
});

// ORDER START
bot.hears('📦 Buyurtma berish', async (ctx: any) => {
  await ctx.scene.enter('order-scene');
});

// HELP
bot.hears('ℹ️ Yordam', async (ctx) => {
  await ctx.reply(`Buyurtma berish uchun tugmani bosing.`);
});

// STATS
bot.command('stats', async (ctx) => {
  try {
    const stats = await orderService.getStats();
    const driverStats = await orderService.getDriverStats();

    let driverText = '';

    if (driverStats.length > 0) {
      driverText = driverStats
        .map(
          (driver, index) =>
            `${index + 1}. 🚚 ${driver.driverName}${
              driver.driverUsername ? ` (@${driver.driverUsername})` : ''
            }\n   📦 Olingan: ${driver.totalAssigned}\n   ✅ Yetkazilgan: ${driver.delivered}`
        )
        .join('\n\n');
    } else {
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
  } catch (error) {
    console.error(error);
    await ctx.reply('Statistikani olishda xatolik yuz berdi');
  }
});

// ORDER ACTION HANDLERS
registerOrderActionHandlers(bot);

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