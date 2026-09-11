(() => {
  const config=window.SURVEY_CONFIG, storage=window.SURVEY_STORAGE;
  const screen=document.getElementById("screen"), backBtn=document.getElementById("backBtn"), nextBtn=document.getElementById("nextBtn"), progressBar=document.getElementById("progressBar"), progressText=document.getElementById("progressText");
  const state={sessionId:null,startedAt:null,started:false,currentId:null,answers:{},otherText:{},history:[],completed:false};
  let centralTimer=null;
  const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

  function special(target,answers=state.answers){
    if(target==="KNOWLEDGE_BRANCH") return answers.aiKnowledge==="yes"?"aiUse":"unknownAiUse";
    if(target==="PROFILE_IT_OR_FINISH") return answers.itProfile==="professional"?"itExperience":config.finishId;
    if(target==="PROFILE_Q27_OR_FINISH") return answers.itProfile==="professional"?"itKnowledgeImportance":config.finishId;
    return target;
  }
  function nextFor(id,answers=state.answers){
    const q=config.questions[id]; if(!q?.next) return config.finishId;
    if(typeof q.next==="string") return special(q.next,answers);
    const a=answers[id]; return special(q.next.byAnswer?.[a]??q.next.default??config.finishId,answers);
  }
  function hasAnswerIn(answers,id){
    const q=config.questions[id],a=answers[id]; if(!q)return false;
    if(q.type==="text") return q.optional||Boolean(String(a??"").trim());
    if(q.type==="multi") return Array.isArray(a)&&a.length>0;
    return a!==undefined&&a!==null&&a!=="";
  }
  function computeReachable(answers=state.answers){
    const path=[];let id=config.startQuestionId;const seen=new Set();
    while(id&&id!==config.finishId&&!seen.has(id)){
      seen.add(id);path.push(id);if(!hasAnswerIn(answers,id))break;id=nextFor(id,answers);
    }
    return path;
  }
  function pruneInvalidBranchData(){
    const valid=new Set(computeReachable());
    Object.keys(state.answers).forEach(id=>{if(!valid.has(id))delete state.answers[id];});
    Object.keys(state.otherText).forEach(id=>{if(!valid.has(id))delete state.otherText[id];});
  }
  function payload(){return {sessionId:state.sessionId,startedAt:state.startedAt,answers:{...state.answers},otherText:{...state.otherText},currentId:state.currentId,history:[...state.history]};}
  function saveDrafts(){
    if(!state.started||state.completed)return;
    storage.saveDraft(payload());clearTimeout(centralTimer);centralTimer=setTimeout(()=>storage.saveCentralDraft(payload()),700);
  }
  function freshState(){
    state.sessionId=storage.createSessionId();state.startedAt=new Date().toISOString();state.started=false;state.currentId=null;state.answers={};state.otherText={};state.history=[];state.completed=false;
  }
  function restoreDraft(){
    const d=storage.loadDraft();if(!d||!d.sessionId||!d.currentId||!config.questions[d.currentId])return false;
    state.sessionId=d.sessionId;state.startedAt=d.startedAt||d.savedAt||new Date().toISOString();state.started=true;state.currentId=d.currentId;state.answers=d.answers||{};state.otherText=d.otherText||{};state.history=Array.isArray(d.history)?d.history.filter(id=>config.questions[id]):[];state.completed=false;pruneInvalidBranchData();return true;
  }
  function showFooter(){backBtn.style.display="";nextBtn.style.display="";}
  function hideFooter(){backBtn.style.display="none";nextBtn.style.display="none";}
  function testBanner(){return storage.isTestMode()?'<div class="info-box" style="border-color:#f59e0b"><strong>TESTTILSTAND</strong> – besvarelsen markeres TEST - MÅ IKKE BRUGES og kan gentages.</div>':"";}

  function renderNoAccess(){
    hideFooter();progressBar.style.width="0%";progressText.textContent="Adgangslink mangler";
    screen.innerHTML='<div class="complete"><h2>Linket kan ikke bruges</h2><p>Spørgeskemaet skal åbnes via et gyldigt personligt invitationslink.</p><div class="info-box">Åbn hele linket, du har modtaget. Hvis linket kommer fra Messenger, skal hele linket inklusive adgangskoden være med.</div></div>';
  }
  function renderWelcome(resumed=false){
    showFooter();state.started=false;state.completed=false;
    screen.innerHTML=`<div class="welcome"><h2>${resumed?"Fortsæt din besvarelse":"Velkommen"}</h2><p>Spørgeskemaet vises ét spørgsmål ad gangen og tilpasser sig dine svar.</p>${testBanner()}<div class="info-box">Undervejs gemmes en anonym kladde lokalt og centralt. Hvis du afbryder, kan du fortsætte fra samme browser og samme invitationslink.</div></div>`;
    progressBar.style.width="0%";progressText.textContent=resumed?"Kladde fundet":"Klar til at starte";backBtn.disabled=true;nextBtn.disabled=false;nextBtn.textContent=resumed?"Fortsæt":"Start";
  }
  function renderAlreadyCompleted(){
    state.completed=true;hideFooter();progressBar.style.width="100%";progressText.textContent="Besvarelse allerede registreret";
    screen.innerHTML='<div class="complete" id="doneBox"><h2>Tak for din besvarelse</h2><p>Denne invitation er allerede brugt fra denne browser.</p><div class="info-box">Den centrale server kontrollerer desuden invitationskoden, så samme invitationslink ikke kan bruges til flere rigtige besvarelser.</div></div>';addCloseButton(document.getElementById("doneBox"));
  }
  function addCloseButton(container){
    const b=document.createElement("button");b.type="button";b.className="btn btn-primary";b.textContent="Afslut";
    b.onclick=()=>{storage.clearLocalDataKeepLock();window.close();setTimeout(()=>{screen.innerHTML='<div class="complete"><h2>Færdig</h2><p>Lokale spørgeskemadata er slettet. Du kan nu lukke denne fane.</p></div>';hideFooter();},250);};container.appendChild(b);
  }

  function renderQuestion(id){
    showFooter();const q=config.questions[id];if(!q)return finishSurvey();state.started=true;state.currentId=id;state.completed=false;
    const numberText=q.number?`Spørgsmål ${q.number} · ${q.section}`:q.section;
    if(q.type==="text"){
      screen.innerHTML=`<p class="question-number">${esc(numberText)}</p><h2 class="question-title">${esc(q.text)}</h2>${q.help?`<p class="question-help">${esc(q.help)}</p>`:""}<textarea class="other-input" id="freeTextAnswer" rows="6" maxlength="1000" placeholder="Skriv dit svar her (frivilligt)">${esc(state.answers[id]||"")}</textarea>`;
      document.getElementById("freeTextAnswer").addEventListener("input",e=>{state.answers[id]=e.target.value;pruneInvalidBranchData();saveDrafts();updateControls();});updateControls();updateProgress();return;
    }
    const selected=state.answers[id],inputType=q.type==="multi"?"checkbox":"radio";
    const opts=q.options.map(o=>{const checked=q.type==="multi"?Array.isArray(selected)&&selected.includes(o.value):selected===o.value;const other=o.other?`<div class="other-wrap ${checked?"visible":""}"><label class="other-label" for="${esc(id)}-${esc(o.value)}-text">Skriv dit svar</label><input class="other-input" id="${esc(id)}-${esc(o.value)}-text" type="text" maxlength="250" value="${esc(state.otherText[id]||"")}" ${checked?"":"disabled"}></div>`:"";return `<div class="option-group"><label class="option ${checked?"selected":""}"><input type="${inputType}" name="${esc(id)}" value="${esc(o.value)}" data-exclusive="${o.exclusive?"true":"false"}" data-other="${o.other?"true":"false"}" ${checked?"checked":""}><span>${esc(o.label)}</span></label>${other}</div>`;}).join("");
    screen.innerHTML=`<p class="question-number">${esc(numberText)}</p><h2 class="question-title">${esc(q.text)}</h2>${q.help?`<p class="question-help">${esc(q.help)}</p>`:""}<div class="options">${opts}</div>`;
    screen.querySelectorAll('.option input[type="radio"],.option input[type="checkbox"]').forEach(i=>i.addEventListener("change",answerChanged));
    screen.querySelectorAll(".other-input").forEach(i=>i.addEventListener("input",e=>{state.otherText[state.currentId]=e.target.value;saveDrafts();updateControls();}));updateControls();updateProgress();window.scrollTo({top:0,behavior:"smooth"});
  }
  function answerChanged(e){
    const q=config.questions[state.currentId],changed=e.target,inputs=[...screen.querySelectorAll('.option input[type="radio"],.option input[type="checkbox"]')];
    if(q.type==="multi"){
      if(changed.checked&&changed.dataset.exclusive==="true")inputs.forEach(i=>{if(i!==changed)i.checked=false;});else if(changed.checked)inputs.forEach(i=>{if(i.dataset.exclusive==="true")i.checked=false;});
      state.answers[state.currentId]=inputs.filter(i=>i.checked).map(i=>i.value);
    }else state.answers[state.currentId]=inputs.find(i=>i.checked)?.value??null;
    screen.querySelectorAll(".option").forEach(l=>l.classList.toggle("selected",Boolean(l.querySelector("input")?.checked)));
    screen.querySelectorAll(".option-group").forEach(g=>{const c=g.querySelector('input[data-other="true"]'),w=g.querySelector(".other-wrap"),t=g.querySelector(".other-input");if(!c||!w||!t)return;w.classList.toggle("visible",c.checked);t.disabled=!c.checked;if(!c.checked){state.otherText[state.currentId]="";t.value="";}else setTimeout(()=>t.focus(),0);});
    pruneInvalidBranchData();saveDrafts();updateControls();updateProgress();
  }
  function validCurrent(){
    const id=state.currentId,q=config.questions[id],a=state.answers[id];if(!q)return false;
    if(q.type==="text")return q.optional||Boolean(String(a||"").trim());
    if(q.type==="multi"){if(!Array.isArray(a)||!a.length)return false;const o=q.options.find(x=>x.other&&a.includes(x.value));return !o||Boolean((state.otherText[id]||"").trim());}
    if(a===undefined||a===null||a==="")return false;const o=q.options.find(x=>x.value===a);return !o?.other||Boolean((state.otherText[id]||"").trim());
  }
  function goNext(){
    if(!state.started){const d=storage.loadDraft();if(d?.currentId&&config.questions[d.currentId]&&restoreDraft())return renderQuestion(state.currentId);state.startedAt=state.startedAt||new Date().toISOString();return renderQuestion(config.startQuestionId);}
    if(!validCurrent())return;const next=nextFor(state.currentId);if(!next||next===config.finishId)return finishSurvey();state.history.push(state.currentId);saveDrafts();renderQuestion(next);
  }
  function goBack(){if(!state.started||state.completed)return;const prev=state.history.pop();if(!prev){state.started=false;return renderWelcome(true);}state.currentId=prev;renderQuestion(prev);saveDrafts();}
  function updateControls(){backBtn.disabled=!state.started||state.history.length===0;nextBtn.textContent=validCurrent()&&nextFor(state.currentId)===config.finishId?"Afslut":"Næste";nextBtn.disabled=state.started&&!validCurrent();}
  function updateProgress(){if(!state.currentId)return;const path=computeReachable(),index=Math.max(0,path.indexOf(state.currentId));const p=Math.min(98,Math.round(((index+(validCurrent()?1:0))/Math.max(path.length,index+2))*100));progressBar.style.width=`${p}%`;progressText.textContent=`Trin ${index+1} på din rute`;}

  function closeArea(box){const w=document.createElement("div");w.style.marginTop="8px";addCloseButton(w);box.appendChild(w);}
  function renderCompletion(){
    hideFooter();screen.innerHTML=`<div class="complete" id="completionBox"><h2>Tak for din hjælp</h2><p>${esc(config.completionText)}</p>${testBanner()}<div class="info-box"><strong>${esc(config.resultInterest.question)}</strong></div><div id="resultChoice" class="options" style="max-width:540px"><button class="btn btn-primary" id="wantResult" type="button">Ja</button><button class="btn btn-secondary" id="noResult" type="button">Nej</button></div><div id="emailArea"></div></div>`;
    const box=document.getElementById("completionBox"),choice=document.getElementById("resultChoice"),area=document.getElementById("emailArea");
    document.getElementById("noResult").onclick=()=>{choice.remove();area.innerHTML='<div class="info-box">Tak. Der gemmes ingen e-mailadresse.</div>';closeArea(box);};
    document.getElementById("wantResult").onclick=()=>{choice.remove();area.innerHTML=`<form id="emailForm" style="display:grid;gap:10px;max-width:540px"><label class="other-label" for="resultEmail">E-mailadresse</label><input class="other-input" id="resultEmail" type="email" autocomplete="email" maxlength="200" required placeholder="navn@eksempel.dk"><p class="question-help">${esc(config.resultInterest.privacyText)}</p><button class="btn btn-primary" id="emailBtn" type="submit">Gem e-mailadresse</button><p id="emailStatus" aria-live="polite"></p></form>`;const f=document.getElementById("emailForm"),inp=document.getElementById("resultEmail"),btn=document.getElementById("emailBtn"),st=document.getElementById("emailStatus");f.onsubmit=async e=>{e.preventDefault();if(!inp.checkValidity())return inp.reportValidity();btn.disabled=true;btn.textContent="Gemmer…";st.textContent="Gemmer e-mailadressen. Det kan tage lidt tid…";const r=await storage.submitResultEmail(inp.value);if(r.saved){area.innerHTML='<div class="info-box">Tak. Din e-mailadresse er gemt separat fra dine svar.</div>';closeArea(box);}else{btn.disabled=false;btn.textContent="Gem e-mailadresse";st.textContent="E-mailadressen kunne ikke bekræftes som gemt. Prøv igen.";}};};
  }
  async function finishSurvey(){
    if(state.completed)return;state.completed=true;progressBar.style.width="100%";progressText.textContent="Gemmer og kontrollerer… Det kan tage lidt tid.";backBtn.disabled=true;nextBtn.disabled=true;nextBtn.textContent="Gemmer…";clearTimeout(centralTimer);screen.innerHTML='<div class="complete"><h2>Gemmer din besvarelse…</h2><p>Det kan tage lidt tid. Luk ikke siden, før du får en bekræftelse.</p></div>';
    const r=await storage.submitFinal(payload());state.currentId=null;
    if(r.centralSaved){progressText.textContent="Besvarelse registreret";renderCompletion();}
    else{state.completed=false;hideFooter();progressText.textContent="Kunne ikke bekræfte lagring";screen.innerHTML='<div class="complete"><h2>Besvarelsen er ikke bekræftet endnu</h2><p>Vi viser ikke en falsk kvittering. Din kladde er bevaret lokalt. Prøv igen om lidt.</p><div class="info-box">Hvis problemet fortsætter, er serveropsætningen ikke klar endnu.</div><button class="btn btn-primary" id="retrySave" type="button">Prøv at gemme igen</button></div>';document.getElementById("retrySave").onclick=finishSurvey;}
  }

  backBtn.addEventListener("click",goBack);nextBtn.addEventListener("click",goNext);
  if(!storage.hasAccessToken())renderNoAccess();else if(storage.hasCompleted())renderAlreadyCompleted();else if(restoreDraft())renderWelcome(true);else{freshState();renderWelcome(false);}
})();
