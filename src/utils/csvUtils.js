export const downloadCsvTemplate = (headers, filename) => {
  const csvContent = headers.join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCsvFile = (file, expectedHeaders) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) {
          throw new Error("File is empty.");
        }

        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate headers loosely
        const isValid = expectedHeaders.every(expected => 
          headers.some(h => h.toLowerCase() === expected.toLowerCase())
        );

        if (!isValid) {
          throw new Error(`Invalid CSV format. Expected headers: ${expectedHeaders.join(', ')}`);
        }

        const dataObjects = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj = {};
          expectedHeaders.forEach((key, index) => {
             // Basic key mapping matching expected headers order to data
             // A true robust CSV parser handles quoted commas, this is a basic naive variant for demo
             obj[key] = values[index] || '';
          });
          dataObjects.push(obj);
        }
        resolve(dataObjects);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };

    reader.readAsText(file);
  });
};
