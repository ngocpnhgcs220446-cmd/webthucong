import re

with open("server/email.js", "r") as f:
    text = f.read()

# Replace the getTransporter section
old_get_transporter = """const getTransporter = () => {
  const requiredSmtpVariables = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
  ];

  const missingSmtpVariables = requiredSmtpVariables.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missingSmtpVariables.length > 0) {
    console.warn('Missing SMTP configuration for:', missingSmtpVariables.join(', '));
    return null;
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    const secureConfig = process.env.SMTP_SECURE 
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : port === 465;
      
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secureConfig,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};"""

new_get_transporter = """const getTransporter = () => {
  const smtpHost = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpUser = String(process.env.SMTP_USER || '').trim();
  const smtpPass = String(process.env.SMTP_PASS || '').trim();
  const smtpFromRaw = String(process.env.SMTP_FROM || '').trim();
  
  const adminNotificationEmail = String(
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_NOTIFY_EMAIL ||
    process.env.SMTP_USER ||
    ''
  ).trim();

  const missingSmtpVariables = [];
  if (!smtpUser) missingSmtpVariables.push('SMTP_USER');
  if (!smtpPass) missingSmtpVariables.push('SMTP_PASS');
  if (!smtpFromRaw) missingSmtpVariables.push('SMTP_FROM');

  const smtpConfigured = missingSmtpVariables.length === 0;

  if (!transporter && smtpConfigured) {
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure = process.env.SMTP_SECURE !== undefined
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : smtpPort === 465;
      
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    
    // Output safety logs once on create
    console.log('[SMTP] Configuration:', {
      hostConfigured: Boolean(smtpHost),
      port: smtpPort,
      secure: smtpSecure,
      userConfigured: Boolean(smtpUser),
      passConfigured: Boolean(smtpPass),
      fromConfigured: Boolean(smtpFromRaw),
      adminRecipientConfigured: Boolean(adminNotificationEmail),
      senderAndAdminSame: smtpUser === adminNotificationEmail,
    });
  } else if (!transporter && !smtpConfigured) {
    console.warn('[SMTP] Missing configuration:', { missing: missingSmtpVariables });
  }

  return transporter;
};

const getSmtpFrom = () => {
  const smtpUser = String(process.env.SMTP_USER || '').trim();
  const smtpFromRaw = String(process.env.SMTP_FROM || '').trim();
  return smtpFromRaw.includes('<') 
    ? smtpFromRaw 
    : `Conical Hat Workshop <${smtpFromRaw || smtpUser}>`;
};

const getAdminEmail = () => {
  return String(
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_NOTIFY_EMAIL ||
    process.env.SMTP_USER ||
    ''
  ).trim();
};
"""

if old_get_transporter in text:
    text = text.replace(old_get_transporter, new_get_transporter)
    print("Patched getTransporter")

# Replace verifyEmailConnection
old_verify = """export const verifyEmailConnection = async () => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('SMTP verification skipped: SMTP credentials not provided.');
    return;
  }
  try {
    await mailer.verify();
    console.log('SMTP connection successful');
  } catch (error) {
    console.error('SMTP verification failed:', error.message);
  }
};"""

new_verify = """export const verifyEmailConnection = async () => {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('[SMTP] Verification skipped:', { reason: 'smtp-not-configured' });
    return { verified: false, reason: 'smtp-not-configured' };
  }
  try {
    await mailer.verify();
    console.log('[SMTP] Connection verified.');
    return { verified: true };
  } catch (error) {
    console.error('[SMTP] Verification failed:', {
      code: error?.code || null,
      responseCode: error?.responseCode || null,
      command: error?.command || null,
      message: error?.message || null,
    });
    return { verified: false, reason: error?.code || 'smtp-verification-failed' };
  }
};"""

if old_verify in text:
    text = text.replace(old_verify, new_verify)
    print("Patched verifyEmailConnection")

