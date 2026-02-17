import express from 'express';
import archiver from 'archiver';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for ZIP file uploads
const upload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        path.extname(file.originalname).toLowerCase() === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP archives are allowed'), false);
    }
  }
});

/**
 * Export project to ZIP archive
 * GET /api/archives/project/:projectId/export
 */
router.get('/project/:projectId/export', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Get project
    const project = await Project.findById(projectId)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const hasAccess = project.owner._id.toString() === req.user.id ||
                     project.members.some(m => m.user._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all project tasks
    const tasks = await Task.find({ project: projectId })
      .populate('creator', 'username email')
      .populate('assignee', 'username email')
      .lean();

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Set download headers
    const safeProjectName = project.name.replace(/[^a-z0-9]/gi, '_');
    res.attachment(`${safeProjectName}_export_${Date.now()}.zip`);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe archive to response
    archive.pipe(res);

    // Add project metadata to JSON file
    const projectData = {
      project: {
        name: project.name,
        description: project.description,
        category: project.category,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        dueDate: project.dueDate,
        budget: project.budget,
        progress: project.progress,
        tags: project.tags,
        owner: {
          username: project.owner.username,
          email: project.owner.email
        },
        members: project.members.map(m => ({
          username: m.user.username,
          email: m.user.email,
          role: m.role
        })),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      tasks: tasks.map(task => ({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        creator: task.creator ? {
          username: task.creator.username,
          email: task.creator.email
        } : null,
        assignee: task.assignee ? {
          username: task.assignee.username,
          email: task.assignee.email
        } : null
      })),
      exportDate: new Date().toISOString(),
      exportedBy: req.user.id
    };

    archive.append(JSON.stringify(projectData, null, 2), { 
      name: 'project_data.json' 
    });

    // Add tasks to separate folder
    tasks.forEach((task, index) => {
      const taskData = {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        creator: task.creator,
        assignee: task.assignee
      };
      
      archive.append(JSON.stringify(taskData, null, 2), {
        name: `tasks/task_${index + 1}_${task.title.replace(/[^a-z0-9]/gi, '_')}.json`
      });
    });

    // Add README with export information
    const readme = `# Project Export: ${project.name}

Export Date: ${new Date().toISOString()}
Exported by: ${req.user.id}

## Archive Contents:

- project_data.json - Complete project and tasks information
- tasks/ - Folder with individual files for each task

## How to Use:

1. Extract the archive (use WinRAR, 7-Zip, or built-in Windows archiver)
2. Open project_data.json to view all data
3. Tasks are located in the tasks/ folder

---
Created with Project Management App
`;
    
    archive.append(readme, { name: 'README.txt' });

    // Finalize archive
    await archive.finalize();

  } catch (err) {
    console.error('Export error:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error exporting project', 
        error: err.message 
      });
    }
  }
});

/**
 * Inspect ZIP archive contents (list files)
 * POST /api/archives/inspect
 */
router.post('/inspect', upload.single('archive'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No archive file provided' });
    }

    const unzipper = (await import('unzipper')).default;
    const fs = await import('fs/promises');

    const archivePath = req.file.path;
    const directory = await unzipper.Open.file(archivePath);

    const files = [];
    for (const file of directory.files) {
      files.push({
        name: file.path,
        size: file.uncompressedSize,
        compressedSize: file.compressedSize,
        compressionRatio: ((1 - file.compressedSize / file.uncompressedSize) * 100).toFixed(2) + '%',
        type: path.extname(file.path).toLowerCase(),
        isDirectory: file.type === 'Directory'
      });
    }

    // Delete temporary file
    await fs.unlink(archivePath);

    res.json({
      message: 'Archive inspected successfully',
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      compressedSize: files.reduce((sum, f) => sum + f.compressedSize, 0),
      files: files.sort((a, b) => a.name.localeCompare(b.name))
    });

  } catch (err) {
    console.error('Inspect error:', err);
    res.status(500).json({ 
      message: 'Error inspecting archive', 
      error: err.message 
    });
  }
});

/**
 * Upload and extract ZIP archive into project
 * POST /api/archives/project/:projectId/import
 */
router.post('/project/:projectId/import', upload.single('archive'), async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No archive file provided' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access (only owner or admin can import)
    const isOwner = project.owner.toString() === req.user.id;
    const isAdmin = project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Only owner or admin can import' });
    }

    const unzipper = (await import('unzipper')).default;
    const fs = await import('fs/promises');

    const archivePath = req.file.path;
    const directory = await unzipper.Open.file(archivePath);

    const importedFiles = [];
    const errors = [];

    for (const file of directory.files) {
      if (file.type === 'File') {
        try {
          const buffer = await file.buffer();
          const content = buffer.toString('utf8');
          
          // If this is a JSON file with project data, parse it
          if (file.path === 'project_data.json') {
            const projectData = JSON.parse(content);
            importedFiles.push({
              name: file.path,
              type: 'project_data',
              size: file.uncompressedSize
            });
          } else if (file.path.startsWith('tasks/') && file.path.endsWith('.json')) {
            importedFiles.push({
              name: file.path,
              type: 'task_data',
              size: file.uncompressedSize
            });
          } else {
            importedFiles.push({
              name: file.path,
              type: 'other',
              size: file.uncompressedSize
            });
          }
        } catch (err) {
          errors.push({ file: file.path, error: err.message });
        }
      }
    }

    // Delete temporary file
    await fs.unlink(archivePath);

    res.json({
      message: 'Archive imported successfully',
      importedFiles: importedFiles.length,
      files: importedFiles,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ 
      message: 'Error importing archive', 
      error: err.message 
    });
  }
});

/**
 * Export all user projects to a single ZIP
 * GET /api/archives/export-all
 */
router.get('/export-all', async (req, res) => {
  try {
    // Get all user projects
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('owner', 'username email')
    .lean();

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found' });
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.attachment(`all_projects_export_${Date.now()}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    // Add general file with projects list
    const projectsList = {
      totalProjects: projects.length,
      exportDate: new Date().toISOString(),
      exportedBy: req.user.id,
      projects: projects.map(p => ({
        id: p._id.toString(),
        name: p.name,
        category: p.category,
        status: p.status
      }))
    };

    archive.append(JSON.stringify(projectsList, null, 2), {
      name: 'projects_list.json'
    });

    // Export each project separately
    for (const project of projects) {
      const tasks = await Task.find({ project: project._id })
        .populate('creator', 'username email')
        .populate('assignee', 'username email')
        .lean();

      const projectData = {
        project: {
          name: project.name,
          description: project.description,
          category: project.category,
          status: project.status,
          priority: project.priority,
          startDate: project.startDate,
          dueDate: project.dueDate,
          budget: project.budget,
          progress: project.progress,
          tags: project.tags
        },
        tasks: tasks.map(task => ({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
        }))
      };

      const safeName = project.name.replace(/[^a-z0-9]/gi, '_');
      archive.append(JSON.stringify(projectData, null, 2), {
        name: `projects/${safeName}/project_data.json`
      });
    }

    await archive.finalize();

  } catch (err) {
    console.error('Export all error:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Error exporting all projects', 
        error: err.message 
      });
    }
  }
});

export default router;
