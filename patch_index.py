import re

with open("server/index.js", "r") as f:
    text = f.read()

old_response = """    const adminNotificationStatus = adminResult.status === 'fulfilled' ? adminResult.value : 'failed';
    const customerConfirmationStatus = customerResult.status === 'fulfilled' ? customerResult.value : 'failed';

    if (adminResult.status === 'rejected') {
      console.error('[Email Error] Admin notification failed:', adminResult.reason);
    }
    if (customerResult.status === 'rejected') {
      console.error('[Email Error] Customer confirmation failed:', customerResult.reason);
    }

    const warning = (adminNotificationStatus === 'failed' || customerConfirmationStatus === 'failed') 
      ? 'Your enquiry was saved, but email delivery could not be confirmed.' 
      : undefined;

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      warning,
      lead: {
        id: newLead.id,
        referenceCode: newLead.referenceCode,
        name: newLead.name,
        email: newLead.email,
        serviceNameSnapshot: newLead.serviceNameSnapshot
      },
      email: {
        adminNotification: adminNotificationStatus,
        customerConfirmation: customerConfirmationStatus
      }
    });"""

new_response = """    function normalizeEmailResult(result) {
      if (result.status === 'fulfilled') {
        return typeof result.value === 'object' ? result.value : { sent: false, reason: result.value };
      }
      return {
        sent: false,
        reason: result.reason?.code || result.reason?.message || 'email-send-failed',
      };
    }

    const adminEmail = normalizeEmailResult(adminResult);
    const customerEmail = normalizeEmailResult(customerResult);

    const warning = (adminEmail.sent && customerEmail.sent) 
      ? undefined 
      : 'Your enquiry was saved, but email delivery could not be fully confirmed.';

    res.status(201).json({
      success: true,
      leadId: newLead.id,
      requestId: newLead.referenceCode,
      warning,
      email: {
        adminNotificationSent: adminEmail.sent === true,
        customerConfirmationSent: customerEmail.sent === true,
      }
    });"""

if old_response in text:
    text = text.replace(old_response, new_response)
    print("Patched index.js response formatting")
else:
    print("WARNING: Could not find response formatting block.")

with open("server/index.js", "w") as f:
    f.write(text)

