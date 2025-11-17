// Shared test utilities and fixtures
import { writeFileSync } from 'fs';

// Re-export color schemes from central location
export { vibrantScheme, vibrant10Scheme, viridisScheme, viridis10Scheme } from '../src/utils/color-schemes';

// Test output directory
export const TEST_OUTPUT_DIR = '/tmp';

// Helper to ensure test output directory exists and write file
export function writeTestFile(filename: string, content: string): string {
  const filepath = `${TEST_OUTPUT_DIR}/${filename}`;
  try {
    writeFileSync(filepath, content);
    return filepath;
  } catch (error) {
    console.error(`Failed to write ${filepath}:`, error);
    throw error;
  }
}

// Test check runner
export interface TestCheck {
  name: string;
  test: () => boolean;
}

export function runChecks(checks: TestCheck[], context: string = ''): { passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const prefix = context ? `${context}: ` : '';
  checks.forEach((check) => {
    try {
      if (check.test()) {
        console.log(`  ✓ ${prefix}${check.name}`);
        passed++;
      } else {
        console.log(`  ✗ ${prefix}${check.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ ${prefix}${check.name} (error: ${error})`);
      failed++;
    }
  });

  return { passed, failed };
}

// Summary reporter
export function reportTestResults(passed: number, total: number, testName: string): void {
  console.log(`\n${passed}/${total} checks passed\n`);

  if (passed < total) {
    const failed = total - passed;
    console.error(`❌ ${failed} ${testName} checks failed`);
    process.exit(1);
  } else {
    console.log(`✅ All ${testName} checks passed!`);
  }
}
