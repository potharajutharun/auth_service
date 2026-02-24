import nodemailer from "nodemailer";
import { env } from "../config/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create a single reusable transporter
const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: env.mail.port === 465, // true for 465, false for 587/25
  auth: {
    user: env.mail.user,
    pass: env.mail.pass,
  },
});

export const mailService = {
  /**
   * Generic send email function – use anywhere
   */
  async sendEmail({
    to,
    subject,
    html,
    text,
  }: SendEmailOptions): Promise<void> {
    await transporter.sendMail({
      from: env.mail.from,
      to,
      subject,
      html,
      text,
    });
  },

  /**
   * Specific helper: send email verification mail
   */
  async sendEmailVerification(email: string, token: string): Promise<void> {
    const verifyLink = `${
      env.app.frontendUrl
    }/verify-email?token=${encodeURIComponent(token)}`;

    const subject = "Verify your email address";
    const text = `Please verify your email by clicking this link: ${verifyLink}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="max-width:650px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">

    <!-- BANNER -->
    <tr>
      <td style="background:#1b1b1b; padding:32px; text-align:center;">

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:auto;">
          <tr>
            <td style="padding-right:12px;">
              <img src="https://adminportal-2r3x.vercel.app/_next/image?url=%2FGemini_Generated_Image_o0uen0o0uen0o0ue-removebg-preview.png&w=256&q=75"
                alt="Pensoic.com"
                style="max-width:160px; height:auto;">
            </td>
            <td style="vertical-align:middle;">
              <span style="color:#ffffff; font-size:42px; font-weight:bold;">
                Pensoic.com
              </span>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:30px; font-size:15px; color:#333; line-height:1.6;">
        <p>Hi,</p>

        <p>Thank you for registering with Pensoic.com To complete your account setup, please verify your email address by using the link below:</p>

        <!-- BUTTON -->
        <p style="text-align:center; margin:30px 0;">
          <a href="${verifyLink}"
            style="background:#007bff; color:#ffffff; padding:14px 26px;
                   border-radius:6px; text-decoration:none; font-size:16px; font-weight:bold;">
            Verify Email
          </a>
        </p>

        <!-- FALLBACK URL -->
        <p>If the above button does not work, you can copy and paste this URL into your browser:</p>
        <p style="word-break:break-all; color:#007bff;">
          ${verifyLink}
        </p>

        <p>This verification link will remain valid for 15 minutes.</p>

        <p style="margin-top:25px;">
          Regards,<br>
          Pensoic.com Team<br>
          <a href="https://pensoic.com" style="color:#007bff; text-decoration:none;">pensoic.com</a>
        </p>
      </td>
    </tr>

    <!-- EMPLOYMENT / SERVICE DISCLAIMER -->
    <tr>
      <td style="padding:25px 30px; font-size:12px; color:#666; background:#fafafa;
                 line-height:1.6; border-top:1px solid #e0e0e0;">

        <p><strong>Important Notice:</strong> Verifying your email is required to activate your Pensoic.com account. 
        This message does not represent an offer of employment, partnership, or contract unless an official written offer is issued directly by Pensoic.com</p>

        <p>Any future opportunities, interviews, or assessments will depend on business needs and eligibility criteria. 
        Completing registration or verification does not guarantee employment or engagement with Pensoic.com</p>

        <p><strong>Fraud Alert:</strong> Pensoic.com never requests money, fees, or compensation for account creation, verification, job opportunities, or services. 
        If anyone contacts you claiming otherwise, please report it immediately to our support team.</p>

        <p><strong>Privacy Notice:</strong> Your personal information is collected and processed solely for identity verification, account creation, and security purposes. 
        Pensoic.com follows applicable data protection regulations, including the Digital Personal Data Protection Act (DPDP Act - India), GDPR-equivalent principles, and other lawful requirements.</p>

        <p>Your data may be processed by authorized third-party service providers exclusively for operational and security purposes. 
        It will be retained only as long as required for the purpose for which it was collected.</p>

        <p>You may review our full privacy policy and your data rights anytime at:
          <a href="https://pensoic.com/privacy" style="color:#007bff; text-decoration:none;">pensoic.com/privacy</a>
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="text-align:center; padding:25px; background:#f0f0f0; color:#777; font-size:13px;">
        <p style="margin:6px 0;">Stay Connected</p>

        <div style="margin:10px 0;">
          <a href="#"><img src="https://static.vecteezy.com/ti/gratis-vektor/p1/18910721-linkedin-logo-linkedin-symbol-linkedin-symbol-freier-kostenlos-vektor.jpg" width="22" style="margin:0 8px;"></a>
          <a href="#"><img src="https://img.freepik.com/premium-psd/facebook-logo-blue-circle_705838-12823.jpg?semt=ais_hybrid&w=740&q=80" width="22" style="margin:0 8px;"></a>
          <a href="#"><img src="https://static.vecteezy.com/system/resources/thumbnails/011/998/173/small_2x/youtube-icon-free-vector.jpg" width="22" style="margin:0 8px;"></a>
          <a href="#"><img src="https://static.vecteezy.com/system/resources/previews/042/148/632/non_2x/instagram-logo-instagram-social-media-icon-free-png.png" width="22" style="margin:0 8px;"></a>
        </div>

        <p style="margin:10px 0;">
          <a href="https://pensoic.com/careers" style="color:#007bff; text-decoration:none;">Careers</a> &nbsp;|&nbsp;
          <a href="https://pensoic.com/blog" style="color:#007bff; text-decoration:none;">Blog</a>
        </p>

        <p style="margin-top:15px; font-size:12px;">
          © ${new Date().getFullYear()} Pensoic.com All rights reserved.
        </p>
      </td>
    </tr>

  </table>
</div>
    `;

    await this.sendEmail({ to: email, subject, html, text });
  },

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetLink = `${
      env.app.frontendUrl
    }/auth/resetpassword?token=${encodeURIComponent(token)}`;

    const subject = "Reset your password";
    const text = `Use this link to reset your password: ${resetLink}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:650px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">
          <tr>
            <td style="padding:30px; font-size:15px; color:#333; line-height:1.6;">
              <p>Hi,</p>
              <p>We received a request to reset your password.</p>
              <p style="text-align:center; margin:30px 0;">
                <a href="${resetLink}"
                  style="background:#007bff; color:#ffffff; padding:14px 26px;
                         border-radius:6px; text-decoration:none; font-size:16px; font-weight:bold;">
                  Reset Password
                </a>
              </p>
              <p>If the button does not work, copy this URL:</p>
              <p style="word-break:break-all; color:#007bff;">${resetLink}</p>
              <p>This reset link is valid for ${env.security.resetPasswordTtlMinutes} minutes.</p>
              <p>If you did not request this change, you can ignore this email.</p>
              <p style="margin-top:25px;">
                Regards,<br>
                Pensoic.com Team
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html, text });
  },
};
