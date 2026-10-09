import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseContent } from '../../src/utils/parser';
import { exportToLaTeX, exportToBeamer, exportToTypst } from '../../src/export';
import { defaultScheme } from '../../src/utils/colorSchemes';

for (const [format, exporter] of Object.entries({ LaTeX: exportToLaTeX, Beamer: exportToBeamer })) {
  test(`${format}: Euler Unicode minus is exported as a math minus`, () => {
    const content = parseContent(readFileSync('src/examples/euler.md', 'utf8'));
    const output = exporter(content, defaultScheme);
    assert.ok(output.includes('lands at \\ensuremath{-}1'));
    assert.ok(!output.includes('−'));
    assert.ok(output.includes('e^{i\\pi} = -1'), 'Preserve inline math');
  });
  test(`${format}: Fourier attribution retains author, URL, and paragraph break`, () => {
    const content = parseContent(readFileSync('src/examples/dft.md', 'utf8'));
    assert.match(content.description, /<\/p>\s*<p>Adapted from/);
    const output = exporter(content, defaultScheme);
    assert.match(output, /\n\nAdapted from Stuart Riffle/);
    assert.ok(output.includes('https://web.archive.org/'));
    assert.ok(!output.includes('<a '));
  });
}

test('Typst: partial derivatives and reduced Planck constant retain their symbols', () => {
  const content = parseContent(readFileSync('src/examples/schrodinger.md', 'utf8'));
  const output = exportToTypst(content, defaultScheme);
  assert.ok(output.includes('∂'));
  assert.ok(output.includes('ℏ'));
  assert.ok(!output.includes('planck.reduce'));
  assert.ok(!/\bdiff\b/.test(output));
});

test('Typst: colored terms followed by parentheses stay in math mode', () => {
  const content = parseContent(readFileSync('src/examples/entropy.md', 'utf8'));
  const output = exportToTypst(content, defaultScheme);
  assert.ok(!output.includes('](#text'));
  assert.ok(output.includes('] (#text'));
});
