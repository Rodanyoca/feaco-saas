const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '../../fevoco-managment/node_modules/playwright')
const fs = require('node:fs')
fs.mkdirSync('docs/actors-qa', {recursive:true})
const base = process.env.ACTORS_QA_URL || 'http://127.0.0.1:3027'
async function field(dialog, label, value) {
  await dialog.getByText(label, { exact: true }).locator('..').locator('input').fill(value)
}
;(async () => {
 const browser = await chromium.launch({ headless: true })
 try {
  const page = await browser.newPage({ viewport:{width:1440,height:900} })
  page.setDefaultTimeout(120000)
  const errors=[], writes=[]
  page.on('pageerror', error => {errors.push(error.message);console.error('PAGEERROR',error.message)})
  await page.route('**/api/**', async route => {
   if (['POST','PATCH','DELETE'].includes(route.request().method())) {
    writes.push({method:route.request().method(),url:route.request().url()})
    return route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({message:'Test local : sauvegarde indisponible.'})})
   }
   return route.continue()
  })
  for (const path of (process.env.ACTORS_QA_ROUTES || 'athletes,coachs,arbitres,medecins,officiels,autres-acteurs').split(',')) {
   console.log('CHECK '+path)
   await page.goto(`${base}/${path}`,{waitUntil:'domcontentloaded',timeout:600000})
   assert.equal(await page.locator('thead th').first().textContent(),'ID f\u00e9d\u00e9ral',path)
   assert.equal(await page.locator('thead').getByText('Licence',{exact:true}).count(),0)
   assert.equal(await page.locator('thead').getByText('ID FIVB',{exact:true}).count(),0)
   const size=page.getByRole('combobox',{name:'Nombre de lignes',exact:true})
   await size.getByText('10',{exact:true}).waitFor()
   console.log('READY '+path)
   await page.screenshot({path:'docs/actors-qa/'+path+'-desktop.png',fullPage:true})
   await size.click();await page.getByRole('option',{name:'25',exact:true}).click()
   assert.ok((await size.textContent()).includes('25'))
   const search=page.locator('input[type=search], input[placeholder^=Rechercher], input[placeholder^=Nom]').first()
   await search.fill('zzzz-absent')
   assert.equal(await page.getByRole('button',{name:/^Voir /}).count(),0)
   await search.fill('')
   const federalId=(await page.locator('tbody tr').first().locator('td').first().textContent()).trim()
   await search.fill(federalId)
   assert.equal(await page.getByRole('button',{name:/^Voir /}).count(),1)
   const firstView=page.getByRole('button',{name:/^Voir /}).first(), actorName=await firstView.getAttribute('aria-label')
   await firstView.click()
   await page.getByRole('button',{name:/^Modifier/}).first().click()
   let dialog=page.getByRole('dialog')
   await dialog.waitFor()
   assert.ok(await dialog.getByRole('status').count())
   await field(dialog,'Nom complet *','Identite modifiee fictive')
   let before=writes.length
   await dialog.locator('form').getByRole('button',{name:/^(Enregistrer|Cr\u00e9er|Ajouter)/}).click()
   await dialog.getByText('Test local : sauvegarde indisponible.',{exact:true}).waitFor()
   assert.equal(writes.length,before+1); assert.equal(writes.at(-1).method,'PATCH');console.log('PASS '+path+' edit refusal')
   await dialog.getByRole('button',{name:'Annuler',exact:true}).click()
   await page.getByRole('button',{name:/Retour.*la liste/}).click()
   assert.ok(await page.getByRole('button',{name:actorName,exact:true}).count())
   assert.equal(await search.inputValue(),federalId)
   assert.ok((await size.textContent()).includes('25'))
   await search.fill('')
   await page.getByRole('button',{name:/^(Cr\u00e9er|Ajouter un autre acteur)/}).first().click()
   dialog=page.getByRole('dialog')
   await field(dialog,'Nom complet *','Identite creee fictive')
   await dialog.getByText('Sexe *',{exact:true}).locator('..').getByRole('combobox').click()
   await page.getByRole('option').first().click()
   if(path==='autres-acteurs') {
    await dialog.locator('label').filter({hasText:/Type/}).locator('..').getByRole('combobox').click()
    await page.getByRole('option').first().click()
   }
   before=writes.length
   if(path==='athletes') {
    const date=dialog.getByPlaceholder('JJMMAAAA',{exact:true})
    await date.fill('31022024');assert.equal(await date.inputValue(),'31/02/2024')
    await dialog.locator('form').getByRole('button',{name:/^(Enregistrer|Cr\u00e9er|Ajouter)/}).click()
    assert.equal(await date.evaluate(input=>input.checkValidity()),false)
    assert.equal(writes.length,before)
    await date.fill('29022024');assert.equal(await date.inputValue(),'29/02/2024');assert.equal(await date.evaluate(input=>input.checkValidity()),true)
    await date.fill('');assert.equal(await date.inputValue(),'');assert.equal(await date.evaluate(input=>input.checkValidity()),true)
   }
   await page.screenshot({path:'docs/actors-qa/'+path+'-identity-form.png',fullPage:true})
   await dialog.locator('form').getByRole('button',{name:/^(Enregistrer|Cr\u00e9er|Ajouter)/}).click()
   await dialog.getByText('Test local : sauvegarde indisponible.',{exact:true}).waitFor()
   assert.equal(writes.length,before+1);assert.equal(writes.at(-1).method,'POST')
   await page.keyboard.press('Escape'); await dialog.waitFor({state:'hidden'})
   assert.equal(await page.getByText('Identite creee fictive',{exact:true}).count(),0)
   await page.setViewportSize({width:390,height:844})
   await page.screenshot({path:'docs/actors-qa/'+path+'-mobile.png',fullPage:true})
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path+' mobile overflow')
   await page.setViewportSize({width:1440,height:900})
   console.log('PASS '+path+': list, search, detail/back, create/edit refusal, cancel, mobile')
  }
  assert.deepEqual(errors,[])
 } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1})