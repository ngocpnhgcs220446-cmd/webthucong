import re

with open("src/pages/Contact.jsx", "r") as f:
    text = f.read()

old_success = """                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '24px', padding: '48px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <CheckCircle2 size={40} color="#16a34a" />
                  </div>
                  <h2 style={{ fontSize: '28px', color: '#166534', marginBottom: '16px' }}>Request Received!</h2>
                  <p style={{ fontSize: '16px', color: '#15803d', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                    Thank you for reaching out. We will review your inquiry and get back to you within 24 hours.
                  </p>
                  <button className="btn" onClick={() => setSubmittedData(null)}>Send another message</button>
                </div>"""

new_success = """                <div style={{ background: submittedData?.warning ? '#fffbeb' : '#f0fdf4', border: submittedData?.warning ? '1px solid #fde68a' : '1px solid #bbf7d0', borderRadius: '24px', padding: '48px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '80px', height: '80px', background: submittedData?.warning ? '#fef3c7' : '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    {submittedData?.warning ? <AlertTriangle size={40} color="#d97706" /> : <CheckCircle2 size={40} color="#16a34a" />}
                  </div>
                  <h2 style={{ fontSize: '28px', color: submittedData?.warning ? '#92400e' : '#166534', marginBottom: '16px' }}>Request Received!</h2>
                  
                  {submittedData?.warning ? (
                    <p style={{ fontSize: '16px', color: '#b45309', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                      Your enquiry was saved, but we could not send a confirmation email. Rest assured, our team has received your request and will contact you soon.
                    </p>
                  ) : (
                    <p style={{ fontSize: '16px', color: '#15803d', lineHeight: 1.6, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                      Thank you for reaching out. An email confirmation has been sent to your address. We will review your inquiry and get back to you within 24 hours.
                    </p>
                  )}
                  
                  <button className="btn" onClick={() => setSubmittedData(null)} style={{ background: submittedData?.warning ? '#d97706' : 'var(--green)' }}>Send another message</button>
                </div>"""

if old_success in text:
    text = text.replace(old_success, new_success)
else:
    print("WARNING: Old success block not found!")

with open("src/pages/Contact.jsx", "w") as f:
    f.write(text)
print("src/pages/Contact.jsx patched.")
