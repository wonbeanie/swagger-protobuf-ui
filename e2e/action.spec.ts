import { test, expect, Locator, Page } from '@playwright/test';

const getResponseData = {
  "id": 1,
  "name": "Alice",
  "mainAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345"
  },
  "tags": [
    {
      "id": 101,
      "name": "friend"
    },
    {
      "id": 102,
      "name": "developer"
    }
  ]
} as const;

let prevId: number = 2;

const postResponseData = {
  "id": prevId,
  "name": "Test User",
  "mainAddress": {
    "street": "456 Oak Ave",
    "city": "Someville",
    "zipCode": "67890"
  },
  "tags": [
    {
      "id": 201,
      "name": "kw"
    },
    {
      "id": 202,
      "name": "won"
    }
  ]
} as const;

test.beforeEach(async ({ page })=>{
  await page.goto('/');
});

test.describe('E2E 테스트 시작',() => {
  test('메인 페이지가 올바르게 로드되어야 한다', async ({ page }) => {
    // 페이지 타이틀이 'My App'인지 확인
    await expect(page).toHaveTitle(/Swagger UI/);

    const titleText = await findTextChild(page.locator('h2'));

    expect(titleText).toBe('Node.js Protobuf API 명세');
  });

  test('API 명세가 잘 불러왔는지 확인한다', async ({ page }) => {
    const usersApiText = page.locator('h3 > a');

    await expect(usersApiText).toHaveText('Users');
    
    const usersApiList = page.locator('.operation-tag-content > span');

    await expect(usersApiList).toHaveCount(3);
  });

  test('protobuf GET 요청 테스트', async ({ page }) => {
    const getUsersIdLocator = page.locator('#operations-Users-get_users__id_');

    await getUsersIdLocator.click();

    await getUsersIdLocator.locator('.btn.try-out__btn').click();

    await page.fill('input[placeholder="id"]', '1');

    await Promise.all([
      page.waitForResponse('**/users/1'), // 특정 요청 URL 패턴
      page.click('button:has-text("Execute")'), // 요청을 발생시키는 액션
    ]);

    const data = await getUsersIdLocator.locator('.response-col_description code').first().textContent() || "";

    expect(JSON.parse(data)).toMatchObject(getResponseData);

    const header = await getUsersIdLocator.locator('.response-col_description pre:nth-child(2) span:nth-child(2)').textContent() || "";

    expect(header.trim()).toBe("content-type: application/protobuf");
  });

  test('일반 GET 요청 테스트', async ({ page }) => {
    const getUsersIdInfoLocator = page.locator('#operations-Users-get_users__id__info');

    await getUsersIdInfoLocator.click();

    await getUsersIdInfoLocator.locator('.btn.try-out__btn').click();

    await page.fill('input[placeholder="id"]', '1');

    await Promise.all([
      page.waitForResponse('**/users/1/info'), // 특정 요청 URL 패턴
      page.click('button:has-text("Execute")'), // 요청을 발생시키는 액션
    ]);

    const data = await getUsersIdInfoLocator.locator('.response-col_description code').first().textContent() || "";

    expect(JSON.parse(data)).toMatchObject(getResponseData);

    const header = await getUsersIdInfoLocator.locator('.response-col_description pre:nth-child(2) span:nth-child(2)').textContent() || "";

    expect(header.trim()).toBe("content-type: application/json; charset=utf-8");
  });

  test('POST 요청 테스트', async ({ page }) => {
    const postUsersLocator = page.locator('#operations-Users-post_users');
    await postUsersLocator.click();

    await postUsersLocator.locator('.btn.try-out__btn').click();

    await Promise.all([
      page.waitForResponse('**/users'), // 특정 요청 URL 패턴
      page.click('button:has-text("Execute")'), // 요청을 발생시키는 액션
    ]);

    const data = await postUsersLocator.locator('.response-col_description code').first().textContent() || "";

    const {id, ...responseData} = JSON.parse(data) as typeof postResponseData;

    const {id : prevId, ...comparisonData} = postResponseData;

    expect(id).toBeGreaterThan(prevId);

    expect(responseData).toMatchObject(comparisonData);

    const header = await postUsersLocator.locator('.response-col_description pre:nth-child(2) span:nth-child(2)').textContent() || "";

    expect(header.trim()).toBe("content-type: application/protobuf");
  });
})

async function findTextChild(locator : Locator){
  return await locator.evaluate(element => {
    let text = '';
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      }
    }
    return text.trim();
  });
}