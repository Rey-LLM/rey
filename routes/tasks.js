import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

const router = express.Router();

// Получить все задачи пользователя
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignee, project } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (project) query.project = project;

    const tasks = await Task.find(query)
      .populate('assignee', 'username email')
      .populate('creator', 'username email')
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
});

// Получить задачу
router.get('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'username email')
      .populate('creator', 'username email')
      .populate('project', 'name')
      .populate('comments.author', 'username email avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task', error: err.message });
  }
});

// Создать задачу
router.post('/', [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('project').notEmpty().withMessage('Project ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, project, assignee, priority, dueDate, estimatedHours, tags } = req.body;

    // Проверка доступа к проекту
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = projectDoc.owner.toString() === req.user.id ||
                     projectDoc.members.some(m => m.user.toString() === req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = new Task({
      title,
      description,
      project,
      creator: req.user.id,
      assignee: assignee || null,
      priority,
      dueDate,
      estimatedHours,
      tags: tags || []
    });

    await task.save();
    await task.populate('creator', 'username email');
    await task.populate('assignee', 'username email');

    // Добавить задачу в проект
    projectDoc.tasks.push(task._id);
    await projectDoc.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
});

// Обновить задачу
router.put('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Проверка прав (создатель или назначенный)
    if (task.creator.toString() !== req.user.id && task.assignee?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('assignee', 'username email').populate('creator', 'username email');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
});

// Изменить статус задачи
router.patch('/:taskId/status', [
  body('status').isIn(['todo', 'in-progress', 'review', 'done', 'blocked'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    if (status === 'done') {
      task.completedDate = new Date();
    }

    await task.save();
    await task.populate('assignee').populate('creator');

    res.json({
      message: 'Task status updated',
      task
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
});

// Добавить комментарий к задаче
router.post('/:taskId/comments', [
  body('text').trim().notEmpty().withMessage('Comment text is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      author: req.user.id,
      text
    });

    await task.save();
    await task.populate('comments.author', 'username email avatar');

    res.json({
      message: 'Comment added',
      task
    });
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
});

// Удалить задачу
router.delete('/:taskId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can delete this task' });
    }

    // Удалить задачу из проекта
    await Project.findByIdAndUpdate(task.project, {
      $pull: { tasks: task._id }
    });

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
});

// Получить задачи по проекту
router.get('/project/:projectId', async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'username email')
      .populate('creator', 'username email')
      .sort({ priority: -1, dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
});

export default router;
