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
const DNSRecord = require('./models/DNSRecord');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
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
  const { email, password } = req.body;

  // Find the user in the database
  const user = await User.findOne({ email });
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

// API for Upload CSV Or Json File
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Define route for file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    // Check if file is CSV or JSON
    const fileName = req.file.originalname;
    if (fileName.endsWith('.csv')) {
      // Process CSV file
      fs.createReadStream(`uploads/${fileName}`)
        .pipe(csvParser())
        .on('data', async (row) => {
          // Process each row and save DNS records
          const domainName = row.domain; // Assuming 'domain' is a field in the CSV
          // const domain = await Domain.findOne({ name: domainName });
          if (domain) {
            await Promise.all(
              Object.entries(row)
                .filter(([key]) => key !== 'domain')
                .map(async ([key, value]) => {
                  await DNSRecord.create({
                    name: key,
                    value: value,
                    domain: domain._id
                  });
                })
            );
          }
        })
        .on('end', () => {
          res.status(200).json({ message: 'CSV file uploaded and processed successfully' });
        });
    } else if (fileName.endsWith('.json')) {
      // Process JSON file
      const data = JSON.parse(fs.readFileSync(`uploads/${fileName}`, 'utf-8'));
      // Process JSON data and save DNS records
      // Implement logic according to your JSON structure
      res.status(200).json({ message: 'JSON file uploaded and processed successfully' });
    } else {
      res.status(400).json({ error: 'Invalid file format. Only CSV and JSON files are allowed.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API For Add DNS one by One

app.post('/api/add', async (req, res) => {
  try {
    const { name, type, value, ttl } = req.body;
    const newDomain = new DNSRecord({ name, type, value, ttl });
    await newDomain.save();
    res.status(201).json({ message: 'Domain added successfully', domain: newDomain });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API For Getting all the domains

app.get('/api/domains', async(req, res) =>{
  try {
    const dnsRecords = await DNSRecord.find();
    res.status(200).json(dnsRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API For Delete
app.delete('/api/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the DNS record exists
    const dnsRecord = await DNSRecord.findById(id);
    if (!dnsRecord) {
      return res.status(404).json({ message: 'DNS record not found' });
    }
    // Delete the DNS record
    await DNSRecord.findByIdAndDelete(id);
    res.status(200).json({ message: 'DNS record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
