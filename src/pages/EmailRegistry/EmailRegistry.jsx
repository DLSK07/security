import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Check, Filter, Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataApi } from '../../services/csvApi';
import { logActivity } from '../../services/activityLogger';
import { Button, IconButton, Badge } from '../../components/ui/Buttons';
import { downloadCsvTemplate, parseCsvFile } from '../../utils/csvUtils';

const classificationColors = {
  'Whitelist': 'success',
  'Blacklist': 'danger',
  'Known Vendor': 'info',
  'Unknown': 'warning'
};

const EmailRegistry = () => {
  const { isAdmin, isViewer, canEditInventory, user: currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    address: '', classification: 'Unknown', scope: 'Global', 
    platform: 'M365 Defender', notes: ''
  });
  
  const csvHeaders = ['address', 'classification', 'scope', 'platform', 'notes'];

  if (isViewer) {
    return <Navigate to="/software" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    const result = await dataApi.getTable('emails');
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
        address: '', classification: 'Unknown', scope: 'Global', 
        platform: 'M365 Defender', notes: ''
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
      addedBy: editingItem ? editingItem.addedBy : 'currentUser',
      date: editingItem ? editingItem.date : new Date().toISOString().split('T')[0]
    };

    if (editingItem) {
      await dataApi.updateRow('emails', editingItem.id, rowData);
      await logActivity(currentUser, 'Inventory', 'Update', `Updated email registry: ${rowData.address}`);
    } else {
      await dataApi.addRow('emails', rowData);
      await logActivity(currentUser, 'Inventory', 'Add', `Added email registry: ${rowData.address}`);
    }
    await loadData();
    handleCloseModal();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this email registry entry?')) {
      setLoading(true);
      const itemToDelete = data.find(i => i.id === id);
      await dataApi.deleteRow('emails', id);
      await logActivity(currentUser, 'Inventory', 'Delete', `Deleted email entry: ${itemToDelete?.address || id}`);
      await loadData();
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classificationFilter === 'All' || item.classification === classificationFilter;
    return matchesSearch && matchesClass;
  });

  const handleCsvImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const parsedData = await parseCsvFile(file, csvHeaders);
      const currentUser = JSON.parse(localStorage.getItem('security_registry_user'));
      for (const row of parsedData) {
        await dataApi.addRow('emails', {
          ...row,
          addedBy: currentUser?.name || 'currentUser',
          date: new Date().toISOString().split('T')[0]
        });
      }
      await logActivity(currentUser, 'Inventory', 'Import', `Imported ${parsedData.length} records into Email Registry`);
      alert(`Imported ${parsedData.length} entries.`);
      await loadData();
    } catch (err) { alert("CSV Error: " + err.message); }
    setLoading(false);
    e.target.value = null;
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Email Registry</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage trusted vendors and blacklisted domains/addresses.</p>
        </div>
        {canEditInventory && (
           <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" icon={Download} onClick={() => downloadCsvTemplate(csvHeaders, 'emails')}>Template</Button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} style={{ marginRight: '0.5rem' }}/> Import
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
            </label>
            <Button icon={Plus} onClick={() => handleOpenModal()}>Add Entry</Button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1.5rem', alignItems: 'center' }} className="glass-card">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search email or domain..." className="input-base" style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <select className="input-base" style={{ paddingLeft: '2.5rem' }} value={classificationFilter} onChange={(e) => setClassificationFilter(e.target.value)}>
            <option value="All">All Classifications</option>
            <option value="Whitelist">Whitelist</option>
            <option value="Blacklist">Blacklist</option>
            <option value="Known Vendor">Known Vendor</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>Address/Domain</th>
                <th>Classification</th>
                <th>Scope</th>
                <th>Platform</th>
                <th>Added By & Date</th>
                {canEditInventory && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={canEditInventory ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No entries found.</td></tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.address}</td>
                    <td><Badge variant={classificationColors[item.classification] || 'neutral'}>{item.classification}</Badge></td>
                    <td>{item.scope}</td>
                    <td>{item.platform}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.addedBy} <br/> {item.date}
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
              <h2>{editingItem ? 'Edit Entry' : 'Add Entry'}</h2>
              <IconButton icon={X} onClick={handleCloseModal} />
            </div>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Address or Domain*</label>
                <input required className="input-base" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Classification</label>
                  <select className="input-base" value={formData.classification} onChange={e => setFormData({...formData, classification: e.target.value})}>
                    <option value="Whitelist">Whitelist</option>
                    <option value="Blacklist">Blacklist</option>
                    <option value="Known Vendor">Known Vendor</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scope</label>
                  <select className="input-base" value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})}>
                    <option value="Global">Global</option>
                    <option value="User-specific">User-specific</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Platform Enforcement</label>
                <select className="input-base" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})}>
                  <option value="M365 Defender">M365 Defender</option>
                  <option value="Exchange">Exchange</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Notes</label>
                <textarea className="input-base" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" type="submit" icon={Check} disabled={loading}>{loading ? 'Saving...' : 'Save Entry'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmailRegistry;
