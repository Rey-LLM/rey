import React, { useState, useEffect } from 'react';
import { projectService } from '../services';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', category: 'development' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await projectService.create(formData);
      setFormData({ name: '', description: '', category: 'development' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await projectService.delete(id);
        fetchProjects();
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  if (loading) return <div className="loading">Loading projects...</div>;

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Project
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="project-header">
              <h3>{project.name}</h3>
              <span className={`status status-${project.status}`}>{project.status}</span>
            </div>

            <p className="project-description">{project.description}</p>

            <div className="project-meta">
              <span className="badge">{project.category}</span>
              <span className="priority">{project.priority}</span>
            </div>

            <div className="project-stats">
              <div className="stat">
                <span className="label">Tasks:</span>
                <span className="value">{project.tasks?.length || 0}</span>
              </div>
              <div className="stat">
                <span className="label">Members:</span>
                <span className="value">{project.members?.length || 1}</span>
              </div>
            </div>

            <div className="project-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
              </div>
              <span className="progress-text">{project.progress}%</span>
            </div>

            <div className="project-actions">
              <button className="btn-icon" title="Edit">
                <FiEdit2 />
              </button>
              <button className="btn-icon" title="Members">
                <FiUsers />
              </button>
              <button className="btn-icon danger" onClick={() => handleDelete(project._id)} title="Delete">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Project</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Project name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .projects-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .project-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          transition: box-shadow 0.3s;
        }

        .project-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .project-header h3 {
          margin: 0;
          color: #333;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-active { background: #d4edda; color: #155724; }
        .status-planning { background: #e7d4f5; color: #6c3483; }
        .status-completed { background: #d1ecf1; color: #0c5460; }
        .status-archived { background: #f8f9fa; color: #6c757d; }

        .project-description {
          color: #666;
          margin: 1rem 0;
          font-size: 0.95rem;
        }

        .project-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .badge {
          display: inline-block;
          background: #f0f0f0;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          color: #666;
        }

        .priority {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .project-stats {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
          padding: 1rem 0;
          border-top: 1px solid #e0e0e0;
          border-bottom: 1px solid #e0e0e0;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat .label {
          font-size: 0.85rem;
          color: #999;
        }

        .stat .value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
        }

        .project-progress {
          margin-bottom: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #00d4ff);
          transition: width 0.3s;
        }

        .progress-text {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .project-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .btn-icon {
          background: none;
          border: 1px solid #e0e0e0;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .btn-icon:hover {
          background: #f0f0f0;
          color: #007bff;
        }

        .btn-icon.danger:hover {
          background: #ffe6e6;
          color: #dc3545;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
        }

        .modal-content h2 {
          margin-top: 0;
        }

        .modal-content input,
        .modal-content textarea,
        .modal-content select {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}
