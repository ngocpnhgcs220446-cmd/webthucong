import re

with open("src/pages/Contact.jsx", "r") as f:
    text = f.read()

# Replace import
if "import { apiFetch }" in text:
    text = text.replace("import { apiFetch } from '../utils/apiFetch';", "import { apiCall } from '../utils/apiFetch';")

# Replace fetch call
old_fetch = """      const data = await apiFetch('/api/leads', {
        method: 'POST',
        body: JSON.stringify(payload)
      });"""
new_fetch = """      console.log('[Lead Submit]', {
        name: payload?.name || null,
        email: payload?.email || null,
        hasPhone: Boolean(payload?.phone),
        hasMessage: Boolean(payload?.message),
        serviceId: payload?.serviceId || null,
        source: payload?.source || null,
      });

      const data = await apiCall('/api/leads', {
        method: 'POST',
        body: payload
      });"""
if old_fetch in text:
    text = text.replace(old_fetch, new_fetch)
else:
    print("WARNING: Old fetch not found!")

# Replace catch block
old_catch = """    } catch (e) {
      console.error('[Contact Form] Submit failed:', e);
      if (e.fields) {
        setErrors(e.fields);
        toast.error('Please fix validation errors', { id: toastId });
      } else {
        const errorMsg = e.error || e.message || 'Failed to submit inquiry. Please try again.';
        toast.error(errorMsg, { id: toastId });
      }
    }"""
new_catch = """    } catch (e) {
      console.error('[Lead Submit Failed]', {
        status: e.status,
        response: e.message,
        fields: e.fields,
        submittedKeys: Object.keys(payload || {}),
      });

      if (e.fields && Object.keys(e.fields).length > 0) {
        setErrors(e.fields);
        toast.error('Vui lòng kiểm tra lại thông tin.', { id: toastId });
      } else {
        const errorMsg = e.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.';
        toast.error(errorMsg, { id: toastId });
      }
    }"""
if old_catch in text:
    text = text.replace(old_catch, new_catch)
else:
    print("WARNING: Old catch not found!")

with open("src/pages/Contact.jsx", "w") as f:
    f.write(text)

print("Contact.jsx patched successfully.")
