// Consolidated LaTeX export tests with multiple fixtures
import { parseContent } from '../../src/parser';
import { exportToLaTeX } from '../../src/export';
import { viridisScheme, viridis10Scheme, runChecks, reportTestResults } from '../test-utils';
import type { ColorScheme } from '../../src/export';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';

// Test fixtures
interface LatexTestFixture {
  name: string;
  markdown: string | (() => string);
  colorScheme: ColorScheme;
  outputFile: string;
}

const fixtures: LatexTestFixture[] = [
  {
    name: 'Synthetic E=mc²',
    markdown: `# Energy-mass equivalence

$$
\\mark[energy]{E} = \\mark[mass]{m}\\mark[speed]{c}^2
$$

## Description

The [energy]{.energy} of a body is equal to its [mass]{.mass} times the [speed of light]{.speed} squared.

## .energy
Energy of the body

## .mass
Rest mass of the body

## .speed
Speed of light in vacuum ($c \\approx 3 \\times 10^8$ m/s)
`,
    colorScheme: viridisScheme,
    outputFile: './test-output/test-synthetic.tex',
  },
  {
    name: "Euler's Identity",
    markdown: () => readFileSync('./public/examples/euler.md', 'utf-8'),
    colorScheme: viridisScheme,
    outputFile: './test-output/test-euler.tex',
  },
  {
    name: "Maxwell's Equations",
    markdown: () => readFileSync('./public/examples/maxwell.md', 'utf-8'),
    colorScheme: viridis10Scheme,
    outputFile: './test-output/test-maxwell.tex',
  },
];

async function testLatexFixture(fixture: LatexTestFixture) {
  console.log(`\n=== Testing ${fixture.name} ===`);

  const markdown = typeof fixture.markdown === 'function' ? fixture.markdown() : fixture.markdown;
  const parsed = await parseContent(markdown);
  console.log(`  Title: ${parsed.title}`);
  console.log(`  Terms: ${parsed.termOrder.length}`);

  const latex = exportToLaTeX(parsed, fixture.colorScheme);

  // Validation checks
  const checks = [
    { name: 'Document class', test: () => latex.includes('\\documentclass{article}') },
    { name: 'Uses xcolor', test: () => latex.includes('\\usepackage{xcolor}') },
    { name: 'Uses amsmath', test: () => latex.includes('\\usepackage{amsmath}') },
    { name: 'Title present', test: () => latex.includes(`\\title{${parsed.title}}`) },
    { name: 'Defines colors', test: () => latex.includes('\\definecolor{term') },
    { name: 'Uses textcolor', test: () => latex.includes('\\textcolor{term') },
    { name: 'No inline hex colors', test: () => !latex.match(/#[a-fA-F0-9]{6}/) },
    { name: 'Equation environment', test: () => latex.includes('\\begin{equation}') },
    { name: 'Description section', test: () => latex.includes('\\section*{Description}') },
    { name: 'Definitions section', test: () => latex.includes('\\section*{Definitions}') },
    {
      name: 'Equation not empty',
      test: () => {
        const eqMatch = latex.match(/\\begin\{equation\}(.+?)\\end\{equation\}/s);
        return eqMatch && eqMatch[1].trim().length > 0;
      },
    },
    { name: 'No htmlClass', test: () => !latex.includes('\\htmlClass') },
  ];

  const { passed } = runChecks(checks);

  // Write output
  mkdirSync('./test-output', { recursive: true });
  writeFileSync(fixture.outputFile, latex);
  console.log(`  Output: ${fixture.outputFile}`);

  return { passed, total: checks.length };
}

async function runAllLatexTests() {
  console.log('Testing LaTeX export with multiple fixtures...\n');

  let totalPassed = 0;
  let totalChecks = 0;

  for (const fixture of fixtures) {
    const result = await testLatexFixture(fixture);
    totalPassed += result.passed;
    totalChecks += result.total;
  }

  console.log(`\n${'='.repeat(50)}`);
  reportTestResults(totalPassed, totalChecks, 'LaTeX export (all fixtures)');
}

runAllLatexTests().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
