'use strict';
(() => {
 const data=window.GLOSSARY_DATA||[], UI=window.StudyUI, prefix='crypto-glossary-v1';
 const list=document.getElementById('termList'), search=document.getElementById('searchInput'), select=document.getElementById('catSelect');
 const chips=document.getElementById('categoryChips'), lettersBox=document.getElementById('letterFilters'), empty=document.getElementById('empty');
 const doneSet=new Set(JSON.parse(localStorage.getItem(`${prefix}:done`)||'[]'));
 let currentCat='all',currentLetter='all';
 const categories=[...new Set(data.map(x=>x.cat))].sort((a,b)=>a.localeCompare(b,'es'));
 const letters=[...new Set(data.map(x=>x.term[0].toUpperCase()))].sort((a,b)=>a.localeCompare(b,'es'));
 function save(){localStorage.setItem(`${prefix}:done`,JSON.stringify([...doneSet]));}
 function updateProgress(){
   document.getElementById('progressText').textContent=`${doneSet.size} / ${data.length}`;
   document.getElementById('progressBar').style.width=`${data.length?doneSet.size/data.length*100:0}%`;
   const stat=document.getElementById('studiedStat');if(stat)stat.textContent=doneSet.size;
 }
 function makeFilterButton(text,value,kind){
   const b=UI.el('button',text,kind==='cat'?'chip cat-chip':'letter');b.type='button';b.dataset[kind]=value;
   b.addEventListener('click',()=>{if(kind==='cat'){currentCat=value;select.value=value;[...chips.children].forEach(x=>x.classList.toggle('active',x===b))}
     else{currentLetter=value;[...lettersBox.children].forEach(x=>x.classList.toggle('active',x===b))}applyFilters()});return b;
 }
 function buildFilters(){
   select.innerHTML='<option value="all">Todas las categorías</option>';
   categories.forEach(c=>{const o=UI.el('option',c);o.value=c;select.append(o)});
   chips.append(makeFilterButton('Todas','all','cat'));categories.forEach(c=>chips.append(makeFilterButton(c,c,'cat')));
   lettersBox.append(makeFilterButton('Todas','all','letter'));letters.forEach(l=>lettersBox.append(makeFilterButton(l,l,'letter')));
   chips.firstElementChild.classList.add('active');lettersBox.firstElementChild.classList.add('active');
 }
 function makeCard(item,i){
   const card=UI.el('article',null,'term-card');card.id=`term-${i+1}`;card.dataset.cat=item.cat;card.dataset.letter=item.term[0].toUpperCase();
   card.dataset.search=UI.normalize([item.term,item.cat,item.short,item.definition,item.context,item.example,item.formula,...item.related].join(' '));
   if(doneSet.has(i))card.classList.add('done-card');
   const head=UI.el('header',null,'term-head'), info=UI.el('div'), actions=UI.el('div',null,'term-actions');
   info.append(UI.el('span',String(i+1).padStart(2,'0'),'pill'),UI.el('span',item.cat,'tag'),UI.el('h2',item.term),UI.el('p',item.short,'short'));
   const done=UI.el('button','✓','icon-btn done-btn');done.type='button';done.title='Marcar como estudiado';done.setAttribute('aria-label',`Marcar ${item.term} como estudiado`);
   if(doneSet.has(i))done.classList.add('marked');
   const toggle=UI.el('button','Ver definición','toggle');toggle.type='button';toggle.setAttribute('aria-expanded','false');
   actions.append(done,toggle);head.append(info,actions);
   const def=UI.el('section',null,'definition');
   const blocks=[['Definición desarrollada',item.definition],['Cómo aparece en el módulo',item.context],['Ejemplo de estudio',item.example]];
   blocks.forEach(([t,p])=>{const b=UI.el('div',null,'block');b.append(UI.el('strong',t),UI.el('p',p));def.append(b)});
   if(item.formula)def.append(UI.el('div',item.formula,'formula'));
   const rel=UI.el('div',null,'related');item.related.forEach(x=>rel.append(UI.el('span',x)));def.append(rel);
   const study=UI.el('div',null,'study-row');study.append(UI.el('span','Usá este término para repasar antes del modo examen.'));
   const up=UI.el('a','Volver arriba');up.href='#top';study.append(up);def.append(study);
   toggle.addEventListener('click',()=>{const open=card.classList.toggle('open');toggle.classList.toggle('open',open);toggle.textContent=open?'Ocultar definición':'Ver definición';toggle.setAttribute('aria-expanded',String(open))});
   done.addEventListener('click',()=>{if(doneSet.has(i))doneSet.delete(i);else doneSet.add(i);card.classList.toggle('done-card',doneSet.has(i));done.classList.toggle('marked',doneSet.has(i));save();updateProgress()});
   card.append(head,def);return card;
 }
 function render(){const frag=document.createDocumentFragment();data.forEach((x,i)=>frag.append(makeCard(x,i)));list.append(frag)}
 function cards(){return [...document.querySelectorAll('.term-card')]}
 function applyFilters(){
   const q=UI.normalize(search.value.trim());let visible=0;
   cards().forEach(c=>{const show=(!q||c.dataset.search.includes(q))&&(currentCat==='all'||c.dataset.cat===currentCat)&&(currentLetter==='all'||c.dataset.letter===currentLetter);c.classList.toggle('hidden',!show);if(show)visible++});
   empty.classList.toggle('show',visible===0);const stat=document.getElementById('visibleStat');if(stat)stat.textContent=visible;
 }
 function openCard(card){card.classList.add('open');const b=card.querySelector('.toggle');b.classList.add('open');b.textContent='Ocultar definición';b.setAttribute('aria-expanded','true')}
 function closeAll(){cards().forEach(c=>{c.classList.remove('open');const b=c.querySelector('.toggle');b.classList.remove('open');b.textContent='Ver definición';b.setAttribute('aria-expanded','false')})}
 buildFilters();render();UI.loadPrefs(prefix);UI.bindPrefs(prefix);updateProgress();applyFilters();
 search.addEventListener('input',applyFilters);select.addEventListener('change',e=>{currentCat=e.target.value;[...chips.children].forEach(x=>x.classList.toggle('active',x.dataset.cat===currentCat));applyFilters()});
 document.getElementById('openAll').addEventListener('click',()=>cards().filter(c=>!c.classList.contains('hidden')).forEach(openCard));
 document.getElementById('closeAll').addEventListener('click',closeAll);
 const random=()=>{const c=UI.scrollRandom(cards());if(c)openCard(c)};
 document.getElementById('randomBtn').addEventListener('click',random);
 document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('¿Reiniciar todo el progreso del glosario?')){doneSet.clear();save();cards().forEach(c=>{c.classList.remove('done-card');c.querySelector('.done-btn').classList.remove('marked')});updateProgress()}});
 UI.bindKeyboard(search,random,closeAll);
})();
