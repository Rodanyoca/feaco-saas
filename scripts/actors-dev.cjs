const fs=require('node:fs'), path=require('node:path'), http=require('node:http')
const {spawn}=require('node:child_process')
const root=path.resolve(__dirname,'..'), preview=path.join(root,'.actors-qa','preview-run')
fs.mkdirSync(preview,{recursive:true})
fs.writeFileSync(path.join(root,'.actors-qa','.gitignore'),'preview*/\n')
for(const name of ['app','components','lib','hooks','public']) {
 const target=path.join(preview,name)
 if(path.dirname(target)!==preview)throw new Error('Unsafe QA path')
 if(fs.existsSync(target)&&fs.lstatSync(target).isSymbolicLink())fs.unlinkSync(target)
 fs.cpSync(path.join(root,name),target,{recursive:true,filter:(src,dst)=>fs.statSync(src).isDirectory()||!fs.existsSync(dst)||!fs.readFileSync(src).equals(fs.readFileSync(dst))})
}
if(!fs.existsSync(path.join(preview,'postcss.config.mjs')))fs.copyFileSync(path.join(root,'postcss.config.mjs'),path.join(preview,'postcss.config.mjs'))
if(!fs.existsSync(path.join(preview,'package.json')))fs.writeFileSync(path.join(preview,'package.json'),JSON.stringify({name:'feaco-actors-qa',private:true}))
if(!fs.existsSync(path.join(preview,'tsconfig.json')))fs.writeFileSync(path.join(preview,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES6',lib:['dom','esnext'],strict:true,skipLibCheck:true,noEmit:true,esModuleInterop:true,module:'esnext',moduleResolution:'bundler',jsx:'react-jsx',resolveJsonModule:true,paths:{'@/*':['./*']}},include:['next-env.d.ts','**/*.ts','**/*.tsx'],exclude:['node_modules']}))
// CLI dev mode has its own router and generated files, entirely below preview.
const nextBin=require.resolve('next/dist/bin/next')
const server=spawn(process.execPath,[nextBin,'dev',preview,'--webpack','--hostname','127.0.0.1','--port','3027'],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']})
let checking=false
const output=data=>{
 const text=data.toString();process.stdout.write(text)
 if(!checking&&/Ready in/.test(text)&&process.argv.includes('--verify')){
  checking=true
  const test=spawn(process.execPath,[path.join(root,'scripts','verify-actors.cjs')],{cwd:root,stdio:'inherit',env:process.env})
  test.on('exit',code=>{process.exitCode=code===0?0:1;spawn('taskkill',['/PID',String(server.pid),'/T','/F'],{stdio:'ignore'}).on('exit',()=>process.exit(process.exitCode))})
 }
}
server.stdout.on('data',output);server.stderr.on('data',output)
server.on('exit',code=>{if(!checking)process.exitCode=code||1})
console.log('QA server process',server.pid)