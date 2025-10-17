import { test, expect } from '@playwright/test';
import { runE2ETests } from './helpers';

test.beforeEach(async ({ page })=>{
  await page.goto('/lite.html');
});

test.describe('E2E 테스트 시작',() => {
  test('swagger-ui-bundle.js 스크립트 없이 페이지가 로드되는지 테스트', async ({ page }) => {
    await page.route('**/swagger-ui-bundle.js', route => {
      console.log(`Blocking request to: ${route.request().url()}`);
      route.abort();
    });

    await page.goto('/lite.html');
    
    const errorLocator = page.locator("#bundle-error");

    await expect(errorLocator).toContainText([
      "SwaggerUiBundle not foundPlease import swagger-ui-bundle.js",
    ]);

    await expect(page).toHaveTitle(/Swagger UI/);
  });

  runE2ETests();
})