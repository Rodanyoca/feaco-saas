import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { actorIdentity, actorListItem, affiliationItem, clubIdForEntente, formatPerformance, individualResults, numericPerformance } from './feaco-domain.ts'
import { mapAthleteRow } from './mappers/athletes.ts'
import { mapClubRow } from './mappers/clubs.ts'

const schema = JSON.parse(readFileSync(new URL('../docs/feaco-sheets-schema.json', import.meta.url), 'utf8'))
test('préserve les 26 ligues et le format club documenté sans inventer le cas direct', () => {
  assert.deepEqual(schema.leagues.slice(1).map(r => r[0]), Array.from({length:26}, (_, i) => String(i + 1).padStart(2, '0')))
  assert.equal(clubIdForEntente('0101', '001'), '0101001')
  assert.throws(() => clubIdForEntente('01', '001'))
  assert.throws(() => clubIdForEntente('2701', '001'))
  assert.throws(() => clubIdForEntente('0101', '1'))
})
test('identifiants distincts et projection liste sans identité privée', () => {
  const row = {id_athlete:'ATH00001', id_national:'NAT1', id_wa:'WA1', nom_complet:'Test', numero_passeport:'PRIVE', passeport_drive_url:'PRIVE'}
  assert.deepEqual(actorIdentity('ATHLETES', row), {id:'ATH00001', nom:'Test', statut:'', idNational:'NAT1', idWa:'WA1'})
  assert.deepEqual(Object.keys(actorListItem('ATHLETES', row)), ['id','nom','statut'])
  const mapped = mapAthleteRow({...row, date_naissance:'2000-02-29', lieu_naissance:'Test'})
  assert.equal(mapped.idWa, 'WA1')
  assert.equal(mapped.dateNaissance, '2000-02-29')
  assert.equal(mapped.lieuNaissance, 'Test')
  assert.equal(mapClubRow({id_categorie:'CAT1'}).idCategorieClub, 'CAT1')
})
test('affiliations propres à chaque acteur, saison et statut sans licence ni transfert', () => {
  for (const kind of ['athlete','coach','medecin']) {
    const result = affiliationItem(kind, {[`id_affiliation_${kind}`]:'AFF1', [`id_${kind}`]:'ACT1', id_club:'0101001', id_saison:'SAI1', id_statut_affiliation:'STA1'})
    assert.deepEqual(result, {id:'AFF1', actorId:'ACT1', clubId:'0101001', saisonId:'SAI1', statutId:'STA1', dateDebut:'', dateFin:''})
  }
})
test('unités FEACO : temps, hauteur, poids, points, absence et arrondi', () => {
  assert.equal(formatPerformance('83,45','SECONDE'), '1 min 23,45 s')
  assert.equal(formatPerformance(59.999,'SECONDE'), '1 min 0,00 s')
  assert.equal(formatPerformance(0,'SECONDE'), '0,00 s')
  assert.equal(formatPerformance(1.95,'METRE'), '1,95 m')
  assert.equal(formatPerformance(14.32,'METRE'), '14,32 m')
  assert.equal(formatPerformance(6500,'POINT'), '6500 points')
  for (const value of ['', null, undefined, ' ']) assert.equal(formatPerformance(value,'METRE'), '')
  for (const value of [false, 'NM', NaN, Infinity, -1]) assert.throws(() => numericPerformance(value))
})
test('parcours local territoire → acteur → affiliation → épreuve → résultat, rang indépendant', () => {
  const clubId = clubIdForEntente('0101','001')
  const actor = actorIdentity('ATHLETES', {id_athlete:'ATH00001'})
  const affiliation = affiliationItem('athlete', {id_affiliation_athlete:'AFF1', id_athlete:actor.id, id_club:clubId, id_saison:'SAI1'})
  assert.equal(affiliation.clubId, '0101001')
  const references = schema.events.slice(1).map(([id_epreuve,,nom_epreuve,,unite_resultat,type_participation]) => ({id_epreuve,nom_epreuve,unite_resultat,type_participation}))
  for (const [id, performance, expected] of [['EPR001',11.42,'11,42 s'],['EPR015',1.95,'1,95 m'],['EPR019','','']]) {
    const tables = {references, events:[{id_competition:'ED1',id_competition_epreuve:'CE1',id_epreuve:id}], participants:[{id_competition_epreuve:'CE1',id_participation:'P1',id_athlete:affiliation.actorId}], phases:[{id_competition_epreuve:'CE1',id_phase_competition:'PH1'}], results:[{id_resultat:'R1',id_phase_competition:'PH1',id_participation:'P1',performance,rang:'7',id_statut_resultat:'TEST'}, {id_phase_competition:'AUTRE',id_participation:'P1',performance:999}]}
    const [result] = individualResults('ED1','CE1',tables)
    assert.equal(result.affichage, expected)
    assert.equal(result.rang, '7')
    assert.equal(result.athleteId, actor.id)
    assert.equal(individualResults('ED1','CE1',tables).length, 1)
    assert.deepEqual(individualResults('AUTRE','CE1',tables), [])
    tables.events[0].id_epreuve = 'EPR012'
    assert.throws(() => individualResults('ED1','CE1',tables))
  }
})
