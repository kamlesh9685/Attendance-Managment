const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const multer = require('multer');
const path = require('path');
const Teacher = require('../models/Teacher');

// Configure multer for timetable uploads
const timetableStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/timetables/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadTimetable = multer({ storage: timetableStorage });

// Get list of all teachers (admin only)
router.get('/list', auth, async (req, res) => {
  try {
    // Check if the request is from an admin
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view teacher list' });
    }

    const teachers = await Teacher.find()
      .select('userId name email department courses')
      .sort({ name: 1 });

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
});

// Get pending student approvals
router.get('/pending-approvals', auth, async (req, res) => {
  try {
    if (req.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access this' });
    }

    const pendingStudents = await Student.find({ approved: false })
      .select('userId name roll course year semester');

    res.json(pendingStudents);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ message: 'Failed to fetch pending approvals' });
  }
});

// Approve student
router.post('/approve-student/:userId', auth, async (req, res) => {
  try {
    if (req.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can approve students' });
    }

    const student = await Student.findOne({ userId: req.params.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.approved = true;
    await student.save();

    res.json({ message: 'Student approved successfully' });
  } catch (error) {
    console.error('Error approving student:', error);
    res.status(500).json({ message: 'Failed to approve student' });
  }
});

// Get all approved students
router.get('/students', auth, async (req, res) => {
  try {
    if (req.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access this' });
    }

    const students = await Student.find({ approved: true })
      .select('userId name roll course year semester');

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Upload timetable (teacher only)
router.post('/upload-timetable', auth, authorizeRoles('teacher'), uploadTimetable.single('timetable'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Here you would typically save the timetable reference to your database
    // For example, associate it with a course or class
    
    res.json({
      message: 'Timetable uploaded successfully',
      filePath: req.file.path
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading timetable', error: error.message });
  }
});

// Mark attendance (teacher only)
router.post('/mark-attendance', auth, authorizeRoles('teacher'), async (req, res) => {
  try {
    const { course, semester, date, students } = req.body;
    
    if (!course || !semester || !students) {
      return res.status(400).json({ message: 'Course, semester and students data are required' });
    }
    
    const attendance = new Attendance({
      course,
      semester,
      date: date || Date.now(),
      students,
      markedBy: req.user._id
    });
    
    await attendance.save();
    
    // Update individual student records
    for (const studentData of students) {
      await Student.findByIdAndUpdate(
        studentData.student,
        { $push: { attendance: { status: studentData.status, markedBy: req.user._id } } }
      );
    }
    
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

module.exports = router;