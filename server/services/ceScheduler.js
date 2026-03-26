const User = require('../models/User');
const Course = require('../models/Course');
const { sendCEReminderEmail, sendCECompletionEmail } = require('./emailService');

// ─────────────────────────────────────────────────────────────────
// Check CE Renewal Deadlines and Send Reminders
// ─────────────────────────────────────────────────────────────────

const checkCERenewals = async () => {
  try {
    console.log('[CE Renewal Scheduler] Running CE renewal checks...');

    const users = await User.find({
      ce_renewal_deadline: { $exists: true, $ne: null },
    }).populate('completions.course_id', 'type credit_hours');

    for (const user of users) {
      if (!user.ce_renewal_deadline) continue;

      const now = new Date();
      const deadline = new Date(user.ce_renewal_deadline);
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      // Check if user has a renewal reminder pending (90, 60, 30 days)
      const reminderDays = [90, 60, 30];
      const shouldSendReminder = reminderDays.some((days) => {
        const withinRange = daysUntilDeadline >= days - 1 && daysUntilDeadline <= days + 1;
        const alreadySent = (user.renewal_reminders_sent || []).some((r) => r.days_before === days);
        return withinRange && !alreadySent;
      });

      if (daysUntilDeadline < 0) {
        console.log(`[CE Renewal] User ${user.email} renewal deadline has passed`);
        continue;
      }

      if (shouldSendReminder && user.notification_prefs?.email_reminders !== false) {
        // Calculate CE hours completed and required
        const ceCompletions = (user.completions || []).filter(
          (c) => String(c.course_id?.type || '').toUpperCase() === 'CE'
        );

        const ceCompleted = ceCompletions.reduce(
          (sum, c) => sum + Number(c.course_id?.credit_hours || 0),
          0
        );

        const stateRequirements = {
          'CA': 36, 'NY': 24, 'TX': 30, 'FL': 24, 'IL': 24,
          'PA': 24, 'OH': 24, 'GA': 24, 'NC': 24, 'MI': 24,
          'NJ': 24, 'VA': 24, 'WA': 24, 'AZ': 24, 'MA': 24, 'CO': 30,
        };

        const ceRequired = stateRequirements[user.state] || 30;
        const hoursRemaining = Math.max(0, ceRequired - ceCompleted);

        try {
          await sendCEReminderEmail(
            user.email,
            user.name,
            user.state || 'Unknown',
            daysUntilDeadline,
            ceCompleted,
            ceRequired
          );

          // Record that reminder was sent
          const reminderToRecord = reminderDays.find((days) => {
            const withinRange = daysUntilDeadline >= days - 1 && daysUntilDeadline <= days + 1;
            const alreadySent = (user.renewal_reminders_sent || []).some((r) => r.days_before === days);
            return withinRange && !alreadySent;
          });

          if (reminderToRecord) {
            await User.findByIdAndUpdate(user._id, {
              $push: {
                renewal_reminders_sent: {
                  days_before: reminderToRecord,
                  sent_at: new Date(),
                }
              }
            });
          }

          console.log(`[CE Renewal] Sent reminder email to ${user.email} (${daysUntilDeadline} days remaining)`);
        } catch (error) {
          console.error(`[CE Renewal] Failed to send email to ${user.email}:`, error.message);
        }
      }

      // Check if user just completed their CE requirements
      if (user.renewal_status === 'in-progress') {
        const ceCompletions = (user.completions || []).filter(
          (c) => String(c.course_id?.type || '').toUpperCase() === 'CE'
        );

        const ceCompleted = ceCompletions.reduce(
          (sum, c) => sum + Number(c.course_id?.credit_hours || 0),
          0
        );

        const stateRequirements = {
          'CA': 36, 'NY': 24, 'TX': 30, 'FL': 24, 'IL': 24,
          'PA': 24, 'OH': 24, 'GA': 24, 'NC': 24, 'MI': 24,
          'NJ': 24, 'VA': 24, 'WA': 24, 'AZ': 24, 'MA': 24, 'CO': 30,
        };

        const ceRequired = stateRequirements[user.state] || 30;

        if (ceCompleted >= ceRequired && user.notification_prefs?.email_completions !== false) {
          try {
            await sendCECompletionEmail(
              user.email,
              user.name,
              user.state || 'Unknown',
              ceRequired
            );

            // Update renewal status
            await User.findByIdAndUpdate(user._id, {
              renewal_status: 'completed',
            });

            console.log(`[CE Renewal] Sent completion email to ${user.email}`);
          } catch (error) {
            console.error(`[CE Renewal] Failed to send completion email to ${user.email}:`, error.message);
          }
        }
      }
    }

    console.log('[CE Renewal Scheduler] CE renewal checks completed');
  } catch (error) {
    console.error('[CE Renewal Scheduler] Error during CE renewal check:', error);
  }
};

// ─────────────────────────────────────────────────────────────────
// Initialize scheduler
// ─────────────────────────────────────────────────────────────────

const startCEScheduler = () => {
  // Run every 24 hours at 2 AM
  const scheduleTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  // Run immediately on startup
  checkCERenewals();
  
  // Then run every 24 hours
  setInterval(() => {
    checkCERenewals();
  }, 24 * 60 * 60 * 1000);

  console.log('[CE Renewal Scheduler] Started - checks run every 24 hours');
};

module.exports = {
  checkCERenewals,
  startCEScheduler,
};
