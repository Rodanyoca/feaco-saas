// Isolated live, read-only preview. Never copies .env files or writes to Sheets.
const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const root = path.resolve(__dirname, '..')
const preview = path.join(root, '.actors-qa', 'athletes-read-preview')
require('@next/env').loadEnvConfig(root, true)
const expected = require(path.join(root, 'docs', 'feaco-sheets-schema.json')).workbooks.find(book => book.title === '02_FEACO_ACTEURS')
if (!expected || process.env.FEACO_ACTEURS_SPREADSHEET_ID?.trim() !== expected.id || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.FEACO_REFERENTIELS_SPREADSHEET_ID) {
  console.error('Configuration FEACO manquante ou incompatible ; aucune valeur affichée.')
  process.exit(1)
}
fs.mkdirSync(preview, { recursive: true })
const ignore = path.join(root, '.actors-qa', '.gitignore')
if (!fs.existsSync(ignore) || !fs.readFileSync(ignore, 'utf8').includes('athletes-read-preview/')) fs.appendFileSync(ignore, '\nathletes-read-preview/\n')
for (const name of ['app', 'components', 'lib', 'hooks', 'public']) {
  fs.cpSync(path.join(root, name), path.join(preview, name), { recursive: true, filter: (src, dst) => fs.statSync(src).isDirectory() || !fs.existsSync(dst) || !fs.readFileSync(src).equals(fs.readFileSync(dst)) })
}
fs.copyFileSync(path.join(root, 'postcss.config.mjs'), path.join(preview, 'postcss.config.mjs'))
fs.writeFileSync(path.join(preview, 'package.json'), JSON.stringify({ name: 'feaco-athletes-read-preview', private: true }))
fs.writeFileSync(path.join(preview, 'next.config.mjs'), 'export default { distDir: ".next", serverExternalPackages: ["googleapis"], experimental: {cpus: 2}, images: {unoptimized:true} }\n')
if (!fs.existsSync(path.join(preview, 'tsconfig.json'))) fs.writeFileSync(path.join(preview, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES6', lib: ['dom', 'esnext'], strict: true, skipLibCheck: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', jsx: 'react-jsx', resolveJsonModule: true, paths: {'@/*': ['./*']} }, include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'], exclude: ['node_modules'] }))
// Additional protection for this preview, including all other copied API routes.
fs.writeFileSync(path.join(preview, 'proxy.ts'), 'import {NextRequest,NextResponse} from "next/server"\nexport function proxy(request:NextRequest){if(!["GET","HEAD","OPTIONS"].includes(request.method))return NextResponse.json({message:"Prévisualisation en lecture seule."},{status:405});return NextResponse.next()}\nexport const config={matcher:["/api/:path*"]}\n')
const env = {...process.env, NODE_ENV:'development', FEACO_TERRITORY_QA:'0', FEACO_TERRITORY_TEST_FIXTURE:'0'}
const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'dev', preview, '--webpack', '--hostname', '127.0.0.1', '--port', '3037'], { cwd: root, env, stdio:'inherit' })
server.on('exit', code => {process.exitCode = code || 0})
