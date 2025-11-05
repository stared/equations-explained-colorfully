#!/usr/bin/env node
// Build-time content validation script
import { readFileSync, readdirSync } from 'fs';
import { parseContent } from '../src/parser.js';

console.log('Validating equation files...');

let hasErrors = false;

// Load equations list
const equationsJson = readFileSync('./public/examples/equations.json', 'utf-8');
const equations = JSON.parse(equationsJson);

// Validate each equation file
for (const equation of equations) {
  const filePath = `./public/examples/${equation.file}`;
  console.log(`\nChecking ${equation.title} (${equation.file})...`);

  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = parseContent(content);
    console.log(`  ✓ ${parsed.termOrder.length} terms found`);
  } catch (error) {
    console.error(`  ✗ Validation failed:`);
    if (error instanceof Error) {
      console.error(`    ${error.message}`);
    } else {
      console.error(`    ${error}`);
    }
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n✗ Some equations failed validation');
  process.exit(1);
} else {
  console.log('\n✓ All equations validated successfully');
  process.exit(0);
}
