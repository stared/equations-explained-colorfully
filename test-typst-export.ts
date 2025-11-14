// Test Typst export with tex2typst
import { parseContent } from './src/parser';
import { exportToTypst } from './src/exporter';
import type { ColorScheme } from './src/exporter';
import { writeFileSync, readFileSync } from 'fs';

// Test color scheme
const colorScheme: ColorScheme = {
  name: 'vibrant',
  colors: ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231'],
};

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
  const typst = exportToTypst(parsed, colorScheme);
  console.log('✓ Typst export generated successfully\n');

  // Validation checks
  const checks = [
    { name: 'Document settings', test: () => typst.includes('#set document') },
    { name: 'Page settings', test: () => typst.includes('#set page') },
    { name: 'Title present', test: () => typst.includes('Euler') },
    { name: 'Equation section', test: () => typst.includes('== Equation') },
    { name: 'Math mode equation', test: () => typst.includes('$') },
    { name: 'Colored text (rgb)', test: () => typst.includes('rgb(') || typst.includes('#text(fill:') },
    { name: 'Description section', test: () => typst.includes('== Description') },
    { name: 'Definitions section', test: () => typst.includes('== Definitions') },
    { name: 'No \\htmlClass', test: () => !typst.includes('\\htmlClass') },
    { name: 'No LaTeX \\frac', test: () => !typst.includes('\\frac') },
    { name: 'Typst math syntax', test: () => {
      // Should have Typst-style fractions or operators
      return typst.includes('frac(') || typst.includes('/') || typst.includes('e^');
    }},
    { name: 'Link to project', test: () => typst.includes('Equations Explained Colorfully') },
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

  // Write to file for manual inspection
  const outputPath = './test-output/test-euler.typ';
  writeFileSync(outputPath, typst);
  console.log(`Typst output written to: ${outputPath}`);
  console.log('You can compile it with: typst compile ./test-output/test-euler.typ\n');

  // Show first few lines
  console.log('First 50 lines of Typst output:');
  console.log('---');
  console.log(typst.split('\n').slice(0, 50).join('\n'));
  console.log('...\n');

  if (failed > 0) {
    console.error(`❌ ${failed} checks failed`);
    process.exit(1);
  } else {
    console.log('✅ All checks passed!');
  }
}

testTypstExport().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
