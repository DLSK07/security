import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Check, Filter, Download, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataApi } from '../../services/csvApi';
import { logActivity } from '../../services/activityLogger';
import { Button, IconButton, Badge } from '../../components/ui/Buttons';
import { downloadCsvTemplate, parseCsvFile } from '../../utils/csvUtils';

const typeColors = {
  'Allow': 'success',
  'Block': 'danger',
  'Alert': 'warning'
};

const SaseRulesLog = () => {
  const { isAdmin, isViewer, canEditInventory, user: currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', type: 'Block', target: 'Domain', listType: 'Global Blocklist', 
    platform: 'Zscaler', linkedTicket: ''
  });
  
  const csvHeaders = ['name', 'type', 'target', 'listType', 'platform', 'linkedTicket'];

  if (isViewer) {
    return <Navigate to="/software" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    const result = await dataApi.getTable('saserules');
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
        name: '', type: 'Block', target: 'Domain', listType: 'Global Blocklist', 
        platform: 'Zscaler', linkedTicket: ''
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
      createdBy: editingItem ? editingItem.createdBy : 'currentUser',
      date: editingItem ? editingItem.date : new Date().toISOString().split('T')[0]
    };

    if (editingItem) {
      await dataApi.updateRow('saserules', editingItem.id, rowData);
      await logActivity(currentUser, 'Inventory', 'Update', `Updated SASE rule: ${rowData.name}`);
    } else {
      await dataApi.addRow('saserules', rowData);
      await logActivity(currentUser, 'Inventory', 'Add', `Added SASE rule: ${rowData.name}`);
    }
    await loadData();
    handleCloseModal();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this SASE rule log?')) {
      setLoading(true);
      const itemToDelete = data.find(i => i.id === id);
      await dataApi.deleteRow('saserules', id);
      await logActivity(currentUser, 'Inventory', 'Delete', `Deleted SASE rule: ${itemToDelete?.name || id}`);
      await loadData();
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.platform.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCsvImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const parsedData = await parseCsvFile(file, csvHeaders);
      const currentUser = JSON.parse(localStorage.getItem('security_registry_user'));
      for (const row of parsedData) {
        await dataApi.addRow('saserules', {
          ...row,
          createdBy: currentUser?.name || 'currentUser',
          date: new Date().toISOString().split('T')[0]
        });
      }
      await logActivity(currentUser, 'Inventory', 'Import', `Imported ${parsedData.length} SASE rules`);
      alert(`Imported ${parsedData.length} rules.`);
      await loadData();
    } catch (err) { alert("CSV Error: " + err.message); }
    setLoading(false);
    e.target.value = null;
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>SASE Rules Log</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Centralized log of rules applied at the edge (SASE/SWG).</p>
        </div>
        {canEditInventory && (
           <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" icon={Download} onClick={() => downloadCsvTemplate(csvHeaders, 'saserules')}>Template</Button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} style={{ marginRight: '0.5rem' }}/> Import
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
            </label>
            <Button icon={Plus} onClick={() => handleOpenModal()}>Add Rule</Button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1.5rem', alignItems: 'center' }} className="glass-card">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search rule name or platform..." className="input-base" style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <select className="input-base" style={{ paddingLeft: '2.5rem' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Allow">Allow</option>
            <option value="Block">Block</option>
            <option value="Alert">Alert</option>
          </select>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Type</th>
                <th>Target & List</th>
                <th>Platform</th>
                <th>Ticket</th>
                <th>Created By/Date</th>
                {canEditInventory && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={canEditInventory ? 7 : 6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No entries found.</td></tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td><Badge variant={typeColors[item.type] || 'neutral'}>{item.type}</Badge></td>
                    <td>
                      <div>{item.target}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.listType}</div>
                    </td>
                    <td>{item.platform}</td>
                    <td>
                      {item.linkedTicket ? (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                          {item.linkedTicket}
                        </span>
                      ) : '-'}
                    </td>
                     <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.createdBy} <br/> {item.date}
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
              <h2>{editingItem ? 'Edit Rule' : 'Add Rule'}</h2>
              <IconButton icon={X} onClick={handleCloseModal} />
            </div>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rule Name*</label>
                <input required className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type</label>
                  <select className="input-base" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Allow">Allow</option>
                    <option value="Block">Block</option>
                    <option value="Alert">Alert</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target</label>
                  <select className="input-base" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})}>
                    <option value="URL">URL</option>
                    <option value="Domain">Domain</option>
                    <option value="App">App</option>
                  </select>
                </div>
              </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>List Type</label>
                  <select className="input-base" value={formData.listType} onChange={e => setFormData({...formData, listType: e.target.value})}>
                    <option value="Global Blocklist">Global Blocklist</option>
                    <option value="Local Blocklist">Local Blocklist</option>
                    <option value="Whitelist">Whitelist</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SASE Platform</label>
                  <input className="input-base" placeholder="e.g. Zscaler" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Linked Ticket</label>
                <input className="input-base" placeholder="e.g. SEC-890" value={formData.linkedTicket} onChange={e => setFormData({...formData, linkedTicket: e.target.value})} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" type="submit" icon={Check} disabled={loading}>{loading ? 'Saving...' : 'Save Rule'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SaseRulesLog;
