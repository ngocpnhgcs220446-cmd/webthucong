const http = require('http');

const payload = JSON.stringify({
  name: "John Doe",
  email: "john@example.com",
  participants: 5,
  date: "2026-12-31"
});

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/leads',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, '\nResponse:', data));
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
