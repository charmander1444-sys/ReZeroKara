const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEB_APP_URL = 'https://re-zero-kara.vercel.app';

bot.command('ver', (ctx) => {
  return ctx.reply('¡Bienvenido al portal de Re:Zero!', {
    reply_markup: {
      inline_keyboard: [
        [
          { 
            text: "Abrir Biblioteca Re:Zero", 
            web_app: { url: WEB_APP_URL } 
          }
        ]
      ]
    }
  });
});

export default async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
};