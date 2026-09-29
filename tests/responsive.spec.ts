import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1024, 1122, 1440]) {
  test(`la page ne déborde pas horizontalement à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, async (image) => {
        image.loading = 'eager';
        await image.decode();
      }));
    });

    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      viewport: window.innerWidth,
      children: Array.from(document.body.children).map((element) => ({
        element: `${element.tagName.toLowerCase()}.${element.className}`,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
        scrollWidth: (element as HTMLElement).scrollWidth,
        overflow: getComputedStyle(element).overflowX,
      })),
      mainChildren: Array.from(document.querySelector('main')?.children ?? []).map((element) => ({
        element: `${element.tagName.toLowerCase()}.${element.className}`,
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        width: Math.round(element.getBoundingClientRect().width),
        scrollWidth: (element as HTMLElement).scrollWidth,
        overflow: getComputedStyle(element).overflowX,
      })),
    }));
    const offending = widths.document > widths.viewport + 1
      ? await page.evaluate(() => Array.from(document.body.querySelectorAll<HTMLElement>('*'))
        .map((element) => ({
          element: `${element.tagName.toLowerCase()}${element.className && typeof element.className === 'string' ? `.${element.className.trim().replace(/\s+/g, '.')}` : ''}`,
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
          width: Math.round(element.getBoundingClientRect().width),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          overflow: getComputedStyle(element).overflowX,
          parent: element.parentElement ? `${element.parentElement.tagName.toLowerCase()}.${element.parentElement.className}` : '',
        }))
        .filter((item) => item.right > window.innerWidth + 1 || item.left < -1)
        .sort((left, right) => right.right - left.right)
        .filter((item) => item.right < window.innerWidth + 20)
        .slice(0, 16))
      : [];
    expect(widths.document, JSON.stringify({ widths, offending })).toBeLessThanOrEqual(widths.viewport + 1);
    if (width <= 359) await expect(page.getByRole('link', { name: 'Démo' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#solutions')).toBeVisible();
  });
}

test('le formulaire compact garde son espace dans le rythme de page', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 900, minSection: 1650 }, { width: 1440, height: 1000, minSection: 1024 }]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    const layout = await page.evaluate(() => {
      const section = document.querySelector<HTMLElement>('.contact-section');
      const next = document.querySelector<HTMLElement>('#caracteristiques');
      if (!section || !next) throw new Error('Contact or specifications section missing');
      return { sectionHeight: Math.round(section.getBoundingClientRect().height), nextTop: Math.round(next.getBoundingClientRect().top), sectionBottom: Math.round(section.getBoundingClientRect().bottom) };
    });
    expect(layout.sectionHeight).toBeGreaterThanOrEqual(viewport.minSection);
    expect(layout.nextTop).toBe(layout.sectionBottom);
  }
});

test('le bandeau « Des outils mieux gérés » garde ses marges et le logo reste à droite', async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const band = await page.locator('.compare-aside').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width, viewport: window.innerWidth };
    });
    expect(band.left).toBeGreaterThan(0);
    expect(band.viewport - band.right).toBeCloseTo(band.left, 0);
    const header = await page.locator('.header-shell').boundingBox();
    const logo = await page.locator('.header-brand').boundingBox();
    expect(logo!.x + logo!.width).toBeCloseTo(header!.x + header!.width, 0);
  }
});
