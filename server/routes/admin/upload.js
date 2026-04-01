const express = require('express');
const router = express.Router();
const { uploadPDF, uploadVideo } = require('../../services/cloudinary');

// POST /api/admin/upload/pdf
router.post('/pdf', uploadPDF.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({
      message: 'PDF uploaded successfully',
      url: req.file.path,
    });
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// POST /api/admin/upload/video
router.post('/video', uploadVideo.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({
      message: 'Video uploaded successfully',
      url: req.file.path,
    });
  } catch (err) {
    console.error('Video upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;