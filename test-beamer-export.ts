// Test Beamer export with TikZ arrows
import { parseContent } from './src/parser';
import { exportToBeamer } from './src/exporter';
import type { ColorScheme } from './src/exporter';
import { writeFileSync, readFileSync } from 'fs';

// Test color scheme
const colorScheme: ColorScheme = {
  name: 'vibrant',
  colors: ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231'],
};

async function testBeamerExport() {
  console.log('Testing Beamer export with TikZ arrows...\n');

  // Load Euler's identity equation
  const markdown = readFileSync('./public/examples/euler.md', 'utf-8');
  const parsed = await parseContent(markdown);
  console.log('✓ Content loaded successfully');
  console.log(`  Title: ${parsed.title}`);
  console.log(`  Terms: ${parsed.termOrder.join(', ')}`);
  console.log(`  Definitions: ${parsed.definitions.size}\n`);

  // Generate Beamer export
  const beamer = exportToBeamer(parsed, colorScheme);
  console.log('✓ Beamer export generated successfully\n');

  // Validation checks
  const checks = [
    { name: 'Document class', test: () => beamer.includes('\\documentclass{beamer}') },
    { name: 'TikZ package', test: () => beamer.includes('\\usepackage{tikz}') },
    { name: 'TikZ libraries', test: () => beamer.includes('\\usetikzlibrary{arrows,shapes}') },
    { name: 'Remember picture style', test: () => beamer.includes('remember picture') },
    { name: 'xcolor package', test: () => beamer.includes('\\usepackage{xcolor}') },
    { name: 'Color definitions', test: () => beamer.includes('\\definecolor{term') },
    { name: 'TikZ nodes in equation', test: () => beamer.includes('\\tikz[na] \\node[coordinate]') },
    { name: 'Colored equation terms', test: () => beamer.includes('\\textcolor{term') },
    { name: 'No \\htmlClass', test: () => !beamer.includes('\\htmlClass') },
    { name: 'Title frame', test: () => beamer.includes('\\titlepage') },
    { name: 'Equation frame', test: () => beamer.includes('\\begin{frame}{Equation}') },
    { name: 'Description list', test: () => beamer.includes('\\begin{description}') },
    { name: 'TikZ overlay', test: () => beamer.includes('\\begin{tikzpicture}[overlay]') },
    { name: 'Arrows with colors', test: () => beamer.includes('\\path[->') && beamer.includes('term') },
    { name: 'Bend left/right', test: () => beamer.includes('bend left') || beamer.includes('bend right') },
    { name: 'Equation not empty', test: () => {
      const eqMatch = beamer.match(/\\begin\{equation\}(.+?)\\end\{equation\}/s);
      return eqMatch && eqMatch[1].trim().length > 0;
    }},
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
  const outputPath = '/tmp/test-euler-beamer.tex';
  writeFileSync(outputPath, beamer);
  console.log(`Beamer output written to: ${outputPath}`);
  console.log('Compile with: pdflatex /tmp/test-euler-beamer.tex');
  console.log('Note: Run pdflatex TWICE for TikZ arrows to work correctly\n');

  // Show first few lines
  console.log('First 50 lines of Beamer output:');
  console.log('---');
  console.log(beamer.split('\n').slice(0, 50).join('\n'));
  console.log('...\n');

  if (failed > 0) {
    console.error(`❌ ${failed} checks failed`);
    process.exit(1);
  } else {
    console.log('✅ All checks passed!');
  }
}

testBeamerExport().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
