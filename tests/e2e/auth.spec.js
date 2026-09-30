import { test, expect } from '@playwright/test';
const headers = { 'access-control-allow-origin': 'http://127.0.0.1:5188', 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'content-type,authorization', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('lang', 'en'));
});
test('Login always shows Google and Forgot; recovery works with a cached login', async ({ page }, testInfo) => {
  await page.route('https://accounts.google.com/**', route => route.abort());
  await page.route('http://127.0.0.1:8899/api/**', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    const path = new URL(route.request().url()).pathname;
    expect(['/api/auth/forgot-password', '/api/auth/reset-password']).toContain(path);
    if (path.endsWith('/reset-password')) expect(route.request().postDataJSON().token).toBe('a'.repeat(43));
    await route.fulfill({ status: path.endsWith('/forgot-password') ? 202 : 200, headers, json: { message: 'OK' } });
  });
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Login with Google' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('login.png'), fullPage: true });
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('tester@example.invalid');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'If this email has an account' })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('authState', JSON.stringify({ state: { user: { id: 1 }, token: 'cached' }, version: 0 })));
  await page.goto('/reset-password#token=' + 'a'.repeat(43));
  await expect(page.getByRole('heading', { name: 'Create a new password' })).toBeVisible();
  await expect(page).toHaveURL('/reset-password');
  await page.getByLabel('New password', { exact: true }).fill('A new secure test password');
  await page.getByLabel('Confirm password', { exact: true }).fill('A new secure test password');
  await page.getByRole('button', { name: 'Save password' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Password updated' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('authState')).state.user)).toBeNull();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBeTruthy();
});
test('Google collision asks for password before linking, then saves the session', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({ contentType: 'text/javascript', body: `window.google={accounts:{id:{initialize(options){this.callback=options.callback},renderButton(node){node.innerHTML='';const b=document.createElement('button');b.type='button';b.textContent='Sign in with Google';b.onclick=()=>this.callback({credential:'${'x'.repeat(100)}'});node.appendChild(b)}}}}` }));
  let requests = 0;
  await page.route('http://127.0.0.1:8899/api/**', async route => {
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (new URL(route.request().url()).pathname !== '/api/auth/google') return route.fulfill({ status: 200, headers, json: { data: [] } });
    requests++;
    const body = route.request().postDataJSON();
    if (!body.currentPassword) return route.fulfill({ status: 409, headers, json: { code: 'GOOGLE_LINK_PASSWORD_REQUIRED' } });
    expect(body.currentPassword).toBe('My original password');
    await route.fulfill({ status: 200, headers, json: { token: 'test-token', user: { id: 99, username: 'Google User', email: 'tester@gmail.com' } } });
  });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Confirm your existing account' });
  await expect(dialog).toBeVisible(); expect(requests).toBe(1);
  await dialog.getByLabel('Password', { exact: true }).fill('My original password');
  await dialog.getByRole('button', { name: 'Confirm and link Google' }).click();
  await expect(page).toHaveURL('/dashboard');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('authState')).state.user.id)).toBe(99);
  expect(requests).toBe(2); expect(errors).toEqual([]);
});
