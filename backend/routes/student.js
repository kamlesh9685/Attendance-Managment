const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

// View Attendance
router.get('/attendance', authMiddleware('student'), async (req, res) => {
  try {
    const attendance = await Attendance.find({ studentId: req.user.id });
    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Raise Complaint
router.post('/complaint', authMiddleware('student'), async (req, res) => {
  const { complaint } = req.body;
  // Store complaint logic (e.g., save in DB or send to Admin)
  res.json({ msg: 'Complaint submitted' });
});

module.exports = router;
