#!/usr/bin/env tsx
// Test script for HTML export with validation

import { readFileSync, writeFileSync } from 'fs';
import { parseContent } from './src/parser.js';
import { exportToHTML } from './src/exporter.js';

// Load test equation
const markdown = readFileSync('./public/examples/euler.md', 'utf-8');

// Parse content
const parsed = parseContent(markdown);

console.log('Parsed content:');
console.log('- Title:', parsed.title);
console.log('- Terms:', parsed.termOrder.join(', '));
console.log('- Errors:', parsed.errors.length);
console.log('- Warnings:', parsed.warnings.length);

if (parsed.errors.length > 0) {
  console.error('✗ Errors found:', parsed.errors);
  process.exit(1);
}

// Test color scheme
const colorScheme = {
  name: 'Vibrant',
  colors: [
    '#8b5cf6', '#10b981', '#ec4899', '#3b82f6', '#06b6d4',
  ],
};

// Export to HTML
try {
  const html = exportToHTML(parsed, colorScheme);

  // Validate HTML structure
  const checks = [
    { test: html.includes('<!DOCTYPE html>'), msg: 'DOCTYPE declaration' },
    { test: html.includes('<html lang="en">'), msg: 'HTML lang attribute' },
    { test: html.includes('katex.min.css'), msg: 'KaTeX CSS' },
    { test: !html.includes('katex.min.js'), msg: 'No KaTeX JS (pre-rendered)' },
    { test: !html.includes('auto-render'), msg: 'No auto-render (pre-rendered)' },
    { test: html.includes('class="katex"'), msg: 'Rendered KaTeX HTML (class="katex")' },
    { test: html.includes('<math'), msg: 'MathML output' },
    { test: html.includes('<semantics>'), msg: 'MathML semantics' },
    { test: html.includes('<title>') && (parsed.title ? html.includes('Euler') : true), msg: 'Title present' },
    { test: html.includes('term-exponential') && html.includes('term-imaginary'), msg: 'Term classes present for interactivity' },
    { test: !html.includes('$$'), msg: 'No LaTeX delimiters (pre-rendered)' },
    { test: html.includes('mspace'), msg: 'MathML elements present' },
    { test: html.includes('hover-explanation'), msg: 'Hover explanation div' },
    { test: html.includes('addEventListener'), msg: 'Interactive JavaScript' },
    { test: html.includes('term-active'), msg: 'Hover effect classes' },
    { test: html.includes('term-clicked'), msg: 'Click effect classes' },
  ];

  let failed = false;
  console.log('\nValidating HTML structure:');
  for (const check of checks) {
    if (check.test) {
      console.log(`✓ ${check.msg}`);
    } else {
      console.error(`✗ ${check.msg}`);
      failed = true;
    }
  }

  if (failed) {
    console.error('\n✗ HTML validation failed');
    process.exit(1);
  }

  // Write to temp file
  writeFileSync('/tmp/test-export.html', html);

  console.log('\n✓ HTML export successful!');
  console.log('✓ Written to /tmp/test-export.html');
  console.log('\nOpen it with: open /tmp/test-export.html');
  console.log('Check the browser console for any errors!');
} catch (error) {
  console.error('✗ Export failed:', error);
  process.exit(1);
}
