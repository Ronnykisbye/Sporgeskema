/* AU AI resultat-email - separat backend. Ingen session_id eller spørgeskemasvar gemmes her. */
const EMAIL_SHEET='Email';
function doPost(e){
  try{
    const d=JSON.parse((e.postData&&e.postData.contents)||'{}');
    if(d.action!=='email_save')return json_({ok:false,code:'BAD_ACTION'});
    const sh=SpreadsheetApp.getActive().getSheetByName(EMAIL_SHEET);if(!sh)return json_({ok:false,code:'NO_SHEET'});
    const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],idc=h.indexOf('request_id')+1;
    if(!d.request_id||!d.email)return json_({ok:false,code:'MISSING_DATA'});
    const found=findRow_(sh,idc,String(d.request_id));if(found)return json_({ok:true,request_id:d.request_id,idempotent:true});
    sh.appendRow(h.map(x=>d[x]!==undefined?d[x]:''));SpreadsheetApp.flush();return json_({ok:true,request_id:d.request_id});
  }catch(err){return json_({ok:false,code:'SERVER_ERROR',message:String(err)});}
}
function doGet(e){
  const p=e.parameter||{};let r={ok:false,code:'BAD_ACTION'};
  if(p.action==='email_status'){
    const sh=SpreadsheetApp.getActive().getSheetByName(EMAIL_SHEET),h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0],idc=h.indexOf('request_id')+1;
    const row=findRow_(sh,idc,String(p.request_id||''));r=row?{ok:true,request_id:String(p.request_id)}:{ok:false,code:'NOT_FOUND'};
  }
  return jsonp_(r,p.callback);
}
function findRow_(sh,col,value){if(!value||sh.getLastRow()<2)return 0;const f=sh.getRange(2,col,sh.getLastRow()-1,1).createTextFinder(value).matchEntireCell(true).findNext();return f?f.getRow():0;}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function jsonp_(o,cb){const safe=/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(String(cb||''))?String(cb):'';return safe?ContentService.createTextOutput(safe+'('+JSON.stringify(o)+');').setMimeType(ContentService.MimeType.JAVASCRIPT):json_(o);}
