// Usage: node chunk-csv-to-json.js
// Place this file in your project root. Run with: node chunk-csv-to-json.js
// Requires: npm install csv-parse fs-extra

import fs from 'fs-extra';
import path from 'path';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Generic function to chunk any CSV by precinct
async function chunkCSVByPrecinctGeneric({
  inputCsv,
  outputDir,
  precinctField,
  precinctNameField,
  filePrefix
}) {
  await fs.ensureDir(outputDir);
  const parser = fs.createReadStream(inputCsv).pipe(parse({ columns: true }));
  const precinctMap = new Map();
  let total = 0;

  for await (const record of parser) {
    const precinct = record[precinctField] || 'unknown';
    if (!precinctMap.has(precinct)) {
      precinctMap.set(precinct, []);
    }
    precinctMap.get(precinct).push(record);
    total++;
  }

  // Write one file per precinct
  for (const [precinct, voters] of precinctMap.entries()) {
    // Use both code and name for filename if available
    let name = '';
    if (precinctNameField && voters[0]?.[precinctNameField]) {
      name = `-${voters[0][precinctNameField].replace(/[^a-zA-Z0-9_-]/g, '')}`;
    }
    const outputPath = path.join(outputDir, `${filePrefix}-precinct-${precinct}${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(voters, null, 2));
  }
  console.log(`Done! ${filePrefix}: Total records: ${total}, Precincts: ${precinctMap.size}`);
}

async function main() {
  // Only run Lorain chunking
  await chunkCSVByPrecinctGeneric({
    inputCsv: path.join(__dirname, 'public', 'LorainMunicipalCourt.csv'),
    outputDir: path.join(__dirname, 'public', 'voters'),
    precinctField: 'PRECINCT_CODE',
    precinctNameField: 'PRECINCT_NAME',
    filePrefix: 'Lorain'
  });
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
