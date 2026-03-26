// Lightweight receipt service helpers for invoice generation and placeholder PDF export

export function buildReceiptPayload(order, user) {
  if (!order) return null;

  const lines = (order.items || []).map((item) => {
    const course = item.course_id || {};
    return {
      title: course.title || 'Untitled course',
      course_id: course._id || item.course_id,
      quantity: 1,
      unit_price: Number(item.price || 0),
      textbook_price: Number(item.textbook_price || 0),
      include_textbook: !!item.include_textbook,
      line_total: Number(item.price || 0) + (item.include_textbook ? Number(item.textbook_price || 0) : 0),
    };
  });

  const totalPaid = Number(order.total_amount || 0);

  return {
    orderId: order._id,
    transactionId: order.payment_reference || (`TRX-${order._id || Date.now()}`),
    date: order.updatedAt || order.createdAt || new Date().toISOString(),
    paymentMethod: order.payment_method || 'credit_card',
    paymentStatus: order.status || 'completed',
    totalAmount: totalPaid,
    user: {
      name: user?.name || 'Unknown',
      email: user?.email || 'Unknown',
    },
    items: lines,
    billing: order.billing || {},
  };
}

export async function downloadInvoiceAsHtml(receipt) {
  if (!receipt) {
    throw new Error('invoice receipt is required');
  }

  const rows = receipt.items
    .map((item) => `<tr>
      <td>${item.title}</td>
      <td>$${item.unit_price.toFixed(2)}</td>
      <td>${item.include_textbook ? '$' + item.textbook_price.toFixed(2) : '$0.00'}</td>
      <td>$${item.line_total.toFixed(2)}</td>
    </tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${receipt.orderId}</title>
<style>
  body { font-family: Inter, Arial, sans-serif; background:#f4f7fb; padding:20px; color:#091925; }
  .invoice-card { max-width: 760px; margin: 0 auto; background:#fff; border-radius:14px; padding:24px; border:1px solid #e2e8f0; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
  .company { font-size:26px; font-weight:800; color:#091925; }
  .title { font-size:19px; font-weight:700; color:#2EABFE; }
  .meta { margin-top:8px; color:#475569; font-size:13px; }
  table { width:100%; border-collapse:collapse; margin-top:18px; }
  th, td { text-align:left; padding:10px 8px; border-bottom:1px solid #e2e8f0; }
  th { color:#475569; font-size:12px; letter-spacing:.05em; text-transform:uppercase; }
  tfoot td { border:none; font-weight:700; }
</style>
</head>
<body>
<div class="invoice-card">
  <div class="header">
    <div>
      <div class="company">Relstone NMLS</div>
      <div class="title">Payment Receipt</div>
    </div>
    <div>
      <div class="meta">Transaction ID: ${receipt.transactionId}</div>
      <div class="meta">Date: ${new Date(receipt.date).toLocaleString()}</div>
      <div class="meta">Status: ${receipt.paymentStatus}</div>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap; margin-bottom:18px;">
    <div>
      <strong>Customer</strong><br />
      ${receipt.user.name}<br />
      ${receipt.user.email}
    </div>
    <div>
      <strong>Payment</strong><br />
      Method: ${receipt.paymentMethod}<br />
      Total: $${receipt.totalAmount.toFixed(2)}
    </div>
  </div>
  <table>
    <thead>
      <tr><th>Course</th><th>Price</th><th>Textbook</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr><td colspan="3" style="text-align:right;">Amount Paid</td><td>$${receipt.totalAmount.toFixed(2)}</td></tr>
    </tfoot>
  </table>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${receipt.orderId}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadInvoicePdfPlaceholder(receipt) {
  // Placeholder for future PDF library integration (e.g., jsPDF, pdfmake)
  return Promise.resolve({ success: true, message: 'PDF generation placeholder (not yet implemented)' });
}
