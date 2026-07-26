'use strict';
const $=id=>document.getElementById(id),A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ITA2={E:1,'\n':2,A:3,' ':4,S:5,I:6,U:7,'\r':8,D:9,R:10,J:11,N:12,F:13,C:14,K:15,T:16,Z:17,L:18,W:19,H:20,Y:21,P:22,Q:23,O:24,B:25,G:26,M:28,X:29,V:30};
const REV=Object.fromEntries(Object.entries(ITA2).map(([k,v])=>[v,k]));
const WHEEL_META={chi1:{group:'chi',len:41},chi2:{group:'chi',len:31},chi3:{group:'chi',len:29},chi4:{group:'chi',len:26},chi5:{group:'chi',len:23},mu37:{group:'mu',len:37},mu61:{group:'mu',len:61},psi1:{group:'psi',len:43},psi2:{group:'psi',len:47},psi3:{group:'psi',len:51},psi4:{group:'psi',len:53},psi5:{group:'psi',len:59}};
const ORDER=['chi1','chi2','chi3','chi4','chi5','mu61','mu37','psi1','psi2','psi3','psi4','psi5'];
const cleanText=s=>(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/Ñ/g,'N').replace(/[^A-Z ]/g,' ');
const bits5=n=>n.toString(2).padStart(5,'0'),xor5=(a,b)=>a^b,deltaBits=s=>[...s].map((b,i)=>i===0?b:String(Number(b)^Number(s[i-1]))).join('');
function xorshift(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
let seedBase=1942;
function makePattern(len,seed){const rnd=xorshift(seed),arr=[];for(let i=0;i<len;i++)arr.push(rnd()>.49?1:0);return arr}
let patterns={};
function rebuildPatterns(){patterns={};ORDER.forEach((n,i)=>patterns[n]=makePattern(WHEEL_META[n].len,seedBase+i*7919));}
rebuildPatterns();
function encodeITA(text){return [...cleanText(text)].map(c=>({char:c,code:ITA2[c]??ITA2.X,bits:bits5(ITA2[c]??ITA2.X)}))}
function decodeCodes(codes){return codes.map(n=>REV[n]??'·').join('')}
class LorenzMachine{
 constructor(starts={}){this.positions={};for(const n of ORDER)this.positions[n]=Number(starts[n]??0)%WHEEL_META[n].len;this.history=[]}
 snapshot(){return{...this.positions}}
 restore(p){this.positions={...p}}
 bit(name){return patterns[name][this.positions[name]]}
 current(){const chi=[1,2,3,4,5].map(i=>this.bit(`chi${i}`)),psi=[1,2,3,4,5].map(i=>this.bit(`psi${i}`)),mu61=this.bit('mu61'),mu37=this.bit('mu37'),key=chi.map((b,i)=>b^psi[i]);return{chi,psi,mu61,mu37,key,positions:this.snapshot()}}
 step(){const before=this.current(),psiAdvance=before.mu37===1,mu37Advance=before.mu61===1;for(let i=1;i<=5;i++)this.positions[`chi${i}`]=(this.positions[`chi${i}`]+1)%WHEEL_META[`chi${i}`].len;this.positions.mu61=(this.positions.mu61+1)%61;if(mu37Advance)this.positions.mu37=(this.positions.mu37+1)%37;if(psiAdvance)for(let i=1;i<=5;i++)this.positions[`psi${i}`]=(this.positions[`psi${i}`]+1)%WHEEL_META[`psi${i}`].len;return{before,psiAdvance,mu37Advance,after:this.current()}}
 processCode(code){const before=this.snapshot(),state=this.current(),cipher=code^parseInt(state.key.join(''),2),motion=this.step(),r={plain:code,cipher,state,motion,before,after:this.snapshot()};this.history.push(r);return r}
 processText(text){const input=encodeITA(text),rows=input.map(x=>({...x,...this.processCode(x.code)}));return{rows,codes:rows.map(r=>r.cipher),text:decodeCodes(rows.map(r=>r.cipher))}}
}
function defaultStarts(){return Object.fromEntries(ORDER.map((n,i)=>[n,(i*3+2)%WHEEL_META[n].len]))}
let wheelMachine=new LorenzMachine(defaultStarts()),colossusCase=null,deltaCase=null;
