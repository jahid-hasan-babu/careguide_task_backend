export const passwordResetOtpTemplate = (fullName: string, otp: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset Code</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #1e293b;
    }
    .container {
      max-width: 540px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 32px 24px;
      text-align: center;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .description {
      font-size: 15px;
      line-height: 1.6;
      color: #64748b;
      margin-bottom: 28px;
    }
    .otp-box {
      display: inline-block;
      background: #fef2f2;
      border: 2px dashed #f87171;
      border-radius: 10px;
      padding: 16px 36px;
      margin: 0 auto 28px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #dc2626;
      font-family: 'Courier New', Courier, monospace;
    }
    .expiry {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .warning {
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #92400e;
      text-align: left;
      margin-top: 16px;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${fullName || "User"}!</div>
      <div class="description">
        We received a request to reset the password for your account. Please use the verification code below to continue.
      </div>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="expiry">Valid for 5 minutes</div>
      </div>
      <div class="warning">
        ⚠️ <strong>Security Notice:</strong> If you did not request a password reset, your account is still secure. Please disregard this email or update your password if you suspect unauthorized access.
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Secure Notes API. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};

export const passwordChangedSuccessTemplate = (fullName: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Changed Successfully</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #1e293b;
    }
    .container {
      max-width: 540px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #10b981, #059669);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
    }
    .content {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .description {
      font-size: 15px;
      line-height: 1.6;
      color: #64748b;
      margin-bottom: 20px;
    }
    .alert-box {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
      font-size: 14px;
      color: #166534;
      margin-bottom: 20px;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Updated</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${fullName || "User"}!</div>
      <div class="alert-box">
        ✅ The password for your account was successfully updated.
      </div>
      <div class="description">
        All active sessions on other devices have been invalidated for your safety. If you made this change, no further action is required.
      </div>
      <div class="description" style="font-size: 13px; color: #dc2626;">
        If you did NOT perform this action, please contact our support team immediately.
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Secure Notes API. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};
