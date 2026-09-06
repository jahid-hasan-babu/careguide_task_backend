export const otpEmailTemplate = (fullName: string, otp: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification Code</title>
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
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 10px;
      padding: 16px 36px;
      margin: 0 auto 28px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1d4ed8;
      font-family: 'Courier New', Courier, monospace;
    }
    .expiry {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
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
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${fullName || "there"}!</div>
      <div class="description">
        Thank you for registering. Please use the verification code below to verify your email and activate your account.
      </div>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div class="expiry">Valid for 5 minutes</div>
      </div>
      <div class="description" style="font-size: 13px; margin-bottom: 0;">
        If you did not request this email, please ignore this message.
      </div>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Secure Notes API. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};
