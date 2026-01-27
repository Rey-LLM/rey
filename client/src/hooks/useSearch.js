import { useState, useCallback } from 'react';
import { projectService, taskService } from '../services';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchProjects = useCallback(async (query, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectService.search(query, filters);
      setResults(response.data.data || response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTasks = useCallback(async (query, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.search(query, filters);
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDueSoon = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getDueSoon();
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOverdue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getOverdue();
      setResults(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchProjects,
    searchTasks,
    getDueSoon,
    getOverdue
  };
};
