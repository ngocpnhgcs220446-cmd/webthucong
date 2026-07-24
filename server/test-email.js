import nodemailer from 'nodemailer';
import 'dotenv/config';

async function testSMTP() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    console.error('[SMTP Test] Missing required environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS)');
    process.exit(1);
  }

  console.log('[SMTP Test] Testing connection to', host, 'on port', port);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  try {
    await transporter.verify();
    console.log('[SMTP Test] Connection verified successfully!');
  } catch (err) {
    console.error('[SMTP Test] Verification failed:');
    console.error(err.message);
    console.error('If you are using Gmail, ensure you have 2-Step Verification enabled and are using an App Password, not your regular password.');
    process.exit(1);
  }

  try {
    console.log('[SMTP Test] Attempting to send a test email to', user);
    const info = await transporter.sendMail({
      from,
      to: user,
      subject: 'SMTP Diagnostic Test - Experience Platform',
      text: 'If you are reading this, your SMTP connection is fully working.'
    });
    console.log('[SMTP Test] Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
  } catch (err) {
    console.error('[SMTP Test] Failed to send email:');
    console.error(err.message);
  }
}

testSMTP();
