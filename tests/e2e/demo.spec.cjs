const { test, expect } = require('@playwright/test');

const products = [
  { id:'00000000-0000-4000-8000-000000000001', name:'Melzinho do Amor',category:'Comestíveis',price:'30.00',stock:5,active:true,image_path:null,image_url:'https://douceseduction.netlify.app/images/prod-1.svg' },
  { id:'00000000-0000-4000-8000-000000000002', name:'Plug Anal M',category:'Acessórios',price:'35.00',stock:2,active:true,image_path:null,image_url:'https://douceseduction.netlify.app/images/prod-2.webp' },
  { id:'00000000-0000-4000-8000-000000000003', name:'Egg Masturbador Masculino',category:'Masculino',price:'15.00',stock:8,active:true,image_path:null,image_url:'https://douceseduction.netlify.app/images/prod-3.webp' },
  { id:'00000000-0000-4000-8000-000000000004', name:'Bolinha Yummy',category:'Comestíveis',price:'35.00',stock:6,active:true,image_path:null,image_url:'https://douceseduction.netlify.app/images/prod-4.webp' },
];
async function mockCatalog(page, rows=products) {
  await page.route('**/rest/v1/douce_products?*', route => route.fulfill({
    status:200, contentType:'application/json', body:JSON.stringify(rows)
  }));
}
test.beforeEach(async ({page})=>{
  await mockCatalog(page);
  await page.goto('/');
  await expect(page.locator('#ageGate')).toBeVisible();
  await page.locator('#ageYes').click();
  await expect(page.locator('#ageGate')).toBeHidden();
});

test('public listing loads remote products and filters safely', async({page},testInfo)=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await expect(page.locator('.card')).toHaveCount(4);
  await expect(page.locator('#catalogStatus')).toContainText('4 produtos');
  await page.locator('#productSearch').fill('melzinho');
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('#productSearch').clear();
  await page.locator('.chip').getByText('Acessórios').click();
  await expect(page.locator('.card')).toHaveCount(1);
  await page.locator('.chip').getByText('Todos').click();
  await page.locator('#goHome').click();
  await page.screenshot({path:'test-results/'+testInfo.project.name+'-catalog.png',fullPage:true});
  expect(errors).toEqual([]);
});

test('cart and demo checkout never process payment or alter remote stock',async({page})=>{
  const outward=[];
  page.on('request',request=>{if(/wa\.me|api\.mercadopago|stripe\.com/i.test(request.url()))outward.push(request.url())});
  await expect(page.locator('.card')).toHaveCount(4);
  await page.locator('.buy').first().click();
  await page.locator('#goCart').click();
  await expect(page.locator('#modalTotal')).toHaveText('R$ 30,00');
  await page.locator('.qty button').last().click();
  await expect(page.locator('#modalTotal')).toHaveText('R$ 60,00');
  await page.locator('#goCheckout').click();
  await expect(page.locator('#customerName')).toHaveValue('Cliente Teste');
  await expect(page.locator('#customerName')).toHaveAttribute('readonly');
  await page.locator('#placeOrder').click();
  await page.getByRole('button',{name:'Simular pagamento aprovado'}).click();
  await expect(page.locator('#paymentContent')).toContainText('fictício');
  await page.getByRole('button',{name:'Visualizar mensagem fictícia'}).click();
  await expect(page.locator('#demoMessage')).toContainText('NÃO ENVIADA');
  expect(outward).toEqual([]);
  await page.locator('#paymentModal [data-close]').click();
  await expect(page.locator('.card').first().locator('.stock')).toContainText('5 em estoque');
});

test('no active products means empty public catalog, not old static demo',async({page})=>{
  await mockCatalog(page,[]);
  await page.reload();
  await expect(page.locator('#catalogStatus')).toContainText('Nenhum produto publicado');
  await expect(page.locator('.card')).toHaveCount(0);
  await expect(page.locator('#grid')).toContainText('Nenhum produto publicado');
});

test('admin entry goes to separate authenticated management UI',async({page})=>{
  await page.locator('#goAdmin').click();
  await expect(page).toHaveURL(/\/admin\.html$/);
  await expect(page.locator('#email')).toHaveAttribute('type','email');
  await expect(page.locator('#password')).toHaveAttribute('type','password');
  await expect(page.locator('#productForm')).toBeAttached();
});
