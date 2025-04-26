const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Student = require('../models/Student');

// Multer setup for file upload (photo)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save in uploads/ folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Student Registration Route
router.post('/register', upload.single('photo'), async (req, res) => {
  const { userid, password, name, roll, course, year, semester } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    let student = await Student.findOne({ userid });

    if (student) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    student = new Student({
      userid,
      password,
      name,
      roll,
      course,
      year,
      semester,
      photo,
      approved: false // student needs approval first
    });

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();
    res.status(201).json({ msg: 'Registered successfully. Awaiting approval.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { userid, password } = req.body;

  try {
    const student = await Student.findOne({ userid });

    if (!student) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    if (!student.approved) {
      return res.status(403).json({ msg: 'Account pending approval by teacher/admin' });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: student.id,
        role: 'student'
      }
    };

    jwt.sign(payload, 'your_jwt_secret', { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
