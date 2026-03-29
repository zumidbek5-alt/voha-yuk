import { Scenes } from 'telegraf';
import { contactKeyboard, locationKeyboard } from '../keyboards/customer.keyboard';
import { orderService } from '../../services/order.service';
import { formatOrderMessage } from '../../utils/format-order';
import { driverOrderKeyboard } from '../keyboards/group.keyboard';
import { env } from '../../config/env';

export const orderScene = new Scenes.WizardScene<any>(
  'order-scene',

  // STEP 1: telefon
  async (ctx) => {
    await ctx.reply('📞 Iltimos, telefon raqamingizni yuboring:', contactKeyboard());
    return ctx.wizard.next();
  },

  // STEP 2: telefonni olish
  async (ctx) => {
    if (!ctx.message || !('contact' in ctx.message)) {
      await ctx.reply('❗ Iltimos, tugma orqali telefon yuboring');
      return;
    }

    ctx.session.phone = ctx.message.contact.phone_number;

    await ctx.reply(
      `📍 Lokatsiyangizni yuboring yoki manzilingizni yozib yuboring:\n\nMisol: Urganch shahar, Al-Xorazmiy ko‘chasi 25-uy`,
      locationKeyboard()
    );
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

    const order = await orderService.createOrder({
      customer_chat_id: ctx.from.id,
      customer_name: ctx.from.first_name,
      customer_phone: ctx.session.phone!,
      customer_username: ctx.from.username,

      pickup_lat: ctx.session.location?.latitude,
      pickup_lng: ctx.session.location?.longitude,
      pickup_address: ctx.session.pickupAddress,

      order_text: ctx.session.text!,
    });

    // mijozga javob
    await ctx.reply(`✅ Buyurtmangiz qabul qilindi!\nID: ${order.id}`);

    // groupga yuborish
    const groupMsg = await ctx.telegram.sendMessage(
      env.DRIVER_GROUP_ID,
      formatOrderMessage(order),
      {
        reply_markup: driverOrderKeyboard(order.id).reply_markup,
      }
    );

    // group message id saqlash
    await orderService.updateGroupMessageId(order.id, groupMsg.message_id);

    // session clear
    ctx.session.phone = undefined;
    ctx.session.location = undefined;
    ctx.session.pickupAddress = undefined;
    ctx.session.text = undefined;

    return ctx.scene.leave();
  }
);