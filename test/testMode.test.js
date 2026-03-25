const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

// Set env before requiring modules
process.env.BREVO_API_KEY = 'test-api-key-12345';

describe('testMode', () => {
  describe('getTestContact', () => {
    beforeEach(() => {
      delete process.env.TEST_EMAIL;
      delete process.env.TEST_PHONE;
      delete process.env.TEST_FIRST_NAME;
    });

    afterEach(() => {
      delete process.env.TEST_EMAIL;
      delete process.env.TEST_PHONE;
      delete process.env.TEST_FIRST_NAME;
    });

    it('returns contact with email and phone when both set', () => {
      process.env.TEST_EMAIL = 'test@example.com';
      process.env.TEST_PHONE = '+12105551234';
      process.env.TEST_FIRST_NAME = 'David';

      const { getTestContact } = require('../src/testMode');
      const contact = getTestContact();

      assert.equal(contact.email, 'test@example.com');
      assert.equal(contact.phone, '+12105551234');
      assert.equal(contact.firstName, 'David');
    });

    it('returns contact with only email when phone not set', () => {
      process.env.TEST_EMAIL = 'test@example.com';
      process.env.TEST_FIRST_NAME = 'David';

      const { getTestContact } = require('../src/testMode');
      const contact = getTestContact();

      assert.equal(contact.email, 'test@example.com');
      assert.equal(contact.phone, null);
    });

    it('returns contact with only phone when email not set', () => {
      process.env.TEST_PHONE = '+12105551234';

      const { getTestContact } = require('../src/testMode');
      const contact = getTestContact();

      assert.equal(contact.email, null);
      assert.equal(contact.phone, '+12105551234');
    });

    it('throws when neither email nor phone is set', () => {
      const { getTestContact } = require('../src/testMode');
      assert.throws(() => getTestContact(), {
        message: /No test contact configured/,
      });
    });

    it('defaults firstName to empty string when not set', () => {
      process.env.TEST_EMAIL = 'test@example.com';

      const { getTestContact } = require('../src/testMode');
      const contact = getTestContact();

      assert.equal(contact.firstName, '');
    });
  });

  describe('merge tag replacement', () => {
    it('replaces {{contact.FIRSTNAME}} in email HTML', () => {
      const { EMAIL_HTML } = require('../src/templates');
      const personalized = EMAIL_HTML.replace(
        /\{\{contact\.FIRSTNAME\}\}/g,
        'David'
      );
      assert.ok(!personalized.includes('{{contact.FIRSTNAME}}'));
      assert.ok(personalized.includes('Hey David,'));
    });

    it('handles empty first name gracefully', () => {
      const { EMAIL_HTML } = require('../src/templates');
      const personalized = EMAIL_HTML.replace(
        /\{\{contact\.FIRSTNAME\}\}/g,
        ''
      );
      assert.ok(!personalized.includes('{{contact.FIRSTNAME}}'));
      assert.ok(personalized.includes('Hey ,'));
    });
  });

  describe('module exports', () => {
    it('exports runTestMode as a function', () => {
      process.env.TEST_EMAIL = 'test@example.com';
      const { runTestMode } = require('../src/testMode');
      assert.equal(typeof runTestMode, 'function');
    });

    it('exports sendTestEmail as a function', () => {
      const { sendTestEmail } = require('../src/testMode');
      assert.equal(typeof sendTestEmail, 'function');
    });

    it('exports sendTestSMS as a function', () => {
      const { sendTestSMS } = require('../src/testMode');
      assert.equal(typeof sendTestSMS, 'function');
    });
  });
});
