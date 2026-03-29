import dotenv from 'dotenv';

dotenv.config();

export const env = {
  BOT_TOKEN: process.env.BOT_TOKEN!,
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  DRIVER_GROUP_ID: process.env.DRIVER_GROUP_ID!,
};

if (!env.BOT_TOKEN || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('ENV o‘zgaruvchilar to‘liq emas');
}