import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const router = express.Router();

// Получить все проекты пользователя
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('owner', 'username email firstName lastName')
    .populate('members.user', 'username email')
    .populate('tasks')
    .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
});

// Получить конкретный проект
router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'username email firstName lastName')
      .populate('members.user', 'username email')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignee', select: 'username email' },
          { path: 'creator', select: 'username email' }
        ]
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Проверка доступа
    const hasAccess = project.owner._id.toString() === req.user.id ||
                     project.members.some(m => m.user._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project', error: err.message });
  }
});

// Создать проект
router.post('/', [
  body('name').trim().isLength({ min: 3 }).withMessage('Project name must be at least 3 characters'),
  body('description').optional().trim(),
  body('category').optional().isIn(['development', 'design', 'marketing', 'sales', 'support', 'other']),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, category, startDate, dueDate, budget } = req.body;

    const project = new Project({
      name,
      description,
      category,
      startDate,
      dueDate,
      budget,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }]
    });

    await project.save();
    await project.populate('owner', 'username email');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
});

// Обновить проект
router.put('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Только владелец может обновить
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.projectId,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('owner').populate('members.user').populate('tasks');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating project', error: err.message });
  }
});

// Добавить члена проекта
router.post('/:projectId/members', [
  body('userId').notEmpty(),
  body('role').isIn(['viewer', 'editor', 'admin'])
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can add members' });
    }

    const { userId, role } = req.body;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const memberExists = project.members.some(m => m.user.toString() === userId);
    if (memberExists) {
      return res.status(409).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userId, role });
    await project.save();
    await project.populate('members.user', 'username email');

    res.json({
      message: 'Member added successfully',
      project
    });
  } catch (err) {
    res.status(500).json({ message: 'Error adding member', error: err.message });
  }
});

// Удалить проект
router.delete('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can delete this project' });
    }

    // Удалить все задачи проекта
    await Task.deleteMany({ project: req.params.projectId });

    await Project.findByIdAndDelete(req.params.projectId);

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err.message });
  }
});

// Получить статистику проекта
router.get('/:projectId/stats', async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });

    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

export default router;
