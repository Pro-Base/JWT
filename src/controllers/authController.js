const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokens');

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existing = await User.findByEmail(email);
    if (existing)
      return res.status(400).json({ error: 'Bu email band' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0];
    const user = await User.create({ username, email, password: hashedPassword });

    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await User.updateRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',    // ← cross-site uchun
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    res.status(201).json({
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, role: role || 'user' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    if (!user)
      return res.status(400).json({ error: 'Email yoki parol xato' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Email yoki parol xato' });

    const accessToken  = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await User.updateRefreshToken(user.id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.updateRefreshToken(decoded.userId || decoded.sub, null);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Chiqildi' });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Chiqildi' });
  }
};

exports.refresh = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token)
    return res.status(401).json({ error: "Refresh token yo'q" });

  try {
    const decoded     = verifyRefreshToken(token);
    const accessToken = generateAccessToken(decoded.userId, decoded.role || 'user');
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: "Refresh token noto'g'ri yoki muddati o'tgan" });
  }
};