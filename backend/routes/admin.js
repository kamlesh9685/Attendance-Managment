const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const multer = require('multer');
const path = require('path');

// Configure multer for teacher photos
const teacherPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/teachers/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadTeacherPhoto = multer({ storage: teacherPhotoStorage });

// Add new teacher (admin only)
router.post('/teachers', auth, authorizeRoles('admin'), uploadTeacherPhoto.single('teacherPhoto'), async (req, res) => {
  try {
    const { userId, password, name, email, department, courses } = req.body;
    
    if (!userId || !password || !name || !email || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingTeacher = await Teacher.findOne({ $or: [{ userId }, { email }] });
    if (existingTeacher) {
      return res.status(400).json({ message: 'User ID or Email already exists' });
    }
    
    const teacher = new Teacher({
      userId,
      password,
      name,
      email,
      department,
      courses: courses?.split(',').map(c => c.trim()) || [],
      photo: req.file?.path
    });
    
    await teacher.save();
    
    res.status(201).json({ message: 'Teacher added successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: 'Error adding teacher', error: error.message });
  }
});

// Get all teachers (admin only)
router.get('/teachers', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password -__v');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teachers', error: error.message });
  }
});

// Add new admin (super admin only)
router.post('/admins', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    // In a real app, you'd check if the current admin has super admin privileges
    
    const { userId, password, name, email } = req.body;
    
    if (!userId || !password || !name || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingAdmin = await Admin.findOne({ $or: [{ userId }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User ID or Email already exists' });
    }
    
    const admin = new Admin({
      userId,
      password,
      name,
      email
    });
    
    await admin.save();
    
    res.status(201).json({ message: 'Admin added successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error adding admin', error: error.message });
  }
});

module.exports = router;