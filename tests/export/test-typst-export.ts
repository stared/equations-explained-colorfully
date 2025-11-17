// Test Typst export with tex2typst
import { parseContent } from '../../src/parser';
import { exportToTypst } from '../../src/exporter';
import { vibrantScheme, runChecks, reportTestResults } from '../test-utils';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

async function testTypstExport() {
  console.log('Testing Typst export with tex2typst...\n');

  // Load Euler's identity equation
  const markdown = readFileSync('./public/examples/euler.md', 'utf-8');
  const parsed = await parseContent(markdown);
  console.log('✓ Content loaded successfully');
  console.log(`  Title: ${parsed.title}`);
  console.log(`  Terms: ${parsed.termOrder.join(', ')}`);
  console.log(`  Definitions: ${parsed.definitions.size}\n`);

  // Generate Typst export
  const typst = exportToTypst(parsed, vibrantScheme);
  console.log('✓ Typst export generated successfully\n');

  // Validation checks
  const checks = [
    { name: 'Document settings', test: () => typst.includes('#set document') },
    { name: 'Page settings', test: () => typst.includes('#set page') },
    { name: 'Title present', test: () => typst.includes('Euler') },
    { name: 'Equation section', test: () => typst.includes('== Equation') },
    { name: 'Math mode equation', test: () => typst.includes('$') },
    {
      name: 'Colored text (rgb)',
      test: () => typst.includes('rgb(') || typst.includes('#text(fill:'),
    },
    { name: 'Description section', test: () => typst.includes('== Description') },
    { name: 'Definitions section', test: () => typst.includes('== Definitions') },
    { name: 'No \\htmlClass', test: () => !typst.includes('\\htmlClass') },
    { name: 'No LaTeX \\frac', test: () => !typst.includes('\\frac') },
    {
      name: 'Typst math syntax',
      test: () => typst.includes('frac(') || typst.includes('/') || typst.includes('e^'),
    },
    { name: 'Link to project', test: () => typst.includes('Equations Explained Colorfully') },
  ];

  const { passed, failed } = runChecks(checks);

  // Write to file for manual inspection
  const outputPath = './test-output/test-euler.typ';
  mkdirSync('./test-output', { recursive: true });
  writeFileSync(outputPath, typst);
  console.log(`Typst output written to: ${outputPath}`);
  console.log('You can compile it with: typst compile ./test-output/test-euler.typ\n');

  // Show first few lines
  console.log('First 50 lines of Typst output:');
  console.log('---');
  console.log(typst.split('\n').slice(0, 50).join('\n'));
  console.log('...\n');

  reportTestResults(passed, checks.length, 'Typst export');
}

testTypstExport().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
