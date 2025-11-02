import katex from 'katex';
import './style.css';

interface TermInfo {
  name: string;
  description: string;
  class: string;
}

const termInfoMap: Record<string, TermInfo> = {
  'imaginary-unit': {
    name: 'Imaginary unit i',
    description: 'Indicates the quantum nature of the equation and ensures unitary time evolution',
    class: 'term-imaginary',
  },
  'hbar-time': {
    name: 'Reduced Planck constant ℏ',
    description: 'Fundamental constant connecting energy and frequency (ℏ ≈ 1.055 × 10⁻³⁴ J·s)',
    class: 'term-hbar',
  },
  'time-derivative': {
    name: 'Time derivative ∂ψ/∂t',
    description: 'Rate of change of the wavefunction with respect to time',
    class: 'term-time-deriv',
  },
  'kinetic-coeff': {
    name: 'Kinetic energy coefficient -ℏ²/2m',
    description: 'Kinetic energy operator coefficient, where m is the particle mass',
    class: 'term-kinetic-coeff',
  },
  'spatial-derivative': {
    name: 'Spatial derivative ∂²ψ/∂x²',
    description: 'Second derivative describing spatial curvature of the wavefunction (Laplacian)',
    class: 'term-spatial-deriv',
  },
  'potential': {
    name: 'Potential energy V(x)',
    description: 'External potential energy as a function of position',
    class: 'term-potential',
  },
  'wavefunction-rhs': {
    name: 'Wavefunction ψ',
    description: 'Complex-valued quantum state describing the particle',
    class: 'term-wavefunction',
  },
};

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

  setupHoverEffects();
}

function setupHoverEffects() {
  const explanationDiv = document.getElementById('explanation');
  if (!explanationDiv) return;

  // Get all elements with term classes
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
      // Add active class to all elements with the same term class
      document.querySelectorAll(`.${termClass}`).forEach((el) => {
        el.classList.add('term-active');
      });

      // Update explanation text
      explanationDiv.innerHTML = `
        <h3>${termInfo.name}</h3>
        <p>${termInfo.description}</p>
      `;
      explanationDiv.classList.add('visible');
    });

    element.addEventListener('mouseleave', () => {
      // Remove active class
      document.querySelectorAll(`.${termClass}`).forEach((el) => {
        el.classList.remove('term-active');
      });

      // Reset explanation
      explanationDiv.innerHTML = `
        <p>The 1D time-dependent Schrödinger equation describes how a quantum wavefunction evolves over time.</p>
      `;
      explanationDiv.classList.remove('visible');
    });

    // Add hover cursor
    (element as HTMLElement).style.cursor = 'pointer';
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderSchrodingerEquation();
});
