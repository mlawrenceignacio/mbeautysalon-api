import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

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

    const info = await transporter.sendMail({
      from: `"MBeautyQueen" <${emailUser}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return info;
  } catch (error) {
    console.error("sendEmail error details:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    throw error;
  }
};
