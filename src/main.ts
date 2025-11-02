import katex from 'katex';
import './style.css';
import { loadContent, type ParsedContent } from './parser';

// Color schemes - arrays indexed by order of appearance
interface ColorScheme {
  name: string;
  colors: string[];
}

const colorSchemes: Record<string, ColorScheme> = {
  vibrant: {
    name: 'Vibrant',
    colors: ['#8b5cf6', '#10b981', '#ec4899', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444'],
  },
  accessible: {
    name: 'Accessible',
    colors: ['#0072B2', '#E69F00', '#009E73', '#56B4E9', '#CC79A7', '#F0E442', '#D55E00'],
  },
  contrast: {
    name: 'High Contrast',
    colors: ['#0066CC', '#FF6600', '#9933CC', '#00AA88', '#CC0066', '#CCAA00', '#CC3300'],
  },
  nocolor: {
    name: 'No color',
    colors: ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
  },
};

// Current color scheme and loaded content
let currentScheme = 'vibrant';
let parsedContent: ParsedContent | null = null;

function applyColorScheme(schemeName: string) {
  const scheme = colorSchemes[schemeName];
  if (!scheme || !parsedContent) return;

  const root = document.documentElement;

  // Apply colors based on term order from parsed content
  parsedContent.termOrder.forEach((className, index) => {
    const cssVarName = `--color-${className}`;
    const color = scheme.colors[index] || '#000000';
    root.style.setProperty(cssVarName, color);
  });

  currentScheme = schemeName;
}

function renderEquation() {
  const equationContainer = document.getElementById('equation-container');
  if (!equationContainer || !parsedContent) return;

  katex.render(parsedContent.latex, equationContainer, {
    displayMode: true,
    trust: true, // Enable \htmlClass
    throwOnError: false,
  });
}

function renderDescription() {
  const staticDescDiv = document.getElementById('static-description');
  if (!staticDescDiv || !parsedContent) return;

  staticDescDiv.innerHTML = `<p>${parsedContent.description}</p>`;
}

function setupHoverEffects() {
  const hoverExplanationDiv = document.getElementById('hover-explanation');
  if (!hoverExplanationDiv || !parsedContent) return;

  // Get all elements with term classes (both in equation and description)
  const termElements = document.querySelectorAll('[class*="term-"]');

  termElements.forEach((element) => {
    const classes = Array.from(element.classList);
    const termClass = classes.find((c) => c.startsWith('term-'));

    if (!termClass) return;

    // Extract class name (e.g., "term-imaginary" -> "imaginary")
    const className = termClass.replace('term-', '');
    const definition = parsedContent.definitions.get(className);

    if (!definition) return;

    element.addEventListener('mouseenter', () => {
      // Add active class to all elements with the same term class
      document.querySelectorAll(`.${termClass}`).forEach((el) => {
        el.classList.add('term-active');
      });

      // Show definition in hover explanation
      hoverExplanationDiv.innerHTML = definition;
      hoverExplanationDiv.classList.add('visible');
    });

    element.addEventListener('mouseleave', () => {
      // Remove active class
      document.querySelectorAll(`.${termClass}`).forEach((el) => {
        el.classList.remove('term-active');
      });

      // Hide explanation
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
      renderEquation();
      renderDescription();
      // Re-setup hover effects after re-rendering
      setupHoverEffects();
    });
    switcherDiv.appendChild(button);
  });
}

// Initialize - load content and render
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load content from markdown file
    parsedContent = await loadContent('/content.md');

    // Apply initial color scheme
    applyColorScheme(currentScheme);

    // Create color scheme switcher
    createColorSchemeSwitcher();

    // Render content
    renderEquation();
    renderDescription();

    // Setup hover effects after both renders
    setupHoverEffects();
  } catch (error) {
    console.error('Failed to load content:', error);
  }
});
