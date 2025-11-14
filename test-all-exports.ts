// Test all export formats to verify color definitions
import { parseContent } from './src/parser';
import { exportToHTML, exportToLaTeX, exportToBeamer, exportToTypst } from './src/exporter';
import type { ColorScheme } from './src/exporter';
import { readFileSync, writeFileSync } from 'fs';

const colorScheme: ColorScheme = {
  name: 'vibrant',
  colors: ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231'],
};

async function testAllExports() {
  console.log('Testing all export formats for proper color definitions...\n');

  const markdown = readFileSync('./public/examples/euler.md', 'utf-8');
  const parsed = await parseContent(markdown);

  let totalPassed = 0;
  let totalFailed = 0;

  // Test HTML
  console.log('=== HTML Export ===');
  const html = exportToHTML(parsed, colorScheme);
  writeFileSync('/tmp/test-euler.html', html);

  const htmlChecks = [
    { name: 'Defines CSS custom properties', test: () => html.includes('--term-exponential:') },
    { name: 'References variables in classes', test: () => html.includes('color: var(--term-') },
    { name: 'No inline hex in term CSS', test: () => !html.match(/\.term-\w+\s*\{\s*color:\s*#[a-fA-F0-9]{6}/) },
  ];

  htmlChecks.forEach(check => {
    if (check.test()) {
      console.log(`  ✓ ${check.name}`);
      totalPassed++;
    } else {
      console.log(`  ✗ ${check.name}`);
      totalFailed++;
    }
  });
  console.log();

  // Test LaTeX
  console.log('=== LaTeX Export ===');
  const latex = exportToLaTeX(parsed, colorScheme);
  writeFileSync('/tmp/test-euler.tex', latex);

  const latexChecks = [
    { name: 'Defines colors with \\definecolor', test: () => latex.includes('\\definecolor{termexponential}') },
    { name: 'References colors with \\textcolor', test: () => latex.includes('\\textcolor{termexponential}') },
    { name: 'No inline hex in equation', test: () => {
      // Extract equation section
      const eqMatch = latex.match(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/);
      if (!eqMatch) return false;
      // Should not have bare hex colors like #e6194B in equation
      return !eqMatch[1].match(/#[a-fA-F0-9]{6}/);
    }},
  ];

  latexChecks.forEach(check => {
    if (check.test()) {
      console.log(`  ✓ ${check.name}`);
      totalPassed++;
    } else {
      console.log(`  ✗ ${check.name}`);
      totalFailed++;
    }
  });
  console.log();

  // Test Beamer
  console.log('=== Beamer Export ===');
  const beamer = exportToBeamer(parsed, colorScheme);
  writeFileSync('/tmp/test-euler-beamer.tex', beamer);

  const beamerChecks = [
    { name: 'Defines colors with \\definecolor', test: () => beamer.includes('\\definecolor{termexponential}') },
    { name: 'References colors with \\textcolor', test: () => beamer.includes('\\textcolor{termexponential}') },
    { name: 'No inline hex in frames', test: () => {
      // Extract frame sections
      const frameMatch = beamer.match(/\\begin\{frame\}([\s\S]*?)\\end\{frame\}/);
      if (!frameMatch) return true; // No frame found, pass
      // Should not have bare hex colors in frames
      return !frameMatch[1].match(/#[a-fA-F0-9]{6}/);
    }},
  ];

  beamerChecks.forEach(check => {
    if (check.test()) {
      console.log(`  ✓ ${check.name}`);
      totalPassed++;
    } else {
      console.log(`  ✗ ${check.name}`);
      totalFailed++;
    }
  });
  console.log();

  // Test Typst
  console.log('=== Typst Export ===');
  const typst = exportToTypst(parsed, colorScheme);
  writeFileSync('/tmp/test-euler.typ', typst);

  const typstChecks = [
    { name: 'Defines colors with #let', test: () => typst.includes('#let termexponential = rgb(') },
    { name: 'References color variables', test: () => typst.includes('fill: termexponential') },
    { name: 'No inline rgb("#hex") in equation', test: () => {
      // Extract equation section
      const eqMatch = typst.match(/== Equation\s+([\s\S]*?)== Description/);
      if (!eqMatch) return false;
      // Should not have rgb("#hex") in equation
      return !eqMatch[1].match(/rgb\("#[a-fA-F0-9]{6}"\)/);
    }},
  ];

  typstChecks.forEach(check => {
    if (check.test()) {
      console.log(`  ✓ ${check.name}`);
      totalPassed++;
    } else {
      console.log(`  ✗ ${check.name}`);
      totalFailed++;
    }
  });
  console.log();

  // Summary
  console.log('=== Summary ===');
  console.log(`Total checks: ${totalPassed + totalFailed}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log();

  if (totalFailed > 0) {
    console.error('❌ Some checks failed');
    process.exit(1);
  } else {
    console.log('✅ All export formats correctly define and reference colors!');
    console.log();
    console.log('Output files:');
    console.log('  - /tmp/test-euler.html (HTML)');
    console.log('  - /tmp/test-euler.tex (LaTeX)');
    console.log('  - /tmp/test-euler-beamer.tex (Beamer)');
    console.log('  - /tmp/test-euler.typ (Typst)');
  }
}

testAllExports().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
