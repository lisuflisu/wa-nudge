// index.js — wersja produkcyjna z tokenami Twilio (bez duplikatów)
// - odpowiedź idzie TYLKO przez REST API
// - webhook odpowiada pustym 200 (zero TwiML)
// - proste zabezpieczenie przed ponowieniami

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// ---- Konfiguracja ----
const ACCOUNT_SID = process.env.TWILIO_SID;          // ustawione w Railway
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;   // ustawione w Railway
const FROM = 'whatsapp:+14155238886';                // numer sandboxa Twilio

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// (opcjonalnie) walidacja podpisu Twilio — odkomentuj, gdy wszystko już działa stabilnie
// const urlencoded = require('body-parser').urlencoded({ extended: false });
// app.post('/webhooks/whatsapp', urlencoded, (req, res, next) => {
//   const signature = req.headers['x-twilio-signature'];
//   const valid = twilio.validateRequest(AUTH_TOKEN, signature, process.env.PUBLIC_WEBHOOK_URL, req.body);
//   if (!valid) return res.sendStatus(403);
//   next();
// });

// Healthcheck
app.get('/', (req, res) => res.send('WhatsApp Nudge Assistant (REST) działa 🚀'));

// GŁÓWNY WEBHOOK
app.post('/webhooks/whatsapp', async (req, res) => {
  const raw  = req.body.Body || '';
  const from = req.body.From || '';

  // 1) Proste wykrycie ponowień webhooka (np. sieć) – Twilio dosyła nagłówek retry
  const retryCount = parseInt(req.headers['x-twilio-retry-count'] || '0', 10);
  if (retryCount > 0) {
    console.log('[SKIP] Retry webhook, nie wysyłam ponownie:', retryCount, from, raw);
    return res.sendStatus(200);
  }

  console.log('[IN ]', from, raw);

  // 2) Tu robisz logikę bota — na razie echo + komendy testowe
  let reply;
  const text = raw.trim().toLowerCase();
  if (text === 'ping') reply = 'pong ✅';
  else if (text === 'help' || text === 'komendy') reply = 'Komendy: ping, help';
  else reply = `BOT: dzięki, zapisałem -> "${raw}"`;

  // 3) Wyślij JEDNĄ odpowiedź przez REST API
  try {
    await client.messages.create({
      from: FROM,
      to: from,
      body: reply
    });
    console.log('[OUT]', reply);
  } catch (e) {
    console.error('Błąd wysyłki przez Twilio:', e.message);
  }

  // 4) Zwracamy puste 200 (bez TwiML) -> to zapobiega drugiej wiadomości
  res.sendStatus(200);
});

// Port
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serwer działa na porcie ${port}`));
