/**
 * Notifications module
 *
 * In-app: notifications live on User.notifications (see models/User.js).
 * Email: optional, via Nodemailer + Gmail app password (EMAIL_USER, EMAIL_PASS in server/.env).
 *
 * Routes:
 *   GET    /api/notifications              — list (newest first)
 *   PATCH  /api/notifications/mark-all-read
 *   PATCH  /api/notifications/:id          — set read / unread
 *   POST   /api/notifications/trigger      — custom notification (QA: optional sendEmail + email prefs)
 *   POST   /api/notifications/trigger/:event — predefined scenario (welcome, purchase, …)
 *   POST   /api/notifications/test-email   — admin-only SMTP check
 */

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const APP_BASE_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  process.env.APP_URL ||
  'http://localhost:3000';

// HTML email template 

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const EMAIL_META_BY_EVENT = {
  welcome: {
    icon: '&#10024;',
    buttonText: 'Start Learning',
    buttonUrl: `${APP_BASE_URL}/dashboard`,
    previewText: 'Welcome to Relstone NMLS. Your dashboard is ready.',
  },
  purchase: {
    icon: '&#10003;',
    buttonText: 'Go to My Courses',
    buttonUrl: `${APP_BASE_URL}/dashboard`,
    previewText: 'Your course purchase is complete and ready.',
  },
  completion: {
    icon: '&#9733;',
    buttonText: 'View My Transcript',
    buttonUrl: `${APP_BASE_URL}/dashboard/transcript`,
    previewText: 'You completed a chapter. Keep your momentum.',
  },
  certificate: {
    icon: '&#10003;',
    buttonText: 'View Certificate',
    buttonUrl: `${APP_BASE_URL}/dashboard/transcript`,
    previewText: 'Your certificate is available now.',
  },
  renewal: {
    icon: '&#9200;',
    buttonText: 'Review Renewal Plan',
    buttonUrl: `${APP_BASE_URL}/dashboard`,
    previewText: 'Your CE renewal deadline is coming up.',
  },
  custom: {
    icon: '&#9679;',
    buttonText: 'Open Notifications',
    buttonUrl: `${APP_BASE_URL}/notifications`,
    previewText: 'You have a new notification in Relstone NMLS.',
  },
  test: {
    icon: '&#9679;',
    buttonText: 'Open Dashboard',
    buttonUrl: `${APP_BASE_URL}/dashboard`,
    previewText: 'This is a test message from your email configuration.',
  },
};

const ICON_BY_NOTIFICATION_TYPE = {
  milestones: '&#9733;',
  completions: '&#10003;',
  new: '&#10003;',
  ce: '&#9200;',
  system: '&#9679;',
  purchase: '&#10003;',
};

function getEmailMeta(eventType) {
  return EMAIL_META_BY_EVENT[eventType] || EMAIL_META_BY_EVENT.custom;
}

function getIconForType(type) {
  return ICON_BY_NOTIFICATION_TYPE[type] || '&#9679;';
}

function normalizeNotificationEventType(eventType) {
  if (!eventType) return eventType;
  const normalized = {
    completion: 'milestone',
    completions: 'milestone',
    certificate: 'milestone',
    milestone: 'milestone',
    milestones: 'milestone',
    new_course: 'new_course',
    renewal: 'renewal',
    purchase: 'purchase',
    quiz: 'quiz',
    welcome: 'welcome',
  };
  return normalized[eventType] || eventType;
}

