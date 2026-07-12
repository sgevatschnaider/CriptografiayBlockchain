const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const te=new TextEncoder(),td=new TextDecoder();
function mod(a,n){return((Number(a)%Number(n))+Number(n))%Number(n)}
function gcd(a,b){a=Math.abs(Number(a));b=Math.abs(Number(b));while(b)[a,b]=[b,a%b];return a}
function egcd(a,b){let [or,r]=[Number(a),Number(b)],[os,s]=[1,0],[ot,t]=[0,1];while(r){const q=Math.floor(or/r);[or,r]=[r,or-q*r];[os,s]=[s,os-q*s];[ot,t]=[t,ot-q*t]}return{g:or,x:os,y:ot}}
function powMod(base,exp,m){base=BigInt(mod(base,m));exp=BigInt(exp);m=BigInt(m);let out=1n;while(exp>0){if(exp&1n)out=out*base%m;base=base*base%m;exp>>=1n}return Number(out)}
function randomInt(min,max){const span=max-min+1;const x=new Uint32Array(1);crypto.getRandomValues(x);return min+(x[0]%span)}
function bytesToHex(bytes){return[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
function hexToBytes(hex){if(hex.length%2)throw new Error('Hexadecimal inválido');const out=new Uint8Array(hex.length/2);for(let i=0;i<out.length;i++)out[i]=parseInt(hex.slice(i*2,i*2+2),16);return out}
function bytesToB64(bytes){let s='';for(const b of new Uint8Array(bytes))s+=String.fromCharCode(b);return btoa(s)}
function b64ToBytes(s){const raw=atob(s);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
async function sha256(text){return bytesToHex(await crypto.subtle.digest('SHA-256',te.encode(String(text))))}
function bitDifference(hexA,hexB){let d=0;for(let i=0;i<Math.min(hexA.length,hexB.length);i++){let x=parseInt(hexA[i],16)^parseInt(hexB[i],16);while(x){d+=x&1;x>>=1}}return d}
function setStatus(el,msg,type=''){el.textContent=msg;el.className=`status ${type}`.trim()}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function downloadText(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function xorBytes(a,b){const n=Math.min(a.length,b.length),o=new Uint8Array(n);for(let i=0;i<n;i++)o[i]=a[i]^b[i];return o}
function entropyOfText(text){if(!text.length)return 0;const f={};for(const c of text)f[c]=(f[c]||0)+1;return Object.values(f).reduce((h,n)=>{const p=n/text.length;return h-p*Math.log2(p)},0)}
function isProbablePrime(n){n=Number(n);if(n<2)return false;if(n%2===0)return n===2;for(let i=3;i*i<=n;i+=2)if(n%i===0)return false;return true}
function nav(){return `<div class="topbar"><div class="brand"><a href="index.html">🔐 Laboratorios de Criptografía</a></div><nav class="nav"><a href="https://github.com/sgevatschnaider/CriptografiayBlockchain" target="_blank" rel="noreferrer">Repositorio</a><a href="index.html">Todos los módulos</a></nav></div>`}
function footer(){return `<footer class="footer">Material educativo. Los algoritmos simplificados no deben utilizarse para proteger información real.</footer>`}
window.Lab={$, $$,te,td,mod,gcd,egcd,powMod,randomInt,bytesToHex,hexToBytes,bytesToB64,b64ToBytes,sha256,bitDifference,setStatus,escapeHtml,downloadText,xorBytes,entropyOfText,isProbablePrime,nav,footer};