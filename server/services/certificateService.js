// ─────────────────────────────────────────────────────────────────
// Generate Certificate Data (simplified - for storage/display)
// ─────────────────────────────────────────────────────────────────

/**
 * Generate a certificate record with metadata.
 * In production, integrate with a PDF generation service (pdfkit, html2pdf, etc.)
 * or use a service like PDFShift, DocRaptor, etc.
 */
const generateCertificateMetadata = (user, course, completedDate) => {
  return {
    studentName: user.name,
    studentEmail: user.email,
    courseName: course.title,
    creditHours: course.credit_hours,
    courseId: course.nmls_course_id,
    completionDate: completedDate,
    certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    issuedAt: new Date(),
  };
};

/**
 * Generate a downloadable certificate URL
 * For MVP, we return a data URL or redirect to PDF service
 */
const generateCertificateUrl = async (user, course, completedDate) => {
  try {
    const metadata = generateCertificateMetadata(user, course, completedDate);
    
    // In production, you would:
    // 1. Use a PDF generation service (pdfkit, html2pdf, etc.)
    // 2. Store the PDF in cloud storage (S3, GCS, etc.)
    // 3. Return a signed URL
    
    // For now, return a structured certificate metadata that can be formatted client-side
    // or used with a PDF generation service on demand
    return {
      ...metadata,
      downloadUrl: `/api/certificates/download/${course._id}/${user._id}`,
    };
  } catch (error) {
    console.error('Error generating certificate URL:', error);
    throw error;
  }
};

module.exports = {
  generateCertificateMetadata,
  generateCertificateUrl,
};