function getNotificationChannelStatus(user, eventType, channel) {
  const prefs = user.notification_prefs || {};
  const normalizedEvent = normalizeNotificationEventType(eventType);
  const legacyMap = {
    purchase:   { email: 'email_course_updates', sms: 'sms_course_updates', inapp: true },
    renewal:    { email: 'email_reminders',    sms: 'sms_reminders',    inapp: true },
    new_course: { email: 'email_course_updates', sms: 'sms_course_updates', inapp: true },
    quiz:       { email: 'email_completions',  sms: 'sms_completions',  inapp: true },
    milestone:  { email: 'email_completions',  sms: 'sms_completions',  inapp: false },
  };

  console.log(`[getNotificationChannelStatus] eventType=${eventType} normalizedEvent=${normalizedEvent} channel=${channel}`);
  console.log(`[getNotificationChannelStatus] full prefs:`, JSON.stringify(prefs, null, 2));
  console.log(`[getNotificationChannelStatus] prefs[${normalizedEvent}]=`, prefs[normalizedEvent]);
  console.log(`[getNotificationChannelStatus] prefs[${normalizedEvent}][${channel}]=`, prefs[normalizedEvent]?.[channel]);

  if (prefs[normalizedEvent] && prefs[normalizedEvent][channel] !== undefined) {
    const result = prefs[normalizedEvent][channel];
    console.log(`[getNotificationChannelStatus] returning new pref: ${result}`);
    return result;
  }

  console.log(`[getNotificationChannelStatus] no new pref found, checking legacy`);

  const mapping = legacyMap[normalizedEvent];
  if (mapping) {
    const legacyVal = mapping[channel];
    if (typeof legacyVal === 'boolean') {
      console.log(`[getNotificationChannelStatus] returning legacy boolean: ${legacyVal} for ${normalizedEvent}.${channel}`);
      return legacyVal;
    }
    const legacyPref = prefs[legacyVal];
    console.log(`[getNotificationChannelStatus] legacy key=${legacyVal} value=${legacyPref}`);
    if (legacyPref !== undefined) {
      console.log(`[getNotificationChannelStatus] returning legacy pref: ${legacyPref}`);
      return legacyPref;
    }
    console.log(`[getNotificationChannelStatus] returning fallback for inapp: ${channel === 'inapp'}`);
    return channel === 'inapp';
  }

  // New behavior: opt-out by default to honor user preferences, unless explicitly enabled
  console.log(`[getNotificationChannelStatus] returning default false`);
  if (channel === 'inapp') return false;
  if (channel === 'email') return false;
  if (channel === 'sms') return false;
  return false;
}

function getPrefValue(userPrefs, prefKey) {
  if (!prefKey) return false;

  // Handle nested preferences like 'purchase.email'
  if (prefKey.includes('.')) {
    const [category, channel] = prefKey.split('.');
    const result = userPrefs?.[category]?.[channel] ?? false;
    console.log(`[getPrefValue] ${prefKey} -> userPrefs.${category}.${channel} = ${result}`);
    return result;
  }

  // Handle legacy flat preferences
  const result = userPrefs?.[prefKey] ?? false;
  console.log(`[getPrefValue] ${prefKey} -> userPrefs.${prefKey} = ${result}`);
  return result;
}

function isNotificationAllowed(user, eventType, channel) {
  const normalizedType = normalizeNotificationEventType(eventType);
  if (!normalizedType || !['email', 'sms', 'inapp'].includes(channel)) {
    return false;
  }

  // Complete event types are governed either by specific pref or fallback
  return getNotificationChannelStatus(user, normalizedType, channel);
}

