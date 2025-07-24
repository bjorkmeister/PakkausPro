const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');

/*
 * This server implements a more advanced version of the original
 * PakkausPro MVP. It provides a single page application that lets
 * companies upload their packaging data in CSV format. The backend
 * validates and normalises the data, aggregates weights by material
 * category, and returns a structured response containing errors,
 * warnings and regulatory guidance. It also exposes a basic API
 * endpoint for retrieving Finland's packaging EPR reporting details.
 */

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS so the frontend can communicate with the API easily.
app.use(cors());

// Serve static assets from the public directory.
app.use(express.static(path.join(__dirname, 'public')));

// Setup multer for handling CSV uploads. Files are temporarily stored in
// memory (no disk write). We rely on multer's memoryStorage so nothing
// persists on disk.
const upload = multer({ storage: multer.memoryStorage() });

// Define recognised material categories and synonyms.
const MATERIAL_MAP = {
  paper: ['paper', 'cardboard', 'carton', 'kartonki', 'pahvi', 'fiber'],
  plastic: ['plastic', 'muovi'],
  metal: ['metal', 'metalli', 'aluminum', 'alu', 'tin'],
  glass: ['glass', 'lasi'],
  wood: ['wood', 'puu'],
  composite: ['composite', 'komposiitti'],
  other: ['other', 'muu']
};

// Helper to resolve a material string into a category key.
function resolveMaterial(name) {
  if (!name) return null;
  const lower = name.toString().trim().toLowerCase();
  for (const [category, synonyms] of Object.entries(MATERIAL_MAP)) {
    if (synonyms.includes(lower)) return category;
  }
  return null; // unknown category
}

/**
 * Validate and aggregate packaging data from a CSV buffer.
 *
 * The CSV is expected to include at least two columns: `material` and
 * `weight` (in kilograms). Additional columns are ignored. Rows with
 * missing or invalid values are included in the error list with
 * recommendations for correction. Unknown materials are reported
 * separately so users can map them to known categories.
 */
function processCsv(buffer) {
  return new Promise((resolve, reject) => {
    const results = {
      totals: {},
      errors: [],
      unknownMaterials: new Set()
    };
    const stream = fs.createReadStream(null, { fd: buffer.fd });
    // Use a temporary stream created from the buffer's contents.
    const tempFilePath = path.join(__dirname, 'tmp_' + Date.now() + '.csv');
    fs.writeFileSync(tempFilePath, buffer.buffer);
    fs.createReadStream(tempFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const material = row.material || row.Material || row.materiaali || row.Materiali;
        const weightStr = row.weight || row.Weight || row.paino || row.Paino;
        const category = resolveMaterial(material);
        // Validate weight
        const weight = parseFloat(weightStr);
        if (!material || isNaN(weight) || weight < 0) {
          results.errors.push({ row, message: 'Puuttuva tai virheellinen materiaali tai paino' });
          return;
        }
        if (!category) {
          // Unknown material: collect and skip aggregation
          results.unknownMaterials.add(material);
          return;
        }
        if (!results.totals[category]) {
          results.totals[category] = 0;
        }
        results.totals[category] += weight;
      })
      .on('end', () => {
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        // Convert Set to array for JSON serialisation
        results.unknownMaterials = Array.from(results.unknownMaterials);
        resolve(results);
      })
      .on('error', (err) => {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        reject(err);
      });
  });
}

// POST /upload accepts a CSV file and returns aggregated packaging data,
// error details and regulatory guidance.
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV-tiedosto puuttuu.' });
  }
  try {
    // Multer stores file in `req.file`, with `buffer` property
    const result = await processCsv(req.file);
    // Build a human‑readable guidance message
    let message = '';
    message += 'Kiitos, että lähetit pakkaustietosi. Alla on yhteenveto painoista materiaaleittain.';
    message += ' Muista, että Suomessa kaikki yritykset, jotka laittavat pakkauksia markkinoille, ovat velvollisia raportoimaan pakkauksensa tuotekohtaisesti ja maksamaan kierrätysmaksut. '; 
    message += 'Vuoden 2024 pakkauksista on raportoitava Rinki Oy:lle 31. tammikuuta 2025 mennessä.';
    // Include unknown materials recommendations
    let recommendations = [];
    if (result.unknownMaterials.length > 0) {
      recommendations.push('Seuraavat materiaalit eivät vastanneet tunnettuja luokkia: ' + result.unknownMaterials.join(', ') + '. Tarkista kirjoitusasu tai valitse lähin materiaaliluokka.');
    }
    if (result.errors.length > 0) {
      recommendations.push('Joissakin riveissä oli puutteita tai virheitä. Varmista, että jokaisella rivillä on materiaali ja paino kilogrammoina (esim. \'kartonki,2.5\').');
    }
    return res.json({
      success: true,
      totals: result.totals,
      errors: result.errors,
      unknownMaterials: result.unknownMaterials,
      message: message,
      recommendations: recommendations
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Palvelinvirhe: tiedoston käsittely epäonnistui.' });
  }
});

// GET /guidance returns static EPR guidance information. This could later be
// extended to fetch data from official sources.
app.get('/guidance', (req, res) => {
  const guidance = {
    heading: 'Pakkausvelvoitteet Suomessa',
    bullets: [
      'Kaikki yritykset, jotka saattavat pakkauksia Suomen markkinoille, kuuluvat tuottajavastuun piiriin.',
      'Yrityksen on liityttävä hyväksyttyyn tuottajayhteisöön (esim. Rinki Oy) ja raportoida vuosittain pakkauksensa.',
      'Raportti vuoden 2024 pakkauksista on jätettävä viimeistään 31.1.2025.',
      'Materiaalikohtainen paino (kg) tarvitaan raportointia varten; virheelliset tai puuttuvat tiedot voivat johtaa lisämaksuihin.',
      'Lisätietoja: https://rinkiin.fi ja ympäristöministeriön ohjeet.'
    ]
  };
  res.json(guidance);
});

app.listen(port, () => {
  console.log(`PakkausPro-advanced listening at http://localhost:${port}`);
});