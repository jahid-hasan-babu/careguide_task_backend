export const emailTemplate = (otp: any) => `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #FF7600, #45a049); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
          </div>
          <div style="padding: 20px 12px; text-align: center;">
              <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
              <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
              <p style="font-size: 36px; font-weight: bold; color: #FF7600; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${otp}</p>
              <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                  <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
              </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
              <p style="margin: 0;">© 2025 All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;

export const settingsUpdateEmailTemplate = (userName: string = "User") => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Policy Updates - VERDICT</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0e17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0c0e17; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #141724; border-radius: 16px; border: 1px solid #23283e; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); overflow: hidden;">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%); padding: 40px 30px 35px 30px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); display: inline-block; padding: 6px 16px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.25); margin-bottom: 16px;">
                                            <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Platform Notice</span>
                                        </div>
                                        <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px; line-height: 1.3;">
                                            Platform Policies Updated
                                        </h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 35px 35px 25px 35px;">
                            <p style="color: #f1f5f9; font-size: 17px; font-weight: 600; margin: 0 0 16px 0;">
                                Hello ${userName},
                            </p>
                            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                                We want to let you know that we have recently updated our platform policies to ensure greater transparency, enhanced user privacy, and better service across <strong style="color: #f1f5f9;">VERDICT</strong>.
                            </p>

                            <!-- Updated Sections Card -->
                            <div style="background-color: #1a1e30; border: 1px solid #282e49; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
                                <p style="color: #cbd5e1; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px 0;">
                                    What was updated:
                                </p>
                                
                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #23283e;">
                                            <table border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="width: 24px; vertical-align: middle; color: #818cf8; font-size: 16px;">📄</td>
                                                    <td style="color: #e2e8f0; font-size: 14px; font-weight: 500; padding-left: 8px;">Terms & Conditions</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; border-bottom: 1px solid #23283e;">
                                            <table border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="width: 24px; vertical-align: middle; color: #818cf8; font-size: 16px;">🔒</td>
                                                    <td style="color: #e2e8f0; font-size: 14px; font-weight: 500; padding-left: 8px;">Privacy Policy</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <table border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="width: 24px; vertical-align: middle; color: #818cf8; font-size: 16px;">ℹ️</td>
                                                    <td style="color: #e2e8f0; font-size: 14px; font-weight: 500; padding-left: 8px;">About Us & Guidelines</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 28px 0;">
                                Please log in to the application or open your account settings anytime to review the full details of these policies.
                            </p>

                            <!-- CTA Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div style="margin: 10px 0 20px 0;">
                                            <a href="#" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                                                View in App
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Signoff -->
                            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #23283e;">
                                <p style="color: #64748b; font-size: 13px; margin: 0 0 4px 0;">Best regards,</p>
                                <p style="color: #94a3b8; font-size: 14px; font-weight: 600; margin: 0;">The VERDICT Team</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #0f121d; padding: 25px 30px; border-top: 1px solid #1e2235;">
                            <p style="color: #475569; font-size: 12px; margin: 0 0 8px 0;">
                                You are receiving this mandatory notification because your account is active on VERDICT.
                            </p>
                            <p style="color: #334155; font-size: 12px; margin: 0;">
                                &copy; ${new Date().getFullYear()} VERDICT. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;