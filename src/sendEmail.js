const { createAndSendEmailCampaign } = require('./brevoClient');
const config = require('./config');
const { EMAIL_SUBJECT, EMAIL_HTML } = require('./templates');

async function runEmailCampaign(emailListId) {
  console.log('\nSending email campaign...');
  console.log(`  Subject: ${EMAIL_SUBJECT}`);
  console.log(`  Sender: ${config.senderName} <${config.senderEmail}>`);
  console.log(`  Target list ID: ${emailListId}`);

  const campaignId = await createAndSendEmailCampaign(
    emailListId,
    EMAIL_SUBJECT,
    EMAIL_HTML,
    config.senderName,
    config.senderEmail
  );

  console.log(`\nEmail campaign sent successfully! Campaign ID: ${campaignId}`);
  return campaignId;
}

module.exports = { runEmailCampaign };
