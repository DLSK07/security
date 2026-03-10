import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataApi } from '../services/csvApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Try to restore session from localStorage, default to null
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('security_registry_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('security_registry_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('security_registry_user');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const users = await dataApi.getTable('users');
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        setUser({
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role
        });
        return { success: true };
      } else {
        return { success: false, message: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Failed to connect to the authentication server. Please ensure the backend is running.' };
    }
  };

  const loginAsViewer = () => {
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: 'Guest Viewer',
      email: 'guest@security.local',
      role: 'Viewer'
    });
  };

  const logout = () => {
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'Super Admin';
  const isAdmin = user?.role === 'Admin' || isSuperAdmin; // Backward compatibility with previous 'Admin' mentions
  const isUser = user?.role === 'User';
  const isViewer = user?.role === 'Viewer';

  const value = {
    user,
    login,
    loginAsViewer,
    logout,
    isSuperAdmin,
    isAdmin,
    isUser,
    isViewer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
