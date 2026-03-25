const { fetchCustomers, mapSquareCustomer } = require('./squareClient');
const { parseExclusionCSV } = require('./parseExclusion');
const { deduplicateContacts } = require('./parseCSV');
const config = require('./config');

async function pullFromSquare() {
  console.log('\nFetching customers from Square API...');
  const rawCustomers = await fetchCustomers();
  console.log(`  Retrieved ${rawCustomers.length} customers from Square.`);

  const contacts = rawCustomers.map(mapSquareCustomer);

  console.log('\nChecking exclusion list...');
  const excludedEmails = parseExclusionCSV(config.exclusionCsvPath);

  const filtered = excludedEmails.size > 0
    ? contacts.filter((c) => !(c.email && excludedEmails.has(c.email)))
    : contacts;

  const excludedCount = contacts.length - filtered.length;
  if (excludedCount > 0) {
    console.log(`  Excluded ${excludedCount} previously-contacted customers.`);
  }

  return deduplicateContacts(filtered);
}

module.exports = { pullFromSquare };
