const assert = require('node:assert/strict')
const fs = require('node:fs')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../fevoco-managment/node_modules/playwright')
const base = process.env.ATHLETES_LIVE_URL || 'http://127.0.0.1:3006'
;(async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    page.setDefaultTimeout(180000)
    const writes = [], errors = [], unrelated = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => { if (/\/api\/.*\/(affiliations|licences)/.test(request.url())) unrelated.push(request.url()) })
    await page.route('**/*', route => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())) { writes.push(route.request().method()); return route.abort() }
      return route.continue()
    })
    const response = await page.goto(base + '/athletes', { waitUntil: 'networkidle', timeout: 180000 })
    assert.equal(response.status(), 200)
    const html = await response.text()
    assert.ok(!/DEMO-ATHLETES|Athlète de démonstration|id_national|idNational/.test(html))
    await page.getByRole('combobox', { name: 'Nombre de lignes', exact: true }).getByText('10', { exact: true }).waitFor()
    const api = await page.request.get(base + '/api/athletes')
    assert.equal(api.status(), 200)
    assert.match(api.headers()['cache-control'], /private.*no-store/)
    const data = await api.json()
    assert.equal(data.source, 'FEACO_ATHLETES')
    assert.ok(!/id_national|idNational/.test(JSON.stringify(data)))
    if (process.env.ATHLETES_EXPECTED_COUNT !== undefined) assert.equal(data.athletes.length, Number(process.env.ATHLETES_EXPECTED_COUNT))
    assert.equal(await page.getByRole('button', { name: 'Créer un athlète', exact: true }).isDisabled(), true)
    assert.equal(await page.locator('thead').getByText('ID national', { exact: true }).count(), 0)
    if (!data.athletes.length) {
      assert.match(await page.locator('body').innerText(), /Aucun athlète enregistré/)
      assert.equal(await page.getByRole('button', { name: /^Voir / }).count(), 0)
      const missing = await page.request.get(base + '/api/athletes/NOT_PRESENT_IN_EMPTY_SHEET')
      assert.equal(missing.status(), 404)
    } else {
      const federalId = (await page.locator('tbody tr').first().locator('td').first().textContent()).trim()
      assert.ok(data.athletes.some(row => row.idAthlete === federalId))
      await page.getByRole('button', { name: /^Voir / }).first().click()
      assert.match(await page.locator('body').innerText(), /ID fédéral/)
      assert.equal(await page.getByText('ID national', { exact: true }).count(), 0)
      assert.equal(await page.getByRole('tab', { name: 'Affiliations', exact: true }).isDisabled(), true)
      await page.getByRole('button', { name: /Retour à la liste/ }).click()
    }
    fs.mkdirSync('docs/actors-live', { recursive: true })
    await page.screenshot({ path: 'docs/actors-live/athletes-desktop.png', fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await page.screenshot({ path: 'docs/actors-live/athletes-mobile.png', fullPage: true })
    assert.deepEqual(writes, []); assert.deepEqual(unrelated, []); assert.deepEqual(errors, [])
    const result = { route: '/athletes', source: data.source, rows: data.athletes.length, demo: false, nationalIdentifierExposed: false, writes: 0, affiliationsRequested: 0, mobileOverflow: false }
    fs.writeFileSync('docs/actors-live/results.json', JSON.stringify(result, null, 2))
    console.log(JSON.stringify(result))
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
