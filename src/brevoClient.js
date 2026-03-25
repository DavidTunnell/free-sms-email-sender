const brevo = require('@getbrevo/brevo');
const config = require('./config');

// --- Contacts API ---
const contactsApi = new brevo.ContactsApi();
contactsApi.setApiKey(brevo.ContactsApiApiKeys.apiKey, config.brevoApiKey);

// --- Email Campaigns API ---
const emailCampaignsApi = new brevo.EmailCampaignsApi();
emailCampaignsApi.setApiKey(brevo.EmailCampaignsApiApiKeys.apiKey, config.brevoApiKey);

// --- Transactional SMS API ---
const transactionalSmsApi = new brevo.TransactionalSMSApi();
transactionalSmsApi.setApiKey(brevo.TransactionalSMSApiApiKeys.apiKey, config.brevoApiKey);

async function createContactList(listName, folderId = 1) {
  const createList = new brevo.CreateList();
  createList.name = listName;
  createList.folderId = folderId;
  const result = await contactsApi.createList(createList);
  return result.id;
}

async function createContactAttribute(category, name, type) {
  const attr = new brevo.CreateAttribute();
  attr.type = type;
  try {
    await contactsApi.createAttribute(category, name, attr);
    console.log(`  Created attribute: ${name}`);
  } catch (err) {
    if (err.status === 400 && err.body && err.body.message && err.body.message.includes('already exists')) {
      console.log(`  Attribute already exists: ${name}`);
    } else {
      throw err;
    }
  }
}

async function importContacts(contacts, listIds) {
  const requestContactImport = new brevo.RequestContactImport();
  requestContactImport.listIds = listIds;
  requestContactImport.emailBlacklist = false;
  requestContactImport.smsBlacklist = false;
  requestContactImport.updateExistingContacts = true;
  requestContactImport.emptyContactsAttributes = false;
  requestContactImport.jsonBody = contacts.map((c) => ({
    email: c.email || `${(c.phone || 'unknown').replace(/\+/g, '')}@sms-placeholder.local`,
    attributes: {
      FIRSTNAME: c.firstName,
      LASTNAME: c.lastName,
      SMS: c.phone || '',
      TRANSACTION_COUNT: c.transactionCount,
      LIFETIME_SPEND: c.lifetimeSpend,
      SQUARE_ID: c.squareId,
    },
  }));

  const result = await contactsApi.importContacts(requestContactImport);
  return result;
}

async function createAndSendEmailCampaign(listId, subject, htmlContent, senderName, senderEmail) {
  const emailCampaign = new brevo.CreateEmailCampaign();
  emailCampaign.name = `Panda Hill Loyalty Launch - ${new Date().toISOString().slice(0, 10)}`;
  emailCampaign.subject = subject;
  emailCampaign.sender = { name: senderName, email: senderEmail };
  emailCampaign.replyTo = senderEmail;
  emailCampaign.htmlContent = htmlContent;
  emailCampaign.recipients = { listIds: [listId] };

  // Create the campaign
  const createResult = await emailCampaignsApi.createEmailCampaign(emailCampaign);
  const campaignId = createResult.id;
  console.log(`  Email campaign created with ID: ${campaignId}`);

  // Send it immediately
  await emailCampaignsApi.sendEmailCampaignNow(campaignId);
  console.log(`  Email campaign sent!`);

  return campaignId;
}

async function sendTransactionalSMS(phone, content, sender) {
  const sendSms = new brevo.SendTransacSms();
  sendSms.sender = sender;
  sendSms.recipient = phone;
  sendSms.content = content;
  sendSms.type = 'marketing';

  const result = await transactionalSmsApi.sendTransacSms(sendSms);
  return result;
}

module.exports = {
  createContactList,
  createContactAttribute,
  importContacts,
  createAndSendEmailCampaign,
  sendTransactionalSMS,
};
