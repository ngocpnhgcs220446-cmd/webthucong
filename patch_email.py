import re

with open("server/email.js", "r") as f:
    text = f.read()

# Fix getTransporter to use SMTP_SECURE correctly
old_transporter = """  if (!transporter) {
    const port = Number(process.env.SMTP_PORT);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }"""
new_transporter = """  if (!transporter) {
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
  }"""
if old_transporter in text:
    text = text.replace(old_transporter, new_transporter)
    print("Patched getTransporter")

# Fix sendAdminLeadNotification
old_admin = """export const sendAdminLeadNotification = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Admin Notification skipped for ${lead.referenceCode}`);
    return 'skipped';
  }

  let adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_NOTIFY_EMAIL is missing. Fallback to SMTP_USER');
    adminEmail = process.env.SMTP_USER;
  }"""
new_admin = """export const sendAdminLeadNotification = async (lead) => {
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
if old_admin in text:
    text = text.replace(old_admin, new_admin)
    print("Patched sendAdminLeadNotification setup")

old_admin_send = """  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: adminEmail,
      replyTo: lead.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    return 'sent';
  } catch (error) {
    console.error(`[Email Error] Failed to send Admin Notification for ${lead.referenceCode}:`, error);
    throw error;
  }"""
new_admin_send = """  try {
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
if old_admin_send in text:
    text = text.replace(old_admin_send, new_admin_send)
    print("Patched sendAdminLeadNotification send")

# Fix sendCustomerLeadConfirmation
old_customer = """export const sendCustomerLeadConfirmation = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Customer Confirmation skipped for ${lead.referenceCode}`);
    return 'skipped';
  }

  let replyToEmail = process.env.COMPANY_SUPPORT_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.SMTP_USER;"""
new_customer = """export const sendCustomerLeadConfirmation = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Customer Confirmation skipped for ${lead.referenceCode}`);
    return { sent: false, reason: 'smtp-not-configured' };
  }

  let replyToEmail = process.env.COMPANY_SUPPORT_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFY_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.SMTP_USER;"""
if old_customer in text:
    text = text.replace(old_customer, new_customer)
    print("Patched sendCustomerLeadConfirmation setup")

old_customer_send = """  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: lead.email,
      replyTo: replyToEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    });
    return 'sent';
  } catch (error) {
    console.error(`[Email Error] Failed to send Customer Confirmation for ${lead.referenceCode}:`, error);
    throw error;
  }"""
new_customer_send = """  try {
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
if old_customer_send in text:
    text = text.replace(old_customer_send, new_customer_send)
    print("Patched sendCustomerLeadConfirmation send")


with open("server/email.js", "w") as f:
    f.write(text)

