import re

with open("server/index.js", "r") as f:
    text = f.read()

old_csp = """  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://i.pravatar.cc'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
    },
  },"""

new_csp = """  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://i.pravatar.cc'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      childSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
    },
  },"""

if old_csp in text:
    text = text.replace(old_csp, new_csp)
    with open("server/index.js", "w") as f:
        f.write(text)
    print("CSP patched successfully.")
else:
    print("WARNING: Old CSP block not found!")
