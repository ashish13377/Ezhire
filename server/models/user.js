const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profileimage: { type: String, default: "https://cdn.dribbble.com/users/1104126/screenshots/6737246/team.gif" },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  dateOfbirth: { type: String },
  gender: { type: String },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
