const brevo = require('@getbrevo/brevo');
const { sendTransactionalSMS } = require('./brevoClient');
const config = require('./config');
const { EMAIL_SUBJECT, EMAIL_HTML, SMS_CONTENT } = require('./templates');

function getTestContact() {
  const email = process.env.TEST_EMAIL || '';
  const phone = process.env.TEST_PHONE || '';
  const firstName = process.env.TEST_FIRST_NAME || '';

  if (!email && !phone) {
    throw new Error(
      'No test contact configured. Set TEST_EMAIL and/or TEST_PHONE in your .env file.'
    );
  }

  return { email: email || null, phone: phone || null, firstName };
}

async function sendTestEmail(contact) {
  const transactionalEmailApi = new brevo.TransactionalEmailsApi();
  transactionalEmailApi.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    config.brevoApiKey
  );

  // Replace campaign merge tag with actual name for transactional send
  const personalizedHtml = EMAIL_HTML.replace(
    /\{\{contact\.FIRSTNAME\}\}/g,
    contact.firstName || ''
  );

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: config.senderName, email: config.senderEmail };
  sendSmtpEmail.to = [{ email: contact.email, name: contact.firstName || '' }];
  sendSmtpEmail.subject = EMAIL_SUBJECT;
  sendSmtpEmail.htmlContent = personalizedHtml;
  sendSmtpEmail.replyTo = { email: config.senderEmail };
  sendSmtpEmail.tags = ['test-mode'];

  const result = await transactionalEmailApi.sendTransacEmail(sendSmtpEmail);
  return result;
}

async function sendTestSMS(contact) {
  const result = await sendTransactionalSMS(contact.phone, SMS_CONTENT, config.smsSender);
  return result;
}

async function runTestMode(rl) {
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  let contact;
  try {
    contact = getTestContact();
  } catch (err) {
    console.log(`\n${err.message}`);
    return;
  }

  console.log('\n=== Test Mode — Send to Yourself ===');
  console.log(`  Email: ${contact.email || '(not configured)'}`);
  console.log(`  Phone: ${contact.phone || '(not configured)'}`);
  console.log(`  Name:  ${contact.firstName || '(not set)'}`);

  console.log('\nWhat would you like to test?');
  if (contact.email) console.log('  1. Send test email');
  if (contact.phone) console.log('  2. Send test SMS (~$0.01)');
  if (contact.email && contact.phone) console.log('  3. Send both');
  console.log('  0. Cancel');

  const choice = await ask('\nChoose: ');
  const sendEmail = choice === '1' || choice === '3';
  const sendSms = choice === '2' || choice === '3';

  if (choice === '0' || (!sendEmail && !sendSms)) {
    console.log('Cancelled.');
    return;
  }

  if (sendEmail && !contact.email) {
    console.log('No TEST_EMAIL configured in .env — skipping email.');
  }
  if (sendSms && !contact.phone) {
    console.log('No TEST_PHONE configured in .env — skipping SMS.');
  }

  // Send test email
  if (sendEmail && contact.email) {
    try {
      console.log(`\nSending test email to ${contact.email}...`);
      const result = await sendTestEmail(contact);
      console.log(`  Email sent! Message ID: ${result.messageId || JSON.stringify(result)}`);
    } catch (err) {
      const msg = err.body ? JSON.stringify(err.body) : err.message;
      console.error(`  Email failed: ${msg}`);
    }
  }

  // Send test SMS
  if (sendSms && contact.phone) {
    try {
      console.log(`\nSending test SMS to ${contact.phone}...`);
      const result = await sendTestSMS(contact);
      console.log(`  SMS sent! Message ID: ${result.messageId || JSON.stringify(result)}`);
    } catch (err) {
      const msg = err.body ? JSON.stringify(err.body) : err.message;
      console.error(`  SMS failed: ${msg}`);
    }
  }

  console.log('\nTest complete! Check your inbox/phone.');
}

module.exports = { runTestMode, getTestContact, sendTestEmail, sendTestSMS };
