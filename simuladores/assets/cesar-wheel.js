(() => {
  'use strict';
  const ALPHABET=[...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'];
  const N=ALPHABET.length;
  const $=id=>document.getElementById(id);
  const mod=(value,modulus)=>((value%modulus)+modulus)%modulus;
  const stage=$('wheelStage');
  if(!stage)return;

  function ensureLetters(){
    if(!$('wheelOuter').children.length){
      ALPHABET.forEach(letter=>{
        const node=document.createElement('span');
        node.className='wheel-letter outer';
        node.textContent=letter;
        $('wheelOuter').appendChild(node);
      });
    }
    if(!$('wheelInner').children.length){
      ALPHABET.forEach(letter=>{
        const node=document.createElement('span');
        node.className='wheel-letter inner';
        node.textContent=letter;
        $('wheelInner').appendChild(node);
      });
    }
  }

  function place(node,angle,radius){
    node.style.transform=`translate(-50%,-50%) rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg)`;
  }

  function render(){
    ensureLetters();
    const size=stage.clientWidth||520;
    const outerRadius=size*.445;
    const innerRadius=size*.315;
    const key=Number($('key').value);
    const encrypting=$('encrypt').getAttribute('aria-pressed')==='true';
    const direction=encrypting?1:-1;
    const step=360/N;
    const outputForA=ALPHABET[mod(direction*key,N)];
    const examples=[0,1,N-1].map(index=>`${ALPHABET[index]}→${ALPHABET[mod(index+direction*key,N)]}`);

    [...$('wheelOuter').children].forEach((node,index)=>{
      const angle=-90+index*step;
      place(node,angle,outerRadius);
      node.classList.toggle('active',index===0);
    });
    [...$('wheelInner').children].forEach((node,index)=>{
      const angle=-90+index*step-direction*key*step;
      place(node,angle,innerRadius);
      node.classList.toggle('active',index===mod(direction*key,N));
    });

    $('wheelBadge').textContent=`k = ${key}`;
    $('wheelKey').textContent=`k = ${key}`;
    $('wheelMode').textContent=encrypting?'Cifrar':'Descifrar';
    $('wheelPair').textContent=`A → ${outputForA}`;
    $('wheelSummary').innerHTML=`<strong>${encrypting?'Lectura de cifrado':'Lectura de descifrado'}:</strong> ${examples.join(', ')}. Cada pareja se obtiene leyendo desde el disco exterior hacia el interior.`;
    $('wheelDescription').textContent=`Rueda César de 27 letras en modo ${encrypting?'cifrado':'descifrado'}, con clave ${key}. La letra A del disco exterior se alinea con ${outputForA} en el disco interior.`;
  }

  function stepKey(delta){
    $('key').value=mod(Number($('key').value)+delta,N);
    $('key').dispatchEvent(new Event('input',{bubbles:true}));
  }

  $('wheelPrev').addEventListener('click',()=>stepKey(-1));
  $('wheelNext').addEventListener('click',()=>stepKey(1));
  $('key').addEventListener('input',()=>requestAnimationFrame(render));
  $('encrypt').addEventListener('click',()=>requestAnimationFrame(render));
  $('decrypt').addEventListener('click',()=>requestAnimationFrame(render));
  new MutationObserver(render).observe($('formula'),{childList:true,characterData:true,subtree:true});
  if('ResizeObserver' in window)new ResizeObserver(render).observe(stage);else window.addEventListener('resize',render);
  render();
})();