function buildNotificationEmailHtml({
  recipientName,
  title,
  body,
  icon,
  buttonText,
  buttonUrl,
  previewText,
}) {
  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f7fb;font-family:Inter,Arial,sans-serif;color:#091925;">
  <div style="display:none;font-size:1px;color:#f3f7fb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(previewText)}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7fb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;border:1px solid #e4ebf3;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 10px 28px;text-align:center;">
              <div style="display:inline-block;background:rgba(46,171,254,0.1);border:1px solid rgba(46,171,254,0.25);border-radius:12px;padding:10px 16px;">
                <span style="font-size:18px;font-weight:800;color:#091925;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 28px 0 28px;">
              <h2 style="margin:0 0 10px 0;font-size:30px;line-height:1.2;font-weight:800;color:#091925;">
                Hi ${escapeHtml(recipientName || 'there')},
              </h2>
              <p style="margin:0 0 12px 0;font-size:21px;line-height:1.35;font-weight:700;color:#0f2231;">
                <span style="display:inline-block;vertical-align:middle;margin-right:10px;width:28px;height:28px;line-height:28px;text-align:center;border-radius:10px;background:#f0f6fa;border:1px solid #e4ebf3;color:#091925;font-size:16px;">
                  ${icon || ''}
                </span>
                <span style="vertical-align:middle;">${escapeHtml(title)}</span>
              </p>
              <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b7b;">
                ${escapeHtml(body)}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px;">
              <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="background:#2EABFE;border-radius:12px;">
                    <a href="${escapeHtml(buttonUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                      ${escapeHtml(buttonText)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 28px 24px 28px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a97a6;text-align:center;">
                If the button does not work, copy and paste this URL into your browser:
              </p>
              <p style="margin:8px 0 0 0;font-size:12px;line-height:1.6;color:#5a6b7b;text-align:center;word-break:break-all;">
                ${escapeHtml(buttonUrl)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function createMailTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  const isGmail = user.toLowerCase().includes('gmail.com');
  return nodemailer.createTransport({
    service: isGmail ? 'gmail' : process.env.EMAIL_SERVICE || 'gmail',
    auth: { user, pass },
  });
}

async function sendNotificationEmail(user, title, body, options = {}) {
  const transporter = createMailTransporter();
  if (!transporter) {
    console.error('[notifications] EMAIL_USER or EMAIL_PASS missing');
    return false;
  }

  try {
    const meta = getEmailMeta(options.eventType || 'custom');
    const buttonText = options.buttonText || meta.buttonText;
    const buttonUrl = options.buttonUrl || meta.buttonUrl;
    const previewText = options.previewText || meta.previewText;
    const icon = options.icon || meta.icon || '';

    const result = await transporter.sendMail({
      from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: title,
      text: `${body}\n\n${buttonText}: ${buttonUrl}`,
      html: buildNotificationEmailHtml({
        recipientName: user.name || user.email,
        title,
        body,
        icon,
        buttonText,
        buttonUrl,
        previewText,
      }),
    });

    console.log(`[notifications] email sent to ${user.email} id=${result.messageId}`);
    return true;
  } catch (err) {
    console.error(`[notifications] email failed for ${user.email}:`, err.message);

    if (err.message.includes('Invalid login') || err.message.includes('534')) {
      console.error('[notifications] Gmail: use an App Password (16 chars, no spaces) with 2FA: https://myaccount.google.com/apppasswords');
    }
    return false;
  }
}

//  Persistence 

async function createNotification(user, payload) {
  if (!user.notifications) user.notifications = [];
  const note = {
    type: payload.type || 'system',
    title: payload.title || 'Notification',
    body: payload.body || 'You have a new message.',
    read: false,
    createdAt: new Date(),
  };
  user.notifications.unshift(note);
  await user.save();
  return note;
}

/** Predefined QA: each maps to a notification shape + which user.notification_prefs key gates email */
const PREDEFINED_EVENTS = {
  welcome: {
    notification: {
      type: 'system',
      title: 'Welcome to Relstone',
      body: 'Thanks for signing up! Start learning now.',
    },
    emailPref: 'email_course_updates',
    smsPref: 'sms_course_updates',
    inappPref: true, // Always show welcome in-app
  },
  purchase: {
    notification: {
      type: 'purchase',
      title: 'Course Purchased Successfully',
      body: 'You have successfully purchased a course. It is now available in My Courses.',
    },
    emailPref: 'purchase.email',
    smsPref: 'purchase.sms',
    inappPref: 'purchase.inapp',
  },
  completion: {
    notification: {
      type: 'milestones',
      title: 'Chapter complete',
      body: 'You completed a chapter! Keep going.',
    },
    emailPref: 'milestone.email',
    smsPref: 'milestone.sms',
    inappPref: 'milestone.inapp',
  },
  certificate: {
    notification: {
      type: 'milestones',
      title: 'Certificate ready',
      body: 'Your certificate is ready. Download it now.',
    },
    emailPref: 'milestone.email',
    smsPref: 'milestone.sms',
    inappPref: 'milestone.inapp',
  },
  renewal: {
    notification: {
      type: 'ce',
      title: 'Renewal reminder',
      body: 'Your CE renewal deadline is approaching. Book now.',
    },
    emailPref: 'renewal.email',
    smsPref: 'renewal.sms',
    inappPref: 'renewal.inapp',
  },
  quiz: {
    notification: {
      type: 'quiz',
      title: 'Quiz Results',
      body: 'Your quiz results are ready to view.',
    },
    emailPref: 'quiz.email',
    smsPref: 'quiz.sms',
    inappPref: 'quiz.inapp',
  },
  new_course: {
    notification: {
      type: 'new',
      title: 'New Course Available',
      body: 'A new course has been added to our catalog.',
    },
    emailPref: 'new_course.email',
    smsPref: 'new_course.sms',
    inappPref: 'new_course.inapp',
  },
};

//  Routes 

router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifications = (user.notifications || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ notifications });
  } catch (err) {
    console.error('[notifications] GET /', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.notifications) user.notifications = [];

    user.notifications.forEach((n) => {
      n.read = true;
    });
    await user.save();

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[notifications] PATCH mark-all-read', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Custom notification (used by Notifications page QA buttons).
 * sendEmail: if true, email is sent only when notification_prefs.email_course_updates is on.
 */
router.post('/trigger', authMiddleware, async (req, res) => {
  try {
    const { type, title, body, sendEmail = false } = req.body;

    if (!type || !title || !body) {
      return res.status(400).json({ message: 'Missing type, title, or body' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const normalizedType = normalizeNotificationEventType(String(type).toLowerCase());
    const allowInApp = isNotificationAllowed(user, normalizedType, 'inapp');
    const allowEmail = sendEmail
      ? (normalizedType === 'custom'
          ? (user.notification_prefs?.email_course_updates ?? false)
          : isNotificationAllowed(user, normalizedType, 'email'))
      : false;

    console.log(`[trigger/custom] type=${type} normalizedType=${normalizedType} user=${user.email} allowInApp=${allowInApp} allowEmail=${allowEmail}`);
    console.log(`[trigger/custom] prefs:`, JSON.stringify(user.notification_prefs, null, 2));

    let note = null;
    if (allowInApp) {
      note = await createNotification(user, { type, title, body });
    } else {
      console.log(`[trigger/custom] In-app notification skipped for ${user.email} (channel disabled)`);
    }

    if (allowEmail) {
      await sendNotificationEmail(user, title, body, {
        eventType: normalizedType,
        icon: getIconForType(type),
      });
    } else if (sendEmail) {
      console.log(`[trigger/custom] Email skipped for ${user.email} (channel disabled)`);
    }

    res.json({ message: 'Notification created', notification: note });
  } catch (err) {
    console.error('[notifications] POST /trigger', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** Predefined scenarios (welcome, purchase, completion, certificate, renewal) — email follows user prefs */
router.post('/trigger/:event', authMiddleware, async (req, res) => {
  try {
    const eventType = req.params.event;
    const event = PREDEFINED_EVENTS[eventType];

    if (!event) {
      return res.status(404).json({ message: 'Unknown event' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log(`[trigger/${eventType}] user prefs:`, JSON.stringify(user.notification_prefs, null, 2));

    // Check if in-app notification should be created
    const shouldCreateInApp = (typeof event.inappPref === 'boolean')
      ? event.inappPref
      : (typeof event.inappPref === 'string')
        ? getPrefValue(user.notification_prefs, event.inappPref)
        : getNotificationChannelStatus(user, eventType, 'inapp');

    const shouldSendEmail = (typeof event.emailPref === 'string')
      ? getPrefValue(user.notification_prefs, event.emailPref)
      : getNotificationChannelStatus(user, eventType, 'email');

    console.log(`[notifications] trigger ${eventType} user=${user.email} inappPref=${event.inappPref} emailPref=${event.emailPref}`);
    console.log(`[notifications] trigger ${eventType} shouldCreateInApp=${shouldCreateInApp} shouldSendEmail=${shouldSendEmail}`);

    let note = null;
    if (shouldCreateInApp) {
      note = await createNotification(user, event.notification);
    }

    if (shouldSendEmail) {
      await sendNotificationEmail(user, event.notification.title, event.notification.body, {
        eventType,
      });
    }

    // TODO: SMS sending logic here
    // const shouldSendSMS = getPrefValue(user.notification_prefs, event.smsPref);
    // if (shouldSendSMS) {
    //   // Send SMS logic
    // }

    res.json({
      message: `Event triggered: ${eventType}`,
      notification: note,
      emailSent: shouldSendEmail,
      inappCreated: !!note
    });
  } catch (err) {
    console.error('[notifications] POST /trigger/:event', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { read } = req.body;
    if (typeof read !== 'boolean') {
      return res.status(400).json({ message: 'Missing read boolean' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifIndex = (user.notifications || []).findIndex(
      (n) => String(n._id) === String(req.params.id)
    );

    if (notifIndex === -1) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    user.notifications[notifIndex].read = read;
    await user.save();

    res.json({ notification: user.notifications[notifIndex] });
  } catch (err) {
    console.error('[notifications] PATCH /:id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/test-email', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { testEmail } = req.body;
    if (!testEmail) {
      return res.status(400).json({ message: 'testEmail is required' });
    }

    const testUser = { email: testEmail };
    const success = await sendNotificationEmail(
      testUser,
      'Relstone NMLS - Email Test',
      'This is a test email to verify your email configuration is working correctly.',
      { eventType: 'test' }
    );

    if (success) {
      res.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
        emailService: process.env.EMAIL_SERVICE || 'gmail',
        from: process.env.EMAIL_USER,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email. Check server logs for details.',
        troubleshooting: [
          'Gmail: use an App Password (16 characters, no spaces), not your normal password',
          'https://myaccount.google.com/apppasswords',
        ],
      });
    }
  } catch (err) {
    console.error('[notifications] POST /test-email', err);
    res.status(500).json({ message: 'Server error during email test' });
  }
});

router.createNotification = createNotification;
router.sendNotificationEmail = sendNotificationEmail;
router.getNotificationChannelStatus = getNotificationChannelStatus;
router.isNotificationAllowed = isNotificationAllowed;

module.exports = router;
