import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// 1. Initial Configuration Load
const emailProvider = String(process.env.EMAIL_PROVIDER || 'resend').trim().toLowerCase();
const resendApiKey = String(process.env.RESEND_API_KEY || '').trim();
const emailFrom = String(process.env.EMAIL_FROM || '').trim();

const adminNotificationEmail = String(
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || ''
).trim();

// Setup Resend
const resendConfigured = emailProvider === 'resend' && Boolean(resendApiKey) && Boolean(emailFrom);
const resend = resendConfigured ? new Resend(resendApiKey) : null;

// Setup SMTP (Fallback)
const smtpHost = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE !== undefined
  ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
  : smtpPort === 465;

const smtpUser = String(process.env.SMTP_USER || '').trim();
const smtpPass = String(process.env.SMTP_PASS || '').trim();
const smtpFromRaw = String(process.env.SMTP_FROM || '').trim();

const smtpFrom = smtpFromRaw.includes('<') ? smtpFromRaw : `Conical Hat Workshop <${smtpFromRaw || smtpUser}>`;
const smtpConfigured = emailProvider === 'smtp' && Boolean(smtpUser) && Boolean(smtpPass) && Boolean(smtpFromRaw);

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

// 2. Startup Log
console.log('[Email] Configuration:', {
  provider: emailProvider,
  resendConfigured: Boolean(resend),
  apiKeyConfigured: Boolean(resendApiKey),
  fromConfigured: Boolean(emailFrom),
  adminRecipientConfigured: Boolean(adminNotificationEmail),
  smtpConfigured: Boolean(transporter),
});

const missingValues = [];
if (emailProvider === 'resend') {
  if (!resendApiKey) missingValues.push('RESEND_API_KEY');
  if (!emailFrom) missingValues.push('EMAIL_FROM');
} else if (emailProvider === 'smtp') {
  if (!smtpUser) missingValues.push('SMTP_USER');
  if (!smtpPass) missingValues.push('SMTP_PASS');
  if (!smtpFromRaw) missingValues.push('SMTP_FROM');
}

if (!adminNotificationEmail) missingValues.push('ADMIN_NOTIFICATION_EMAIL');

if (missingValues.length > 0) {
  console.warn('[Email] Missing configuration:', { missing: missingValues });
}

