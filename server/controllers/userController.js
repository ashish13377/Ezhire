const User = require('../models/user');

const getUserProfile = async (req, res) => {
  try {
    // Get user profile details from the database
    const user = await User.findById(req.userId);
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { email } = req.body;

    // Update user profile details in the database
    await User.findByIdAndUpdate(req.userId, { email });

    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Delete user from the database
    await User.findByIdAndDelete(req.userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUser,
};
