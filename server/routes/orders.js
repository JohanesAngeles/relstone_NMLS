const express        = require('express');
const router         = express.Router();
const nodemailer     = require('nodemailer');
const Order          = require('../models/Order');
const Course         = require('../models/Course');
const User           = require('../models/User');
const CourseProgress = require('../models/CourseProgress');
const authMiddleware = require('../middleware/auth');
const Enrollment = require('../models/Enrollment'); // ← ADD THIS

// ─── Email Transporter ────────────────────────────────────────────
const getTransporter = () => nodemailer.createTransport({
  host:    process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:    Number(process.env.EMAIL_PORT) || 587,
  secure:  false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
  family: 4,
});

// ─── Order Confirmation Email ─────────────────────────────────────
const sendOrderConfirmationEmail = async (order, user) => {
  const itemsHtml = order.items.map((item) => {
    const course  = item.course_id;
    const title   = course?.title        || 'Course';
    const type    = course?.type         || '';
    const hours   = course?.credit_hours || '';
    const tbPrice = Number(item.textbook_price || 0);
    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f4f8;">
          <div style="font-weight:700;color:#091925;font-size:14px;">${title}</div>
          <div style="font-size:12px;color:#7FA8C4;margin-top:3px;">
            ${type}${hours ? ` · ${hours} credit hours` : ''}
          </div>
          ${item.include_textbook && tbPrice > 0
            ? `<div style="font-size:12px;color:#F59E0B;margin-top:3px;">+ Textbook included ($${tbPrice.toFixed(2)})</div>`
            : ''}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f4f8;text-align:right;font-weight:800;color:#091925;font-size:14px;white-space:nowrap;">
          $${(Number(item.price || 0) + (item.include_textbook ? tbPrice : 0)).toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');

  const orderId    = String(order._id).slice(-6).toUpperCase();
  const totalAmt   = Number(order.total_amount || 0).toFixed(2);
  const orderDate  = new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const hasVoucher = order.voucher_code && Number(order.voucher_discount) > 0;

  await getTransporter().sendMail({
    from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
    to:   user.email,
    subject: `✅ Payment Confirmed – Order #${orderId} | Relstone NMLS`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:#091925;padding:28px 32px;text-align:center;">
          <div style="display:inline-block;background:rgba(46,171,254,0.15);border:1px solid rgba(46,171,254,0.3);border-radius:12px;padding:10px 18px;margin-bottom:20px;">
            <span style="font-size:18px;font-weight:800;color:#fff;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
          </div>
          <div style="width:68px;height:68px;background:rgba(34,197,94,0.15);border:2px solid rgba(34,197,94,0.4);border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:30px;">✅</span>
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Payment Confirmed!</h1>
          <p style="color:rgba(255,255,255,0.60);font-size:13px;margin:0;">Your courses are now unlocked and ready to start</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="color:#091925;font-size:15px;font-weight:700;margin:0 0 6px;">Hi ${user.name} 👋</p>
          <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Thank you for your purchase! Your payment has been confirmed by our team.
            Your courses are now active and available in your student portal.
          </p>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;">Order ID</span><br/>
                  <span style="font-size:15px;font-weight:800;color:#2EABFE;">#${orderId}</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;">Date</span><br/>
                  <span style="font-size:14px;font-weight:700;color:#091925;">${orderDate}</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;">Status</span><br/>
                  <span style="font-size:14px;font-weight:800;color:#22C55E;">✅ Paid</span>
                </td>
              </tr>
            </table>
          </div>
          <div style="font-size:12px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Courses Purchased</div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:16px;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.05em;">Course</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.05em;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          ${hasVoucher ? `
          <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.22);border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;font-weight:700;color:#065f46;">🎟️ Voucher (${order.voucher_code})</span>
            <span style="font-size:14px;font-weight:900;color:#10b981;">-$${Number(order.voucher_discount).toFixed(2)}</span>
          </div>` : ''}
          <div style="background:rgba(46,171,254,0.06);border:1px solid rgba(46,171,254,0.22);border-radius:12px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
            <span style="font-size:15px;font-weight:700;color:#091925;">Total Paid</span>
            <span style="font-size:22px;font-weight:900;color:#2EABFE;">$${totalAmt}</span>
          </div>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${process.env.FRONTEND_URL || 'https://yourapp.com'}/my-courses"
               style="display:inline-block;background:#091925;color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:800;font-size:15px;letter-spacing:-0.2px;">
              Start Learning →
            </a>
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;">
            <p style="color:#92600A;font-size:13px;font-weight:600;margin:0;line-height:1.6;">
              💡 <strong>Need help?</strong> Reply to this email or visit your portal's <strong>Contact Support</strong> page.
            </p>
          </div>
        </div>
        <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:18px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.8;">
            © ${new Date().getFullYear()} Relstone NMLS · Mortgage Licensing Education<br/>
            You're receiving this because you made a purchase on Relstone NMLS.
          </p>
        </div>
      </div>
    `,
  });
};

// ─── Order Received Email ─────────────────────────────────────────
const sendOrderReceivedEmail = async (order, user) => {
  const itemsHtml = order.items.map((item) => {
    const course  = item.course_id;
    const title   = course?.title        || 'Course';
    const type    = course?.type         || '';
    const hours   = course?.credit_hours || '';
    const tbPrice = Number(item.textbook_price || 0);
    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f4f8;">
          <div style="font-weight:700;color:#091925;font-size:14px;">${title}</div>
          <div style="font-size:12px;color:#7FA8C4;margin-top:3px;">
            ${type}${hours ? ` · ${hours} credit hours` : ''}
          </div>
          ${item.include_textbook && tbPrice > 0
            ? `<div style="font-size:12px;color:#F59E0B;margin-top:3px;">+ Textbook included ($${tbPrice.toFixed(2)})</div>`
            : ''}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f4f8;text-align:right;font-weight:800;color:#091925;font-size:14px;white-space:nowrap;">
          $${(Number(item.price || 0) + (item.include_textbook ? tbPrice : 0)).toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');

  const orderId    = String(order._id).slice(-6).toUpperCase();
  const totalAmt   = Number(order.total_amount || 0).toFixed(2);
  const orderDate  = new Date(order.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  const hasVoucher = order.voucher_code && Number(order.voucher_discount) > 0;

  await getTransporter().sendMail({
    from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
    to:   user.email,
    subject: `🎉 Order Received – Order #${orderId} | Relstone NMLS`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
        <div style="background:#091925;padding:28px 32px;text-align:center;">
          <div style="display:inline-block;background:rgba(46,171,254,0.15);border:1px solid rgba(46,171,254,0.3);border-radius:12px;padding:10px 18px;margin-bottom:20px;">
            <span style="font-size:18px;font-weight:800;color:#fff;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
          </div>
          <div style="width:68px;height:68px;background:rgba(46,171,254,0.15);border:2px solid rgba(46,171,254,0.4);border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:30px;">🎉</span>
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Order Received!</h1>
          <p style="color:rgba(255,255,255,0.60);font-size:13px;margin:0;">We've received your order and it's being reviewed</p>
        </div>
        <div style="padding:28px 32px;">
          <p style="color:#091925;font-size:15px;font-weight:700;margin:0 0 6px;">Hi ${user.name} 👋</p>
          <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 24px;">
            Thank you for your order! We've received it and it's currently
            <strong style="color:#F59E0B;">pending payment confirmation</strong> from our team.
            Once your payment is verified, your courses will be unlocked and you'll receive another email.
          </p>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;">
                  <span style="font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;">Order ID</span><br/>
                  <span style="font-size:15px;font-weight:800;color:#2EABFE;">#${orderId}</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;">Date</span><br/>
                  <span style="font-size:14px;font-weight:700;color:#091925;">${orderDate}</span>
                </td>
                <td style="padding:6px 0;">
                  <span style="font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;">Status</span><br/>
                  <span style="font-size:14px;font-weight:800;color:#F59E0B;">⏳ Pending</span>
                </td>
              </tr>
            </table>
          </div>
          <div style="font-size:12px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Courses Ordered</div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:16px;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.05em;">Course</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;color:#7FA8C4;text-transform:uppercase;letter-spacing:0.05em;">Price</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          ${hasVoucher ? `
          <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.22);border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;font-weight:700;color:#065f46;">🎟️ Voucher (${order.voucher_code})</span>
            <span style="font-size:14px;font-weight:900;color:#10b981;">-$${Number(order.voucher_discount).toFixed(2)}</span>
          </div>` : ''}
          <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.22);border-radius:12px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
            <span style="font-size:15px;font-weight:700;color:#091925;">Order Total</span>
            <span style="font-size:22px;font-weight:900;color:#F59E0B;">$${totalAmt}</span>
          </div>
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;">
            <p style="color:#92600A;font-size:13px;font-weight:600;margin:0;line-height:1.6;">
              ⏳ <strong>What happens next?</strong><br/>
              Our admin team will review and confirm your payment.
              Once confirmed, you'll receive a second email and your courses will be immediately unlocked.
            </p>
          </div>
        </div>
        <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:18px 32px;text-align:center;">
          <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.8;">
            © ${new Date().getFullYear()} Relstone NMLS · Mortgage Licensing Education<br/>
            You're receiving this because you placed an order on Relstone NMLS.
          </p>
        </div>
      </div>
    `,
  });
};

// ─────────────────────────────────────────────────────────────────
// POST /api/orders
// ─────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('🛒 Order payload received:', JSON.stringify(req.body, null, 2));
    
    const { items, voucher_code, voucher_discount } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

// ── Block duplicate purchases (paid orders + enrollments + completions) ──
    // 1. Get paid/completed order course IDs (matching frontend logic)
    const paidOrderIds = new Set();
    const paidOrders = await Order.find({
      user_id: req.user.id,
      status: { $in: ['paid', 'completed'] }
    }).select('items');
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const id = item.course_id?._id || item.course_id;
        if (id) paidOrderIds.add(String(id));
      });
    });

    // 2. Get enrollment course IDs
    const enrollmentIds = new Set();
    const enrollments = await Enrollment.find({ user_id: req.user.id })
      .select('course_id')
      .lean();
    enrollments.forEach(e => {
      const id = e.course_id?._id || e.course_id;
      if (id) enrollmentIds.add(String(id));
    });

    // 3. Block if any item overlaps (KEEP existing completions check for extra safety)
    const completedCourseIds = (user.completions || []).map(c =>
      String(c.course_id?._id || c.course_id)
    );
    for (const item of items) {
      const courseIdStr = String(item.course_id);
      if (paidOrderIds.has(courseIdStr) || enrollmentIds.has(courseIdStr) || completedCourseIds.includes(courseIdStr)) {
        const course = await Course.findById(item.course_id).select('title');
        return res.status(400).json({
          message: `You already own "${course?.title || 'this course'}" (existing order/enrollment/completion found)`,
        });
      }
    }

    // Build order items and calculate subtotal from DB prices
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const course = await Course.findById(item.course_id);
      if (!course) {
        return res.status(404).json({ message: `Course ${item.course_id} not found` });
      }
      const textbook_price = item.include_textbook ? (course.textbook_price || 0) : 0;
      subtotal += (course.price || 0) + textbook_price;

      orderItems.push({
        course_id:        course._id,
        price:            course.price || 0,
        include_textbook: item.include_textbook || false,
        textbook_price,
      });
    }

    // Apply voucher discount — cap at subtotal so total never goes negative
    const appliedDiscount = Math.min(Number(voucher_discount || 0), subtotal);
    const finalTotal      = Math.max(0, subtotal - appliedDiscount);

    const order = await Order.create({
      user_id:          req.user.id,
      items:            orderItems,
      total_amount:     finalTotal,
      voucher_code:     voucher_code     || null,
      voucher_discount: appliedDiscount  || 0,
      status:           'pending',
    });

    // ── Track voucher usage ───────────────────────────────────────
    if (voucher_code && appliedDiscount > 0) {
      try {
        const Voucher = require('../models/Voucher');
        await Voucher.findOneAndUpdate(
          { code: voucher_code.toUpperCase().trim() },
          {
            $inc: { used_count: 1 },
            $push: {
              used_by: {
                user_id:          req.user.id,
                order_id:         order._id,
                used_at:          new Date(),
                discount_applied: appliedDiscount,
              }
            }
          }
        );
        console.log(`🎟️  Voucher ${voucher_code} usage tracked — discount $${appliedDiscount}`);
      } catch (voucherErr) {
        console.error('⚠️  Failed to track voucher usage:', voucherErr.message);
      }
    }

    // Reset per-course progress on new purchase
    await Promise.all(
      orderItems.map((it) =>
        CourseProgress.findOneAndUpdate(
          { user_id: req.user.id, course_id: it.course_id },
          {
            $set: {
              completed_idxs:   [],
              current_idx:      0,
              is_completed:     false,
              completed_at:     null,
              last_activity_at: new Date(),
              reset_at:         new Date(),
            },
            $setOnInsert: { user_id: req.user.id, course_id: it.course_id },
          },
          { upsert: true, new: true }
        )
      )
    );

    const populated = await Order.findById(order._id)
      .populate('items.course_id', 'title nmls_course_id type credit_hours states_approved pdf_url');

    console.log('📦 Order created, attempting to send email to:', user.email);
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('📧 EMAIL_PASS set:', !!process.env.EMAIL_PASS);

    try {
      await sendOrderReceivedEmail(populated, user);
      console.log(`📧 Order received email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('⚠️  Failed to send order received email:', emailErr.message);
      console.error(emailErr);
    }

    res.status(201).json(populated);

  } catch (err) {
    console.error('POST /orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/orders/my
// ─────────────────────────────────────────────────────────────────
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id })
      .populate('items.course_id', 'title nmls_course_id type credit_hours')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('GET /orders/my error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/orders  (admin only)
// ─────────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }
    const orders = await Order.find()
      .populate('user_id', 'name email nmls_id')
      .populate('items.course_id', 'title nmls_course_id type credit_hours')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('GET /orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/status  (admin only)
// ─────────────────────────────────────────────────────────────────
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only' });
    }

    const { status } = req.body;
    const allowed = ['pending', 'paid', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.course_id', 'title nmls_course_id type credit_hours states_approved');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Send confirmation email when marked as paid
    if (status === 'paid') {
      try {
        const user = await User.findById(order.user_id).select('name email');
        if (user?.email) {
          await sendOrderConfirmationEmail(order, user);
          console.log(`📧 Order confirmation email sent to ${user.email} for order #${String(order._id).slice(-6).toUpperCase()}`);
        }
      } catch (emailErr) {
        console.error('⚠️  Failed to send order confirmation email:', emailErr.message);
      }
    }

    res.json({ message: 'Order status updated', order });

  } catch (err) {
    console.error('PATCH /orders/:id/status error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;