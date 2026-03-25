# Free SMS & Email Sender

A Node.js CLI tool that uses the [Brevo](https://www.brevo.com) (formerly Sendinblue) API to import contacts from a Square customer export and send personalized email and SMS marketing campaigns.

Built for **Panda Hill** (Asian Comfort Food, Castroville TX) to launch their loyalty program by reaching ~1,099 past Square customers with a personalized invitation and free appetizer offer.

## What It Does

1. **Parses** a Square customer CSV export — cleans phone numbers, deduplicates contacts, normalizes data
2. **Imports** contacts into Brevo with custom attributes (transaction history, lifetime spend, Square ID)
3. **Sends an email campaign** to contacts with email addresses (~505 unique) via Brevo's Campaign API
4. **Sends SMS messages** to contacts with phone numbers (~872 unique) via Brevo's Transactional SMS API

All operations are behind an interactive CLI menu with dry-run preview and confirmation prompts before any sends.

## Prerequisites

- **Node.js 18+**
- A free [Brevo account](https://www.brevo.com)
- A Square customer export CSV (placed in `data/export.csv`)

## Quick Start

```bash
git clone https://github.com/DavidTunnell/free-sms-email-sender.git
cd free-sms-email-sender
npm install
```

### Configure

1. Copy your Square customer export to `data/export.csv`
2. Set your Brevo API key in `.env`:

```
BREVO_API_KEY=your-brevo-api-key-here
```

**How to get your API key:** Brevo dashboard → Settings → SMTP & API → API Keys → Generate a new API key

### Run

```bash
npm start
```

You'll see the interactive menu:

```
=== Panda Hill — Brevo Loyalty Campaign ===

--- Menu ---
1. Parse & preview CSV data (dry run)
2. Import contacts into Brevo
3. Send email campaign
4. Send SMS campaign
5. Run all (import → email → SMS)
0. Exit
```

**Start with option 1** — it parses and previews the CSV without touching Brevo.

## Test Mode (Send to Yourself)

Before blasting ~1,099 customers, verify everything works by sending to just yourself.

**1. Add your info to `.env`:**

```
TEST_EMAIL=your@email.com
TEST_PHONE=+12105551234
TEST_FIRST_NAME=YourName
```

**2. Run test mode:**

```bash
npm start
# Choose option 6 → Test mode (send to yourself)
# Then choose: 1 (email only), 2 (SMS only), or 3 (both)
```

This uses Brevo's **Transactional Email API** — no lists created, no campaigns left behind, instant delivery. SMS uses the same transactional API as the full campaign.

**3. Verify delivery:**
- Check your email inbox for the full HTML loyalty invitation
- Check your phone for the SMS with the opt-out footer
- Once both look good, swap in the real `data/export.csv` and run the full campaign

## Brevo Setup Checklist

Before sending campaigns, complete these steps in your Brevo dashboard:

- [ ] Generate an API key (Settings → SMTP & API → API Keys)
- [ ] Verify your sender email address (Settings → Senders & IPs)
- [ ] Create a [Twilio account](https://www.twilio.com) (free trial includes ~$15 credit)
- [ ] Get a Twilio phone number from the console (~$1.15/mo)
- [ ] Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` to `.env`

## Project Structure

```
├── .env                          # BREVO_API_KEY (not committed)
├── package.json
├── src/
│   ├── config.js                 # Environment config and constants
│   ├── parseCSV.js               # CSV parsing, cleaning, deduplication
│   ├── brevoClient.js            # Brevo SDK wrapper (contacts, email, SMS)
│   ├── importContacts.js         # List creation + batch contact import
│   ├── sendEmail.js              # Email campaign orchestration
│   ├── sendSMS.js                # SMS loop with rate limiting + logging
│   ├── templates.js              # Shared email HTML + SMS message templates
│   ├── testMode.js               # Test mode — send to yourself before full campaign
│   └── index.js                  # Interactive CLI entry point
├── test/
│   ├── fixtures/test-export.csv  # Test fixture with edge cases
│   ├── parseCSV.test.js          # 29 tests — parsing, cleaning, dedup
│   ├── brevoClient.test.js       # 7 tests — payload construction
│   ├── importContacts.test.js    # 10 tests — module structure, attributes
│   ├── sendEmail.test.js         # 13 tests — HTML content, merge tags
│   ├── sendSMS.test.js           # 8 tests — message content, logging
│   └── config.test.js            # 9 tests — config validation
├── data/
│   └── export.csv                # Square CSV goes here (not committed)
└── logs/
    └── sms-results.json          # SMS send results (generated at runtime)
```

## CSV Data Handling

The tool expects a Square customer export with these columns:

| Column | Usage |
|--------|-------|
| `First Name` | Personalization (phone-number names are blanked) |
| `Last Name` | Personalization |
| `Email Address` | Email campaign targeting |
| `Phone Number` | SMS campaign targeting (leading `'` stripped, normalized to E.164) |
| `Transaction Count` | Deduplication tiebreaker (highest wins) |
| `Lifetime Spend` | Stored as contact attribute |
| `Square Customer ID` | Deduplication key |

### Data Cleaning

- Phone numbers: strips leading `'` character, normalizes to `+1XXXXXXXXXX` (E.164)
- Email addresses: lowercased and trimmed
- First names that are actually phone numbers (e.g., `2105551234`) are blanked
- Formatted phone-number names (e.g., `(210) 555-1234`) are also blanked
- Duplicate emails/phones: keeps the record with the highest transaction count
- Dollar-formatted spend values (`$120.50`) are parsed to floats

## Campaign Content

### Email

- **Subject:** 🐼 You're invited! Join Panda Hill Rewards & get FREE food
- **From:** Panda Hill (configurable sender email)
- **Personalization:** Uses Brevo `{{contact.FIRSTNAME}}` merge tags
- **Template:** Mobile-friendly, table-based HTML with inline CSS
- **Highlights:** Free appetizer, points system, birthday rewards, CTA button

### SMS

```
Panda Hill here! 🐼 Join our NEW loyalty program & get a FREE appetizer.
Visit pandahilltx.com or ask on your next visit! Reply STOP to opt out
```

- 144 characters (under the 160-char single-segment limit)
- Includes opt-out language

## SMS Details

- Uses **Twilio** for SMS delivery (US carriers block alphanumeric sender IDs used by Brevo)
- Twilio provides a real US phone number as the sender (~$1.15/mo + ~$0.0079/msg)
- 100ms delay between sends to respect rate limits
- Exponential backoff on 429 (rate limit) responses
- Every send result is logged to `logs/sms-results.json`
- Estimated cost for ~872 messages: **~$7**

## Safety Features

- **Dry run first:** Option 1 parses the CSV and prints counts without calling Brevo
- **Confirmation prompts:** Every send action requires `y/n` confirmation
- **Idempotent imports:** `updateExistingContacts: true` prevents duplicates on re-run
- **SMS logging:** Every SMS result (success/failure) logged with phone number
- **No duplicate emails:** Brevo prevents resending the same campaign to the same list
- **Placeholder emails:** SMS-only contacts get `{phone}@sms-placeholder.local` (Brevo requires an email per contact, but these never receive email campaigns)

## Testing

```bash
npm test
```

Runs 76 tests across 6 test files using Node's built-in test runner:

```
✔ config (9 tests)
✔ parseCSV — cleanPhone (7 tests)
✔ parseCSV — cleanFirstName (6 tests)
✔ parseCSV — parseSpend (4 tests)
✔ parseCSV — full CSV integration (11 tests)
✔ brevoClient — payload construction (7 tests)
✔ importContacts — structure & attributes (10 tests)
✔ sendEmail — content & HTML (13 tests)
✔ sendSMS — content & logging (8 tests)
```

Tests cover: phone number normalization, name cleaning, spend parsing, CSV deduplication, Brevo payload shape, import attribute definitions, email HTML content/merge tags, SMS character limits, and log file writing.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BREVO_API_KEY` | Yes | Your Brevo API key (for email + contacts) |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio Account SID (for SMS) |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio Auth Token (for SMS) |
| `TWILIO_PHONE_NUMBER` | Yes | Twilio phone number in E.164 format (for SMS sender) |
| `BREVO_SENDER_EMAIL` | No | Sender email (default: `davidtunnell9@gmail.com`) |
| `TEST_EMAIL` | No | Your email for test mode (option 6) |
| `TEST_PHONE` | No | Your phone in E.164 format (e.g. `+12105551234`) for test mode |
| `TEST_FIRST_NAME` | No | Your first name for email personalization in test mode |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@getbrevo/brevo` | Brevo API SDK (contacts, email campaigns) |
| `twilio` | Twilio SDK for SMS delivery |
| `csv-parse` | CSV parsing with column headers |
| `dotenv` | Load `.env` file into `process.env` |

## License

MIT
