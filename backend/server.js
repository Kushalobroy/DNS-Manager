const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { appendFile } = require('fs/promises');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/quantumit', { useNewUrlParser: true, useUnifiedTopology: true });

// Define User model
const User = mongoose.model('User', {
    name:String,
    dob:Date,
    email: String,
    password: String,
    resetPasswordToken: String, // Add resetPasswordToken field
    resetPasswordExpires: Date, // Add resetPasswordExpires field
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name,dob,email, password } = req.body;

  // Check if username already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Username/Email already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({ name,dob,email,password: hashedPassword });
  await newUser.save();

  res.json({ message: 'Registration successful' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate a token
  const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
  res.json({ token, message: 'Login successfully' });

});

// Forgot password Api
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a unique token
    const token = crypto.randomBytes(20).toString('hex');

    // Set expiration time (e.g., 1 hour)
    const expiration = Date.now() + 3600000; // 1 hour

    // Save token and expiration in the database
    await User.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expiration }
    );

    // Send reset password email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kushalobroy@gmail.com', // Your Gmail email address
        pass: 'xqeavgztuesjantg', // Your Gmail password
      },
    });
    
    // Verify the transporter configuration
    transporter.verify(function(error, success) {
      if (error) {
        console.error('Error verifying transporter configuration:', error);
      } else {
        console.log('Transporter configuration is ready');
      }
    });
    const mailOptions = {
      from: 'kushalobroy@gmail.com',
      to: email,
      subject: 'Reset your password',
      html: `
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="http://localhost:3000/reset-password/${token}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password API
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user by reset token and check if it's expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now()+3600000 },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
