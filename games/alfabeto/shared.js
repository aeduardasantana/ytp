"use strict";
(()=>{
  const $=(sel)=>document.querySelector(sel);
  const stage=$("#stage"), msg=$("#message"), begin=$("#begin"), pause=$("#pause"), help=$("#help");
  const curtain=$("#curtain"), dialog=$("#manual-dialog");
  const mode=document.body.dataset.game;
  const ALPHABET="ABCDEFGIKLMNOPQRSTUVWXY".split(""); // H,J,Z precisam de movimento e não entram no conjunto estático
  const WORDS=[
    {word:"ARCA",caption:"A casa dos animais de Noé",source:"Gênesis 6–9"},
    {word:"NOE",caption:"Personagem da história do dilúvio",source:"Gênesis 6–9"},
    {word:"MARIA",caption:"Personagem do Evangelho",source:"Lucas 1–2"},
    {word:"AMOR",caption:"Um tema presente na mensagem cristã",source:"1 Coríntios 13"},
    {word:"VIDA",caption:"Uma palavra que aparece ao longo da história bíblica",source:"Gênesis 1"},
    {word:"DEUS",caption:"Palavra frequente nas histórias bíblicas",source:"Gênesis 1"},
    {word:"DAVI",caption:"Rei mencionado no Antigo Testamento",source:"1 Samuel 16"},
    {word:"EVA",caption:"Personagem do relato da criação",source:"Gênesis 2–3"},
    {word:"SALMO",caption:"Livro de poesias e orações bíblicas",source:"Salmos"},
    {word:"PAI",caption:"Palavra de contexto familiar",source:"Uso geral"}
  ];
  const META={
    pareie:{rounds:3,help:"Escolha uma letra escrita na coluna esquerda e, depois, a mão equivalente na direita. Acerte todos os pares para avançar. Não há cronômetro."},
    memoria:{rounds:3,help:"Vire duas cartas por vez e encontre um par formado por uma letra escrita e sua representação no alfabeto manual. Se errar, elas voltam a ficar viradas. Sem tempo obrigatório."},
    soletra:{rounds:3,help:"Observe a palavra escrita. Toque nas mãos que correspondem às letras, na ordem. Os mesmos cartões podem ser usados novamente quando uma letra se repete. Para dicas, consulte o manual."},
    relampago:{rounds:3,help:"Uma mão aparece no painel. Selecione qual letra escrita corresponde a ela entre quatro alternativas. Use o toque/mouse ou 1, 2, 3, 4 no teclado. Não há contagem regressiva."}
  };
  if(!META[mode])return;
  const ROUNDS=META[mode].rounds;
  let state="idle",round=1,score=0,mistakes=0,steps=0;
  let deck=[],left=[],right=[],memoryFlips=[],matched=new Set(),selection={printed:null,hand:null};
  let currentWord=null,wordOptions=[],cursor=0,quizQuestions=[],question=0,quizDone=false,locked=false;
  let fontReady=false,priorState=null,priorFocus=null,turnTimer=null;
  const rand=(n)=>Math.floor(Math.random()*n);
  function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=rand(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}
  function choose(n){return shuffle(ALPHABET).slice(0,n);}
  function text(s){return document.createTextNode(s);}
  function el(tag,cl,txt){const e=document.createElement(tag);if(cl)e.className=cl;if(txt!==undefined)e.textContent=txt;return e;}
  function hand(letter){const sp=el("span","glyph",letter);sp.setAttribute("aria-hidden","true");return sp;}
  function button(cl,aria,parts,click){const b=el("button",cl);b.type="button";b.setAttribute("aria-label",aria);for(const p of parts)b.append(typeof p==="string"?text(p):p);if(click)b.addEventListener("click",click);return b;}
  function setMsg(s){msg.textContent=s;}
  function header(title){const p=el("p","mode-title");p.innerHTML="";p.textContent=title;return p;}
  function renderHUD(){
    $("#round").textContent=String(round).padStart(2,"0")+"/"+ROUNDS;
    $("#score").textContent=String(score).padStart(3,"0");
    $("#mistakes").textContent=String(mistakes).padStart(2,"0");
    begin.textContent=state==="between"?(round===ROUNDS?"↻ JOGAR NOVAMENTE":"▶ PRÓXIMA FASE"):state==="finished"?"↻ JOGAR NOVAMENTE":"↻ RECOMEÇAR";
    begin.disabled=state==="paused"||state==="playing";
    pause.disabled=!(state==="playing"||state==="paused");
    pause.textContent=state==="paused"?"▶ CONTINUAR":"Ⅱ PAUSA";
    curtain.hidden=state!=="paused";
  }
  function clearStage(){stage.replaceChildren();}
  function start(){
    if(!fontReady){setMsg("Aguardando as imagens do alfabeto manual.");return;}
    if(turnTimer){clearTimeout(turnTimer);turnTimer=null;}
    state="playing";round=1;score=0;mistakes=0;steps=0;setMsg("Sua primeira missão começou. Boa aventura!");
    newRound();
  }
  function continueGame(){
    if(state==="finished"||state==="idle"){start();return;}
    if(state==="between"){round++;state="playing";setMsg("Nova fase! Você consegue.");newRound();}
  }
  function newRound(){
    if(turnTimer){clearTimeout(turnTimer);turnTimer=null;}
    locked=false;memoryFlips=[];matched=new Set();selection={printed:null,hand:null};cursor=0;quizDone=false;
    if(mode==="pareie"){const picks=choose(4);left=shuffle(picks);right=shuffle(picks);}
    if(mode==="memoria"){const picks=choose(5),all=picks.flatMap(l=>[{id:l+"-p",kind:"printed",letter:l},{id:l+"-h",kind:"hand",letter:l}]);deck=shuffle(all);}
    if(mode==="soletra"){const source=shuffle(WORDS)[0];currentWord=source;wordOptions=shuffle([...new Set(source.word)].concat(choose(8).filter(x=>!source.word.includes(x)).slice(0,3)));}
    if(mode==="relampago"){quizQuestions=choose(8).map(l=>({letter:l,options:shuffle([l,...choose(8).filter(x=>x!==l).slice(0,3)])}));question=0;}
    draw();
  }
  function finishedRound(){
    locked=false;state=round===ROUNDS?"finished":"between";
    draw();
    if(state==="finished")setMsg("★ CONQUISTA: EXPEDIÇÃO COMPLETA! Pontos: "+score+".");
    else setMsg("★ FASE "+round+" CONCLUÍDA! Continue para a próxima.");
  }
  function draw(){
    renderHUD();clearStage();
    if(state==="idle"){stage.append(el("p","loading","Carregue uma partida para descobrir as mãos do alfabeto manual."));return;}
    if(state==="between"||state==="finished"){
      const wrap=el("div","wordbox");
      wrap.append(el("div","target",state==="finished"?"★ EXPEDIÇÃO COMPLETA ★":"★ FASE CONCLUÍDA ★"));
      wrap.append(el("p","story",state==="finished"?"Você completou os desafios! Pontuação: "+score+".":"Muito bem! Escolha Próxima Fase para continuar."));
      const b=button("btn primary",state==="finished"?"Recomeçar partida":"Avançar de fase",[state==="finished"?"↻ JOGAR DE NOVO":"▶ PRÓXIMA FASE"],continueGame);
      wrap.append(b);stage.append(wrap);return;
    }
    if(mode==="pareie")drawPairs();
    if(mode==="memoria")drawMemory();
    if(mode==="soletra")drawWords();
    if(mode==="relampago")drawQuiz();
  }
  function drawPairs(){
    stage.append(header("Encontre os pares: LETRA ⇄ MÃO (a forma manual aparece à direita)."));
    const root=el("div","match-layout"), l=el("div","match-group"),r=el("div","match-group");
    l.append(el("h2","","01 — PORTUGUÊS"));r.append(el("h2","","02 — ALFABETO MANUAL"));
    const lg=el("div","card-grid"),rg=el("div","card-grid");
    left.forEach(letter=>{
      const b=button("card"+(matched.has(letter)?" matched":"")+(selection.printed===letter?" chosen":""),"Letra escrita "+letter,[el("span","print-letter",letter)],()=>pickPair("printed",letter));b.disabled=matched.has(letter);lg.append(b);
    });
    right.forEach(letter=>{
      const b=button("card"+(matched.has(letter)?" matched":"")+(selection.hand===letter?" chosen":""),"Mão representando letra "+letter,[hand(letter)],()=>pickPair("hand",letter));b.disabled=matched.has(letter);rg.append(b);
    });
    l.append(lg);r.append(rg);root.append(l,r);stage.append(root);
  }
  function pickPair(kind,letter){
    if(state!=="playing"||locked||matched.has(letter))return;
    selection[kind]=letter;draw();
    if(!selection.printed||!selection.hand){setMsg("Escolha o cartão correspondente na outra coluna.");return;}
    steps++;
    if(selection.printed===selection.hand){
      matched.add(letter);score+=10;setMsg("✦ PAR ENCONTRADO! "+matched.size+" de 4.");
      selection={printed:null,hand:null};
      if(matched.size===4){finishedRound();return;}
    }else{mistakes++;setMsg("Essas cartas não formam um par. Compare e tente outra vez.");selection={printed:null,hand:null};}
    draw();
  }
  function drawMemory(){
    stage.append(header("Vire os cartões e encontre letra + mão. A memória é o seu superpoder!"));
    const grid=el("div","memory-grid");
    deck.forEach(card=>{
      const on=matched.has(card.letter),open=on||memoryFlips.includes(card.id);
      const b=button("card"+(!open?" back":"")+(on?" matched":""),open?(card.kind==="printed"?"Letra "+card.letter:"Mão da letra "+card.letter):"Carta virada, revelar",[open?(card.kind==="printed"?el("span","print-letter",card.letter):hand(card.letter)):el("span","backmark","✳")],()=>flip(card));
      b.disabled=on||locked||memoryFlips.includes(card.id);
      grid.append(b);
    });stage.append(grid);
  }
  function flip(card){
    if(state!=="playing"||locked||matched.has(card.letter)||memoryFlips.includes(card.id))return;
    memoryFlips.push(card.id);draw();
    if(memoryFlips.length===1){setMsg("Agora revele outro cartão.");return;}
    const a=deck.find(x=>x.id===memoryFlips[0]),b=card;
    steps++;
    if(a.letter===b.letter&&a.kind!==b.kind){
      matched.add(card.letter);score+=12;memoryFlips=[];
      if(matched.size===5){finishedRound();return;}
      setMsg("★ DUPLA PERFEITA! "+matched.size+" de 5 pares.");draw();
    }else{
      mistakes++;locked=true;setMsg("Não foi dessa vez. Memorize as posições!");
      turnTimer=setTimeout(()=>{memoryFlips=[];locked=false;turnTimer=null;if(state==="playing"||state==="paused")draw();},940);
    }
  }
  function drawWords(){
    stage.append(header("Soletração manual: a palavra é escrita em português; encontre as mãos correspondentes em ordem."));
    const box=el("div","wordbox");box.append(el("div","target",currentWord.word));box.append(el("p","story",currentWord.caption+" · "+currentWord.source));stage.append(box);
    const slots=el("div","slots");
    [...currentWord.word].forEach((x,i)=>slots.append(el("div","slot",i<cursor?x:"·")));
    stage.append(slots);
    const opts=el("div","choices");
    wordOptions.forEach(letter=>opts.append(button("card","Selecionar mão da letra "+letter,[hand(letter)],()=>pickWord(letter))));
    stage.append(opts);
    const p=el("p","hand-caption","Você pode usar uma mão mais de uma vez. Não é tradução do português para Libras: é datilologia.");stage.append(p);
  }
  function pickWord(letter){
    if(state!=="playing"||locked)return;
    if(letter===currentWord.word[cursor]){
      cursor++;score+=8;setMsg("✦ LETRA CERTA! "+cursor+"/"+currentWord.word.length);
      if(cursor===currentWord.word.length){finishedRound();return;}
    }else{mistakes++;setMsg("Procure a mão correspondente à próxima letra da palavra.");}
    draw();
  }
  function drawQuiz(){
    const q=quizQuestions[question];
    if(!q){finishedRound();return;}
    stage.append(header("Desafio "+(question+1)+" de "+quizQuestions.length+": qual é a letra escrita dessa mão?"));
    const panel=el("div","quiz-preview");panel.append(hand(q.letter));stage.append(panel);
    const answers=el("div","quiz-answers");
    q.options.forEach((letter,i)=>{
      answers.append(button("card","Alternativa "+(i+1)+": letra "+letter,[text(String(i+1)+". "),el("span","",letter)],()=>answerQuiz(letter)));
    });stage.append(answers);
    stage.append(el("p","hand-caption","Atalhos do PC: teclas 1–4 para escolher. A pessoa pode jogar sem cronômetro."));
  }
  function answerQuiz(letter){
    if(state!=="playing"||quizDone)return;
    const q=quizQuestions[question];quizDone=true;
    if(letter===q.letter){score+=10;setMsg("★ RESPOSTA CERTA! Mais dez pontos.");}
    else{mistakes++;setMsg("Essa mão corresponde à letra "+q.letter+". Próxima rodada!");}
    question++;
    if(question===quizQuestions.length){finishedRound();return;}
    quizDone=false;draw();
  }
  function pauseGame(){
    if(state==="playing"){state="paused";setMsg("Tempo congelado: sua partida está segura.");}
    else if(state==="paused"){state="playing";setMsg("Bem-vindo de volta!");}
    renderHUD();
  }
  function openManual(){
    priorFocus=document.activeElement;priorState=state;
    dialog.hidden=false;
    $("#manual-text").textContent=META[mode].help+" Use P para pausar, R para recomeçar, H ou ? para abrir este manual e Esc para fechá-lo.";
    if(state==="playing"){state="paused";renderHUD();}
    $("#close-help").focus();
  }
  function closeManual(){dialog.hidden=true;priorState=null;if(priorFocus?.focus)priorFocus.focus();}
  function handleKeyboard(e){
    if(!dialog.hidden){
      if(["Escape","h","H","?"].includes(e.key)){e.preventDefault();closeManual();}
      if(e.key==="Tab"){const a=$("#close-help"),b=$("#help-ok");if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}
      return;
    }
    if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
    if(e.key.toLowerCase()==="p"){e.preventDefault();pauseGame();}
    if(e.key.toLowerCase()==="r"){e.preventDefault();start();}
    if(e.key.toLowerCase()==="h"||e.key==="?"){e.preventDefault();openManual();}
    if(mode==="relampago"&&state==="playing"&&/^[1-4]$/.test(e.key)){
      e.preventDefault();const q=quizQuestions[question];if(q)answerQuiz(q.options[Number(e.key)-1]);
    }
  }
  begin.addEventListener("click",()=>{if(state==="between"||state==="finished")continueGame();else start();});
  pause.addEventListener("click",pauseGame);help.addEventListener("click",openManual);
  $("#close-help").addEventListener("click",closeManual);$("#help-ok").addEventListener("click",closeManual);
  dialog.addEventListener("click",e=>{if(e.target===dialog)closeManual();});
  document.addEventListener("keydown",handleKeyboard);
  renderHUD();
  (async()=>{
    if(!document.fonts?.load){stage.replaceChildren(el("div","error","Este navegador não suporta o carregamento necessário da fonte de datilologia."));return;}
    try{
      const fonts=await document.fonts.load("68px Libras2020","ABCDEFGIKLMNOPQRSTUVWXY");
      if(!fonts.length)throw Error("Fonte indisponível");
      fontReady=true;begin.disabled=false;
      stage.replaceChildren(el("p","loading","Tudo pronto! Aperte INICIAR para jogar."));
      setMsg("26 letras na fonte original; neste protótipo, usamos apenas as representações estáticas selecionadas.");
    }catch(err){
      begin.disabled=true;stage.replaceChildren(el("p","error","As mãos não carregaram. Verifique a conexão e atualize a página. O jogo não substitui gestos por letras comuns."));
      setMsg("Não foi possível carregar a fonte de datilologia.");
    }
  })();
})();
