const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Set env before requiring modules that depend on config
process.env.BREVO_API_KEY = 'test-api-key-12345';

describe('sendEmail', () => {
  // Templates are now in a shared module
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'templates.js'), 'utf-8');

  describe('email subject line', () => {
    it('contains panda emoji', () => {
      assert.ok(source.includes('\\uD83D\\uDC3C') || source.includes('\uD83D\uDC3C'));
    });

    it('mentions Panda Hill Rewards', () => {
      assert.ok(source.includes('Panda Hill Rewards'));
    });

    it('mentions FREE food', () => {
      assert.ok(source.includes('FREE food'));
    });
  });

  describe('email HTML content', () => {
    it('contains the Brevo merge tag for first name', () => {
      assert.ok(source.includes('{{contact.FIRSTNAME}}'));
    });

    it('contains the Panda Hill website link', () => {
      assert.ok(source.includes('https://www.pandahilltx.com'));
    });

    it('mentions free appetizer', () => {
      assert.ok(source.includes('FREE appetizer'));
    });

    it('mentions earning points', () => {
      assert.ok(source.includes('point'));
    });

    it('mentions birthday treat', () => {
      assert.ok(source.includes('birthday'));
    });

    it('includes Joyce & David sign-off', () => {
      assert.ok(source.includes('Joyce'));
      assert.ok(source.includes('David'));
    });

    it('mentions Castroville, TX', () => {
      assert.ok(source.includes('Castroville, TX'));
    });

    it('uses inline CSS (no external stylesheets)', () => {
      assert.ok(!source.includes('<link rel="stylesheet"'));
    });

    it('has mobile viewport meta tag', () => {
      assert.ok(source.includes('viewport'));
      assert.ok(source.includes('width=device-width'));
    });

    it('uses table-based layout for email compatibility', () => {
      assert.ok(source.includes('role="presentation"'));
    });
  });

  describe('runEmailCampaign function', () => {
    it('is exported as a function', () => {
      const { runEmailCampaign } = require('../src/sendEmail');
      assert.equal(typeof runEmailCampaign, 'function');
    });
  });
});
