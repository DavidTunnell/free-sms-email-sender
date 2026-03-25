const {
  createContactList,
  createContactAttribute,
  importContacts,
} = require('./brevoClient');
const config = require('./config');

async function ensureCustomAttributes() {
  console.log('Ensuring custom contact attributes exist...');
  await createContactAttribute('normal', 'TRANSACTION_COUNT', 'float');
  await createContactAttribute('normal', 'LIFETIME_SPEND', 'float');
  await createContactAttribute('normal', 'SQUARE_ID', 'text');
}

async function runImport(emailContacts, smsContacts) {
  // 1. Create custom attributes
  await ensureCustomAttributes();

  // 2. Create contact lists
  console.log('\nCreating contact lists...');
  const emailListId = await createContactList(config.emailListName);
  console.log(`  Email list created: "${config.emailListName}" (ID: ${emailListId})`);

  const smsListId = await createContactList(config.smsListName);
  console.log(`  SMS list created: "${config.smsListName}" (ID: ${smsListId})`);

  // 3. Import email contacts
  console.log(`\nImporting ${emailContacts.length} email contacts...`);
  const emailResult = await importContacts(emailContacts, [emailListId]);
  console.log('  Email contacts import queued:', emailResult);

  // 4. Import SMS contacts
  console.log(`\nImporting ${smsContacts.length} SMS contacts...`);
  const smsResult = await importContacts(smsContacts, [smsListId]);
  console.log('  SMS contacts import queued:', smsResult);

  console.log('\nImport complete! Brevo processes imports asynchronously.');
  console.log('Check your Brevo dashboard to confirm contacts have been imported.');

  return { emailListId, smsListId };
}

module.exports = { runImport };
