import katex from 'katex';
import './style.css';

// Color schemes
interface ColorScheme {
  name: string;
  colors: {
    imaginary: string;
    hbar: string;
    timeDerivative: string;
    kineticCoeff: string;
    spatialDerivative: string;
    potential: string;
    wavefunction: string;
  };
}

const colorSchemes: Record<string, ColorScheme> = {
  vibrant: {
    name: 'Vibrant',
    colors: {
      imaginary: '#9333ea',      // purple
      hbar: '#10b981',           // green
      timeDerivative: '#c026d3',  // magenta
      kineticCoeff: '#3b82f6',   // blue
      spatialDerivative: '#06b6d4', // cyan
      potential: '#f59e0b',       // orange
      wavefunction: '#ef4444',    // red
    },
  },
  pastel: {
    name: 'Pastel',
    colors: {
      imaginary: '#a78bfa',      // light purple
      hbar: '#6ee7b7',           // light green
      timeDerivative: '#e879f9', // light magenta
      kineticCoeff: '#60a5fa',   // light blue
      spatialDerivative: '#22d3ee', // light cyan
      potential: '#fbbf24',      // light orange
      wavefunction: '#f87171',   // light red
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      imaginary: '#7c3aed',      // dark purple
      hbar: '#059669',           // dark green
      timeDerivative: '#a21caf', // dark magenta
      kineticCoeff: '#2563eb',   // dark blue
      spatialDerivative: '#0891b2', // dark cyan
      potential: '#d97706',      // dark orange
      wavefunction: '#dc2626',   // dark red
    },
  },
};

interface TermInfo {
  name: string;
  formula: string;
  description: string;
  class: string;
  plainText: string; // Plain text description for static description
}

const termInfoMap: Record<string, TermInfo> = {
  'imaginary-unit': {
    name: 'Imaginary unit',
    formula: 'i',
    description: 'Indicates the quantum nature of the equation and ensures unitary time evolution',
    class: 'term-imaginary',
    plainText: 'quantum nature',
  },
  'hbar-time': {
    name: 'Reduced Planck constant',
    formula: 'ℏ',
    description: 'Fundamental constant connecting energy and frequency (ℏ ≈ 1.055 × 10⁻³⁴ J·s)',
    class: 'term-hbar',
    plainText: 'a fundamental constant',
  },
  'time-derivative': {
    name: 'Time derivative',
    formula: '∂ψ/∂t',
    description: 'Rate of change of the wavefunction with respect to time',
    class: 'term-time-deriv',
    plainText: 'how the wave changes over time',
  },
  'kinetic-coeff': {
    name: 'Kinetic energy coefficient',
    formula: '-ℏ²/2m',
    description: 'Kinetic energy operator coefficient, where m is the particle mass',
    class: 'term-kinetic-coeff',
    plainText: 'energy from motion',
  },
  'spatial-derivative': {
    name: 'Spatial derivative',
    formula: '∂²ψ/∂x²',
    description: 'Second derivative describing spatial curvature of the wavefunction (Laplacian)',
    class: 'term-spatial-deriv',
    plainText: 'how curved the wave is',
  },
  'potential': {
    name: 'Potential energy',
    formula: 'V(x)',
    description: 'External potential energy as a function of position',
    class: 'term-potential',
    plainText: 'energy from position',
  },
  'wavefunction-rhs': {
    name: 'Wavefunction',
    formula: 'ψ',
    description: 'Complex-valued quantum state describing the particle',
    class: 'term-wavefunction',
    plainText: 'the quantum wave',
  },
};

// Current color scheme
let currentScheme = 'vibrant';

function applyColorScheme(schemeName: string) {
  const scheme = colorSchemes[schemeName];
  if (!scheme) return;

  const root = document.documentElement;
  root.style.setProperty('--color-imaginary', scheme.colors.imaginary);
  root.style.setProperty('--color-hbar', scheme.colors.hbar);
  root.style.setProperty('--color-time-deriv', scheme.colors.timeDerivative);
  root.style.setProperty('--color-kinetic-coeff', scheme.colors.kineticCoeff);
  root.style.setProperty('--color-spatial-deriv', scheme.colors.spatialDerivative);
  root.style.setProperty('--color-potential', scheme.colors.potential);
  root.style.setProperty('--color-wavefunction', scheme.colors.wavefunction);

  currentScheme = schemeName;
}

