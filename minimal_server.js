const express = require('express');
const app = express();

app.use(express.json());

// Test route 1
app.get('/api/test1', (req, res) => {
  res.json({ message: 'test1 works' });
});

// Test router
const router = express.Router();
router.get('/test2', (req, res) => {
  res.json({ message: 'test2 works' });
});
router.post('/post', (req, res) => {
  res.json({ message: 'post works' });
});

app.use('/api', router);

// Test route 3
app.get('/api/test3', (req, res) => {
  res.json({ message: 'test3 works' });
});

app.listen(8001, () => {
  console.log('Minimal test server running on port 8001');
});
