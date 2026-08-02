import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const html = `
      <div style="font-family: Arial, sans-serif; color: #4a1033; line-height: 1.6;">
        <h2 style="color: #d9467a;">A sweet message from your Girlfriend's Day experience</h2>
        <p><strong>Name:</strong> ${payload.name || "Unknown"}</p>
        <p><strong>Heart Rate:</strong> ${payload.heartRate ?? 0}%</p>
        <p><strong>Quiz Answer:</strong> ${payload.quizAnswer || "None"}</p>
        <p><strong>Truth Answer:</strong> ${payload.truthAnswer || "None"}</p>
        <p><strong>Coupons:</strong> ${payload.coupons?.join(", ") || "None"}</p>
        <p><strong>Favorites:</strong> ${payload.favorites?.join(", ") || "None"}</p>
        <p><strong>Forever Answer:</strong> ${payload.foreverAnswer || "None"}</p>
        <p><strong>Surprise Answer:</strong> ${payload.surpriseAnswer || "None"}</p>
        <p><strong>Comment:</strong> ${payload.comment || "No comment"}</p>
      </div>
    `;

    if (!process.env.BREVO_USER || !process.env.BREVO_PASS || !process.env.EMAIL_FROM) {
      return NextResponse.json(
        { ok: false, error: "BREVO_USER, BREVO_PASS, or EMAIL_FROM is not configured" },
        { status: 500 },
      );
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: "New Girlfriend's Day submission",
      html,
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
