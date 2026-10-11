import { test, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'fs';
import { parseContent } from '../../src/utils/parser';
import { exportToHTML } from '../../src/export/htmlExport';
import { colorSchemes } from '../../src/utils/colorSchemes';

// KaTeX draws invisible layout elements on top of parts of an equation:
// the radical SVG over everything under a square root, and the empty depth
// row of a vertical list over denominators and lower rows. Terms there must
// still receive the pointer. These tests move the real mouse to the centre
// of such a term, as a user would, instead of using locator.hover(), which
// would also report an intercepting element but only after its timeout.

async function moveMouseToCenter(page: Page, term: Locator) {
  const box = await term.boundingBox();
  expect(box, 'term should be rendered').not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

async function expectTermReceivesPointer(page: Page, term: Locator) {
  const receives = await term.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && el.contains(hit);
  });
  expect(receives, 'element at the centre of the term should belong to the term').toBe(true);
}

// A marked term under a square root. No bundled example has one.
const RADICAND_EXAMPLE = `# Square Root

## Equation

$$
\\mark[root]{r} = \\sqrt{\\mark[radicand]{x}}
$$

## Description

[r]{.root} is the square root of [x]{.radicand}.

## .root

The root.

## .radicand

Radicand under the square root.
`;

test.describe('Exported HTML: terms under KaTeX overlays', () => {
  async function loadExport(page: Page, markdown: string) {
    const html = exportToHTML(parseContent(markdown), colorSchemes.vibrant);
    await page.setContent(html, { waitUntil: 'networkidle' });
  }

  test('term in a denominator shows its definition on hover (Bayes, P(E))', async ({ page }) => {
    await loadExport(page, readFileSync('./src/examples/bayes.md', 'utf-8'));
    const evidence = page.locator('.equation-container .term-evidence').first();

    await expectTermReceivesPointer(page, evidence);
    await moveMouseToCenter(page, evidence);
    await expect(page.locator('#hover-explanation')).toHaveClass(/visible/);
    await expect(page.locator('#hover-explanation')).toContainText('Marginal Likelihood');
  });

  test('term under a square root shows its definition on hover', async ({ page }) => {
    await loadExport(page, RADICAND_EXAMPLE);
    const radicand = page.locator('.equation-container .term-radicand').first();

    await expectTermReceivesPointer(page, radicand);
    await moveMouseToCenter(page, radicand);
    await expect(page.locator('#hover-explanation')).toHaveClass(/visible/);
    await expect(page.locator('#hover-explanation')).toContainText('Radicand under the square root');
  });
});

test.describe('Live view: terms under KaTeX overlays', () => {
  // Requires the dev server (pnpm dev), like test-export-ui.spec.ts
  test('term in a denominator shows its definition on hover (Bayes, P(E))', async ({ page }) => {
    await page.goto('http://localhost:5173/equations-explained-colorfully/#bayes');
    const evidence = page.locator('#equation-container .term-evidence').first();
    await expect(evidence).toBeVisible({ timeout: 10000 });

    await expectTermReceivesPointer(page, evidence);
    await moveMouseToCenter(page, evidence);
    await expect(page.locator('.central-panel .hover-explanation')).toHaveClass(/visible/);
    await expect(page.locator('.central-panel .hover-explanation')).toContainText('Marginal Likelihood');
  });
});
