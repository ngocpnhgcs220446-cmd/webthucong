import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const smtpConfigured = Boolean(process.env.SMTP_HOST) && Boolean(process.env.SMTP_PORT) && Boolean(process.env.SMTP_USER) && Boolean(process.env.SMTP_PASS) && Boolean(process.env.SMTP_FROM);

console.log('[SMTP] Configuration:', {
  hostConfigured: Boolean(process.env.SMTP_HOST),
  portConfigured: Boolean(process.env.SMTP_PORT),
  userConfigured: Boolean(process.env.SMTP_USER),
  passConfigured: Boolean(process.env.SMTP_PASS),
  fromConfigured: Boolean(process.env.SMTP_FROM),
  adminEmailConfigured: Boolean(process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFY_EMAIL),
});

if (!smtpConfigured) {
  console.log('Missing SMTP variables, aborting test.');
  process.exit(1);
}

const port = Number(process.env.SMTP_PORT);
const secureConfig = process.env.SMTP_SECURE ? String(process.env.SMTP_SECURE).toLowerCase() === 'true' : port === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: secureConfig,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function runTest() {
  try {
    await transporter.verify();
    console.log('[SMTP] Connection verified. verify success');
    
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: adminEmail,
      subject: 'Test Email from Conical Hat Workshop',
      text: 'This is a test email.',
    });
    
    console.log('accepted:', info.accepted);
    console.log('rejected:', info.rejected);
    console.log('messageId:', info.messageId);
    
  } catch (error) {
    console.error('[SMTP] Verification failed:', {
      code: error?.code || null,
      message: error?.message || null,
    });
  }
}

runTest();
