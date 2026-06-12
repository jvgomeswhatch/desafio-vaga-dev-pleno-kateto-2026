import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const ADMIN_EMAIL = "admin@cratebr.com";
const ADMIN_PASSWORD = "senha123";

test.describe("CrateBr E2E", () => {
  test("submit form → card in Sem Contato → move card via selector", async ({
    page,
  }) => {
    // ── 1. Submit lead via landing page form ─────────────────────────────────
    await page.goto(BASE);

    const name = `E2E-${Date.now()}`;
    await page.getByLabel("Nome").fill(name);
    await page.getByLabel("Skin desejada").fill("AK-47 Redline");
    await page.getByLabel("WhatsApp").fill("11987654321");
    await page.getByRole("button", { name: /quero minha skin/i }).click();

    await expect(
      page.getByText(/entraremos em contato em breve/i)
    ).toBeVisible({ timeout: 30_000 });

    // ── 2. Login ──────────────────────────────────────────────────────────────
    await page.goto(`${BASE}/login`);

    await page.getByLabel("E-mail").fill(ADMIN_EMAIL);
    await page.getByLabel("Senha").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: /entrar/i }).click();

    await page.waitForURL(`${BASE}/dashboard`, { timeout: 30_000 });

    // ── 3. Card must appear in "Sem Contato" column ───────────────────────────
    const semContatoColumn = page.getByRole("region", { name: /sem contato/i }).or(
      page.locator('[aria-label="Sem Contato"]')
    );

    await expect(semContatoColumn.getByText(name)).toBeVisible({
      timeout: 30_000,
    });

    // ── 4. Move card to "Em Contato" via StatusSelector ──────────────────────
    const card = semContatoColumn.locator(
      `[style*="background: var(--color-bg-elevated)"]`,
      { hasText: name }
    ).first();

    const selector = card.getByRole("combobox", {
      name: /alterar status do lead/i,
    });
    await selector.selectOption("em_contato");

    // ── 5. Card must move to "Em Contato" column ──────────────────────────────
    const emContatoColumn = page.locator('[aria-label="Em Contato"]');

    await expect(emContatoColumn.getByText(name)).toBeVisible({
      timeout: 30_000,
    });

    // And must be gone from "Sem Contato"
    await expect(semContatoColumn.getByText(name)).toHaveCount(0);
  });
});
