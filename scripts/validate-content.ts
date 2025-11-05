#!/usr/bin/env node
// Build-time content validation script
import { readFileSync } from 'fs';
import { parseContent } from '../src/parser.js';

console.log('Validating content.md...');

try {
  const content = readFileSync('./public/content.md', 'utf-8');
  const parsed = parseContent(content);
  console.log(`✓ Validation passed: ${parsed.termOrder.length} terms found`);
  process.exit(0);
} catch (error) {
  console.error('✗ Validation failed:');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
