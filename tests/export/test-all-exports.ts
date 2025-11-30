// Minimal smoke test: verify all export formats run without errors
import { parseContent } from '../../src/parser';
import { exportToHTML, exportToLaTeX, exportToBeamer, exportToTypst } from '../../src/export';
import { vibrantScheme } from '../test-utils';
import { readFileSync } from 'fs';

async function smokeTest() {
  console.log('Quick smoke test: All export formats...\n');

  const markdown = readFileSync('./src/examples/euler.md', 'utf-8');
  const parsed = await parseContent(markdown);

  const exports = {
    HTML: () => exportToHTML(parsed, vibrantScheme),
    LaTeX: () => exportToLaTeX(parsed, vibrantScheme),
    Beamer: () => exportToBeamer(parsed, vibrantScheme),
    Typst: () => exportToTypst(parsed, vibrantScheme),
  };

  let passed = 0;
  for (const [format, exportFn] of Object.entries(exports)) {
    try {
      const result = exportFn();
      if (result && result.length > 100) {
        console.log(`✓ ${format}: ${result.length} characters`);
        passed++;
      } else {
        console.log(`✗ ${format}: Output too short or empty`);
      }
    } catch (error) {
      console.log(`✗ ${format}: ${error}`);
    }
  }

  console.log(`\n${passed}/4 exports successful\n`);
  if (passed < 4) process.exit(1);
  console.log('✅ All exports working');
}

smokeTest().catch((error) => {
  console.error('Smoke test failed:', error);
  process.exit(1);
});
