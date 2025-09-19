const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Healthcheck / podgląd czy serwer żyje
app.get('/', (_req, res) => {
  res.status(200).send('Zuzia WhatsApp bot: OK');
});

// GŁÓWNY WEBHOOK dla WhatsApp (USTAW go w Twilio jako "When a message comes in")
app.post('/webhook', (req, res) => {
  const text = (req.body.Body || '').trim();
  const lower = text.toLowerCase();

  let reply = `BOT: dzięki, zapisałem -> "${text}"`;

  if (lower === 'ping') reply = 'pong ✅';
  if (lower === 'help' || lower === 'komendy') reply = 'Komendy: ping, help';

  // Budujemy TwiML i zwracamy 200 + XML
  const twiml = new MessagingResponse();
  twiml.message(reply);

  res.type('text/xml');
  res.status(200).send(twiml.toString());
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Zuzia WA bot działa na porcie ${port}`);
});
