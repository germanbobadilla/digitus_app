import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent you a password reset link.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Generate reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Send password reset email
    try {
      console.log('Attempting to send password reset email to:', user.email)
      console.log('Reset link:', resetLink)

      const emailSent = await sendPasswordResetEmail(user.email, resetLink, user.name)

      if (!emailSent) {
        console.error('Failed to send password reset email to', user.email)
        // Still return success to user for security (don't reveal email sending issues)
      } else {
        console.log('Password reset email sent successfully to', user.email)
      }
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError)
      // Still return success to user for security
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent you a password reset link.'
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
