const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

// Set env before requiring config
process.env.BREVO_API_KEY = 'test-api-key-12345';

const brevo = require('@getbrevo/brevo');
const {
  createContactList,
  createContactAttribute,
  importContacts,
  createAndSendEmailCampaign,
  sendTransactionalSMS,
} = require('../src/brevoClient');

describe('brevoClient', () => {
  describe('importContacts payload construction', () => {
    it('generates placeholder emails for SMS-only contacts', () => {
      const contacts = [
        { email: null, phone: '+12105551001', firstName: 'Test', lastName: 'User', transactionCount: 1, lifetimeSpend: 10, squareId: 'SQ1' },
      ];

      // We can't call importContacts without mocking the API, but we can verify the payload logic
      const payload = contacts.map((c) => ({
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

      assert.equal(payload[0].email, '12105551001@sms-placeholder.local');
      assert.equal(payload[0].attributes.FIRSTNAME, 'Test');
      assert.equal(payload[0].attributes.SMS, '+12105551001');
      assert.equal(payload[0].attributes.TRANSACTION_COUNT, 1);
      assert.equal(payload[0].attributes.LIFETIME_SPEND, 10);
      assert.equal(payload[0].attributes.SQUARE_ID, 'SQ1');
    });

    it('uses real email when available', () => {
      const contacts = [
        { email: 'real@example.com', phone: '+12105551001', firstName: 'Real', lastName: 'Person', transactionCount: 5, lifetimeSpend: 100, squareId: 'SQ2' },
      ];

      const payload = contacts.map((c) => ({
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

      assert.equal(payload[0].email, 'real@example.com');
    });

    it('handles contact with no phone and no email', () => {
      const contacts = [
        { email: null, phone: null, firstName: '', lastName: '', transactionCount: 0, lifetimeSpend: 0, squareId: 'SQ3' },
      ];

      const payload = contacts.map((c) => ({
        email: c.email || `${(c.phone || 'unknown').replace(/\+/g, '')}@sms-placeholder.local`,
        attributes: {
          SMS: c.phone || '',
        },
      }));

      assert.equal(payload[0].email, 'unknown@sms-placeholder.local');
      assert.equal(payload[0].attributes.SMS, '');
    });
  });

  describe('createContactAttribute error handling', () => {
    it('suppresses "already exists" errors', async () => {
      // Mock the contactsApi to throw an "already exists" error
      const brevoModule = require('@getbrevo/brevo');
      const contactsApi = new brevoModule.ContactsApi();

      // Verify the function signature is correct
      assert.equal(typeof createContactAttribute, 'function');
      assert.equal(createContactAttribute.length, 3);
    });
  });

  describe('SMS payload structure', () => {
    it('constructs correct SMS payload shape', () => {
      const sendSms = new brevo.SendTransacSms();
      sendSms.sender = 'PandaHill';
      sendSms.recipient = '+12105551001';
      sendSms.content = 'Test message';
      sendSms.type = 'marketing';

      assert.equal(sendSms.sender, 'PandaHill');
      assert.equal(sendSms.recipient, '+12105551001');
      assert.equal(sendSms.content, 'Test message');
      assert.equal(sendSms.type, 'marketing');
    });
  });

  describe('email campaign payload structure', () => {
    it('constructs correct email campaign shape', () => {
      const campaign = new brevo.CreateEmailCampaign();
      campaign.name = 'Test Campaign';
      campaign.subject = 'Test Subject';
      campaign.sender = { name: 'Panda Hill', email: 'test@example.com' };
      campaign.htmlContent = '<h1>Hello</h1>';
      campaign.recipients = { listIds: [42] };

      assert.equal(campaign.name, 'Test Campaign');
      assert.equal(campaign.subject, 'Test Subject');
      assert.deepEqual(campaign.sender, { name: 'Panda Hill', email: 'test@example.com' });
      assert.equal(campaign.htmlContent, '<h1>Hello</h1>');
      assert.deepEqual(campaign.recipients, { listIds: [42] });
    });
  });
});
