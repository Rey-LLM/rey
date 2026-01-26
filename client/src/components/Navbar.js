import React from 'react';
import { useAuth } from '../AuthContext';
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">
          ProjectManager
        </Link>

        {user && (
          <div className="nav-items">
            <Link to="/projects" className="nav-link">Projects</Link>
            <Link to="/tasks" className="nav-link">Tasks</Link>
            <Link to="/team" className="nav-link">Team</Link>

            <div className="user-menu">
              <span className="user-name">{user.username}</span>
              <Link to="/profile" className="icon-btn" title="Profile">
                <FiUser />
              </Link>
              <Link to="/settings" className="icon-btn" title="Settings">
                <FiSettings />
              </Link>
              <button onClick={logout} className="icon-btn logout" title="Logout">
                <FiLogOut />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .navbar {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
          text-decoration: none;
        }

        .nav-items {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: #007bff;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
          border-left: 1px solid #e0e0e0;
          padding-left: 2rem;
        }

        .user-name {
          font-weight: 500;
          color: #333;
        }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s;
        }

        .icon-btn:hover {
          color: #007bff;
        }

        .icon-btn.logout:hover {
          color: #dc3545;
        }
      `}</style>
    </nav>
  );
}
