import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import '../styles/DocumentsList.css';

function DocumentsList() {
  const { user, token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState({});
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDocuments();
  }, [sortBy, sortOrder, searchTerm, selectedFolder]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const query = new URLSearchParams({
        sortBy,
        order: sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedFolder !== 'all' && { category: selectedFolder })
      });

      const response = await axios.get(`${API_URL}/documents?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDocuments(response.data.documents);
      setFolders(response.data.folders);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Ошибка при загрузке документов: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'todo': { label: 'К выполнению', class: 'badge-todo' },
      'in-progress': { label: 'В процессе', class: 'badge-in-progress' },
      'review': { label: 'На проверке', class: 'badge-review' },
      'done': { label: 'Выполнено', class: 'badge-done' },
      'blocked': { label: 'Заблокировано', class: 'badge-blocked' }
    };
    return statusMap[status] || { label: status, class: 'badge-default' };
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'low': { label: 'Низкая', class: 'badge-priority-low' },
      'medium': { label: 'Средняя', class: 'badge-priority-medium' },
      'high': { label: 'Высокая', class: 'badge-priority-high' },
      'urgent': { label: 'Срочная', class: 'badge-priority-urgent' }
    };
    return priorityMap[priority] || { label: priority, class: 'badge-priority-default' };
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFolderIcon = (folderName) => {
    const icons = {
      'development': '💻',
      'design': '🎨',
      'marketing': '📢',
      'sales': '💰',
      'support': '🆘',
      'Вложения': '📎',
      'Другое': '📄'
    };
    return icons[folderName] || '📁';
  };

  if (loading && documents.length === 0) {
    return <div className="documents-container"><div className="loading">Загрузка документов...</div></div>;
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>📚 Все документы</h1>
        {stats && (
          <div className="documents-stats">
            <span>Всего: <strong>{stats.total}</strong></span>
            <span>Папок: <strong>{Object.keys(folders).length}</strong></span>
            {stats.byType && (
              <>
                <span>Задачи: <strong>{stats.byType.tasks}</strong></span>
                <span>Вложения: <strong>{stats.byType.attachments}</strong></span>
              </>
            )}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="documents-controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="🔍 Поиск документов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date">Сортировка по дате</option>
            <option value="name">Сортировка по названию</option>
            <option value="priority">Сортировка по приоритету</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '⬆️ Возрастание' : '⬇️ Убывание'}
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="no-documents">
          <p>📭 Документов не найдено</p>
        </div>
      ) : (
        <div className="folders-view">
          {Object.entries(folders).map(([folderName, folderDocs]) => (
            <div key={folderName} className="folder-section">
              <div className="folder-header">
                <button
                  className={`folder-toggle ${selectedFolder === folderName ? 'active' : ''}`}
                  onClick={() => setSelectedFolder(selectedFolder === folderName ? 'all' : folderName)}
                >
                  {getFolderIcon(folderName)} {folderName}
                  <span className="folder-count">({folderDocs.length})</span>
                </button>
              </div>

              {selectedFolder === 'all' || selectedFolder === folderName ? (
                <div className="documents-grid">
                  {folderDocs.map((doc) => (
                    <div key={doc._id} className="document-card">
                      <div className="document-header">
                        <h3 className="document-title">
                          {doc.type === 'attachment' ? '📎' : '📋'} {doc.title}
                        </h3>
                      </div>

                      {doc.description && (
                        <p className="document-description">{doc.description}</p>
                      )}

                      <div className="document-meta">
                        {doc.projectName && (
                          <span className="meta-item">📁 {doc.projectName}</span>
                        )}
                        {doc.createdAt && (
                          <span className="meta-item">📅 {formatDate(doc.createdAt)}</span>
                        )}
                      </div>

                      <div className="document-badges">
                        {doc.status && (
                          <span className={`badge ${getStatusBadge(doc.status).class}`}>
                            {getStatusBadge(doc.status).label}
                          </span>
                        )}
                        {doc.priority && (
                          <span className={`badge ${getPriorityBadge(doc.priority).class}`}>
                            {getPriorityBadge(doc.priority).label}
                          </span>
                        )}
                      </div>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="document-tags">
                          {doc.tags.map((tag, idx) => (
                            <span key={idx} className="tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {doc.dueDate && (
                        <div className="document-duedate">
                          ⏰ Срок: {formatDate(doc.dueDate)}
                        </div>
                      )}

                      {doc.assignee && (
                        <div className="document-assignee">
                          👤 Назначена: {doc.assignee.username || doc.assignee.email}
                        </div>
                      )}

                      {doc.url && (
                        <a href={doc.url} className="document-link" download>
                          💾 Скачать файл
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="documents-footer">
          <div className="footer-stats">
            {stats.byStatus && (
              <div className="status-summary">
                <h4>По статусам:</h4>
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  count > 0 && (
                    <span key={status}>
                      {getStatusBadge(status).label}: {count}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsList;
