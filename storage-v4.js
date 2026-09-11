(() => {
  const DRAFT_KEY="sporgeskema:draft:v4",COMPLETED_KEY="sporgeskema:completed:v4",LOCK_KEY="sporgeskema:submitted:v4";
  const TEST_DRAFT_KEY="sporgeskema:test:draft:v4",TEST_COMPLETED_KEY="sporgeskema:test:completed:v4";
  const ANSWERS_URL="https://script.google.com/macros/s/AKfycbyNbhtQhvEgUXz1VS-jqzR_KqLKGr9RPeTvc5oYRVXVEQQByMyAopzN-5yVSzR0MYVs/exec";
  const EMAIL_URL="https://script.google.com/macros/s/AKfycbzSUPG6tXFyekTHyC8lJ0DMRXb7sTNHhuMm8KXFA4fNcBqLUUgLmlRmeRUhQ9JO80nLFQ/exec";
  const params=new URLSearchParams(location.search),TEST=params.get("test")==="1",TOKEN=(params.get("token")||"").trim();
  let surveyPingPromise=null,emailPingPromise=null;
  const isTestMode=()=>TEST,getAccessToken=()=>TOKEN,hasAccessToken=()=>TOKEN.length>=20,draftKey=()=>TEST?TEST_DRAFT_KEY:DRAFT_KEY,completedKey=()=>TEST?TEST_COMPLETED_KEY:COMPLETED_KEY;
  function createSessionId(){return crypto?.randomUUID?crypto.randomUUID():`session-${Date.now()}-${Math.random().toString(36).slice(2,12)}`;}
  function saveDraft(p){try{localStorage.setItem(draftKey(),JSON.stringify({...p,savedAt:new Date().toISOString()}));return true;}catch(e){return false;}}
  function loadDraft(){try{const r=localStorage.getItem(draftKey());return r?JSON.parse(r):null;}catch(e){return null;}}
  function clearDraft(){try{localStorage.removeItem(draftKey());}catch(e){}}
  function hasCompleted(){if(TEST)return false;try{return localStorage.getItem(LOCK_KEY)==="true";}catch(e){return false;}}
  function clearLocalDataKeepLock(){try{localStorage.removeItem(draftKey());localStorage.removeItem(completedKey());if(!TEST)localStorage.setItem(LOCK_KEY,"true");return true;}catch(e){return false;}}
  function buildPayload(p,status){
    const d={action:"survey_save",token:TOKEN,sessionId:p.sessionId||"",status,startedAt:p.startedAt||"",updatedAt:new Date().toISOString(),completedAt:status==="completed"?new Date().toISOString():""};
    Object.keys(window.SURVEY_CONFIG?.questions||{}).forEach(id=>{const a=p.answers?.[id];d[id]=Array.isArray(a)?a.join("; "):(a??"");const o=p.otherText?.[id];d[`${id}_andet`]=o?String(o).trim():"";});return d;
  }
  async function postOpaque(url,payload){await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});}
  function jsonp(url,query,timeout=4500){return new Promise((resolve,reject)=>{const cb=`__qa_${Date.now()}_${Math.random().toString(36).slice(2)}`,s=document.createElement("script");let done=false;const clean=(err,val)=>{if(done)return;done=true;clearTimeout(timer);try{delete window[cb];}catch(e){}s.remove();err?reject(err):resolve(val);};window[cb]=v=>clean(null,v);s.onerror=()=>clean(new Error("JSONP error"));s.src=`${url}?${new URLSearchParams({...query,callback:cb,_:String(Date.now())})}`;document.head.appendChild(s);const timer=setTimeout(()=>clean(new Error("timeout")),timeout);});}
  async function surveyBackendReady(){
    if(!hasAccessToken())return false;
    if(!surveyPingPromise)surveyPingPromise=(async()=>{try{const r=await jsonp(ANSWERS_URL,{action:"survey_ping",token:TOKEN});return Boolean(r?.ok&&r?.protocol===4);}catch(e){return false;}})();
    return surveyPingPromise;
  }
  async function emailBackendReady(){
    if(!emailPingPromise)emailPingPromise=(async()=>{try{const r=await jsonp(EMAIL_URL,{action:"email_ping"});return Boolean(r?.ok&&r?.protocol===4);}catch(e){return false;}})();
    return emailPingPromise;
  }
  async function confirmSurvey(sessionId,status){let last=null;for(let i=0;i<8;i++){try{last=await jsonp(ANSWERS_URL,{action:"survey_status",token:TOKEN,sessionId});if(last?.ok&&last.sessionId===sessionId&&last.status===status)return last;if(last?.ok===false&&last?.code&&last.code!=="NOT_FOUND")return last;}catch(e){}await new Promise(r=>setTimeout(r,450+i*250));}return last||{ok:false,code:"NO_CONFIRMATION"};}
  async function saveCentralDraft(p){if(!(await surveyBackendReady()))return {saved:false,code:"BACKEND_NOT_READY"};try{await postOpaque(ANSWERS_URL,buildPayload(p,"incomplete"));return {saved:true};}catch(e){return {saved:false,error:String(e)};}}
  async function submitFinal(p){
    if(!(await surveyBackendReady()))return {saved:false,centralSaved:false,code:"BACKEND_NOT_READY"};
    try{await postOpaque(ANSWERS_URL,buildPayload(p,"completed"));const c=await confirmSurvey(p.sessionId,"completed");if(!c?.ok)return {saved:false,centralSaved:false,code:c?.code||"NO_CONFIRMATION"};localStorage.setItem(completedKey(),JSON.stringify({...p,completedAt:new Date().toISOString()}));if(!TEST)localStorage.setItem(LOCK_KEY,"true");clearDraft();return {saved:true,centralSaved:true,testMode:TEST};}catch(e){return {saved:false,centralSaved:false,error:String(e)};}
  }
  async function submitResultEmail(email){
    const clean=String(email||"").trim();if(!clean)return {saved:false,code:"EMPTY_EMAIL"};if(!(await emailBackendReady()))return {saved:false,code:"BACKEND_NOT_READY"};
    const requestId=createSessionId(),p={action:"email_save",request_id:requestId,created_at:new Date().toISOString(),email:clean,consent_result_summary:"yes",source:TEST?"AU_AI_Spoergeskema_TEST":"AU_AI_Spoergeskema",status:"requested",test_result:TEST?"TEST - MÅ IKKE BRUGES":"NEJ - RIGTIG BESVARELSE"};
    try{await postOpaque(EMAIL_URL,p);for(let i=0;i<6;i++){try{const r=await jsonp(EMAIL_URL,{action:"email_status",request_id:requestId});if(r?.ok&&r.request_id===requestId)return {saved:true};}catch(e){}await new Promise(r=>setTimeout(r,450+i*250));}return {saved:false,code:"NO_CONFIRMATION"};}catch(e){return {saved:false,error:String(e)};}
  }
  window.SURVEY_STORAGE={createSessionId,saveDraft,loadDraft,clearDraft,hasCompleted,clearLocalDataKeepLock,saveCentralDraft,submitFinal,submitResultEmail,isTestMode,getAccessToken,hasAccessToken,surveyBackendReady,mode:"google-sheets-secure-v4"};
})();
