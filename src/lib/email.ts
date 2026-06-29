import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
})

export async function sendPasswordResetEmail(email: string, resetLink: string, userName: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Digitus',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Digitus</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Business & Software Solutions</p>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>

          <p style="color: #4b5563; line-height: 1.6;">
            Hello ${userName},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password for your Digitus account. If you made this request,
            click the button below to reset your password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none;
                      border-radius: 6px; display: inline-block; font-weight: 600;">
              Reset Password
            </a>
          </div>

          <p style="color: #4b5563; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>

          <p style="color: #4f46e5; word-break: break-all; font-size: 14px; background-color: #e5e7eb;
                    padding: 10px; border-radius: 4px; margin: 10px 0;">
            ${resetLink}
          </p>

          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            If you didn't request this password reset, please ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This email was sent from Digitus Business & Software Solutions.
            If you have any questions, please contact us at info@digitus.com.do
          </p>
        </div>
      </div>
    `,
    text: `
      Password Reset Request - Digitus

      Hello ${userName},

      We received a request to reset your password for your Digitus account. If you made this request,
      click the link below to reset your password:

      ${resetLink}

      Important: This link will expire in 1 hour for security reasons.
      If you didn't request this password reset, please ignore this email.

      This email was sent from Digitus Business & Software Solutions.
      If you have any questions, please contact us at info@digitus.com.do
    `
  }

  try {
    console.log('Attempting to send password reset email with transporter:', {
      service: 'gmail',
      user: process.env.EMAIL_USER,
      passwordLength: process.env.EMAIL_PASSWORD?.length,
      from: process.env.EMAIL_FROM,
      to: email
    })
    const result = await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent successfully to ${email}`)
    console.log('Message ID:', result.messageId)
    return true
  } catch (error: unknown) {
    console.error('Error sending password reset email:', error)
    const err = error as { code?: string; command?: string; response?: unknown; errno?: number; syscall?: string }
    console.error('Error details:', {
      code: err.code,
      command: err.command,
      response: err.response,
      errno: err.errno,
      syscall: err.syscall
    })
    return false
  }
}

export async function sendWelcomeEmail(email: string, userName: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Digitus!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Digitus</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Business & Software Solutions</p>
        </div>

        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #1f2937; margin-top: 0;">Welcome to Digitus!</h2>

          <p style="color: #4b5563; line-height: 1.6;">
            Hello ${userName},
          </p>

          <p style="color: #4b5563; line-height: 1.6;">
            Welcome to Digitus! Your account has been successfully created. You can now access
            our platform to manage your projects, billing, and more.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/login"
               style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none;
                      border-radius: 6px; display: inline-block; font-weight: 600;">
              Sign In to Your Account
            </a>
          </div>

          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
            If you have any questions or need assistance, please don't hesitate to contact us at
            info@digitus.com.do
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}
