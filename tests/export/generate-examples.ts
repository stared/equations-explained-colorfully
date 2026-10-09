// Generate every bundled example for real compiler checks in CI.
import assert from 'node:assert/strict';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseContent } from '../../src/utils/parser';
import { exportToLaTeX, exportToBeamer, exportToTypst } from '../../src/export';
import { defaultScheme } from '../../src/utils/colorSchemes';

const format = process.argv[2];
assert.ok(format === 'latex' || format === 'typst', 'Expected latex or typst');
mkdirSync('test-output', { recursive: true });
const files = readdirSync('src/examples').filter(file => file.endsWith('.md')).sort();
assert.ok(files.length > 0, 'No examples found');
for (const file of files) {
  const content = parseContent(readFileSync(`src/examples/${file}`, 'utf8'));
  assert.deepEqual(content.errors, [], `${file}: invalid content`);
  const name = file.slice(0, -3);
  const outputs = format === 'latex'
    ? { [`test-${name}.tex`]: exportToLaTeX(content, defaultScheme),
        [`test-${name}-beamer.tex`]: exportToBeamer(content, defaultScheme) }
    : { [`test-${name}.typ`]: exportToTypst(content, defaultScheme) };
  for (const [filename, output] of Object.entries(outputs)) {
    writeFileSync(`test-output/${filename}`, output);
    console.log(`Generated ${filename}`);
  }
}
