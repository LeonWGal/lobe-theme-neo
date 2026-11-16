import{u as e,r as a,z as r,S as s,a as t,as as i,az as l,A as n,aW as o,aX as d}from"./main-D14liIKI.js";const m=1024**3,c=["high","normal","low"],p=e=>{const a=Math.max(0,e.total-e.free),r=Math.min(e.children||0,a),s=Math.min(e.webui||0,a-r);return[s,r,Math.max(0,a-s-r)]},u=e=>null==e?"":e>=m?`${(e/m).toFixed(1)} GB`:`${Math.round(e/1048576)} MB`,x=async(e,a)=>{const r=await fetch("/lobe/memory"+e,void 0===a?{}:{body:JSON.stringify(a),headers:{"Content-Type":"application/json"},method:"POST"});let s=null;try{s=await r.json()}catch{}if(!r.ok)throw Object.assign(new Error((null==s?void 0:s.error)||`HTTP ${r.status}`),{code:null==s?void 0:s.code});return s},y=n(({css:e,token:a})=>({bar:e`
    position: relative;

    overflow: hidden;
    display: flex;

    height: 18px;

    background: ${a.colorFillTertiary};
    border-radius: ${a.borderRadiusSM}px;
  `,buttons:e`
    display: flex;
    gap: 6px;
    margin-block-start: 2px;

    /* the theme gives every button min-width: fit-content !important: these share one row */
    .ant-btn {
      min-width: 0 !important;
      padding-inline: 6px;
      font-size: 12px;
    }

    .ant-btn > span:not(.ant-btn-icon) {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,card:e`
    display: flex;
    flex-direction: column;
    gap: 6px;

    padding: 10px 12px;

    font-size: 12px;
    font-variant-numeric: tabular-nums;

    background: ${a.colorFillQuaternary};
    border: 1px solid ${a.colorBorderSecondary};
    border-radius: ${a.borderRadiusLG}px;

    .ant-btn {
      font-size: 12px;
    }
  `,dim:e`
    color: ${a.colorTextTertiary};
  `,group:e`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,groupHead:e`
    display: flex;
    gap: 6px;
    align-items: center;

    font-size: 11px;
    font-weight: 600;
    color: ${a.colorTextSecondary};
  `,head:e`
    display: flex;
    gap: 8px;
    align-items: center;

    margin-block-end: 2px;
  `,label:e`
    width: 38px;
    color: ${a.colorTextSecondary};
  `,legend:e`
    display: flex;
    flex-wrap: wrap;
    gap: 2px 10px;

    font-size: 11px;
    color: ${a.colorTextTertiary};

    i {
      display: inline-block;

      width: 8px;
      height: 8px;
      margin-inline-end: 4px;

      vertical-align: -1px;

      border-radius: 2px;
    }
  `,list:e`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-block-start: 4px;

    .ant-btn {
      font-size: 12px;
    }
  `,message:e`
    padding: 4px 6px;
    color: ${a.colorTextSecondary};
    background: ${a.colorFillTertiary};
    border-radius: ${a.borderRadiusSM}px;
  `,mode:e`
    display: flex;
    gap: 8px;
    align-items: center;
    margin-block-start: 2px;

    .ant-segmented-item-label {
      font-size: 12px;
    }
  `,part:e`
    display: flex;
    gap: 6px;
    align-items: center;

    padding-inline-start: 26px;

    font-size: 11px;

    > span:nth-child(2) {
      white-space: nowrap;
    }
    > span:first-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,pinned:e`
    border-color: ${a.colorPrimaryBorder} !important;
  `,row:e`
    display: flex;
    flex-direction: column;
    gap: 3px;

    padding: 5px 6px;

    border: 1px solid ${a.colorBorderSecondary};
    border-radius: ${a.borderRadius}px;
  `,rowHead:e`
    display: flex;
    gap: 4px;
    align-items: center;
  `,rowName:e`
    display: flex;
    flex: 1;
    flex-direction: column;

    min-width: 0;

    strong {
      overflow: hidden;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,rows:e`
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 8px;
    align-items: center;
  `,seg:e`
    height: 100%;
    opacity: 0.7;
    transition: width 600ms ${a.motionEaseOut};
  `,source:e`
    margin-inline-start: 4px;
    padding: 0 4px;

    font-size: 10px;
    font-weight: 500;
    color: ${a.purple};

    background: ${a.purple1};
    border-radius: 4px;
  `,tag:e`
    padding: 0 6px;
    font-size: 11px;
    color: ${a.colorWarning};
    background: ${a.colorWarningBg};
    border-radius: 4px;
  `,text:e`
    position: absolute;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding-inline: 6px;

    color: ${a.colorText};
    text-shadow: 0 0 3px ${a.colorBgContainer};
  `,title:e`
    font-weight: 600;
    color: ${a.colorText};
  `})),g={all:"sidebar.memory.freeAll",ram:"sidebar.memory.freeRam",vram:"sidebar.memory.freeVram"},h=(r=!0)=>{const{t:s}=e(),[t,i]=a.useState(null),[l,n]=a.useState(null),[o,d]=a.useState(!1),[m,c]=a.useState(!1),[p,y]=a.useState(""),[h,b]=a.useState(""),f=a.useRef(m);f.current=m;const v=a.useRef(p);v.current=p;const $=a.useCallback(async e=>{try{const a=await x("/status"+(e||f.current?"?full=1":""));i(a),a.holders&&n(a),d(!1)}catch(a){/HTTP 404/.test(String(a))&&d(!0)}},[]);a.useEffect(()=>{if(!r)return;let e,a=!1;const s=async()=>{"visible"!==document.visibilityState||v.current||await $(),a||(e=window.setTimeout(s,f.current?2e3:3e3))};return s(),()=>{a=!0,window.clearTimeout(e)}},[r]),a.useEffect(()=>{r&&(m?$(!0):b(""))},[m,r]);const j=(e,a)=>{var r;const t=[void 0===e.vram?"":`${u(e.vram)||"0 MB"} VRAM`,void 0===e.ram?"":`${u(e.ram)||"0 MB"} RAM`].filter(Boolean).join(" · "),i=(null==(r=e.skipped)?void 0:r.length)?` · ${s("sidebar.memory.left",{list:e.skipped.join(", ")})}`:"";b(`${s("sidebar.memory.freed",{amount:t||"0 MB",seconds:e.seconds,what:a})}${i}`)},w=async(e,a)=>{if(!v.current){y(e),v.current=e,b("");try{await a()}catch(r){b("generationBusy"===(null==r?void 0:r.code)?s("sidebar.memory.generationBusy"):(null==r?void 0:r.message)||String(r))}y(""),v.current="",await $(!0)}};return{act:(e,a,r)=>w(s("ram"===a?"sidebar.memory.busyMove":"sidebar.memory.busyUnload"),async()=>{const s=await x("/act",{action:a,id:e.id,part:null==r?void 0:r.id});j(s,r?`${e.name} / ${r.name}`:e.name)}),busy:p,free:(e,a)=>w(s("sidebar.memory.busyFree"),async()=>{const r=await x("/free",{category:null==a?void 0:a.key,level:e});j(r,a?a.name:s(g[e]))}),full:l,message:h,missing:o,open:m,pin:e=>w(" ",async()=>{await x("/pin",{id:e.id,keep:!e.pinned})}),setOpen:c,setVramMode:e=>w(s("sidebar.memory.busyMode"),async()=>{var a;const r=await x("/vram-mode",{mode:e}),t=(null==(a=r.skipped)?void 0:a.length)?` · ${s("sidebar.memory.left",{list:r.skipped.join(", ")})}`:"";b(`${s("sidebar.memory.modeSet",{mode:s(`sidebar.memory.modes.${e}`)})}${t}`)}),status:t}},b=e=>{const{theme:a}=y();return[a.colorPrimary,a.cyan,a.colorTextQuaternary]},f=a.memo(({colors:a})=>{const{styles:s}=y(),{t:t}=e();return r.jsx("div",{className:s.legend,children:["webui","started","others"].map((e,s)=>r.jsxs("span",{children:[r.jsx("i",{style:{background:a[s]}}),t(`sidebar.memory.${e}`)]},e))})}),v=a.memo(({legend:a,mk:n})=>{var m,p;const{cx:x,styles:g,theme:h}=y(),{t:v}=e(),$=b(),{act:j,busy:w,free:k,full:N,message:T,open:B,pin:S,setOpen:M,setVramMode:z,status:R}=n;if(!R)return null;const _=e=>{if(e.error)return v("sidebar.memory.unknown");if(e.count)return v("sidebar.memory.inRam",{count:e.count});const a=[e.vram?`GPU ${u(e.vram)}`:"",e.ram?`RAM ${u(e.ram)}`:""].filter(Boolean);return a.length||null!==e.vram||null!==e.ram?a.join(" · ")||v("sidebar.memory.nothingHeld"):v("sidebar.memory.loaded")},C=e=>{const a=e.usage||{},s=(e.parts||[]).filter(e=>e.vram||e.ram),i=e.id.startsWith("process:"),l=e.id.split(" #")[0],n=l.startsWith("model:")?"gpuModel":l.startsWith("face:")?"faceModel":l,m=e.detail?v(`sidebar.memory.holderDetails.${n}`,{defaultValue:e.detail}):void 0,c=v(`sidebar.memory.holderNames.${l}`,{defaultValue:e.name});return r.jsxs("div",{className:x(g.row,e.pinned&&g.pinned),children:[r.jsxs("div",{className:g.rowHead,children:[i?r.jsx("span",{style:{width:22}}):r.jsx(t,{disabled:Boolean(w)||R.generating,icon:e.pinned?r.jsx(o,{size:13}):r.jsx(d,{size:13}),onClick:()=>S(e),size:"small",style:e.pinned?{color:h.colorPrimary}:void 0,title:v(e.pinned?"sidebar.memory.unkeep":"sidebar.memory.keep"),type:"text"}),r.jsxs("div",{className:g.rowName,children:[r.jsxs("strong",{title:c,children:[c,e.source&&r.jsx("span",{className:g.source,children:e.source})]}),r.jsx("span",{className:g.dim,children:_(a)})]})]}),m&&r.jsx("span",{className:g.dim,style:{fontSize:11,paddingInlineStart:26},children:m}),(e.can_ram&&a.vram||e.can_unload)&&r.jsxs("div",{className:g.rowHead,style:{justifyContent:"flex-end",paddingInlineStart:26},children:[e.can_ram&&Boolean(a.vram)&&r.jsx(t,{disabled:Boolean(w)||R.generating,onClick:()=>j(e,"ram"),size:"small",title:v("sidebar.memory.toRamTip"),children:v("sidebar.memory.toRam")}),e.can_unload&&r.jsx(t,{danger:!0,disabled:Boolean(w)||R.generating,onClick:()=>j(e,"unload"),size:"small",title:v("cache"===e.kind?"sidebar.memory.clearTip":"sidebar.memory.unloadTip"),children:v("cache"===e.kind?"sidebar.memory.clear":"sidebar.memory.unload")})]}),s.length>1&&s.map(a=>r.jsxs("div",{className:g.part,children:[r.jsx("span",{style:{flex:1},children:v(`sidebar.memory.parts.${a.id}`,{defaultValue:a.name})}),r.jsx("span",{className:g.dim,children:[a.vram?`GPU ${u(a.vram)}`:"",a.ram?`RAM ${u(a.ram)}`:""].filter(Boolean).join(" · ")}),e.can_part_ram&&Boolean(a.vram)&&r.jsx(t,{disabled:Boolean(w)||R.generating,onClick:()=>j(e,"ram",a),size:"small",title:v("sidebar.memory.toRamTip"),children:v("sidebar.memory.toRam")})]},a.id))]},e.id)},P=N?(e=>{const a=e.categories||[],r=new Set(a.map(e=>e.key)),s={};for(const t of e.holders||[]){const e=r.has(t.category)?t.category:"other";(s[e]=s[e]||[]).push(t)}return a.filter(e=>s[e.key]).map(e=>({...e,rows:s[e.key]}))})(N):[],F=(null==(m=(N||R).pinned)?void 0:m.length)||0;return r.jsxs(r.Fragment,{children:[a&&(R.gauges.gpu||R.gauges.ram)&&r.jsx(f,{colors:$}),(null==(p=R.vram_mode)?void 0:p.can)&&r.jsxs("div",{className:g.mode,title:v("sidebar.memory.modeTip"),children:[r.jsx("span",{className:g.label,children:v("sidebar.memory.mode")}),r.jsx(s,{block:!0,disabled:Boolean(w)||R.generating,onChange:e=>z(e),options:c.map(e=>{var a;return{label:v(`sidebar.memory.modes.${e}`),title:`${v(`sidebar.memory.modeTips.${e}`)}${(null==(a=R.vram_mode)?void 0:a.startup)===e?` · ${v("sidebar.memory.modeStartup")}`:""}`,value:e}}),size:"small",style:{flex:1},value:R.vram_mode.mode})]}),r.jsxs("div",{className:g.buttons,children:[r.jsx(t,{disabled:Boolean(w)||R.generating,onClick:()=>k("ram"),size:"small",style:{flex:"1 1 0"},title:v("sidebar.memory.freeRamTip"),children:v("sidebar.memory.freeRam")}),r.jsx(t,{disabled:Boolean(w)||R.generating,onClick:()=>k("vram"),size:"small",style:{flex:"1 1 0"},title:v("sidebar.memory.freeVramTip"),children:v("sidebar.memory.freeVram")})]}),r.jsxs("div",{className:g.buttons,children:[r.jsx(t,{danger:!0,disabled:Boolean(w)||R.generating,onClick:()=>k("all"),size:"small",style:{flex:"1 1 0"},title:v("sidebar.memory.freeAllTip"),children:v("sidebar.memory.freeAll")}),r.jsx(t,{icon:B?r.jsx(i,{size:14}):r.jsx(l,{size:14}),onClick:()=>M(!B),size:"small",style:{flex:"none"},title:v("sidebar.memory.details"),type:B?"primary":"default"})]}),B&&r.jsxs("div",{className:g.list,children:[!a&&r.jsxs("div",{className:g.head,children:[r.jsx("span",{className:g.title,children:v("sidebar.memory.title")}),R.generating&&r.jsx("span",{className:g.tag,children:v("sidebar.memory.generating")})]}),!a&&r.jsx(f,{colors:$}),!N&&r.jsx("span",{className:g.dim,children:v("sidebar.memory.reading")}),N&&!P.length&&r.jsx("span",{className:g.dim,children:v("sidebar.memory.nothing")}),P.map(e=>{const a=e.rows.reduce((e,a)=>{var r;return e+((null==(r=a.usage)?void 0:r.vram)||0)},0),s=e.rows.reduce((e,a)=>{var r;return e+((null==(r=a.usage)?void 0:r.ram)||0)},0),i="process"!==e.key&&e.rows.some(e=>!e.pinned&&(e.can_unload||e.can_ram)),l=(n=e.key,o=e.name,v(`sidebar.memory.categories.${n}`,{defaultValue:o}));var n,o;return r.jsxs("div",{className:g.group,children:[r.jsxs("div",{className:g.groupHead,children:[r.jsx("span",{children:`${e.icon} ${l}`}),r.jsx("span",{className:g.dim,style:{fontWeight:400},children:[a?`GPU ${u(a)}`:"",s?`RAM ${u(s)}`:""].filter(Boolean).join(" · ")}),r.jsx("span",{style:{flex:1}}),i&&r.jsx(t,{disabled:Boolean(w)||R.generating,onClick:()=>k("all",{key:e.key,name:l}),size:"small",title:v("sidebar.memory.sectionFreeTip"),type:"link",children:v("sidebar.memory.sectionFree")})]}),e.rows.map(C)]},e.key)}),r.jsx("span",{className:g.dim,children:F?v("sidebar.memory.kept",{count:F}):v("sidebar.memory.keepHint")})]}),(w.trim()||T)&&r.jsx("div",{className:g.message,children:w.trim()||T})]})});a.memo(()=>{const{styles:a}=y(),{t:s}=e(),t=h(),i=b(),{missing:l,status:n}=t;if(l||!n)return null;const o=(e,t)=>{if(!t)return null;const l=p(t);return r.jsxs("div",{className:a.rows,children:[r.jsx("span",{className:a.label,children:e}),r.jsxs("div",{className:a.bar,title:`${t.name?`${t.name}\n`:""}${s("sidebar.memory.webui")} ${u(l[0])} · ${s("sidebar.memory.started")} ${u(l[1])} · ${s("sidebar.memory.others")} ${u(l[2])} · ${s("sidebar.memory.free")} ${u(t.free)}`,children:[l.map((e,s)=>r.jsx("div",{className:a.seg,style:{background:i[s],width:100*e/t.total+"%"}},s)),r.jsx("span",{className:a.text,children:`${((t.total-t.free)/m).toFixed(1)} / ${(t.total/m).toFixed(1)} GB`})]})]})};return r.jsxs("div",{className:a.card,children:[r.jsxs("div",{className:a.head,children:[r.jsx("span",{className:a.title,children:s("sidebar.memory.title")}),n.generating&&r.jsx("span",{className:a.tag,children:s("sidebar.memory.generating")})]}),o("VRAM",n.gauges.gpu),o("RAM",n.gauges.ram),r.jsx(v,{legend:!0,mk:t})]})});const $=n(({css:e,token:a})=>({bar:e`
    position: relative;

    overflow: hidden;

    height: 18px;

    background: ${a.colorFillTertiary};
    border-radius: ${a.borderRadiusSM}px;
  `,card:e`
    display: flex;
    flex-direction: column;
    gap: 6px;

    padding: 10px 12px;

    font-size: 12px;
    font-variant-numeric: tabular-nums;

    background: ${a.colorFillQuaternary};
    border: 1px solid ${a.colorBorderSecondary};
    border-radius: ${a.borderRadiusLG}px;
  `,fill:e`
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    transition:
      width 600ms ${a.motionEaseOut},
      background 600ms;
  `,head:e`
    display: flex;
    gap: 8px;
    align-items: baseline;
    justify-content: space-between;

    margin-block-end: 2px;

    color: ${a.colorTextSecondary};
  `,label:e`
    width: 38px;
    color: ${a.colorTextSecondary};
  `,name:e`
    overflow: hidden;
    color: ${a.colorTextTertiary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,row:e`
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 8px;
    align-items: center;
  `,spark:e`
    display: block;
    width: 100%;
    height: 34px;
  `,text:e`
    position: absolute;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding-inline: 6px;

    color: ${a.colorText};
    text-shadow: 0 0 3px ${a.colorBgContainer};
  `,title:e`
    font-weight: 600;
    color: ${a.colorText};
  `})),j=e=>(e/1024**3).toFixed(e>=100*1024**3?0:1),w=a.memo(({label:e,parts:a,percent:s,text:t})=>{const{styles:i,theme:l}=$(),n=Math.max(0,Math.min(100,s??0)),o=n>=90?l.colorError:n>=70?l.colorWarning:l.colorPrimary;return r.jsxs("div",{className:i.row,children:[r.jsx("span",{className:i.label,children:e}),r.jsxs("div",{className:i.bar,title:a?`${e}: ${t}\n${a.title}`:`${e}: ${t}`,children:[a?r.jsx("div",{className:i.fill,style:{display:"flex",width:`${n}%`},children:a.bytes.map((e,s)=>r.jsx("div",{style:{background:0===s?o:a.colors[s],flex:`${e} 0 0`,opacity:.6}},s))}):r.jsx("div",{className:i.fill,style:{background:o,opacity:.55,width:`${n}%`}}),r.jsx("span",{className:i.text,children:t})]})]})}),k=a.memo(({series:e})=>{const{styles:a}=$();return r.jsx("svg",{className:a.spark,preserveAspectRatio:"none",viewBox:"0 0 100 30",children:e.map(({color:e,values:a},s)=>{if(a.length<2)return null;const t=100/47,i=(48-a.length)*t,l=a.map((e,a)=>`${(i+a*t).toFixed(2)},${(30-e/100*28-1).toFixed(2)}`);return r.jsxs("g",{children:[r.jsx("polyline",{fill:e,fillOpacity:.12,points:`${l[0].split(",")[0]},30 ${l.join(" ")} 100,30`,stroke:"none"}),r.jsx("polyline",{fill:"none",points:l.join(" "),stroke:e,strokeWidth:1.2,vectorEffect:"non-scaling-stroke"})]},s)})})}),N=a.memo(({active:s=!0,memory:t})=>{var i;const{styles:l,theme:n}=$(),{t:o}=e(),d=h(Boolean(t)&&s),m=b(),c=Boolean(t)&&!d.missing&&Boolean(d.status),[x,y]=a.useState(null),[g,f]=a.useState(!1),N=a.useRef({cpu:[],gpu:[],ram:[],vram:[]});if(a.useEffect(()=>{if(!s)return;let e,a=!1;const r=(e,a)=>{null!=a&&(e.push(a),e.length>48&&e.shift())},t=async()=>{if("visible"===document.visibilityState)try{const e=await fetch("/lobe/system");if(!e.ok)throw new Error(String(e.status));const s=await e.json();if(a)return;const t=s.gpus[0];r(N.current.cpu,s.cpu),r(N.current.ram,s.ram?s.ram.used/s.ram.total*100:null),r(N.current.gpu,null==t?void 0:t.util),r(N.current.vram,t?t.vram_used/t.vram_total*100:null),y(s),f(!1)}catch{a||f(!0)}a||(e=window.setTimeout(t,1500))};return t(),()=>{a=!0,window.clearTimeout(e)}},[s]),g&&!x)return null;if(!x)return null;const T=N.current,B=(e,a,r)=>{if(!c||!r)return;const[s,t]=p({...r,free:Math.max(0,r.total-e),total:Math.max(r.total,e)}),i=[s,t,Math.max(0,e-s-t)];return{bytes:i,colors:m,title:`${o("sidebar.memory.webui")} ${u(i[0])} · ${o("sidebar.memory.started")} ${u(i[1])} · ${o("sidebar.memory.others")} ${u(i[2])}`,total:a}};return r.jsxs("div",{className:l.card,children:[r.jsxs("div",{className:l.head,children:[r.jsx("span",{className:l.title,children:o("sidebar.system.title")}),x.gpus[0]&&r.jsx("span",{className:l.name,children:x.gpus[0].name.replace(/^nvidia\s+/i,"")})]}),r.jsx(k,{series:x.gpus.length>0?[{color:n.colorTextTertiary,values:T.cpu},{color:n.colorSuccess,values:T.vram},{color:n.colorPrimary,values:T.gpu}]:[{color:n.colorSuccess,values:T.ram},{color:n.colorPrimary,values:T.cpu}]}),null!==x.cpu&&r.jsx(w,{label:"CPU",percent:x.cpu,text:`${Math.round(x.cpu)}%`}),x.ram&&r.jsx(w,{label:"RAM",parts:B(x.ram.used,x.ram.total,null==(i=d.status)?void 0:i.gauges.ram),percent:x.ram.used/x.ram.total*100,text:`${j(x.ram.used)} / ${j(x.ram.total)} GB`}),x.gpus.map((e,a)=>{var s;return r.jsxs("div",{style:{display:"contents"},children:[null!==e.util&&r.jsx(w,{label:x.gpus.length>1?`GPU${a}`:"GPU",percent:e.util,text:`${e.util}%`}),r.jsx(w,{label:"VRAM",parts:0===a?B(e.vram_used,e.vram_total,null==(s=d.status)?void 0:s.gauges.gpu):void 0,percent:e.vram_used/e.vram_total*100,text:`${j(e.vram_used)} / ${j(e.vram_total)} GB`}),(null!==e.temp||null!==e.power)&&r.jsx(w,{label:null!==e.temp?o("sidebar.system.temp"):"PWR",percent:null!==e.temp?e.temp:e.power_limit?(e.power||0)/e.power_limit*100:null,text:[null!==e.temp?`${e.temp}°C`:"",null!==e.power?`${Math.round(e.power)} W`:""].filter(Boolean).join(" · ")})]},a)}),x.disk&&r.jsx(w,{label:o("sidebar.system.disk"),percent:x.disk.used/x.disk.total*100,text:`${j(x.disk.used)} / ${j(x.disk.total)} GB`}),!x.nvml&&x.gpus.length>0&&r.jsx("span",{className:l.name,title:o("sidebar.system.noNvmlHint"),children:o("sidebar.system.noNvml")}),c&&r.jsx(v,{mk:d})]})});export{N as default};
