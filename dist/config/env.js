"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    DRIVER_GROUP_ID: process.env.DRIVER_GROUP_ID,
};
if (!exports.env.BOT_TOKEN || !exports.env.SUPABASE_URL || !exports.env.SUPABASE_ANON_KEY) {
    throw new Error('ENV o‘zgaruvchilar to‘liq emas');
}
