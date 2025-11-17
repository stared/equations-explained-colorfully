// Test HTML export with CSS custom properties
import { parseContent } from '../../src/parser';
import { exportToHTML } from '../../src/exporter';
import { vibrantScheme, writeTestFile, runChecks, reportTestResults } from '../test-utils';
import { readFileSync } from 'fs';

async function testHTMLExport() {
  console.log('Testing HTML export with CSS custom properties...\n');

  const markdown = readFileSync('./public/examples/euler.md', 'utf-8');
  const parsed = await parseContent(markdown);

  const html = exportToHTML(parsed, vibrantScheme);
  const filepath = writeTestFile('test-euler.html', html);

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
    {
      name: 'Defines all term colors as CSS variables',
      test: () => parsed.termOrder.every((term) => html.includes(`--term-${term}:`)),
    },
    {
      name: 'No inline hex in term classes CSS',
      test: () => !html.match(/\.term-\w+\s*\{\s*color:\s*#[a-fA-F0-9]{6}/),
    },
    { name: 'Uses var() in term classes', test: () => html.includes('color: var(--term-') },
    {
      name: 'Uses var() in description spans',
      test: () => html.match(/<span class="term-[^"]+" style="color: var\(--term-/) !== null,
    },
    {
      name: 'Uses var() in definition headers',
      test: () => html.match(/<h3 style="color: var\(--term-/) !== null,
    },
  ];

  const { passed, failed } = runChecks(checks);
  console.log(`\nHTML output written to: ${filepath}\n`);

  if (failed === 0) {
    console.log('✅ HTML now uses CSS custom properties for all colors');
  }
  reportTestResults(passed, checks.length, 'HTML export');
}

testHTMLExport().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
