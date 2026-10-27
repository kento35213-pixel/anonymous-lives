import test from 'node:test';
import assert from 'node:assert/strict';
import {PEOPLE,eraOf,filterPeople,pickPerson,makeChoices,matchesAnswer,calculateScore,readStats,recordGame,emptyStats} from '../dist/core.js';

test('61 complete life histories cover Japan, the world, and five birth eras',()=>{
  assert.equal(PEOPLE.length,61);assert.equal(new Set(PEOPLE.map(p=>p.id)).size,61);
  assert.equal(PEOPLE.filter(p=>p.region==='日本').length,24);
  for(const era of ['ancient','medieval','early','nineteenth','twentieth'])assert.ok(filterPeople(era).length);
  for(const p of PEOPLE){assert.equal(p.events.length,8,p.id);assert.equal(p.events[0].scene,'birth');assert.equal(p.events.at(-1).scene,'farewell');assert.equal(p.events[0].year,p.born);assert.equal(p.events.at(-1).year,p.died);assert.ok(p.died>p.born);assert.ok(p.summary&&p.title&&p.source[0]);assert.ok(p.source[1].startsWith('https://'));for(let i=1;i<8;i++)assert.ok(p.events[i].year>=p.events[i-1].year,`${p.id}: chronological order`);}
});

test('the digest does not disclose the subject name or unique aliases',()=>{
  for(const p of PEOPLE){const story=p.events.map(e=>e.title+' '+e.text).join(' ');for(const name of p.aliases.filter(x=>x.length>=3&&!/^[a-z ]+$/i.test(x)))assert.ok(!story.includes(name),`${p.id} discloses ${name}`)}
});

test('answer matching accepts common Japanese/English variants without unrelated names',()=>{
  const p=id=>PEOPLE.find(x=>x.id===id);
  assert.ok(matchesAnswer(p('ryoma'),'　坂本 竜馬　'));
  assert.ok(matchesAnswer(p('ryoma'),'サカモトリョウマ'));
  assert.ok(matchesAnswer(p('curie'),'Ｍａｒｉｅ　Ｃｕｒｉｅ'));
  assert.ok(matchesAnswer(p('newton'),'ニュートン'));
  assert.ok(matchesAnswer(p('wright'),'ライト兄弟'));
  assert.ok(matchesAnswer(p('keller'),'ヘレン・ケラー'));
  assert.ok(!matchesAnswer(p('ryoma'),'坂本'));
  assert.ok(!matchesAnswer(p('curie'),'アインシュタイン'));
  assert.ok(!matchesAnswer(p('king'),''));
  for(const person of PEOPLE)for(const alias of person.aliases)assert.ok(matchesAnswer(person,alias),person.id+' '+alias);
});

test('era and region filters include only qualifying people',()=>{
  for(const era of ['ancient','medieval','early','nineteenth','twentieth'])for(const p of filterPeople(era))assert.equal(eraOf(p),era);
  assert.equal(filterPeople('ancient','japan').length,0);
  assert.equal(filterPeople('all','world').length,37);
});

test('random selection prioritizes unseen lives and avoids recent repeats',()=>{
  const pool=PEOPLE.slice(0,5);const records=Object.fromEntries(pool.slice(0,4).map(p=>[p.id,{seen:1}]));
  for(let i=0;i<20;i++)assert.equal(pickPerson(pool,records).id,pool[4].id);
  const all=Object.fromEntries(pool.map(p=>[p.id,{seen:1}]));assert.equal(pickPerson(pool,all,pool.slice(0,4).map(p=>p.id)).id,pool[4].id);
  assert.equal(pickPerson([]),null);
});

test('all four-choice questions contain one correct person and three distinct distractors',()=>{
  for(const p of PEOPLE)for(let trial=0;trial<4;trial++){const options=makeChoices(p);assert.equal(options.length,4);assert.equal(new Set(options.map(q=>q.id)).size,4);assert.equal(options.filter(q=>q.id===p.id).length,1);}
});

test('scores decrease with progress and assistance, and are bounded',()=>{
  assert.equal(calculateScore({}),1000);assert.equal(calculateScore({progress:1}),350);
  assert.equal(calculateScore({choices:true,hint:true,mistakes:1}),745);
  let prev=1000;for(let progress=0;progress<=1;progress+=.05){const score=calculateScore({progress});assert.ok(score<=prev);prev=score;}
  assert.equal(calculateScore({progress:3,mistakes:999,choices:true,hint:true}),100);
});

test('one completed round preserves discovery, best score, and correct counts',()=>{
  const person=PEOPLE[0];let stats=emptyStats();stats=recordGame(stats,{person,correct:true,score:900});stats=recordGame(stats,{person,correct:false,score:0});
  assert.equal(stats.games,2);assert.equal(stats.correct,1);assert.equal(stats.records[person.id].seen,2);assert.equal(stats.records[person.id].best,900);assert.equal(stats.best,900);assert.equal(stats.recent.length,1);
  assert.deepEqual(readStats({getItem:()=>'{invalid'}),emptyStats());
  const restored=readStats({getItem:()=>JSON.stringify(stats)});assert.equal(restored.records[person.id].best,900);
});
