import { Markup } from 'telegraf';

export const customerMainKeyboard = () =>
  Markup.keyboard([['📦 Buyurtma berish'], ['ℹ️ Yordam']]).resize();

export const contactKeyboard = () =>
  Markup.keyboard([
    [Markup.button.contactRequest('📞 Telefon raqam yuborish')],
  ])
    .resize()
    .oneTime();

export const locationKeyboard = () =>
  Markup.keyboard([
    [Markup.button.locationRequest('📍 Lokatsiya yuborish')],
  ])
    .resize()
    .oneTime();