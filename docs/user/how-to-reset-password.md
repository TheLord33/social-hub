# How to Reset Your Password

## What is this?

If you've forgotten your password, Social Hub can send you a secure link by email so you can set a new one — no need to contact support.

---

## Prerequisites

- You must have signed up with an **email and password** (not Google, Twitter, or another social login).
- You need access to the email inbox you used to create your account.

> **Social login users:** If you signed up using "Continue with Google" or another social account, you don't have a Social Hub password. Log in through the same social account you used when you signed up.

---

## Step-by-step guide

### Step 1 — Go to the login page and click "Forgot password"

On the login screen, click the **Forgot password?** link below the sign-in button.

![Screenshot: Login page with "Forgot password?" link highlighted below the password field](../screenshots/password-reset-step-1.png)

---

### Step 2 — Enter your email address

Type the email address you used when you created your Social Hub account, then click **Send reset link**.

![Screenshot: "Reset your password" screen — single email input field with a "Send reset link" button](../screenshots/password-reset-step-2.png)

You'll see a confirmation message:

> "If that email is registered, we've sent you a link. Check your inbox."

This message appears whether or not the email matched — this is intentional and keeps your account private.

---

### Step 3 — Check your email and click the link

Open the email from Social Hub (subject line: **"Reset your Social Hub password"**). Click the **Reset password** button inside the email.

![Screenshot: Example reset email showing the "Reset password" button in the message body](../screenshots/password-reset-step-3.png)

> **The link expires in 15 minutes.** If it has expired, go back to Step 1 and request a new one.

---

### Step 4 — Set your new password

You'll land on the password reset page. Enter your new password twice to confirm it, then click **Update password**.

![Screenshot: "Choose a new password" form with two password fields (New password, Confirm password) and an "Update password" button](../screenshots/password-reset-step-4.png)

Password requirements:
- At least 8 characters
- At least one uppercase letter
- At least one number or special character

---

### Step 5 — Sign in with your new password

After a successful reset you'll be redirected to the login page. Sign in with your email and the new password you just set.

![Screenshot: Login page with a green success banner: "Password updated — please sign in"](../screenshots/password-reset-step-5.png)

---

## Tips & Common Questions

**Q: I didn't receive the email — what do I do?**
A: Check your spam or junk folder first. If it's not there, wait 2–3 minutes and try again. Make sure you're entering the exact email address you registered with.

**Q: The link says it's expired.**
A: Reset links are valid for 15 minutes. Go back to the login page, click "Forgot password?" again, and request a fresh link.

**Q: Can I use the same link twice?**
A: No — each link works once. After you set a new password the link is permanently deactivated.

**Q: I signed up with Google / Twitter and it says I have no password.**
A: That's expected. Use the same social login button you used when you created your account.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| "Invalid or expired link" error | Request a new link from the login page — your old one expired or was already used |
| Email never arrives | Check spam; confirm you're using the exact email you registered with |
| "Weak password" error | Make sure your new password meets all requirements listed in Step 4 |
| Reset page won't load | Try opening the link in a different browser or an incognito window |

---

## Cross-reference

→ Developer reference: [docs/dev/password-reset-implementation.md](../dev/password-reset-implementation.md)
