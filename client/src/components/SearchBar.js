import React, { useState } from 'react';
import { useSearch } from '../hooks/useSearch';
import '../styles/SearchBar.css';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('projects');
  const [activeFilters, setActiveFilters] = useState({});
  const { results, loading, error, searchProjects, searchTasks } = useSearch();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (type === 'projects') {
        await searchProjects(query, activeFilters);
      } else {
        await searchTasks(query, activeFilters);
      }
    }
  };

  const toggleFilter = (filterKey, filterValue) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === filterValue ? null : filterValue
    }));
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder={`Поиск ${type === 'projects' ? 'проектов' : 'задач'}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍 Поиск
          </button>
        </div>

        <div className="search-type-toggle">
          <button
            type="button"
            className={`type-btn ${type === 'projects' ? 'active' : ''}`}
            onClick={() => setType('projects')}
          >
            Проекты
          </button>
          <button
            type="button"
            className={`type-btn ${type === 'tasks' ? 'active' : ''}`}
            onClick={() => setType('tasks')}
          >
            Задачи
          </button>
        </div>

        {type === 'projects' && (
          <div className="filters">
            <button
              type="button"
              className={`filter-btn ${activeFilters.status === 'active' ? 'active' : ''}`}
              onClick={() => toggleFilter('status', 'active')}
            >
              Активные
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilters.status === 'completed' ? 'active' : ''}`}
              onClick={() => toggleFilter('status', 'completed')}
            >
              Завершённые
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilters.status === 'archived' ? 'active' : ''}`}
              onClick={() => toggleFilter('status', 'archived')}
            >
              Архивные
            </button>
          </div>
        )}

        {type === 'tasks' && (
          <div className="filters">
            <button
              type="button"
              className={`filter-btn ${activeFilters.dueSoon ? 'active' : ''}`}
              onClick={() => toggleFilter('dueSoon', true)}
            >
              Скоро ⏰
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilters.overdue ? 'active' : ''}`}
              onClick={() => toggleFilter('overdue', true)}
            >
              Просрочены ⚠️
            </button>
            <button
              type="button"
              className={`filter-btn ${activeFilters.priority === 'high' ? 'active' : ''}`}
              onClick={() => toggleFilter('priority', 'high')}
            >
              Высокий приоритет
            </button>
          </div>
        )}
      </form>

      {error && <div className="error-message">❌ {error}</div>}

      {loading && <div className="loading">⏳ Поиск...</div>}

      {results.length > 0 && (
        <div className="search-results">
          <h3>Результаты ({results.length})</h3>
          <div className="results-list">
            {results.map((item) => (
              <div key={item._id} className="result-item">
                <h4>{item.name || item.title}</h4>
                <p>{item.description || ''}</p>
                {item.status && <span className="badge">{item.status}</span>}
                {item.priority && <span className="badge priority">{item.priority}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
