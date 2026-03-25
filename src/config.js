require('dotenv').config();

const config = {
  brevoApiKey: process.env.BREVO_API_KEY,
  csvPath: './data/export.csv',
  emailListName: 'Panda Hill - Email Contacts',
  smsListName: 'Panda Hill - SMS Contacts',
  senderName: 'Panda Hill',
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'pandahilltx@gmail.com',
  smsSender: 'PandaHill',
  smsDelayMs: 100,
  logsDir: './logs',
};

if (!config.brevoApiKey || config.brevoApiKey === 'your-brevo-api-key-here') {
  console.error('ERROR: Please set BREVO_API_KEY in your .env file.');
  console.error('Get your key at: Brevo dashboard → Settings → SMTP & API → API Keys');
  process.exit(1);
}

module.exports = config;
