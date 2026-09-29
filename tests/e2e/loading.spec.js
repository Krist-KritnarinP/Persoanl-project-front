import { test, expect } from '@playwright/test';

test('travel dog loader announces loading, respects reduced motion and leaves when data is ready', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('lang', 'th'));
  let release;
  const ready = new Promise(resolve => { release=resolve; });
  await page.route('http://127.0.0.1:8899/api/**', async route => {
    await ready;
    await route.fulfill({headers:{'access-control-allow-origin':'http://127.0.0.1:5188','access-control-allow-credentials':'true'},json:{data:{id:71,tripName:'Loading complete',destination:'Bangkok',days:[]}}});
  });
  try {
    await page.goto('/share/loading-demo');
    const loader=page.locator('.journey-loading');
    await expect(loader).toBeVisible();
    await expect(loader).toHaveAttribute('role','status');
    await expect(loader).toContainText('น้องหมากำลังพาไป');
    expect(await loader.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    await expect(loader.locator('.journey-loading__dog')).toHaveCSS('animation-name','journey-bob');
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(loader.locator('.journey-loading__dog')).toHaveCSS('animation-name','none');
    await loader.screenshot({path:test.info().outputPath('travel-dog-light.png')});
    await page.locator('html').evaluate(el=>el.dataset.theme='liquid-glass-dark');
    await loader.screenshot({path:test.info().outputPath('travel-dog-dark.png')});
    release();
    await expect(loader).toHaveCount(0);
    await expect(page.getByText('Loading complete',{exact:true})).toBeVisible();
  } finally { release(); }
});
