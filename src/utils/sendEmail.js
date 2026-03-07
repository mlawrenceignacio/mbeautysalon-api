import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

let transporterVerified = false;

const ensureTransporterReady = async () => {
  if (transporterVerified) return;

  await transporter.verify();
  transporterVerified = true;
  console.log("SMTP connection verified");
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to) {
      throw new Error("Recipient email is required.");
    }

    if (!emailUser || !emailPass) {
      throw new Error(
        "Email credentials are missing in environment variables.",
      );
    }

    await ensureTransporterReady();

    const info = await transporter.sendMail({
      from: `"MBeautyQueen" <${emailUser}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("sendEmail error:", error);
    throw error;
  }
};
