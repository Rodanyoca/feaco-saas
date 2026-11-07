import test from "node:test"
import assert from "node:assert/strict"
import { mapAthleteRow } from "./mappers/athletes.ts"
import { mapCoachRow } from "./mappers/coachs.ts"
import { mapArbitreRow } from "./mappers/arbitres.ts"
import { mapMedecinRow } from "./mappers/medecins.ts"
import { mapOfficielRow } from "./mappers/officiels.ts"
import { mapAutreActeurRow } from "./mappers/autres-acteurs.ts"

test("FEACO headers: federal, national and optional WA identities stay distinct", () => {
  for (const [mapper, key] of [[mapAthleteRow,"athlete"],[mapCoachRow,"coach"],[mapArbitreRow,"arbitre"],[mapMedecinRow,"medecin"],[mapOfficielRow,"officiel"]]) {
    const row = mapper({["id_"+key]:"FED001", id_national:"NAT1", id_wa:"WA1", nom_complet:"Fictif", date_naissance:"2000-02-29"})
    assert.equal(row.id,"FED001"); assert.equal(row.idNational,"NAT1"); assert.equal(row.idWa,"WA1")
    assert.equal(row.dateNaissance,"2000-02-29")
    assert.equal(mapper({}).idWa,"")
  }
})
test("athlete birth place and birth date prefer FEACO headers and retain legacy aliases", () => {
  const canonical = mapAthleteRow({lieu_naissance:"Canonical",lieu_de_naissance:"Legacy",date_naissance:"2000-02-29",date_de_naissance:"1999-01-01"})
  assert.equal(canonical.lieuNaissance,"Canonical"); assert.equal(canonical.dateDeNaissance,"2000-02-29")
  const legacy = mapAthleteRow({lieu_de_naissance:"Legacy",date_de_naissance:"1999-01-01"})
  assert.equal(legacy.lieuNaissance,"Legacy"); assert.equal(legacy.dateNaissance,"1999-01-01")
  assert.equal(mapAthleteRow({}).dateNaissance,"")
})
test("referee uses configured grade header before its legacy alias", () => {
  assert.equal(mapArbitreRow({id_grade_arbitre:"G1",id_niveau:"OLD"}).idGrade,"G1")
  assert.equal(mapArbitreRow({id_niveau:"OLD"}).idGrade,"OLD")
})
test("AUTRES supports configured direct type label and canonical dates", () => {
  const row = mapAutreActeurRow({id_autre_acteur:"AUT1",type_autre_acteur:"Contact",date_naissance:"2000-02-29",lieu_naissance:"Lieu"},new Map(),new Map())
  assert.equal(row.typeAutreActeur,"Contact"); assert.equal(row.dateNaissance,"2000-02-29"); assert.equal(row.lieuNaissance,"Lieu")
})

import { paginateActorRows } from "./actor-list-state.ts"
test("pagination clamps after filtering and covers first, last and empty pages", () => {
 const rows = Array.from({length:23},(_,i)=>i+1)
 assert.deepEqual(paginateActorRows(rows,2,10).items,[11,12,13,14,15,16,17,18,19,20])
 assert.deepEqual(paginateActorRows(rows,99,10).items,[21,22,23])
 assert.equal(paginateActorRows(rows,1,25).pageCount,1)
 assert.deepEqual(paginateActorRows([],3,10),{items:[],page:1,pageCount:1,total:0})
 assert.equal(paginateActorRows(rows.slice(0,2),3,10).page,1)
})
