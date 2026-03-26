import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CheckCircle2 } from 'lucide-react';
import API from '../../api/axios';
import Layout from '../../components/Layout';
import InvoiceTemplate from './InvoiceTemplate';
import { buildReceiptPayload, downloadInvoiceAsHtml, downloadInvoicePdfPlaceholder } from '../../services/receiptService';

const ReceiptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [order, setOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = params.orderId || location.state?.orderId;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided for receipt.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await API.get(`/orders/${orderId}`);
        const o = res.data?.order;
        if (!o) {
          setError('Could not find the order.');
          return;
        }

        setOrder(o);
        const payload = buildReceiptPayload(o, location.state?.user || { name: o?.billing?.first_name || 'Unknown', email: o?.billing?.email || 'Unknown' });
        setReceipt(payload);
      } catch (err) {
        console.error('[ReceiptPage] failed to fetch order', err);
        setError(err?.response?.data?.message || 'Failed to load receipt.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, location.state]);

  if (loading) {
    return (
      <Layout>
        <div style={{ margin: '32px auto', maxWidth: 720, textAlign: 'center', fontSize: 15, color: '#64748b' }}>
          Loading receipt...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ margin: '32px auto', maxWidth: 720, textAlign: 'center', color: '#dc2626' }}>
          <p>{error}</p>
          <button onClick={() => navigate('/orders')} style={buttonStyle}>Back to orders</button>
        </div>
      </Layout>
    );
  }

  if (!receipt) {
    return (
      <Layout>
        <div style={{ margin: '32px auto', maxWidth: 720, textAlign: 'center' }}>
          <p>No receipt data available.</p>
          <button onClick={() => navigate('/orders')} style={buttonStyle}>Back to orders</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{css}</style>
      <div style={pageStyle}>
        <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={bannerStyle}>
          <div style={titleStyle}>Receipt generated</div>
          <div style={subStyle}>Your payment has been confirmed and your invoice is ready.</div>
        </div>

        <InvoiceTemplate receipt={receipt} />

        <div style={{ ...actionBarStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ marginBottom: 8, color: '#64748b', fontSize: 13 }}>
            Order reference: <strong>{order?._id || receipt.orderId}</strong>
          </div>
          <div style={actionBarStyle}>
            <button
              style={downloadBtnStyle}
              onClick={() => downloadInvoiceAsHtml(receipt)}
              type="button"
            >
              <Download size={14} /> Download Invoice
            </button>
            <button
              style={downloadBtnStyle}
              onClick={async () => {
                const result = await downloadInvoicePdfPlaceholder(receipt);
                alert(result.message);
              }}
              type="button"
            >
              <FileText size={14} /> Download as PDF (placeholder)
            </button>
          </div>
        </div>

        <div style={noteStyle}>
          <CheckCircle2 size={14} />
          <span>This receipt is also stored in your purchase history under "Orders".</span>
        </div>
      </div>
    </Layout>
  );
};

const buttonStyle = {
  padding: '10px 14px',
  border: '1px solid #dbeafe',
  borderRadius: 10,
  background: '#fff',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontWeight: 700,
};

const pageStyle = {
  maxWidth: 980,
  margin: '24px auto 40px',
  padding: '0 14px',
};

const backButtonStyle = {
  marginBottom: 12,
  background: 'transparent',
  border: 'none',
  color: '#1d4ed8',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const bannerStyle = {
  border: '1px solid #bfdbfe',
  background: '#eff6ff',
  borderRadius: 14,
  padding: '14px 16px',
  marginBottom: 14,
};

const titleStyle = { fontSize: 18, fontWeight: 800, color: '#1e3a8a' };
const subStyle = { marginTop: 4, fontSize: 13, color: '#1e40af' };

const actionBarStyle = {
  marginTop: 14,
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
};

const downloadBtnStyle = {
  border: '1px solid #dbeafe',
  borderRadius: 10,
  background: '#fff',
  color: '#1d4ed8',
  padding: '9px 13px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
};

const noteStyle = {
  marginTop: 14,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  color: '#0f766e',
  fontWeight: 700,
};

const css = `
*{box-sizing:border-box}
`; 

export default ReceiptPage;
