import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, User, ShieldAlert, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Buttons';

export const Login = () => {
  const { user, login, loginAsViewer } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/software" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <div className="icon-wrapper">
            <ShieldCheck size={48} color="var(--primary-color)" />
          </div>
          <h1>Security Registry</h1>
          <p>Cybersecurity Portal Authentication</p>
        </div>

        <div className="login-options">
          {error && <div className="error-box">{error}</div>}
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                className="input-base" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: admin@security.local"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                className="input-base" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
              />
            </div>

            <Button 
              type="submit"
              variant="primary" 
              icon={LogIn}
              className="role-btn admin-btn"
              disabled={loading}
              style={{ justifyContent: 'center', paddingLeft: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="divider-text">
            <span>OR</span>
          </div>

          <Button 
            type="button"
            variant="secondary" 
            icon={User}
            className="role-btn viewer-btn"
            onClick={loginAsViewer}
            style={{ justifyContent: 'center', paddingLeft: '1rem' }}
          >
            Access as Guest Viewer
          </Button>
            
          <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Super Admin: admin@security.local / password123<br/>
            User: user@security.local / password123
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.15), transparent 40%);
          background-color: var(--bg-color);
          padding: 1rem;
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          padding: 3rem 2rem;
          text-align: center;
        }

        .login-header {
          margin-bottom: 2.5rem;
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
        }

        .login-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header p {
          color: var(--text-secondary);
        }

        .login-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger-border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          color: var(--danger-color);
          font-size: 0.875rem;
          animation: fadeIn 0.3s;
        }

        .divider-text {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-tertiary);
          font-size: 0.75rem;
          margin: 0.5rem 0;
        }

        .divider-text::before,
        .divider-text::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        .divider-text:not(:empty)::before {
          margin-right: .5em;
        }

        .divider-text:not(:empty)::after {
          margin-left: .5em;
        }

        .role-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          border-radius: var(--radius-md);
        }

        .admin-btn {
          background: linear-gradient(135deg, var(--primary-color), var(--info-color));
          border: none;
        }

        .admin-btn:hover {
          background: linear-gradient(135deg, var(--primary-hover), #7c3aed);
        }
      `}</style>
    </div>
  );
};
