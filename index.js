// index.js — wersja z prostymi komendami testowymi (ping, help)
// Odpowiadamy TwiML-em, więc wychodzi TYLKO jedna wiadomość z webhooka.

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();

// Twilio wysyła webhook jako application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Healthcheck — po wejściu w URL pokaże, że serwer żyje
app.get('/', (req, res) => {
  res.send('WhatsApp Nudge Assistant działa 🚀');
});

// GŁÓWNY WEBHOOK DLA WHATSAPP
app.post('/webhooks/whatsapp', (req, res) => {
  const raw = req.body.Body || '';
  const text = raw.trim().toLowerCase();
  const from = req.body.From || '';
  console.log(`[IN] ${from}: ${raw}`);

  const twiml = new twilio.twiml.MessagingResponse();

  // ✅ Szybkie komendy do testów
  if (text === 'ping') {
    twiml.message('pong ✅');
  } else if (text === 'help' || text === 'komendy') {
    twiml.message('Komendy: ping, help\nPoza tym odpisuję: BOT: dzięki, zapisałem -> "..."');
  } else {
    // Domyślna odpowiedź (echo)
    twiml.message(`BOT: dzięki, zapisałem -> "${raw}"`);
  }

  // Odpowiadamy TwiML-em — to jest JEDYNA odpowiedź
  res.type('text/xml').send(twiml.toString());
});

// Port dostarczany przez Railway (lokalnie 8080)
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serwer działa na porcie ${port}`));
