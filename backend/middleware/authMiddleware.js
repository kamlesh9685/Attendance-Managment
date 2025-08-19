const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authentication required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'attendance-secret');
    
    let user;
    switch (decoded.role) {
      case 'student':
        user = await Student.findOne({ _id: decoded._id, 'tokens.token': token });
        break;
      case 'teacher':
        user = await Teacher.findOne({ _id: decoded._id, 'tokens.token': token });
        break;
      case 'admin':
        user = await Admin.findOne({ _id: decoded._id, 'tokens.token': token });
        break;
      default:
        throw new Error('Invalid user role');
    }

    if (!user) throw new Error('User not found');
    
    req.token = token;
    req.user = user;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate', error: error.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }
    next();
  };
};

module.exports = { auth, authorizeRoles };