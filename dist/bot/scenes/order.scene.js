"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderScene = void 0;
const telegraf_1 = require("telegraf");
const customer_keyboard_1 = require("../keyboards/customer.keyboard");
const order_service_1 = require("../../services/order.service");
const format_order_1 = require("../../utils/format-order");
const group_keyboard_1 = require("../keyboards/group.keyboard");
const env_1 = require("../../config/env");
exports.orderScene = new telegraf_1.Scenes.WizardScene('order-scene', 
// STEP 1: telefon
async (ctx) => {
    await ctx.reply('📞 Iltimos, telefon raqamingizni yuboring:', (0, customer_keyboard_1.contactKeyboard)());
    return ctx.wizard.next();
}, 
// STEP 2: telefonni olish
async (ctx) => {
    if (!ctx.message || !('contact' in ctx.message)) {
        await ctx.reply('❗ Iltimos, tugma orqali telefon yuboring');
        return;
    }
    ctx.session.phone = ctx.message.contact.phone_number;
    await ctx.reply(`📍 Lokatsiyangizni yuboring yoki manzilingizni yozib yuboring:\n\nMisol: Urganch shahar, Al-Xorazmiy ko‘chasi 25-uy`, (0, customer_keyboard_1.locationKeyboard)());
    return ctx.wizard.next();
}, 
// STEP 3: lokatsiya yoki manzil text
async (ctx) => {
    if (!ctx.message) {
        await ctx.reply('❗ Iltimos, lokatsiya yoki manzil yuboring');
        return;
    }
    // Agar lokatsiya yuborsa
    if ('location' in ctx.message) {
        ctx.session.location = {
            latitude: ctx.message.location.latitude,
            longitude: ctx.message.location.longitude,
        };
        ctx.session.pickupAddress = 'Lokatsiya yuborilgan';
    }
    // Agar text yuborsa
    else if ('text' in ctx.message) {
        ctx.session.pickupAddress = ctx.message.text;
    }
    else {
        await ctx.reply('❗ Iltimos, lokatsiya yoki manzil yuboring');
        return;
    }
    await ctx.reply('📦 Nima kerak? Buyurtmani yozing:');
    return ctx.wizard.next();
}, 
// STEP 4: buyurtma
async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply('❗ Iltimos, buyurtmani yozing');
        return;
    }
    if (!ctx.from) {
        await ctx.reply('❌ Foydalanuvchi ma’lumoti topilmadi');
        return ctx.scene.leave();
    }
    ctx.session.text = ctx.message.text;
    const order = await order_service_1.orderService.createOrder({
        customer_chat_id: ctx.from.id,
        customer_name: ctx.from.first_name,
        customer_phone: ctx.session.phone,
        customer_username: ctx.from.username,
        pickup_lat: ctx.session.location?.latitude,
        pickup_lng: ctx.session.location?.longitude,
        pickup_address: ctx.session.pickupAddress,
        order_text: ctx.session.text,
    });
    // mijozga javob
    await ctx.reply(`✅ Buyurtmangiz qabul qilindi!\nID: ${order.id}`);
    // groupga yuborish
    const groupMsg = await ctx.telegram.sendMessage(env_1.env.DRIVER_GROUP_ID, (0, format_order_1.formatOrderMessage)(order), {
        reply_markup: (0, group_keyboard_1.driverOrderKeyboard)(order.id).reply_markup,
    });
    // group message id saqlash
    await order_service_1.orderService.updateGroupMessageId(order.id, groupMsg.message_id);
    // session clear
    ctx.session.phone = undefined;
    ctx.session.location = undefined;
    ctx.session.pickupAddress = undefined;
    ctx.session.text = undefined;
    return ctx.scene.leave();
});
