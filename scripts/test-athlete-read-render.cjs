// Isolated synthetic records only. No server, credentials or Sheets requests.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const resolve = Module._resolveFilename
Module._resolveFilename = function (request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args) }
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, file) => {
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, file)
}
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { projectAthleteRows } = require('../lib/athlete-read-domain.ts')
const { AthleteReadDetail } = require('../components/athletes/athlete-read-detail.tsx')
const { AthletesReadClient } = require('../components/athletes/athletes-read-client.tsx')
const [athlete] = projectAthleteRows([['id_athlete', 'nom_complet', 'id_national', 'id_wa', 'date_naissance', 'lieu_naissance'], ['00001', 'Fixture de test', 'PRIVATE_NATIONAL_SENTINEL', 'WA_FIXTURE', '2000-02-29', 'Lieu fixture']], [])
for (const html of [renderToStaticMarkup(React.createElement(AthletesReadClient, { athletes: [athlete] })), renderToStaticMarkup(React.createElement(AthleteReadDetail, { athlete, onBack: () => {} }))]) {
  assert.ok(html.includes('00001')); assert.ok(html.includes('WA_FIXTURE'))
  assert.ok(!/PRIVATE_NATIONAL_SENTINEL|ID national|idNational|id_national/.test(html))
}
console.log('PASS public fixture: actual list/detail render federal ID and WA, never national identifier')
