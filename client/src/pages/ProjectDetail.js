import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, taskService } from '../services';
import { FiArrowLeft, FiPlus, FiEdit2 } from 'react-icons/fi';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchStats();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectService.getById(id);
      setProject(response.data);
    } catch (err) {
      console.error('Failed to fetch project');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskService.getByProject(id);
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch tasks');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectService.getStats(id);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.create({
        ...newTask,
        project: id
      });
      setNewTask({ title: '', description: '' });
      setShowNewTask(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task');
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <div className="project-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/projects')}>
          <FiArrowLeft /> Back
        </button>
        <h1>{project.name}</h1>
        <span className={`status status-${project.status}`}>{project.status}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-card">
            <h2>Description</h2>
            <p>{project.description || 'No description'}</p>
          </div>

          <div className="detail-card">
            <div className="tasks-header">
              <h2>Tasks ({tasks.length})</h2>
              <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
                <FiPlus /> Add Task
              </button>
            </div>

            {showNewTask && (
              <form onSubmit={handleCreateTask} className="new-task-form">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
                <button type="submit" className="btn btn-primary">Create</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewTask(false)}>Cancel</button>
              </form>
            )}

            <div className="tasks-list">
              {tasks.length === 0 ? (
                <p className="empty">No tasks yet</p>
              ) : (
                tasks.map(task => (
                  <div key={task._id} className="task-item">
                    <div className="task-content">
                      <h4>{task.title}</h4>
                      <span className={`status status-${task.status}`}>{task.status}</span>
                      <span className={`priority priority-${task.priority}`}>{task.priority}</span>
                    </div>
                    <button className="btn-icon">
                      <FiEdit2 />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="detail-card">
            <h3>Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
            </div>
            <p className="progress-text">{project.progress}%</p>
          </div>

          {stats && (
            <div className="detail-card">
              <h3>Statistics</h3>
              <div className="stat-list">
                <div className="stat-item">
                  <span>To Do</span>
                  <span className="stat-value">{stats.todo}</span>
                </div>
                <div className="stat-item">
                  <span>In Progress</span>
                  <span className="stat-value">{stats.inProgress}</span>
                </div>
                <div className="stat-item">
                  <span>Review</span>
                  <span className="stat-value">{stats.review}</span>
                </div>
                <div className="stat-item">
                  <span>Done</span>
                  <span className="stat-value">{stats.done}</span>
                </div>
              </div>
            </div>
          )}

          <div className="detail-card">
            <h3>Members</h3>
            <div className="members-list">
              {project.members?.map(member => (
                <div key={member._id} className="member-item">
                  <span>{member.user?.username}</span>
                  <span className="role">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .project-detail {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .btn-back {
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #007bff;
          padding: 0;
        }

        .btn-back:hover {
          text-decoration: underline;
        }

        .detail-header h1 {
          margin: 0;
          flex: 1;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
        }

        .detail-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .tasks-header h2 {
          margin: 0;
        }

        .new-task-form {
          background: #f9f9f9;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
        }

        .new-task-form input,
        .new-task-form textarea {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .new-task-form button {
          margin-right: 0.5rem;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 6px;
          transition: background 0.3s;
        }

        .task-item:hover {
          background: #f0f0f0;
        }

        .task-content {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex: 1;
        }

        .task-content h4 {
          margin: 0;
          color: #333;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-todo { background: #fff3cd; color: #856404; }
        .status-in-progress { background: #cfe2ff; color: #084298; }
        .status-review { background: #e2e3e5; color: #383d41; }
        .status-done { background: #d1e7dd; color: #0f5132; }
        .status-blocked { background: #f8d7da; color: #842029; }

        .priority {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .priority-low { background: #d1ecf1; color: #0c5460; }
        .priority-medium { background: #fff3cd; color: #856404; }
        .priority-high { background: #f8d7da; color: #721c24; }
        .priority-urgent { background: #da3c3c; color: white; }

        .empty {
          text-align: center;
          color: #999;
          padding: 2rem;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: #f0f0f0;
          border-radius: 6px;
          overflow: hidden;
          margin: 1rem 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #00d4ff);
          transition: width 0.3s;
        }

        .progress-text {
          text-align: center;
          font-weight: bold;
          color: #007bff;
        }

        .stat-list {
          display: grid;
          gap: 0.75rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
        }

        .members-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .member-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .role {
          font-size: 0.85rem;
          background: #e7d4f5;
          color: #6c3483;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