function renderSchrodingerEquation() {
  const equationContainer = document.getElementById('equation-container');
  if (!equationContainer) return;

  // Using KaTeX with HTML mode to inject classes
  const latex = String.raw`
    \htmlClass{term-imaginary}{i}
    \htmlClass{term-hbar}{\hbar}
    \htmlClass{term-time-deriv}{\frac{\partial\psi}{\partial t}}
    =
    \htmlClass{term-kinetic-coeff}{-\frac{\hbar^2}{2m}}
    \htmlClass{term-spatial-deriv}{\frac{\partial^2\psi}{\partial x^2}}
    +
    \htmlClass{term-potential}{V(x)}
    \htmlClass{term-wavefunction}{\psi}
  `;

  katex.render(latex, equationContainer, {
    displayMode: true,
    trust: true, // Enable \htmlClass
    throwOnError: false,
  });
}

function renderStaticDescription() {
  const staticDescDiv = document.getElementById('static-description');
  if (!staticDescDiv) return;

  staticDescDiv.innerHTML = `
    <p>
      To understand how a quantum system evolves, multiply the <span class="term-imaginary">${termInfoMap['imaginary-unit'].plainText}</span>
      by <span class="term-hbar">${termInfoMap['hbar-time'].plainText}</span>
      by <span class="term-time-deriv">${termInfoMap['time-derivative'].plainText}</span>.
      This equals the <span class="term-kinetic-coeff">${termInfoMap['kinetic-coeff'].plainText}</span>
      of <span class="term-spatial-deriv">${termInfoMap['spatial-derivative'].plainText}</span>,
      plus the <span class="term-potential">${termInfoMap['potential'].plainText}</span>
      acting on <span class="term-wavefunction">${termInfoMap['wavefunction-rhs'].plainText}</span>.
    </p>
  `;
}

function setupHoverEffects() {
  const hoverExplanationDiv = document.getElementById('hover-explanation');
  if (!hoverExplanationDiv) return;

  // Get all elements with term classes (both in equation and static description)
  const termElements = document.querySelectorAll('[class*="term-"]');

  termElements.forEach((element) => {
    const classes = Array.from(element.classList);
    const termClass = classes.find((c) => c.startsWith('term-'));

    if (!termClass) return;

    // Find matching term info
    const termKey = Object.keys(termInfoMap).find(
      (key) => termInfoMap[key].class === termClass
    );

    if (!termKey) return;

    const termInfo = termInfoMap[termKey];

    element.addEventListener('mouseenter', () => {
      // Add active class to all elements with the same term class (just for opacity)
      document.querySelectorAll(`.${termClass}`).forEach((el) => {
        el.classList.add('term-active');
      });

      // Show additional explanation with colored formula
      hoverExplanationDiv.innerHTML = `
        <strong>${termInfo.name} <span class="${termInfo.class}">${termInfo.formula}</span>:</strong> ${termInfo.description}
      `;
      hoverExplanationDiv.classList.add('visible');
    });

    element.addEventListener('mouseleave', () => {
      // Remove active class
      document.querySelectorAll(`.${termClass}`).forEach((el) => {
        el.classList.remove('term-active');
      });

      // Hide additional explanation
      hoverExplanationDiv.classList.remove('visible');
    });

    // Add hover cursor
    (element as HTMLElement).style.cursor = 'pointer';
  });
}

function createColorSchemeSwitcher() {
  const switcherDiv = document.getElementById('color-scheme-switcher');
  if (!switcherDiv) return;

  Object.keys(colorSchemes).forEach((schemeKey) => {
    const button = document.createElement('button');
    button.textContent = colorSchemes[schemeKey].name;
    button.className = schemeKey === currentScheme ? 'active' : '';
    button.addEventListener('click', () => {
      applyColorScheme(schemeKey);
      // Update active button
      switcherDiv.querySelectorAll('button').forEach((btn) => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      // Re-render with new colors
      renderSchrodingerEquation();
      renderStaticDescription();
      // Re-setup hover effects after re-rendering
      setupHoverEffects();
    });
    switcherDiv.appendChild(button);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  applyColorScheme(currentScheme);
  createColorSchemeSwitcher();
  renderSchrodingerEquation();
  renderStaticDescription();
  // Setup hover effects after both renders
  setupHoverEffects();
});
