const { createAndSendEmailCampaign } = require('./brevoClient');
const config = require('./config');

const EMAIL_SUBJECT = '\uD83D\uDC3C You\'re invited! Join Panda Hill Rewards & get FREE food';

const EMAIL_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Panda Hill Rewards</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#d4342a; padding:30px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:28px;">We miss you at Panda Hill! \uD83D\uDC3C</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 40px; color:#333333; font-size:16px; line-height:1.6;">
              <p style="margin-top:0;">Hey {{contact.FIRSTNAME}},</p>

              <p>We're excited to announce our brand new <strong>loyalty program</strong> &mdash; and because you've ordered with us before, you get first access.</p>

              <h2 style="color:#d4342a; font-size:20px; margin-bottom:10px;">Join now and get:</h2>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr><td style="padding:6px 0; font-size:16px;">\uD83C\uDF81 A <strong>FREE appetizer</strong> on us &mdash; no purchase needed</td></tr>
                <tr><td style="padding:6px 0; font-size:16px;">\u2B50 1 point for every $1 you spend</td></tr>
                <tr><td style="padding:6px 0; font-size:16px;">\uD83C\uDFC6 Unlock rewards like free entr&eacute;es, sides &amp; exclusive menu items</td></tr>
                <tr><td style="padding:6px 0; font-size:16px;">\uD83C\uDF82 A special birthday treat when your day comes around</td></tr>
              </table>

              <h2 style="color:#d4342a; font-size:20px; margin-bottom:10px;">Getting started is easy:</h2>
              <ol style="padding-left:20px; margin-bottom:20px;">
                <li style="margin-bottom:8px;">Visit <a href="https://www.pandahilltx.com" style="color:#d4342a;">pandahilltx.com</a></li>
                <li style="margin-bottom:8px;">Ask about Panda Hill Rewards on your next visit</li>
                <li style="margin-bottom:8px;">Start earning points on your very first order!</li>
              </ol>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:30px auto;">
                <tr>
                  <td style="background-color:#d4342a; border-radius:6px; text-align:center;">
                    <a href="https://www.pandahilltx.com" style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:18px; font-weight:bold;">Visit Panda Hill</a>
                  </td>
                </tr>
              </table>

              <p>We put love into every dish, and this is our way of saying thanks for being part of the Panda Hill family.</p>

              <p style="margin-bottom:0;">See you soon! \uD83D\uDC3C</p>
              <p style="margin-top:5px;"><strong>Joyce &amp; David</strong><br>
              Panda Hill &mdash; Asian Comfort Food<br>
              Castroville, TX</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9; padding:20px 40px; text-align:center; font-size:12px; color:#999999;">
              <p style="margin:0;">Panda Hill | Castroville, TX</p>
              <p style="margin:5px 0 0 0;">
                <a href="https://www.pandahilltx.com" style="color:#999999;">pandahilltx.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

async function runEmailCampaign(emailListId) {
  console.log('\nSending email campaign...');
  console.log(`  Subject: ${EMAIL_SUBJECT}`);
  console.log(`  Sender: ${config.senderName} <${config.senderEmail}>`);
  console.log(`  Target list ID: ${emailListId}`);

  const campaignId = await createAndSendEmailCampaign(
    emailListId,
    EMAIL_SUBJECT,
    EMAIL_HTML,
    config.senderName,
    config.senderEmail
  );

  console.log(`\nEmail campaign sent successfully! Campaign ID: ${campaignId}`);
  return campaignId;
}

module.exports = { runEmailCampaign };
