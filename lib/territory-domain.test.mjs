import assert from 'node:assert/strict'
import test from 'node:test'
import { prepareTerritoryMutation as prepare, createTerritoryService, sheetRows, territoryHeaders } from './territory-domain.ts'
import { territoryAccess } from './territory-access.ts'
const fixture=()=>({ligues:[{id_ligue:'01',nom_ligue:'Test',id_province:'PRO01',statut:''}],ententes:[],clubs:[],provinces:[{id_province:'PRO01',nom_province:'Test'}],categories:[{id_categorie_club:'CAT1'}],sexes:[{id_sexe:'SEX1'}]})
const entente={idLigue:'01',codeEntente:'01',nomEntente:'Test',pseudoEntente:'TEST',emailEntente:'test@example.invalid',statut:''}
const club={idLigue:'01',idEntente:'0101',codeClub:'001',nomClub:'Test',idCategorieClub:'CAT1',idSexe:'SEX1',dateAffiliationClub:'29/02/2024',statut:''}
const withEntente=()=>{const data=fixture();data.ententes.push(prepare('ententes',entente,data).record);return data}
test('mapping par noms, texte et listes vides',()=>{
assert.equal(sheetRows([['nom_ligue','id_ligue'],['Test','01']],['id_ligue','nom_ligue'])[0].id_ligue,'01')
assert.deepEqual(sheetRows([territoryHeaders.clubs],territoryHeaders.clubs),[])
assert.throws(()=>sheetRows([['id_club']],territoryHeaders.clubs),/colonnes/)
})
test('ligues : codes 01-26, statut vide, unicité et ID immuable',()=>{
const data=fixture(),input={idLigue:'01',nomLigue:'Modifié',idProvince:'PRO01',statut:''}
assert.equal(prepare('ligues',input,data,'01').record.statut,'')
assert.throws(()=>prepare('ligues',input,data),/existe déjà/)
assert.throws(()=>prepare('ligues',{...input,idLigue:'27'},data),/01 et 26/)
assert.throws(()=>prepare('ligues',{...input,idLigue:'02'},data,'01'),/immuable/)
})
test('ententes : format, parents, pseudo/email et doublons',()=>{
const data=fixture(),result=prepare('ententes',entente,data)
assert.equal(result.id,'0101');assert.equal(result.record.pseudo_entente,'TEST');assert.equal(result.record.email_entente,entente.emailEntente)
assert.deepEqual(Object.keys(result.record).sort(),[...territoryHeaders.ententes].sort())
for(const change of [{codeEntente:'1'},{codeEntente:'001'},{idLigue:'02'}]) assert.throws(()=>prepare('ententes',{...entente,...change},data))
data.ententes.push(result.record)
assert.throws(()=>prepare('ententes',entente,data),/existe déjà/)
assert.throws(()=>prepare('ententes',{...entente,codeEntente:'02'},data,'0101'),/immuables/)
})
test('clubs : format, cohérence, dates et références',()=>{
const data=withEntente(),result=prepare('clubs',club,data)
assert.equal(result.id,'0101001');assert.equal(result.record.id_ligue,'01');assert.equal(result.record.date_affiliation,'2024-02-29');assert.equal(result.record.id_categorie,'CAT1')
const selectedEntenteOnly=prepare('clubs',{...club,idLigue:undefined},data);assert.equal(selectedEntenteOnly.record.id_entente,'0101');assert.equal(selectedEntenteOnly.record.id_ligue,'01')
assert.deepEqual(Object.keys(result.record).sort(),[...territoryHeaders.clubs].sort())
for(const change of [{idEntente:''},{idLigue:'02'},{codeClub:'1'},{idCategorieClub:'X'},{idSexe:'X'},{dateAffiliationClub:'31/02/2024'}]) assert.throws(()=>prepare('clubs',{...club,...change},data))
assert.equal(prepare('clubs',{...club,dateAffiliationClub:''},data).record.date_affiliation,'')
data.clubs.push(result.record)
assert.throws(()=>prepare('clubs',club,data),/existe déjà/)
assert.equal(prepare('clubs',{...club,nomClub:'Modifié'},data,'0101001').id,'0101001')
assert.throws(()=>prepare('clubs',{...club,codeClub:'002'},data,'0101001'),/immuables/)
})
test('service : créations/modifications simulées, persistance, erreurs et concurrence',async()=>{
let data=fixture(),writes=0,freshReads=0
const service=createTerritoryService({read:async fresh=>{if(fresh)freshReads++;return structuredClone(data)},save:async(kind,row,id)=>{writes++;if(id)data[kind]=data[kind].map(r=>r[territoryHeaders[kind][0]]===id?row:r);else data[kind].push(row)}})
await service.mutate('ligues',{idLigue:'02',nomLigue:'Autre',idProvince:'PRO01'})
await service.mutate('ligues',{idLigue:'02',nomLigue:'Modifié',idProvince:'PRO01'},'02')
await service.mutate('ententes',entente)
await service.mutate('ententes',{...entente,nomEntente:'Modifié'},'0101')
await service.mutate('clubs',club)
await service.mutate('clubs',{...club,nomClub:'Modifié'},'0101001')
assert.equal(writes,6);assert.equal(freshReads,6);assert.equal(data.clubs[0].id_club,'0101001')
const failing=createTerritoryService({read:async()=>fixture(),save:async()=>{throw new Error('REFUSÉ')}})
await assert.rejects(failing.mutate('ententes',entente),/REFUSÉ/)
const results=await Promise.allSettled([service.mutate('ententes',{...entente,codeEntente:'02'}),service.mutate('ententes',{...entente,codeEntente:'02'})])
assert.equal(results.filter(r=>r.status==='rejected').length,1)
})
test('accès local, origine, contenu et hôte distant',()=>{
const request=(host,method='GET',headers={})=>new Request('http://127.0.0.1:3016/api/ligues',{method,headers:{host,...headers}})
assert.equal(territoryAccess(request('127.0.0.1:3016')),null)
assert.equal(territoryAccess(request('exemple.invalid')),403)
assert.equal(territoryAccess(request('localhost:3016','POST')),403)
assert.equal(territoryAccess(request('localhost:3016','POST',{origin:'http://localhost:3016','content-type':'application/json'})),null)
assert.equal(territoryAccess(request('localhost:3016','POST',{origin:'http://localhost:3016'})),415)
})