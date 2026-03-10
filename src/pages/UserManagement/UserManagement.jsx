import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserPlus, Search, Edit2, Trash2, X, Check, Filter, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dataApi } from '../../services/csvApi';
import { logActivity } from '../../services/activityLogger';
import { Button, IconButton, Badge } from '../../components/ui/Buttons';

const roleColors = {
  'Super Admin': 'danger',
  'User': 'success',
  'Viewer': 'info'
};

const UserManagement = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'User', password: ''
  });

  // Security barrier
  if (!isAdmin) {
    return <Navigate to="/software" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    const result = await dataApi.getTable('users');
    setData(result);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item, password: '' }); // Don't show existing password
    } else {
      setEditingItem(null);
      setFormData({
        name: '', email: '', role: 'User', password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const rowData = { ...formData };
    
    // If editing and password is left blank, preserve old password
    if (editingItem && !rowData.password) {
      rowData.password = editingItem.password;
    }

    if (editingItem) {
      await dataApi.updateRow('users', editingItem.id, rowData);
      await logActivity(currentUser, 'UserManagement', 'Update', `Updated user ${rowData.email}`);
    } else {
      await dataApi.addRow('users', rowData);
      await logActivity(currentUser, 'UserManagement', 'Add', `Added new user ${rowData.email}`);
    }
    await loadData();
    handleCloseModal();
    setLoading(false);
  };

  const handleDelete = async (userObj) => {
    if (userObj.isDefault) {
      alert("Cannot delete the default system accounts.");
      return;
    }
    if (userObj.id === currentUser.id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }
    if (window.confirm(`Delete user ${userObj.email}?`)) {
      setLoading(true);
      await dataApi.deleteRow('users', userObj.id);
      await logActivity(currentUser, 'UserManagement', 'Delete', `Deleted user ${userObj.email}`);
      await loadData();
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || item.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="module-container animate-fade-in">
      <div className="module-header flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage portal access, roles, and passwords. (Admin Only)</p>
        </div>
        <Button icon={UserPlus} onClick={() => handleOpenModal()}>Add User</Button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1.5rem', alignItems: 'center' }} className="glass-card">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search name or email..." className="input-base" style={{ paddingLeft: '2.5rem' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={18} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-tertiary)' }} />
          <select className="input-base" style={{ paddingLeft: '2.5rem' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="User">User</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </div>

      <div className="table-container glass-panel">
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>Name & Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No entries found.</td></tr>
              ) : (
                filteredData.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name} {item.id === currentUser?.id ? '(You)' : ''}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.email}</div>
                    </td>
                    <td><Badge variant={roleColors[item.role] || 'neutral'}>{item.role}</Badge></td>
                    <td>
                      {item.isDefault ? 
                        <Badge variant="warning">System</Badge> : 
                        <Badge variant="success">Active</Badge>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <IconButton icon={KeyRound} title="Reset Password / Edit" onClick={() => handleOpenModal(item)} />
                        {!item.isDefault && item.id !== currentUser?.id && (
                           <IconButton icon={Trash2} title="Delete User" onClick={() => handleDelete(item)} />
                        )}
                      </div>
                    </td>
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
              <h2>{editingItem ? 'Edit User' : 'Add New User'}</h2>
              <IconButton icon={X} onClick={handleCloseModal} />
            </div>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name*</label>
                <input required className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={editingItem?.isDefault} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address*</label>
                <input required type="email" className="input-base" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={editingItem?.isDefault} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role*</label>
                <select className="input-base" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} disabled={editingItem?.isDefault}>
                  <option value="Super Admin">Super Admin</option>
                  <option value="User">User</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Super Admins can manage users. Users can edit registry data. Viewers are read-only for limited modules.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {editingItem ? 'New Password (leave blank to keep current)' : 'Password*'}
                </label>
                <input 
                  type="text" 
                  className="input-base" 
                  value={formData.password} 
                  required={!editingItem}
                  placeholder={editingItem ? 'Enter new password to reset...' : 'Create password...'}
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="secondary" type="button" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" type="submit" icon={Check} disabled={loading}>{loading ? 'Saving...' : 'Save User'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default UserManagement;
