const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ── Configure Cloudinary ──────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── PDF Storage ───────────────────────────────────────────────────
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'nmls/pdfs',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  },
});

// ── Video Storage ─────────────────────────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'nmls/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
  },
});

// ── Multer Upload Instances ───────────────────────────────────────
const uploadPDF   = multer({ storage: pdfStorage });
const uploadVideo = multer({ storage: videoStorage });

module.exports = { cloudinary, uploadPDF, uploadVideo };