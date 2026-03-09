import React from 'react';
import { LogOut, Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { IconButton } from '../ui/Buttons';

export const Header = () => {
  const { logout, user } = useAuth();

  return (
    <header className="header glass-panel">
      <div className="header-left">
        {/* Placeholder for global search if needed */}
      </div>
      
      <div className="header-right">
        <IconButton icon={Bell} title="Notifications" />
        
        <div className="divider"></div>
        
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button onClick={logout} className="logout-btn" title="Sign out">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .header {
          position: fixed;
          top: 1rem;
          right: 1.5rem;
          left: calc(var(--sidebar-width) + 1.5rem);
          height: calc(var(--header-height) - 1rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 30;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .divider {
          width: 1px;
          height: 24px;
          background-color: var(--border-color);
          margin: 0 0.5rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color), var(--info-color));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
          box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .logout-btn:hover {
          color: var(--danger-color);
          background-color: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </header>
  );
};
