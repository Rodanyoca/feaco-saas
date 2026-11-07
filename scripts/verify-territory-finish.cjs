const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'../../fevoco-managment/node_modules/playwright')
const assert=require('node:assert/strict'),fs=require('node:fs/promises')
const base=process.env.TERRITORY_TEST_URL||'http://127.0.0.1:3016'
;(async()=>{
 const browser=await chromium.launch({headless:true})
 const context=await browser.newContext({viewport:{width:390,height:844}})
 const page=await context.newPage();page.setDefaultTimeout(300000)
 const report={source:'test',checks:[],errors:[]}
 page.on('pageerror',error=>report.errors.push(error.message))
 const check=message=>{report.checks.push(message);console.log(message)}
 try {
  const all={}
  for(const kind of ['ligues','ententes','clubs']) {
   const response=await context.request.get(base+'/api/'+kind,{timeout:300000})
   assert.equal(response.status(),200)
   const body=await response.json();assert.equal(body.source,'test');all[kind]=body[kind]
  }
  assert.equal(all.ligues.length,26);assert.equal(all.ligues[0].idLigue,'01');assert.equal(all.ligues[0].nomLigue,'Ligue test simulee')
  assert.equal(all.ententes.length,1);assert.equal(all.ententes[0].idEntente,'0101');assert.equal(all.ententes[0].nomEntente,'Entente test modifiee');assert.equal(all.ententes[0].nomLigue,'Ligue test simulee')
  assert.equal(all.clubs.length,1);assert.equal(all.clubs[0].idClub,'0101001');assert.equal(all.clubs[0].codeClub,'001');assert.equal(all.clubs[0].nomClub,'Club test modifie');assert.equal(all.clubs[0].idLigue,'01');assert.equal(all.clubs[0].idEntente,'0101');assert.equal(all.clubs[0].nomEntente,'Entente test modifiee')
  check('API : modifications conservees en memoire pour ligue, entente et club ; codes et noms des parents corrects')
  for(const [kind,title,search] of [['ligues','Ligues','Rechercher une ligue...'],['ententes','Ententes','Rechercher une entente...'],['clubs','Clubs','Rechercher un club...']]) {
   await page.goto(base+'/'+kind,{waitUntil:'load',timeout:300000})
   await page.getByRole('heading',{name:title,exact:true}).waitFor()
   await page.evaluate(()=>document.fonts.ready)
   const dimensions=await page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}))
   assert.equal(dimensions.content,dimensions.width,kind+JSON.stringify(dimensions))
   await page.screenshot({path:'docs/territory-qa/'+kind+'-mobile.png',fullPage:true})
   await page.getByPlaceholder(search).fill('AUCUN_RESULTAT_TEST')
   await page.locator('p:visible').filter({hasText:/^Aucune donn\u00e9e trouv\u00e9e$/}).waitFor()
   await page.screenshot({path:'docs/territory-qa/'+kind+'-mobile-vide.png',fullPage:true})
   check('Mobile '+kind+' : largeur 390 px et recherche vide visible')
  }
  assert.equal(report.errors.length,0,report.errors.join('\n'))
  check('Aucune erreur JavaScript sur les trois pages mobiles')
 }catch(error){report.failure=error.message;await page.screenshot({path:'docs/territory-qa/failure-final.png',fullPage:true}).catch(()=>{});throw error}
 finally{await fs.writeFile('docs/territory-qa/results-final.json',JSON.stringify(report,null,2));await browser.close()}
})().catch(error=>{console.error(error.message);process.exitCode=1})