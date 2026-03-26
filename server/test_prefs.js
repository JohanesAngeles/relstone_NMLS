// Test milestone preference logic
const { getNotificationChannelStatus } = require('./routes/notifications.js');

console.log('Testing milestone preference logic...');

// Test user with milestone preferences set to false
const userWithPrefs = {
  notification_prefs: {
    milestone: { email: false, inapp: false }
  }
};

console.log('User with milestone prefs set to false:');
console.log('milestone inapp:', getNotificationChannelStatus(userWithPrefs, 'completion', 'inapp'));
console.log('milestone email:', getNotificationChannelStatus(userWithPrefs, 'completion', 'email'));

// Test user with no milestone preferences (should fall back to legacy)
const userLegacy = {
  notification_prefs: {
    email_completions: true
  }
};

console.log('\nUser with legacy email_completions=true, no milestone prefs:');
console.log('milestone inapp:', getNotificationChannelStatus(userLegacy, 'completion', 'inapp'));
console.log('milestone email:', getNotificationChannelStatus(userLegacy, 'completion', 'email'));

// Test user with no preferences at all
const userNoPrefs = {
  notification_prefs: {}
};

console.log('\nUser with no preferences:');
console.log('milestone inapp:', getNotificationChannelStatus(userNoPrefs, 'completion', 'inapp'));
console.log('milestone email:', getNotificationChannelStatus(userNoPrefs, 'completion', 'email'));