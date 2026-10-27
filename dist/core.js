import {PEOPLE as JAPAN,eraOf} from './people.js';
import {WORLD} from './world.js';
export const PEOPLE=[...JAPAN,...WORLD];
export {eraOf};
export function normalizeName(s){return String(s??'').normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/[\s・･.。,，、'’\-ー＝=()（）「」『』]/g,'').trim()}
export function matchesAnswer(person,answer){const n=normalizeName(answer);return n.length>1&&person.aliases.some(x=>normalizeName(x)===n)}
export function filterPeople(era='all',region='all'){return PEOPLE.filter(p=>(era==='all'||eraOf(p)===era)&&(region==='all'||(region==='japan'?p.region==='日本':p.region!=='日本')))}
export function shuffle(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function pickPerson(pool,records={},recent=[],rng=Math.random){if(!pool.length)return null;let available=pool.filter(p=>!records[p.id]);if(!available.length)available=pool.filter(p=>!recent.includes(p.id));if(!available.length)available=pool;return available[Math.floor(rng()*available.length)]}
export function makeChoices(p,rng=Math.random){const pool=shuffle(PEOPLE.filter(q=>q.id!==p.id),rng).sort((a,b)=>{const weight=q=>(eraOf(q)===eraOf(p)?5:0)+(q.field===p.field?3:0)+(q.region===p.region?2:0);return weight(b)-weight(a)});return shuffle([p,...pool.slice(0,3)],rng)}
export function calculateScore({progress=0,mistakes=0,choices=false,hint=false}){return Math.max(100,Math.round(1000-Math.min(1,Math.max(0,progress))*650-mistakes*75-(choices?100:0)-(hint?80:0)))}
export function yearLabel(year){return year<0?`紀元前${Math.abs(year)}年`:`${year}年`}
export function lifeDates(p){return `${p.bornLabel||yearLabel(p.born)} — ${p.diedLabel||yearLabel(p.died)}`}
export function ageAt(p,event){if(event.scene==='birth')return '誕生';if(p.id==='murasaki'&&event.scene==='farewell')return '没年不詳';if(p.id==='earhart'&&event.scene==='farewell')return '消息不明';return `約${Math.max(0,event.year-p.born)}歳`}
export const STORE_KEY='anonymous-lives-v1';
export function emptyStats(){return {version:1,games:0,correct:0,best:0,records:{},recent:[],last:null}}
export function readStats(storage){try{const s=JSON.parse(storage.getItem(STORE_KEY));if(!s||s.version!==1||!s.records||typeof s.records!=='object'||Array.isArray(s.records))return emptyStats();return {...emptyStats(),...s,records:Object.fromEntries(Object.entries(s.records).filter(([id,r])=>PEOPLE.some(p=>p.id===id)&&r&&typeof r==='object')),games:Math.max(0,Number(s.games)||0),correct:Math.max(0,Number(s.correct)||0),best:Math.max(0,Number(s.best)||0),recent:Array.isArray(s.recent)?s.recent:[]}}catch{return emptyStats()}}
export function recordGame(stats,game){const p=game.person,old=stats.records[p.id];const score=game.correct?game.score:0;return {...stats,games:stats.games+1,correct:stats.correct+(game.correct?1:0),best:Math.max(stats.best,score),recent:[p.id,...stats.recent.filter(id=>id!==p.id)].slice(0,8),last:p.id,records:{...stats.records,[p.id]:{seen:(old?.seen||0)+1,correct:(old?.correct||0)+(game.correct?1:0),best:Math.max(old?.best||0,score),at:Date.now()}}}}
