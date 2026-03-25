const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function cleanPhone(raw) {
  if (!raw) return null;
  // Strip leading single-quote and any whitespace
  let phone = raw.replace(/^'+/, '').trim();
  // Remove all non-digit characters except leading +
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length > 11) return `+${digits}`;
  return null; // Invalid phone
}

function cleanFirstName(name) {
  if (!name) return '';
  const trimmed = name.trim();
  // If the name is purely numeric / a phone number pattern, blank it out
  if (/^[\+\d(][\d\s\-().]+$/.test(trimmed)) return '';
  return trimmed;
}

function parseSpend(raw) {
  if (!raw) return 0;
  return parseFloat(String(raw).replace(/[$,]/g, '')) || 0;
}

function parseCSV(csvPath) {
  const fullPath = path.resolve(csvPath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Map raw records to clean contact objects
  const contacts = records.map((r) => ({
    email: r['Email Address'] ? r['Email Address'].trim().toLowerCase() : null,
    phone: cleanPhone(r['Phone Number']),
    firstName: cleanFirstName(r['First Name']),
    lastName: (r['Last Name'] || '').trim(),
    transactionCount: parseInt(r['Transaction Count'], 10) || 0,
    lifetimeSpend: parseSpend(r['Lifetime Spend']),
    squareId: (r['Square Customer ID'] || '').trim(),
  }));

  // Deduplicate by email — keep highest transaction count
  const emailMap = new Map();
  for (const c of contacts) {
    if (!c.email) continue;
    const existing = emailMap.get(c.email);
    if (!existing || c.transactionCount > existing.transactionCount) {
      emailMap.set(c.email, c);
    }
  }

  // Deduplicate by phone — keep highest transaction count
  const phoneMap = new Map();
  for (const c of contacts) {
    if (!c.phone) continue;
    const existing = phoneMap.get(c.phone);
    if (!existing || c.transactionCount > existing.transactionCount) {
      phoneMap.set(c.phone, c);
    }
  }

  // Build deduplicated lists
  const emailContacts = Array.from(emailMap.values());
  const smsContacts = Array.from(phoneMap.values());

  // allContacts = union by squareId (or email+phone combo) to avoid dupes
  const allMap = new Map();
  for (const c of emailContacts) {
    const key = c.squareId || `${c.email}|${c.phone}`;
    allMap.set(key, c);
  }
  for (const c of smsContacts) {
    const key = c.squareId || `${c.email}|${c.phone}`;
    if (!allMap.has(key)) allMap.set(key, c);
  }
  const allContacts = Array.from(allMap.values());

  return { emailContacts, smsContacts, allContacts };
}

function printSummary({ emailContacts, smsContacts, allContacts }) {
  console.log('\n=== CSV Parse Summary ===');
  console.log(`Total unique contacts: ${allContacts.length}`);
  console.log(`Email contacts: ${emailContacts.length}`);
  console.log(`SMS contacts: ${smsContacts.length}`);

  const withBothCount = emailContacts.filter((c) => c.phone).length;
  console.log(`Contacts with both email & phone: ${withBothCount}`);

  const noNameCount = allContacts.filter((c) => !c.firstName).length;
  console.log(`Contacts without a first name: ${noNameCount}`);

  // Sample contacts
  console.log('\nSample email contacts:');
  emailContacts.slice(0, 3).forEach((c) => {
    console.log(`  ${c.firstName || '(no name)'} ${c.lastName} — ${c.email} — ${c.transactionCount} orders — $${c.lifetimeSpend.toFixed(2)}`);
  });

  console.log('\nSample SMS contacts:');
  smsContacts.slice(0, 3).forEach((c) => {
    console.log(`  ${c.firstName || '(no name)'} ${c.lastName} — ${c.phone} — ${c.transactionCount} orders — $${c.lifetimeSpend.toFixed(2)}`);
  });
}

module.exports = { parseCSV, printSummary, cleanPhone, cleanFirstName, parseSpend };
