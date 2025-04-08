// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Allow to remove Bearer at the start of the token

  if (!token) {
    return res.status(401).json({ error: 'Access denied, token missing' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded; // Attach user data to request object
    next();
  });
};

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
}

// Middleware to authorize roles i would like to compare to the role in the token
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// Middleware to authorize the user to access their own data
const authorizeSelf = (req, res, next) => { 
  if (req.user.userId !== req.params.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
}

// Function to hash a password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Function to compare a plain password with a hashed password
const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { authMiddleware, hashPassword, comparePassword, authorize, authorizeSelf, authenticateToken };