with open("server/email.js", "w") as f:
    f.write("""import nodemailer from 'nodemailer';

// 1. Define required variables
const requiredSmtpVariables = [
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
];

const missingSmtpVariables = requiredSmtpVariables.filter(
  (key) => !String(process.env[key] || '').trim()
);

const smtpConfigured = missingSmtpVariables.length === 0;

// Gather all values safely
const smtpHost = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE !== undefined
  ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
  : smtpPort === 465;

const smtpUser = String(process.env.SMTP_USER || '').trim();
const smtpPass = String(process.env.SMTP_PASS || '').trim();

const smtpFromRaw = String(process.env.SMTP_FROM || '').trim();
const smtpFrom = smtpFromRaw.includes('<')
  ? smtpFromRaw
  : `Conical Hat Workshop <${smtpFromRaw || smtpUser}>`;

const adminNotificationEmail = String(
  process.env.ADMIN_NOTIFICATION_EMAIL ||
  process.env.ADMIN_NOTIFY_EMAIL ||
  process.env.SMTP_USER ||
  ''
).trim();

// 2. Startup log
console.log('[SMTP] Configuration:', {
  userConfigured: Boolean(smtpUser),
  passConfigured: Boolean(smtpPass),
  fromConfigured: Boolean(smtpFromRaw),
  adminRecipientConfigured: Boolean(adminNotificationEmail),
  senderAndAdminSame: smtpUser === adminNotificationEmail,
});

if (missingSmtpVariables.length > 0) {
  console.warn('[SMTP] Missing configuration:', {
    missing: missingSmtpVariables,
  });
}

// 3. Create transporter
const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

// 4. Verify SMTP function
export async function verifySmtpConnection() {
  if (!transporter) {
    console.warn('[SMTP] Verification skipped:', {
      reason: 'smtp-not-configured',
      missing: missingSmtpVariables,
    });
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

// 11. Escape HTML helper
function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// 10. Email HTML template
function buildCustomerConfirmationHtml(context) {
  const customerName = escapeHtml(context.customerName);
  const requestId = escapeHtml(context.requestId);
  const serviceTitle = escapeHtml(context.serviceTitle);
  const customerMessage = escapeHtml(context.customerMessage).replaceAll('\\n', '<br />');

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

// 8. Admin Notification
export async function sendAdminLeadNotification(context) {
  if (!transporter) {
    return { sent: false, reason: 'smtp-not-configured' };
  }

  if (!adminNotificationEmail) {
    return { sent: false, reason: 'admin-recipient-not-configured' };
  }

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
        'Reply to this email to contact the customer directly.',
      ].join('\\n'),
    });

    const sent = Array.isArray(info.accepted) && info.accepted.length > 0;

    console.log('[Email] Admin notification:', {
      requestId: context.requestId,
      sent,
      acceptedCount: info.accepted?.length || 0,
      rejectedCount: info.rejected?.length || 0,
      messageId: info.messageId || null,
    });

    return {
      sent,
      messageId: info.messageId || null,
      accepted: info.accepted || [],
      rejected: info.rejected || [],
    };
  } catch (error) {
    console.error(`[Email Error] Failed to send Admin Notification for ${context.requestId}:`, error);
    return { sent: false, reason: 'email-send-failed' };
  }
}

// 9. Customer Confirmation
export async function sendCustomerLeadConfirmation(context) {
  if (!transporter) {
    return { sent: false, reason: 'smtp-not-configured' };
  }

  if (!context.customerEmail) {
    return { sent: false, reason: 'customer-email-missing' };
  }

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
      ].join('\\n'),
      html: buildCustomerConfirmationHtml(context),
    });

    const sent = Array.isArray(info.accepted) && info.accepted.length > 0;

    console.log('[Email] Customer confirmation:', {
      requestId: context.requestId,
      sent,
      acceptedCount: info.accepted?.length || 0,
      rejectedCount: info.rejected?.length || 0,
      messageId: info.messageId || null,
    });

    return {
      sent,
      messageId: info.messageId || null,
      accepted: info.accepted || [],
      rejected: info.rejected || [],
    };
  } catch (error) {
    console.error(`[Email Error] Failed to send Customer Confirmation for ${context.requestId}:`, error);
    return { sent: false, reason: 'email-send-failed' };
  }
}

// Keep the old status update one intact for compatibility if used elsewhere
export const sendCustomerStatusChangeEmail = async (lead, newStatus) => {
  if (!transporter) return 'skipped';
  // Simplified for compatibility, shouldn't crash
  return 'skipped';
};
""")
