import nodemailer from 'nodemailer';

export const verifyEmailConnection = async () => {
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
};

const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

let transporter = null;

const getTransporter = () => {
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
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const wrapEmailHtml = (content, companyName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f1f5f9" style="width: 100%; background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td bgcolor="#0f3f2c" style="background-color: #0f3f2c; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">${escapeHtml(companyName)}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px; color: #334155; line-height: 1.6; font-size: 15px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 13px;">
              &copy; ${new Date().getFullYear()} ${escapeHtml(companyName)}. All rights reserved.<br>
              This is an automated message, please do not reply directly to this email address unless otherwise stated.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendAdminLeadNotification = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Admin Notification skipped for ${lead.referenceCode}`);
    return 'skipped';
  }

  let adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!adminEmail) {
    console.warn('ADMIN_NOTIFY_EMAIL is missing. Fallback to SMTP_USER');
    adminEmail = process.env.SMTP_USER;
  }

  const publicSiteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:5173';
  const adminUrl = `${publicSiteUrl}/admin/leads`;
  const companyName = process.env.COMPANY_NAME || 'Experience Platform';
  
  const subject = lead.serviceNameSnapshot && lead.serviceNameSnapshot !== 'Need consultation'
    ? `New booking request — ${lead.name} — ${lead.serviceNameSnapshot}`
    : `New consultation request — ${lead.name}`;

  const textContent = `
${companyName}
New booking request

Reference: ${lead.referenceCode}

Customer information
Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone || 'N/A'}

Booking details
Service: ${lead.serviceNameSnapshot || 'Need consultation'}
Package: ${lead.packageNameSnapshot || 'N/A'}
Preferred date: ${lead.date || 'Flexible'}
Guests: ${lead.guests || 'N/A'}

Customer message:
${lead.message || 'No message provided.'}

[Open Lead Management]: ${adminUrl}

This is an automated notification.
  `.trim();

  const htmlContent = wrapEmailHtml(`
    <h2 style="margin-top: 0; color: #0f172a; font-size: 22px;">New Booking Request</h2>
    <p style="margin-bottom: 32px; color: #64748b; font-size: 15px;">
      Reference Code: <strong style="color: #0f172a; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">${lead.referenceCode}</strong>
    </p>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
      <tr>
        <!-- Left Column: Customer -->
        <td width="48%" valign="top">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Customer Info</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Name:</strong><br>${escapeHtml(lead.name)}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong><br>${escapeHtml(lead.email)}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Phone:</strong><br>${escapeHtml(lead.phone) || 'N/A'}</p>
        </td>
        <td width="4%"></td>
        <!-- Right Column: Booking -->
        <td width="48%" valign="top">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Booking Details</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Service:</strong><br>${escapeHtml(lead.serviceNameSnapshot) || 'Need consultation'}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Package:</strong><br>${escapeHtml(lead.packageNameSnapshot) || 'N/A'}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Date:</strong><br>${escapeHtml(lead.date) || 'Flexible'}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Guests:</strong><br>${lead.guests || 'N/A'}</p>
        </td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">Customer Message</h3>
      <p style="margin: 0; white-space: pre-wrap; font-style: italic; color: #475569; font-size: 15px;">${escapeHtml(lead.message) || 'No message provided.'}</p>
    </div>

    <div style="text-align: center;">
      <a href="${adminUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0f3f2c; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Open Lead Management</a>
    </div>
  `, companyName);

  try {
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
  }
};

export const sendCustomerLeadConfirmation = async (lead) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Customer Confirmation skipped for ${lead.referenceCode}`);
    return 'skipped';
  }

  let replyToEmail = process.env.COMPANY_SUPPORT_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!replyToEmail) replyToEmail = process.env.SMTP_USER;

  const companyName = process.env.COMPANY_NAME || 'Experience Platform';
  const companyPhone = process.env.COMPANY_PHONE || '';
  
  const subject = `We received your booking request — ${lead.referenceCode}`;
  
  const textContent = `
${companyName}

Dear ${lead.name},

Your request has been received successfully.
Our team will review the details and contact you shortly.
Your booking is not confirmed until you receive a final confirmation from our team.

--- Booking Summary ---
Reference Code: ${lead.referenceCode}
Service: ${lead.serviceNameSnapshot || 'Need consultation'}
Package: ${lead.packageNameSnapshot || 'N/A'}
Preferred Date: ${lead.date || 'Flexible'}
Guests: ${lead.guests || 'N/A'}

Customer message:
${lead.message || 'No message provided.'}

If you have any questions, please reply to this email.
${companyPhone ? `Phone: ${companyPhone}` : ''}
  `.trim();

  const htmlContent = wrapEmailHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${escapeHtml(lead.name)}</strong>,</p>
    
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
      <h2 style="margin: 0 0 8px 0; font-weight: 700; font-size: 18px;">Your request has been received!</h2>
      <p style="margin: 0 0 8px 0; font-size: 15px;">Our team will review your details and contact you shortly.</p>
      <p style="margin: 0; font-size: 14px; opacity: 0.9; font-style: italic;">Note: Your booking is not confirmed until you receive a final confirmation from our team.</p>
    </div>
    
    <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Booking Summary</h3>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; font-size: 15px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px;">Reference Code</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #0f172a;">${lead.referenceCode}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Service</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">${escapeHtml(lead.serviceNameSnapshot) || 'Need consultation'}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Package</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${escapeHtml(lead.packageNameSnapshot) || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Preferred date</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${escapeHtml(lead.date) || 'Flexible'}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Guests</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${lead.guests || 'N/A'}</td>
      </tr>
    </table>
    
    ${lead.message ? `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
      <h4 style="font-size: 14px; color: #64748b; margin-bottom: 8px; margin-top: 0;">Your Message:</h4>
      <p style="white-space: pre-wrap; font-style: italic; color: #475569; font-size: 15px; margin: 0;">${escapeHtml(lead.message)}</p>
    </div>
    ` : ''}
    
    <div style="margin-top: 32px; color: #64748b; font-size: 14px; line-height: 1.6;">
      <p style="margin-top: 0;">If you have any questions or need to make changes, simply reply directly to this email.</p>
      <p style="margin-bottom: 0;">Best regards,<br><strong style="color: #0f172a;">${escapeHtml(companyName)}</strong></p>
      ${companyPhone ? `<p style="margin-top: 4px;">Phone: ${escapeHtml(companyPhone)}</p>` : ''}
    </div>
  `, companyName);

  try {
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
  }
};

export const sendCustomerStatusChangeEmail = async (lead, newStatus) => {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Simulation] Status update (${newStatus}) skipped for ${lead.referenceCode}`);
    return 'skipped';
  }

  let replyToEmail = process.env.COMPANY_SUPPORT_EMAIL || process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;
  const companyName = process.env.COMPANY_NAME || 'Experience Platform';
  
  let subject = '';
  let statusTitle = '';
  let statusMessageText = '';
  let statusMessageHtml = '';
  let bgColor = '#f8fafc';
  let borderColor = '#e2e8f0';
  let textColor = '#334155';

  if (newStatus === 'confirmed') {
    subject = `Your booking is confirmed! — ${lead.referenceCode}`;
    statusTitle = 'Booking Confirmed';
    statusMessageText = `Great news! Your booking request for ${lead.serviceNameSnapshot || 'our service'} has been officially confirmed.\nWe look forward to seeing you.`;
    statusMessageHtml = `Great news! Your booking request for <strong>${escapeHtml(lead.serviceNameSnapshot) || 'our service'}</strong> has been officially confirmed.<br>We look forward to seeing you.`;
    bgColor = '#f0fdf4';
    borderColor = '#bbf7d0';
    textColor = '#166534';
  } else if (newStatus === 'cancelled') {
    subject = `Booking Cancelled — ${lead.referenceCode}`;
    statusTitle = 'Booking Cancelled';
    statusMessageText = `Your booking request for ${lead.serviceNameSnapshot || 'our service'} has been cancelled.\nIf you have any questions or would like to reschedule, please contact us.`;
    statusMessageHtml = `Your booking request for <strong>${escapeHtml(lead.serviceNameSnapshot) || 'our service'}</strong> has been cancelled.<br>If you have any questions or would like to reschedule, please contact us.`;
    bgColor = '#fef2f2';
    borderColor = '#fecaca';
    textColor = '#991b1b';
  } else if (newStatus === 'completed') {
    subject = `Thank you for joining us! — ${lead.referenceCode}`;
    statusTitle = 'Thank You';
    statusMessageText = `We hope you enjoyed your experience with ${companyName}.\nThank you for choosing us!`;
    statusMessageHtml = `We hope you enjoyed your experience with <strong>${escapeHtml(companyName)}</strong>.<br>Thank you for choosing us!`;
    bgColor = '#f8fafc';
    borderColor = '#e2e8f0';
    textColor = '#0f172a';
  } else {
    return 'skipped';
  }

  const textContent = `
${companyName}

Dear ${lead.name},

${statusTitle}
${statusMessageText}

--- Booking Summary ---
Reference Code: ${lead.referenceCode}
Service: ${lead.serviceNameSnapshot || 'N/A'}
Date: ${lead.bookingDate ? new Date(lead.bookingDate).toLocaleString() : (lead.date || 'N/A')}
Location: ${lead.bookingLocation || 'N/A'}

If you have any questions, please reply to this email.
  `.trim();

  const htmlContent = wrapEmailHtml(`
    <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>${escapeHtml(lead.name)}</strong>,</p>
    
    <div style="background-color: ${bgColor}; border: 1px solid ${borderColor}; color: ${textColor}; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">${statusTitle}</h2>
      <p style="margin: 0; font-size: 15px; line-height: 1.5;">${statusMessageHtml}</p>
    </div>
    
    <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Booking Details</h3>
    
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; font-size: 15px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 140px;">Reference Code</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #0f172a;">${lead.referenceCode}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Service</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">${escapeHtml(lead.serviceNameSnapshot) || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Scheduled Date</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${lead.bookingDate ? escapeHtml(new Date(lead.bookingDate).toLocaleString()) : escapeHtml(lead.date || 'N/A')}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;">Location</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${escapeHtml(lead.bookingLocation) || 'N/A'}</td>
      </tr>
    </table>
    
    <div style="margin-top: 32px; color: #64748b; font-size: 14px; line-height: 1.6;">
      <p style="margin-top: 0;">If you have any questions, please reply directly to this email.</p>
      <p style="margin-bottom: 0;">Best regards,<br><strong style="color: #0f172a;">${escapeHtml(companyName)}</strong></p>
    </div>
  `, companyName);

  try {
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
    console.error(`[Email Error] Failed to send Status Update for ${lead.referenceCode}:`, error);
    throw error;
  }
};
