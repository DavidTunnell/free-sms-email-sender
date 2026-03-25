const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function parseExclusionCSV(csvPath) {
  const fullPath = path.resolve(csvPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`  No exclusion file found at ${fullPath} — skipping exclusion filter.`);
    return new Set();
  }

  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const emails = new Set();
  for (const r of records) {
    const email = r['Email Address'] || r['Email'] || r['email'] || '';
    if (email) emails.add(email.trim().toLowerCase());
  }

  console.log(`  Loaded ${emails.size} emails from exclusion list.`);
  return emails;
}

module.exports = { parseExclusionCSV };
