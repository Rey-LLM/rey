import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const router = express.Router();

// Получить все документы с разделением по папкам/категориям
router.get('/', async (req, res) => {
  try {
    const { category, sortBy = 'date', order = 'desc', search } = req.query;

    // Получить все проекты пользователя
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('owner', 'username email').lean();

    if (projects.length === 0) {
      return res.json({
        message: 'No projects found',
        documents: [],
        folders: {},
        stats: { total: 0, byCategory: {} }
      });
    }

    const projectIds = projects.map(p => p._id);

    // Получить все задачи для этих проектов
    let tasksQuery = Task.find({ project: { $in: projectIds } })
      .populate('creator', 'username email')
      .populate('assignee', 'username email')
      .populate('project', 'name category')
      .lean();

    if (search) {
      tasksQuery = tasksQuery.where({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    const tasks = await tasksQuery;

    // Получить все вложения из проектов
    const attachments = [];
    for (const project of projects) {
      if (project.attachments && project.attachments.length > 0) {
        project.attachments.forEach(att => {
          attachments.push({
            _id: `att_${project._id}_${att.name}`,
            title: att.name,
            type: 'attachment',
            projectId: project._id,
            projectName: project.name,
            projectCategory: project.category,
            uploadedBy: att.uploadedBy,
            uploadedAt: att.uploadedAt,
            url: att.url,
            folder: project.category
          });
        });
      }
    }

    // Преобразовать задачи в документы
    const documents = tasks.map(task => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      type: 'task',
      projectId: task.project._id,
      projectName: task.project.name,
      category: task.category || task.project.category,
      priority: task.priority,
      status: task.status,
      creator: task.creator,
      assignee: task.assignee,
      createdAt: task.createdAt || new Date(),
      dueDate: task.dueDate,
      tags: task.tags,
      folder: task.category || task.project.category
    })).concat(attachments);

    // Фильтр по категории если задана
    let filtered = documents;
    if (category && category !== 'all') {
      filtered = documents.filter(doc => doc.category === category);
    }

    // Группировка по папкам (категориям)
    const folders = {};
    filtered.forEach(doc => {
      const folderName = doc.folder || 'Другое';
      if (!folders[folderName]) {
        folders[folderName] = [];
      }
      folders[folderName].push(doc);
    });

    // Сортировка внутри папок
    Object.keys(folders).forEach(folderName => {
      folders[folderName].sort((a, b) => {
        if (sortBy === 'name') {
          return order === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else if (sortBy === 'date') {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return order === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortBy === 'priority') {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          const priorA = priorityOrder[a.priority] ?? 4;
          const priorB = priorityOrder[b.priority] ?? 4;
          return priorA - priorB;
        }
        return 0;
      });
    });

    // Статистика
    const stats = {
      total: filtered.length,
      byCategory: {},
      byType: {
        tasks: filtered.filter(d => d.type === 'task').length,
        attachments: filtered.filter(d => d.type === 'attachment').length
      },
      byStatus: {
        todo: filtered.filter(d => d.status === 'todo').length,
        inProgress: filtered.filter(d => d.status === 'in-progress').length,
        review: filtered.filter(d => d.status === 'review').length,
        done: filtered.filter(d => d.status === 'done').length,
        blocked: filtered.filter(d => d.status === 'blocked').length
      }
    };

    Object.keys(folders).forEach(folderName => {
      stats.byCategory[folderName] = folders[folderName].length;
    });

    res.json({
      message: 'Documents retrieved successfully',
      documents: filtered,
      folders,
      stats,
      totalFolders: Object.keys(folders).length
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ 
      message: 'Error fetching documents', 
      error: err.message 
    });
  }
});

// Получить документы конкретного проекта с разделением по папкам
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sortBy = 'date', order = 'desc' } = req.query;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Проверка доступа
    const hasAccess = project.owner.toString() === req.user.id ||
                     project.members.some(m => m.user.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Получить задачи проекта
    const tasks = await Task.find({ project: projectId })
      .populate('creator', 'username email')
      .populate('assignee', 'username email')
      .lean();

    const documents = tasks.map(task => ({
      _id: task._id,
      title: task.title,
      description: task.description,
      type: 'task',
      category: task.category || project.category,
      priority: task.priority,
      status: task.status,
      creator: task.creator,
      assignee: task.assignee,
      createdAt: task.createdAt || new Date(),
      dueDate: task.dueDate,
      tags: task.tags,
      folder: task.category || project.category
    }));

    // Добавить вложения проекта
    if (project.attachments && project.attachments.length > 0) {
      project.attachments.forEach(att => {
        documents.push({
          _id: `att_${att.name}`,
          title: att.name,
          type: 'attachment',
          category: project.category,
          uploadedBy: att.uploadedBy,
          uploadedAt: att.uploadedAt,
          url: att.url,
          folder: 'Вложения'
        });
      });
    }

    // Группировка по папкам
    const folders = {};
    documents.forEach(doc => {
      const folderName = doc.folder || 'Другое';
      if (!folders[folderName]) {
        folders[folderName] = [];
      }
      folders[folderName].push(doc);
    });

    // Сортировка
    Object.keys(folders).forEach(folderName => {
      folders[folderName].sort((a, b) => {
        if (sortBy === 'name') {
          return order === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        } else {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return order === 'asc' ? dateA - dateB : dateB - dateA;
        }
      });
    });

    res.json({
      message: 'Project documents retrieved successfully',
      projectName: project.name,
      documents,
      folders,
      stats: {
        total: documents.length,
        byCategory: Object.fromEntries(
          Object.entries(folders).map(([key, val]) => [key, val.length])
        )
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching project documents', 
      error: err.message 
    });
  }
});

// Получить список всех категорий/папок
router.get('/categories/list', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).lean();

    const categories = new Set();
    const projectIds = projects.map(p => p._id);

    // Получить все категории из задач
    const tasks = await Task.find({ project: { $in: projectIds } }).lean();
    
    projects.forEach(p => categories.add(p.category));
    tasks.forEach(t => {
      if (t.category) categories.add(t.category);
    });
    
    categories.add('Вложения');

    res.json({
      message: 'Categories retrieved successfully',
      categories: Array.from(categories).sort(),
      total: categories.size
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching categories', 
      error: err.message 
    });
  }
});

export default router;
