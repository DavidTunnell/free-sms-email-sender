const EMAIL_SUBJECT = 'Start earning Hearts with us \u2764\uFE0F Panda Hill Rewards is here!';

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
              <h1 style="color:#ffffff; margin:0; font-size:28px;">Panda Hill Rewards is HERE! \uD83D\uDC3C</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 40px; color:#333333; font-size:16px; line-height:1.6;">
              <p style="margin-top:0;">Hey {{contact.FIRSTNAME}},</p>

              <p>We just launched our <strong>Panda Hill loyalty program</strong> to say thank you for all the support from Castroville, TX \u2764\uFE0F</p>

              <p>Every time you order, you earn <strong>Hearts</strong> that turn into real rewards. Not points you forget about&hellip; actual food.</p>

              <h2 style="color:#d4342a; font-size:20px; margin-bottom:10px;">Here's what you can earn:</h2>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr><td style="padding:6px 0; font-size:16px;">\uD83E\uDD5F Free lumpia (spring rolls)</td></tr>
                <tr><td style="padding:6px 0; font-size:16px;">\uD83E\uDD5F Free dumplings</td></tr>
                <tr><td style="padding:6px 0; font-size:16px;">\uD83C\uDF57 Free full chicken entrees</td></tr>
                <tr><td style="padding:6px 0; font-size:16px;">\uD83D\uDCB5 Money off your order</td></tr>
                <tr><td style="padding:6px 0; font-size:16px;">\uD83C\uDF89 Even 25% off your entire meal</td></tr>
              </table>

              <p>It adds up fast. If you already come here, you might as well get rewarded for it.</p>

              <h2 style="color:#d4342a; font-size:20px; margin-bottom:10px;">How it works:</h2>
              <ol style="padding-left:20px; margin-bottom:20px;">
                <li style="margin-bottom:8px;">Enroll in the program with your phone number</li>
                <li style="margin-bottom:8px;">Earn 1 Heart for every $1 spent</li>
                <li style="margin-bottom:8px;">Unlock free rewards from us!</li>
              </ol>

              <p>You can enroll when you checkout online or in our store.</p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:30px auto;">
                <tr>
                  <td style="background-color:#d4342a; border-radius:6px; text-align:center;">
                    <a href="https://squaremktg.com/campaigns/83ktfB4hGvjy/landing?source=facebook&fbclid=IwY2xjawQxIJhleHRuA2FlbQIxMQBzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEe7Mw7Cne9Di0rWLdnuZ-T7yakVUfaKnS-5cRTsLDH7Mz-ymdc4F4xIxQBNJ4_aem_MGtX-bOGBQvJ8KLck0tnkw" style="display:inline-block; padding:14px 32px; color:#ffffff; text-decoration:none; font-size:18px; font-weight:bold;">Sign Up Now \u2764\uFE0F</a>
                  </td>
                </tr>
              </table>

              <p>We put love into every dish, and this is our way of saying thanks for being part of the Panda Hill family. \u2764\uFE0F</p>

              <p style="margin-bottom:0;">See you soon! \uD83D\uDC3C</p>
              <p style="margin-top:5px;"><strong>Joyce &amp; David</strong><br>
              Panda Hill &mdash; Asian Comfort Food<br>
              Castroville, TX<br>
              <a href="tel:2076800241" style="color:#d4342a; text-decoration:none;">207-680-0241</a></p>
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

const SMS_CONTENT =
  'Panda Hill here! \uD83D\uDC3C Join our NEW loyalty program & get a FREE appetizer. Visit pandahilltx.com or ask on your next visit! Reply STOP to opt out';

module.exports = { EMAIL_SUBJECT, EMAIL_HTML, SMS_CONTENT };
