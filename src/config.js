require('dotenv').config();

const config = {
  brevoApiKey: process.env.BREVO_API_KEY,
  csvPath: './data/export.csv',
  emailListName: 'Panda Hill - Email Contacts',
  smsListName: 'Panda Hill - SMS Contacts',
  senderName: 'Panda Hill',
  senderEmail: process.env.BREVO_SENDER_EMAIL || 'davidtunnell9@gmail.com',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  smsDelayMs: 100,
  logsDir: './logs',
  squareAccessToken: process.env.SQUARE_ACCESS_TOKEN,
  squareEnvironment: process.env.SQUARE_ENVIRONMENT || 'production',
  exclusionCsvPath: process.env.EXCLUSION_CSV_PATH || './data/exclusion.csv',
};

if (!config.brevoApiKey || config.brevoApiKey === 'your-brevo-api-key-here') {
  console.error('ERROR: Please set BREVO_API_KEY in your .env file.');
  console.error('Get your key at: Brevo dashboard → Settings → SMTP & API → API Keys');
  process.exit(1);
}

module.exports = config;
