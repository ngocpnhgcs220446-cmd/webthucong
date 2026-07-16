import nodemailer from 'nodemailer';

export const sendLeadNotification = async (lead) => {
  if (!process.env.SMTP_HOST) {
    console.log('[Email Simulation] New Lead received:', lead);
    return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@example.com',
      to: process.env.ADMIN_NOTIFY_EMAIL || 'admin@example.com',
      subject: `New Lead: ${lead.name} - ${lead.serviceNameSnapshot || lead.serviceId || 'General Inquiry'}`,
      text: `
You have received a new booking inquiry!

Name: ${lead.name}
Email: ${lead.email}
Phone: ${lead.phone}
Service: ${lead.serviceNameSnapshot || lead.serviceId || 'N/A'}
Preferred Date: ${lead.date || 'Flexible'}
Guests/Pax: ${lead.guests}
Message: ${lead.message || 'No message provided'}

Review and manage this lead at:
http://localhost:5173/admin/contact
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Notification] Successfully sent to ${mailOptions.to}`);
  } catch (err) {
    console.error('[Email Notification Error] Failed to send email:', err.message);
  }
};
