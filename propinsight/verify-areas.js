// Simple verification script - reads the areas file as text and parses it
const fs = require('fs');
const path = require('path');

const areasFile = path.join(__dirname, 'src/data/areas.ts');
const content = fs.readFileSync(areasFile, 'utf-8');

// Extract all suburb entries
const suburbMatches = content.matchAll(/id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*level:\s*"suburb"/g);

const suburbs = [];
for (const match of suburbMatches) {
  suburbs.push({
    id: match[1],
    name: match[2],
    slug: match[3]
  });
}

console.log('=== Area Verification ===\n');
console.log(`Total suburbs found: ${suburbs.length}\n`);

console.log('All suburbs:');
suburbs.forEach((area, index) => {
  console.log(`  ${index + 1}. ${area.name} (${area.slug})`);
});

// Check for Cape Town suburbs
const capeTownSuburbs = suburbs.filter(s => 
  ['camps-bay', 'sea-point', 'green-point', 'woodstock', 'observatory', 'claremont', 'constantia'].includes(s.slug)
);

console.log(`\nCape Town suburbs: ${capeTownSuburbs.length}`);
capeTownSuburbs.forEach((area, index) => {
  console.log(`  ${index + 1}. ${area.name}`);
});

// First 6 suburbs (what homepage shows)
console.log(`\nFirst 6 suburbs (featuredSuburbs):`);
suburbs.slice(0, 6).forEach((area, index) => {
  console.log(`  ${index + 1}. ${area.name}`);
});

// Verify expected areas
const expected = [
  'Camps Bay',
  'Sea Point', 
  'Green Point',
  'Woodstock',
  'Observatory',
  'Claremont',
  'Constantia'
];

console.log(`\n=== Verification ===`);
let allFound = true;
expected.forEach(name => {
  const found = suburbs.find(s => s.name === name);
  if (found) {
    console.log(`✓ ${name}`);
  } else {
    console.log(`✗ ${name} - MISSING!`);
    allFound = false;
  }
});

console.log(`\n${allFound ? '✓ All expected areas found!' : '✗ Some areas are missing!'}`);
