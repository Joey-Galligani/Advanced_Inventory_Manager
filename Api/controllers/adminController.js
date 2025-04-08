const User = require('../models/userModel');
const bcrypt = require("bcryptjs");

// Get User Profile (protected)
const fetchUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password').lean(); // Exclude password
    if (!user)
    {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').lean(); // Exclude password
        if (!users)
        {
            return res.status(404).json({ message: 'Users not found' });
        }
        res.json(users);
        } catch (err){
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const updateUser = async (req, res) => {
    const { username, email } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
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
}

const deleteUser = async (req, res) => {
    try {
        console.log("Deleting user with ID:", req.params.userId);
        
        const user = await User.findByIdAndDelete(req.params.userId);
        console.log("Deleted user:", user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email === "admin@gmail.com") {
            return res.status(400).json({ message: 'Cannot delete default admin user' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const createUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error: ${err}` });
    }
}

module.exports = {
    getUsers,
    createUser,
    fetchUserInfo,
    updateUser,
    deleteUser
};