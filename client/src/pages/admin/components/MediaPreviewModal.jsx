import { X, FileText, Video } from 'lucide-react';

const MediaPreviewModal = ({ type, url, onClose }) => {
  const isPDF  = type === 'pdf';
  const accent = isPDF ? '#f59e0b' : '#8b5cf6';
  const label  = isPDF ? 'PDF' : 'Video';

  const convertToEmbedUrl = (url) => {
  // Convert Google Drive share link to embed link
  // https://drive.google.com/file/d/FILE_ID/view → https://drive.google.com/file/d/FILE_ID/preview
  if (url?.includes('drive.google.com')) {
    return url.replace('/view', '/preview').replace('/edit', '/preview');
  }
  // Convert Dropbox share link to direct link
  if (url?.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('?dl=1', '');
  }
  return url;
};

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(9,25,37,0.85)', backdropFilter: 'blur(5px)',
      }} />
      <div style={{
        position: 'fixed', zIndex: 301, top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '90%', maxWidth: isPDF ? 900 : 800,
        maxHeight: '90vh',
        background: '#fff', borderRadius: 20,
        boxShadow: '0 28px 70px rgba(9,25,37,0.30)',
        fontFamily: "'Poppins', sans-serif",
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${accent}18`, color: accent,
              display: 'grid', placeItems: 'center',
            }}>
              {isPDF ? <FileText size={16} /> : <Video size={16} />}
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#091925' }}>
              {label} Preview
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: '#f1f5f9', cursor: 'pointer',
            display: 'grid', placeItems: 'center', color: '#7FA8C4',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden', padding: isPDF ? 0 : 20 }}>
          {isPDF ? (
            <iframe
              src={url}
              title="PDF Preview"
              style={{ width: '100%', height: '75vh', border: 'none' }}
            />
          ) : (
            <iframe
                src={convertToEmbedUrl(url)}
                title="Video Preview"
                style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 12 }}
                allowFullScreen
                allow="autoplay"
            />
            )}
        </div>

      </div>
    </>
  );
};

export default MediaPreviewModal;