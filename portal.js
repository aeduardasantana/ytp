"use strict";
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
let activeFilter="todos",catalog=[];
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
  $("#catalog-count").textContent=games.filter(g=>g.status==="live").length+" JOGÁVEIS / "+games.length+" NO CATÁLOGO";
  if(cards.length===0){const el=document.createElement("p");el.className="loading-card";el.textContent="Ainda não há jogos neste filtro.";$("#games-list").append(el);}
}
const fallbackGames=[
 {id:"portal-estrelas",title:"Portal das Estrelas",description:"Explore o mapa, encontre as quatro estrelas e abra o portal.",symbol:"★",category:"puzzle",art:"mystery",tag:"ARCADE / JOGÁVEL",status:"live",url:"./games/portal-das-estrelas/"},
 {id:"pareie-a-letra",title:"Pareie a Letra",description:"Associe cada letra escrita à representação do alfabeto manual.",symbol:"◈",category:"datilologia",art:"hands",tag:"ASSOCIAÇÃO / BETA",status:"live",url:"./games/pareie-a-letra/"},
 {id:"memoria-maos",title:"Memória das Mãos",description:"Vire cartões e encontre os pares entre português e datilologia.",symbol:"✋",category:"datilologia",art:"hands",tag:"MEMÓRIA / BETA",status:"live",url:"./games/memoria-das-maos/"},
 {id:"soletra-palavras",title:"Soletra Palavras",description:"Monte palavras com as mãos do alfabeto manual.",symbol:"✦",category:"datilologia",art:"hands",tag:"PALAVRAS / BETA",status:"live",url:"./games/soletra-palavras/"},
 {id:"letra-relampago",title:"Letra Relâmpago",description:"Identifique a letra escrita correspondente à mão.",symbol:"⚡",category:"datilologia",art:"hands",tag:"RECONHECIMENTO / BETA",status:"live",url:"./games/letra-relampago/"}
];
async function loadCatalog(){
 try{
  const response=await fetch("./games.json",{cache:"no-store"});
  if(!response.ok)throw new Error("Catálogo não disponível");
  const list=await response.json();
  if(!Array.isArray(list)||!list.every(g=>typeof g.id==="string"&&typeof g.title==="string"&&typeof g.description==="string"&&["datilologia","biblia","puzzle"].includes(g.category)&&["planned","live"].includes(g.status)))throw new Error("Catálogo inválido");
  catalog=list;
 }catch(err){catalog=fallbackGames;}
 renderGames(catalog);
}
$$(".filter").forEach(btn=>btn.addEventListener("click",()=>{
 activeFilter=btn.dataset.filter;
 $$(".filter").forEach(b=>{const on=b===btn;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on));});
 renderGames(catalog);
}));
loadCatalog();
