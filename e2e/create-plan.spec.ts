import { test, expect } from '@playwright/test';

test.describe('Create plan wizard - happy path', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // wait for mock data to load
    await page.waitForSelector('text=Dashboard', { timeout: 5000 });
  });

  test('navigates to plans/new via sidebar and CTA', async ({ page }) => {
    await page.click('text=Migration Plans');
    await page.waitForURL('**/plans');
    await expect(page.getByRole('heading', { name: /migration plans/i })).toBeVisible();

    await page.click('text=Create Plan');
    await page.waitForURL('**/plans/new');
    await expect(page.getByText('Create Migration Plan')).toBeVisible();
  });

  test('full wizard happy path creates a plan and redirects to detail', async ({ page }) => {
    await page.goto('/plans/new');
    await page.waitForSelector('text=General', { timeout: 5000 });

    // Step 1: General
    await page.fill('[aria-label="Plan name"]', 'e2e-test-plan');
    await page.fill('[aria-label="Plan description"]', 'Created by Playwright E2E test');

    // Select source provider
    await page.click('text=Select source provider');
    await page.click('text=vmware-prod');

    // Select target provider
    await page.click('text=Select target provider');
    await page.click('text=ocp-cluster-prod');

    const nextBtn = page.getByRole('button', { name: /next/i });
    await expect(nextBtn).toBeEnabled({ timeout: 2000 });
    await nextBtn.click();

    // Step 2: Select VMs
    await page.waitForSelector('text=Select VMs', { timeout: 3000 });
    // Select first VM checkbox
    const firstCheckbox = page.locator('table tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();
    await expect(page.getByText(/1 VM selected/)).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();

    // Step 3: Network mapping
    await page.waitForSelector('text=Network mapping', { timeout: 3000 });
    await page.click('text=Select source network');
    await page.click('text=VM Network');
    await page.click('text=Select target network');
    await page.click('text=pod-network');
    await page.getByRole('button', { name: /next/i }).click();

    // Step 4: Storage mapping
    await page.waitForSelector('text=Storage mapping', { timeout: 3000 });
    await page.click('text=Select source storage');
    await page.click('text=datastore-ssd');
    await page.click('text=Select target storage class');
    await page.click('text=ocs-storagecluster-ceph-rbd');
    await page.getByRole('button', { name: /next/i }).click();

    // Step 5: Review
    await page.waitForSelector('text=Review & create', { timeout: 3000 });
    await expect(page.getByText('e2e-test-plan')).toBeVisible();
    await expect(page.getByText('vmware-prod')).toBeVisible();

    // Create the plan
    await page.getByRole('button', { name: /create plan/i }).click();

    // Should redirect to /plans/:id
    await page.waitForURL(/\/plans\/plan-\d+/, { timeout: 5000 });
    await expect(page.getByText('e2e-test-plan')).toBeVisible();
    await expect(page.getByRole('button', { name: /start migration/i })).toBeVisible();
  });
});