// @ts-check
import { expect, test } from '@playwright/test'

test.skip('has title', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/)
})

test.skip('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/')

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click()

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible()
})

test.describe('New Condition', () => {
  test('should allow me to add todo items', async ({ page: _page }) => {
    // // create a new todo locator
    // const newTodo = page.getByPlaceholder('What needs to be done?');
    // // Create 1st todo.
    // await newTodo.fill(TODO_ITEMS[0]);
    // await newTodo.press('Enter');
    // // Make sure the list only has one todo item.
    // await expect(page.getByTestId('todo-title')).toHaveText([
    //   TODO_ITEMS[0]
    // ]);
    // // Create 2nd todo.
    // await newTodo.fill(TODO_ITEMS[1]);
    // await newTodo.press('Enter');
    // // Make sure the list now has two todo items.
    // await expect(page.getByTestId('todo-title')).toHaveText([
    //   TODO_ITEMS[0],
    //   TODO_ITEMS[1]
    // ]);
    // await checkNumberOfTodosInLocalStorage(page, 2);
  })
})
