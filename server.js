const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Create an Express application
const app = express();

// Enable CORS so the front‑end can call the API locally.
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer to store uploaded files in a temporary folder
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Aggregate packaging weights by material.
 *
 * CSV columns should include at least `packaging_material` and `weight_grams`.
 * If those columns are not present, the function attempts to use
 * `packaging` or `material` and `weight` as fallbacks.
 *
 * @param {string} filePath Path to the uploaded CSV file
 * @returns {Promise<object>} Object mapping material names to total grams
 */
function aggregatePackaging(filePath) {
  return new Promise((resolve, reject) => {
    const totals = {};
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const material = row.packaging_material || row.packaging || row.material || 'unknown';
        const weight = parseFloat(row.weight_grams || row.weight || 0);
        if (!totals[material]) totals[material] = 0;
        if (!isNaN(weight)) totals[material] += weight;
      })
      .on('end', () => resolve(totals))
      .on('error', (err) => reject(err));
  });
}

// Endpoint for CSV uploads.  The uploaded file is parsed and aggregated.
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Make sure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const totals = await aggregatePackaging(filePath);
    // Remove the temporary file
    fs.unlink(filePath, () => {});
    res.json({ totals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`PakkausPro MVP server listening on port ${port}`);
});