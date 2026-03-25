const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { parseExclusionCSV } = require('../src/parseExclusion');

describe('parseExclusionCSV', () => {
  it('returns a Set of lowercase emails from a valid file', () => {
    const csvPath = path.join(__dirname, 'fixtures', 'test-exclusion.csv');
    const emails = parseExclusionCSV(csvPath);
    assert.ok(emails instanceof Set);
    assert.equal(emails.size, 3);
    assert.ok(emails.has('alice@example.com'));
    assert.ok(emails.has('bob@example.com'));
    assert.ok(emails.has('charlie@example.com'), 'should lowercase emails');
  });

  it('returns empty Set when file does not exist', () => {
    const emails = parseExclusionCSV('/nonexistent/path.csv');
    assert.ok(emails instanceof Set);
    assert.equal(emails.size, 0);
  });
});
