const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { cleanPhone, cleanFirstName, parseSpend, parseCSV } = require('../src/parseCSV');

// ─── cleanPhone ───

describe('cleanPhone', () => {
  it('strips leading single-quote and formats 11-digit number', () => {
    // After stripping the quote, +12105551001 has 11 digits starting with 1
    assert.equal(cleanPhone("'+12105551001"), '+12105551001');
  });

  it('formats a bare 10-digit number to E.164', () => {
    assert.equal(cleanPhone('2105551001'), '+12105551001');
  });

  it('formats an 11-digit number starting with 1', () => {
    assert.equal(cleanPhone('12105551001'), '+12105551001');
  });

  it('strips leading quote and parens/dashes', () => {
    assert.equal(cleanPhone("'(210) 555-1001"), '+12105551001');
  });

  it('returns null for empty input', () => {
    assert.equal(cleanPhone(''), null);
    assert.equal(cleanPhone(null), null);
    assert.equal(cleanPhone(undefined), null);
  });

  it('returns null for too-short numbers', () => {
    assert.equal(cleanPhone('12345'), null);
    assert.equal(cleanPhone("'555"), null);
  });

  it('handles numbers with spaces', () => {
    assert.equal(cleanPhone("'210 555 1001"), '+12105551001');
  });
});

// ─── cleanFirstName ───

describe('cleanFirstName', () => {
  it('returns a normal name as-is', () => {
    assert.equal(cleanFirstName('Adrian'), 'Adrian');
  });

  it('trims whitespace', () => {
    assert.equal(cleanFirstName('  Maria  '), 'Maria');
  });

  it('returns empty string for null/undefined', () => {
    assert.equal(cleanFirstName(null), '');
    assert.equal(cleanFirstName(undefined), '');
    assert.equal(cleanFirstName(''), '');
  });

  it('blanks out a phone number used as a name', () => {
    assert.equal(cleanFirstName('2105551004'), '');
    assert.equal(cleanFirstName('+12105559999'), '');
  });

  it('blanks out formatted phone numbers', () => {
    assert.equal(cleanFirstName('(210) 555-1004'), '');
    assert.equal(cleanFirstName('210-555-1004'), '');
  });

  it('preserves names with letters even if they contain digits', () => {
    assert.equal(cleanFirstName('J3ssica'), 'J3ssica');
  });
});

// ─── parseSpend ───

describe('parseSpend', () => {
  it('parses dollar-formatted strings', () => {
    assert.equal(parseSpend('$57.00'), 57);
    assert.equal(parseSpend('$120.50'), 120.5);
    assert.equal(parseSpend('$1,250.75'), 1250.75);
  });

  it('parses plain numbers', () => {
    assert.equal(parseSpend('15'), 15);
    assert.equal(parseSpend('0'), 0);
  });

  it('returns 0 for empty/null/undefined', () => {
    assert.equal(parseSpend(''), 0);
    assert.equal(parseSpend(null), 0);
    assert.equal(parseSpend(undefined), 0);
  });

  it('returns 0 for non-numeric strings', () => {
    assert.equal(parseSpend('abc'), 0);
  });
});

// ─── parseCSV (integration with fixture) ───

describe('parseCSV', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'test-export.csv');
  let result;

  it('parses the fixture CSV without errors', () => {
    result = parseCSV(fixturePath);
    assert.ok(result.emailContacts);
    assert.ok(result.smsContacts);
    assert.ok(result.allContacts);
  });

  it('deduplicates emails keeping the higher transaction count', () => {
    const dupeEmail = result.emailContacts.filter((c) => c.email === 'dupe@example.com');
    assert.equal(dupeEmail.length, 1, 'Should have exactly one dupe@example.com');
    assert.equal(dupeEmail[0].transactionCount, 8, 'Should keep the record with 8 transactions');
    assert.equal(dupeEmail[0].firstName, 'HighCount');
  });

  it('deduplicates phones keeping the higher transaction count', () => {
    const dupePhone = result.smsContacts.filter((c) => c.phone === '+12105551011');
    assert.equal(dupePhone.length, 1, 'Should have exactly one +12105551011');
    assert.equal(dupePhone[0].transactionCount, 6, 'Should keep the record with 6 transactions');
  });

  it('excludes contacts with no email from emailContacts', () => {
    const noEmailInList = result.emailContacts.filter((c) => !c.email);
    assert.equal(noEmailInList.length, 0);
  });

  it('excludes contacts with no phone from smsContacts', () => {
    const noPhoneInList = result.smsContacts.filter((c) => !c.phone);
    assert.equal(noPhoneInList.length, 0);
  });

  it('blanks out phone-number first names', () => {
    const badName = result.allContacts.find((c) => c.squareId === 'ABC015');
    assert.ok(badName, 'Should find contact ABC015');
    assert.equal(badName.firstName, '', 'Phone-as-name should be blanked');
  });

  it('handles contacts with no name gracefully', () => {
    const noName = result.allContacts.find((c) => c.squareId === 'ABC003');
    assert.ok(noName);
    assert.equal(noName.firstName, '');
    assert.equal(noName.lastName, '');
  });

  it('parses lifetime spend correctly', () => {
    const joyce = result.allContacts.find((c) => c.squareId === 'ABC005');
    assert.ok(joyce);
    assert.equal(joyce.lifetimeSpend, 250.75);
  });

  it('lowercases email addresses', () => {
    for (const c of result.emailContacts) {
      if (c.email) {
        assert.equal(c.email, c.email.toLowerCase());
      }
    }
  });

  it('allContacts is the union of email and SMS contacts without dupes', () => {
    // allContacts should be >= max(email, sms) and <= email + sms
    assert.ok(result.allContacts.length >= Math.max(result.emailContacts.length, result.smsContacts.length));
    assert.ok(result.allContacts.length <= result.emailContacts.length + result.smsContacts.length);
  });

  it('skips the fully-empty contact (ABC006) from both lists', () => {
    const empty = result.emailContacts.find((c) => c.squareId === 'ABC006');
    const emptySms = result.smsContacts.find((c) => c.squareId === 'ABC006');
    assert.equal(empty, undefined, 'No-email/no-phone contact should not be in email list');
    assert.equal(emptySms, undefined, 'No-email/no-phone contact should not be in SMS list');
  });
});
