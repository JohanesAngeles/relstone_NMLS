const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!String(email).includes('@')) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: 'Support email service is not configured.' });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const supportInbox = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;

    await getTransporter().sendMail({
      from: `"Relstone Support Form" <${process.env.EMAIL_USER}>`,
      to: supportInbox,
      replyTo: email,
      subject: `[Contact Support] ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin-top:0;color:#0f2d44;">New Contact Support Request</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong></p>
          <div style="white-space:pre-line;background:#f8fafc;padding:12px;border-radius:8px;border:1px solid #e2e8f0;">${safeMessage}</div>
        </div>
      `,
      text: `New Contact Support Request\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    await getTransporter().sendMail({
      from: `"Relstone NMLS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'We received your support request',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:540px;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin-top:0;color:#0f2d44;">Thanks for contacting Relstone Support</h2>
          <p>Hi ${safeName},</p>
          <p>We received your request about <strong>${safeSubject}</strong>.</p>
          <p>Our team will respond during support hours (Monday to Friday, 8:00 AM to 6:00 PM EST).</p>
          <p style="margin-bottom:0;">Relstone Support Team</p>
        </div>
      `,
      text: `Hi ${name},\n\nWe received your support request about "${subject}".\nOur team will respond during support hours.\n\nRelstone Support Team`,
    });

    return res.status(200).json({ message: 'Support request sent successfully.' });
  } catch (err) {
    console.error('Support contact error:', err);
    return res.status(500).json({ message: 'Unable to send support request right now.' });
  }
});

module.exports = router;
