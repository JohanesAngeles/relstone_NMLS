import React from 'react';

const InvoiceTemplate = ({ receipt }) => {
  if (!receipt) return null;

  return (
    <div style={{ maxWidth: 860, margin: '16px auto', background: '#fff', border: '1px solid #dbeafe', borderRadius: 16, padding: 24, boxShadow: '0 20px 40px rgba(15,23,42,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#091925' }}>Relstone NMLS</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontWeight: 600 }}>Payment Receipt</p>
        </div>
        <div style={{ textAlign: 'right', color: '#64748b' }}>
          <p style={{ margin: 0, fontSize: 12 }}>Transaction ID</p>
          <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{receipt.transactionId}</p>
          <p style={{ margin: '8px 0 0', fontSize: 12 }}>Date</p>
          <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{new Date(receipt.date).toLocaleString()}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '18px 0' }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
          <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>BILL TO</p>
          <p style={{ margin: '6px 0 0', fontWeight: 700 }}>{receipt.user.name}</p>
          <p style={{ margin: '2px 0 0', color: '#475569' }}>{receipt.user.email}</p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
          <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>PAYMENT</p>
          <p style={{ margin: '6px 0 0', fontWeight: 700 }}>{receipt.paymentMethod}</p>
          <p style={{ margin: '2px 0 0', color: '#475569' }}>Status: {receipt.paymentStatus}</p>
          <p style={{ margin: '2px 0 0', color: '#475569' }}>Amount: ${receipt.totalAmount.toFixed(2)}</p>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={{ textAlign: 'left', padding: 10, fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>Course</th>
            <th style={{ textAlign: 'right', padding: 10, fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>Price</th>
            <th style={{ textAlign: 'right', padding: 10, fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>Textbook</th>
            <th style={{ textAlign: 'right', padding: 10, fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item) => (
            <tr key={item.course_id}>
              <td style={{ borderBottom: '1px solid #e2e8f0', padding: 10 }}>{item.title}</td>
              <td style={{ borderBottom: '1px solid #e2e8f0', padding: 10, textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
              <td style={{ borderBottom: '1px solid #e2e8f0', padding: 10, textAlign: 'right' }}>${item.include_textbook ? item.textbook_price.toFixed(2) : '0.00'}</td>
              <td style={{ borderBottom: '1px solid #e2e8f0', padding: 10, textAlign: 'right', fontWeight: 700 }}>${item.line_total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" style={{ textAlign: 'right', padding: 10, fontSize: 14, fontWeight: 800 }}>Total</td>
            <td style={{ textAlign: 'right', padding: 10, fontSize: 14, fontWeight: 800 }}>${receipt.totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default InvoiceTemplate;
