const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const { auth } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    if (file.fieldname === 'studentPhoto') {
      uploadPath += 'students/';
    } else if (file.fieldname === 'teacherPhoto') {
      uploadPath += 'teachers/';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'studentPhoto' || file.fieldname === 'teacherPhoto') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  userId: 'admin',
  password: 'admin123',
  name: 'System Admin',
  email: 'admin@system.com',
  role: 'admin'
};

// Student Registration
router.post('/register/student', async (req, res) => {
  try {
    const { userId, password, name, roll, course, year, semester } = req.body;

    // Validation
    if (!userId || !password || !name || !roll || !course || !year || !semester) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for existing user
    const existingUser = await Student.findOne({ $or: [{ userId }, { roll }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User ID or Roll Number already exists' });
    }

    // Create new student (pending approval)
    const student = new Student({
      userId,
      password,
      name,
      roll,
      course,
      year: parseInt(year),
      semester: parseInt(semester),
      approved: false
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for teacher approval.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Admin Registration
router.post('/register/admin', async (req, res) => {
  try {
    const { userId, password, name, email } = req.body;

    // Validation
    if (!userId || !password || !name || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for existing admin
    const existingAdmin = await Admin.findOne({ $or: [{ userId }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ message: 'User ID or Email already exists' });
    }

    // Create new admin
    const admin = new Admin({
      userId,
      password,
      name,
      email,
      role: 'admin'
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully'
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Teacher Registration
router.post('/register/teacher', upload.single('teacherPhoto'), async (req, res) => {
  try {
    const { userId, password, name, email, department, courses } = req.body;

    // Validation
    if (!userId || !password || !name || !email || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for existing teacher
    const existingTeacher = await Teacher.findOne({ $or: [{ userId }, { email }] });
    if (existingTeacher) {
      return res.status(400).json({ message: 'User ID or Email already exists' });
    }

    // Handle photo upload
    const photoPath = req.file ? req.file.path.replace(/\\/g, "/") : '';

    // Create new teacher
    const teacher = new Teacher({
      userId,
      password,
      name,
      email,
      department,
      courses: courses ? courses.split(',') : [],
      photo: photoPath
    });

    await teacher.save();

    res.status(201).json({
      success: true,
      message: 'Teacher registered successfully'
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Login for all roles
router.post('/login', async (req, res) => {
  try {
    const { userId, password, role } = req.body;
    if (!userId || !password || !role) {
      return res.status(400).json({ message: 'User ID, password and role are required' });
    }

    let user;
    if (role === 'admin') {
      // Check against hardcoded admin credentials
      if (userId === 'admin' && password === 'admin123') {
        user = {
          _id: 'admin',
          name: 'System Admin',
          userId: 'admin',
          role: 'admin'
        };
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    } else if (role === 'teacher') {
      user = await Teacher.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      user = user.toObject();
      user.role = 'teacher';
    } else if (role === 'student') {
      user = await Student.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: 'Student not found' });
      }
      if (!user.approved) {
        return res.status(403).json({ message: 'Your account is pending approval' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      user = user.toObject();
      user.role = 'student';
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Generate token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET || 'attendance-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        userId: user.userId,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Add new teacher (no auth required)
router.post('/add-teacher', async (req, res) => {
  try {
    console.log('Received teacher data:', req.body);
    
    const { userId, password, name, department } = req.body;

    // Validation
    if (!userId || !password || !name || !department) {
      console.log('Validation failed. Missing fields:', { userId, name, department });
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { userId, password: '***', name, department }
      });
    }

    // Check for existing teacher
    const existingTeacher = await Teacher.findOne({ userId });
    if (existingTeacher) {
      console.log('Teacher already exists with userId:', userId);
      return res.status(400).json({ message: 'User ID already exists' });
    }

    // Create new teacher
    const teacher = new Teacher({
      userId,
      password,
      name,
      department
    });

    console.log('Attempting to save teacher:', { userId, name, department });
    try {
      await teacher.save();
      console.log('Teacher saved successfully');
    } catch (saveError) {
      console.error('Error saving teacher:', saveError);
      throw saveError;
    }

    res.status(201).json({
      success: true,
      message: 'Teacher added successfully'
    });
  } catch (error) {
    console.error('Add teacher error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Failed to add teacher',
      error: error.message
    });
  }
});

// Remove teacher (admin only)
router.delete('/remove-teacher/:userId', auth, async (req, res) => {
  try {
    // Check if the request is from an admin
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can remove teachers' });
    }

    const teacher = await Teacher.findOneAndDelete({ userId: req.params.userId });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher removed successfully' });
  } catch (error) {
    console.error('Remove teacher error:', error);
    res.status(500).json({ message: 'Failed to remove teacher' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    if (req.role === 'admin') {
      return res.json({
        _id: 'admin',
        name: ADMIN_CREDENTIALS.name,
        userId: ADMIN_CREDENTIALS.userId,
        role: 'admin',
        email: ADMIN_CREDENTIALS.email
      });
    }

    const user = await Teacher.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      userId: user.userId,
      role: 'teacher',
      email: user.email
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to fetch user data' });
  }
});

module.exports = router;