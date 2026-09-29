import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const captures = [
  { name: 'desktop-1122', width: 1122, height: 1000 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

for (const capture of captures) {
  test(`capture stable ${capture.name}`, async ({ page }) => {
    await page.setViewportSize({ width: capture.width, height: capture.height });
    await page.goto('/');
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, async (image) => {
        image.loading = 'eager';
        await image.decode();
      }));
    });

    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    });
    expect(screenshot).toMatchSnapshot(`${capture.name}.png`, {
      threshold: 0.2,
      maxDiffPixelRatio: 0.002,
    });

    const screenshots = join(process.cwd(), 'review', 'screenshots');
    await mkdir(screenshots, { recursive: true });
    await writeFile(join(screenshots, `${capture.name}.png`), screenshot);
  });
}
