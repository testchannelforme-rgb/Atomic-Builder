import fs from 'node:fs/promises';import path from 'node:path';
const DIR=path.join(process.cwd(),'data'),FILE=path.join(DIR,'guild-settings.json');let cache=null;
async function load(){if(cache)return cache;try{cache=JSON.parse(await fs.readFile(FILE,'utf8'));}catch{cache={};}return cache;}
async function save(){await fs.mkdir(DIR,{recursive:true});await fs.writeFile(FILE,JSON.stringify(cache,null,2),'utf8');}
export async function getGuildSettings(id){const a=await load();return a[id]||{};}
export async function setGuildSettings(id,patch){const a=await load();a[id]={...(a[id]||{}),...patch};await save();return a[id];}
