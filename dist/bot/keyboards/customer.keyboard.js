"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locationKeyboard = exports.contactKeyboard = exports.customerMainKeyboard = void 0;
const telegraf_1 = require("telegraf");
const customerMainKeyboard = () => telegraf_1.Markup.keyboard([['📦 Buyurtma berish'], ['ℹ️ Yordam']]).resize();
exports.customerMainKeyboard = customerMainKeyboard;
const contactKeyboard = () => telegraf_1.Markup.keyboard([
    [telegraf_1.Markup.button.contactRequest('📞 Telefon raqam yuborish')],
])
    .resize()
    .oneTime();
exports.contactKeyboard = contactKeyboard;
const locationKeyboard = () => telegraf_1.Markup.keyboard([
    [telegraf_1.Markup.button.locationRequest('📍 Lokatsiya yuborish')],
])
    .resize()
    .oneTime();
exports.locationKeyboard = locationKeyboard;
