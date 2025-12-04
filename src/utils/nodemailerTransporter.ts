import nodemailer from "nodemailer";

/**
 * Create reusable Nodemailer transporter object
 */
export const nodemailerTransporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Optional: Verify connection at startup
 */
nodemailerTransporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail server connection failed:", error);
  } else {
    console.log("✅ Mail server is ready to send messages");
  }
});
