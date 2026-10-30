"use strict";
(function(){
const root=document.getElementById("roadmap-list");
if(!root)return;
const fallback={"updatedAt":"2026-10-30","note":"Datas de lançamento serão anunciadas quando confirmadas.","milestones":[{"id":"portal","title":"O arcade está no ar","description":"A home Interatividade e o pequeno desafio Portal das Estrelas já estão disponíveis.","state":"done","status":"Concluído","when":"30/10/2026"},{"id":"estrutura","title":"As Alianças ganhou um plano","description":"História, oito mundos e quarenta fases organizados como proposta. O roteiro de produção está documentado.","state":"done","status":"Documentado","when":"Planejamento publicado"},{"id":"prototipo","title":"Primeira fase da Arca de Noé","description":"Próximo desafio: criar e testar o jogo de colocar os animais na arca, primeiro sem Libras.","state":"current","status":"Próxima etapa","when":"Data a confirmar"},{"id":"noe","title":"Cinco fases de Noé","description":"Construção, animais, suprimentos, chuva e o desfecho. A primeira versão precisa ser realmente jogável.","state":"planned","status":"Previsto","when":"Após protótipo validado"},{"id":"libras","title":"Libras entra na aventura","description":"Após validar os controles e desafios, os sinais serão integrados naturalmente às cenas.","state":"planned","status":"Previsto","when":"Após a versão jogável"},{"id":"youtube","title":"Avaliação no YouTube Playables","description":"Preparação técnica, testes e candidatura. Publicação no YouTube depende da análise da plataforma.","state":"planned","status":"Condicional","when":"Sem data anunciada"},{"id":"expansao","title":"Novos mundos e fases","description":"Expandir a jornada pelos outros sete mundos previstos, conforme qualidade e disponibilidade de produção.","state":"planned","status":"Futuro","when":"Atualizações progressivas"}]};
function render(data){
 const milestones=Array.isArray(data?.milestones)&&data.milestones.length?data.milestones:fallback.milestones;
 const frag=document.createDocumentFragment();
 for(let i=0;i<milestones.length;i++){
   const m=milestones[i];if(!m||!m.title)continue;
   const li=document.createElement("li");li.className="roadmap-item";
   li.dataset.state=["done","current","planned"].includes(m.state)?m.state:"planned";
   const head=document.createElement("div");head.className="roadmap-head";
   const num=document.createElement("span");num.className="roadmap-step";num.textContent="MARCO "+String(i+1).padStart(2,"0");
   const status=document.createElement("span");status.className="roadmap-state";status.textContent=m.status||"Previsto";
   const title=document.createElement("h3");title.textContent=m.title;
   const text=document.createElement("p");text.textContent=m.description||"";
   const eta=document.createElement("p");eta.className="roadmap-eta";eta.textContent=m.when||"Data a confirmar";
   head.append(num,status);li.append(head,title,text,eta);frag.append(li);
 }
 root.replaceChildren(frag);
 const update=document.getElementById("roadmap-updated");
 if(update)update.textContent="Atualizado em "+new Date((data?.updatedAt||fallback.updatedAt)+"T12:00:00").toLocaleDateString("pt-BR")+". Datas podem mudar; o lançamento no YouTube depende de aprovação externa.";
}
fetch(new URL("roadmap.json",document.currentScript?.src||location.href),{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("Sem cronograma");return r.json()}).then(render).catch(()=>render(fallback));
})();