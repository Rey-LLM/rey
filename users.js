import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Получить профиль текущего пользователя
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.getPublicProfile());
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Получить профиль пользователя по ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.getPublicProfile());
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// Обновить профиль
router.put('/me', [
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('phone').optional().isMobilePhone(),
  body('department').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, bio, phone, department, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, bio, phone, department, avatar, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

// Обновить предпочтения
router.put('/me/preferences', [
  body('theme').optional().isIn(['light', 'dark']),
  body('notifications').optional().isBoolean(),
  body('language').optional().isIn(['en', 'ru', 'es', 'de', 'fr'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json({
      message: 'Preferences updated',
      preferences: user.preferences
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating preferences', error: err.message });
  }
});

// Получить список всех пользователей (для администраторов)
router.get('/', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Получить активность пользователя
router.get('/:userId/activity', async (req, res) => {
  try {
    // В реальном приложении здесь была бы таблица Activity
    res.json({
      userId: req.params.userId,
      recentActivity: [
        { action: 'created_task', date: new Date() },
        { action: 'joined_project', date: new Date() }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity', error: err.message });
  }
});

export default router;
