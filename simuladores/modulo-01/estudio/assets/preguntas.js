'use strict';
(() => {
 const data=window.QA_DATA||[],UI=window.StudyUI,prefix='crypto-qa-v1';
 const list=document.getElementById('qaList'),search=document.getElementById('searchInput'),select=document.getElementById('catSelect'),chips=document.getElementById('questionChips'),empty=document.getElementById('empty');
 const doneSet=new Set(JSON.parse(localStorage.getItem(`${prefix}:done`)||'[]'));let currentCat='all';
 const categories=[...new Set(data.map(x=>x.cat))].sort((a,b)=>a.localeCompare(b,'es'));
 function save(){localStorage.setItem(`${prefix}:done`,JSON.stringify([...doneSet]));}
 function updateProgress(){document.getElementById('progressText').textContent=`${doneSet.size} / ${data.length}`;document.getElementById('progressBar').style.width=`${data.length?doneSet.size/data.length*100:0}%`;(()=>{const stat=document.getElementById('studiedStat');if(stat)stat.textContent=doneSet.size})()}
 function makeChip(text,value){const b=UI.el('button',text,'chip');b.type='button';b.dataset.cat=value;b.addEventListener('click',()=>{currentCat=value;select.value=value;[...chips.children].forEach(x=>x.classList.toggle('active',x===b));applyFilters()});return b}
 function buildFilters(){select.innerHTML='<option value="all">Todas las categorías</option>';categories.forEach(c=>{const o=UI.el('option',c);o.value=c;select.append(o)});chips.append(makeChip('Todas','all'));categories.forEach(c=>chips.append(makeChip(c,c)));chips.firstElementChild.classList.add('active')}
 function makeCard(item,i){
  const card=UI.el('article',null,'qa-card');card.id=`q${i+1}`;card.dataset.cat=item.cat;card.dataset.search=UI.normalize([item.q,item.cat,item.level,...item.answer,item.formula,item.key].join(' '));if(doneSet.has(i))card.classList.add('done-card');
  const head=UI.el('header',null,'qa-head'),left=UI.el('div'),toggle=UI.el('button','Ver respuesta','toggle');toggle.type='button';toggle.setAttribute('aria-expanded','false');
  left.append(UI.el('span',String(i+1).padStart(2,'0'),'num'),UI.el('span',item.cat,'badge'),UI.el('span',item.level,'level'),UI.el('h2',item.q));head.append(left,toggle);
  const ans=UI.el('section',null,'answer');item.answer.forEach(p=>ans.append(UI.el('p',p)));if(item.formula)ans.append(UI.el('div',item.formula,'formula'));
  const key=UI.el('div',null,'block');key.append(UI.el('strong','Idea clave'),UI.el('p',item.key));ans.append(key);
  const row=UI.el('div',null,'study-row'),label=UI.el('label'),cb=document.createElement('input');cb.type='checkbox';cb.className='done';cb.checked=doneSet.has(i);label.append(cb,document.createTextNode(' Marcar como estudiada'));const up=UI.el('a','Volver arriba');up.href='#top';row.append(label,up);ans.append(row);
  toggle.addEventListener('click',()=>{const open=card.classList.toggle('open');toggle.classList.toggle('open',open);toggle.textContent=open?'Ocultar respuesta':'Ver respuesta';toggle.setAttribute('aria-expanded',String(open))});
  cb.addEventListener('change',()=>{if(cb.checked)doneSet.add(i);else doneSet.delete(i);card.classList.toggle('done-card',cb.checked);save();updateProgress()});
  card.append(head,ans);return card;
 }
 function render(){const f=document.createDocumentFragment();data.forEach((x,i)=>f.append(makeCard(x,i)));list.append(f)}
 function cards(){return [...document.querySelectorAll('.qa-card')]}
 function applyFilters(){const q=UI.normalize(search.value.trim());let visible=0;cards().forEach(c=>{const show=(!q||c.dataset.search.includes(q))&&(currentCat==='all'||c.dataset.cat===currentCat);c.classList.toggle('hidden',!show);if(show)visible++});empty.classList.toggle('show',visible===0);(()=>{const stat=document.getElementById('visibleStat');if(stat)stat.textContent=visible})()}
 function openCard(c){c.classList.add('open');const b=c.querySelector('.toggle');b.classList.add('open');b.textContent='Ocultar respuesta';b.setAttribute('aria-expanded','true')}
 function closeAll(){cards().forEach(c=>{c.classList.remove('open');const b=c.querySelector('.toggle');b.classList.remove('open');b.textContent='Ver respuesta';b.setAttribute('aria-expanded','false')})}
 buildFilters();render();UI.loadPrefs(prefix);UI.bindPrefs(prefix);updateProgress();applyFilters();
 search.addEventListener('input',applyFilters);select.addEventListener('change',e=>{currentCat=e.target.value;[...chips.children].forEach(x=>x.classList.toggle('active',x.dataset.cat===currentCat));applyFilters()});
 document.getElementById('openAll').addEventListener('click',()=>cards().filter(c=>!c.classList.contains('hidden')).forEach(openCard));document.getElementById('closeAll').addEventListener('click',closeAll);
 const random=()=>{const c=UI.scrollRandom(cards());if(c)openCard(c)};document.getElementById('randomBtn').addEventListener('click',random);
 document.getElementById('resetBtn').addEventListener('click',()=>{if(confirm('¿Reiniciar todo el progreso de preguntas?')){doneSet.clear();save();cards().forEach(c=>{c.classList.remove('done-card');c.querySelector('.done').checked=false});updateProgress()}});
 UI.bindKeyboard(search,random,closeAll);
})();
