import test from "node:test"
import assert from "node:assert/strict"
import { AthleteReadError, athleteReadConfiguration, FEACO_ACTORS_WORKBOOK, FEACO_REFERENCES_WORKBOOK, projectAthleteRows, loadAthleteReadSnapshot } from "./athlete-read-domain.ts"

test("real empty sheet stays empty, including header-only sheets", async () => {
  for (const athletes of [[], [["id_athlete", "nom_complet", "id_national"]]]) {
    assert.deepEqual(await loadAthleteReadSnapshot(async () => ({ athletes, sexes: [] })), { athletes: [], source: "FEACO_ATHLETES" })
  }
})
test("public whitelist preserves federal identity and optional WA, never private cells", () => {
  const [record] = projectAthleteRows([["id_athlete", "nom_complet", "id_national", "id_wa", "date_naissance", "lieu_naissance", "id_sexe", "numero_passeport"], ["00001", "Fixture test", "PRIVATE_NATIONAL_SENTINEL", "WA1", "2000-02-29", "Lieu", "S1", "PRIVATE_PASSPORT_SENTINEL"]], [["id_sexe", "nom_sexe"], ["S1", "Féminin"]])
  assert.equal(record.idAthlete, "00001"); assert.equal(record.idWa, "WA1")
  assert.equal(record.lieuNaissance, "Lieu"); assert.equal(record.sexe, "Féminin")
  assert.equal(record.dateDeNaissance, "2000-02-29")
  assert.ok(!JSON.stringify(record).includes("PRIVATE_"))
  assert.ok(!Object.keys(record).some(key => /id.?national/i.test(key)))
  assert.equal(projectAthleteRows([["id_athlete", "nom_complet"], ["A1", "Fixture"]], [])[0].idWa, "")
})
test("legacy birth aliases remain readable without inventing dates", () => {
  const [record] = projectAthleteRows([["id_athlete", "nom_complet", "date_de_naissance", "lieu_de_naissance"], ["A1", "Fixture", "", "Alias"]], [])
  assert.equal(record.dateNaissance, ""); assert.equal(record.lieuNaissance, "Alias")
})
test("failed reads never fall back to fixtures and sanitize SDK errors", async () => {
  await assert.rejects(loadAthleteReadSnapshot(async () => { throw new Error("PRIVATE_CREDENTIAL_SENTINEL") }), error => error instanceof AthleteReadError && error.status === 503 && !error.message.includes("PRIVATE_"))
})
test("configuration cannot select another federation or missing credentials", () => {
  assert.throws(() => athleteReadConfiguration({}), /Configuration manquante/)
  assert.throws(() => athleteReadConfiguration({ FEACO_ACTEURS_SPREADSHEET_ID: "OTHER", FEACO_REFERENTIELS_SPREADSHEET_ID: FEACO_REFERENCES_WORKBOOK }), /ressources FEACO/)
  assert.throws(() => athleteReadConfiguration({ FEACO_ACTEURS_SPREADSHEET_ID: FEACO_ACTORS_WORKBOOK, FEACO_REFERENTIELS_SPREADSHEET_ID: FEACO_REFERENCES_WORKBOOK }), /GOOGLE_CLIENT_EMAIL/)
})
test("invalid schema and duplicate federal IDs produce errors, not false empty lists", () => {
  assert.throws(() => projectAthleteRows([["wrong"], ["value"]], []), AthleteReadError)
  assert.throws(() => projectAthleteRows([["id_athlete", "nom_complet"], ["A1", "One"], ["A1", "Two"]], []), /dupliqué/)
})
