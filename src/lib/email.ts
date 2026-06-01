export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "SocialHub <noreply@socialhub.bonnellio.com>",
        to: email,
        subject: "Reset your SocialHub password",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#080810;color:#fff;border-radius:16px">
            <h1 style="font-size:20px;font-weight:700;margin-bottom:8px">Reset your password</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:24px">
              Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none">
              Reset password
            </a>
            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:24px">
              If you didn't request this, ignore this email — your password won't change.
            </p>
          </div>
        `,
      }),
    });
  } else {
    // Fallback: log to console so Docker admins can retrieve the link from logs
    console.log(`[SocialHub] Password reset requested for ${email}`);
    console.log(`[SocialHub] Reset URL: ${resetUrl}`);
  }
}
