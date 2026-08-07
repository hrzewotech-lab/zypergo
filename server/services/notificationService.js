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

  // --- High Level Event Handlers ---

  static notifyBookingConfirmed(booking, customerPhone, customerEmail) {
    this.sendSMS(customerPhone, `Your ZyperGo booking (${booking.trackingId}) is confirmed! Track here: http://localhost:5173/track/${booking.trackingId}`);
    this.sendWhatsApp(customerPhone, `Hi, your ZyperGo booking (${booking.trackingId}) is confirmed! Track your shipment live: http://localhost:5173/track/${booking.trackingId}`);
    if (customerEmail) {
      this.sendEmail(customerEmail, 'Booking Confirmed - ZyperGo', `Your booking ${booking.trackingId} is confirmed.`);
    }
  }

  static notifyRiderAssigned(booking, customerPhone) {
    this.sendSMS(customerPhone, `A Raider has been assigned to pickup your ZyperGo shipment (${booking.trackingId}).`);
    this.sendPushNotification('customer_fcm_mock', 'Raider Assigned', 'A raider is assigned for your pickup.');
  }

  static notifyPickupOTP(customerPhone, otp) {
    this.sendSMS(customerPhone, `Your pickup OTP for ZyperGo shipment is ${otp}. Do not share this with anyone except the Raider.`, 'Critical');
  }

  static notifyPickedUp(booking, customerPhone, receiverPhone) {
    this.sendSMS(customerPhone, `Your shipment (${booking.trackingId}) has been successfully picked up.`);
    this.sendSMS(receiverPhone, `A ZyperGo shipment (${booking.trackingId}) is on its way to you! Track here: http://localhost:5173/track/${booking.trackingId}`);
    this.sendWhatsApp(receiverPhone, `Hi! A shipment is heading your way. Track live: http://localhost:5173/track/${booking.trackingId}`);
  }

  static notifyInTransit(booking, receiverPhone) {
    this.sendSMS(receiverPhone, `Your ZyperGo shipment (${booking.trackingId}) is now in transit.`);
  }

  static notifyOutForDelivery(booking, receiverPhone, otp) {
    this.sendSMS(receiverPhone, `Your ZyperGo shipment (${booking.trackingId}) is out for delivery! Your delivery OTP is ${otp}.`, 'Critical');
    this.sendWhatsApp(receiverPhone, `Your shipment is out for delivery today. Delivery OTP: ${otp}. Please share this with the rider.`);
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
