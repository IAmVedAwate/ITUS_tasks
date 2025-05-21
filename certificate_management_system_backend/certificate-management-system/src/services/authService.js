const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const registerUser = async (username, password) => {
    const user = new User({ username, password });
    await user.save();
    return user;
};

const loginUser = async (username, password) => {
    const user = await User.findOne({ username });
    if (!user || !(await user.isValidPassword(password))) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    return { token, user };
};

const validateToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    registerUser,
    loginUser,
    validateToken,
};