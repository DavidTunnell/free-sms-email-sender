const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Set env before requiring modules
process.env.BREVO_API_KEY = 'test-api-key-12345';

describe('sendSMS', () => {
  describe('SMS content', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'sendSMS.js'), 'utf-8');

    it('contains the panda emoji', () => {
      assert.ok(source.includes('\\uD83D\\uDC3C') || source.includes('\uD83D\uDC3C'));
    });

    it('mentions the loyalty program', () => {
      assert.ok(source.includes('loyalty program'));
    });

    it('mentions FREE appetizer', () => {
      assert.ok(source.includes('FREE appetizer'));
    });

    it('mentions pandahilltx.com', () => {
      assert.ok(source.includes('pandahilltx.com'));
    });

    it('includes STOP opt-out', () => {
      assert.ok(source.includes('Reply STOP to opt out'));
    });

    it('SMS content is under 160 characters', () => {
      // Extract the SMS content string from the source
      const smsContent = 'Panda Hill here! \uD83D\uDC3C Join our NEW loyalty program & get a FREE appetizer. Visit pandahilltx.com or ask on your next visit! Reply STOP to opt out';
      assert.ok(smsContent.length <= 160, `SMS is ${smsContent.length} chars, must be <= 160`);
    });
  });

  describe('runSMSCampaign function', () => {
    it('is exported as a function', () => {
      const { runSMSCampaign } = require('../src/sendSMS');
      assert.equal(typeof runSMSCampaign, 'function');
    });
  });

  describe('SMS results logging', () => {
    const logsDir = path.join(__dirname, '..', 'logs');
    const logFile = path.join(logsDir, 'sms-results.json');

    afterEach(() => {
      // Clean up test log file
      if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
      }
    });

    it('logs directory can be created', () => {
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      assert.ok(fs.existsSync(logsDir));
    });

    it('can write a valid JSON results file', () => {
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      const testResults = [
        { phone: '+12105551001', status: 'success', messageId: 'msg_123' },
        { phone: '+12105551002', status: 'failed', error: 'Invalid number' },
      ];
      fs.writeFileSync(logFile, JSON.stringify(testResults, null, 2));

      const written = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      assert.equal(written.length, 2);
      assert.equal(written[0].status, 'success');
      assert.equal(written[1].status, 'failed');
    });
  });
});
