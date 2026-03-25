const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Set env before requiring config
process.env.BREVO_API_KEY = 'test-api-key-12345';

const config = require('../src/config');

describe('config', () => {
  it('loads the API key from env', () => {
    assert.equal(config.brevoApiKey, 'test-api-key-12345');
  });

  it('has a CSV path', () => {
    assert.ok(config.csvPath);
    assert.ok(config.csvPath.includes('export.csv'));
  });

  it('has email list name', () => {
    assert.ok(config.emailListName);
  });

  it('has SMS list name', () => {
    assert.ok(config.smsListName);
  });

  it('has sender name set to Panda Hill', () => {
    assert.equal(config.senderName, 'Panda Hill');
  });

  it('has sender email set', () => {
    assert.ok(config.senderEmail);
    assert.ok(config.senderEmail.includes('@'));
  });

  it('has SMS sender name within 11 char limit', () => {
    assert.ok(config.smsSender.length <= 11, `SMS sender "${config.smsSender}" exceeds 11 chars`);
    assert.ok(/^[a-zA-Z0-9]+$/.test(config.smsSender), 'SMS sender must be alphanumeric');
  });

  it('has a reasonable SMS delay', () => {
    assert.ok(config.smsDelayMs >= 50, 'SMS delay should be at least 50ms');
    assert.ok(config.smsDelayMs <= 1000, 'SMS delay should not be more than 1000ms');
  });

  it('has a logs directory configured', () => {
    assert.ok(config.logsDir);
  });
});
