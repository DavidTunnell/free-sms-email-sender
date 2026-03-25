const brevo = require('@getbrevo/brevo');
const config = require('./config');

// --- Contacts API ---
const contactsApi = new brevo.ContactsApi();
contactsApi.setApiKey(brevo.ContactsApiApiKeys.apiKey, config.brevoApiKey);

// --- Email Campaigns API ---
const emailCampaignsApi = new brevo.EmailCampaignsApi();
emailCampaignsApi.setApiKey(brevo.EmailCampaignsApiApiKeys.apiKey, config.brevoApiKey);


async function createContactList(listName, folderId = 1) {
  const createList = new brevo.CreateList();
  createList.name = listName;
  createList.folderId = folderId;
  try {
    const result = await contactsApi.createList(createList);
    const id = (result.body && result.body.id) || result.id;
    console.log(`  Created list: ${listName} (ID: ${id})`);
    return id;
  } catch (err) {
    // List already exists — find its ID
    const listsResult = await contactsApi.getLists({ limit: 50 });
    const lists = (listsResult.body && listsResult.body.lists) || listsResult.lists || [];
    const existing = lists.find(l => l.name === listName);
    if (existing) {
      console.log(`  List already exists: ${listName} (ID: ${existing.id})`);
      return existing.id;
    }
    throw err;
  }
}

async function createContactAttribute(category, name, type) {
  const attr = new brevo.CreateAttribute();
  attr.type = type;
  try {
    await contactsApi.createAttribute(category, name, attr);
    console.log(`  Created attribute: ${name}`);
  } catch (err) {
    const msg = (err.body && err.body.message) || (err.message) || '';
    if (msg.includes('already exists') || msg.includes('must be unique')) {
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
  const campaignId = (createResult.body && createResult.body.id) || createResult.id;
  console.log(`  Email campaign created with ID: ${campaignId}`);

  // Send it immediately
  await emailCampaignsApi.sendEmailCampaignNow(campaignId);
  console.log(`  Email campaign sent!`);

  return campaignId;
}

module.exports = {
  createContactList,
  createContactAttribute,
  importContacts,
  createAndSendEmailCampaign,
};
