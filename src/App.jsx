import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login/Login';

// Module imports
const SoftwareInventory = React.lazy(() => import('./pages/SoftwareInventory/SoftwareInventory'));
const EmailRegistry = React.lazy(() => import('./pages/EmailRegistry/EmailRegistry'));
const WebAppRegistry = React.lazy(() => import('./pages/WebAppRegistry/WebAppRegistry'));
const SaseRulesLog = React.lazy(() => import('./pages/SaseRulesLog/SaseRulesLog'));
const BlockedWebsites = React.lazy(() => import('./pages/BlockedWebsites/BlockedWebsites'));
const UserManagement = React.lazy(() => import('./pages/UserManagement/UserManagement'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <React.Suspense fallback={<div style={{padding: '2rem', color: 'white'}}>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/software" replace />} />
              <Route path="software" element={<SoftwareInventory />} />
              <Route path="emails" element={<EmailRegistry />} />
              <Route path="webapps" element={<WebAppRegistry />} />
              <Route path="saserules" element={<SaseRulesLog />} />
              <Route path="blocked" element={<BlockedWebsites />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/software" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
