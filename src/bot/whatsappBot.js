/**
 * whatsappBot.js — Everyday News automated WhatsApp bot
 * 
 * Running 24/7 in background to:
 * 1. Listen for user keywords (e.g. "STOP" to unsubscribe, "START" to subscribe)
 * 2. Schedule daily briefs (Morning: 8am, Afternoon: 2pm, Dawn/Noon: 8pm)
 * 3. Enforce strict 1-minute delay queue between user messages to avoid WhatsApp spam bans.
 */

import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import fs from 'fs';
import http from 'http';

// Supabase Setup
const SUPABASE_URL = 'https://thmndoeavlwhjvygmxys.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobW5kb2Vhdmx3aGp2eWdteHlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTczMDA2NCwiZXhwIjoyMDk3MzA2MDY0fQ.zBf0xoIH29BqF58rCcR_pgoDbRPOe1SII_ZNZ8jgO3M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

const logger = pino({ level: 'silent' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Local paths to your clean bulletin banners
const BANNER_PATHS = {
  morning: './src/bot/banners/morning.png',
  afternoon: './src/bot/banners/afternoon.png',
  dawn: './src/bot/banners/dawn.png'
};

// Keep track of sent broadcasts for today to avoid duplicate sends
const sentLogs = {
  morning: null,
  afternoon: null,
  dawn: null,
};

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  // Handle connection events
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('--- SCAN THE QR CODE BELOW TO LINK WHATSAPP ---');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut 
        : true;

      console.log('Connection closed due to error:', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('✅ WhatsApp Bot Connection opened successfully!');
    }
  });

  // Handle incoming messages
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const cleanMsg = body.trim().toUpperCase();
    const cleanPhone = from.replace(/[^0-9]/g, '');

    if (cleanMsg === 'STOP' || cleanMsg === 'UNSUBSCRIBE') {
      try {
        const { error } = await supabase
          .from('whatsapp_subscribers')
          .update({ active: false })
          .eq('phone_number', cleanPhone);

        if (error) throw error;
        await sock.sendMessage(from, { text: '🔕 You have unsubscribed from Everyday News updates. Reply "START" at any time to subscribe again.' });
        console.log(`[OPT-OUT] Unsubscribed phone number: ${cleanPhone}`);
      } catch (err) {
        console.error('Failed to unsubscribe user:', err.message);
      }
    } else if (cleanMsg === 'START' || cleanMsg === 'SUBSCRIBE') {
      try {
        const { error } = await supabase
          .from('whatsapp_subscribers')
          .upsert({ phone_number: cleanPhone, active: true }, { onConflict: 'phone_number' });

        if (error) throw error;
        await sock.sendMessage(from, { text: '🔔 Welcome to Everyday News! You will receive daily news briefs 3 times a day. Reply "STOP" to unsubscribe.' });
        console.log(`[OPT-IN] Subscribed phone number: ${cleanPhone}`);
      } catch (err) {
        console.error('Failed to subscribe user:', err.message);
      }
    } 
    // Trigger manual test broadcast to the user
    else if (cleanMsg === '!TEST' || cleanMsg === '!TESTBROADCAST') {
      console.log(`[TEST] Manual test broadcast triggered by ${cleanPhone}`);
      await runSingleBroadcast(sock, `${cleanPhone}@s.whatsapp.net`, 'morning');
    }
  });

  // Schedule checking loop (runs every 30 seconds)
  setInterval(async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const todayKey = now.toDateString();

    // 1. Morning Brief (8:00 AM)
    if (currentHour === 8 && currentMin === 0 && sentLogs.morning !== todayKey) {
      sentLogs.morning = todayKey;
      await runQueueBroadcast(sock, 'morning');
    }
    // 2. Afternoon Digest (2:00 PM / 14:00)
    else if (currentHour === 14 && currentMin === 0 && sentLogs.afternoon !== todayKey) {
      sentLogs.afternoon = todayKey;
      await runQueueBroadcast(sock, 'afternoon');
    }
    // 3. Dawn/Noon Bulletin (8:00 PM / 20:00)
    else if (currentHour === 20 && currentMin === 0 && sentLogs.dawn !== todayKey) {
      sentLogs.dawn = todayKey;
      await runQueueBroadcast(sock, 'dawn');
    }
  }, 30000);
}

// Generate the 14 news list (2 from each of the 7 categories)
async function compile14NewsList() {
  const categories = ['news', 'business', 'finance', 'sport', 'travel', 'tech', 'entertainment'];
  let list = [];
  
  // 1. Fetch 2 articles from each category
  for (const cat of categories) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, category')
        .eq('category', cat.toUpperCase())
        .order('created_at', { ascending: false })
        .limit(2);
        
      if (!error && data && data.length > 0) {
        list.push(...data);
      }
    } catch (err) {
      console.error(`Failed to fetch articles for category ${cat}:`, err.message);
    }
  }

  // 2. If list has less than 14 articles, fill it with the latest general articles
  if (list.length < 14) {
    const needed = 14 - list.length;
    const existingIds = list.map(a => a.id);
    const { data: fallbackArticles } = await supabase
      .from('articles')
      .select('id, slug, title, category')
      .not('id', 'in', `(${existingIds.join(',') || '0'})`)
      .order('created_at', { ascending: false })
      .limit(needed);
      
    if (fallbackArticles) {
      list.push(...fallbackArticles);
    }
  }

  return list.slice(0, 14); // Keep exactly 14
}

