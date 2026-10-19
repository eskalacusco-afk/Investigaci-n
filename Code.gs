/**
 * ESKALA v3 | Backend privado para Google Apps Script.
 * Autorización: desplegar como 'Ejecutar como yo' y acceso 'Solo yo'.
 * Fuente de verdad: un JSON por expediente en Google Drive.
 * Índices legibles: Google Sheets; se regeneran desde Drive cuando sea necesario.
 * No hay disparadores, Gmail, Calendar ni recordatorios fuera de la web.
 */
const ESKALA = {
  root: 'ESKALA - Control de Tesis',
  keys: {root:'ESKALA_ROOT_ID', data:'ESKALA_DATA_ID', files:'ESKALA_FILES_ID', sheet:'ESKALA_SHEET_ID'},
  tabs: {
    'Expedientes':['ID','Título','Universidad','Nivel','Estado','Estado administrativo','Asesor universitario','Tesistas','Honorarios S/','Cobrado S/','Saldo S/','Última actualización','Carpeta Drive'],
    'Tesistas':['ID','Expediente ID','Nombre','Correo','Teléfono','Honorarios S/','Cobrado S/','Saldo S/','Apto ERP','Trámite título'],
    'Pagos':['ID','Expediente ID','Tesista ID','Tesista','Fecha','Pago S/','Concepto','Comprobante URL','Servicio ID','Servicio'],
    'Cuotas':['ID','Expediente ID','Tesista ID','Tesista','Vencimiento','Cuota S/','Concepto','Servicio ID','Servicio'],
    'Compromisos':['ID','Expediente ID','Actividad / reunión','Fecha','Cumplido','Observaciones'],
    'Bitácora':['ID','Expediente ID','Fecha','Movimiento registrado'],
    'Servicios':['ID','Expediente ID','Tipo de servicio','Nombre','Estado','Monto contratado S/','Cobrado S/','Saldo S/','Inicio','Fin pactado','Porcentaje entregado'],
    'Entregables':['ID','Expediente ID','Servicio ID','Servicio','Entregable','Estado','Fecha pactada','Enlace']
  }
};
function doGet(){
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('ESKALA | Control privado de tesis')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}
function include(filename){return HtmlService.createHtmlOutputFromFile(filename).getContent();}

