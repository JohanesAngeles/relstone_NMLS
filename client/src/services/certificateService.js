import API from '../api/axios';

export async function downloadCertificatePdf(courseId) {
  const response = await API.get(`/certificates/download/${courseId}`, {
    responseType: 'blob',
  });

  const contentType = response.headers['content-type'] || '';
  if (!contentType.includes('application/pdf')) {
    const text = await response.data.text?.() || 'Unable to download certificate.';
    throw new Error(text || 'Certificate download failed.');
  }

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const fileName = `Relstone-Certificate-${courseId}.pdf`;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
