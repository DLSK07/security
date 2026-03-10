const API_BASE = '/api';

class CsvApi {
  async getTable(tableName) {
    const response = await fetch(`${API_BASE}/${tableName}`);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  }

  async addRow(tableName, rowData) {
    const response = await fetch(`${API_BASE}/${tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData)
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  }

  async updateRow(tableName, id, rowData) {
    const response = await fetch(`${API_BASE}/${tableName}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowData)
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  }

  async deleteRow(tableName, id) {
    const response = await fetch(`${API_BASE}/${tableName}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return true;
  }
}

export const dataApi = new CsvApi();
