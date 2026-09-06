export const otpEmailTemplate = (fullName: string, otp: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteTask Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Header Banner -->
          <tr>
            <td style="background-color: #2563eb; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 26px 24px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">NoteTask</div>
                    <div style="font-size: 13px; color: #bfdbfe; margin-top: 4px; font-weight: 500;">Account Security Verification</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">Verify Your Email Address</h2>
              
              <p style="margin: 0 0 10px; font-size: 15px; color: #334155; text-align: left; line-height: 1.5;">
                Hello <strong>${fullName || "there"}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #64748b; text-align: left;">
                Thank you for joining <strong>NoteTask</strong>! Please enter the 6-digit verification code below to confirm your email and activate your account:
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px; width: 100%; max-width: 320px;">
                <tr>
                  <td style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 18px 20px; text-align: center;">
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; line-height: 1; margin-left: 8px;">
                      ${otp}
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 600;">
                      ⏱️ Valid for 5 minutes
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #94a3b8; text-align: center;">
                If you did not initiate this request, you can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 18px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} NoteTask. All rights reserved.
              </p>
              <p style="margin: 4px 0 0; font-size: 11px; color: #cbd5e1;">
                This is an automated security message. Please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
