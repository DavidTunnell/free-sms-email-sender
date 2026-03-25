const { SquareClient, SquareEnvironment } = require('square');
const config = require('./config');
const { cleanPhone, cleanFirstName } = require('./parseCSV');

let client = null;

function getClient() {
  if (!client) {
    if (!config.squareAccessToken) {
      throw new Error(
        'Square credentials not configured. Set SQUARE_ACCESS_TOKEN in .env'
      );
    }
    client = new SquareClient({
      token: config.squareAccessToken,
      environment:
        config.squareEnvironment === 'sandbox'
          ? SquareEnvironment.Sandbox
          : SquareEnvironment.Production,
    });
  }
  return client;
}

function mapSquareCustomer(sq) {
  return {
    email: sq.emailAddress ? sq.emailAddress.trim().toLowerCase() : null,
    phone: cleanPhone(sq.phoneNumber),
    firstName: cleanFirstName(sq.givenName),
    lastName: (sq.familyName || '').trim(),
    transactionCount: 0,
    lifetimeSpend: 0,
    squareId: sq.id || '',
  };
}

async function fetchCustomers() {
  const sq = getClient();
  const customers = [];
  let cursor = undefined;

  do {
    const response = await sq.customers.list({ cursor, limit: 100 });
    if (response.customers) {
      customers.push(...response.customers);
    }
    cursor = response.cursor;
    if (customers.length % 500 === 0 && customers.length > 0) {
      console.log(`  ...fetched ${customers.length} customers so far`);
    }
  } while (cursor);

  return customers;
}

module.exports = { getClient, fetchCustomers, mapSquareCustomer };
