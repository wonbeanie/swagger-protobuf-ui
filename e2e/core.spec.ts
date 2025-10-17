import { test, Locator } from '@playwright/test';
import { runE2ETests } from './helpers';

test.beforeEach(async ({ page })=>{
  await page.goto('/');
});

test.describe('Core E2E 테스트 시작',() => {
  runE2ETests();
});