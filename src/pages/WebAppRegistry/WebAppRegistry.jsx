import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Check, Filter, Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataApi } from '../../services/csvApi';
import { logActivity } from '../../services/activityLogger';
import { Button, IconButton, Badge } from '../../components/ui/Buttons';
import { downloadCsvTemplate, parseCsvFile } from '../../utils/csvUtils';

const statusColors = {
  'Approved': 'success',
  'Blocked': 'danger',
  'New': 'info',
  'Under Review': 'warning'
};

const WebAppRegistry = () => {
  const { isAdmin, isViewer, canEditInventory, user: currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', url: '', category: '', status: 'New', 
    platform: 'SASE', scope: 'Global', requestor: ''
  });
  
  const csvHeaders = ['name', 'url', 'category', 'status', 'platform', 'scope', 'requestor'];

  if (isViewer) {
    return <Navigate to="/software" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    const result = await dataApi.getTable('webapps');
    setData(result);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '', url: '', category: '', status: 'New', 
        platform: 'SASE', scope: 'Global', requestor: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const rowData = {
      ...formData,
      date: editingItem ? editingItem.date : new Date().toISOString().split('T')[0]
    };

    if (editingItem) {
      await dataApi.updateRow('webapps', editingItem.id, rowData);
      await logActivity(currentUser, 'Inventory', 'Update', `Updated web app: ${rowData.name}`);
    } else {
      await dataApi.addRow('webapps', rowData);
      await logActivity(currentUser, 'Inventory', 'Add', `Added web app: ${rowData.name}`);
    }
    await loadData();
    handleCloseModal();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this web application entry?')) {
      setLoading(true);
      const itemToDelete = data.find(i => i.id === id);
      await dataApi.deleteRow('webapps', id);
      await logActivity(currentUser, 'Inventory', 'Delete', `Deleted web app: ${itemToDelete?.name || id}`);
      await loadData();
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.url.toLowerCase().includes(searchTerm.toLowerCase());
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
        await dataApi.addRow('webapps', {
          ...row,
          date: new Date().toISOString().split('T')[0]
        });
      }
      await logActivity(currentUser, 'Inventory', 'Import', `Imported ${parsedData.length} web apps`);
      alert(`Imported ${parsedData.length} apps.`);
      await loadData();
    } catch (err) { alert("CSV Error: " + err.message); }
    setLoading(false);
    e.target.value = null;
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Web App Registry</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track sanctioned and shadow IT web applications.</p>
        </div>
        {canEditInventory && (
           <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" icon={Download} onClick={() => downloadCsvTemplate(csvHeaders, 'webapps')}>Template</Button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} style={{ marginRight: '0.5rem' }}/> Import
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
            </label>
            <Button icon={Plus} onClick={() => handleOpenModal()}>Add App</Button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1.5rem', alignItems: 'center' }} className="glass-card">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search app name or URL..." className="input-base" style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <select className="input-base" style={{ paddingLeft: '2.5rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Approved">Approved</option>
            <option value="Blocked">Blocked</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>App Name & URL</th>
                <th>Category</th>
                <th>Status</th>
                <th>Platform / Scope</th>
                <th>Requestor & Date</th>
                {canEditInventory && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={canEditInventory ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No entries found.</td></tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem' }}>{item.url}</a>
                    </td>
                    <td>{item.category}</td>
                    <td><Badge variant={statusColors[item.status] || 'neutral'}>{item.status}</Badge></td>
                    <td>
                      <div>{item.platform}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.scope}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.requestor} <br/> {item.date}
                    </td>
                    {canEditInventory && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <IconButton icon={Edit2} onClick={() => handleOpenModal(item)} />
                          <IconButton icon={Trash2} onClick={() => handleDelete(item.id)} />
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit App' : 'Add App'}</h2>
              <IconButton icon={X} onClick={handleCloseModal} />
            </div>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>App Name*</label>
                  <input required className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category</label>
                  <input className="input-base" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>URL*</label>
                <input required type="url" className="input-base" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status</label>
                  <select className="input-base" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="New">New</option>
                    <option value="Approved">Approved</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Platform</label>
                  <select className="input-base" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})}>
                    <option value="SASE">SASE</option>
                    <option value="Firewall">Firewall</option>
                    <option value="Proxy">Proxy</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scope</label>
                  <select className="input-base" value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})}>
                    <option value="Global">Global</option>
                    <option value="Department">Department</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Requestor</label>
                  <input className="input-base" value={formData.requestor} onChange={e => setFormData({...formData, requestor: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" type="submit" icon={Check} disabled={loading}>{loading ? 'Saving...' : 'Save App'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default WebAppRegistry;
