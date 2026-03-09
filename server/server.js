const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helpers
const getFilePath = (tableName) => path.join(DATA_DIR, `${tableName}.csv`);

const readCsv = (tableName) => {
  return new Promise((resolve, reject) => {
    const filePath = getFilePath(tableName);
    const results = [];
    if (!fs.existsSync(filePath)) {
      return resolve([]);
    }
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const writeCsv = async (tableName, data) => {
  const filePath = getFilePath(tableName);
  if (data.length === 0) {
     fs.writeFileSync(filePath, '');
     return;
  }
  const headers = Object.keys(data[0]).map(key => ({ id: key, title: key }));
  const csvWriter = createCsvWriter({
    path: filePath,
    header: headers
  });
  await csvWriter.writeRecords(data);
};

// --- Endpoints ---

// Get all rows
app.get('/api/:table', async (req, res) => {
  try {
    const data = await readCsv(req.params.table);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a row
app.post('/api/:table', async (req, res) => {
  try {
    const tableName = req.params.table;
    const newRow = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    const data = await readCsv(tableName);
    data.push(newRow);
    await writeCsv(tableName, data);
    res.status(201).json(newRow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a row
app.put('/api/:table/:id', async (req, res) => {
  try {
    const tableName = req.params.table;
    const id = req.params.id;
    const updatedData = req.body;
    let data = await readCsv(tableName);
    const index = data.findIndex(row => row.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Row not found' });
    }
    
    data[index] = { ...data[index], ...updatedData };
    await writeCsv(tableName, data);
    res.json(data[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a row
app.delete('/api/:table/:id', async (req, res) => {
  try {
    const tableName = req.params.table;
    const id = req.params.id;
    let data = await readCsv(tableName);
    const initialLength = data.length;
    
    data = data.filter(row => row.id !== id);
    
    if (data.length === initialLength) {
      return res.status(404).json({ error: 'Row not found' });
    }
    
    await writeCsv(tableName, data);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`CSV Backend Server running on port ${PORT}`);
});
