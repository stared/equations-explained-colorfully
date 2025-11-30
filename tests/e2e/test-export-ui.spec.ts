import { test, expect } from '@playwright/test';

test.describe('Export UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/equations-explained-colorfully/');
    await page.waitForSelector('#equation-container .katex', { timeout: 10000 });
  });

  test('Export dropdown is visible', async ({ page }) => {
    // Check export select is present
    const exportSelect = page.locator('.export-controls select');
    await expect(exportSelect).toBeVisible();
  });

  test('Copy button is visible', async ({ page }) => {
    // Check copy button is present
    const copyBtn = page.locator('button:has-text("Copy")');
    await expect(copyBtn).toBeVisible();
  });

  test('Main equation display is rendered', async ({ page }) => {
    // Check equation is visible
    const equationVisible = await page.isVisible('#equation-container .katex');
    expect(equationVisible).toBe(true);
  });

  test('Editor contains markdown content', async ({ page }) => {
    // Check editor has content
    const editorContent = await page.textContent('code.language-eqmd');
    expect(editorContent).toContain('# ');
    expect(editorContent).toContain('$$');
  });
});
