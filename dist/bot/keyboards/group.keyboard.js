"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignedOrderKeyboard = exports.driverOrderKeyboard = void 0;
const telegraf_1 = require("telegraf");
const driverOrderKeyboard = (orderId) => telegraf_1.Markup.inlineKeyboard([
    [
        telegraf_1.Markup.button.callback('✅ Qabul qilish', `accept_${orderId}`),
        telegraf_1.Markup.button.callback('❌ Bekor qilish', `cancel_${orderId}`),
    ],
]);
exports.driverOrderKeyboard = driverOrderKeyboard;
const assignedOrderKeyboard = (orderId) => telegraf_1.Markup.inlineKeyboard([
    [telegraf_1.Markup.button.callback('✅ Yetkazildi', `delivered_${orderId}`)],
]);
exports.assignedOrderKeyboard = assignedOrderKeyboard;
