const nodemailer = require('nodemailer');

// Create transporter with better configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // For development only
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
});

// Verify transporter configuration (only in production or when explicitly enabled)
if (process.env.VERIFY_EMAIL_SERVICE !== 'false') {
  transporter.verify(function (error, success) {
    if (error) {
      console.log('⚠️  Email service configuration issue:', error.message);
      console.log('📧 Please configure SMTP_USER and SMTP_PASS in your .env file');
      console.log('🔐 For Gmail, you need to:');
      console.log('   1. Enable 2-Step Verification');
      console.log('   2. Generate an App Password at: https://myaccount.google.com/apppasswords');
      console.log('   3. Use the App Password (not your regular password)');
      console.log('💡 For development, set VERIFY_EMAIL_SERVICE=false to skip verification');
    } else {
      console.log('✅ Email service is ready to send emails');
    }
  });
}

/**
 * Send OTP email to user
 * @param {string} email - User email address
 * @param {number} otp - OTP code
 * @param {string} name - User name
 */
const sendOTPEmail = async (email, otp, name) => {
  // Check if email service is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  Email service not configured. OTP would be:', otp);
    console.warn('📧 In development, you can check the console for the OTP');
    // In development, we can still proceed without actually sending email
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 OTP for ${email}: ${otp}`);
      return { success: true, messageId: 'dev-mode', devOtp: otp };
    }
    throw new Error('Email service not configured. Please set SMTP_USER and SMTP_PASS in .env');
  }

  try {
    const mailOptions = {
      from: `"Earth & Harvest" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your OTP for Earth & Harvest Login',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 10px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              padding: 20px;
            }
            .otp-box {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 5px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 Earth & Harvest</h1>
            </div>
            <div class="content">
              <h2>Hello ${name || 'there'}!</h2>
              <p>Thank you for choosing Earth & Harvest. Use the OTP below to complete your login:</p>
              <div class="otp-box">${otp}</div>
              <p>This OTP will expire in 10 minutes.</p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Earth & Harvest. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${name || 'there'}!
        
        Your OTP for Earth & Harvest login is: ${otp}
        
        This OTP will expire in 10 minutes.
        
        If you didn't request this OTP, please ignore this email.
        
        © ${new Date().getFullYear()} Earth & Harvest. All rights reserved.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your SMTP credentials.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET') {
      throw new Error('Email service connection timeout. Please check your network and SMTP settings.');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Email service connection refused. Please check SMTP_HOST and SMTP_PORT.');
    }
    
    // In development, log the OTP so user can still test
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_DEV_OTP === 'true') {
      console.log(`\n🔑 ==========================================`);
      console.log(`🔑 DEV MODE: OTP for ${email}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log(`🔑 ==========================================\n`);
      console.log('💡 Configure email service (SMTP_USER, SMTP_PASS) to receive OTP via email');
      return { success: true, messageId: 'dev-mode', devOtp: otp };
    }
    
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  transporter
};

