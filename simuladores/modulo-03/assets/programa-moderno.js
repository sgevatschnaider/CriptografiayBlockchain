(() => {
  'use strict';
  const THEMES = ['nocturno','claro','contraste','oceano'];
  const THEME_KEY = 'crypto-modern-theme';
  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

  function applyTheme(theme) {
    const selected = THEMES.includes(theme) ? theme : 'nocturno';
    document.documentElement.dataset.theme = selected;
    try { localStorage.setItem(THEME_KEY, selected); } catch {}
    $$('[data-theme-select]').forEach((select) => select.value = selected);
  }

  function initTheme() {
    let selected = 'nocturno';
    try { selected = localStorage.getItem(THEME_KEY) || 'nocturno'; } catch {}
    applyTheme(selected);
    $$('[data-theme-select]').forEach((select) => {
      select.addEventListener('change', () => applyTheme(select.value));
    });
  }

  function safe(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
  }

  function setStatus(id, text, kind='') {
    const el=$(id); if(!el) return;
    el.textContent=text; el.className=`status ${kind}`.trim(); el.setAttribute('role','status');
  }

  function initClassification() {
    const scenario=$('scenario'), result=$('classification-result');
    if(!scenario || !result) return;
    const cases={
      archivo:'Necesitás confidencialidad e integridad para datos voluminosos: elegí AEAD simétrico, por ejemplo AES-GCM o ChaCha20-Poly1305.',
      firma:'Necesitás verificabilidad pública: elegí una firma como ECDSA, EdDSA o RSA-PSS.',
      sesion:'Necesitás acordar material secreto: usá ECDH/X25519 o un KEM; luego HKDF y AEAD.',
      password:'Necesitás resistir prueba de candidatos: usá Argon2id, scrypt, bcrypt o PBKDF2 con salt y costo.',
      hash:'Necesitás huella sin clave: usá SHA-256/SHA-3; para autenticación, HMAC.',
      certificado:'Necesitás asociar identidad y clave pública: usá certificados, PKI y validación.'
    };
    scenario.addEventListener('change',()=>result.textContent=cases[scenario.value]||'Seleccioná un problema.');
    $$('.family-card').forEach(card=>card.addEventListener('click',()=>{
      $$('.family-card').forEach(c=>c.classList.remove('active')); card.classList.add('active');
      setStatus('family-detail',card.dataset.detail,'good');
    }));
  }

  function initSymmetric() {
    const size=$('message-size'), hardware=$('hardware'), output=$('symmetric-bars');
    if(!size||!hardware||!output) return;
    function render(){
      const mb=Number(size.value), accel=hardware.value==='aes';
      const rows=[
        ['AES-GCM', accel?95:68, 'AEAD · bloque'],
        ['ChaCha20-Poly1305', accel?75:94, 'AEAD · flujo'],
        ['AES-CTR + HMAC', accel?78:56, 'Composición manual'],
        ['AES-CBC + HMAC', accel?58:42, 'Padding + MAC']
      ];
      output.innerHTML=rows.map(([name,base,note])=>{
        const score=Math.max(8,Math.round(base-Math.log2(Math.max(1,mb))*2));
        return `<div class="diagram-bar"><strong>${name}</strong><div class="bar-track"><div class="bar-fill" style="--w:${score}%"></div></div><span>${score}/100</span><small class="muted">${note}</small></div>`;
      }).join('');
      $('message-size-label').textContent=`${mb} MB`;
    }
    size.addEventListener('input',render); hardware.addEventListener('change',render); render();
    const padInput=$('padding-length'), padOut=$('padding-bytes');
    if(padInput&&padOut){
      const draw=()=>{
        const len=Math.max(0,Math.min(32,Number(padInput.value)));
        const realPad=len%16===0?16:16-(len%16);
        const bytes=[...Array(len)].map((_,i)=>`<span class="byte">${(i+1).toString(16).padStart(2,'0')}</span>`).join('');
        const pads=[...Array(realPad)].map(()=>`<span class="byte" style="border-color:var(--warn)">${realPad.toString(16).padStart(2,'0')}</span>`).join('');
        padOut.innerHTML=bytes+pads;
        setStatus('padding-status',`Entrada: ${len} bytes. PKCS#7 agrega ${realPad} byte(s) con valor decimal ${realPad}.`,'good');
      };
      padInput.addEventListener('input',draw); draw();
    }
  }

  function initHybrid() {
    const method=$('hybrid-method'), auth=$('hybrid-auth'), flow=$('hybrid-flow');
    if(!method||!auth||!flow) return;
    function render(){
      const m=method.value, authenticated=auth.checked;
      const configs={
        rsa:['RSA-OAEP','encapsula una clave aleatoria','HKDF opcional','AES-GCM'],
        ecdh:['ECDH/X25519','acuerda un secreto','HKDF','AES-GCM'],
        hpke:['KEM','encapsula un secreto','KDF','AEAD']
      };
      const nodes=configs[m];
      flow.innerHTML=nodes.map((n,i)=>`<div class="flow-node"><strong>${i+1}. ${n}</strong><p class="muted">${i===0?'Componente asimétrico':i===nodes.length-1?'Protege los datos':'Separa y deriva material'}</p></div>${i<nodes.length-1?'<div class="flow-arrow">→</div>':''}`).join('');
      setStatus('mitm-status', authenticated?
        'Las claves públicas están autenticadas: el intermediario no puede sustituirlas sin ser detectado.':
        'Sin autenticación, un intermediario puede establecer dos secretos distintos y reenviar mensajes.',authenticated?'good':'warn');
    }
    method.addEventListener('change',render); auth.addEventListener('change',render); render();
  }

  async function pbkdf2Hex(password,salt,iterations=8000){
    if(!crypto?.subtle) throw new Error('Web Crypto no está disponible.');
    const enc=new TextEncoder();
    const material=await crypto.subtle.importKey('raw',enc.encode(password.normalize('NFC')),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations},material,128);
    return [...new Uint8Array(bits)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function initPasswordAttack() {
    const target=$('demo-password'), mode=$('attack-mode'), run=$('run-attack');
    if(!target||!mode||!run) return;
    const dictionaries={
      breve:['admin','123456','password','qwerty','mate2026','profesor','argentina'],
      ampliado:['bienvenido','educacion','seguridad','criptografia','sergio2026','mate2024','mate2025','mate2026','docente2026','blockchain'],
      pin:[...Array(10000)].map((_,i)=>String(i).padStart(4,'0')),
      mascara:['verano2024','verano2025','verano2026','invierno2026','primavera2026','otoño2026','Clave2026!']
    };
    run.addEventListener('click',async()=>{
      run.disabled=true; setStatus('attack-status','Preparando objetivo y candidatos…');
      try{
        const pwd=target.value, salt='laboratorio-publico-2026', iterations=Number($('attack-iterations').value);
        const objective=await pbkdf2Hex(pwd,salt,iterations);
        $('target-hash').textContent=objective;
        const candidates=dictionaries[mode.value]||dictionaries.breve;
        const start=performance.now(); let found=null; let attempts=0;
        for(const candidate of candidates){
          attempts++;
          if(await pbkdf2Hex(candidate,salt,iterations)===objective){found=candidate;break;}
          if(attempts%100===0) await new Promise(r=>setTimeout(r,0));
        }
        const elapsed=performance.now()-start;
        $('attack-attempts').textContent=attempts.toLocaleString('es-AR');
        $('attack-time').textContent=`${elapsed.toFixed(1)} ms`;
        $('attack-rate').textContent=`${Math.max(1,Math.round(attempts/(elapsed/1000))).toLocaleString('es-AR')}/s`;
        if(found) setStatus('attack-status',`Contraseña ficticia recuperada: "${found}". La salt no impidió probar candidatos; la KDF elevó el costo de cada intento.`,'bad');
        else setStatus('attack-status','El conjunto elegido no contenía la contraseña. Esto no prueba fortaleza: solo limita este ataque concreto.','warn');
      }catch(error){setStatus('attack-status',error.message||String(error),'bad');}
      run.disabled=false;
    });
  }

  function initMaps(){
    const detail=$('map-detail'); if(!detail) return;
    $$('.mind-node').forEach(node=>node.addEventListener('click',()=>{
      $$('.mind-node').forEach(n=>n.classList.remove('active')); node.classList.add('active');
      detail.innerHTML=`<h3>${safe(node.dataset.title)}</h3><p>${safe(node.dataset.detail)}</p><p><strong>Pregunta de control:</strong> ${safe(node.dataset.question)}</p>`;
    }));
  }

  const TERMS = Array.isArray(window.ModernTerms) ? window.ModernTerms : [];
  function initGlossary(){
    const grid=$('glossary-grid'), search=$('glossary-search'); if(!grid||!search) return;
    function render(){
      const q=search.value.trim().toLocaleLowerCase('es');
      const items=TERMS.filter(t=>t.join(' ').toLocaleLowerCase('es').includes(q));
      grid.innerHTML=items.map(([term,def,ex,contrast])=>`<article class="term"><h3>${safe(term)}</h3><p>${safe(def)}</p><p><strong>Ejemplo:</strong> ${safe(ex)}</p><small>${safe(contrast)}</small></article>`).join('');
      $('glossary-count').textContent=`${items.length} de ${TERMS.length} términos`;
    }
    search.addEventListener('input',render); render();
  }

  const QUESTIONS = Array.isArray(window.ModernQuestions) ? window.ModernQuestions : [];
  function initQuiz(){
    const root=$('quiz-root'); if(!root||!QUESTIONS.length) return;
    let index=0,score=0,answered=false;
    function render(){
      const [cat,prompt,options,answer,explanation]=QUESTIONS[index];
      root.innerHTML=`<div class="tag">${safe(cat)}</div><h2>${index+1}. ${safe(prompt)}</h2><div id="quiz-options">${options.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${safe(o)}</button>`).join('')}</div><div id="quiz-feedback" class="status">Elegí una respuesta.</div><div class="actions"><button id="quiz-next" class="secondary" disabled>Siguiente</button></div>`;
      answered=false;
      $$('.quiz-option',root).forEach(btn=>btn.addEventListener('click',()=>{
        if(answered)return; answered=true; const chosen=Number(btn.dataset.answer);
        $$('.quiz-option',root).forEach((b,i)=>b.classList.add(i===answer?'correct':i===chosen?'wrong':''));
        if(chosen===answer)score++;
        setStatus('quiz-feedback',`${chosen===answer?'Correcto.':'Incorrecto.'} ${explanation}`,chosen===answer?'good':'bad');
        $('quiz-next').disabled=false;
      }));
      $('quiz-next').addEventListener('click',()=>{
        index++;
        if(index>=QUESTIONS.length){
          const pct=Math.round(score/QUESTIONS.length*100);
          root.innerHTML=`<h2>Resultado final</h2><div class="kpi-grid"><div class="kpi"><strong>${score}/${QUESTIONS.length}</strong><span>respuestas correctas</span></div><div class="kpi"><strong>${pct}%</strong><span>desempeño</span></div></div><div class="status ${pct>=70?'good':'warn'}">${pct>=70?'Dominio suficiente del programa.':'Conviene repasar la teoría y repetir el cuestionario.'}</div><div class="actions"><button id="quiz-restart">Reiniciar</button></div>`;
          $('quiz-restart').addEventListener('click',()=>{index=0;score=0;render();});
        } else render();
      });
    }
    render();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    initTheme();
    initClassification();
    initSymmetric();
    initHybrid();
    initPasswordAttack();
    initMaps();
    initGlossary();
    initQuiz();
  },{once:true});
  window.ModernProgram = Object.freeze({applyTheme,pbkdf2Hex,terms:TERMS,questions:QUESTIONS});
})();
