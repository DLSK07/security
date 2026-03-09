import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../contexts/AuthContext';

export const Layout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content animate-fade-in">
          <Outlet />
        </main>
      </div>

      <style jsx="true">{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-color);
        }

        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          display: flex;
          flex-direction: column;
        }

        .page-content {
          flex: 1;
          padding: calc(var(--header-height) + 2rem) 1.5rem 2rem 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </div>
  );
};
