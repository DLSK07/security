import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Filter, Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataApi } from '../../services/csvApi';
import { Button, IconButton, Badge } from '../../components/ui/Buttons';
import { downloadCsvTemplate, parseCsvFile } from '../../utils/csvUtils';

const statusColors = {
  'Approved': 'success',
  'Blacklisted': 'danger',
  'Under Review': 'warning'
};

const SoftwareInventory = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '', vendor: '', version: '', scope: 'Global', 
    status: 'Under Review', justification: '', ticket: ''
  });

  const csvHeaders = ['name', 'vendor', 'version', 'scope', 'status', 'justification', 'ticket'];

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await dataApi.getTable('software');
      setData(result);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '', vendor: '', version: '', scope: 'Global', 
        status: 'Under Review', justification: '', ticket: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const rowData = {
      ...formData,
      addedBy: editingItem ? editingItem.addedBy : 'currentUser', // Replace with real user in prod
      dateAdded: editingItem ? editingItem.dateAdded : new Date().toISOString().split('T')[0]
    };

    try {
      if (editingItem) {
        await dataApi.updateRow('software', editingItem.id, rowData);
      } else {
        await dataApi.addRow('software', rowData);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Save error:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this specific entry?')) {
      setLoading(true);
      await dataApi.deleteRow('software', id);
      await loadData();
    }
  };

  // Filtering
  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCsvImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const parsedData = await parseCsvFile(file, csvHeaders);
      for (const row of parsedData) {
        await dataApi.addRow('software', {
          ...row,
          addedBy: currentUser?.name || 'currentUser',
          dateAdded: new Date().toISOString().split('T')[0]
        });
      }
      alert(`Successfully imported ${parsedData.length} records.`);
      await loadData();
    } catch (err) {
      alert("CSV Import Error: " + err.message);
    }
    setLoading(false);
    e.target.value = null; // reset input
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header flex-between">
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Software Inventory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage approved and restricted software assets.</p>
        </div>
        
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" icon={Download} onClick={() => downloadCsvTemplate(csvHeaders, 'software')}>
              Template
            </Button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} style={{ marginRight: '0.5rem' }}/> Import CSV
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
            </label>
            <Button icon={Plus} onClick={() => handleOpenModal()}>
              Add Software
            </Button>
          </div>
        )}
      </div>

      <div className="controls-bar glass-card">
        <div className="search-group">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search software or vendor..." 
            className="input-base search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} className="filter-icon" />
          <select 
            className="input-base filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Blacklisted">Blacklisted</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading && <div className="loading-state">Loading inventory data...</div>}
        
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>Software & Vendor</th>
                <th>Version</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Ticket </th>
                <th>Date Added</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="empty-state">
                    No software records found.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.vendor}</div>
                    </td>
                    <td>{item.version}</td>
                    <td>{item.scope}</td>
                    <td>
                      <Badge variant={statusColors[item.status] || 'neutral'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td>
                      {item.ticket ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {item.ticket}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.dateAdded}</td>
                    
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons">
                          <IconButton icon={Edit2} onClick={() => handleOpenModal(item)} />
                          <IconButton icon={Trash2} onClick={() => handleDelete(item.id)} className="danger-icon" />
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Software' : 'Add Software'}</h2>
              <IconButton icon={X} onClick={handleCloseModal} />
            </div>
            
            <form onSubmit={handleSave} className="form-grid">
              <div className="form-group">
                <label>Software Name*</label>
                <input required className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Vendor*</label>
                <input required className="input-base" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Version</label>
                  <input className="input-base" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Scope</label>
                  <select className="input-base" value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})}>
                    <option value="Global">Global</option>
                    <option value="Department">Department</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select className="input-base" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Approved">Approved</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ticket Reference</label>
                  <input className="input-base" placeholder="e.g. SEC-1234" value={formData.ticket} onChange={e => setFormData({...formData, ticket: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Justification / Notes</label>
                <textarea 
                  className="input-base" 
                  rows={3} 
                  value={formData.justification} 
                  onChange={e => setFormData({...formData, justification: e.target.value})}
                  placeholder="Provide context for this software approval or restriction..."
                />
              </div>

              <div className="modal-actions">
                <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" type="submit" icon={Check} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Software'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .module-header {
          margin-bottom: 2rem;
        }

        .controls-bar {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        .search-group, .filter-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-group {
          flex: 1;
        }

        .search-icon, .filter-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .search-input, .filter-select {
          padding-left: 2.5rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .danger-icon:hover {
          color: var(--danger-color);
          background-color: var(--danger-bg);
        }

        .loading-state, .empty-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
        }

        /* Form Layout */
        .form-grid {
          display: grid;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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

        textarea.input-base {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
};

// Default export needed for React.lazy
export default SoftwareInventory;