export async function verifySmtpConnection() {
  if (emailProvider !== 'smtp') {
    return { verified: true, reason: 'smtp-not-used' };
  }
  
  if (!transporter) {
    console.warn('[SMTP] Verification skipped:', { reason: 'smtp-not-configured', missing: missingValues });
    return { verified: false, reason: 'smtp-not-configured' };
  }

  try {
    await transporter.verify();
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
}

// Helper: Escape HTML
function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Helper: Build HTML for Customer Confirmation
function buildCustomerConfirmationHtml(context) {
  const customerName = escapeHtml(context.customerName);
  const requestId = escapeHtml(context.requestId);
  const serviceTitle = escapeHtml(context.serviceTitle);
  const customerMessage = escapeHtml(context.customerMessage).replaceAll('\n', '<br />');

  return `
    <!doctype html>
    <html lang="en">
      <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; color: #222;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; background: #ffffff; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 28px; background: #6b3f24; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px;">Enquiry received</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px;">
                    <p>Hello ${customerName},</p>
                    <p>Thank you for contacting Conical Hat Workshop. We have received your enquiry successfully.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background: #f8f5f1; border-radius: 8px;">
                      <tr>
                        <td style="padding: 16px;">
                          <strong>Reference:</strong> ${requestId}<br /><br />
                          <strong>Product:</strong> ${serviceTitle}
                        </td>
                      </tr>
                    </table>
                    <p><strong>Your message</strong></p>
                    <div style="padding: 16px; background: #fafafa; border-left: 4px solid #6b3f24;">
                      ${customerMessage}
                    </div>
                    <p style="margin-top: 24px;">Our team will review your enquiry and contact you as soon as possible.</p>
                    <p>Best regards,<br /><strong>Conical Hat Workshop</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Helper: Build HTML for Admin Notification
function buildAdminNotificationHtml(context) {
  const customerName = escapeHtml(context.customerName);
  const customerEmail = escapeHtml(context.customerEmail);
  const customerPhone = escapeHtml(context.customerPhone);
  const requestId = escapeHtml(context.requestId);
  const serviceTitle = escapeHtml(context.serviceTitle);
  const customerMessage = escapeHtml(context.customerMessage).replaceAll('\n', '<br />');

  return `
    <!doctype html>
    <html lang="en">
      <body style="margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; color: #222;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; background: #ffffff; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 28px; background: #2c3e50; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px;">New Enquiry — ${serviceTitle}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background: #f8f5f1; border-radius: 8px;">
                      <tr>
                        <td style="padding: 16px;">
                          <strong>Reference:</strong> ${requestId}<br /><br />
                          <strong>Name:</strong> ${customerName}<br />
                          <strong>Email:</strong> ${customerEmail}<br />
                          <strong>Phone:</strong> ${customerPhone}<br />
                        </td>
                      </tr>
                    </table>
                    <p><strong>Customer message</strong></p>
                    <div style="padding: 16px; background: #fafafa; border-left: 4px solid #2c3e50;">
                      ${customerMessage}
                    </div>
                    <p style="margin-top: 24px; color: #666;">Reply directly to this email to contact the customer.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Admin Notification
export async function sendAdminLeadNotification(context) {
  if (emailProvider === 'resend') {
    if (!resend) return { sent: false, reason: 'resend-not-configured' };
    if (!adminNotificationEmail) return { sent: false, reason: 'admin-recipient-not-configured' };

    const result = await resend.emails.send({
      from: emailFrom,
      to: [adminNotificationEmail],
      replyTo: context.customerEmail,
      subject: `New enquiry — ${context.serviceTitle}`,
      text: [
        'A new enquiry was submitted.',
        '',
        `Reference: ${context.requestId}`,
        `Name: ${context.customerName}`,
        `Email: ${context.customerEmail}`,
        `Phone: ${context.customerPhone}`,
        `Product: ${context.serviceTitle}`,
        '',
        'Message:',
        context.customerMessage,
        '',
        'Reply to this email to respond directly to the customer.',
      ].join('\n'),
      html: buildAdminNotificationHtml(context),
    });

    if (result.error) {
      console.error('[Email] Admin notification failed:', {
        requestId: context.requestId,
        provider: 'resend',
        errorName: result.error.name || null,
        errorMessage: result.error.message || null,
      });
      return { sent: false, reason: result.error.name || 'resend-send-failed' };
    }

    console.log('[Email] Admin notification sent:', {
      requestId: context.requestId,
      provider: 'resend',
      emailId: result.data?.id || null,
    });
    return { sent: Boolean(result.data?.id), provider: 'resend', emailId: result.data?.id || null };
  }

  // SMTP Fallback
  if (!transporter) return { sent: false, reason: 'smtp-not-configured' };
  if (!adminNotificationEmail) return { sent: false, reason: 'admin-recipient-not-configured' };

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: adminNotificationEmail,
      replyTo: context.customerEmail,
      subject: `New enquiry — ${context.serviceTitle}`,
      text: [
        'A new enquiry was submitted.',
        '',
        `Reference: ${context.requestId}`,
        `Name: ${context.customerName}`,
        `Email: ${context.customerEmail}`,
        `Phone: ${context.customerPhone}`,
        `Product: ${context.serviceTitle}`,
        '',
        'Message:',
        context.customerMessage,
        '',
        'Reply to this email to respond directly to the customer.',
      ].join('\n'),
      html: buildAdminNotificationHtml(context),
    });

    const sent = Array.isArray(info.accepted) && info.accepted.length > 0;
    console.log('[Email] Admin notification sent:', {
      requestId: context.requestId,
      provider: 'smtp',
      acceptedCount: info.accepted?.length || 0,
      rejectedCount: info.rejected?.length || 0,
      messageId: info.messageId || null,
    });
    return { sent, provider: 'smtp', messageId: info.messageId || null, accepted: info.accepted || [], rejected: info.rejected || [] };
  } catch (error) {
    console.error(`[Email Error] Failed to send Admin Notification for ${context.requestId}:`, error);
    return { sent: false, reason: 'email-send-failed' };
  }
}

