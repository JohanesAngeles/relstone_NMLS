const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Admin reports route' });
});

module.exports = router;