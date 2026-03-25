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

  it('has Twilio config fields defined', () => {
    assert.ok('twilioAccountSid' in config, 'config should have twilioAccountSid');
    assert.ok('twilioAuthToken' in config, 'config should have twilioAuthToken');
    assert.ok('twilioPhoneNumber' in config, 'config should have twilioPhoneNumber');
  });

  it('has a reasonable SMS delay', () => {
    assert.ok(config.smsDelayMs >= 50, 'SMS delay should be at least 50ms');
    assert.ok(config.smsDelayMs <= 1000, 'SMS delay should not be more than 1000ms');
  });

  it('has a logs directory configured', () => {
    assert.ok(config.logsDir);
  });

  it('has Square config fields defined', () => {
    assert.ok('squareAccessToken' in config, 'config should have squareAccessToken');
    assert.ok('squareEnvironment' in config, 'config should have squareEnvironment');
    assert.ok('exclusionCsvPath' in config, 'config should have exclusionCsvPath');
  });

  it('defaults squareEnvironment to production', () => {
    assert.equal(config.squareEnvironment, 'production');
  });

  it('defaults exclusionCsvPath to ./data/exclusion.csv', () => {
    assert.equal(config.exclusionCsvPath, './data/exclusion.csv');
  });
});
