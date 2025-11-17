#!/usr/bin/env tsx
// Test script for HTML export with validation

import { readFileSync } from 'fs';
import { parseContent } from '../../src/parser.js';
import { exportToHTML } from '../../src/exporter.js';
import { vibrantScheme, writeTestFile, runChecks, reportTestResults } from '../test-utils';

// Load test equation
const markdown = readFileSync('./public/examples/euler.md', 'utf-8');
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

// Export to HTML
try {
  const html = exportToHTML(parsed, vibrantScheme);

  // Validate HTML structure
  const checks = [
    { name: 'DOCTYPE declaration', test: () => html.includes('<!DOCTYPE html>') },
    { name: 'HTML lang attribute', test: () => html.includes('<html lang="en">') },
    { name: 'KaTeX CSS', test: () => html.includes('katex.min.css') },
    { name: 'No KaTeX JS (pre-rendered)', test: () => !html.includes('katex.min.js') },
    { name: 'No auto-render (pre-rendered)', test: () => !html.includes('auto-render') },
    { name: 'Rendered KaTeX HTML (class="katex")', test: () => html.includes('class="katex"') },
    { name: 'MathML output', test: () => html.includes('<math') },
    { name: 'MathML semantics', test: () => html.includes('<semantics>') },
    { name: 'Title present', test: () => html.includes('<title>') },
    { name: 'Term classes present for interactivity', test: () => html.includes('term-exponential') },
    { name: 'No LaTeX delimiters (pre-rendered)', test: () => !html.includes('$$') },
    { name: 'MathML elements present', test: () => html.includes('mspace') },
    { name: 'Hover explanation div', test: () => html.includes('hover-explanation') },
    { name: 'Interactive JavaScript', test: () => html.includes('addEventListener') },
    { name: 'Hover effect classes', test: () => html.includes('term-active') },
    { name: 'Click effect classes', test: () => html.includes('term-clicked') },
  ];

  console.log('\nValidating HTML structure:');
  const { passed } = runChecks(checks);

  writeTestFile('test-export.html', html);
  console.log('\nOpen it with: open /tmp/test-export.html');
  console.log('Check the browser console for any errors!');

  reportTestResults(passed, checks.length, 'HTML export');
} catch (error) {
  console.error('✗ Export failed:', error);
  process.exit(1);
}
