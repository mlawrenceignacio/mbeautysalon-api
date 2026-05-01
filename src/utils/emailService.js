import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send the email‑verification link to a customer.
 */
export const sendVerificationEmail = async (to, token) => {
  const baseUrl = (process.env.BACKEND_URL || "").replace(/\/$/, "");
  const link = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#790808;text-align:center;">MBeautyQueen Salon</h2>
      <p>Hello,</p>
      <p>Please verify your email address by clicking the button below so you can start booking reservations.</p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${link}"
           style="background:#790808;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
          Verify My Email
        </a>
      </div>
      <p style="font-size:13px;color:#888;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"MBeautyQueen Salon" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your email — MBeautyQueen Salon",
    html,
  });
};

/**
 * Notify customer when their reservation is declined / cancelled.
 */
export const sendReservationStatusEmail = async ({
  to,
  clientName,
  service,
  date,
  time,
  status,
  reason,
}) => {
  const formattedService = Array.isArray(service) ? service.join(", ") : String(service ?? "N/A");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
      <h2 style="color:#790808;text-align:center;">Reservation ${status}</h2>
      <p>Hello ${clientName},</p>
      <p>
        Your reservation for <b>${formattedService}</b> on
        <b>${date}</b> at <b>${time}</b> has been <b>${status}</b>.
      </p>
      <p><b>Reason:</b></p>
      <p style="background:#f4f4f4;padding:10px;border-radius:5px;">${reason}</p>
      <p>If you have questions, feel free to contact us.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"MBeautyQueen Salon" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your reservation has been ${status}`,
    html,
  });
};
