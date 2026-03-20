const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/notifications/trigger',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid_token'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

const payload = {
  type: 'system',
  title: 'Test',
  body: 'Test body'
};

req.write(JSON.stringify(payload));
req.end();
