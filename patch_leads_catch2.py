import re

with open("server/index.js", "r") as f:
    text = f.read()

old_catch = """    const warning = (adminNotificationStatus === 'failed' || customerConfirmationStatus === 'failed') 
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});"""

new_catch = """    const warning = (adminNotificationStatus === 'failed' || customerConfirmationStatus === 'failed') 
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
    });
  } catch (error) {
    console.error('[Lead Submit] Failed:', {
      name: error?.name || null,
      code: error?.code || null,
      message: error?.message || null,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    next(error);
  }
});"""

if old_catch in text:
    text = text.replace(old_catch, new_catch)
    with open("server/index.js", "w") as f:
        f.write(text)
    print("Lead route catch block patched successfully.")
else:
    print("WARNING: Old outer catch block still not found!")
