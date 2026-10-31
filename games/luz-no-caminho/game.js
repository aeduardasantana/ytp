"use strict";
(() => {
  const levels = [
    { title:"A primeira casa", caption:"Uma luz começa pequena. Faça-a chegar à casa no fim da trilha.", width:5,height:5,
      path:[[0,4],[1,4],[1,3],[2,3],[2,2],[3,2],[3,1],[4,1],[4,0]], houses:[3,6],seed:7 },
    { title:"A praça da vila", caption:"Leve a luz por toda a passagem e ilumine os pontos de encontro.", width:6,height:5,
      path:[[0,0],[1,0],[1,1],[2,1],[3,1],[3,2],[2,2],[2,3],[3,3],[4,3],[5,3],[5,4]],houses:[4,8],seed:17 },
    { title:"A cidade no monte", caption:"A trilha é mais longa. Descubra o caminho até o alto da cidade.",width:6,height:6,
      path:[[0,5],[1,5],[1,4],[1,3],[2,3],[3,3],[3,2],[4,2],[4,1],[3,1],[3,0],[4,0],[5,0]], houses:[5,10],seed:29 }
  ];
  const dirs=["n","e","s","w"],delta={n:[0,-1],e:[1,0],s:[0,1],w:[-1,0]},opposite={n:"s",s:"n",e:"w",w:"e"};
  const $=s=>document.querySelector(s),grid=$("#board"),feedback=$("#feedback"),status=$("#status");
  const modal=$("#manual"),pauseLayer=$("#pause-layer"),continueBtn=$("#continue"),pauseBtn=$("#pause"),resetBtn=$("#reset"),hintBtn=$("#hint"),helpBtn=$("#help");
  const MAX_LEVELS=levels.length,storeKey="interatividade_luz_no_caminho_v1";
  let index=0,rotations=[],light=new Set(),moves=0,hints=0,mode="idle",best=Array(MAX_LEVELS).fill(0),unlocked=1,helpFocus=null;
  function key(x,y){return x+","+y;}
  function dirOf(a,b){if(b[0]===a[0]+1)return "e";if(b[0]===a[0]-1)return "w";if(b[1]===a[1]+1)return "s";if(b[1]===a[1]-1)return "n";throw new Error("Caminho não adjacente");}
  const prepped=levels.map(l=>{
    const cells=l.path.map((xy,i)=>({
      x:xy[0],y:xy[1],base:[...(i? [dirOf(xy,l.path[i-1])] : []),...(i+1<l.path.length ? [dirOf(xy,l.path[i+1])] : [])],
      target:i===0?"source":i===l.path.length-1?"goal":l.houses.includes(i)?"house":"path"
    }));
    const map=new Map(cells.map((c,i)=>[key(c.x,c.y),i]));
    const init=cells.map((c,i)=>i===0||i===cells.length-1?0:((i*3+l.seed)%3)+1);
    const optimal=init.reduce((sum,r)=>sum+Math.min(r,4-r),0);
    return {...l,cells,map,init,optimal};
  });
  function rotateArms(arms,steps){return arms.map(d=>dirs[(dirs.indexOf(d)+steps)%4]);}
  function save(){try{localStorage.setItem(storeKey,JSON.stringify({unlocked,best}));}catch(_){}}
  function load(){try{const d=JSON.parse(localStorage.getItem(storeKey)||"null");if(d&&Array.isArray(d.best)){best=best.map((_,i)=>Math.max(0,Math.min(3,Number(d.best[i])||0)));unlocked=Math.max(1,Math.min(MAX_LEVELS,Number(d.unlocked)||1));}}catch(_){}}
  function setFeedback(value){feedback.textContent=value;}
  function evaluate(){
    const l=prepped[index],lit=new Set([0]),queue=[0];let q=0;
    while(q<queue.length){
      const id=queue[q++],c=l.cells[id],arms=rotateArms(c.base,rotations[id]);
      for(const d of arms){
        const dv=delta[d],other=l.map.get(key(c.x+dv[0],c.y+dv[1]));
        if(other===undefined||lit.has(other))continue;
        if(rotateArms(l.cells[other].base,rotations[other]).includes(opposite[d])){lit.add(other);queue.push(other);}
      }
    }
    light=lit;return lit.size===l.cells.length;
  }
  function updateHUD(){
    const l=prepped[index];
    $("#level-name").textContent=l.title;
    $("#level").textContent=(index+1).toString().padStart(2,"0")+" / "+MAX_LEVELS;
    $("#lit").textContent=light.size+" / "+l.cells.length;
    $("#moves").textContent=String(moves).padStart(2,"0");
    $("#best").textContent=best[index]?"★".repeat(best[index]):"—";
    $("#story").textContent=l.caption;
    status.textContent=mode==="won"?"FASE CONCLUÍDA":mode==="paused"?"EM PAUSA":mode==="playing"?"JOGANDO":"PRONTO";
    pauseBtn.disabled=mode==="idle"||mode==="won";
    pauseBtn.textContent=mode==="paused"?"▶ CONTINUAR":"Ⅱ PAUSAR";
    hintBtn.disabled=mode!=="playing";resetBtn.disabled=mode==="idle";
    continueBtn.hidden=mode!=="won";
    continueBtn.textContent=index===MAX_LEVELS-1?"↻ REJOGAR A AVENTURA":"▶ PRÓXIMA FASE";
    pauseLayer.hidden=mode!=="paused";
    $("[data-level-options]").replaceChildren(...prepped.map((lv,i)=>{
      const b=document.createElement("button");b.type="button";b.className="level-chip"+(i===index?" selected":"");
      b.disabled=i>=unlocked;b.textContent=(i<unlocked?"":"🔒 ")+(i+1)+". "+lv.title;
      b.setAttribute("aria-label",(i<unlocked?"Abrir":"Bloqueada")+" fase "+(i+1)+": "+lv.title);
      b.addEventListener("click",()=>{if(i<unlocked)start(i);});
      return b;
    }));
  }
  function draw(focusIdx=-1){
    const l=prepped[index];grid.style.setProperty("--cols",String(l.width));
    const frag=document.createDocumentFragment();
    for(let y=0;y<l.height;y++){
      for(let x=0;x<l.width;x++){
        const id=l.map.get(key(x,y));
        if(id===undefined){
          const decor=document.createElement("div");decor.className="tile stone";
          decor.setAttribute("aria-hidden","true");decor.textContent=(x+y)%5===0?"✧":"";
          frag.append(decor);continue;
        }
        const c=l.cells[id],btn=document.createElement("button");
        const active=light.has(id),fixed=c.target==="source"||c.target==="goal";
        btn.type="button";btn.className="tile path"+(active?" lit":"")+(fixed?" fixed":"");
        btn.dataset.idx=String(id);btn.dataset.x=String(x);btn.dataset.y=String(y);
        btn.disabled=mode!=="playing"||fixed;
        btn.title=fixed?"Peça fixa":"Girar a peça";
        btn.setAttribute("aria-label",c.target==="source"?"Fonte luminosa, peça fixa":c.target==="goal"?"Destino final, peça fixa":"Peça de caminho, linha "+(y+1)+", coluna "+(x+1)+(active?", iluminada":", sem luz")+". Girar.");
        for(const d of rotateArms(c.base,rotations[id])){const arm=document.createElement("span");arm.className="arm "+d;arm.setAttribute("aria-hidden","true");btn.append(arm);}
        const center=document.createElement("span");center.className="tile-center";center.setAttribute("aria-hidden","true");btn.append(center);
        if(c.target!=="path"){
          const label=document.createElement("span");label.className="tile-icon";label.setAttribute("aria-hidden","true");
          label.textContent=c.target==="source"?"✺":c.target==="goal"?"⌂":"✦";btn.append(label);
        }
        if(!fixed)btn.addEventListener("click",()=>turn(id,true));
        btn.addEventListener("keydown",ev=>{
          const navigation={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
          if(!navigation[ev.key])return;ev.preventDefault();
          const [dx,dy]=navigation[ev.key];let nx=x+dx,ny=y+dy;
          while(nx>=0&&ny>=0&&nx<l.width&&ny<l.height){
            const cell=l.map.get(key(nx,ny));
            if(cell!==undefined&&l.cells[cell].target==="path"){grid.querySelector('[data-idx="'+cell+'"]')?.focus();break;}
            nx+=dx;ny+=dy;
          }
        });
        frag.append(btn);
      }
    }
    grid.replaceChildren(frag);
    if(focusIdx>=0)grid.querySelector('[data-idx="'+focusIdx+'"]')?.focus({preventScroll:true});
    updateHUD();
  }
  function start(i){
    index=i;const l=prepped[index];
    rotations=l.init.slice();moves=0;hints=0;mode="playing";
    evaluate();draw();setFeedback("Gire as trilhas para levar a luz até a casa. As peças iluminadas mostram seu progresso.");
  }
  function turn(i,focus){
    if(mode!=="playing")return;
    rotations[i]=(rotations[i]+1)%4;moves++;
    const done=evaluate();
    if(done){complete();return;}
    draw(focus?i:-1);setFeedback("Luz acesa em "+light.size+" peças. Continue conectando o caminho.");
  }
  function complete(){
    const l=prepped[index];mode="won";
    const stars=hints===0&&moves<=l.optimal+3?3:hints<=1&&moves<=l.optimal+9?2:1;
    best[index]=Math.max(best[index],stars);unlocked=Math.max(unlocked,Math.min(MAX_LEVELS,index+2));save();
    draw();setFeedback("★ A luz chegou ao destino! "+stars+" estrela"+(stars===1?"":"s")+". Você completou a missão em "+moves+" giros.");
    $("#conclusion").hidden=false;
    $("#conclusion-title").textContent=index===MAX_LEVELS-1?"TODAS AS MISSÕES CONCLUÍDAS!":"CAMINHO ILUMINADO!";
    $("#conclusion-text").textContent=index===MAX_LEVELS-1?"Você concluiu os três desafios! No Evangelho, a luz recorda a importância das boas obras.":"Mais uma trilha concluída. A missão continua na próxima etapa.";
    $("#conclusion").focus();
  }
  function hint(){
    if(mode!=="playing")return;
    const l=prepped[index];
    const id=l.cells.findIndex((c,i)=>c.target!=="source"&&c.target!=="goal"&&rotations[i]!==0);
    if(id<0){setFeedback("As peças já estão alinhadas. Confira a conexão da luz!");return;}
    hints++;const r=rotations[id];rotations[id]=0;moves+=Math.min(4-r,r);
    const done=evaluate();
    if(done){complete();return;}
    draw(id);setFeedback("DICA: alinhei uma peça do caminho. Você consegue terminar o restante!");
  }
  function togglePause(){if(mode==="playing"){mode="paused";draw();setFeedback("Partida pausada.");}else if(mode==="paused"){mode="playing";draw();setFeedback("Partida retomada.");}}
  function showManual(){
    helpFocus=document.activeElement;modal.hidden=false;
    const openBefore=mode;if(openBefore==="playing"){mode="paused";draw();}
    $("#manual-close").focus();
  }
  function hideManual(){modal.hidden=true;if(helpFocus?.focus)helpFocus.focus();}
  function next(){if(mode!=="won")return;$("#conclusion").hidden=true;start(index===MAX_LEVELS-1?0:index+1);}
  function handler(e){
    if(!modal.hidden){if(e.key==="Escape"||e.key.toLowerCase()==="h"||e.key==="?"){e.preventDefault();hideManual();}return;}
    const tag=document.activeElement?.tagName;
    if(["INPUT","TEXTAREA","SELECT"].includes(tag))return;
    if(e.key.toLowerCase()==="p"){e.preventDefault();togglePause();}
    if(e.key.toLowerCase()==="r"){e.preventDefault();$("#conclusion").hidden=true;start(index);}
    if(e.key.toLowerCase()==="h"||e.key==="?"){e.preventDefault();showManual();}
  }
  pauseBtn.addEventListener("click",togglePause);
  resetBtn.addEventListener("click",()=>{$("#conclusion").hidden=true;start(index);});
  hintBtn.addEventListener("click",hint);
  continueBtn.addEventListener("click",next);
  helpBtn.addEventListener("click",showManual);
  $("#manual-close").addEventListener("click",hideManual);
  $("#manual-ok").addEventListener("click",hideManual);
  modal.addEventListener("click",e=>{if(e.target===modal)hideManual();});
  document.addEventListener("keydown",handler);
  load();$("#conclusion").hidden=true;start(0);
})();
