/* ESKALA — conexión GitHub Pages <-> Google Apps Script (puente con postMessage).
   La clave se solicita al operador y NUNCA se escribe en el repositorio.
   Google Drive y Sheets son la única fuente de verdad.
*/
(function(){
  'use strict';
  const URL_KEY='eskala_github_gas_url';
  const SECRET_KEY='eskala_github_secret_session';
  const actions=new Set(['getProjects','getSystemInfo','saveProject','deleteProject','restoreProjects','rebuildIndexes']);
  let gasUrl='',secret='',frame=null,target=null,targetOrigin='',nonce='',sequence=0;
  const requests=new Map(),waiting=[];
  let connectTimer=null;
  function msg(text,error=false){
    const e=document.getElementById('eskala-connection-status');
    if(e){e.textContent=text;e.style.color=error?'#b91c1c':'#456075';}
  }
  function isGasEndpoint(url){
    try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='script.google.com'&&/^\/macros\/s\/[-\w]+\/exec\/?$/.test(u.pathname)?u.origin+u.pathname.replace(/\/$/,''):null;}catch{return null;}
  }
  function isScriptOrigin(origin){
    try{const u=new URL(origin);return u.protocol==='https:'&&(/(^|\.)googleusercontent\.com$/.test(u.hostname)||u.hostname==='script.google.com');}catch{return false;}
  }
  function resetIframe(){
    if(connectTimer){clearTimeout(connectTimer);connectTimer=null;}
    for(const req of requests.values())req.fail(new Error('Conexión reiniciada.'));requests.clear();
    target=null;targetOrigin='';frame?.remove();frame=null;
  }
  function connect(url,key){
    const parsed=isGasEndpoint(url);
    if(!parsed){msg('Pega el enlace /exec de una implementación web de Apps Script.',true);return;}
    if(typeof key!=='string'||key.length<64){msg('La clave privada debe tener al menos 64 caracteres.',true);return;}
    resetIframe();gasUrl=parsed;secret=key;
    localStorage.setItem(URL_KEY,gasUrl);
    sessionStorage.setItem(SECRET_KEY,secret);
    nonce=Array.from(crypto.getRandomValues(new Uint8Array(20)),x=>x.toString(16).padStart(2,'0')).join('');
    frame=document.createElement('iframe');frame.setAttribute('aria-hidden','true');frame.setAttribute('title','Conexión ESKALA con Google');
    frame.style.cssText='position:absolute;width:1px;height:1px;border:0;opacity:0;pointer-events:none;left:-9999px;';
    frame.src=gasUrl+'?eskala_state='+encodeURIComponent(nonce);
    document.body.appendChild(frame);
    msg('Conectando con Google…');
    connectTimer=setTimeout(()=>{if(!target)msg('No hubo respuesta de Apps Script. Revisa la implementación, el acceso «Cualquier usuario» y ESKALA_ALLOWED_ORIGIN.',true);},20000);
  }
  function showConfiguration(){
    if(document.getElementById('eskala-connection-modal'))return;
    const el=document.createElement('div');el.id='eskala-connection-modal';
    el.innerHTML=`<style>
      #eskala-connection-modal{position:fixed;z-index:2147483500;inset:0;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(4,29,61,.86);backdrop-filter:blur(5px);font-family:Inter,ui-sans-serif,system-ui,Arial,sans-serif;color:#0b2954}
      #eskala-connection-modal .eskala-connect-card{width:min(480px,100%);max-height:93vh;overflow-y:auto;background:#fff;border-radius:20px;padding:27px;box-shadow:0 20px 70px #0003}
      #eskala-connection-modal h2{font-size:22px;margin:0 0 6px;color:#062653}
      #eskala-connection-modal p{line-height:1.5;font-size:14px;color:#496077;margin:0 0 20px}
      #eskala-connection-modal label{display:block;margin:16px 0 6px;font-size:13px;font-weight:700;color:#102f58}
      #eskala-connection-modal input{box-sizing:border-box;display:block;width:100%;border:1px solid #cbd8e4;border-radius:10px;padding:12px;font-size:14px;outline-color:#00c8bf}
      #eskala-connection-modal button{width:100%;padding:13px;border:none;border-radius:10px;background:#00bcb4;color:#072950;font-size:15px;font-weight:800;cursor:pointer;margin-top:18px}
      #eskala-connection-modal small{display:block;color:#496077;margin-top:14px;line-height:1.45}
      #eskala-connection-status{margin-top:12px;font-size:13px;min-height:18px;line-height:1.45}
    </style><div class="eskala-connect-card" role="dialog" aria-modal="true" aria-label="Conectar ESKALA con Google">
      <h2>ESKALA</h2><p>Conecta tu página de GitHub Pages a tu almacenamiento privado de Google Drive y Sheets.</p>
      <form id="eskala-connection-form">
        <label for="eskala-url">URL de Apps Script</label>
        <input id="eskala-url" type="url" placeholder="https://script.google.com/macros/s/.../exec" required autocomplete="off">
        <label for="eskala-key">Clave privada de conexión</label>
        <input id="eskala-key" type="password" placeholder="Clave de Script Properties" required autocomplete="off">
        <button type="submit">Conectar con Google</button>
      </form>
      <div id="eskala-connection-status" aria-live="polite"></div>
      <small>La URL se recuerda en este navegador. La clave se conserva solo durante esta sesión; nunca se sube a GitHub. Usa este panel únicamente en dispositivos propios.</small>
    </div>`;
    document.body.appendChild(el);
    el.querySelector('#eskala-url').value=localStorage.getItem(URL_KEY)||'';
    el.querySelector('#eskala-connection-form').addEventListener('submit',(e)=>{
      e.preventDefault();
      connect(el.querySelector('#eskala-url').value.trim(),el.querySelector('#eskala-key').value.trim());
    });
  }
  function call(method,args,onSuccess,onFail){
    const request={method,args,ok:typeof onSuccess==='function'?onSuccess:()=>{},fail:typeof onFail==='function'?onFail:()=>{}};
    if(!actions.has(method)){request.fail(new Error('Operación no autorizada'));return;}
    if(!target){waiting.push(request);return;}
    send(request);
  }
  function send(request){
    if(!target){waiting.push(request);return;}
    const id=String(++sequence);
    let timeout=setTimeout(()=>{
      if(!requests.has(id))return;requests.delete(id);
      request.fail(new Error('Google tardó demasiado en responder. Revisa la conexión.'));
    },120000);
    requests.set(id,{ok:(data)=>{clearTimeout(timeout);request.ok(data);},fail:(err)=>{clearTimeout(timeout);request.fail(err);}});
    target.postMessage({eskalaBridge:true,kind:'invoke',nonce,id,method:request.method,args:request.args,key:secret},targetOrigin);
  }
  window.addEventListener('message',(event)=>{
    if(!isScriptOrigin(event.origin)||!event.data||event.data.eskalaBridge!==true||event.data.nonce!==nonce)return;
    if(event.data.kind==='ready'){
      target=event.source;targetOrigin=event.origin;
      clearTimeout(connectTimer);connectTimer=null;
      msg('Conectado. Comprobando permisos…');
      while(waiting.length)send(waiting.shift());
      return;
    }
    if(event.data.kind==='reply'&&event.source===target){
      const callback=requests.get(String(event.data.id));if(!callback)return;
      requests.delete(String(event.data.id));
      if(event.data.success){callback.ok(event.data.result);
        if(event.data.action==='getProjects')document.getElementById('eskala-connection-modal')?.remove();
      }else{
        const err=new Error(String(event.data.error||'Error de Google'));
        callback.fail(err);msg('Error de conexión: '+err.message,true);
      }
    }
  });
  // Shim limitado a los métodos utilizados por el cliente ESKALA existente.
  window.google={script:{run:new Proxy({}, {
    get(_unused,name){
      if(name==='withSuccessHandler')return (fn)=>builder(fn,null);
      if(name==='withFailureHandler')return (fn)=>builder(null,fn);
      if(actions.has(name))return(...args)=>call(name,args,null,null);
    }
  })}};
  function builder(onSuccess,onFail){
    return new Proxy({}, {get(_obj,name){
      if(name==='withSuccessHandler')return fn=>builder(fn,onFail);
      if(name==='withFailureHandler')return fn=>builder(onSuccess,fn);
      if(actions.has(name))return (...args)=>call(name,args,onSuccess,onFail);
    }});
  }
  window.eskalaReconnect=function(){
    resetIframe();sessionStorage.removeItem(SECRET_KEY);location.reload();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    showConfiguration();
    const savedUrl=localStorage.getItem(URL_KEY);
    const savedKey=sessionStorage.getItem(SECRET_KEY);
    if(savedUrl&&savedKey){
      document.getElementById('eskala-url').value=savedUrl;
      document.getElementById('eskala-key').value=savedKey;
      connect(savedUrl,savedKey);
    }
  });
})();
