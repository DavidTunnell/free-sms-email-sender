const twilio = require('twilio');
const config = require('./config');

let client = null;

function getClient() {
  if (!client) {
    if (!config.twilioAccountSid || !config.twilioAuthToken) {
      throw new Error(
        'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env'
      );
    }
    client = twilio(config.twilioAccountSid, config.twilioAuthToken);
  }
  return client;
}

async function sendSMS(to, body) {
  const message = await getClient().messages.create({
    body,
    from: config.twilioPhoneNumber,
    to,
  });
  return { messageId: message.sid, status: message.status };
}

module.exports = { sendSMS };
