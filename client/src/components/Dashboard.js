import React, { useEffect, useState } from 'react';
import { projectService, taskService } from '../services';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    dueSoonTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projectsResponse = await projectService.getAll({ limit: 1000 });
        const tasksResponse = await taskService.getAll({});
        const dueSoonResponse = await taskService.getDueSoon();
        const overdueResponse = await taskService.getOverdue();

        const projects = projectsResponse.data.data || projectsResponse.data;
        
        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'active').length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          totalTasks: tasksResponse.data.length,
          dueSoonTasks: dueSoonResponse.data.length,
          overdueTasks: overdueResponse.data.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="dashboard loading">⏳ Загрузка статистики...</div>;
  }

  return (
    <div className="dashboard">
      <h2>📊 Панель управления</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProjects}</div>
          <div className="stat-label">Всего проектов</div>
          <div className="stat-footer">
            {stats.activeProjects} активных, {stats.completedProjects} завершено
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalTasks}</div>
          <div className="stat-label">Всего задач</div>
          <div className="stat-footer">
            {stats.dueSoonTasks} скоро, {stats.overdueTasks} просрочено
          </div>
        </div>

        <div className="stat-card priority-high">
          <div className="stat-value">⚠️</div>
          <div className="stat-label">Просроченные</div>
          <div className="stat-footer">{stats.overdueTasks} задач требуют внимания</div>
        </div>

        <div className="stat-card priority-medium">
          <div className="stat-value">⏰</div>
          <div className="stat-label">Скоро закончится</div>
          <div className="stat-footer">{stats.dueSoonTasks} задач в течение 3 дней</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
