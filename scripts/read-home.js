const fs = require('fs');
const path = require('path');

const targetFile = 'src/app/[locale]/(public)/page.js';

// Read current file to preserve data fetching logic
const currentFile = fs.readFileSync(targetFile, 'utf8');

// Extract key parts from current file
const uniqueByIdMatch = currentFile.match(/const uniqueById[\s\S]*?^};/m);
const pickImageMatch = currentFile.match(/const pickImage[\s\S]*?^};/m);

console.log('Found uniqueById:', !!uniqueByIdMatch);
console.log('Found pickImage:', !!pickImageMatch);
console.log('Current file size:', currentFile.length, 'lines:', currentFile.split('\n').length);

// Show first 10 lines of current file
console.log('\nFirst 10 lines:');
currentFile.split('\n').slice(0, 10).forEach((l, i) => console.log((i+1).toString().padStart(3), l.substring(0, 80)));
