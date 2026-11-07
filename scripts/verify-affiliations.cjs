const { chromium } = require('../../fevoco-managment/node_modules/playwright')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
;(async () => {
 const domain = await import(pathToFileURL(require('node:path').resolve('lib/feaco-affiliations-domain.ts')).href)
 const data = { affiliations: { athlete: [], coach: [], medecin: [] }, actors: Object.fromEntries(domain.affiliationKinds.map(kind => [kind,[{ [domain.affiliationSchema[kind].actor]: 'TEST', nom_complet: 'Acteur test' }]])), clubs:[{id_club:'0101001',nom_club:'Club test',id_entente:'0101',id_ligue:'01',statut:'INACTIF'}],ententes:[{id_entente:'0101',nom_entente:'Entente test',id_ligue:'01'}],ligues:[{id_ligue:'01',nom_ligue:'Ligue test'}],seasons:[{id_saison:'SAI006',nom_saison:'2026'}],statuses:['SAF001','SAF002'].map(id=>({id_statut_affiliation:id,nom_statut_affiliation:id})) }
 const failedReads = new Set(), failedWrites = new Set()
 const browser = await chromium.launch({ headless:true })
 try {
 const page = await browser.newPage(); page.setDefaultTimeout(300000)
 await page.route('**/api/**', async route => {
  const url = new URL(route.request().url()); const kind = url.pathname.split('/').at(-1)
  if (!domain.affiliationKinds.includes(kind)) return route.abort()
  if(route.request().method()==='GET' && !failedReads.has(kind)) { failedReads.add(kind); return route.fulfill({status:503,json:{message:'Erreur de connexion simulee'}}) }
  if(route.request().method()==='POST' && !failedWrites.has(kind)) { failedWrites.add(kind); return route.fulfill({status:409,json:{message:'Ecriture simulee refusee'}}) }
  try {
   if (route.request().method() !== 'GET') {
    const input=route.request().postDataJSON(); const action={POST:'create',PUT:'update',PATCH:'terminate'}[route.request().method()]
    const row=domain.prepareAffiliation(data,kind,input,action,'TEST-'+kind)
    const key=domain.affiliationSchema[kind].key
    data.affiliations[kind]=action==='create'?[...data.affiliations[kind],row]:data.affiliations[kind].map(old=>old[key]===row[key]?row:old)
   }
   await route.fulfill({json:domain.publicHistory(data,kind,'TEST')})
  } catch(e) { await route.fulfill({status:400,json:{message:e.message}}) }
 })
 await page.goto('http://127.0.0.1:3026/affiliations-qa',{waitUntil:'load',timeout:300000})
 for(const kind of domain.affiliationKinds) {
  const scope=page.getByTestId(kind)
  await scope.getByRole('button',{name:'Voir la fiche'}).click()
  await scope.getByRole('alert').filter({hasText:'Erreur de connexion simulee'}).waitFor()
  await scope.getByRole('button',{name:'Actualiser'}).click()
  await scope.getByText('Aucune affiliation enregistrée.').waitFor()
  await scope.getByRole('button',{name:'Ajouter une affiliation'}).click()
  let dialog=page.getByRole('dialog')
  await dialog.getByLabel('Club',{exact:true}).selectOption('0101001')
  await dialog.getByLabel('Saison',{exact:true}).selectOption('SAI006')
  await dialog.getByLabel('Date de début',{exact:true}).fill('01012024')
  await dialog.getByLabel('Statut',{exact:true}).selectOption('SAF001')
  await dialog.getByRole('button',{name:'Enregistrer',exact:true}).click()
  await dialog.getByRole('alert').filter({hasText:'Ecriture simulee refusee'}).waitFor()
  await dialog.getByRole('button',{name:'Enregistrer',exact:true}).click()
  await dialog.waitFor({state:'hidden'})
  await scope.getByText('Club test',{exact:true}).waitFor()
  await scope.getByRole('button',{name:'Corriger',exact:true}).click()
  dialog=page.getByRole('dialog'); await dialog.getByLabel('Observations').fill('Correction test')
  await dialog.getByRole('button',{name:'Enregistrer',exact:true}).click(); await dialog.waitFor({state:'hidden'})
  await scope.getByRole('button',{name:'Terminer',exact:true}).click()
  dialog=page.getByRole('dialog'); await dialog.getByLabel('Date de fin',{exact:true}).fill('02012024')
  await dialog.getByRole('button',{name:'Confirmer la fin'}).click();await dialog.waitFor({state:'hidden'})
  assert.equal(data.affiliations[kind][0].id_statut_affiliation,'SAF002')
  assert.equal(data.affiliations[kind][0][domain.affiliationSchema[kind].key],'TEST-'+kind)
  await scope.getByRole('tab',{name:'Licence',exact:true}).click()
  await scope.getByText('Le module Licences FEACO sera disponible prochainement.').waitFor()
  console.log(kind+': empty/create/correct/terminate/licence passed')
 }
 await page.getByTestId('athlete').getByRole('tab',{name:'Affiliations',exact:true}).click()
 await page.screenshot({path:'docs/affiliations-qa-desktop.png',fullPage:true})
 await page.setViewportSize({width:390,height:844})
 await page.screenshot({path:'docs/affiliations-qa-mobile.png',fullPage:true})
 } finally { await browser.close() }
})().catch(error=>{console.error(error);process.exitCode=1})
