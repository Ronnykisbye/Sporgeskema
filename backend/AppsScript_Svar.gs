/* AU AI spørgeskema - sikker backend til AU_AI_Spoergeskema_Svar.
   Faner: Svar og Adgang. Udrul som Web App: Udfør som mig, adgang Alle. */
const ANSWER_SHEET='Svar';
const ACCESS_SHEET='Adgang';

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
  const p=e.parameter||{}; let result={ok:false,code:'BAD_ACTION'};
  try{if(p.action==='survey_status') result=getSurveyStatus_(p.token||'',p.sessionId||'');}
  catch(err){result={ok:false,code:'SERVER_ERROR',message:String(err)};}
  return jsonp_(result,p.callback);
}
function saveSurvey_(data){
  const token=String(data.token||'').trim(),sessionId=String(data.sessionId||'').trim();
  const requestedStatus=data.status==='completed'?'completed':'incomplete';
  if(!token||!sessionId) return {ok:false,code:'MISSING_ACCESS'};
  const access=authorize_(token,sessionId,requestedStatus); if(!access.ok)return access;
  const sh=SpreadsheetApp.getActive().getSheetByName(ANSWER_SHEET); if(!sh)return {ok:false,code:'NO_ANSWER_SHEET'};
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const sessionCol=headers.indexOf('session_id')+1,statusCol=headers.indexOf('status')+1;
  if(!sessionCol||!statusCol)return {ok:false,code:'BAD_HEADERS'};
  let row=findRow_(sh,sessionCol,sessionId);
  if(row&&String(sh.getRange(row,statusCol).getValue()||'')==='completed')return {ok:true,sessionId,status:'completed',idempotent:true};
  if(!row)row=sh.getLastRow()+1;
  const now=new Date(),testLabel=access.mode==='TEST'?'TEST - MÅ IKKE BRUGES':'NEJ - RIGTIG BESVARELSE';
  const values=headers.map(h=>{
    if(h==='session_id')return sessionId;
    if(h==='status')return requestedStatus;
    if(h==='started_at')return data.startedAt?new Date(data.startedAt):now;
    if(h==='updated_at')return now;
    if(h==='completed_at')return requestedStatus==='completed'?(data.completedAt?new Date(data.completedAt):now):'';
    if(h==='test_result')return testLabel;
    if(h.endsWith('_other')){const k=h.slice(0,-6)+'_andet';return data[k]!==undefined?data[k]:'';}
    return data[h]!==undefined?data[h]:'';
  });
  sh.getRange(row,1,1,headers.length).setValues([values]);SpreadsheetApp.flush();
  return {ok:true,sessionId,status:requestedStatus,test:access.mode==='TEST'};
}
function authorize_(token,sessionId,requestedStatus){
  const sh=SpreadsheetApp.getActive().getSheetByName(ACCESS_SHEET);if(!sh)return {ok:false,code:'NO_ACCESS_SHEET'};
  const values=sh.getDataRange().getValues(),head=values[0];
  const c={token:head.indexOf('token'),mode:head.indexOf('mode'),status:head.indexOf('status'),session:head.indexOf('session_id'),used:head.indexOf('used_at')};
  if(Object.values(c).some(v=>v<0))return {ok:false,code:'BAD_ACCESS_HEADERS'};
  for(let i=1;i<values.length;i++){
    if(String(values[i][c.token])!==token)continue;
    const row=i+1,mode=String(values[i][c.mode]||'NORMAL').toUpperCase();
    if(mode==='TEST')return {ok:true,mode:'TEST',row};
    const status=String(values[i][c.status]||'available'),bound=String(values[i][c.session]||'');
    if(status==='used')return bound===sessionId?{ok:true,mode:'NORMAL',row,alreadyUsed:true}:{ok:false,code:'TOKEN_USED'};
    if(bound&&bound!==sessionId)return {ok:false,code:'TOKEN_RESERVED'};
    if(!bound){sh.getRange(row,c.session+1).setValue(sessionId);sh.getRange(row,c.status+1).setValue('reserved');}
    if(requestedStatus==='completed'){sh.getRange(row,c.status+1).setValue('used');sh.getRange(row,c.used+1).setValue(new Date());}
    return {ok:true,mode:'NORMAL',row};
  }
  return {ok:false,code:'INVALID_TOKEN'};
}
function getSurveyStatus_(token,sessionId){
  if(!token||!sessionId)return {ok:false,code:'MISSING_ACCESS'};
  const access=checkAccessOnly_(token,sessionId);if(!access.ok)return access;
  const sh=SpreadsheetApp.getActive().getSheetByName(ANSWER_SHEET),headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const sCol=headers.indexOf('session_id')+1,stCol=headers.indexOf('status')+1,uCol=headers.indexOf('updated_at')+1,row=findRow_(sh,sCol,sessionId);
  if(!row)return {ok:false,code:'NOT_FOUND'};
  return {ok:true,sessionId,status:String(sh.getRange(row,stCol).getValue()||''),updatedAt:String(sh.getRange(row,uCol).getDisplayValue()||''),test:access.mode==='TEST'};
}
function checkAccessOnly_(token,sessionId){
  const sh=SpreadsheetApp.getActive().getSheetByName(ACCESS_SHEET);if(!sh)return {ok:false,code:'NO_ACCESS_SHEET'};
  const v=sh.getDataRange().getValues(),h=v[0],tc=h.indexOf('token'),mc=h.indexOf('mode'),sc=h.indexOf('session_id');
  for(let i=1;i<v.length;i++)if(String(v[i][tc])===token){const mode=String(v[i][mc]||'NORMAL').toUpperCase();if(mode==='TEST')return {ok:true,mode:'TEST'};return String(v[i][sc]||'')===sessionId?{ok:true,mode:'NORMAL'}:{ok:false,code:'TOKEN_SESSION_MISMATCH'};}
  return {ok:false,code:'INVALID_TOKEN'};
}
function findRow_(sh,col,value){if(sh.getLastRow()<2)return 0;const f=sh.getRange(2,col,sh.getLastRow()-1,1).createTextFinder(value).matchEntireCell(true).findNext();return f?f.getRow():0;}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function jsonp_(o,cb){const safe=/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(String(cb||''))?String(cb):'';return safe?ContentService.createTextOutput(safe+'('+JSON.stringify(o)+');').setMimeType(ContentService.MimeType.JAVASCRIPT):json_(o);}
