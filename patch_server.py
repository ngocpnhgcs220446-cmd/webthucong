with open("server/index.js", "r") as f:
    text = f.read()

# Fix undefined body crash
text = text.replace("const data = req.body;\n    const errors = {};", "const data = req.body || {};\n    const errors = {};")

# Find the end of lead creation where we respond with 201
old_response = """    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
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

new_response = """    const warning = (adminNotificationStatus === 'failed' || customerConfirmationStatus === 'failed') 
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

if old_response in text:
    text = text.replace(old_response, new_response)
else:
    print("WARNING: Old response block not found!")

with open("server/index.js", "w") as f:
    f.write(text)
print("server/index.js patched.")
