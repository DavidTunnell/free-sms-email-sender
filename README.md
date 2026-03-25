# Free SMS & Email Sender

A Node.js CLI tool that uses the [Brevo](https://www.brevo.com) API and [Twilio](https://www.twilio.com) to import contacts from a Square customer export and send personalized email and SMS marketing campaigns.

## What It Does

1. **Parses** a Square customer CSV export — cleans phone numbers, deduplicates contacts, normalizes data
2. **Excludes** contacts who have already been emailed (via an exclusion CSV)
3. **Imports** contacts into Brevo with custom attributes (transaction history, lifetime spend, Square ID)
4. **Sends email campaigns** to contacts with email addresses via Brevo's Campaign API
5. **Sends SMS messages** to contacts with phone numbers via Twilio
6. **Pulls customers directly** from the Square API as an alternative to CSV import

All operations are behind an interactive CLI menu with dry-run preview and confirmation prompts before any sends.

## Prerequisites

- **Node.js 18+**
- A free [Brevo account](https://www.brevo.com)
- A [Twilio account](https://www.twilio.com) with a US phone number (for SMS)
- A Square customer export CSV

## Quick Start

```bash
git clone https://github.com/DavidTunnell/free-sms-email-sender.git
cd free-sms-email-sender
npm install
```

### Configure

1. Copy `.env.example` to `.env` and fill in your API keys
2. Place your Square customer export at `data/export.csv`
3. (Optional) Place an exclusion CSV at `data/exclusion.csv` to skip already-contacted customers

### Run

```bash
npm start
```

You'll see the interactive menu:

```
--- Menu ---
1. Parse & preview CSV data (dry run)
2. Import contacts into Brevo
3. Send email campaign
4. Send SMS campaign
5. Run all (import → email → SMS)
6. Test mode (send to yourself)
7. Pull customers from Square API
8. Square → Run all (pull → import → email → SMS)
0. Exit
```

**Start with option 1** — it parses and previews the CSV without touching any APIs.

## Test Mode (Send to Yourself)

Before sending to your full contact list, verify everything works by sending to just yourself.

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

This uses Brevo's **Transactional Email API** — no lists created, no campaigns left behind, instant delivery. SMS uses Twilio's API directly.

**3. Verify delivery:**
- Check your email inbox for the full HTML email
- Check your phone for the SMS
- Once both look good, run the full campaign

## Exclusion Filtering

To avoid sending to customers who have already been contacted:

1. Export the recipient list from your previous campaign (e.g., from Square Marketing)
2. Place it at `data/exclusion.csv`
3. The CSV just needs an `Email Address` column (also accepts `Email` or `email`)

The tool automatically filters out excluded emails before deduplication and import.

## Setup Checklist

Before sending campaigns, complete these steps:

- [ ] Generate a Brevo API key (Settings → SMTP & API → API Keys)
- [ ] Verify your sender email address in Brevo (Settings → Senders & IPs)
- [ ] Create a [Twilio account](https://www.twilio.com) and get a US phone number
- [ ] Complete Twilio A2P 10DLC registration (required for US SMS — see below)
- [ ] Add all API keys to `.env`
- [ ] Place your Square customer export at `data/export.csv`

### Twilio A2P 10DLC Registration (Required for US SMS)

US carriers require A2P 10DLC registration before sending marketing SMS. In the Twilio Console:

1. **Register your brand** — Messaging → Compliance → A2P Brand Registration
2. **Create a campaign** — describe your use case (e.g., "loyalty program marketing")
3. **Attach your phone number** to the campaign
4. Cost: ~$4 brand registration + ~$15 campaign vetting + ~$2/mo

If you have an EIN, register as "Low Volume Standard." Otherwise, use "Sole Proprietor" registration. New EINs may take up to 2 weeks to propagate in the IRS system before Twilio can verify them.

## Project Structure

```
├── .env.example                  # Template for environment variables
├── package.json
├── src/
│   ├── config.js                 # Environment config and constants
│   ├── parseCSV.js               # CSV parsing, cleaning, deduplication
│   ├── parseExclusion.js         # Exclusion list loading
│   ├── brevoClient.js            # Brevo SDK wrapper (contacts, email campaigns)
│   ├── twilioClient.js           # Twilio SDK wrapper (SMS)
│   ├── importContacts.js         # List creation + batch contact import
│   ├── sendEmail.js              # Email campaign orchestration
│   ├── sendSMS.js                # SMS loop with rate limiting + logging
│   ├── templates.js              # Email HTML + SMS message templates
│   ├── testMode.js               # Test mode — send to yourself before full campaign
│   ├── squareClient.js           # Square API client for pulling customers
│   ├── pullFromSquare.js         # Square → contact pipeline with exclusion
│   └── index.js                  # Interactive CLI entry point
├── test/
│   ├── fixtures/                 # Test CSV fixtures with edge cases
│   └── *.test.js                 # Test files for each module
├── data/
│   ├── export.csv                # Square CSV goes here (not committed)
│   └── exclusion.csv             # Already-contacted emails (optional, not committed)
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
- First names that are actually phone numbers are blanked
- Duplicate emails/phones: keeps the record with the highest transaction count
- Dollar-formatted spend values (`$120.50`) are parsed to floats

## Email & SMS Details

### Email

- Sent via Brevo's Email Campaign API
- Uses `{{contact.FIRSTNAME}}` merge tags for personalization
- Mobile-friendly, table-based HTML with inline CSS
- Brevo automatically appends unsubscribe link
- Configurable sender name and email

### SMS

- Sent via **Twilio** (US carriers block alphanumeric sender IDs used by Brevo)
- Uses a real US phone number as the sender
- 100ms delay between sends to respect rate limits
- Exponential backoff on 429 (rate limit) responses
- Every send result is logged to `logs/sms-results.json`
- Includes STOP opt-out language

## Safety Features

- **Dry run first:** Option 1 parses the CSV and prints counts without calling any APIs
- **Exclusion filtering:** Skip contacts who have already been emailed
- **Confirmation prompts:** Every send action requires `y/n` confirmation
- **Idempotent imports:** `updateExistingContacts: true` prevents duplicates on re-run
- **SMS logging:** Every SMS result (success/failure) logged with phone number
- **No duplicate emails:** Brevo prevents resending the same campaign to the same list
- **Placeholder emails:** SMS-only contacts get `{phone}@sms-placeholder.local` (Brevo requires an email per contact, but these never receive email campaigns)

## Testing

```bash
npm test
```

Tests cover: phone number normalization, name cleaning, spend parsing, CSV deduplication, Brevo payload shape, import attribute definitions, email HTML content/merge tags, SMS character limits, log file writing, exclusion filtering, Square API client, and test mode.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BREVO_API_KEY` | Yes | Your Brevo API key (for email + contacts) |
| `TWILIO_ACCOUNT_SID` | For SMS | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | For SMS | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | For SMS | Twilio phone number in E.164 format |
| `BREVO_SENDER_EMAIL` | No | Sender email (must be verified in Brevo) |
| `SQUARE_ACCESS_TOKEN` | No | Square API token (for option 7/8 — pull from Square API) |
| `SQUARE_ENVIRONMENT` | No | `production` (default) or `sandbox` |
| `EXCLUSION_CSV_PATH` | No | Path to exclusion CSV (default: `./data/exclusion.csv`) |
| `TEST_EMAIL` | No | Your email for test mode (option 6) |
| `TEST_PHONE` | No | Your phone in E.164 format for test mode |
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
