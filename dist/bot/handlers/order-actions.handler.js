"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderActionHandlers = registerOrderActionHandlers;
const order_service_1 = require("../../services/order.service");
const format_order_1 = require("../../utils/format-order");
const group_keyboard_1 = require("../keyboards/group.keyboard");
function registerOrderActionHandlers(bot) {
    // ✅ QABUL QILISH
    bot.action(/^accept_(\d+)$/, async (ctx) => {
        try {
            const orderId = Number(ctx.match[1]);
            if (!ctx.from) {
                await ctx.answerCbQuery('Foydalanuvchi topilmadi');
                return;
            }
            const existingOrder = await order_service_1.orderService.getOrderById(orderId);
            if (!existingOrder) {
                await ctx.answerCbQuery('Buyurtma topilmadi');
                return;
            }
            // Agar allaqachon olingan bo‘lsa
            if (existingOrder.status !== 'new') {
                await ctx.answerCbQuery('Bu buyurtma allaqachon boshqa driver tomonidan olingan');
                return;
            }
            const updatedOrder = await order_service_1.orderService.assignOrder(orderId, ctx.from.id, ctx.from.username, ctx.from.first_name);
            if (!updatedOrder) {
                await ctx.answerCbQuery('Bu buyurtma allaqachon olingan');
                return;
            }
            await ctx.editMessageText((0, format_order_1.formatOrderMessage)(updatedOrder), {
                reply_markup: (0, group_keyboard_1.assignedOrderKeyboard)(orderId).reply_markup,
            });
            await ctx.telegram.sendMessage(updatedOrder.customer_chat_id, `🚚 Buyurtmangizni driver qabul qildi!\n\n👤 Driver: ${ctx.from.first_name}${ctx.from.username ? ` (@${ctx.from.username})` : ''}\n📦 Buyurtma ID: ${orderId}`);
            await ctx.answerCbQuery('Buyurtma sizga biriktirildi');
        }
        catch (error) {
            console.error('Accept order error:', error);
            await ctx.answerCbQuery('Xatolik yuz berdi');
        }
    });
    // ❌ BEKOR QILISH
    bot.action(/^cancel_(\d+)$/, async (ctx) => {
        try {
            const orderId = Number(ctx.match[1]);
            const existingOrder = await order_service_1.orderService.getOrderById(orderId);
            if (!existingOrder) {
                await ctx.answerCbQuery('Buyurtma topilmadi');
                return;
            }
            // faqat NEW order cancel bo‘lsin
            if (existingOrder.status !== 'new') {
                await ctx.answerCbQuery('Bu buyurtmani endi bekor qilib bo‘lmaydi');
                return;
            }
            const updatedOrder = await order_service_1.orderService.cancelOrder(orderId);
            if (!updatedOrder) {
                await ctx.answerCbQuery('Buyurtma topilmadi');
                return;
            }
            await ctx.editMessageText((0, format_order_1.formatOrderMessage)(updatedOrder));
            await ctx.telegram.sendMessage(updatedOrder.customer_chat_id, `❌ Buyurtmangiz bekor qilindi.\n\n📦 Buyurtma ID: ${orderId}`);
            await ctx.answerCbQuery('Buyurtma bekor qilindi');
        }
        catch (error) {
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
            const existingOrder = await order_service_1.orderService.getOrderById(orderId);
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
            const updatedOrder = await order_service_1.orderService.markDelivered(orderId);
            if (!updatedOrder) {
                await ctx.answerCbQuery('Buyurtma topilmadi');
                return;
            }
            await ctx.editMessageText((0, format_order_1.formatOrderMessage)(updatedOrder));
            await ctx.telegram.sendMessage(updatedOrder.customer_chat_id, `✅ Buyurtmangiz yetkazildi!\n\n📦 Buyurtma ID: ${orderId}`);
            await ctx.answerCbQuery('Buyurtma yetkazildi deb belgilandi');
        }
        catch (error) {
            console.error('Delivered order error:', error);
            await ctx.answerCbQuery('Xatolik yuz berdi');
        }
    });
}
