#!/usr/bin/env node
// Build-time content validation script
import { readFileSync, readdirSync } from 'fs';
import { parseContent } from '../src/utils/parser.js';

console.log('Validating equation files...');

let hasErrors = false;

// Scan src/examples directory for markdown files
const examplesDir = './src/examples';
const files = readdirSync(examplesDir).filter(f => f.endsWith('.md'));

console.log(`Found ${files.length} equation files`);

// Validate each equation file
for (const file of files) {
  const filePath = `${examplesDir}/${file}`;
  console.log(`\nChecking ${file}...`);

  try {
    const content = readFileSync(filePath, 'utf-8');
    const parsed = parseContent(content);
    console.log(`  ✓ Title: ${parsed.title || '(no title)'}`);
    console.log(`  ✓ ${parsed.termOrder.length} terms found`);

    if (parsed.errors.length > 0) {
      console.error(`  ✗ Validation errors:`);
      parsed.errors.forEach(err => console.error(`    - ${err}`));
      hasErrors = true;
    }
    if (parsed.warnings.length > 0) {
      parsed.warnings.forEach(warn => console.warn(`  ⚠ ${warn}`));
    }
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
