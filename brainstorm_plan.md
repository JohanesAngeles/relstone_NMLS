# Comprehensive Fix Plan: Prevent Duplicate Course Purchases

## Problem Analysis
**Issue**: Users can place multiple orders for the same course despite frontend UI blocking "Add to Cart" for already-purchased courses.
- Frontend (`Courses.jsx`): Correctly disables buttons for courses in **paid/completed orders** OR **enrollments**.
- Backend (`orders.js POST /orders`): Only blocks **completed courses** (`user.completions`), ignoring paid orders and enrollments.

**Result**: Users can bypass via direct API calls/bookmarking/checkout or if frontend fetch fails.

## Root Cause
Missing backend validation in `POST /api/orders` matching frontend `purchasedIds` logic:
```
paid/completed orders → course_id
+ enrollments → course_id
```

## Solution (Single File Edit)
**File**: `server/routes/orders.js` (POST `/` handler)

**Logic** (before `Order.create`):
```js
// 1. Get user's PAID/COMPLETED order course IDs
const paidOrderIds = new Set();
const paidOrders = await Order.find({
  user_id: req.user.id,
  status: { $in: ['paid', 'completed'] }
}).select('items.course_id');
paidOrders.forEach(order => {
  order.items.forEach(item => {
    if (item.course_id) paidOrderIds.add(String(item.course_id));
  });
});

// 2. Get user's enrollment course IDs
const enrollmentIds = new Set();
const enrollments = await Enrollment.find({ user_id: req.user.id })
  .select('course_id')
  .lean();
enrollments.forEach(e => {
  if (e.course_id) enrollmentIds.add(String(e.course_id));
});

// 3. Block if ANY requested item overlaps
for (const item of items) {
  const courseId = String(item.course_id);
  if (paidOrderIds.has(courseId) || enrollmentIds.has(courseId)) {
    return res.status(400).json({
      message: `You already own course "${course.title}" (Order/Enrollment exists)`
    });
  }
}
```

## Benefits
✅ **Exact match** with frontend (same query logic)
✅ **Prevents bypass** (direct API calls)
✅ **User-friendly** error message
✅ **Minimal change** (one file, ~20 lines)
✅ **Performance**: Single query each (indexed)

## Edge Cases Handled
- Multiple items in cart → checks each
- Populated `course_id` (ObjectId/string)
- Lean queries (fast)
- Existing `user.completions` check preserved

## Testing Steps
1. Buy course → gets 'paid' order → Enrollment created
2. Try add-to-cart → ✅ Frontend blocks
3. Direct POST /orders → ✅ Backend now blocks
4. Cancelled/pending orders → ✅ Still allows repurchase

## Implementation Priority
**High**: Security + UX fix, single file change.

**Next**: After edit, test + `attempt_completion`

