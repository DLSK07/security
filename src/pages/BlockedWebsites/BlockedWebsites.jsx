import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Filter, Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataApi } from '../../services/csvApi';
import { logActivity } from '../../services/activityLogger';
import { Button, IconButton, Badge } from '../../components/ui/Buttons';
import { downloadCsvTemplate, parseCsvFile } from '../../utils/csvUtils';

const levelColors = {
  'Global': 'danger',
  'Local': 'warning'
};

const BlockedWebsites = () => {
  const { isAdmin, canEditInventory, user: currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    url: '', reason: '', level: 'Global', enforcedVia: 'SASE'
  });
  
  const csvHeaders = ['url', 'reason', 'level', 'enforcedVia'];

  const loadData = async () => {
    setLoading(true);
    const result = await dataApi.getTable('blockedwebsites');
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
        url: '', reason: '', level: 'Global', enforcedVia: 'SASE'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const rowData = {
      ...formData,
      reviewedBy: editingItem ? editingItem.reviewedBy : 'currentUser',
      reviewDate: new Date().toISOString().split('T')[0],
      dateBlocked: editingItem ? editingItem.dateBlocked : new Date().toISOString().split('T')[0]
    };

    if (editingItem) {
      await dataApi.updateRow('blockedwebsites', editingItem.id, rowData);
      await logActivity(currentUser, 'Inventory', 'Update', `Updated blocked site: ${rowData.url}`);
    } else {
      await dataApi.addRow('blockedwebsites', rowData);
      await logActivity(currentUser, 'Inventory', 'Add', `Added blocked site: ${rowData.url}`);
    }
    await loadData();
    handleCloseModal();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this website from the blocklist?')) {
      setLoading(true);
      const itemToDelete = data.find(i => i.id === id);
      await dataApi.deleteRow('blockedwebsites', id);
      await logActivity(currentUser, 'Inventory', 'Delete', `Removed blocked site: ${itemToDelete?.url || id}`);
      await loadData();
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || item.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleCsvImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const parsedData = await parseCsvFile(file, csvHeaders);
      const currentUser = JSON.parse(localStorage.getItem('security_registry_user'));
      for (const row of parsedData) {
        await dataApi.addRow('blockedwebsites', {
          ...row,
          reviewedBy: currentUser?.name || 'currentUser',
          reviewDate: new Date().toISOString().split('T')[0],
          dateBlocked: new Date().toISOString().split('T')[0]
        });
      }
      await logActivity(currentUser, 'Inventory', 'Import', `Imported ${parsedData.length} blocked sites`);
      alert(`Imported ${parsedData.length} records.`);
      await loadData();
    } catch (err) { alert("CSV Error: " + err.message); }
    setLoading(false);
    e.target.value = null;
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>Blocked Websites</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track explicitly blocked URLs across all enforcement platforms.</p>
        </div>
        {canEditInventory && (
           <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" icon={Download} onClick={() => downloadCsvTemplate(csvHeaders, 'blockedwebsites')}>Template</Button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} style={{ marginRight: '0.5rem' }}/> Import
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
            </label>
            <Button icon={Plus} onClick={() => handleOpenModal()}>Add Block</Button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1.5rem', alignItems: 'center' }} className="glass-card">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search URL..." className="input-base" style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <select className="input-base" style={{ paddingLeft: '2.5rem' }} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="All">All Levels</option>
            <option value="Global">Global</option>
            <option value="Local">Local</option>
          </select>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Reason</th>
                <th>Level</th>
                <th>Enforced Via</th>
                <th>Block/Review Date</th>
                {canEditInventory && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={canEditInventory ? 6 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No entries found.</td></tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>{item.url}</a></td>
                    <td>{item.reason}</td>
                    <td><Badge variant={levelColors[item.level] || 'neutral'}>{item.level}</Badge></td>
                    <td>{item.enforcedVia}</td>
                     <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>Blocked: {item.dateBlocked}</div>
                      <div>Reviewed: {item.reviewDate}</div>
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
              <h2>{editingItem ? 'Edit Blocked Site' : 'Add Blocked Site'}</h2>
              <IconButton icon={X} onClick={handleCloseModal} />
            </div>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Website URL*</label>
                <input required type="url" className="input-base" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Block Reason*</label>
                <input required className="input-base" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Block Level</label>
                  <select className="input-base" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                    <option value="Global">Global</option>
                    <option value="Local">Local</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enforced Via</label>
                  <select className="input-base" value={formData.enforcedVia} onChange={e => setFormData({...formData, enforcedVia: e.target.value})}>
                    <option value="SASE">SASE</option>
                    <option value="Firewall">Firewall</option>
                    <option value="DNS">DNS</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" type="submit" icon={Check} disabled={loading}>{loading ? 'Saving...' : 'Save Block'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default BlockedWebsites;