# Replace sendAdminLeadNotification
old_admin = """export const sendAdminLeadNotification = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Admin Notification skipped for ${lead.referenceCode}`);
    return { sent: false, reason: 'smtp-not-configured' };
  }

  let adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_NOTIFICATION_EMAIL is missing. Fallback to SMTP_USER');
    adminEmail = process.env.SMTP_USER;
  }"""
new_admin = """export const sendAdminLeadNotification = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) return { sent: false, reason: 'smtp-not-configured' };

  const adminEmail = getAdminEmail();
  if (!adminEmail) return { sent: false, reason: 'admin-recipient-not-configured' };"""
if old_admin in text:
    text = text.replace(old_admin, new_admin)
    print("Patched sendAdminLeadNotification setup")

old_admin_send = """  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: adminEmail,
      replyTo: lead.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    return { sent: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  } catch (error) {
    console.error(`[Email Error] Failed to send Admin Notification for ${lead.referenceCode}:`, error);
    throw error;
  }"""
new_admin_send = """  try {
    const info = await mailer.sendMail({
      from: getSmtpFrom(),
      to: adminEmail,
      replyTo: lead.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    
    const sent = Array.isArray(info.accepted) && info.accepted.length > 0;
    console.log('[Email] Admin notification result:', {
      requestId: lead.referenceCode,
      sent,
      acceptedCount: info.accepted?.length || 0,
      rejectedCount: info.rejected?.length || 0,
      messageId: info.messageId || null,
    });
    
    return { 
      sent, 
      messageId: info.messageId || null, 
      accepted: info.accepted || [], 
      rejected: info.rejected || [] 
    };
  } catch (error) {
    console.error(`[Email Error] Failed to send Admin Notification for ${lead.referenceCode}:`, error);
    throw error;
  }"""
if old_admin_send in text:
    text = text.replace(old_admin_send, new_admin_send)
    print("Patched sendAdminLeadNotification send")


# Replace sendCustomerLeadConfirmation
old_customer = """export const sendCustomerLeadConfirmation = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Customer Confirmation skipped for ${lead.referenceCode}`);
    return { sent: false, reason: 'smtp-not-configured' };
  }

  let replyToEmail = process.env.COMPANY_SUPPORT_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFY_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.SMTP_USER;"""
new_customer = """export const sendCustomerLeadConfirmation = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) return { sent: false, reason: 'smtp-not-configured' };

  if (!lead.email) return { sent: false, reason: 'customer-email-missing' };

  let replyToEmail = process.env.COMPANY_SUPPORT_EMAIL || getAdminEmail();"""
if old_customer in text:
    text = text.replace(old_customer, new_customer)
    print("Patched sendCustomerLeadConfirmation setup")

old_customer_send = """  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: lead.email,
      replyTo: replyToEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    return { sent: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  } catch (error) {
    console.error(`[Email Error] Failed to send Customer Confirmation for ${lead.referenceCode}:`, error);
    throw error;
  }"""
new_customer_send = """  try {
    const info = await mailer.sendMail({
      from: getSmtpFrom(),
      to: lead.email,
      replyTo: replyToEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    
    const sent = Array.isArray(info.accepted) && info.accepted.length > 0;
    console.log('[Email] Customer confirmation result:', {
      requestId: lead.referenceCode,
      sent,
      acceptedCount: info.accepted?.length || 0,
      rejectedCount: info.rejected?.length || 0,
      messageId: info.messageId || null,
    });
    
    return { 
      sent, 
      messageId: info.messageId || null, 
      accepted: info.accepted || [], 
      rejected: info.rejected || [] 
    };
  } catch (error) {
    console.error(`[Email Error] Failed to send Customer Confirmation for ${lead.referenceCode}:`, error);
    throw error;
  }"""
if old_customer_send in text:
    text = text.replace(old_customer_send, new_customer_send)
    print("Patched sendCustomerLeadConfirmation send")


with open("server/email.js", "w") as f:
    f.write(text)
