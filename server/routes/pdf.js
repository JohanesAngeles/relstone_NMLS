const express = require('express');
const router  = express.Router();
const https   = require('https');
const http    = require('http');

router.get('/proxy', (req, res) => {
  const rawUrl = req.query.url;
  if (!rawUrl) return res.status(400).json({ error: 'Missing url param' });

  let decoded;
  try { decoded = decodeURIComponent(rawUrl); }
  catch { return res.status(400).json({ error: 'Invalid url' }); }

  if (!decoded.includes('drive.google.com') && !decoded.includes('dropbox.com')) {
    return res.status(403).json({ error: 'URL not allowed' });
  }

  const client = decoded.startsWith('https') ? https : http;
  
  const request = client.get(decoded, (proxyRes) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    proxyRes.pipe(res);
  });

  request.on('error', () => res.status(500).json({ error: 'Failed to fetch PDF' }));
});

module.exports = router;