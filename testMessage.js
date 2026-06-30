import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';

async function testMsg() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection } = update;
    if (connection === 'open') {
      console.log('Connected! Please send "!test" from +2349154403466 to the bot now.');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const cleanMsg = body.trim().toUpperCase();

    if (cleanMsg.includes('TEST') || cleanMsg.includes('HELLO')) {
      console.log("INCOMING MESSAGE OBJECT:");
      console.log(JSON.stringify(msg, null, 2));
      // Give buffer a second to flush before exiting
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    }
  });
}

testMsg();
