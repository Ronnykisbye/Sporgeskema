(() => {
  const DRAFT_KEY = "sporgeskema:draft:v3";
  const COMPLETED_KEY = "sporgeskema:completed:v3";
  const SUBMITTED_LOCK_KEY = "sporgeskema:submitted:v3";
  const TEST_DRAFT_KEY = "sporgeskema:test:draft:v3";
  const TEST_COMPLETED_KEY = "sporgeskema:test:completed:v3";

  const ANSWERS_URL = "https://script.google.com/macros/s/AKfycbyNbhtQhvEgUXz1VS-jqzR_KqLKGr9RPeTvc5oYRVXVEQQByMyAopzN-5yVSzR0MYVs/exec";
  const EMAIL_URL = "https://script.google.com/macros/s/AKfycbzSUPG6tXFyekTHyC8lJ0DMRXb7sTNHhuMm8KXFA4fNcBqLUUgLmlRmeRUhQ9JO80nLFQ/exec";

  const params = new URLSearchParams(window.location.search);
  const TEST_MODE = params.get("test") === "1";
  const ACCESS_TOKEN = (params.get("token") || "").trim();

  function isTestMode(){ return TEST_MODE; }
  function getAccessToken(){ return ACCESS_TOKEN; }
  function hasAccessToken(){ return ACCESS_TOKEN.length >= 20; }
  function draftKey(){ return TEST_MODE ? TEST_DRAFT_KEY : DRAFT_KEY; }
  function completedKey(){ return TEST_MODE ? TEST_COMPLETED_KEY : COMPLETED_KEY; }

  function createSessionId(){
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `session-${Date.now()}-${Math.random().toString(36).slice(2,12)}`;
  }

  function saveDraft(payload){
    try { localStorage.setItem(draftKey(), JSON.stringify({...payload, savedAt:new Date().toISOString()})); return true; }
    catch(e){ console.warn("Kunne ikke gemme lokal kladde",e); return false; }
  }
  function loadDraft(){
    try { const raw=localStorage.getItem(draftKey()); return raw?JSON.parse(raw):null; }
    catch(e){ console.warn("Kunne ikke læse lokal kladde",e); return null; }
  }
  function clearDraft(){ try{ localStorage.removeItem(draftKey()); }catch(e){} }
  function hasCompleted(){
    if(TEST_MODE) return false;
    try{return localStorage.getItem(SUBMITTED_LOCK_KEY)==="true";}catch(e){return false;}
  }
  function clearLocalDataKeepLock(){
    try{
      localStorage.removeItem(draftKey()); localStorage.removeItem(completedKey());
      if(!TEST_MODE) localStorage.setItem(SUBMITTED_LOCK_KEY,"true");
      return true;
    }catch(e){return false;}
  }

  function buildPayload(payload,status){
    const data={
      action:"survey_save",
      token:ACCESS_TOKEN,
      sessionId:payload.sessionId||"",
      status,
      startedAt:payload.startedAt||"",
      updatedAt:new Date().toISOString(),
      completedAt:status==="completed"?new Date().toISOString():"",
      test_result:TEST_MODE?"TEST - MÅ IKKE BRUGES":"NEJ - RIGTIG BESVARELSE"
    };
    const questions=window.SURVEY_CONFIG?.questions||{};
    Object.keys(questions).forEach(id=>{
      const answer=payload.answers?.[id];
      data[id]=Array.isArray(answer)?answer.join("; "):(answer??"");
      const other=payload.otherText?.[id];
      data[`${id}_andet`]=other?String(other).trim():"";
    });
    return data;
  }

  async function postOpaque(url,payload){
    await fetch(url,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
  }

  function jsonp(url,query,timeoutMs=5000){
    return new Promise((resolve,reject)=>{
      const cb=`__surveyCb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script=document.createElement("script");
      const timer=setTimeout(()=>cleanup(new Error("Timeout ved serverbekræftelse")),timeoutMs);
      function cleanup(err,value){
        clearTimeout(timer); try{delete window[cb];}catch(e){} script.remove();
        err?reject(err):resolve(value);
      }
      window[cb]=(value)=>cleanup(null,value);
      const q=new URLSearchParams({...query,callback:cb,_:String(Date.now())});
      script.onerror=()=>cleanup(new Error("Kunne ikke læse serverstatus"));
      script.src=`${url}?${q.toString()}`;
      document.head.appendChild(script);
    });
  }

  async function confirmSurvey(sessionId,wantedStatus){
    let last=null;
    for(let i=0;i<8;i++){
      try{
        last=await jsonp(ANSWERS_URL,{action:"survey_status",token:ACCESS_TOKEN,sessionId});
        if(last?.ok && last?.sessionId===sessionId && last?.status===wantedStatus) return last;
        if(last?.ok===false && last?.code) return last;
      }catch(e){}
      await new Promise(r=>setTimeout(r,500+i*250));
    }
    return last||{ok:false,code:"NO_CONFIRMATION"};
  }

  async function saveCentralDraft(payload){
    if(!hasAccessToken()) return {saved:false,code:"NO_TOKEN"};
    try{
      await postOpaque(ANSWERS_URL,buildPayload(payload,"incomplete"));
      return {saved:true};
    }catch(error){ return {saved:false,error:String(error)}; }
  }

  async function submitFinal(payload){
    if(!hasAccessToken()) return {saved:false,centralSaved:false,code:"NO_TOKEN"};
    try{
      await postOpaque(ANSWERS_URL,buildPayload(payload,"completed"));
      const confirmation=await confirmSurvey(payload.sessionId,"completed");
      if(!confirmation?.ok){ return {saved:false,centralSaved:false,code:confirmation?.code||"NO_CONFIRMATION"}; }
      localStorage.setItem(completedKey(),JSON.stringify({...payload,completedAt:new Date().toISOString()}));
      if(!TEST_MODE) localStorage.setItem(SUBMITTED_LOCK_KEY,"true");
      clearDraft();
      return {saved:true,centralSaved:true,testMode:TEST_MODE};
    }catch(error){ return {saved:false,centralSaved:false,error:String(error)}; }
  }

  async function submitResultEmail(email){
    const clean=String(email||"").trim();
    if(!clean) return {saved:false,code:"EMPTY_EMAIL"};
    const requestId=createSessionId();
    const payload={action:"email_save",request_id:requestId,created_at:new Date().toISOString(),email:clean,consent_result_summary:"yes",source:TEST_MODE?"AU_AI_Spoergeskema_TEST":"AU_AI_Spoergeskema",status:"requested",test_result:TEST_MODE?"TEST - MÅ IKKE BRUGES":"NEJ - RIGTIG BESVARELSE"};
    try{
      await postOpaque(EMAIL_URL,payload);
      let last=null;
      for(let i=0;i<6;i++){
        try{ last=await jsonp(EMAIL_URL,{action:"email_status",request_id:requestId}); if(last?.ok && last?.request_id===requestId) return {saved:true}; }catch(e){}
        await new Promise(r=>setTimeout(r,500+i*250));
      }
      return {saved:false,code:"NO_CONFIRMATION"};
    }catch(error){return {saved:false,error:String(error)};}
  }

  window.SURVEY_STORAGE={createSessionId,saveDraft,loadDraft,clearDraft,hasCompleted,clearLocalDataKeepLock,saveCentralDraft,submitFinal,submitResultEmail,isTestMode,getAccessToken,hasAccessToken,mode:"google-sheets-secure"};
})();