/** EJECUTAR UNA SOLA VEZ desde el editor de Apps Script. */
function setupEskala(){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const props=PropertiesService.getScriptProperties();
    const existing=props.getProperty(ESKALA.keys.root);
    if(existing){ensureTabs_();return eskalaInfo_();}
    const root=DriveApp.createFolder(ESKALA.root);
    const data=root.createFolder('Base de datos privada - NO COMPARTIR');
    const files=root.createFolder('Expedientes y documentos');
    const ss=SpreadsheetApp.create('ESKALA - Índices y finanzas');
    const first=ss.getSheets()[0];first.setName('Expedientes');
    DriveApp.getFileById(ss.getId()).moveTo(root);
    Object.keys(ESKALA.tabs).forEach(name=>{
      const sh=ss.getSheetByName(name)||ss.insertSheet(name);
      sh.getRange(1,1,1,ESKALA.tabs[name].length).setValues([ESKALA.tabs[name]]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,ESKALA.tabs[name].length).setFontWeight('bold').setBackground('#EAF2FF');
    });
    props.setProperties({
      [ESKALA.keys.root]:root.getId(),
      [ESKALA.keys.data]:data.getId(),
      [ESKALA.keys.files]:files.getId(),
      [ESKALA.keys.sheet]:ss.getId()
    });
    return eskalaInfo_();
  }finally{lock.releaseLock();}
}
// Agrega pestañas y columnas al actualizar una instalación previa sin borrar los índices.
function ensureTabs_(){
  const ss=workbook_();Object.keys(ESKALA.tabs).forEach(name=>{
    let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);
    const cols=ESKALA.tabs[name].length;
    if(sh.getMaxColumns()<cols)sh.insertColumnsAfter(sh.getMaxColumns(),cols-sh.getMaxColumns());
    sh.getRange(1,1,1,cols).setValues([ESKALA.tabs[name]]);
    sh.setFrozenRows(1);sh.getRange(1,1,1,cols).setFontWeight('bold').setBackground('#EAF2FF');
  });
}
function getSystemInfo(){return eskalaInfo_();}
function eskalaInfo_(){
  const props=PropertiesService.getScriptProperties();
  const root=props.getProperty(ESKALA.keys.root);
  if(!root) throw Error('Primero ejecuta la función setupEskala() desde el editor de Apps Script.');
  return {ready:true, rootUrl:DriveApp.getFolderById(root).getUrl(),
    sheetUrl:SpreadsheetApp.openById(props.getProperty(ESKALA.keys.sheet)).getUrl()};
}
function dataFolder_(){
  const id=PropertiesService.getScriptProperties().getProperty(ESKALA.keys.data);
  if(!id) throw Error('La base de datos no está configurada. Ejecuta setupEskala().');
  return DriveApp.getFolderById(id);
}
function docFolder_(){return DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty(ESKALA.keys.files));}
function workbook_(){return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(ESKALA.keys.sheet));}
function jsonFileName_(id){return 'tesis_'+id+'.json';}
function validateId_(id){
  if(typeof id!=='string'||id.length>140||!/^[a-zA-Z0-9_-]+$/.test(id)) throw Error('ID de expediente inválido.');
}
function validateProject_(p){
  if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Expediente inválido.');
  validateId_(p.id);
  if(typeof p.title!=='string'||!p.title.trim()||p.title.length>300)throw Error('Título de tesis inválido.');
  if(!Array.isArray(p.students)||p.students.length>30)throw Error('Lista de tesistas inválida.');
  for(const s of p.students){if(!s||typeof s.name!=='string'||!s.name.trim())throw Error('Nombre de tesista inválido.');}
  if(p.services!==undefined&&(!Array.isArray(p.services)||p.services.length>75))throw Error('Servicios inválidos.');
  for(const s of p.services||[]){if(!s||typeof s.id!=='string'||typeof s.name!=='string'||!Array.isArray(s.deliverables)||s.deliverables.length>100)throw Error('Contrato de servicio inválido.');}
  const serialized=JSON.stringify(p);
  if(serialized.length>1800000)throw Error('El expediente supera el tamaño admitido.');
  return serialized;
}
function findFile_(id){
  const iter=dataFolder_().getFilesByName(jsonFileName_(id));
  return iter.hasNext()?iter.next():null;
}
function getProjects(){
  const iter=dataFolder_().getFiles();const projects=[];
  while(iter.hasNext()){
    const file=iter.next();if(!/^tesis_[a-zA-Z0-9_-]+\.json$/.test(file.getName()))continue;
    try{const data=JSON.parse(file.getBlob().getDataAsString('UTF-8'));validateId_(data.id);projects.push(data);}
    catch(err){console.error('Expediente no legible:',file.getName(),String(err));}
  }
  return projects.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
}
function saveProject(project){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const p=JSON.parse(validateProject_(project));
    if(!p.folder){
      const title=String(p.title).replace(/[\\/:*?"<>|]/g,' ').slice(0,65).trim();
      const folder=docFolder_().createFolder('TESIS - '+title+' - '+p.id.slice(-7));
      ['01 Proyecto','02 Resoluciones y dictámenes','03 Instrumentos y datos','04 Tesis completa','05 Sustentación','06 Contratos y pagos','07 Servicios y entregables'].forEach(n=>folder.createFolder(n));
      p.folder=folder.getUrl();
    }
    const serialized=validateProject_(p);const existing=findFile_(p.id);
    if(existing)existing.setContent(serialized);
    else dataFolder_().createFile(jsonFileName_(p.id),serialized,MimeType.PLAIN_TEXT);
    // La persistencia principal en Drive ya se ha realizado.
    // Si un índice de Sheets falla, es posible reconstruirlo desde Drive.
    try{syncProject_(p);}catch(err){console.error('No se pudo sincronizar índice:',String(err));}
    return {id:p.id,folder:p.folder,updatedAt:p.updatedAt||''};
  }finally{lock.releaseLock();}
}
function deleteProject(id){
  validateId_(id);
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const file=findFile_(id);if(file)file.setTrashed(true);
    // No borrar jamás la carpeta de documentos: puede contener tesis, resoluciones y comprobantes.
    try{removeProjectRows_(id);}catch(err){console.error('Índice pendiente de reconstrucción:',String(err));}
    return {deleted:true,id};
  }finally{lock.releaseLock();}
}
function restoreProjects(projects){
  if(!Array.isArray(projects)||projects.length>500)throw Error('Respaldo inválido o demasiado grande.');
  const valid=new Set();projects.forEach(p=>{validateProject_(p);if(valid.has(p.id))throw Error('IDs repetidos en el respaldo.');valid.add(p.id);});
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    const folder=dataFolder_(),files=folder.getFiles();
    while(files.hasNext()){
      const file=files.next(),match=/^tesis_([a-zA-Z0-9_-]+)\.json$/.exec(file.getName());
      if(match&&!valid.has(match[1]))file.setTrashed(true);
    }
    for(const item of projects){
      const p=JSON.parse(JSON.stringify(item));
      if(!p.folder){const sub=docFolder_().createFolder('TESIS - '+p.title.slice(0,65));p.folder=sub.getUrl();}
      const existing=findFile_(p.id),json=validateProject_(p);
      if(existing)existing.setContent(json);else folder.createFile(jsonFileName_(p.id),json,MimeType.PLAIN_TEXT);
    }
    rebuildIndexes_(projects);
    return {restored:projects.length};
  }finally{lock.releaseLock();}
}
function rebuildIndexes(){
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try{const p=getProjects();rebuildIndexes_(p);return {indexed:p.length};}
  finally{lock.releaseLock();}
}
function rebuildIndexes_(projects){
  const all=Object.keys(ESKALA.tabs);
  for(const tab of all){const sheet=workbook_().getSheetByName(tab);const rows=[];projects.forEach(p=>rows.push(...rowsForTab_(tab,p)));writeRows_(sheet,rows);}
}
function syncProject_(project){
  const book=workbook_();
  Object.keys(ESKALA.tabs).forEach(tab=>{
    const sh=book.getSheetByName(tab);const old=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,ESKALA.tabs[tab].length).getValues():[];
    const where=tab==='Expedientes'?0:1;
    const remain=old.filter(r=>String(r[where])!==project.id);
    writeRows_(sh,remain.concat(rowsForTab_(tab,project)));
  });
}
function removeProjectRows_(projectId){
  const book=workbook_();Object.keys(ESKALA.tabs).forEach(tab=>{
    const sh=book.getSheetByName(tab);const old=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,ESKALA.tabs[tab].length).getValues():[];
    const where=tab==='Expedientes'?0:1;
    writeRows_(sh,old.filter(r=>String(r[where])!==projectId));
  });
}
function writeRows_(sheet,rows){
  const cols=sheet.getLastColumn(),last=sheet.getLastRow();
  if(last>1)sheet.getRange(2,1,last-1,cols).clearContent();
  if(rows.length){const safe=rows.map(r=>r.map(v=>{
    if(typeof v==='string'&&/^[=+@\-\t\r]/.test(v))return "'"+v;
    return v??'';
  }));sheet.getRange(2,1,safe.length,cols).setValues(safe);}
}
function rowsForTab_(tab,p){
  const students=p.students||[];
  const paid=s=>(s.payments||[]).reduce((a,x)=>a+(Number(x.amount)||0),0);
  const services=Array.isArray(p.services)?p.services:[];
  const agreed=students.reduce((a,s)=>a+(Number(s.agreed)||0),0)+services.reduce((a,s)=>a+(Number(s.agreed)||0),0);const servicePaid=s=>(s.payments||[]).reduce((a,x)=>a+(Number(x.amount)||0),0);const received=students.reduce((a,s)=>a+paid(s),0)+services.reduce((a,s)=>a+servicePaid(s),0);
  switch(tab){
    case 'Expedientes':return [[p.id,p.title,p.university||'',p.level||'',p.status||'',p.adminStatus||'',p.advisor||'',students.map(s=>s.name).join(' / '),agreed,received,agreed-received,p.updatedAt||'',p.folder||'']];
    case 'Tesistas':return students.map(s=>[s.id,p.id,s.name,s.email||'',s.phone||'',Number(s.agreed)||0,paid(s),(Number(s.agreed)||0)-paid(s),s.apto||'',s.tituloStatus||'']);
    case 'Pagos':return students.flatMap(s=>(s.payments||[]).map(x=>[x.id,p.id,s.id,s.name,x.date||'',Number(x.amount)||0,x.note||'',x.receipt||'','',''])).concat(services.flatMap(s=>(s.payments||[]).map(x=>[x.id,p.id,'','',x.date||'',Number(x.amount)||0,x.note||'',x.receipt||'',s.id,s.name])));
    case 'Cuotas':return students.flatMap(s=>(s.installments||[]).map(x=>[x.id,p.id,s.id,s.name,x.date||'',Number(x.amount)||0,x.note||'','',''])).concat(services.flatMap(s=>(s.installments||[]).map(x=>[x.id,p.id,'','',x.date||'',Number(x.amount)||0,x.note||'',s.id,s.name])));
    case 'Compromisos':return (p.deadlines||[]).map(d=>[d.id,p.id,d.title||'',d.date||'',d.done?'Sí':'No',d.note||'']).concat(
      Object.keys(p.tasks||{}).filter(k=>p.tasks[k].due).map(k=>[k,p.id,'Tarea: '+k,p.tasks[k].due,p.tasks[k].status==='completado'?'Sí':'No',p.tasks[k].note||'']),
      (p.customTasks||[]).filter(t=>t.due).map(t=>[t.id,p.id,t.title,t.due,t.status==='completado'?'Sí':'No',t.note||''])
    );
    case 'Bitácora':return (p.history||[]).map(h=>[h.id,p.id,h.date||'',h.text||'']);
    case 'Servicios':return services.map(s=>{const d=s.deliverables||[],done=d.filter(x=>x.status==='completado'||x.status==='no aplica').length;return [s.id,p.id,s.type||'',s.name||'',s.status||'',Number(s.agreed)||0,servicePaid(s),(Number(s.agreed)||0)-servicePaid(s),s.startDate||'',s.dueDate||'',d.length?Math.round(done/d.length*100):0]});
    case 'Entregables':return services.flatMap(s=>(s.deliverables||[]).map(d=>[d.id,p.id,s.id,s.name,d.title,d.status||'pendiente',d.due||'',d.link||'']));
  }
  return [];
}
