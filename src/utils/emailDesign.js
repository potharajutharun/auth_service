export const emailDesign = (resetUrl) => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
    <tr>
      <td align="center">

        <!-- EMAIL CONTAINER -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:6px; overflow:hidden;">
          
          <!-- HEADER WITH LOGO -->
          <tr>
            <td style="background:#0d6efd; padding:20px; text-align:center;">
              <img src="https://adminportal-2r3x.vercel.app/_next/image?url=%2FGemini_Generated_Image_o0uen0o0uen0o0ue-removebg-preview.png&w=256&q=75"
                   alt="Pensoic.com 👋"
                   width="140"
                   style="display:block; margin:0 auto 10px;" />
              <h2 style="margin:0; color:#ffffff;">Pensoic Pvt Ltd</h2>
              <p style="margin:5px 0 0; font-size:12px; color:#ffffff;">
                Secure Account Notification
              </p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding:30px; color:#333;">

              <h3>Password Reset Request</h3>

              <p>We received a request to reset your account password.</p>

              <p>If you made this request, click the button below:</p>

              <!-- BUTTON -->
              <p style="text-align:center; margin:30px 0;">
                <a href="${resetUrl}" 
                   style="background:#0d6efd; color:#ffffff; padding:12px 18px;
                          text-decoration:none; border-radius:4px; display:inline-block;">
                  Reset Password
                </a>
              </p>

              <p>This reset link will expire in <strong>10 minutes</strong>.</p>

              <p>If you did not request this, you can safely ignore this email.</p>

              <p style="margin-top:20px;">Regards,<br/>
              <strong>Pensoic Pvt Ltd</strong><br/>
              Support Team</p>

              <hr style="margin-top:30px;"/>

              <!-- FALLBACK LINK -->
              <p style="font-size:12px; color:gray;">
                If the button does not work, copy and paste this link below into your browser:
              </p>
              <p style="word-break:break-all; font-size:12px;">
                ${resetUrl}
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f2f2f2; text-align:center; padding:15px; font-size:12px; color:#777;">
              © ${new Date().getFullYear()} Pensoic Pvt Ltd. All rights reserved.<br/>
              This email was sent automatically. Please do not reply.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
//# sourceMappingURL=emailDesign.js.map