// Format the broadcast text message block
function formatBroadcastMessage(articles, slotName) {
  let emojiHeader = '🌅 MORNING BRIEF';
  if (slotName === 'afternoon') emojiHeader = '☀️ AFTERNOON DIGEST';
  if (slotName === 'dawn') emojiHeader = '🌌 DAWN BULLETIN';

  let message = `🔥 *EVERYDAY NEWS ${emojiHeader}* 🔥\n\n`;
  message += `Here are today's top stories:\n\n`;

  articles.forEach((art, idx) => {
    const artSlug = art.slug || slugify(art.title) || art.id;
    message += `${idx + 1}️⃣ *${art.title}*\n`;
    message += `👉 Read full gist: https://edaynews.vercel.app/article/${artSlug}\n\n`;
  });

  message += `---\n`;
  message += `🔔 Reply *STOP* to unsubscribe instantly at any time.`;
  return message;
}

// Send manual test broadcast to a single user (JID)
async function runSingleBroadcast(sock, targetJid, slotName) {
  try {
    const articles = await compile14NewsList();
    if (articles.length === 0) {
      await sock.sendMessage(targetJid, { text: '⚠️ No news stories found in the database.' });
      return;
    }

    const textPayload = formatBroadcastMessage(articles, slotName);
    const imagePath = BANNER_PATHS[slotName];

    if (fs.existsSync(imagePath)) {
      // Send image with caption containing the news list
      await sock.sendMessage(targetJid, {
        image: { url: imagePath },
        caption: textPayload
      });
      console.log(`[TEST SUCCESS] Test broadcast sent successfully to ${targetJid}`);
    } else {
      // Fallback to text message if image file is not found
      await sock.sendMessage(targetJid, { text: textPayload });
      console.log(`[TEST WARNING] Image not found, sent text fallback to ${targetJid}`);
    }
  } catch (err) {
    console.error('[TEST ERROR] Failed to send single test broadcast:', err.message);
  }
}

// Format and execute the queue broadcast to all active subscribers
async function runQueueBroadcast(sock, slotName) {
  console.log(`[BROADCAST] Running ${slotName.toUpperCase()} news broadcast...`);

  try {
    // 1. Fetch active subscribers
    const { data: subscribers, error: subErr } = await supabase
      .from('whatsapp_subscribers')
      .select('phone_number')
      .eq('active', true);

    if (subErr) throw subErr;
    if (!subscribers || subscribers.length === 0) {
      console.log('[BROADCAST] No active subscribers found. Skipping.');
      return;
    }

    // 2. Fetch 14 articles
    const articles = await compile14NewsList();
    if (articles.length === 0) {
      console.log('[BROADCAST] No news articles found. Skipping.');
      return;
    }

    const textPayload = formatBroadcastMessage(articles, slotName);
    const imagePath = BANNER_PATHS[slotName];
    const imageExists = fs.existsSync(imagePath);

    console.log(`[BROADCAST] Sending message to ${subscribers.length} users with a 1-minute safety delay queue...`);

    // 3. Send queue loop
    for (let i = 0; i < subscribers.length; i++) {
      const sub = subscribers[i];
      const jid = `${sub.phone_number}@s.whatsapp.net`;
      
      try {
        if (imageExists) {
          await sock.sendMessage(jid, {
            image: { url: imagePath },
            caption: textPayload
          });
        } else {
          await sock.sendMessage(jid, { text: textPayload });
        }
        console.log(`[SEND] Sent successfully to ${sub.phone_number} (${i + 1}/${subscribers.length})`);
      } catch (sendErr) {
        console.error(`[SEND ERROR] Failed to send to ${sub.phone_number}:`, sendErr.message);
      }

      // Enforce the strict 1-minute safety delay before sending to the next user
      if (i < subscribers.length - 1) {
        console.log(`[QUEUE] Waiting 60 seconds before next delivery...`);
        await sleep(60000);
      }
    }

    console.log(`[BROADCAST] Finished ${slotName} news delivery.`);
  } catch (err) {
    console.error('Error running broadcast process:', err.message);
  }
}

connectToWhatsApp();

// Start a dummy HTTP server so Render health checks pass
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Everyday News WhatsApp Bot is running!');
}).listen(PORT, () => {
  console.log(`HTTP Server listening on port ${PORT} to keep Render happy!`);
});
