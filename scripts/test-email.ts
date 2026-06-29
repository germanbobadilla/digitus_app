import { config } from 'dotenv'
import { sendPasswordResetEmail } from '../src/lib/email'

// Load environment variables from both .env and .env.local
config({ path: '.env' })
config({ path: '.env.local', override: true })

async function testEmail() {
  try {
    console.log('Testing email configuration...')
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST)
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT)
    console.log('EMAIL_USER:', process.env.EMAIL_USER)
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM)
    console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length)
    console.log('EMAIL_PASSWORD value:', process.env.EMAIL_PASSWORD)

    const testEmail = 'info@digitus.com.do'
    const testLink = 'http://localhost:3000/reset-password?token=test123'
    const testName = 'Test User'

    console.log('\nSending test email...')
    const result = await sendPasswordResetEmail(testEmail, testLink, testName)

    if (result) {
      console.log('✅ Email sent successfully!')
    } else {
      console.log('❌ Email sending failed')
    }

  } catch (error) {
    console.error('❌ Error testing email:', error)
  }
}

testEmail()
