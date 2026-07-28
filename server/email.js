import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// 1. Configuration
// ---------------------------------------------------------------------------
const emailProvider = String(process.env.EMAIL_PROVIDER || 'resend').trim().toLowerCase();
const resendApiKey  = String(process.env.RESEND_API_KEY  || '').trim();
const emailFrom     = String(process.env.EMAIL_FROM      || '').trim();

const adminNotificationEmail = String(
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFY_EMAIL || ''
).trim();

const resendConfigured = emailProvider === 'resend' && Boolean(resendApiKey) && Boolean(emailFrom);
const resend = resendConfigured ? new Resend(resendApiKey) : null;

console.log('[Email] Configuration:', {
  provider:                 emailProvider,
  resendConfigured:         Boolean(resend),
  apiKeyConfigured:         Boolean(resendApiKey),
  fromConfigured:           Boolean(emailFrom),
  adminRecipientConfigured: Boolean(adminNotificationEmail),
});

const missingValues = [];
if (emailProvider === 'resend') {
  if (!resendApiKey) missingValues.push('RESEND_API_KEY');
  if (!emailFrom)    missingValues.push('EMAIL_FROM');
}
if (!adminNotificationEmail) missingValues.push('ADMIN_NOTIFICATION_EMAIL');
if (missingValues.length > 0) {
  console.warn('[Email] Missing configuration:', { missing: missingValues });
}

// ---------------------------------------------------------------------------
// 2. Helpers
// ---------------------------------------------------------------------------
function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatMoney(amount, currency) {
  const cur = currency || 'VND';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: cur === 'VND' ? 0 : 2,
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(date);
}

