const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const FROM = 'whatsapp:+14155238886'; // numer sandboxa Twilio

app.get('/', (req, res) => {
  res.send('WhatsApp Nudge Assistant działa 🚀');
});

app.post('/webhooks/whatsapp', async (req, res) => {
  const from = req.body.From;
  const text = req.body.Body;
  console.log('Odebrano:', from, text);

  await client.messages.create({
    from: FROM,
    to: from,
    body: `Dzięki, zapisałem: "${text}"`
  });

  res.sendStatus(200);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Serwer działa na porcie ${port}`));
