"use strict";
const $=(s)=>document.querySelector(s);
const $$=(s)=>Array.from(document.querySelectorAll(s));
const board=$("#board"), boardMessage=$("#board-message"), feedback=$("#game-feedback");
const starsLabel=$("#stars-collected"), movesLabel=$("#moves-counter"), stateLabel=$("#mini-state");
const playButton=$("#play-button"), pauseButton=$("#pause-button"), restartButton=$("#restart-button");
const help=$("#help-dialog"), helpClose=$("#help-close");
const WIDTH=9, HEIGHT=6;
const WALLS=new Set(["0,0","1,0","2,0","3,0","4,0","5,0","6,0","7,0","8,0","0,1","8,1","0,2","4,2","8,2","0,3","4,4","8,3","0,4","8,4","0,5","1,5","2,5","3,5","4,5","5,5","6,5","7,5","8,5"]);
const STARS=["2,1","6,1","2,3","6,4"], PORTAL="7,3", START={x:1,y:4};
let player={...START},collected=new Set(),moves=0,phase="idle",soundEnabled=false,lastFocus=null,activeFilter="todos",audioContext=null;
const texts={idle:"PRONTO",playing:"JOGANDO",paused:"PAUSA",won:"VITÓRIA"};
function beep(frequency=540,duration=.075){
  if(!soundEnabled) return;
  try{
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    audioContext=audioContext||new Audio();
    if(audioContext.state==="suspended") audioContext.resume();
    const o=audioContext.createOscillator(),g=audioContext.createGain();
    o.type="square";o.frequency.setValueAtTime(frequency,audioContext.currentTime);
    g.gain.setValueAtTime(.035,audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);
    o.connect(g);g.connect(audioContext.destination);
    o.start();o.stop(audioContext.currentTime+duration);
  }catch(_){/* som opcional; jogo funciona sem ele */}
}
function sync(){
  starsLabel.textContent=collected.size+" / "+STARS.length;
  movesLabel.textContent=String(moves).padStart(2,"0");
  stateLabel.textContent=texts[phase]||"PRONTO";
  playButton.textContent=phase==="paused"?"▶ CONTINUAR":phase==="won"?"↻ JOGAR DE NOVO":phase==="playing"?"▶ JOGANDO":"▶ INICIAR";
  pauseButton.disabled=!(phase==="playing"||phase==="paused");
  pauseButton.textContent=phase==="paused"?"▶ CONTINUAR":"Ⅱ PAUSAR";
  if(phase==="idle"){boardMessage.hidden=false;boardMessage.textContent="PRESSIONE INICIAR";}
  else if(phase==="paused"){boardMessage.hidden=false;boardMessage.textContent="Ⅱ PAUSADO";}
  else if(phase==="won"){boardMessage.hidden=false;boardMessage.textContent="★ VOCÊ ABRIU O PORTAL! ★";}
  else boardMessage.hidden=true;
  renderBoard();
}
function renderBoard(){
  const fragment=document.createDocumentFragment();
  for(let y=0;y<HEIGHT;y++){
    for(let x=0;x<WIDTH;x++){
      const key=x+","+y,cell=document.createElement("div");
      cell.className="cell";
      cell.setAttribute("role","gridcell");
      if(WALLS.has(key)){cell.classList.add("wall");cell.setAttribute("aria-label","Parede");}
      else if(player.x===x && player.y===y){cell.classList.add("hero-cell");cell.textContent="◆";cell.setAttribute("aria-label","Você");}
      else if(STARS.includes(key)&&!collected.has(key)){cell.classList.add("star");cell.textContent="★";cell.setAttribute("aria-label","Estrela");}
      else if(key===PORTAL){cell.classList.add("portal");cell.textContent=collected.size===STARS.length?"◈":"◇";cell.setAttribute("aria-label","Portal");}
      else cell.setAttribute("aria-label","Caminho");
      fragment.appendChild(cell);
    }
  }
  board.replaceChildren(fragment);
}
function startGame(){
  player={...START};collected=new Set();moves=0;phase="playing";
  feedback.textContent="Colete quatro estrelas e chegue ao portal ◇.";
  sync();board.focus({preventScroll:true});beep(520);
}
function pauseGame(){
  if(phase==="playing"){phase="paused";feedback.textContent="Tempo congelado. Volte quando quiser.";beep(380);}
  else if(phase==="paused"){phase="playing";feedback.textContent="De volta ao jogo!";beep(650);}
  sync();
}
function move(dx,dy){
  if(phase!=="playing")return;
  const x=player.x+dx,y=player.y+dy,key=x+","+y;
  if(x<0||x>=WIDTH||y<0||y>=HEIGHT||WALLS.has(key)){feedback.textContent="OPS! PAREDE À FRENTE. ENCONTRE OUTRO CAMINHO.";beep(170);return;}
  player={x,y};moves++;
  if(STARS.includes(key)&&!collected.has(key)){
    collected.add(key);beep(830);
    const responses=["★ PRIMEIRA ESTRELA!","✦ OLHAR DE EXPLORADOR!","★ QUASE LÁ!","✦ TODAS AS ESTRELAS! PORTAL LIBERADO!"];
    feedback.textContent=responses[collected.size-1];
  }else if(key===PORTAL){
    if(collected.size===STARS.length){phase="won";feedback.textContent="PORTAL ABERTO! Você concluiu com "+moves+" movimentos.";beep(950,.25);}
    else{feedback.textContent="O PORTAL PRECISA DE "+(STARS.length-collected.size)+" ESTRELA(S).";beep(280);}
  }else if(moves===5){feedback.textContent="★ CONQUISTA SURPRESA: PRIMEIROS PASSOS!";beep(760);}
  sync();
}
function direction(dir){({up:()=>move(0,-1),down:()=>move(0,1),left:()=>move(-1,0),right:()=>move(1,0)})[dir]?.();}
function showHelp(){
  lastFocus=document.activeElement;
  help.hidden=false;
  if(phase==="playing")pauseGame();
  $("#help-close").focus();
}
function hideHelp(){
  help.hidden=true;
  if(lastFocus&&typeof lastFocus.focus==="function") lastFocus.focus();
}
function toggleSound(){
  soundEnabled=!soundEnabled;
  $("#sound-state").textContent=soundEnabled?"ON":"OFF";
  $("#sound-toggle").setAttribute("aria-label",soundEnabled?"Silenciar sons":"Ativar sons");
  beep(740);
}
function renderGames(games){
  const items=games.filter(g=>activeFilter==="todos"||g.category===activeFilter);
  const cards=items.map(g=>{
    const card=document.createElement("article");
    card.className="game-card";
    const art=document.createElement("div");art.className="game-art";art.dataset.art=g.art||"mystery";
    const pixels=document.createElement("span");pixels.className="art-pixels";pixels.setAttribute("aria-hidden","true");
    const symbol=document.createElement("span");symbol.className="game-symbol";symbol.textContent=g.symbol||"✦";symbol.setAttribute("aria-hidden","true");
    const badge=document.createElement("span");badge.className="card-badge";badge.textContent=g.status==="live"?"DISPONÍVEL":"EM CRIAÇÃO";
    art.append(pixels,symbol,badge);
    const content=document.createElement("div");content.className="game-card-content";
    const title=document.createElement("h3");title.textContent=g.title;
    const desc=document.createElement("p");desc.textContent=g.description;
    const bottom=document.createElement("div");bottom.className="card-bottom";
    const tag=document.createElement("span");tag.className="card-tag";tag.textContent=g.tag||"AVENTURA";
    let action;
    if(g.status==="live"&&typeof g.url==="string"&&/^\.\/games\/[a-z0-9/_-]+\/?$/.test(g.url)){
      action=document.createElement("a");action.className="game-link";action.href=g.url;action.textContent="▶ JOGAR";
    }else{action=document.createElement("span");action.className="card-coming";action.textContent="EM BREVE";}
    bottom.append(tag,action);content.append(title,desc,bottom);card.append(art,content);return card;
  });
  $("#games-list").replaceChildren(...cards);
  $("#catalog-count").textContent=games.filter(g=>g.status==="live").length+" JOGÁVEIS / "+games.length+" UNIVERSOS";
  if(cards.length===0){const el=document.createElement("p");el.className="loading-card";el.textContent="Ainda não há jogos neste filtro.";$("#games-list").append(el);}
}
const fallbackGames=[
  {id:"aliancas",title:"As Alianças",description:"Uma aventura pela História da Salvação. Descubra mundos, faça escolhas e vença desafios para continuar a jornada.",symbol:"✧",category:"aventura",art:"alliance",tag:"HISTÓRIA / AVENTURA",status:"planned"},
  {id:"arca",title:"A Arca de Noé",description:"Organize os animais, cuide dos espaços da arca e enfrente os dias de chuva em desafios surpreendentes.",symbol:"⚓",category:"desafio",art:"ark",tag:"PUZZLE / MISSÕES",status:"planned"},
  {id:"eden",title:"O Jardim do Éden",description:"Explore o jardim e seus caminhos. Uma jornada de descobertas e decisões com pequenas missões.",symbol:"✿",category:"aventura",art:"eden",tag:"EXPLORAÇÃO / HISTÓRIA",status:"planned"}
];
let catalog=fallbackGames;
async function loadCatalog(){
  try{
    const response=await fetch("./games.json",{cache:"no-cache"});
    if(!response.ok)throw new Error("Catálogo não encontrado");
    const list=await response.json();
    if(!Array.isArray(list)||!list.every(g=>typeof g.id==="string"&&typeof g.title==="string"&&typeof g.description==="string"&&["aventura","desafio"].includes(g.category)&&["planned","live"].includes(g.status)))throw new Error("Formato inválido");
    catalog=list;
  }catch(_){catalog=fallbackGames;}
  renderGames(catalog);
}
playButton.addEventListener("click",()=>{if(phase==="paused")pauseGame();else if(phase!=="playing")startGame();});
pauseButton.addEventListener("click",pauseGame);
restartButton.addEventListener("click",startGame);
$("#start-portal").addEventListener("click",()=>{document.getElementById("mini").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});startGame();});
$$(".dpad").forEach(el=>el.addEventListener("click",()=>direction(el.dataset.direction)));
$("#help-toggle").addEventListener("click",showHelp);
helpClose.addEventListener("click",hideHelp);
$("#help-ok").addEventListener("click",hideHelp);
help.addEventListener("click",e=>{if(e.target===help)hideHelp();});
$("#sound-toggle").addEventListener("click",toggleSound);
$$(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  activeFilter=btn.dataset.filter;
  $$(".filter").forEach(b=>{const on=b===btn;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on));});
  renderGames(catalog);
}));
document.addEventListener("keydown",e=>{
  if(!help.hidden){
    if(e.key==="Escape"||e.key.toLowerCase()==="h"||e.key==="?"){if(e.key!=="Escape")e.preventDefault();hideHelp();}
    if(e.key==="Tab"){const focusables=Array.from(help.querySelectorAll("button"));const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    return;
  }
  const tag=document.activeElement?.tagName;if(["INPUT","TEXTAREA","SELECT"].includes(tag))return;
  const key=e.key.toLowerCase();
  const map={arrowup:"up",w:"up",arrowdown:"down",s:"down",arrowleft:"left",a:"left",arrowright:"right",d:"right"};
  if(map[key]){if(phase==="playing"){e.preventDefault();direction(map[key]);}return;}
  if(key==="p"){e.preventDefault();pauseGame();}
  if(key==="r"){e.preventDefault();startGame();}
  if(key==="h"||key==="?"){e.preventDefault();showHelp();}
  if(key==="m"){e.preventDefault();toggleSound();}
  if(e.key==="Escape"&&phase==="playing")pauseGame();
});
sync();loadCatalog();