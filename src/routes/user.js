const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
router.get('/profile', authenticate, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ user });
});

router.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.json({ secret: 'Admin paneli malumotlari' });
});

module.exports = router;