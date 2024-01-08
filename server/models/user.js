const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profilePicture: { type: String },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  dateOfbirth: { type: String },
  gender: { type: String },
  verify: { type: Boolean, default: false },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
