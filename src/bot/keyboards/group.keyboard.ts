import { Markup } from 'telegraf';

export const driverOrderKeyboard = (orderId: number) =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Qabul qilish', `accept_${orderId}`),
      Markup.button.callback('❌ Bekor qilish', `cancel_${orderId}`),
    ],
  ]);

export const assignedOrderKeyboard = (orderId: number) =>
  Markup.inlineKeyboard([
    [Markup.button.callback('✅ Yetkazildi', `delivered_${orderId}`)],
  ]);