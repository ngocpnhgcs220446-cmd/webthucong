import './config.js';
import 'dotenv/config';
import { sendAdminLeadNotification, sendCustomerLeadConfirmation } from './email.js';

async function testEmail() {
  console.log('--- STARTING EMAIL TEST ---');
  
  const context = {
    requestId: 'EMAIL-TEST-001',
    customerName: 'Email Test',
    customerEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'test@example.com',
    customerPhone: '0900000000',
    customerMessage: 'Testing Resend email delivery.',
    serviceTitle: 'General enquiry',
  };

  console.log('Sending Admin Notification...');
  const adminResult = await sendAdminLeadNotification(context);
  console.log('Admin Result:', adminResult);

  console.log('\nSending Customer Confirmation...');
  const customerResult = await sendCustomerLeadConfirmation(context);
  console.log('Customer Result:', customerResult);
  
  console.log('--- TEST FINISHED ---');
  process.exit(0);
}

testEmail().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
