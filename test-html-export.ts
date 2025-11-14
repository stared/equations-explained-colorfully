// Test HTML export with CSS custom properties
import { parseContent } from './src/parser';
import { exportToHTML } from './src/exporter';
import type { ColorScheme } from './src/exporter';
import { readFileSync, writeFileSync } from 'fs';

const colorScheme: ColorScheme = {
  name: 'vibrant',
  colors: ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231'],
};

async function testHTMLExport() {
  console.log('Testing HTML export with CSS custom properties...\n');

  const markdown = readFileSync('./public/examples/euler.md', 'utf-8');
  const parsed = await parseContent(markdown);

  const html = exportToHTML(parsed, colorScheme);
  writeFileSync('/tmp/test-euler.html', html);

  // Extract and show the :root section with color definitions
  const rootMatch = html.match(/:root \{[^}]+\}/s);
  if (rootMatch) {
    console.log('CSS Color Definitions:');
    console.log(rootMatch[0]);
    console.log();
  }

  // Show a sample of term class styles
  const termStyleMatch = html.match(/\.term-exponential[^}]+\}/);
  if (termStyleMatch) {
    console.log('Sample term class:');
    console.log(termStyleMatch[0]);
    console.log();
  }

  // Show a sample of inline styles
  const inlineStyleMatch = html.match(/<span class="term-[^"]+" style="[^"]+\">/);
  if (inlineStyleMatch) {
    console.log('Sample inline style:');
    console.log(inlineStyleMatch[0]);
    console.log();
  }

  // Show a sample definition header
  const defHeaderMatch = html.match(/<h3 style="[^"]+">[^<]+<\/h3>/);
  if (defHeaderMatch) {
    console.log('Sample definition header:');
    console.log(defHeaderMatch[0]);
    console.log();
  }

  // Validation checks
  const checks = [
    { name: 'Has :root with color variables', test: () => html.includes(':root') && html.includes('--term-') },
    { name: 'Defines all term colors as CSS variables', test: () => {
      return parsed.termOrder.every(term => html.includes(`--term-${term}:`));
    }},
    { name: 'No inline hex in term classes CSS', test: () => !html.match(/\.term-\w+\s*\{\s*color:\s*#[a-fA-F0-9]{6}/) },
    { name: 'Uses var() in term classes', test: () => html.includes('color: var(--term-') },
    { name: 'Uses var() in description spans', test: () => html.match(/<span class="term-[^"]+" style="color: var\(--term-/) !== null },
    { name: 'Uses var() in definition headers', test: () => html.match(/<h3 style="color: var\(--term-/) !== null },
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach((check) => {
    try {
      if (check.test()) {
        console.log(`  ✓ ${check.name}`);
        passed++;
      } else {
        console.log(`  ✗ ${check.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ ${check.name} (error: ${error})`);
      failed++;
    }
  });

  console.log(`\n${passed}/${checks.length} checks passed\n`);
  console.log('HTML output written to: /tmp/test-euler.html\n');

  if (failed > 0) {
    console.error(`❌ ${failed} checks failed`);
    process.exit(1);
  } else {
    console.log('✅ All checks passed!');
    console.log('✅ HTML now uses CSS custom properties for all colors');
  }
}

testHTMLExport().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
