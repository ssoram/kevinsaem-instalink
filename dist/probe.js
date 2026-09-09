const CDP_PORT=9333;
const {spawn}=require('child_process');
const http=require('http');
const CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe";
const target=process.argv[2];
const p=spawn(CHROME,[`--remote-debugging-port=${CDP_PORT}`,'--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking',`--user-data-dir=C:/Users/lami0/AppData/Local/Temp/cdp-probe-${Date.now()}`,'about:blank'],{stdio:'ignore'});
const get=u=>new Promise((res,rej)=>http.get(u,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(JSON.parse(d)))}).on('error',rej));
(async()=>{
  for(let i=0;i<40;i++){try{await get(`http://127.0.0.1:${CDP_PORT}/json/version`);break}catch{await new Promise(r=>setTimeout(r,300))}}
  const tabs=await get(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const WebSocket=require('ws');
  const pg=tabs.filter(t=>t.type==='page');const ws=new WebSocket((pg[0]||tabs[0]).webSocketDebuggerUrl,{perMessageDeflate:false});
  let id=0;const pend=new Map();const logs=[];
  ws.on('message',m=>{const o=JSON.parse(m);
    if(o.id&&pend.has(o.id)){pend.get(o.id)(o);pend.delete(o.id)}
    if(o.method==='Network.responseReceived'&&o.params.response.status>=400)logs.push(`[404] ${o.params.response.status} ${o.params.response.url}`);
    if(o.method==='Log.entryAdded')logs.push(`[${o.params.entry.level}] ${o.params.entry.text}`);
    if(o.method==='Runtime.consoleAPICalled')logs.push(`[${o.params.type}] ${o.params.args.map(a=>a.value||a.description||'').join(' ')}`);
  });
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
  await new Promise(r=>ws.on('open',r));
  await send('Log.enable');await send('Network.enable');await send('Runtime.enable');await send('Page.enable');
  await send('Page.navigate',{url:target});
  await new Promise(r=>setTimeout(r,3500));
  const ev=await send('Runtime.evaluate',{expression:`JSON.stringify({loc:location.href,ready:document.readyState,bodyLen:document.body?document.body.innerHTML.length:-1,anchors:[...document.querySelectorAll('a')].length,mapIframe:document.querySelectorAll('#map-slot iframe').length,telHours:document.querySelectorAll('.tel-hours,[data-field="telHours"]').length,contactText:(document.querySelector('.contact-sub')||document.body).innerText.replace(/\s+/g,' ').slice(0,80),docH:document.documentElement.scrollHeight})`,returnByValue:true});
  console.log('=== '+target+' ===');
  console.log('링크:',ev.result.result.value);
  console.log('콘솔:');logs.slice(0,12).forEach(l=>console.log('  '+l));
  p.kill();process.exit(0);
})();
