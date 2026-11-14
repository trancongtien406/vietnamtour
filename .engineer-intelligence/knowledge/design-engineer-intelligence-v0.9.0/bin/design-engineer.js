#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '0.9.0';
const args = process.argv.slice(2);
const command = args[0] || 'help';

function value(flag, fallback) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
function targetArg() { return args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : process.cwd(); }
function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); }
function copyDir(src,dst){
  ensureDir(dst);
  for (const ent of fs.readdirSync(src,{withFileTypes:true})) {
    const s=path.join(src,ent.name), d=path.join(dst,ent.name);
    if(ent.isDirectory()) copyDir(s,d); else fs.copyFileSync(s,d);
  }
}
function rm(p){ if(fs.existsSync(p)) fs.rmSync(p,{recursive:true,force:true}); }
function install(target, client){
  if(!fs.existsSync(target)) throw new Error(`Target does not exist: ${target}`);
  const clients = client === 'both' ? ['claude','cursor'] : [client];
  for (const c of clients) {
    if(c === 'claude') {
      const base=path.join(target,'.claude'); ensureDir(base);
      rm(path.join(base,'skills')); copyDir(path.join(ROOT,'skills'),path.join(base,'skills'));
      rm(path.join(base,'commands')); copyDir(path.join(ROOT,'commands'),path.join(base,'commands'));
    } else if(c === 'cursor') {
      const base=path.join(target,'.cursor'); ensureDir(base);
      rm(path.join(base,'skills')); copyDir(path.join(ROOT,'skills'),path.join(base,'skills'));
      ensureDir(path.join(base,'rules'));
      fs.copyFileSync(path.join(ROOT,'.cursor','rules','design-engineer.mdc'),path.join(base,'rules','design-engineer.mdc'));
      rm(path.join(base,'commands')); copyDir(path.join(ROOT,'commands'),path.join(base,'commands'));
    } else throw new Error('client must be claude, cursor, or both');
  }
  fs.writeFileSync(path.join(target,'.design-engineer-version'), VERSION+'\n');
  console.log(`Installed Design Engineer Intelligence v${VERSION} -> ${target} (${client})`);
}
function init(target){
  const dst=path.join(target,'.design-engineer'); ensureDir(dst);
  for(const f of fs.readdirSync(path.join(ROOT,'templates','project-memory'))) {
    const out=path.join(dst,f); if(!fs.existsSync(out)) fs.copyFileSync(path.join(ROOT,'templates','project-memory',f),out);
  }
  console.log(`Initialized project memory -> ${dst}`);
}
function validate(){
  const errors=[];
  const required=['README.md','AGENTS.md','references/core-principles.md','references/structural-invariants.md','references/admin-shell-invariants.md','evals/cases.json'];
  for(const r of required) if(!fs.existsSync(path.join(ROOT,r))) errors.push(`missing ${r}`);
  const skillRoot=path.join(ROOT,'skills');
  for(const d of fs.readdirSync(skillRoot,{withFileTypes:true}).filter(x=>x.isDirectory())){
    const f=path.join(skillRoot,d.name,'SKILL.md');
    if(!fs.existsSync(f)) errors.push(`missing skills/${d.name}/SKILL.md`);
    else {
      const t=fs.readFileSync(f,'utf8');
      if(!t.startsWith('---\n')) errors.push(`${d.name}: missing YAML frontmatter`);
      if(!/\nname:\s*[^\n]+/.test(t)) errors.push(`${d.name}: missing name`);
      if(!/\ndescription:\s*[^\n]+/.test(t)) errors.push(`${d.name}: missing description`);
    }
  }
  if(errors.length){ console.error(errors.join('\n')); process.exit(1); }
  console.log(`OK: Design Engineer Intelligence v${VERSION} validated (${fs.readdirSync(skillRoot).length} skills)`);
}
function doctor(target){
  const checks=[
    ['version',path.join(target,'.design-engineer-version')],
    ['claude skills',path.join(target,'.claude','skills')],
    ['cursor skills',path.join(target,'.cursor','skills')],
    ['project memory',path.join(target,'.design-engineer')]
  ];
  for(const [n,p] of checks) console.log(`${fs.existsSync(p)?'OK':'--'}  ${n}: ${p}`);
}
function inspect(target){
  const vf=path.join(target,'.design-engineer-version');
  console.log(JSON.stringify({target, installedVersion:fs.existsSync(vf)?fs.readFileSync(vf,'utf8').trim():null, localMasterVersion:VERSION},null,2));
}
function evalList(){
  const data=JSON.parse(fs.readFileSync(path.join(ROOT,'evals','cases.json'),'utf8'));
  console.log(`Design Engineer Intelligence v${data.version} eval cases`);
  for(const c of data.cases) console.log(`- ${c.id}: ${c.prompt}`);
  console.log('\nUse evals/STRUCTURAL-INVARIANTS.md, DIVERSITY.md and BLIND-COMPARISON.md as the benchmark protocol.');
}
function help(){
  console.log(`Design Engineer Intelligence v${VERSION}\n\nCommands:\n  design-engineer install <project> --client claude|cursor|both\n  design-engineer update <project> --client claude|cursor|both\n  design-engineer init <project>\n  design-engineer doctor <project>\n  design-engineer inspect <project>\n  design-engineer validate\n  design-engineer eval\n`);
}
try {
  if(command==='install'||command==='update') install(targetArg(), value('--client','both'));
  else if(command==='init') init(targetArg());
  else if(command==='doctor') doctor(targetArg());
  else if(command==='inspect') inspect(targetArg());
  else if(command==='validate') validate();
  else if(command==='eval') evalList();
  else help();
} catch(e){ console.error(`ERROR: ${e.message}`); process.exit(1); }
