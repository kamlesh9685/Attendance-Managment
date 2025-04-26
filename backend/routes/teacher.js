const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const multer = require('multer');
const path = require('path');

// =================== Student Approval ===================

// View unapproved students
router.get('/approve', authMiddleware('teacher'), async (req, res) => {
  try {
    const students = await Student.find({ approved: false });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Approve a student
router.post('/approve/:id', authMiddleware('teacher'), async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ msg: 'Student approved' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// =================== Timetable Upload ===================

// Multer storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // upload folder must exist
  },
  filename: (req, file, cb) => {
    cb(null, 'timetable' + path.extname(file.originalname)); // fixed name (e.g., timetable.png)
  }
});
const upload = multer({ storage: storage });

// Teacher uploads timetable
router.post('/upload-timetable', authMiddleware('teacher'), upload.single('timetable'), (req, res) => {
  try {
    res.json({ message: "Timetable uploaded successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
