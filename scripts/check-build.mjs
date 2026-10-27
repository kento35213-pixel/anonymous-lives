import {readFileSync,existsSync} from 'node:fs';
import {PEOPLE} from '../dist/core.js';
const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
if(config.assets.directory!=='./dist')throw Error('Static assets must point to ./dist');
for(const name of ['index.html','style.css','app.js','stage.js','core.js','people.js','world.js','icon.svg']){
  if(!existsSync(new URL('../dist/'+name,import.meta.url)))throw Error('Missing static file: '+name);
}
if(PEOPLE.length!==61)throw Error('Incomplete person data');
console.log('Ready: 61 lives, 488 scenes. Static assets: dist/');