// Customer Confirmation
export async function sendCustomerLeadConfirmation(context) {
  if (emailProvider === 'resend') {
    if (!resend) return { sent: false, reason: 'resend-not-configured' };
    if (!context.customerEmail) return { sent: false, reason: 'customer-email-missing' };

    const result = await resend.emails.send({
      from: emailFrom,
      to: [context.customerEmail],
      subject: `We received your enquiry — ${context.requestId}`,
      text: [
        `Hello ${context.customerName},`,
        '',
        'Thank you for contacting Conical Hat Workshop.',
        '',
        'Your enquiry has been received successfully.',
        '',
        `Reference: ${context.requestId}`,
        `Product: ${context.serviceTitle}`,
        '',
        'Your message:',
        context.customerMessage,
        '',
        'Our team will review your request and contact you as soon as possible.',
        '',
        'Best regards,',
        'Conical Hat Workshop',
      ].join('\n'),
      html: buildCustomerConfirmationHtml(context),
    });

    if (result.error) {
      console.error('[Email] Customer confirmation failed:', {
        requestId: context.requestId,
        provider: 'resend',
        errorName: result.error.name || null,
        errorMessage: result.error.message || null,
      });
      return { sent: false, reason: result.error.name || 'resend-send-failed' };
    }

    console.log('[Email] Customer confirmation sent:', {
      requestId: context.requestId,
      provider: 'resend',
      emailId: result.data?.id || null,
    });
    return { sent: Boolean(result.data?.id), provider: 'resend', emailId: result.data?.id || null };
  }

  // SMTP Fallback
  if (!transporter) return { sent: false, reason: 'smtp-not-configured' };
  if (!context.customerEmail) return { sent: false, reason: 'customer-email-missing' };

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: context.customerEmail,
      subject: `We received your enquiry — ${context.requestId}`,
      text: [
        `Hello ${context.customerName},`,
        '',
        'Thank you for contacting Conical Hat Workshop.',
        '',
        'We have received your enquiry successfully.',
        '',
        `Reference: ${context.requestId}`,
        `Product: ${context.serviceTitle}`,
        '',
        'Your message:',
        context.customerMessage,
        '',
        'Our team will review your enquiry and contact you as soon as possible.',
        '',
        'Please keep the reference number above for future communication.',
        '',
        'Best regards,',
        'Conical Hat Workshop',
      ].join('\n'),
      html: buildCustomerConfirmationHtml(context),
    });

    const sent = Array.isArray(info.accepted) && info.accepted.length > 0;
    console.log('[Email] Customer confirmation sent:', {
      requestId: context.requestId,
      provider: 'smtp',
      acceptedCount: info.accepted?.length || 0,
      rejectedCount: info.rejected?.length || 0,
      messageId: info.messageId || null,
    });
    return { sent, provider: 'smtp', messageId: info.messageId || null, accepted: info.accepted || [], rejected: info.rejected || [] };
  } catch (error) {
    console.error(`[Email Error] Failed to send Customer Confirmation for ${context.requestId}:`, error);
    return { sent: false, reason: 'email-send-failed' };
  }
}

// Keep the old status update one intact for compatibility if used elsewhere
export const sendCustomerStatusChangeEmail = async (lead, newStatus) => {
  return 'skipped';
};