// ---------------------------------------------------------------------------
// 3. HTML Templates
// ---------------------------------------------------------------------------
function buildAdminBookingHtml(ctx) {
  const ref         = escapeHtml(ctx.referenceCode);
  const name        = escapeHtml(ctx.customerName);
  const email       = escapeHtml(ctx.customerEmail);
  const phone       = escapeHtml(ctx.customerPhone);
  const service     = escapeHtml(ctx.serviceName);
  const bDate       = escapeHtml(formatDate(ctx.bookingDate));
  const eDate       = escapeHtml(formatDate(ctx.experienceDate));
  const qty         = escapeHtml(String(ctx.quantity));
  const unitFmt     = escapeHtml(formatMoney(ctx.unitPrice, ctx.currency));
  const totalFmt    = escapeHtml(formatMoney(ctx.totalAmount, ctx.currency));
  const note        = escapeHtml(ctx.customerNote || 'No additional note.').replaceAll('\n', '<br />');

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#222;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="padding:28px;background:#2c3e50;color:#fff;">
<h1 style="margin:0;font-size:22px;">New Booking &#8212; ${ref}</h1>
<p style="margin:8px 0 0;font-size:15px;opacity:.85;">Total: ${totalFmt}</p>
</td></tr>
<tr><td style="padding:28px;">
<h3 style="margin:0 0 12px;color:#2c3e50;">Customer Information</h3>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f1;border-radius:8px;margin-bottom:24px;">
<tr><td style="padding:16px;line-height:1.8;">
<strong>Name:</strong> ${name}<br/>
<strong>Email:</strong> ${email}<br/>
<strong>Phone:</strong> ${phone}
</td></tr></table>
<h3 style="margin:0 0 12px;color:#2c3e50;">Booking Details</h3>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f1;border-radius:8px;margin-bottom:24px;">
<tr><td style="padding:16px;line-height:1.8;">
<strong>Service:</strong> ${service}<br/>
<strong>Booking date:</strong> ${bDate}<br/>
<strong>Experience date:</strong> ${eDate}<br/>
<strong>Quantity:</strong> ${qty}<br/>
<strong>Unit price:</strong> ${unitFmt}<br/>
<strong>Total amount:</strong> <span style="color:#c0392b;font-weight:bold;">${totalFmt}</span>
</td></tr></table>
<h3 style="margin:0 0 12px;color:#2c3e50;">Customer Note</h3>
<div style="padding:16px;background:#fafafa;border-left:4px solid #2c3e50;border-radius:4px;">${note}</div>
<p style="margin-top:24px;color:#666;">Reply directly to this email to contact the customer.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function buildCustomerBookingHtml(ctx) {
  const ref      = escapeHtml(ctx.referenceCode);
  const name     = escapeHtml(ctx.customerName);
  const service  = escapeHtml(ctx.serviceName);
  const eDate    = escapeHtml(formatDate(ctx.experienceDate));
  const qty      = escapeHtml(String(ctx.quantity));
  const unitFmt  = escapeHtml(formatMoney(ctx.unitPrice, ctx.currency));
  const totalFmt = escapeHtml(formatMoney(ctx.totalAmount, ctx.currency));

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;color:#222;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="padding:28px;background:#6b3f24;color:#fff;">
<h1 style="margin:0;font-size:22px;">Booking Confirmed</h1>
<p style="margin:8px 0 0;font-size:15px;opacity:.85;">${ref}</p>
</td></tr>
<tr><td style="padding:28px;">
<p>Hello ${name},</p>
<p>Thank you for your booking with <strong>Conical Hat Workshop</strong>. Your booking has been recorded successfully.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f1;border-radius:8px;margin:24px 0;">
<tr><td style="padding:16px;line-height:1.8;">
<strong>Booking reference:</strong> <span style="font-family:monospace;">${ref}</span><br/>
<strong>Service:</strong> ${service}<br/>
<strong>Experience date:</strong> ${eDate}<br/>
<strong>Quantity:</strong> ${qty}<br/>
<strong>Unit price:</strong> ${unitFmt}<br/>
<strong>Total amount:</strong> <span style="color:#c0392b;font-weight:bold;">${totalFmt}</span>
</td></tr></table>
<p>Our team will contact you if any additional information is required.</p>
<p>Please keep your booking reference for future support.</p>
<p>Best regards,<br/><strong>Conical Hat Workshop</strong></p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

// ---------------------------------------------------------------------------
// 4. Send Admin Booking Notification
// ---------------------------------------------------------------------------
export async function sendAdminBookingNotification(context) {
  if (!resend)                return { sent: false, reason: 'email-provider-not-configured' };
  if (!adminNotificationEmail) return { sent: false, reason: 'admin-recipient-not-configured' };

  const unitFmt  = formatMoney(context.unitPrice,  context.currency);
  const totalFmt = formatMoney(context.totalAmount, context.currency);

  const result = await resend.emails.send({
    from:    emailFrom,
    to:      [adminNotificationEmail],
    replyTo: context.customerEmail,
    subject: `New booking \u2014 ${context.referenceCode} \u2014 ${totalFmt}`,
    text: [
      'A new booking has been received.',
      '',
      `Booking reference: ${context.referenceCode}`,
      '',
      'Customer information',
      `Name:  ${context.customerName}`,
      `Email: ${context.customerEmail}`,
      `Phone: ${context.customerPhone}`,
      '',
      'Booking details',
      `Service:         ${context.serviceName}`,
      `Booking date:    ${formatDate(context.bookingDate)}`,
      `Experience date: ${formatDate(context.experienceDate)}`,
      `Quantity:        ${context.quantity}`,
      `Unit price:      ${unitFmt}`,
      `Total amount:    ${totalFmt}`,
      '',
      'Customer note:',
      context.customerNote || 'No additional note.',
    ].join('\n'),
    html: buildAdminBookingHtml(context),
  });

  if (result.error) {
    console.error('[Email] Admin booking notification failed:', {
      referenceCode: context.referenceCode,
      errorName:     result.error.name    || null,
      errorMessage:  result.error.message || null,
    });
    return { sent: false, reason: result.error.name || 'resend-send-failed' };
  }

  console.log('[Email] Admin booking notification sent:', {
    referenceCode: context.referenceCode,
    provider: 'resend',
    emailId:  result.data?.id || null,
  });
  return { sent: Boolean(result.data?.id), emailId: result.data?.id || null };
}

// ---------------------------------------------------------------------------
// 5. Send Customer Booking Confirmation
// ---------------------------------------------------------------------------
export async function sendCustomerBookingConfirmation(context) {
  if (!resend)                 return { sent: false, reason: 'email-provider-not-configured' };
  if (!context.customerEmail)  return { sent: false, reason: 'customer-email-missing' };

  const resendOwnerEmail = String(process.env.RESEND_OWNER_EMAIL || '').trim().toLowerCase();
  const domainVerified   = String(process.env.RESEND_DOMAIN_VERIFIED || 'false').trim().toLowerCase() === 'true';

  if (!domainVerified && resendOwnerEmail && context.customerEmail.trim().toLowerCase() !== resendOwnerEmail) {
    console.warn('[Email] Customer confirmation skipped: domain not yet verified.', {
      referenceCode: context.referenceCode,
    });
    return { sent: false, reason: 'resend-domain-not-verified' };
  }

  const unitFmt  = formatMoney(context.unitPrice,  context.currency);
  const totalFmt = formatMoney(context.totalAmount, context.currency);

  const result = await resend.emails.send({
    from:    emailFrom,
    to:      [context.customerEmail],
    subject: `Booking confirmed \u2014 ${context.referenceCode}`,
    text: [
      `Hello ${context.customerName},`,
      '',
      'Thank you for your booking with Conical Hat Workshop.',
      'Your booking has been recorded successfully.',
      '',
      `Booking reference: ${context.referenceCode}`,
      '',
      'Booking details',
      `Service:         ${context.serviceName}`,
      `Experience date: ${formatDate(context.experienceDate)}`,
      `Quantity:        ${context.quantity}`,
      `Unit price:      ${unitFmt}`,
      `Total amount:    ${totalFmt}`,
      '',
      'Our team will contact you if any additional information is required.',
      'Please keep your booking reference for future support.',
      '',
      'Best regards,',
      'Conical Hat Workshop',
    ].join('\n'),
    html: buildCustomerBookingHtml(context),
  });

  if (result.error) {
    console.error('[Email] Customer booking confirmation failed:', {
      referenceCode: context.referenceCode,
      errorName:     result.error.name    || null,
      errorMessage:  result.error.message || null,
    });
    return { sent: false, reason: result.error.name || 'resend-send-failed' };
  }

  console.log('[Email] Customer booking confirmation sent:', {
    referenceCode: context.referenceCode,
    provider: 'resend',
    emailId:  result.data?.id || null,
  });
  return { sent: Boolean(result.data?.id), emailId: result.data?.id || null };
}

// Legacy aliases for backward compatibility with index.js imports
export const sendAdminLeadNotification    = sendAdminBookingNotification;
export const sendCustomerLeadConfirmation = sendCustomerBookingConfirmation;

export async function verifySmtpConnection() {
  return { verified: true, reason: 'smtp-not-used' };
}
