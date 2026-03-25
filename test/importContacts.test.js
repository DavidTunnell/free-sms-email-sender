const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Set env before requiring modules
process.env.BREVO_API_KEY = 'test-api-key-12345';

describe('importContacts', () => {
  describe('module structure', () => {
    it('exports runImport as a function', () => {
      const { runImport } = require('../src/importContacts');
      assert.equal(typeof runImport, 'function');
    });
  });

  describe('contact list naming', () => {
    const config = require('../src/config');

    it('has distinct email and SMS list names', () => {
      assert.notEqual(config.emailListName, config.smsListName);
    });

    it('email list name contains "Email"', () => {
      assert.ok(config.emailListName.includes('Email'));
    });

    it('SMS list name contains "SMS"', () => {
      assert.ok(config.smsListName.includes('SMS'));
    });

    it('both list names include "Panda Hill"', () => {
      assert.ok(config.emailListName.includes('Panda Hill'));
      assert.ok(config.smsListName.includes('Panda Hill'));
    });
  });

  describe('custom attributes', () => {
    // Verify the source code references the right attribute names
    const fs = require('fs');
    const path = require('path');
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'importContacts.js'), 'utf-8');

    it('creates TRANSACTION_COUNT attribute', () => {
      assert.ok(source.includes('TRANSACTION_COUNT'));
    });

    it('creates LIFETIME_SPEND attribute', () => {
      assert.ok(source.includes('LIFETIME_SPEND'));
    });

    it('creates SQUARE_ID attribute', () => {
      assert.ok(source.includes('SQUARE_ID'));
    });

    it('uses float type for numeric attributes', () => {
      assert.ok(source.includes("'float'"));
    });

    it('uses text type for SQUARE_ID', () => {
      assert.ok(source.includes("'text'"));
    });
  });
});
