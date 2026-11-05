const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#ageGate')).toBeVisible();
  await page.locator('#ageYes').click();
  await expect(page.locator('#ageGate')).toBeHidden();
});

test('visual, navigation, search, filter and catalog responsive', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('.card')).toHaveCount(4);
  await expect(page.locator('h1')).toContainText('autocuidado');
  await page.locator('#exploreProducts').click();
  await page.locator('#productSearch').fill('melzinho');
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('#productSearch').clear();
  await page.locator('.chip').filter({ hasText: 'Acessórios' }).click();
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('#productSearch').fill('nenhum-produto-existe');
  await expect(page.locator('.grid')).toContainText('Nenhum produto');
  await page.locator('#productSearch').clear();
  await page.locator('.chip').filter({ hasText: 'Todos' }).click();
  await expect(page.locator('.card')).toHaveCount(4);
  await page.locator('#goHome').click();
  await page.screenshot({ path: 'test-results/' + testInfo.project.name + '-catalog.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('cart, fake checkout, fake payment and local message preview', async ({ page }) => {
  const popups = [];
  page.on('popup', p => popups.push(p));
  await page.locator('.buy').first().click();
  await page.locator('#goCart').click();
  await expect(page.locator('#cartItems')).toContainText('Melzinho');
  await expect(page.locator('#modalTotal')).toHaveText('R$ 30,00');
  await page.locator('.qty button').last().click();
  await expect(page.locator('#modalTotal')).toHaveText('R$ 60,00');
  await page.locator('#goCheckout').click();
  await expect(page.locator('#customerName')).toHaveValue('Cliente Teste');
  await expect(page.locator('#customerName')).toHaveAttribute('readonly');
  await page.locator('#placeOrder').click();
  await expect(page.locator('#paymentModal')).toBeVisible();
  await page.getByRole('button', { name: 'Simular pagamento aprovado' }).click();
  await expect(page.locator('#paymentContent')).toContainText('fictício');
  await page.getByRole('button', { name: 'Visualizar mensagem fictícia' }).click();
  await expect(page.locator('#demoMessage')).toContainText('NÃO ENVIADA');
  expect(popups).toHaveLength(0);
});

test('admin demo adds a product with phone-style photo input', async ({ page }) => {
  await page.locator('#goAdmin').click();
  await expect(page.locator('#adminModal')).toBeVisible();
  await page.getByRole('button', { name: '+ Novo' }).click();
  await page.locator('#photoInput').setInputFiles({
    name: 'foto-teste.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/jxsAAAAASUVORK5CYII=', 'base64')
  });
  await expect(page.locator('#preview img')).toBeVisible();
  await page.locator('#pname').fill('Kit Demonstração');
  await page.locator('#pprice').fill('49,90');
  await page.locator('#pcat').fill('Kits');
  await page.locator('#pstock').fill('3');
  await page.locator('#saveProduct').click();
  await expect(page.locator('#adminContent')).toContainText('Kit Demonstração');
  await page.reload();
  await page.locator('#goAdmin').click();
  await expect(page.locator('#adminContent')).toContainText('Kit Demonstração');
});
