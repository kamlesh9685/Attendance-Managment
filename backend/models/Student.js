const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isApproved: { type: Boolean, default: false },
  attendance: [{ date: String, status: String }],
  complaints: [{ type: String }]
});

module.exports = mongoose.model('Student', StudentSchema);
