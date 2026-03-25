const nodemailer = require('nodemailer');

// ── Nodemailer transporter ────────────────────────────────────────
const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─────────────────────────────────────────────────────────────────
// CE Renewal Reminder Emails
// ─────────────────────────────────────────────────────────────────

const sendCEReminderEmail = async (email, name, state, daysRemaining, hoursCompleted, hoursRequired) => {
  const urgencyLevel = daysRemaining <= 30 ? 'critical' : daysRemaining <= 60 ? 'high' : 'normal';
  const bgColor = urgencyLevel === 'critical' ? '#fee2e2' : urgencyLevel === 'high' ? '#fef3c7' : '#f0fdf4';
  const borderColor = urgencyLevel === 'critical' ? '#fca5a5' : urgencyLevel === 'high' ? '#fcd34d' : '#86efac';
  const accentColor = urgencyLevel === 'critical' ? '#dc2626' : urgencyLevel === 'high' ? '#d97706' : '#16a34a';

  const hoursRemaining = Math.max(0, hoursRequired - hoursCompleted);
  const renewalUrl = `${process.env.FRONTEND_URL || 'https://relstone-nmls.com'}/ce-tracker`;

  await getTransporter().sendMail({
    from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `CE Renewal Reminder: ${daysRemaining} Days Left (${state})`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:rgba(46,171,254,0.08);border:1px solid rgba(46,171,254,0.2);border-radius:12px;padding:12px 18px;margin-bottom:16px;">
            <span style="font-size:18px;font-weight:800;color:#091925;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
          </div>
          <h2 style="color:#091925;font-size:22px;font-weight:800;margin:0;">CE Renewal Deadline Approaching</h2>
        </div>

        <!-- Alert Box -->
        <div style="background:${bgColor};border:2px solid ${borderColor};border-radius:12px;padding:20px;margin-bottom:28px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="font-size:24px;flex-shrink:0;">
              ${urgencyLevel === 'critical' ? '🚨' : urgencyLevel === 'high' ? '⚠️' : '📋'}
            </div>
            <div>
              <div style="font-weight:700;color:${accentColor};font-size:16px;margin-bottom:4px;">
                ${daysRemaining} Days Remaining
              </div>
              <div style="color:#64748b;font-size:14px;">
                Your ${state} license renewal deadline is approaching. Complete your remaining CE hours to avoid penalties.
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin-bottom:28px;">
          <div style="font-weight:600;color:#091925;font-size:14px;margin-bottom:16px;">Your Progress</div>
          
          <!-- Progress Metrics -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
              <div style="color:#64748b;font-size:12px;margin-bottom:6px;">Hours Required</div>
              <div style="font-size:24px;font-weight:800;color:#091925;">${hoursRequired}</div>
            </div>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;">
              <div style="color:#64748b;font-size:12px;margin-bottom:6px;">Hours Completed</div>
              <div style="font-size:24px;font-weight:800;color:#22c55e;">${hoursCompleted}</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="background:#e5e7eb;border-radius:8px;height:8px;overflow:hidden;margin-bottom:12px;">
            <div style="background:#22c55e;height:100%;width:${Math.min((hoursCompleted / hoursRequired) * 100, 100)}%;transition:width 0.3s ease;"></div>
          </div>

          ${hoursRemaining > 0 ? `
            <div style="color:#f59e0b;font-weight:600;font-size:13px;">
              ${hoursRemaining} more hours needed by ${new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          ` : `
            <div style="color:#22c55e;font-weight:600;font-size:13px;display:flex;align-items:center;gap:6px;">
              ✓ You've completed all required CE hours!
            </div>
          `}
        </div>

        <!-- CTA Section -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${renewalUrl}" style="display:inline-block;background:#2EABFE;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
                View Your CE Progress
              </a>
            </td>
          </tr>
        </table>

        <!-- Information Section -->
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:6px;margin-bottom:28px;">
          <div style="font-weight:600;color:#16a34a;font-size:13px;margin-bottom:8px;">💡 Quick Tip</div>
          <div style="color:#4b5563;font-size:13px;line-height:1.6;">
            Browse our catalog of approved CE courses for ${state}. Most courses can be completed in just a few hours. All certificates are instantly available for download.
          </div>
        </div>

        <!-- Renewal Process Info -->
        <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:20px;">
          <div style="font-weight:600;color:#091925;font-size:13px;margin-bottom:12px;">The Renewal Process</div>
          <ol style="color:#64748b;font-size:13px;line-height:1.8;padding-left:20px;margin:0;">
            <li style="margin-bottom:8px;"><strong>Complete</strong> your required CE hours on Relstone</li>
            <li style="margin-bottom:8px;"><strong>Download</strong> your CE certificate</li>
            <li style="margin-bottom:8px;"><strong>Submit</strong> certificate to the ${state} licensing board</li>
            <li><strong>Renew</strong> your license directly with your state</li>
          </ol>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding-top:20px;border-top:1px solid #e5e7eb;margin-top:20px;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            <a href="${renewalUrl}" style="color:#2EABFE;text-decoration:none;">Manage your CE tracker</a> • 
            <a href="${process.env.FRONTEND_URL || 'https://relstone-nmls.com'}/profile" style="color:#2EABFE;text-decoration:none;">Update preferences</a> • 
            <a href="${process.env.FRONTEND_URL || 'https://relstone-nmls.com'}/contact" style="color:#2EABFE;text-decoration:none;">Need help?</a>
          </p>
          <p style="color:#cbd5e1;font-size:11px;margin:12px 0 0 0;">
            © Relstone NMLS. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
};

const sendCECompletionEmail = async (email, name, state, hoursRequired) => {
  await getTransporter().sendMail({
    from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Congratulations! CE Requirements Complete (${state})`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
        <!-- Header -->
        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:rgba(46,171,254,0.08);border:1px solid rgba(46,171,254,0.2);border-radius:12px;padding:12px 18px;margin-bottom:16px;">
            <span style="font-size:18px;font-weight:800;color:#091925;">Relstone <span style="color:#2EABFE;">NMLS</span></span>
          </div>
          <div style="font-size:48px;margin-bottom:16px;">🎉</div>
          <h2 style="color:#091925;font-size:22px;font-weight:800;margin:0;">You're All Set!</h2>
        </div>

        <!-- Success Box -->
        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;margin-bottom:28px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            <div style="font-size:28px;flex-shrink:0;">✓</div>
            <div>
              <div style="font-weight:700;color:#16a34a;font-size:16px;margin-bottom:4px;">
                Ready for Renewal
              </div>
              <div style="color:#64748b;font-size:14px;">
                You've successfully completed all ${hoursRequired} required CE hours for your ${state} license renewal.
              </div>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin-bottom:28px;">
          <div style="font-weight:600;color:#091925;font-size:14px;margin-bottom:16px;">Next Steps</div>
          
          <div style="display:grid;gap:12px;">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;display:flex;gap:12px;">
              <div style="font-size:24px;flex-shrink:0;">📥</div>
              <div>
                <div style="font-weight:600;color:#091925;font-size:13px;margin-bottom:4px;">Download Your Certificate</div>
                <div style="color:#64748b;font-size:12px;">Your completion certificates are ready in your CE Tracker.</div>
              </div>
            </div>

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;display:flex;gap:12px;">
              <div style="font-size:24px;flex-shrink:0;">📧</div>
              <div>
                <div style="font-weight:600;color:#091925;font-size:13px;margin-bottom:4px;">Submit to Your State</div>
                <div style="color:#64748b;font-size:12px;">Submit your certificates to your state licensing board.</div>
              </div>
            </div>

            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;display:flex;gap:12px;">
              <div style="font-size:24px;flex-shrink:0;">✅</div>
              <div>
                <div style="font-weight:600;color:#091925;font-size:13px;margin-bottom:4px;">Renew Your License</div>
                <div style="color:#64748b;font-size:12px;">Complete your renewal through your state's licensing portal.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${process.env.FRONTEND_URL || 'https://relstone-nmls.com'}/ce-tracker" style="display:inline-block;background:#2EABFE;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
                View Your CE Tracker
              </a>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <div style="text-align:center;padding-top:20px;border-top:1px solid #e5e7eb;margin-top:20px;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            Have questions? <a href="${process.env.FRONTEND_URL || 'https://relstone-nmls.com'}/contact" style="color:#2EABFE;text-decoration:none;">Contact our support team</a>.
          </p>
          <p style="color:#cbd5e1;font-size:11px;margin:12px 0 0 0;">
            © Relstone NMLS. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = {
  sendCEReminderEmail,
  sendCECompletionEmail,
};
