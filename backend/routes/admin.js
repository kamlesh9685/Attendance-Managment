const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// View all students
router.get('/students', authMiddleware('admin'), async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// View all teachers
router.get('/teachers', authMiddleware('admin'), async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Remove a student or teacher
router.delete('/remove/:id', authMiddleware('admin'), async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id) || await Teacher.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
