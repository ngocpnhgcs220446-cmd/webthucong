import re

with open("server/index.js", "r") as f:
    text = f.read()

# Replace validation block
old_val = """    const name = valid.normalizeName(data.name);
    const email = valid.normalizeEmail(data.email);
    const phone = valid.normalizePhone(data.phone);
    const date = String(data.date || data.preferredDate || '').trim();
    const message = String(data.message || '').trim().slice(0, 2000);

    const nameErr = valid.validateName(name, true);
    if (nameErr) errors.name = nameErr;

    const emailErr = valid.validateEmail(email, true);
    if (emailErr) errors.email = emailErr;

    const phoneErr = valid.validatePhone(phone, false);
    if (phoneErr) errors.phone = phoneErr;

    const dateErr = valid.validateDateString(date, false, false);
    if (dateErr && date) errors.date = dateErr;

    const rawGuests = String(data.guests || data.participants || '1');
    const parsedGuests = parseInt(rawGuests, 10);
    const guestErr = valid.validateInteger(parsedGuests, 1, 999, true);
    if (guestErr) errors.participants = guestErr;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }"""

new_val = """    const name = valid.normalizeName(data.name);
    const email = valid.normalizeEmail(data.email);
    const phone = valid.normalizePhone(data.phone);
    const date = String(data.date || data.preferredDate || '').trim();
    const message = String(data.message || '').trim().slice(0, 2000);

    if (!name) {
      errors.name = 'Vui lòng nhập họ tên / Name is required.';
    }

    if (!email) {
      errors.email = 'Vui lòng nhập email / Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ / Email is invalid.';
    }

    const phoneErr = valid.validatePhone(phone, false);
    if (phoneErr) errors.phone = phoneErr;

    const dateErr = valid.validateDateString(date, false, false);
    if (dateErr && date) errors.date = dateErr;

    const rawGuests = String(data.guests || data.participants || '1');
    const parsedGuests = parseInt(rawGuests, 10);
    const guestErr = valid.validateInteger(parsedGuests, 1, 999, true);
    if (guestErr) errors.participants = guestErr;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Please check the required fields.',
        code: 'VALIDATION_ERROR',
        fields: errors 
      });
    }"""

if old_val in text:
    text = text.replace(old_val, new_val)
else:
    print("WARNING: Old validation block not found!")


# Replace service fetching
old_service = """    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service || !service.active) {
        return res.status(400).json({ error: 'Validation failed', fields: { serviceId: 'Invalid or inactive service' } });
      }
      serviceNameSnapshot = service.title;"""
new_service = """    if (serviceId) {
      const service = await prisma.service.findUnique({ 
        where: { id: serviceId },
        select: { id: true, title: true, slug: true, status: true, active: true }
      });
      if (!service || !service.active) {
        return res.status(400).json({ 
          success: false,
          error: 'The selected service no longer exists.',
          code: 'SERVICE_NOT_FOUND',
          fields: { serviceId: 'Please select another service.' } 
        });
      }
      serviceNameSnapshot = service.title;"""
if old_service in text:
    text = text.replace(old_service, new_service)
else:
    print("WARNING: Old service block not found!")

with open("server/index.js", "w") as f:
    f.write(text)

print("server/index.js patched with strict validations.")
