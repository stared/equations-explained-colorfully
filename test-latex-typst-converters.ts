// Comprehensive test of LaTeX-to-Typst conversion libraries
import { tex2typst } from 'tex2typst';
import { texToTypst } from 'tex-to-typst';

interface TestCase {
  name: string;
  latex: string;
  notes?: string;
}

const testCases: TestCase[] = [
  // Basic math from project examples
  {
    name: 'Euler exponent',
    latex: 'e^{i\\pi}',
    notes: 'From euler.md'
  },
  {
    name: 'Partial derivative',
    latex: '\\frac{\\partial\\psi}{\\partial t}',
    notes: 'From schrodinger.md'
  },
  {
    name: 'Nabla dot product',
    latex: '\\nabla \\cdot \\vec{E}',
    notes: 'From maxwell.md'
  },
  {
    name: 'Fraction with epsilon',
    latex: '\\frac{\\rho}{\\varepsilon_0}',
    notes: 'From maxwell.md'
  },

  // Test \htmlClass (project-specific)
  {
    name: 'htmlClass wrapper',
    latex: '\\htmlClass{term-exponential}{e}',
    notes: 'Parser output format'
  },
  {
    name: 'htmlClass with nested',
    latex: '\\htmlClass{term-exponential}{e}^{\\htmlClass{term-imaginary}{i}\\htmlClass{term-pi}{\\pi}}',
    notes: 'Real parsed equation from euler.md'
  },

  // Test color commands
  {
    name: 'textcolor command',
    latex: '\\textcolor{red}{x}',
    notes: 'Standard LaTeX color'
  },
  {
    name: 'textcolor with math',
    latex: '\\textcolor{blue}{\\frac{1}{2}}',
    notes: 'Color around fraction'
  },

  // Complex expressions
  {
    name: 'Square root',
    latex: '\\sqrt{v}',
    notes: 'Basic root'
  },
  {
    name: 'Sum notation',
    latex: '\\sum_{i=1}^{n} i',
    notes: 'Summation'
  },
  {
    name: 'Nested fractions',
    latex: '\\frac{1}{\\frac{2}{3}}',
    notes: 'Fraction in denominator'
  },

  // Greek letters
  {
    name: 'Greek letters',
    latex: '\\alpha + \\beta = \\gamma',
    notes: 'Common greek'
  },
  {
    name: 'Hbar',
    latex: '\\hbar',
    notes: 'Reduced Planck constant'
  },

  // Operators
  {
    name: 'Integral',
    latex: '\\int_0^{\\infty} f(x) dx',
    notes: 'Definite integral'
  },

  // Special cases
  {
    name: 'Equals sign',
    latex: 'a = b',
    notes: 'Simple equality'
  },
  {
    name: 'Approximate',
    latex: 'e \\approx 2.71828',
    notes: 'Approximation symbol'
  }
];

function runTests() {
  console.log('\\n='.repeat(50));
  console.log('LATEX-TO-TYPST CONVERTER COMPARISON TEST');
  console.log('='.repeat(50) + '\\n');

  console.log(`Testing ${testCases.length} cases with both libraries:\\n`);

  let tex2typstSuccesses = 0;
  let tex2typstFailures = 0;
  let texToTypstSuccesses = 0;
  let texToTypstFailures = 0;

  testCases.forEach((testCase, index) => {
    console.log(`\\n[${ index + 1}/${testCases.length}] ${testCase.name}`);
    console.log(`  LaTeX:  ${testCase.latex}`);
    if (testCase.notes) {
      console.log(`  Notes:  ${testCase.notes}`);
    }

    // Test tex2typst
    try {
      const result1 = tex2typst(testCase.latex);
      console.log(`  ✓ tex2typst:    ${result1}`);
      tex2typstSuccesses++;
    } catch (error) {
      console.log(`  ✗ tex2typst:    ERROR - ${error}`);
      tex2typstFailures++;
    }

    // Test tex-to-typst
    try {
      const result2 = texToTypst(testCase.latex);
      console.log(`  ✓ tex-to-typst: ${result2.value}`);
      texToTypstSuccesses++;
    } catch (error) {
      console.log(`  ✗ tex-to-typst: ERROR - ${error}`);
      texToTypstFailures++;
    }
  });

  // Summary
  console.log('\\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`\\ntex2typst:    ${tex2typstSuccesses} successes, ${tex2typstFailures} failures`);
  console.log(`tex-to-typst: ${texToTypstSuccesses} successes, ${texToTypstFailures} failures\\n`);

  // Recommendation
  if (tex2typstSuccesses > texToTypstSuccesses) {
    console.log('RECOMMENDATION: Use tex2typst (more successful conversions)');
  } else if (texToTypstSuccesses > tex2typstSuccesses) {
    console.log('RECOMMENDATION: Use tex-to-typst (more successful conversions)');
  } else {
    console.log('RECOMMENDATION: Both libraries performed equally - check output quality');
  }

  console.log('\\n' + '='.repeat(50) + '\\n');
}

// Run the tests
runTests();
