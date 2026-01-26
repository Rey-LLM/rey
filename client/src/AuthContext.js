import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { userService } from './services';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, isLoading: false };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Инициализация - проверить токен
  useEffect(() => {
    if (state.token) {
      userService.getMe()
        .then(res => {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.data, token: state.token } });
        })
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'INIT' });
        });
    } else {
      dispatch({ type: 'INIT' });
    }
  }, [state.token]);

  const login = (user, token) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setError, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
