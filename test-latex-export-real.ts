// Test LaTeX export with real equation file
import { parseContent } from './src/parser';
import { exportToLaTeX } from './src/exporter';
import type { ColorScheme } from './src/exporter';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';

// Test color scheme
const colorScheme: ColorScheme = {
  name: 'viridis',
  colors: ['#440154', '#31688e', '#35b779', '#fde724', '#20908d', '#5ec962', '#3b528b'],
};

async function testLatexExport() {
  console.log('Testing LaTeX export with real equation file...\n');

  // Load Euler's identity equation
  const markdown = readFileSync('./public/examples/euler.md', 'utf-8');
  const parsed = await parseContent(markdown);
  console.log('✓ Content loaded successfully');
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
    { name: 'Color definitions exist', test: () => latex.includes('\\definecolor{term') },
    { name: 'Colored equation terms', test: () => latex.includes('\\textcolor{term') },
    { name: 'No \\htmlClass', test: () => !latex.includes('\\htmlClass') },
    { name: 'Title present', test: () => latex.includes('Euler') },
    { name: 'Description section', test: () => latex.includes('\\section*{Description}') },
    { name: 'Definitions section', test: () => latex.includes('\\section*{Definitions}') },
    { name: 'Document structure', test: () => latex.includes('\\begin{document}') && latex.includes('\\end{document}') },
    { name: 'Equation environment', test: () => latex.includes('\\begin{equation}') && latex.includes('\\end{equation}') },
    { name: 'Equation not empty', test: () => {
      const eqMatch = latex.match(/\\begin\{equation\}(.+?)\\end\{equation\}/s);
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
  const outputPath = './test-output/test-euler-export.tex';
  mkdirSync('./test-output', { recursive: true });
  writeFileSync(outputPath, latex);
  console.log(`LaTeX output written to: ${outputPath}`);
  console.log('You can compile it with: pdflatex ./test-output/test-euler-export.tex\n');

  // Show first few lines
  console.log('First 40 lines of LaTeX output:');
  console.log('---');
  console.log(latex.split('\n').slice(0, 40).join('\n'));
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
