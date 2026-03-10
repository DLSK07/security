import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Activity, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataApi } from '../../services/csvApi';

const ActivityLogs = () => {
  const { isAdmin, canEditInventory } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Security barrier - Guests have no access to logs at all
  if (!canEditInventory) {
    return <Navigate to="/software" replace />;
  }

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await dataApi.getTable('activity_logs');
      // Reverse array to show newest first
      setLogs(allLogs.reverse());
    } catch (error) {
      console.error("Error loading logs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    // RBAC logic: regular users only see Inventory logs
    if (!isAdmin && log.type !== 'Inventory') {
      return false;
    }

    const matchesSearch = log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || log.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Activity Logs</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track changes and actions taken across the registry.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-panel)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
          <Activity size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>System Audit Trail</span>
        </div>
      </div>

      <div className="controls-bar glass-card" style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input 
            type="text" 
            placeholder="Search by action details or user..." 
            className="input-base" 
            style={{ paddingLeft: '2.5rem', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isAdmin && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
            <select 
              className="input-base" 
              style={{ paddingLeft: '2.5rem' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Inventory">Inventory</option>
              <option value="UserManagement">User Management</option>
            </select>
          </div>
        )}
      </div>

      <div className="timeline-container glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No activity logs found matching your criteria.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredLogs.map((log, index) => (
              <div key={index} style={{ display: 'flex', gap: '1.5rem', position: 'relative' }}>
                {index !== filteredLogs.length - 1 && (
                  <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-1.5rem', width: '2px', backgroundColor: 'var(--border-color)' }}></div>
                )}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: log.type === 'UserManagement' ? 'var(--danger-bg)' : 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0 }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: log.type === 'UserManagement' ? 'var(--danger-color)' : 'var(--info-color)' }}></div>
                </div>
                <div className="log-card glass-card" style={{ flex: 1, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.userName}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{log.userRole}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>• {log.action} ({log.type})</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {new Date(log.date).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
