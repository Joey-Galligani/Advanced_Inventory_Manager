// ../controllers/userController.js
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: john_doe
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           example: password123
 *         role:
 *           type: string
 *           example: user
 *           enum: [user, admin, moderator]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2023-10-16T12:34:56Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2023-10-16T12:34:56Z
 */
const User = require('../models/userModel');

// Get User Profile (protected)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').lean(); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User Information
const updateProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { username, email },
      { new: true } // Return the updated user
    ).select('-password').lean(); // Exclude password from response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete User Account
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteUser,
};
