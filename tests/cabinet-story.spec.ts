import { expect, test } from '@playwright/test';

async function activateStory(page: import('@playwright/test').Page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-scroll-story]');
    if (root) window.scrollTo({ top: root.offsetTop - 500, behavior: 'instant' });
  });
  await expect.poll(async () => page.locator('[data-scroll-story]').getAttribute('data-mode')).toBe('enhanced');
  await expect.poll(async () => page.locator('[data-story-canvas]').getAttribute('data-frame-index')).toBe('0');
}

test('la vue éclatée suit un scroll continu sans sauts majeurs', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await activateStory(page);
  await expect(page.locator('[data-story-index]')).toHaveText('01 · EMPRUNT');

  const result = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[data-scroll-story]');
    const stage = root?.querySelector<HTMLElement>('[data-story-stage]');
    const canvas = root?.querySelector<HTMLCanvasElement>('[data-story-canvas]');
    if (!root || !stage || !canvas) throw new Error('Story markup missing');

    const start = window.scrollY + root.getBoundingClientRect().top;
    const distance = root.offsetHeight - stage.clientHeight;
    const frames: number[] = [];
    const started = performance.now();
    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        const progress = Math.min(1, (now - started) / 4_000);
        window.scrollTo({ top: start + distance * progress, behavior: 'instant' });
        const frame = Number(canvas.dataset.frameIndex ?? -1);
        if (frame !== frames.at(-1)) frames.push(frame);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    return { frames, finalFrame: Number(canvas.dataset.frameIndex ?? -1) };
  });

  expect(result.frames[0]).toBe(0);
  expect(result.finalFrame).toBe(120);
  expect(result.frames.length).toBeGreaterThan(35);
  expect(result.frames.every((frame, index, frames) => index === 0 || frame >= frames[index - 1])).toBe(true);
  expect(Math.max(...result.frames.slice(1).map((frame, index) => frame - result.frames[index]))).toBeLessThanOrEqual(15);
  await expect(page.locator('[data-story-index]')).toHaveText('04 · SUIVI');
  await expect(page.locator('[data-story-title]')).toHaveText('Une preuve horodatée.');
  expect(pageErrors).toEqual([]);
});

test('le scroll inverse réassemble le casier et garde le viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-scroll-story]');
    if (root) window.scrollTo({ top: root.offsetTop - 300, behavior: 'instant' });
  });
  const root = page.locator('[data-scroll-story]');
  const canvas = page.locator('[data-story-canvas]');
  await expect.poll(async () => root.getAttribute('data-mode')).toBe('enhanced');
  await expect.poll(async () => canvas.getAttribute('data-frame-index')).toBe('0');

  const result = await page.evaluate(async () => {
    const root = document.querySelector<HTMLElement>('[data-scroll-story]');
    const stage = root?.querySelector<HTMLElement>('[data-story-stage]');
    const canvas = root?.querySelector<HTMLCanvasElement>('[data-story-canvas]');
    if (!root || !stage || !canvas) throw new Error('Story markup missing');
    const start = window.scrollY + root.getBoundingClientRect().top;
    const distance = root.offsetHeight - stage.clientHeight;
    const visit = async (from: number, to: number) => {
      const frames: number[] = [];
      const started = performance.now();
      await new Promise<void>((resolve) => {
        const step = (now: number) => {
          const progress = Math.min(1, (now - started) / 1_800);
          const position = from + (to - from) * progress;
          window.scrollTo({ top: start + distance * position, behavior: 'instant' });
          const frame = Number(canvas.dataset.frameIndex ?? -1);
          if (frame !== frames.at(-1)) frames.push(frame);
          if (progress < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
      const targetFrame = to === 1 ? 80 : 0;
      const deadline = performance.now() + 4_000;
      while (Number(canvas.dataset.frameIndex ?? -1) !== targetFrame && performance.now() < deadline) {
        await new Promise((resolve) => window.setTimeout(resolve, 40));
      }
      const settledFrame = Number(canvas.dataset.frameIndex ?? -1);
      if (settledFrame !== frames.at(-1)) frames.push(settledFrame);
      return frames;
    };
    const down = await visit(0, 1);
    const up = await visit(1, 0);
    return {
      downFirst: down[0],
      downLast: down.at(-1),
      upFirst: up[0],
      upLast: up.at(-1),
      width: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    };
  });
  await expect(canvas).toHaveAttribute('data-frame-index', '0', { timeout: 5_000 });
  const finalFrame = await canvas.getAttribute('data-frame-index');

  expect(result.downFirst).toBe(0);
  expect(result.downLast).toBe(80);
  expect(result.upFirst).toBe(80);
  expect(finalFrame).toBe('0');
  expect(result.width).toBe(result.viewport);
});

test('le mode mouvement réduit garde le récit statique et lisible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const root = page.locator('[data-scroll-story]');
  await expect(root).toHaveAttribute('data-mode', 'static');
  await expect(page.locator('.story-static')).toBeVisible();
  await expect(page.locator('[data-story-stage]')).toBeHidden();
  await expect(page.locator('.story-static')).toContainText('Emprunt');
  await expect(page.locator('.story-static')).toContainText('Restitution');
  await expect(page.locator('.story-static')).toContainText('Vérification');
});

for (const viewport of [{ width: 1440, height: 550 }, { width: 740, height: 390 }]) {
  test(`la séquence reste visible dans une fenêtre basse ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      const root = document.querySelector('[data-scroll-story]')!;
      window.scrollTo(0, window.scrollY + root.getBoundingClientRect().top - 100);
    });
    const root = page.locator('[data-scroll-story]');
    const canvas = page.locator('[data-story-canvas]');
    await expect(root).toHaveAttribute('data-mode', 'enhanced');
    await expect(canvas).toBeVisible();
    const last = viewport.width > 767 ? 120 : 80;
    const images: Buffer[] = [];
    for (const frame of [0, last / 2, last, 0]) {
      await page.evaluate((progress) => {
        const root = document.querySelector<HTMLElement>('[data-scroll-story]')!;
        const stage = root.querySelector<HTMLElement>('[data-story-stage]')!;
        window.scrollTo(0, window.scrollY + root.getBoundingClientRect().top + (root.offsetHeight - stage.clientHeight) * progress);
      }, frame / last);
      await expect(canvas).toHaveAttribute('data-frame-index', String(frame));
      images.push(await canvas.screenshot());
    }
    expect(images[0].equals(images[1])).toBe(false);
    expect(images[1].equals(images[2])).toBe(false);
    expect(images[0].equals(images[3])).toBe(true);
  });
}

test('le visiteur peut activer la séquence avec la préférence mouvement réduit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Activer la vue éclatée au défilement' }).click();
  await expect(page.locator('[data-scroll-story]')).toHaveAttribute('data-mode', 'enhanced');
  await expect(page.locator('[data-story-canvas]')).toBeVisible();
  await expect(page.locator('[data-story-canvas]')).toHaveAttribute('data-frame-index', '0');
});
