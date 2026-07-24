import re

with open("server/index.js", "r") as f:
    text = f.read()

# Replace global error handler
old_handler = """app.use((error, req, res, next) => {
  console.error('[Error Middleware]:', error?.message || error);
  if (isProduction) {
    res.status(error.status || 500).json({ error: 'Internal server error' });
  } else {
    res.status(error.status || 500).json({ error: error?.message, stack: error?.stack });
  }
});"""

new_handler = """app.use((error, req, res, next) => {
  console.error('[Server Error]', {
    method: req.method,
    path: req.path,
    name: error?.name,
    message: error?.message,
  });

  return res.status(500).json({
    success: false,
    error: 'An unexpected server error occurred.',
    code: 'INTERNAL_SERVER_ERROR',
  });
});"""

if old_handler in text:
    text = text.replace(old_handler, new_handler)
else:
    print("WARNING: Old handler not found!")

with open("server/index.js", "w") as f:
    f.write(text)

print("Global error handler patched.")
