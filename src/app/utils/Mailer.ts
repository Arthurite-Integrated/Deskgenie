// import 'server-only';
import nodemailer from 'nodemailer';
import env from '@/app/config/env';

const success_login_html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Successful Login - Checkout</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
      line-height: 1.6;
      font-size: 15px;
      font-weight: 300;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
    }
    .header-img,
    .footer-img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px 8px 0 0;
    }
    h3 {
      font-weight: 600;
    }
    p {
      margin: 10px 0;
    }
    .footer {
      font-size: 12px;
      color: #777;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Image -->
    <img src="cid:welcomeImage" alt="Checkout Header" class="header-img" />

    <p>Hello {{USER_NAME}},</p>
    <h3>Welcome back! 😊</h3>
    <p>You have successfully logged in to <strong>Checkout</strong>.</p>
    <p>Your account was accessed from:</p>
    <p>IP Address: <strong>{{IP_ADDRESS}}</strong></p>
    <p>Time and Date: <strong>{{LOGIN_DATE}}</strong></p>

    <p>If this was you, you can safely disregard this email.</p>
    <p>If you did not initiate this login, please reset your password immediately and contact support at 
      <a href="mailto:{{MAIL}}">{{MAIL}}</a>.
    </p>

    <p>Thank you,<br>The Checkout Team</p>

    <hr />

    <!-- Footer -->
    <div class="footer">
      <p>&copy; {{CURRENT_YEAR}} Checkout Technologies. All rights reserved.</p>
      <p>You are receiving this email because you signed up on our app.</p>
    </div>

    <!-- Footer Image -->
  </div>
</body>
</html>
`


class Mailer {
  private transporter: nodemailer.Transporter;

constructor() {
  // this.transporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   secure: false, // true for 465, false for other ports
  //   auth: {
  //     user: env.NEXT_GENIE_MAIL,
  //     pass: env.NEXT_GENIE_MAIL_PASSWORD // Use App Password here
  //   },
  //   tls: {
  //     rejectUnauthorized: false
  //   },
  //   connectionTimeout: 60000, // 60 seconds
  //   greetingTimeout: 30000,   // 30 seconds
  //   socketTimeout: 60000      // 60 seconds
  // });
  this.transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // Fixed typo: was "smpt.hostinger.com"
    port: 587,
    secure: false, // true for 465, false for other ports like 587
    auth: {
        user: env.NEXT_GENIE_MAIL,
        pass: env.NEXT_GENIE_MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000      // 60 seconds
  });

  // Verify connection configuration
  this.verifyConnection();
}

private async verifyConnection(): Promise<void> {
  try {
    await this.transporter.verify();
    console.log('✅ SMTP connection verified successfully');
  } catch (error) {
    console.error('❌ SMTP connection verification failed:', error);
    console.log('🔧 Please check your Hostinger email credentials');
  }
}

  async sendMail(to: string, subject: string, text: string, attachments?: any[]): Promise<void> {
    try {
      const mailOptions = { from: `Genie <${env.NEXT_GENIE_MAIL}>`, to, subject, text, attachments };
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  }

  async sendMailWithHtml(to: string, subject: string, html: string, attachments?: any[]): Promise<void> {
    try {
      console.log('📧 Sending HTML email to:', to);
      const mailOptions = { from: `Genie <${env.NEXT_GENIE_MAIL}>`, to, subject, html, attachments };
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ HTML email sent successfully:', result.messageId);
    } catch (error) {
      console.error('❌ Failed to send HTML email:', error);
    }
  }

  async successLoginEmail(data: any): Promise<void> {
    try {
      const subject = 'Checkout Login Successful';
      const currentDate = new Date().toLocaleString();
      const currentYear = new Date().getFullYear();
      const { name, email, ip } = data;
      console.log("📧 Preparing login email for:", name, email, ip);
      
      // Replace placeholders in HTML template
      const htmlContent = success_login_html
        .replace('{{USER_NAME}}', name)
        .replace('{{IP_ADDRESS}}', ip || 'Unknown')
        .replace('{{LOGIN_DATE}}', currentDate)
        .replace('{{CURRENT_YEAR}}', currentYear.toString())
        .replaceAll('{{MAIL}}', env.NEXT_GENIE_MAIL);

      const result = await this.transporter.sendMail({
        from: `Checkout <${env.NEXT_GENIE_MAIL}>`,
        to: email,
        subject,
        html: htmlContent,
        attachments: [
          {
            filename: 'successlogin.png',
            path: './src/assets/successlogin.png',
            cid: 'welcomeImage',
          }
        ]
      });
      
      console.log('✅ Login notification email sent successfully:', result.messageId);
    } catch (error) {
      console.error('❌ Failed to send login notification email:', error);
      throw error;
    }
  }
}

export default Mailer;

console.log(`Mailer initialized with user: ${env.NEXT_GENIE_MAIL}`); 