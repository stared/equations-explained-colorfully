// Consolidated Beamer export tests with multiple fixtures
import { parseContent } from '../../src/utils/parser';
import { exportToBeamer } from '../../src/export';
import { vibrantScheme, vibrant10Scheme, runChecks, reportTestResults } from '../test-utils';
import type { ColorScheme } from '../../src/export';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';

// Test fixtures
interface BeamerTestFixture {
  name: string;
  file: string;
  colorScheme: ColorScheme;
  outputFile: string;
}

const fixtures: BeamerTestFixture[] = [
  {
    name: "Euler's Identity",
    file: './src/examples/euler.md',
    colorScheme: vibrantScheme,
    outputFile: './test-output/test-euler-beamer.tex',
  },
  {
    name: "Maxwell's Equations",
    file: './src/examples/maxwell.md',
    colorScheme: vibrant10Scheme,
    outputFile: './test-output/test-maxwell-beamer.tex',
  },
];

async function testBeamerFixture(fixture: BeamerTestFixture) {
  console.log(`\n=== Testing ${fixture.name} ===`);

  const markdown = readFileSync(fixture.file, 'utf-8');
  const parsed = await parseContent(markdown);
  console.log(`  Title: ${parsed.title}`);
  console.log(`  Terms: ${parsed.termOrder.length}`);

  const beamer = exportToBeamer(parsed, fixture.colorScheme);

  // Validation checks
  const checks = [
    { name: 'Beamer document class', test: () => beamer.includes('\\documentclass{beamer}') },
    { name: 'TikZ library loaded', test: () => beamer.includes('\\usepackage{tikz}') },
    { name: 'Title frame', test: () => beamer.includes('\\begin{frame}\n\\titlepage') },
    { name: 'Overview frame', test: () => beamer.includes('[label=overview]') },
    { name: 'Definition frames', test: () => beamer.includes('[label=term') },
    { name: 'Color definitions', test: () => beamer.includes('\\definecolor{term') },
    {
      name: 'Colored text',
      test: () => beamer.includes('\\textcolor{term') && !beamer.match(/\\textcolor\{#[a-fA-F0-9]{6}\}/),
    },
    { name: 'TikZ coordinates in equation', test: () => beamer.includes('\\tikz[baseline,remember picture,overlay]') },
    { name: 'Block environment', test: () => beamer.includes('\\begin{block}{}') },
    {
      name: 'TikZ overlay with remember picture',
      test: () => beamer.includes('\\begin{tikzpicture}[overlay,remember picture]'),
    },
    { name: 'Arrows with colors', test: () => beamer.includes('\\draw[->,term') },
    { name: 'Rounded corners arrows', test: () => beamer.includes('rounded corners') },
    {
      name: 'Equation not empty',
      test: () => {
        const eqMatch = beamer.match(/\\begin\{equation\*\}(.+?)\\end\{equation\*\}/s);
        return eqMatch && eqMatch[1].trim().length > 0;
      },
    },
  ];

  const { passed } = runChecks(checks);

  // Write output
  mkdirSync('./test-output', { recursive: true });
  writeFileSync(fixture.outputFile, beamer);
  console.log(`  Output: ${fixture.outputFile}`);

  return { passed, total: checks.length };
}

async function runAllBeamerTests() {
  console.log('Testing Beamer export with multiple fixtures...\n');

  let totalPassed = 0;
  let totalChecks = 0;

  for (const fixture of fixtures) {
    const result = await testBeamerFixture(fixture);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  console.log(`\n${'='.repeat(50)}`);
  reportTestResults(totalPassed, totalChecks, 'Beamer export (all fixtures)');
}

runAllBeamerTests().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
