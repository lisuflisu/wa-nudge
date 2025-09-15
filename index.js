// index.js — wersja diagnostyczna z odpowiedzią TwiML (1 odpowiedź, zero duplikatów)

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();

// Twilio wysyła webhook jako application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Prosty healthcheck – sprawdzisz w przeglądarce
app.get('/', (req, res) => {
  res.send('WhatsApp Nudge Assistant działa 🚀');
});

// GŁÓWNY WEBHOOK
app.post('/webhooks/whatsapp', (req, res) => {
  const from = req.body.From;        // np. 'whatsapp:+48500040444'
  const text = req.body.Body || '';  // treść wiadomości
  console.log('Odebrano:', from, text);

  // ✅ Odpowiadamy TwiML-em (w treści odpowiedzi HTTP) — to będzie JEDYNA odpowiedź
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(`BOT: dzięki, zapisałem -> "${text}"`);

  res.type('text/xml').send(twiml.toString());
});

// Port z Railway (lub 8080 lokalnie)
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serwer działa na porcie ${port}`));
