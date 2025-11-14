// Test LaTeX export functionality
import { parseContent } from './src/parser';
import { exportToLaTeX } from './src/exporter';
import type { ColorScheme } from './src/exporter';
import { writeFileSync } from 'fs';

// Test markdown content (using actual syntax from the parser)
const testMarkdown = `# Energy-mass equivalence

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
`;

// Test color scheme
const colorScheme: ColorScheme = {
  name: 'viridis',
  colors: ['#440154', '#31688e', '#35b779'],
};

async function testLatexExport() {
  console.log('Testing LaTeX export...\n');

  // Parse content
  const parsed = await parseContent(testMarkdown);
  console.log('✓ Content parsed successfully');
  console.log(`  Title: ${parsed.title}`);
  console.log(`  Terms: ${parsed.termOrder.join(', ')}`);
  console.log(`  Definitions: ${parsed.definitions.size}\n`);

  // Generate LaTeX export
  const latex = exportToLaTeX(parsed, colorScheme);
  console.log('✓ LaTeX export generated successfully\n');

  // Validation checks
  const checks = [
    { name: 'Document class', test: () => latex.includes('\\documentclass{article}') },
    { name: 'xcolor package', test: () => latex.includes('\\usepackage{xcolor}') },
    { name: 'amsmath package', test: () => latex.includes('\\usepackage{amsmath}') },
    { name: 'Color definitions', test: () => latex.includes('\\definecolor{termenergy}{HTML}') },
    { name: 'Colored equation terms (energy)', test: () => latex.includes('\\textcolor{termenergy}{E}') },
    { name: 'Colored equation terms (mass)', test: () => latex.includes('\\textcolor{termmass}{m}') },
    { name: 'Colored equation terms (speed)', test: () => latex.includes('\\textcolor{termspeed}{c}') },
    { name: 'No \\htmlClass', test: () => !latex.includes('\\htmlClass') },
    { name: 'Title escaped', test: () => latex.includes('Energy-mass equivalence') },
    { name: 'Description section', test: () => latex.includes('\\section*{Description}') },
    { name: 'Definitions section', test: () => latex.includes('\\section*{Definitions}') },
    { name: 'Colored definition heading', test: () => latex.includes('\\subsection*{\\textcolor{termenergy}{energy}}') },
    { name: 'Escaped LaTeX chars', test: () => !latex.match(/(?<!\\)[&%#_]/) }, // No unescaped special chars
    { name: 'Math mode preserved', test: () => latex.includes('$c \\approx 3 \\times 10^8$') },
    { name: 'Document structure', test: () => latex.includes('\\begin{document}') && latex.includes('\\end{document}') },
    { name: 'Equation environment', test: () => latex.includes('\\begin{equation}') && latex.includes('\\end{equation}') },
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
  const outputPath = '/tmp/test-export.tex';
  writeFileSync(outputPath, latex);
  console.log(`LaTeX output written to: ${outputPath}`);
  console.log('You can compile it with: pdflatex /tmp/test-export.tex\n');

  // Show first few lines
  console.log('First 30 lines of LaTeX output:');
  console.log('---');
  console.log(latex.split('\n').slice(0, 30).join('\n'));
  console.log('...\n');

  if (failed > 0) {
    console.error(`❌ ${failed} checks failed`);
    process.exit(1);
  } else {
    console.log('✅ All checks passed!');
  }
}

testLatexExport().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
