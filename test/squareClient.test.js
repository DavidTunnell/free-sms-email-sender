const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { mapSquareCustomer } = require('../src/squareClient');

describe('mapSquareCustomer', () => {
  it('maps a complete Square customer object', () => {
    const sq = {
      id: 'SQ_123',
      givenName: 'Alice',
      familyName: 'Smith',
      emailAddress: 'Alice@Example.com',
      phoneNumber: '(210) 555-1234',
    };
    const result = mapSquareCustomer(sq);
    assert.equal(result.email, 'alice@example.com');
    assert.equal(result.phone, '+12105551234');
    assert.equal(result.firstName, 'Alice');
    assert.equal(result.lastName, 'Smith');
    assert.equal(result.squareId, 'SQ_123');
    assert.equal(result.transactionCount, 0);
    assert.equal(result.lifetimeSpend, 0);
  });

  it('handles missing email', () => {
    const sq = { id: 'SQ_456', givenName: 'Bob', phoneNumber: '2105559999' };
    const result = mapSquareCustomer(sq);
    assert.equal(result.email, null);
    assert.equal(result.phone, '+12105559999');
    assert.equal(result.firstName, 'Bob');
  });

  it('handles missing phone', () => {
    const sq = { id: 'SQ_789', emailAddress: 'test@test.com' };
    const result = mapSquareCustomer(sq);
    assert.equal(result.email, 'test@test.com');
    assert.equal(result.phone, null);
  });

  it('handles missing name fields', () => {
    const sq = { id: 'SQ_000', emailAddress: 'noname@test.com' };
    const result = mapSquareCustomer(sq);
    assert.equal(result.firstName, '');
    assert.equal(result.lastName, '');
  });

  it('cleans phone-number-like first names', () => {
    const sq = { id: 'SQ_111', givenName: '2105551234', emailAddress: 'a@b.com' };
    const result = mapSquareCustomer(sq);
    assert.equal(result.firstName, '', 'phone-like names should be blanked');
  });

  it('handles completely empty customer', () => {
    const sq = {};
    const result = mapSquareCustomer(sq);
    assert.equal(result.email, null);
    assert.equal(result.phone, null);
    assert.equal(result.firstName, '');
    assert.equal(result.lastName, '');
    assert.equal(result.squareId, '');
  });
});
