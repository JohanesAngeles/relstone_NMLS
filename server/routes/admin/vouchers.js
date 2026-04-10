const express      = require('express');
const router       = express.Router();
const Voucher      = require('../../models/Voucher');
const Announcement = require('../../models/Announcement');

const STAFF = ['admin', 'super_admin', 'instructor'];

/* ── POST /api/admin/vouchers/validate ───────────────────────────── 
   MUST be FIRST — before POST / and GET /:id so Express does not
   treat "validate" as an :id parameter                              */
router.post('/validate', async (req, res) => {
  try {
    const { code, order_amount, user_id, course_ids } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const voucher = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (!voucher || !voucher.is_active)
      return res.status(404).json({ message: 'Invalid or inactive voucher code.' });

    const now = new Date();
    if (voucher.valid_from && now < voucher.valid_from)
      return res.status(400).json({ message: 'This voucher is not yet valid.' });
    if (voucher.valid_until && now > voucher.valid_until)
      return res.status(400).json({ message: 'This voucher has expired.' });
    if (voucher.max_uses && voucher.used_count >= voucher.max_uses)
      return res.status(400).json({ message: 'This voucher has reached its usage limit.' });
    if (voucher.min_order_amount && order_amount < voucher.min_order_amount)
      return res.status(400).json({ message: `Minimum order amount is $${voucher.min_order_amount}.` });

    // Per-user usage check
    if (user_id && voucher.uses_per_user) {
      const userUses = voucher.used_by.filter(u => String(u.user_id) === String(user_id)).length;
      if (userUses >= voucher.uses_per_user)
        return res.status(400).json({ message: 'You have already used this voucher.' });
    }

    // Course restriction check
    if (voucher.applicable_courses && voucher.applicable_courses.length > 0) {
      if (!course_ids || course_ids.length === 0)
        return res.status(400).json({ message: 'This voucher is only valid for specific courses.' });
      const applicableStr = voucher.applicable_courses.map(String);
      const hasMatch = course_ids.some(id => applicableStr.includes(String(id)));
      if (!hasMatch)
        return res.status(400).json({ message: 'This voucher is not valid for the selected courses.' });
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discount_type === 'percentage') {
      discount = (order_amount * voucher.discount_value) / 100;
      if (voucher.max_discount) discount = Math.min(discount, voucher.max_discount);
    } else {
      discount = Math.min(voucher.discount_value, order_amount);
    }

    res.json({
      valid:        true,
      voucher:      { _id: voucher._id, code: voucher.code, discount_type: voucher.discount_type, discount_value: voucher.discount_value, description: voucher.description },
      discount:     Math.round(discount * 100) / 100,
      final_amount: Math.max(0, order_amount - discount),
    });
  } catch (err) {
    console.error('[vouchers POST /validate]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/admin/vouchers ─────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status === 'active')   query.is_active = true;
    if (status === 'inactive') query.is_active = false;
    if (search) query.code = { $regex: search, $options: 'i' };

    const total    = await Voucher.countDocuments(query);
    const vouchers = await Voucher.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ vouchers, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[vouchers GET /]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── POST /api/admin/vouchers ────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    if (!STAFF.includes(req.user?.role))
      return res.status(403).json({ message: 'Access denied' });

    const {
      code, description, discount_type, discount_value,
      min_order_amount, max_discount, max_uses, uses_per_user,
      valid_from, valid_until, is_active, applicable_courses,
    } = req.body;

    if (!code || !discount_type || discount_value === undefined)
      return res.status(400).json({ message: 'code, discount_type, and discount_value are required' });

    const existing = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (existing)
      return res.status(400).json({ message: 'A voucher with this code already exists.' });

    const voucher = await Voucher.create({
      code:               code.toUpperCase().trim(),
      description:        description || '',
      discount_type,
      discount_value:     Number(discount_value),
      min_order_amount:   Number(min_order_amount || 0),
      max_discount:       max_discount ? Number(max_discount) : null,
      max_uses:           max_uses ? Number(max_uses) : null,
      uses_per_user:      Number(uses_per_user || 1),
      valid_from:         valid_from || new Date(),
      valid_until:        valid_until || null,
      is_active:          is_active !== false,
      created_by:         req.user.id,
      applicable_courses: applicable_courses || [],
    });

    // ── Auto-create announcement when voucher is active ────────────
    if (voucher.is_active) {
      const discountText = discount_type === 'percentage'
        ? `${discount_value}% off`
        : `$${discount_value} off`;

      const expiryText = valid_until
        ? ` Valid until ${new Date(valid_until).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
        : '';

      const minText = min_order_amount
        ? ` Minimum order: $${min_order_amount}.`
        : '';

      await Announcement.create({
        title:      `🎉 New Voucher: ${discountText}!`,
        message:    `Use code ${voucher.code} to get ${discountText} on your order.${minText}${expiryText}`,
        type:       'voucher',
        ref_id:     voucher._id,
        ref_model:  'Voucher',
        is_active:  true,
        expires_at: valid_until || null,
        created_by: req.user.id,
      });
    }
    // ──────────────────────────────────────────────────────────────

    res.status(201).json({ voucher, message: 'Voucher created successfully.' });
  } catch (err) {
    console.error('[vouchers POST /]', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── GET /api/admin/vouchers/:id ─────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate('used_by.user_id', 'name email')
      .lean();
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json({ voucher });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── PUT /api/admin/vouchers/:id ─────────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    if (!STAFF.includes(req.user?.role))
      return res.status(403).json({ message: 'Access denied' });

    const {
      description, discount_type, discount_value,
      min_order_amount, max_discount, max_uses, uses_per_user,
      valid_from, valid_until, is_active, applicable_courses,
    } = req.body;

    const setPayload = {};
    if (description        !== undefined) setPayload.description        = description;
    if (discount_type      !== undefined) setPayload.discount_type      = discount_type;
    if (discount_value     !== undefined) setPayload.discount_value     = Number(discount_value);
    if (min_order_amount   !== undefined) setPayload.min_order_amount   = Number(min_order_amount);
    if (max_discount       !== undefined) setPayload.max_discount       = max_discount ? Number(max_discount) : null;
    if (max_uses           !== undefined) setPayload.max_uses           = max_uses ? Number(max_uses) : null;
    if (uses_per_user      !== undefined) setPayload.uses_per_user      = Number(uses_per_user);
    if (valid_from         !== undefined) setPayload.valid_from         = valid_from;
    if (valid_until        !== undefined) setPayload.valid_until        = valid_until || null;
    if (is_active          !== undefined) setPayload.is_active          = is_active;
    if (applicable_courses !== undefined) setPayload.applicable_courses = applicable_courses;

    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { $set: setPayload },
      { new: true }
    );
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json({ voucher, message: 'Voucher updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── PATCH /api/admin/vouchers/:id/toggle ────────────────────────── */
router.patch('/:id/toggle', async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    voucher.is_active = !voucher.is_active;
    await voucher.save();
    res.json({ voucher, message: `Voucher ${voucher.is_active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── DELETE /api/admin/vouchers/:id ──────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    if (!STAFF.includes(req.user?.role))
      return res.status(403).json({ message: 'Access denied' });
    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voucher deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;