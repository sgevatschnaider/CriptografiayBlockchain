'use strict';
window.StudyUI = (() => {
  const root=document.documentElement, body=document.body;
  const palettes=['aurora','bosque','uva','carbono'];
  const normalize=s=>(s??'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function loadPrefs(prefix){
    const theme=localStorage.getItem(`${prefix}:theme`)||'light';
    const palette=localStorage.getItem(`${prefix}:palette`)||'aurora';
    const reading=localStorage.getItem(`${prefix}:reading`)||'1';
    const exam=localStorage.getItem(`${prefix}:exam`)==='true';
    root.dataset.theme=theme; root.dataset.palette=palette; root.style.setProperty('--reading',reading);
    const themeBtn=document.getElementById('themeBtn'), fontRange=document.getElementById('fontRange'), examMode=document.getElementById('examMode');
    if(themeBtn) themeBtn.textContent=theme==='dark'?'☀️ Tema claro':'🌙 Tema oscuro';
    if(fontRange) fontRange.value=reading;
    if(examMode){examMode.checked=exam;body.classList.toggle('exam',exam)}
  }
  function bindPrefs(prefix){
    document.getElementById('themeBtn')?.addEventListener('click',()=>{
      const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;
      localStorage.setItem(`${prefix}:theme`,next);
      document.getElementById('themeBtn').textContent=next==='dark'?'☀️ Tema claro':'🌙 Tema oscuro';
    });
    document.getElementById('paletteBtn')?.addEventListener('click',()=>{
      const i=(palettes.indexOf(root.dataset.palette)+1)%palettes.length;root.dataset.palette=palettes[i];
      localStorage.setItem(`${prefix}:palette`,palettes[i]);
    });
    document.getElementById('examMode')?.addEventListener('change',e=>{
      body.classList.toggle('exam',e.target.checked);localStorage.setItem(`${prefix}:exam`,String(e.target.checked));
    });
    document.getElementById('fontRange')?.addEventListener('input',e=>{
      root.style.setProperty('--reading',e.target.value);localStorage.setItem(`${prefix}:reading`,e.target.value);
    });
    document.getElementById('printBtn')?.addEventListener('click',()=>window.print());
  }
  function el(tag,text,className){
    const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(className)n.className=className;return n;
  }
  function scrollRandom(cards){
    const visible=cards.filter(c=>!c.classList.contains('hidden')),pool=visible.length?visible:cards;
    const card=pool[Math.floor(Math.random()*pool.length)];if(!card)return;
    card.scrollIntoView({behavior:'smooth',block:'center'});
    return card;
  }
  function bindKeyboard(search,randomFn,closeFn){
    document.addEventListener('keydown',e=>{
      if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();search?.focus()}
      if(e.key.toLowerCase()==='r'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();randomFn?.()}
      if(e.key==='Escape')closeFn?.();
    });
  }
  return {normalize,loadPrefs,bindPrefs,el,scrollRandom,bindKeyboard};
})();
