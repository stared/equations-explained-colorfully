// Test Beamer export with TikZ arrows
import { parseContent } from './src/parser';
import { exportToBeamer } from './src/exporter';
import { vibrantScheme, runChecks, reportTestResults } from './tests/test-utils';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

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
  const beamer = exportToBeamer(parsed, vibrantScheme);
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
    { name: 'Equation frametitle', test: () => beamer.includes('\\frametitle{Equation}') },
    { name: 'Block environment', test: () => beamer.includes('\\begin{block}{}') },
    { name: 'TikZ overlay with remember picture', test: () => beamer.includes('\\begin{tikzpicture}[overlay,remember picture]') },
    { name: 'Arrows with colors', test: () => beamer.includes('\\draw[->,term') },
    { name: 'Rounded corners arrows', test: () => beamer.includes('rounded corners') },
    { name: 'Equation not empty', test: () => {
      const eqMatch = beamer.match(/\\begin\{equation\*\}(.+?)\\end\{equation\*\}/s);
      return eqMatch && eqMatch[1].trim().length > 0;
    }},
  ];

  const { passed, failed } = runChecks(checks);

  // Write to file for manual inspection
  const outputPath = './test-output/test-euler-beamer.tex';
  mkdirSync('./test-output', { recursive: true });
  writeFileSync(outputPath, beamer);
  console.log(`\nBeamer output written to: ${outputPath}`);
  console.log('Compile with: pdflatex ./test-output/test-euler-beamer.tex');
  console.log('Note: Run pdflatex TWICE for TikZ arrows to work correctly\n');

  // Show first few lines
  console.log('First 50 lines of Beamer output:');
  console.log('---');
  console.log(beamer.split('\n').slice(0, 50).join('\n'));
  console.log('...\n');

  reportTestResults(passed, checks.length, 'Beamer export');
}

testBeamerExport().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
