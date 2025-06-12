import { test, expect } from '@playwright/test';

test.describe('Monitor de Gastos Parlamentares', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/');

    // Verifica se o título está presente
    await expect(page.locator('h1')).toContainText('Monitor de Gastos Parlamentares');

    // Verifica se a página de upload está visível
    await expect(page.locator('h2')).toContainText('Upload de Dados');
  });

  test('navegação entre páginas deve funcionar', async ({ page }) => {
    await page.goto('/');

    // Clica no botão Dashboard
    await page.getByRole('button', { name: /dashboard/i }).click();
    await expect(page.locator('h2')).toContainText('Dashboard de Análise');

    // Clica no botão Alertas
    await page.getByRole('button', { name: /alertas/i }).click();
    await expect(page.locator('h2')).toContainText('Alertas Detectados');

    // Clica no botão Relatórios
    await page.getByRole('button', { name: /relatórios/i }).click();
    await expect(page.locator('h2')).toContainText('Relatórios');

    // Volta para Upload
    await page.getByRole('button', { name: /upload/i }).click();
    await expect(page.locator('h2')).toContainText('Upload de Dados');
  });

  test('deve mostrar área de upload de arquivo', async ({ page }) => {
    await page.goto('/');

    // Verifica se a área de drop está presente
    const dropArea = page.locator('text=Arraste e solte o arquivo CSV aqui');
    await expect(dropArea).toBeVisible();

    // Verifica se o botão de selecionar arquivo está presente
    const selectButton = page.getByRole('button', { name: /selecionar arquivo/i });
    await expect(selectButton).toBeVisible();
  });
});
