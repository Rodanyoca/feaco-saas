import { test } from 'node:test'
import assert from 'node:assert/strict'
import { affiliationKinds, affiliationSchema, prepareAffiliation, publicHistory, rows, headers } from './feaco-affiliations-domain.ts'
export function fixture() {
  return {
    affiliations: { athlete: [], coach: [], medecin: [] },
    actors: Object.fromEntries(affiliationKinds.map(kind => [kind, [{ [affiliationSchema[kind].actor]: 'TEST', nom_complet: 'Acteur test', id_wa: 'WA-TEST' }]])),
    clubs: [{ id_club: '0101001', nom_club: 'Club test', id_entente: '0101', id_ligue: '01', statut: 'INACTIF' }],
    ententes: [{ id_entente: '0101', nom_entente: 'Entente test', id_ligue: '01' }], ligues: [{ id_ligue: '01', nom_ligue: 'Ligue test' }],
    seasons: [{ id_saison: 'SAI006', nom_saison: '2026' }], statuses: ['SAF001', 'SAF002', 'SAF099'].map(id => ({ id_statut_affiliation: id, nom_statut_affiliation: id })),
  }
}
const input = { actorId: 'TEST', clubId: '0101001', seasonId: 'SAI006', dateDebut: '01012024', dateFin: '', statusId: 'SAF001', observations: '' }
for (const kind of affiliationKinds) {
  test(`${kind}: exact mapping, create/correct/terminate preserve IDs and other history`, () => {
    const data = fixture(), schema = affiliationSchema[kind]
    assert.deepEqual(rows([headers(kind)], headers(kind)), [])
    const row = prepareAffiliation(data, kind, input, 'create', 'FIRST')
    assert.equal(row.id_saison, 'SAI006'); assert.equal(row.date_debut, '2024-01-01')
    data.affiliations[kind].push(row, { ...row, [schema.key]: 'SECOND' })
    const before = structuredClone(data.affiliations[kind][1])
    const corrected = prepareAffiliation(data, kind, { ...input, id: 'FIRST', observations: 'Correction' }, 'update', 'IGNORED')
    assert.equal(corrected[schema.key], 'FIRST'); assert.equal(corrected.observations, 'Correction')
    data.affiliations[kind][0] = corrected
    const ended = prepareAffiliation(data, kind, { actorId: 'TEST', id: 'FIRST', dateFin: '02012024', clubId: 'EVIL' }, 'terminate', 'IGNORED')
    assert.deepEqual(ended, { ...corrected, date_fin: '2024-01-02', id_statut_affiliation: 'SAF002' })
    assert.deepEqual(data.affiliations[kind][1], before)
    assert.equal(publicHistory(data, kind, 'TEST').clubs[0].ligue, 'Ligue test')
    assert.equal(publicHistory(data, kind, 'TEST').items.length, 2)
    data.clubs = []
    assert.equal(prepareAffiliation(data, kind, { actorId: 'TEST', id: 'FIRST', dateFin: '02012024' }, 'terminate', '').id_club, '0101001')
    assert.equal(publicHistory(data, kind, 'TEST').items[0].clubId, '0101001')
  })
  for (const [label, patch] of Object.entries({ actor: { actorId: 'UNKNOWN' }, club: { clubId: 'UNKNOWN' }, season: { seasonId: 'UNKNOWN' }, status: { statusId: 'UNKNOWN' }, calendar: { dateDebut: '31022024' }, order: { dateFin: '31122023' }, terminated: { statusId: 'SAF002' }, other: { statusId: 'SAF099' } })) {
    test(`${kind}: rejects invalid ${label}`, () => assert.throws(() => prepareAffiliation(fixture(), kind, { ...input, ...patch }, 'create', 'ID')))
  }
  test(`${kind}: ownership, nonunique ID, failures leave simulated storage unchanged`, () => {
    const data = fixture(), row = prepareAffiliation(data, kind, input, 'create', 'ID')
    data.affiliations[kind] = [row, { ...row }]
    const before = structuredClone(data)
    assert.throws(() => prepareAffiliation(data, kind, { ...input, id: 'ID' }, 'update', ''))
    assert.deepEqual(data, before)
    assert.throws(() => rows([['wrong']], headers(kind)))
    assert.throws(() => prepareAffiliation(data, kind, { ...input, id: 'MISSING', dateFin: '02012024' }, 'terminate', ''))
  })
}

import { territoryAccess } from './territory-access.ts'
test('local access: rejects foreign hosts, origins and non-JSON writes', () => {
 assert.equal(territoryAccess(new Request('http://127.0.0.1:3026/api/affiliations/athlete')), null)
 assert.equal(territoryAccess(new Request('https://example.com/api/affiliations/athlete')), 403)
 assert.equal(territoryAccess(new Request('http://127.0.0.1:3026/api/affiliations/athlete', { method:'POST', headers:{origin:'https://evil.example','content-type':'application/json'} })), 403)
 assert.equal(territoryAccess(new Request('http://127.0.0.1:3026/api/affiliations/athlete', { method:'POST', headers:{origin:'http://127.0.0.1:3026','content-type':'text/plain'} })), 415)
 assert.equal(territoryAccess(new Request('http://127.0.0.1:3026/api/affiliations/athlete', { method:'POST', headers:{origin:'http://127.0.0.1:3026','content-type':'application/json'} })), null)
})

test('public history projects only affiliation fields and territorial display references', () => {
 const data=fixture();data.actors.athlete[0].id_national='PRIVATE-NATIONAL';data.clubs[0].email_club='PRIVATE-EMAIL';
 data.affiliations.athlete.push({...prepareAffiliation(data,'athlete',input,'create','ID'),unexpected_private:'PRIVATE-DATA'})
 const payload=JSON.stringify(publicHistory(data,'athlete','TEST'));assert.equal(payload.includes('PRIVATE-'),false);assert.equal(payload.includes('id_national'),false)
})
