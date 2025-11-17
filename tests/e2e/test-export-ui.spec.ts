import { test, expect } from '@playwright/test';

test.describe('Export UI State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/equations-explained-colorfully/');
    await page.waitForSelector('#equation-container .katex', { timeout: 5000 });
  });

  test('Export as HTML shows export code in editor', async ({ page }) => {
    // Click "Export as..." button
    await page.click('#export-btn');

    // Wait for menu to appear
    await page.waitForSelector('#export-menu', { state: 'visible' });

    // Click HTML option
    await page.click('.export-option[data-format="html"]');

    // Wait for export to load
    await page.waitForTimeout(500);

    // Check editor contains HTML (should start with <!DOCTYPE html>)
    const editorContent = await page.textContent('#editor-container code');
    expect(editorContent).toContain('<!DOCTYPE html>');
    expect(editorContent).toContain('<html lang="en">');

    // Check button text changed
    const btnText = await page.textContent('#export-btn');
    expect(btnText).toBe('Back to Edit');

    // Check editor is read-only
    const isEditable = await page.$eval(
      '#editor-container code',
      (el) => (el as HTMLElement).contentEditable
    );
    expect(isEditable).toBe('false');
  });

  test('Back to Edit restores markdown without reset', async ({ page }) => {
    // Get original markdown content
    const originalMarkdown = await page.textContent('#editor-container code');

    // Export to HTML
    await page.click('#export-btn');
    await page.waitForSelector('#export-menu', { state: 'visible' });
    await page.click('.export-option[data-format="html"]');
    await page.waitForTimeout(500);

    // Verify we're in export mode
    let editorContent = await page.textContent('#editor-container code');
    expect(editorContent).toContain('<!DOCTYPE html>');

    // Click "Back to Edit"
    await page.click('#export-btn');
    await page.waitForTimeout(500);

    // Check markdown is restored
    editorContent = await page.textContent('#editor-container code');
    expect(editorContent).toBe(originalMarkdown);

    // Check button text changed back
    const btnText = await page.textContent('#export-btn');
    expect(btnText).toBe('Export as...');

    // Check editor is editable again
    const isEditable = await page.$eval(
      '#editor-container code',
      (el) => (el as HTMLElement).contentEditable
    );
    expect(isEditable).toBe('true');
  });

  test('Main equation display stays visible during export', async ({ page }) => {
    // Check equation is visible initially
    const equationVisible1 = await page.isVisible('#equation-container .katex');
    expect(equationVisible1).toBe(true);

    // Get equation HTML
    const equationHTML = await page.innerHTML('#equation-container');

    // Export to HTML
    await page.click('#export-btn');
    await page.waitForSelector('#export-menu', { state: 'visible' });
    await page.click('.export-option[data-format="html"]');
    await page.waitForTimeout(500);

    // Check equation is still visible and unchanged
    const equationVisible2 = await page.isVisible('#equation-container .katex');
    expect(equationVisible2).toBe(true);

    const equationHTML2 = await page.innerHTML('#equation-container');
    expect(equationHTML2).toBe(equationHTML);

    // Back to edit
    await page.click('#export-btn');
    await page.waitForTimeout(500);

    // Check equation is still visible and unchanged
    const equationVisible3 = await page.isVisible('#equation-container .katex');
    expect(equationVisible3).toBe(true);

    const equationHTML3 = await page.innerHTML('#equation-container');
    expect(equationHTML3).toBe(equationHTML);
  });

  test('Copy button works in both modes', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // Copy in markdown mode
    await page.click('#copy-btn');
    await page.waitForTimeout(500);

    const copiedMarkdown = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedMarkdown).toContain('# '); // Markdown header

    // Export to HTML
    await page.click('#export-btn');
    await page.waitForSelector('#export-menu', { state: 'visible' });
    await page.click('.export-option[data-format="html"]');
    await page.waitForTimeout(500);

    // Copy in export mode
    await page.click('#copy-btn');
    await page.waitForTimeout(500);

    const copiedHTML = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedHTML).toContain('<!DOCTYPE html>');
    expect(copiedHTML).not.toBe(copiedMarkdown);
  });

  test('Multiple export/edit cycles preserve content', async ({ page }) => {
    // Get original markdown
    const originalMarkdown = await page.textContent('#editor-container code');

    // Cycle 1: Export and back
    await page.click('#export-btn');
    await page.waitForSelector('#export-menu', { state: 'visible' });
    await page.click('.export-option[data-format="html"]');
    await page.waitForTimeout(500);
    await page.click('#export-btn');
    await page.waitForTimeout(500);

    let currentMarkdown = await page.textContent('#editor-container code');
    expect(currentMarkdown).toBe(originalMarkdown);

    // Cycle 2: Export and back again
    await page.click('#export-btn');
    await page.waitForSelector('#export-menu', { state: 'visible' });
    await page.click('.export-option[data-format="html"]');
    await page.waitForTimeout(500);
    await page.click('#export-btn');
    await page.waitForTimeout(500);

    currentMarkdown = await page.textContent('#editor-container code');
    expect(currentMarkdown).toBe(originalMarkdown);

    // Cycle 3: Export and back one more time
    await page.click('#export-btn');
    await page.waitForSelector('#export-menu', { state: 'visible' });
    await page.click('.export-option[data-format="html"]');
    await page.waitForTimeout(500);
    await page.click('#export-btn');
    await page.waitForTimeout(500);

    currentMarkdown = await page.textContent('#editor-container code');
    expect(currentMarkdown).toBe(originalMarkdown);
  });
});
