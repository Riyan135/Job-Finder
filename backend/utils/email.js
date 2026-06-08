const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromEmail = process.env.FROM_EMAIL || user;
  const fromName = process.env.FROM_NAME || 'SmartJobFinder';

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">SmartJobFinder</h2>
          <p>${options.text}</p>
        </div>`,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Real Email Sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('Real Email sending failed, falling back to mock logger:', error.message);
    }
  }

  // Fallback / Mock delivery logger
  console.log('------------------------------------');
  console.log('[MOCK EMAIL DELIVERY]');
  console.log(`Sending Email to: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.text}`);
  console.log('------------------------------------');
  return Promise.resolve();
};

module.exports = sendEmail;
