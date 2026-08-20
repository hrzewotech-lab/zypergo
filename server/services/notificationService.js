/**
 * Notification Service
 * A centralized module for sending notifications across the ZyperGo platform.
 * This is currently a stub that logs to the console. 
 * In production, you would connect Twilio/MSG91 for SMS, Firebase for Push, and SendGrid for Email.
 */

const nodemailer = require('nodemailer');

class NotificationService {
  
  static async getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('SMTP Transport configured.');
    }
    return this.transporter;
  }

  static sendSMS(phone, message, type = 'Standard') {
    if (!phone) return;
    console.log(`[SMS][${type}] To: ${phone} | Msg: ${message}`);
    // TODO: Integrate MSG91 or Twilio API
  }

  static sendWhatsApp(phone, message, templateId = null) {
    if (!phone) return;
    console.log(`[WhatsApp] To: ${phone} | Msg: ${message}`);
    // TODO: Integrate WhatsApp Business API (e.g. Meta Graph API or Twilio)
  }

  static sendPushNotification(fcmToken, title, body, data = {}) {
    if (!fcmToken) return;
    console.log(`[Push Notification] To Token: ${fcmToken} | Title: ${title} | Body: ${body}`);
    // TODO: Integrate Firebase Admin SDK
  }

  static async sendEmail(email, subject, htmlBody) {
    if (!email) return;
    console.log(`[${new Date().toISOString()}] Attempting to send to ${email}`);
    
    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: '"ZyperGo Logistics" <noreply@zypergo.com>',
        to: email,
        subject: subject,
        html: htmlBody,
      });
      console.log(`[${new Date().toISOString()}] Email Success: ${info.messageId}`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Email Error: ${err.message}`);
      throw err;
    }
  }

  static generateEmailTemplate({ title, message, otpCode = null, buttonText = null, buttonUrl = null, footerNote = null }) {
    let otpSection = '';
    if (otpCode) {
      otpSection = `
        <div style="border: 2px dashed #fb5c00; background-color: #fffaf7; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <p style="font-size: 12px; color: #64748b; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 10px; margin-top: 0; text-transform: uppercase;">YOUR 6-DIGIT VERIFICATION CODE</p>
          <div style="font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #0f172a; margin: 0;">${otpCode}</div>
          <p style="font-size: 13px; color: #64748b; margin-top: 15px; margin-bottom: 0;">Enter this code on the application to proceed.</p>
        </div>
      `;
    }

    let buttonSection = '';
    if (buttonText && buttonUrl) {
      buttonSection = `
        <div style="text-align: center; margin: 35px 0;">
          <a href="${buttonUrl}" style="background-color: #fb5c00; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">${buttonText}</a>
        </div>
      `;
    }

    let footerHtml = footerNote 
      ? `<p style="font-size: 13px; color: #64748b; margin-bottom: 25px; line-height: 1.6;">${footerNote}</p>` 
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }
          .header { padding: 30px 40px; text-align: center; border-bottom: 1px solid #f1f5f9; background-color: #ffffff; }
          .logo { font-size: 26px; font-weight: 900; color: #fb5c00; letter-spacing: -0.5px; margin: 0; }
          .content { padding: 40px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px; text-align: center; }
          .message { font-size: 15px; color: #475569; line-height: 1.6; margin: 0; text-align: center; }
          .footer { background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer-text { font-size: 12px; color: #94a3b8; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">ZyperGo Logistics</h1>
          </div>
          <div class="content">
            <h2 class="title">${title}</h2>
            <div class="message">${message}</div>
            ${otpSection}
            ${buttonSection}
            ${footerHtml}
          </div>
          <div class="footer">
            <p class="footer-text">ZyperGo Logistics &copy; ${new Date().getFullYear()} | <a href="mailto:support@zypergo.com" style="color: #fb5c00; text-decoration: none;">support@zypergo.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // --- High Level Event Handlers ---

  static notifyBookingConfirmed(booking, customerPhone, customerEmail) {
    this.sendSMS(customerPhone, `Your ZyperGo booking (${booking.trackingId}) is confirmed! Track here: http://localhost:5173/track/${booking.trackingId}`);
    this.sendWhatsApp(customerPhone, `Hi, your ZyperGo booking (${booking.trackingId}) is confirmed! Track your shipment live: http://localhost:5173/track/${booking.trackingId}`);
    if (customerEmail) {
      const htmlBody = this.generateEmailTemplate({
        title: 'Booking Confirmed',
        message: 'Your ZyperGo booking has been confirmed and is scheduled for pickup.',
        buttonText: 'Track Shipment',
        buttonUrl: `http://localhost:5173/track/${booking.trackingId}`,
        footerNote: `Tracking ID: <strong>${booking.trackingId}</strong>`
      });
      this.sendEmail(customerEmail, 'Booking Confirmed - ZyperGo', htmlBody);
    }
  }

  static notifyRiderAssigned(booking, customerPhone) {
    this.sendSMS(customerPhone, `A Rider has been assigned to pickup your ZyperGo shipment (${booking.trackingId}).`);
    this.sendPushNotification('customer_fcm_mock', 'Rider Assigned', 'A rider is assigned for your pickup.');
  }

  static notifyPickupOTP(customerPhone, customerEmail, otp, trackingId) {
    this.sendSMS(customerPhone, `Your pickup OTP for ZyperGo shipment is ${otp}. Do not share this with anyone except the Rider.`, 'Critical');
    if (customerEmail) {
      const htmlBody = this.generateEmailTemplate({
        title: 'Pickup Verification Code',
        message: 'A Rider has arrived to pick up your shipment. Please share this secure code with them.',
        otpCode: otp,
        footerNote: `Tracking ID: <strong>${trackingId}</strong>`
      });
      this.sendEmail(customerEmail, 'Your Pickup OTP - ZyperGo', htmlBody);
    }
  }

  static notifyPickedUp(booking, customerPhone, receiverPhone) {
    this.sendSMS(customerPhone, `Your shipment (${booking.trackingId}) has been successfully picked up.`);
    this.sendSMS(receiverPhone, `A ZyperGo shipment (${booking.trackingId}) is on its way to you! Track here: http://localhost:5173/track/${booking.trackingId}`);
    this.sendWhatsApp(receiverPhone, `Hi! A shipment is heading your way. Track live: http://localhost:5173/track/${booking.trackingId}`);
  }

  static notifyInTransit(booking, receiverPhone) {
    this.sendSMS(receiverPhone, `Your ZyperGo shipment (${booking.trackingId}) is now in transit.`);
  }

  static notifyOutForDelivery(booking, receiverPhone, receiverEmail, otp) {
    this.sendSMS(receiverPhone, `Your ZyperGo shipment (${booking.trackingId}) is out for delivery! Your delivery OTP is ${otp}.`, 'Critical');
    this.sendWhatsApp(receiverPhone, `Your shipment is out for delivery today. Delivery OTP: ${otp}. Please share this with the rider.`);
    if (receiverEmail) {
      const htmlBody = this.generateEmailTemplate({
        title: 'Delivery Verification Code',
        message: 'Your shipment is out for delivery. Please share this secure code with the Rider upon arrival.',
        otpCode: otp,
        footerNote: `Tracking ID: <strong>${booking.trackingId}</strong>`
      });
      this.sendEmail(receiverEmail, 'Your Delivery OTP - ZyperGo', htmlBody);
    }
  }

  static notifyDelivered(booking, customerPhone, receiverPhone) {
    this.sendSMS(customerPhone, `Your shipment (${booking.trackingId}) was successfully delivered.`);
    this.sendSMS(receiverPhone, `Your ZyperGo shipment (${booking.trackingId}) has been delivered.`);
  }

  static notifyException(booking, adminPhone) {
    this.sendSMS(adminPhone, `ALERT: Exception reported on shipment ${booking.trackingId}. Check Admin Panel immediately.`, 'Alert');
  }
}

module.exports = NotificationService;
