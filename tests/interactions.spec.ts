import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('le menu compact se ferme avec Échap et après navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' });

  await expect(toggle).toBeVisible();
  await expect(navigation).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();

  await toggle.click();
  await navigation.getByRole('link', { name: 'Cas d’usage' }).click();
  await expect(navigation).toBeHidden();
  await expect(page.locator('#cas-usage')).toBeFocused();
  await expect(page).toHaveURL(/#cas-usage$/);
});

test('le formulaire conserve les coordonnées et le besoin dans la demande', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Votre nom').fill('Camille Martin');
  await page.getByLabel('Entreprise ou organisation').fill('Atelier du Rhône');
  await page.getByLabel('Adresse e-mail').fill('camille@example.com');
  await page.getByRole('combobox', { name: 'Type de site', exact: true }).selectOption('Chantier');
  await page.getByLabel('Nombre d’ensembles envisagé').selectOption('2 ensembles');
  await page.getByLabel('Votre message').fill('<chantier> été — matériel partagé');
  const form = page.locator('[data-contact-form]');
  const recipient = await form.getAttribute('data-recipient');
  if (recipient) {
    await page.locator('.contact-submit').click();
    await expect(page.locator('.contact-status')).toContainText('Votre messagerie est sollicitée');
  } else {
    const promise = page.waitForEvent('download');
    await page.locator('.contact-submit').click();
    const download = await promise;
    const content = await readFile(await download.path(), 'utf8');
    expect(content).toContain('Camille Martin');
    expect(content).toContain('camille@example.com');
    expect(content).toContain('2 ensembles');
    expect(content).toContain('<chantier> été');
    await expect(page.locator('.contact-status')).toContainText('Demande téléchargée');
  }
});

test('le formulaire demande les coordonnées avant de préparer le message', async ({ page }) => {
  await page.goto('/');
  await page.locator('.contact-submit').click();
  await expect(page.getByLabel('Votre nom')).toBeFocused();
  expect(await page.locator('[data-contact-form]').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(false);
  await expect(page.locator('.contact-status')).toBeEmpty();
});

test('l’application reste visible au-dessus du téléphone et ses commandes fonctionnent', async ({ page }) => {
  await page.goto('/');
  const lock = page.locator('[data-demo-lock]');
  await lock.scrollIntoViewIfNeeded();
  expect(await lock.evaluate((button) => {
    const r = button.getBoundingClientRect();
    return button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  })).toBe(true);
  await lock.click();
  await expect(page.locator('[data-lock-state]')).toHaveText('Verrouillé');
  await lock.click();
  await expect(page.locator('[data-lock-state]')).toHaveText('Déverrouillé');
  await page.getByRole('tab', { name: 'Activité', exact: true }).click();
  await expect(page.locator('#app-history')).toBeVisible();
  await expect(page.locator('#app-access')).toBeHidden();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#app-access')).toBeVisible();
});

test('les liens internes pointent vers une cible de page réelle', async ({ page }) => {
  await page.goto('/');
  const brokenLinks = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).hash)
      .filter((hash) => hash.length > 1 && !document.getElementById(decodeURIComponent(hash.slice(1)))),
  );

  expect(brokenLinks).toEqual([]);
});

test('la page presse est accessible et renvoie vers le projet sur mobile', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.locator('#primary-navigation').getByRole('link', { name: 'Presse' }).click();
  await expect(page).toHaveURL(/\/presse\//);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('L’outillage perdu coûte plus que son remplacement.');
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.locator('#primary-navigation').getByRole('link', { name: 'Produits' }).click();
  await expect(page).toHaveURL(/\/#produit$/);
  expect(errors).toEqual([]);
});
