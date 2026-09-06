export const accountCreationEmail = (
  fullName: string,
  email: string,
  password: string
): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to NoteTask - Account Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);">
          
          <!-- Top Header Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border-radius: 50%; width: 52px; height: 52px; line-height: 52px; margin-bottom: 12px; font-size: 26px;">
                📝
              </div>
              <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                NoteTask
              </div>
              <div style="font-size: 13px; color: #dbeafe; margin-top: 4px; font-weight: 500; letter-spacing: 0.3px;">
                Secure Workspace & Notes Platform
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px; text-align: left;">
              <h2 style="margin: 0 0 12px; font-size: 21px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
                Welcome to NoteTask! 🎉
              </h2>
              
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
                Hello <strong>${fullName || "there"}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #64748b;">
                An account has been created for you by an administrator. You can now log in and access your workspace, manage your notes, and collaborate securely.
              </p>
              
              <!-- Credentials Card Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px;">
                    🔑 Your Account Credentials
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <!-- Email Row -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                      <tr>
                        <td width="35%" style="font-size: 13px; font-weight: 600; color: #64748b; vertical-align: middle;">
                          Email Address:
                        </td>
                        <td width="65%" style="font-size: 14px; font-weight: 600; color: #0f172a; vertical-align: middle; word-break: break-all;">
                          ${email}
                        </td>
                      </tr>
                    </table>

                    <!-- Password Row -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="35%" style="font-size: 13px; font-weight: 600; color: #64748b; vertical-align: middle;">
                          Password:
                        </td>
                        <td width="65%" style="vertical-align: middle;">
                          <div style="display: inline-block; background-color: #eff6ff; border: 1px dashed #3b82f6; border-radius: 6px; padding: 6px 14px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 15px; font-weight: 700; color: #1d4ed8; letter-spacing: 1px;">
                            ${password}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security Notice Banner -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 4px;">
                      🔒 Security Recommendation
                    </div>
                    <div style="font-size: 13px; line-height: 1.5; color: #78350f;">
                      We strongly recommend that you update your password after logging in for the first time. Keep your login details confidential and do not share them with anyone.
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you have questions or encounter any issues, please contact your system administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                © ${new Date().getFullYear()} NoteTask. All rights reserved.
              </p>
              <p style="margin: 6px 0 0; font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                This is an automated administrative notification. Please do not reply directly to this email.
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

export const userAccountCreatedTemplate = accountCreationEmail;
