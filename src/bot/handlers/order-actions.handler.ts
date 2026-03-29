import { Telegraf } from 'telegraf';
import { orderService } from '../../services/order.service';
import { formatOrderMessage } from '../../utils/format-order';
import { assignedOrderKeyboard } from '../keyboards/group.keyboard';

export function registerOrderActionHandlers(bot: Telegraf<any>) {
  // ✅ QABUL QILISH
  bot.action(/^accept_(\d+)$/, async (ctx) => {
    try {
      const orderId = Number(ctx.match[1]);

      if (!ctx.from) {
        await ctx.answerCbQuery('Foydalanuvchi topilmadi');
        return;
      }

      const existingOrder = await orderService.getOrderById(orderId);

      if (!existingOrder) {
        await ctx.answerCbQuery('Buyurtma topilmadi');
        return;
      }

      // Agar allaqachon olingan bo‘lsa
      if (existingOrder.status !== 'new') {
        await ctx.answerCbQuery('Bu buyurtma allaqachon boshqa driver tomonidan olingan');
        return;
      }

      const updatedOrder = await orderService.assignOrder(
        orderId,
        ctx.from.id,
        ctx.from.username,
        ctx.from.first_name
      );

      if (!updatedOrder) {
        await ctx.answerCbQuery('Bu buyurtma allaqachon olingan');
        return;
      }

      await ctx.editMessageText(formatOrderMessage(updatedOrder), {
        reply_markup: assignedOrderKeyboard(orderId).reply_markup,
      });

      await ctx.telegram.sendMessage(
        updatedOrder.customer_chat_id,
        `🚚 Buyurtmangizni driver qabul qildi!\n\n👤 Driver: ${ctx.from.first_name}${
          ctx.from.username ? ` (@${ctx.from.username})` : ''
        }\n📦 Buyurtma ID: ${orderId}`
      );

      await ctx.answerCbQuery('Buyurtma sizga biriktirildi');
    } catch (error) {
      console.error('Accept order error:', error);
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  });

  // ❌ BEKOR QILISH
  bot.action(/^cancel_(\d+)$/, async (ctx) => {
    try {
      const orderId = Number(ctx.match[1]);

      const existingOrder = await orderService.getOrderById(orderId);

      if (!existingOrder) {
        await ctx.answerCbQuery('Buyurtma topilmadi');
        return;
      }

      // faqat NEW order cancel bo‘lsin
      if (existingOrder.status !== 'new') {
        await ctx.answerCbQuery('Bu buyurtmani endi bekor qilib bo‘lmaydi');
        return;
      }

      const updatedOrder = await orderService.cancelOrder(orderId);

      if (!updatedOrder) {
        await ctx.answerCbQuery('Buyurtma topilmadi');
        return;
      }

      await ctx.editMessageText(formatOrderMessage(updatedOrder));

      await ctx.telegram.sendMessage(
        updatedOrder.customer_chat_id,
        `❌ Buyurtmangiz bekor qilindi.\n\n📦 Buyurtma ID: ${orderId}`
      );

      await ctx.answerCbQuery('Buyurtma bekor qilindi');
    } catch (error) {
      console.error('Cancel order error:', error);
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  });

  // ✅ YETKAZILDI
  bot.action(/^delivered_(\d+)$/, async (ctx) => {
    try {
      const orderId = Number(ctx.match[1]);

      if (!ctx.from) {
        await ctx.answerCbQuery('Foydalanuvchi topilmadi');
        return;
      }

      const existingOrder = await orderService.getOrderById(orderId);

      if (!existingOrder) {
        await ctx.answerCbQuery('Buyurtma topilmadi');
        return;
      }

      // faqat shu orderni olgan driver delivered qila olsin
      if (existingOrder.assigned_driver_id !== ctx.from.id) {
        await ctx.answerCbQuery('Faqat shu buyurtmani olgan driver uni yetkazildi deb belgilay oladi');
        return;
      }

      if (existingOrder.status !== 'assigned') {
        await ctx.answerCbQuery('Bu buyurtma yetkazish holatida emas');
        return;
      }

      const updatedOrder = await orderService.markDelivered(orderId);

      if (!updatedOrder) {
        await ctx.answerCbQuery('Buyurtma topilmadi');
        return;
      }

      await ctx.editMessageText(formatOrderMessage(updatedOrder));

      await ctx.telegram.sendMessage(
        updatedOrder.customer_chat_id,
        `✅ Buyurtmangiz yetkazildi!\n\n📦 Buyurtma ID: ${orderId}`
      );

      await ctx.answerCbQuery('Buyurtma yetkazildi deb belgilandi');
    } catch (error) {
      console.error('Delivered order error:', error);
      await ctx.answerCbQuery('Xatolik yuz berdi');
    }
  });
}