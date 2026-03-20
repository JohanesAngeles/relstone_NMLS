const http = require('http');
const data = JSON.stringify({ type: 'system', title: 'test', body: 'x' });
const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/notifications/trigger',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    Authorization: 'Bearer invalid',
  },
};
const req = http.request(options, (res) => {
  console.log('status', res.statusCode);
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('body', body); });
});
req.on('error', (err) => console.error('error', err.message));
req.write(data);
req.end();
