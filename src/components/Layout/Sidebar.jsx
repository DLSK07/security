import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  Monitor, 
  Mail, 
  Globe, 
  Lock, 
  Ban,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/software', label: 'Software Inventory', icon: Monitor },
  { path: '/emails', label: 'Email Registry', icon: Mail },
  { path: '/webapps', label: 'Web App Registry', icon: Globe },
  { path: '/saserules', label: 'SASE Rules Log', icon: Lock },
  { path: '/blocked', label: 'Blocked Websites', icon: Ban },
];

export const Sidebar = () => {
  const { user, isAdmin, isSuperAdmin, canEditInventory } = useAuth();
  
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShieldCheck size={28} className="logo-icon animate-pulse" color="var(--primary-color)" />
        <h2>SecRegistry</h2>
      </div>
      
      <div className="sidebar-user glass-card">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={`badge badge-${isAdmin ? 'success' : 'info'} role-badge`}>
            {user?.role}
          </span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">MODULES</div>
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        {canEditInventory && (
          <>
            <div className="nav-section" style={{ marginTop: '1rem' }}>SYSTEM</div>
            <NavLink 
              to="/logs" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Activity Logs</span>
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <div className="nav-section" style={{ marginTop: '1rem' }}>ADMINISTRATION</div>
            <NavLink 
              to="/users" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>User Management</span>
            </NavLink>
          </>
        )}
      </nav>

      <style jsx="true">{`
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-panel);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 40;
        }

        .sidebar-header {
          height: var(--header-height);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.05em;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-user {
          margin: 1.5rem;
          padding: 1rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .user-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .role-badge {
          align-self: flex-start;
        }

        .sidebar-nav {
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-section {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-tertiary);
          letter-spacing: 0.1em;
          padding: 1rem 0.5rem 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .nav-link.active {
          background-color: rgba(59, 130, 246, 0.1);
          color: var(--primary-color);
          font-weight: 600;
          border-left: 3px solid var(--primary-color);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }
      `}</style>
    </aside>
  );
};
