import { useState, useRef } from 'react';
import { X, Upload, FileText, Video, Link, Check } from 'lucide-react';
import API from '../../../api/axios';

const MediaUploadModal = ({ type, currentUrl, onClose, onSave }) => {
  const [tab, setTab]         = useState('upload'); // 'upload' or 'url'
  const [url, setUrl]         = useState(currentUrl || '');
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError]     = useState('');
  const fileRef               = useRef();

  const isPDF   = type === 'pdf';
  const accent  = isPDF ? '#f59e0b' : '#8b5cf6';
  const icon    = isPDF ? <FileText size={20} /> : <Video size={20} />;
  const accept  = isPDF ? '.pdf' : 'video/*';
  const label   = isPDF ? 'PDF' : 'Video';

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = isPDF ? '/admin/upload/pdf' : '/admin/upload/video';
      const res = await API.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreview(res.data.url);
      onSave(res.data.url);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = () => {
    if (!url.trim()) return;
    onSave(url.trim());
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(9,25,37,0.55)', backdropFilter: 'blur(5px)',
      }} />
      <div style={{
        position: 'fixed', zIndex: 301, top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', width: '90%', maxWidth: 480,
        background: '#fff', borderRadius: 20, padding: 28,
        boxShadow: '0 28px 70px rgba(9,25,37,0.20)',
        fontFamily: "'Poppins', sans-serif",
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${accent}18`, color: accent,
              display: 'grid', placeItems: 'center',
            }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#091925' }}>
                Update {label}
              </div>
              <div style={{ fontSize: 11, color: '#7FA8C4' }}>
                Upload a new file or paste a URL
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: '#f1f5f9', cursor: 'pointer',
            display: 'grid', placeItems: 'center', color: '#7FA8C4',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: '#f8fafc', borderRadius: 10,
          padding: 4, marginBottom: 20, gap: 4,
        }}>
          {['upload', 'url'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, height: 36, borderRadius: 8, border: 'none',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#091925' : '#7FA8C4',
                fontWeight: tab === t ? 700 : 500,
                fontSize: 13, cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all .15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {t === 'upload' ? <Upload size={13} /> : <Link size={13} />}
              {t === 'upload' ? 'Upload File' : 'Paste URL'}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {tab === 'upload' && (
          <div>
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${file ? accent : '#e2e8f0'}`,
                borderRadius: 12, padding: '32px 20px', textAlign: 'center',
                cursor: 'pointer', marginBottom: 16, transition: 'all .2s',
                background: file ? `${accent}08` : '#f8fafc',
              }}
            >
              <div style={{ color: file ? accent : '#7FA8C4', marginBottom: 8 }}>
                {file ? <Check size={32} /> : (isPDF ? <FileText size={32} /> : <Video size={32} />)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: file ? '#091925' : '#7FA8C4' }}>
                {file ? file.name : `Click to select a ${label} file`}
              </div>
              {file && (
                <div style={{ fontSize: 11, color: '#7FA8C4', marginTop: 4 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {error && (
              <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{error}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{
                width: '100%', height: 44, borderRadius: 10, border: 'none',
                background: !file || uploading ? '#e2e8f0' : accent,
                color: !file || uploading ? '#7FA8C4' : '#fff',
                fontWeight: 700, fontSize: 14, cursor: !file || uploading ? 'not-allowed' : 'pointer',
                fontFamily: "'Poppins', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {uploading ? 'Uploading...' : `Upload ${label}`}
            </button>
          </div>
        )}

        {/* URL Tab */}
        {tab === 'url' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7FA8C4', display: 'block', marginBottom: 6 }}>
                {label} URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={`Paste ${label} URL here...`}
                style={{
                  width: '100%', height: 44, borderRadius: 10, padding: '0 14px',
                  border: '1px solid #e2e8f0', outline: 'none', fontSize: 13,
                  fontFamily: "'Poppins', sans-serif", color: '#091925',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleUrlSave}
              disabled={!url.trim()}
              style={{
                width: '100%', height: 44, borderRadius: 10, border: 'none',
                background: !url.trim() ? '#e2e8f0' : accent,
                color: !url.trim() ? '#7FA8C4' : '#fff',
                fontWeight: 700, fontSize: 14,
                cursor: !url.trim() ? 'not-allowed' : 'pointer',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Save URL
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MediaUploadModal;