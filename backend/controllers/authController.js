const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  const newRefreshToken = new RefreshToken({
    token: refreshToken,
    user: user._id,
    expiryDate: new Date(Date.now() + 7*24*60*60*1000) // 7 days from now
  });
  await newRefreshToken.save();
  return refreshToken;
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.status(201).json({ token, refreshToken, userId: user._id });
  } catch (error) {
    console.error("Register Error:", error); // 로그 출력 추가
    res.status(500).json({ message: 'Error registering new user', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const refreshToken = await generateRefreshToken(user);

    res.json({ token, refreshToken, userId: user._id });
  } catch (error) {
    console.error("Login Error:", error); // 로그 출력 추가
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const refreshTokenDoc = await RefreshToken.findOneAndDelete({ token: refreshToken });
    if (!refreshTokenDoc) {
      return res.status(400).json({ message: 'Refresh Token not found' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error("Logout Error:", error); // 로그 출력 추가
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};
