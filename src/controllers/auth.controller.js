const jwt    = require('jsonwebtoken');
const { User } = require('../models');
const logger   = require('../middlewares/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { nama, email, password, alamat, telepon } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const user  = await User.create({ nama, email, password, alamat, telepon, role: 'customer' });
    const token = generateToken(user);

    logger.info(`User baru terdaftar: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = generateToken(user);
    logger.info(`User login: ${email}`);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
// Token JWT bersifat stateless
const logout = (_req, res) => {
  res.json({ success: true, message: 'Logout berhasil' });
};

// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { nama, alamat, telepon } = req.body;
    await req.user.update({ nama, alamat, telepon });
    res.json({ success: true, message: 'Profil diperbarui', data: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };
