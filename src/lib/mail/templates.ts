
import { EmailTemplate } from './types'

export const templates = {
  subscriptionConfirmation: (userName: string, planName: string, endDate: string): EmailTemplate => ({
    subject: `Subscription Confirmed - Welcome to ResellerPro`,
    text: `Hello ${userName},\n\nYour subscription to the ${planName} plan is confirmed. It expires on ${endDate}.\n\nPlease find your contract note attached.\n\nRegards,\nResellerPro Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Welcome to ResellerPro!</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Thank you for subscribing to the <strong>${planName}</strong> plan.</p>
        <p>Your subscription is active until <strong>${endDate}</strong>.</p>
        <p>Please find your contract note attached to this email.</p>
        <br/>
        <p>Best regards,</p>
        <p>The ResellerPro Team</p>
      </div>
    `
  }),

  subscriptionReminder: (userName: string, daysLeft: number, endDate: string): EmailTemplate => ({
    subject: `Action Required: Your Subscription Expires in ${daysLeft} Days`,
    text: `Hello ${userName},\n\nYour subscription is expiring on ${endDate}. Please renew to prevent service interruption.\n\nRegards,\nResellerPro Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #eab308;">Subscription Expiring Soon</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>This is a reminder that your subscription will expire in <strong>${daysLeft} days</strong> (on ${endDate}).</p>
        <p>Please renew your plan to ensure uninterrupted access to your dashboard.</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a>
      </div>
    `
  }),

  otpCode: (otp: string): EmailTemplate => ({
    subject: `${otp} is your ResellerPro Verification Code`,
    text: `Your verification code is: ${otp}. Valid for 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Verification Code</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 5px; background: #f3f4f6; padding: 10px; display: inline-block;">${otp}</h1>
        <p>This code is valid for 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  }),

  enquiryAlert: (userName: string, unreadCount: number): EmailTemplate => ({
    subject: `You have ${unreadCount} pending enquiries`,
    text: `Hello ${userName},\n\nYou have ${unreadCount} enquiries waiting for your response. Please check your dashboard.\n\nRegards,\nResellerPro Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Enquiries Waiting</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>You have <strong>${unreadCount}</strong> enquiries that need your attention.</p>
        <p>Responding quickly improves your customer conversion rate!</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/enquiries" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Enquiries</a>
      </div>
    `
  }),

  orderStatus: (customerName: string, orderId: string, status: string, isUpdate: boolean): EmailTemplate => {
    const title = isUpdate ? `Update on Order #${orderId}` : `Order #${orderId} Status: ${status}`
    return {
      subject: title,
      text: `Hello ${customerName},\n\nThe status of your order #${orderId} is now: ${status}.\n\nRegards,\nResellerPro Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Order Update</h2>
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>The status of your order <strong>#${orderId}</strong> is:</p>
          <h3 style="color: #2563eb; text-transform: capitalize;">${status}</h3>
          <br/>
          <p>We will keep you updated.</p>
        </div>
      `
    }
  },

  orderAlert: (userName: string, pendingCount: number): EmailTemplate => ({
    subject: `Start Processing: You have ${pendingCount} new orders`,
    text: `Hello ${userName},\n\nYou have ${pendingCount} pending orders waiting for processing. Please check your dashboard to avoid delays.\n\nRegards,\nResellerPro Team`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Action Required: New Orders</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>You have <strong>${pendingCount}</strong> pending orders that need to be processed.</p>
        <p>Timely processing leads to happier customers!</p>
        <br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Process Orders</a>
      </div>
    `
  })
}
