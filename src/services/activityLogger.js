import { dataApi } from './csvApi';

export const logActivity = async (user, type, action, details) => {
  if (!user) return; // Cannot log without a user context

  const logEntry = {
    date: new Date().toISOString(),
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    type,       // 'Inventory' or 'UserManagement'
    action,     // 'Add', 'Update', 'Delete', 'Import'
    details     // Specific information about what changed
  };

  try {
    await dataApi.addRow('activity_logs', logEntry);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
