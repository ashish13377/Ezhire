const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profileimage: { type: String, default: "https://res.cloudinary.com/diyncva2v/image/upload/v1704839111/profile_by0avs.png" },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  dateOfBirth: { type: String },
  gender: { type: String },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
