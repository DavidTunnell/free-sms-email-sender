const fs = require('fs');
const path = require('path');
const { sendSMS } = require('./twilioClient');
const config = require('./config');
const { SMS_CONTENT } = require('./templates');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSMSCampaign(smsContacts) {
  console.log(`\nSending SMS to ${smsContacts.length} contacts...`);
  console.log(`  Sender: ${config.twilioPhoneNumber}`);
  console.log(`  Message (${SMS_CONTENT.length} chars): ${SMS_CONTENT}`);
  console.log('');

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < smsContacts.length; i++) {
    const contact = smsContacts[i];
    const phone = contact.phone;

    try {
      const result = await sendSMS(phone, SMS_CONTENT);
      successCount++;
      results.push({ phone, status: 'success', messageId: result.messageId || null });

      if ((i + 1) % 50 === 0 || i === smsContacts.length - 1) {
        console.log(`  Progress: ${i + 1}/${smsContacts.length} (${successCount} sent, ${failCount} failed)`);
      }
    } catch (err) {
      failCount++;
      const errorMsg = err.body ? err.body.message : err.message;
      results.push({ phone, status: 'failed', error: errorMsg });

      // Exponential backoff on rate limit (429)
      if (err.status === 429) {
        const backoff = Math.min(2000 * Math.pow(2, failCount), 30000);
        console.log(`  Rate limited — waiting ${backoff}ms before retry...`);
        await sleep(backoff);
        // Retry this contact
        try {
          const retryResult = await sendSMS(phone, SMS_CONTENT);
          results[results.length - 1] = { phone, status: 'success', messageId: retryResult.messageId || null };
          successCount++;
          failCount--;
        } catch (retryErr) {
          // Keep the failure
        }
      }
    }

    // Rate limit: 100ms between sends
    if (i < smsContacts.length - 1) {
      await sleep(config.smsDelayMs);
    }
  }

  // Write results log
  const logsDir = path.resolve(config.logsDir);
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  const logPath = path.join(logsDir, 'sms-results.json');
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));

  console.log(`\nSMS campaign complete!`);
  console.log(`  Sent: ${successCount}`);
  console.log(`  Failed: ${failCount}`);
  console.log(`  Results log: ${logPath}`);

  return { successCount, failCount, results };
}

module.exports = { runSMSCampaign };
