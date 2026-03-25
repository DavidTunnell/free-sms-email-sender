const readline = require('readline');
const { parseCSV, printSummary } = require('./parseCSV');
const { runImport } = require('./importContacts');
const { runEmailCampaign } = require('./sendEmail');
const { runSMSCampaign } = require('./sendSMS');
const { runTestMode } = require('./testMode');
const config = require('./config');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function confirm(message) {
  const answer = await ask(`${message} (y/n): `);
  return answer.trim().toLowerCase() === 'y';
}

// Cache parsed data and list IDs across menu selections
let parsedData = null;
let emailListId = null;
let smsListId = null;

function ensureParsed() {
  if (!parsedData) {
    console.log('\nParsing CSV...');
    parsedData = parseCSV(config.csvPath);
  }
  return parsedData;
}

async function menuParsePreview() {
  const data = ensureParsed();
  printSummary(data);
}

async function menuImport() {
  const data = ensureParsed();
  console.log(`\nAbout to import ${data.emailContacts.length} email contacts and ${data.smsContacts.length} SMS contacts into Brevo.`);
  if (!(await confirm('Continue?'))) {
    console.log('Import cancelled.');
    return;
  }

  try {
    const result = await runImport(data.emailContacts, data.smsContacts);
    emailListId = result.emailListId;
    smsListId = result.smsListId;
  } catch (err) {
    console.error('\nImport failed:', err.body ? err.body.message : err.message);
  }
}

async function menuSendEmail() {
  if (!emailListId) {
    const idStr = await ask('Enter the Brevo email list ID (or run import first): ');
    emailListId = parseInt(idStr, 10);
    if (isNaN(emailListId)) {
      console.log('Invalid list ID.');
      return;
    }
  }

  const data = ensureParsed();
  console.log(`\nAbout to send email campaign to ${data.emailContacts.length} contacts (list ID: ${emailListId}).`);
  if (!(await confirm('Continue?'))) {
    console.log('Email campaign cancelled.');
    return;
  }

  try {
    await runEmailCampaign(emailListId);
  } catch (err) {
    console.error('\nEmail campaign failed:', err.body ? err.body.message : err.message);
  }
}

async function menuSendSMS() {
  const data = ensureParsed();
  console.log(`\nAbout to send SMS to ${data.smsContacts.length} contacts.`);
  console.log('NOTE: SMS requires purchased credits in your Brevo account (~$0.011/msg).');
  console.log(`Estimated cost: ~$${(data.smsContacts.length * 0.011).toFixed(2)}`);
  if (!(await confirm('Continue?'))) {
    console.log('SMS campaign cancelled.');
    return;
  }

  try {
    await runSMSCampaign(data.smsContacts);
  } catch (err) {
    console.error('\nSMS campaign failed:', err.body ? err.body.message : err.message);
  }
}

async function menuRunAll() {
  console.log('\n=== Running full pipeline: Import → Email → SMS ===');
  if (!(await confirm('This will import contacts and send both campaigns. Continue?'))) {
    console.log('Cancelled.');
    return;
  }

  await menuImport();
  if (emailListId) await menuSendEmail();
  await menuSendSMS();
}

async function main() {
  console.log('=== Panda Hill — Brevo Loyalty Campaign ===\n');

  while (true) {
    console.log('\n--- Menu ---');
    console.log('1. Parse & preview CSV data (dry run)');
    console.log('2. Import contacts into Brevo');
    console.log('3. Send email campaign');
    console.log('4. Send SMS campaign');
    console.log('5. Run all (import → email → SMS)');
    console.log('6. Test mode (send to yourself)');
    console.log('0. Exit\n');

    const choice = await ask('Choose an option: ');

    switch (choice.trim()) {
      case '1': await menuParsePreview(); break;
      case '2': await menuImport(); break;
      case '3': await menuSendEmail(); break;
      case '4': await menuSendSMS(); break;
      case '5': await menuRunAll(); break;
      case '6': await runTestMode(rl); break;
      case '0':
        console.log('Goodbye!');
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid option. Try again.');
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
