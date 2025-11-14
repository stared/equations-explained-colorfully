// Test Beamer export with Maxwell's equations
import { parseContent } from './src/parser';
import { exportToBeamer } from './src/exporter';
import type { ColorScheme } from './src/exporter';
import { writeFileSync, readFileSync } from 'fs';

// Test color scheme - Maxwell has 10 terms
const colorScheme: ColorScheme = {
  name: 'vibrant',
  colors: ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'],
};

async function testBeamerExport() {
  console.log('Testing Beamer export with Maxwell equations...\n');

  // Load Maxwell's equations
  const markdown = readFileSync('./public/examples/maxwell.md', 'utf-8');
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
    { name: 'TikZ libraries', test: () => beamer.includes('\\usetikzlibrary{arrows,shapes,calc}') },
    { name: 'Remember picture style', test: () => beamer.includes('remember picture') },
    { name: 'xcolor package', test: () => beamer.includes('\\usepackage{xcolor}') },
    { name: 'Color definitions', test: () => beamer.includes('\\definecolor{term') },
    { name: 'TikZ coordinate nodes', test: () => beamer.includes('\\coordinate (n') },
    { name: 'Colored equation terms', test: () => beamer.includes('\\textcolor{term') },
    { name: 'No \\htmlClass', test: () => !beamer.includes('\\htmlClass') },
    { name: 'Title frame', test: () => beamer.includes('\\titlepage') },
    { name: 'TikZ overlay with remember picture', test: () => beamer.includes('\\begin{tikzpicture}[overlay,remember picture]') },
    { name: 'Equation not empty', test: () => {
      const eqMatch = beamer.match(/\\begin\{equation\*?\}(.+?)\\end\{equation\*?\}/s);
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
  const outputPath = './test-output/test-maxwell-beamer.tex';
  writeFileSync(outputPath, beamer);
  console.log(`Beamer output written to: ${outputPath}`);
  console.log('Compile with: pdflatex ./test-output/test-maxwell-beamer.tex');
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
