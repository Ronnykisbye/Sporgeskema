/* AU AI spørgeskema - sikker backend til ét fælles offentligt link.
   Faner: Svar og Adgang. Adgang bruges kun til TEST-token.
   NORMAL-besvarelser identificeres ikke personligt; browser_id bruges kun til dubletflag.
*/
const ANSWER_SHEET='Svar';
const ACCESS_SHEET='Adgang';
const PROTOCOL_VERSION=4;

function doPost(e){
  const lock=LockService.getScriptLock();
  try{
    lock.waitLock(10000);
    const data=JSON.parse((e.postData&&e.postData.contents)||'{}');
    if(data.action!=='survey_save') return json_({ok:false,code:'BAD_ACTION'});
    return json_(saveSurvey_(data));
  }catch(err){return json_({ok:false,code:'SERVER_ERROR',message:String(err)});}
  finally{try{lock.releaseLock();}catch(_){}}
}

function doGet(e){
  const p=e.parameter||{};
  let result={ok:false,code:'BAD_ACTION'};
  try{
    if(p.action==='survey_ping') result={ok:true,protocol:PROTOCOL_VERSION};
    else if(p.action==='survey_status') result=getSurveyStatus_(p.sessionId||'');
  }catch(err){result={ok:false,code:'SERVER_ERROR',message:String(err)};}
  return jsonp_(result,p.callback);
}

function saveSurvey_(data){
  const sessionId=String(data.sessionId||'').trim();
  const browserId=String(data.browserId||'').trim();
  const requestedStatus=data.status==='completed'?'completed':'incomplete';
  if(!sessionId) return {ok:false,code:'MISSING_SESSION'};

  const mode=isValidTestToken_(String(data.token||'').trim())?'TEST':'NORMAL';
  const sh=SpreadsheetApp.getActive().getSheetByName(ANSWER_SHEET);
  if(!sh)return {ok:false,code:'NO_ANSWER_SHEET'};

  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const sessionCol=headers.indexOf('session_id')+1;
  const statusCol=headers.indexOf('status')+1;
  if(!sessionCol||!statusCol)return {ok:false,code:'BAD_HEADERS'};

  let row=findRow_(sh,sessionCol,sessionId);
  if(row&&String(sh.getRange(row,statusCol).getValue()||'')==='completed'){
    return {ok:true,sessionId,status:'completed',idempotent:true};
  }
  if(!row)row=sh.getLastRow()+1;

  let duplicateFlag='';
  let duplicateOf='';
  if(mode==='NORMAL' && requestedStatus==='completed' && browserId){
    const dup=findCompletedByBrowser_(sh,headers,browserId,sessionId);
    if(dup){
      duplicateFlag='MULIG DUBLET';
      duplicateOf=dup;
    }
  }

  const now=new Date();
  const testLabel=mode==='TEST'?'TEST - MÅ IKKE BRUGES':'NEJ - RIGTIG BESVARELSE';
  const values=headers.map(h=>{
    if(h==='session_id')return sessionId;
    if(h==='status')return requestedStatus;
    if(h==='started_at')return data.startedAt?new Date(data.startedAt):now;
    if(h==='updated_at')return now;
    if(h==='completed_at')return requestedStatus==='completed'?(data.completedAt?new Date(data.completedAt):now):'';
    if(h==='test_result')return testLabel;
    if(h==='browser_id')return browserId;
    if(h==='duplicate_flag')return duplicateFlag;
    if(h==='duplicate_of_session')return duplicateOf;
    if(h.endsWith('_other')){const k=h.slice(0,-6)+'_andet';return data[k]!==undefined?data[k]:'';}
    return data[h]!==undefined?data[h]:'';
  });

  sh.getRange(row,1,1,headers.length).setValues([values]);
  SpreadsheetApp.flush();
  return {ok:true,sessionId,status:requestedStatus,test:mode==='TEST',duplicate:Boolean(duplicateFlag)};
}

function getSurveyStatus_(sessionId){
  if(!sessionId)return {ok:false,code:'MISSING_SESSION'};
  const sh=SpreadsheetApp.getActive().getSheetByName(ANSWER_SHEET);
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const sCol=headers.indexOf('session_id')+1;
  const stCol=headers.indexOf('status')+1;
  const uCol=headers.indexOf('updated_at')+1;
  const tCol=headers.indexOf('test_result')+1;
  const dCol=headers.indexOf('duplicate_flag')+1;
  const row=findRow_(sh,sCol,sessionId);
  if(!row)return {ok:false,code:'NOT_FOUND'};
  return {
    ok:true,
    sessionId,
    status:String(sh.getRange(row,stCol).getValue()||''),
    updatedAt:uCol?String(sh.getRange(row,uCol).getDisplayValue()||''):'',
    test:tCol?String(sh.getRange(row,tCol).getValue()||'').indexOf('TEST')===0:false,
    duplicate:dCol?Boolean(sh.getRange(row,dCol).getValue()):false
  };
}

function isValidTestToken_(token){
  if(!token)return false;
  const sh=SpreadsheetApp.getActive().getSheetByName(ACCESS_SHEET);
  if(!sh)return false;
  const values=sh.getDataRange().getValues();
  if(values.length<2)return false;
  const h=values[0];
  const tc=h.indexOf('token'),mc=h.indexOf('mode');
  if(tc<0||mc<0)return false;
  for(let i=1;i<values.length;i++){
    if(String(values[i][tc])===token && String(values[i][mc]||'').toUpperCase()==='TEST')return true;
  }
  return false;
}

function findCompletedByBrowser_(sh,headers,browserId,currentSession){
  const bCol=headers.indexOf('browser_id')+1;
  const sCol=headers.indexOf('session_id')+1;
  const stCol=headers.indexOf('status')+1;
  const tCol=headers.indexOf('test_result')+1;
  if(!bCol||!sCol||!stCol||sh.getLastRow()<2)return '';
  const vals=sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn()).getValues();
  for(let i=0;i<vals.length;i++){
    const sid=String(vals[i][sCol-1]||'');
    const bid=String(vals[i][bCol-1]||'');
    const status=String(vals[i][stCol-1]||'');
    const test=tCol?String(vals[i][tCol-1]||''):'';
    if(sid!==currentSession && bid===browserId && status==='completed' && test.indexOf('TEST')!==0)return sid;
  }
  return '';
}

function findRow_(sh,col,value){
  if(sh.getLastRow()<2)return 0;
  const f=sh.getRange(2,col,sh.getLastRow()-1,1).createTextFinder(value).matchEntireCell(true).findNext();
  return f?f.getRow():0;
}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function jsonp_(o,cb){const safe=/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(String(cb||''))?String(cb):'';return safe?ContentService.createTextOutput(safe+'('+JSON.stringify(o)+');').setMimeType(ContentService.MimeType.JAVASCRIPT):json_(o);}
