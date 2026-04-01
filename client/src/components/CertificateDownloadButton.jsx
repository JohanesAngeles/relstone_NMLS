import { Download, Loader2 } from 'lucide-react';

const CertificateDownloadButton = ({ onDownload, loading = false }) => (
  <button
    style={S.downloadBtn}
    onClick={onDownload}
    disabled={loading}
    type="button"
  >
    {loading ? (
      <span style={S.loaderWrap}>
        <Loader2 size={14} />
      </span>
    ) : (
      <Download size={14} />
    )}
    <span style={{ marginLeft: 8 }}>{loading ? 'Generating PDF...' : 'Download PDF'}</span>
  </button>
);

const S = {
  downloadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#091925',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    transition: 'transform 0.15s ease',
  },
  loaderWrap: {
    display: 'inline-flex',
    alignItems: 'center',
  },
};

export default CertificateDownloadButton;
