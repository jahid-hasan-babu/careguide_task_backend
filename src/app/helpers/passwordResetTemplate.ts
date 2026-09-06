export const passwordResetOtpTemplate = (fullName: string, otp: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteTask Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Header Banner -->
          <tr>
            <td style="background-color: #dc2626; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 26px 24px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">NoteTask</div>
                    <div style="font-size: 13px; color: #fecaca; margin-top: 4px; font-weight: 500;">Password Recovery</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">Reset Your Password</h2>
              
              <p style="margin: 0 0 10px; font-size: 15px; color: #334155; text-align: left; line-height: 1.5;">
                Hello <strong>${fullName || "User"}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #64748b; text-align: left;">
                We received a request to reset your password. Use the 6-digit code below to proceed with resetting your account password:
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px; width: 100%; max-width: 320px;">
                <tr>
                  <td style="background-color: #fef2f2; border: 2px dashed #f87171; border-radius: 10px; padding: 18px 20px; text-align: center;">
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #dc2626; line-height: 1; margin-left: 8px;">
                      ${otp}
                    </div>
                    <div style="margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 600;">
                      ⏱️ Valid for 5 minutes
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning Box -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px; width: 100%;">
                <tr>
                  <td style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; text-align: left; line-height: 1.5;">
                    ⚠️ <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email. Your password will remain unchanged.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 18px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} NoteTask. All rights reserved.
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

export const passwordChangedSuccessTemplate = (fullName: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoteTask Password Updated</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 35px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Header Banner -->
          <tr>
            <td style="background-color: #059669; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 26px 24px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">NoteTask</div>
                    <div style="font-size: 13px; color: #d1fae5; margin-top: 4px; font-weight: 500;">Security Notification</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px; text-align: left;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a; text-align: center;">Password Updated Successfully</h2>
              
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.5;">
                Hello <strong>${fullName || "User"}</strong>,
              </p>
              
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 20px; width: 100%;">
                <tr>
                  <td style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; font-size: 14px; color: #166534;">
                    ✅ The password for your <strong>NoteTask</strong> account was successfully updated.
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #64748b;">
                All other active sessions on your account have been terminated for security. If you performed this update, no further action is needed.
              </p>
              
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #dc2626;">
                If you did <strong>not</strong> make this change, please contact support immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 18px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} NoteTask. All rights reserved.
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
