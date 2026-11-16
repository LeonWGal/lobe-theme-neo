import{r as e,u as t,f as o,g as s,F as r,H as a,h as i,i as n,j as l,k as c,L as d,l as p,m as u,n as m,o as g,p as h,s as x,q as f,w as b,x as y,M as w,I as v,y as $,z as k,A as j,D as S,E as _,G as C,J as M,K as T,N,O as L,Q as O,R as D,U as z,V as q,W as E,X as P,Y as W,Z as A,_ as B,$ as I,a0 as R,a1 as V,a2 as F}from"./main-vZhtr4Ub.js";import{r as H,l as K,c as U,a as G}from"./presets-Dbgk9Par.js";import{I as J}from"./index-Bx7y1q0R.js";import{T as Q}from"./index-BKrkBge9.js";import"./SearchOutlined-Bq6WyL1O.js";const X=["action","tab","preset","history","lora","checkpoint","sampler","scheduler","setting"],Y=new Set(["action","tab","preset","history"]),Z=$(({css:e,token:t})=>({active:e`
    background: ${t.colorFillSecondary};
  `,empty:e`
    padding: 24px;
    color: ${t.colorTextTertiary};
    text-align: center;
  `,footer:e`
    padding: 8px 14px;
    font-size: 12px;
    color: ${t.colorTextTertiary};
    border-top: 1px solid ${t.colorBorderSecondary};
  `,group:e`
    padding: 10px 14px 4px;
    font-size: 11px;
    font-weight: 600;
    color: ${t.colorTextTertiary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,input:e`
    padding: 14px 16px;
    font-size: 16px;
    border-bottom: 1px solid ${t.colorBorderSecondary} !important;
    border-radius: 0;
  `,item:e`
    cursor: pointer;

    display: flex;
    gap: 10px;
    align-items: center;

    margin: 0 6px;
    padding: 8px 10px;

    border-radius: ${t.borderRadius}px;
  `,list:e`
    overflow-y: auto;
    max-height: min(60vh, 520px);
    padding-bottom: 6px;
  `,subtitle:e`
    overflow: hidden;
    font-size: 12px;
    color: ${t.colorTextTertiary};
    text-overflow: ellipsis;
    white-space: nowrap;
  `,title:e`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `})),ee=/[\s(./:[_-]/,te={history:.9,setting:.75},oe=(e,t)=>{const o=t.toLowerCase();let s=0;for(const r of e.toLowerCase().split(/\s+/).filter(Boolean)){const e=o.indexOf(r);if(e>=0){s+=100+(0===e||ee.test(o[e-1])?60:0)-.5*Math.min(e,40);continue}let t=0,a=-2,i=0;for(const s of r){const e=o.indexOf(s,t);if(e<0)return 0;i+=e===a+1?4:0===e||ee.test(o[e-1])?3:1,a=e,t=e+1}s+=i}return s-.01*o.length},se=(e,t)=>{const o=e.toLowerCase(),s=(t.name||t.title).toLowerCase();let r=1.3*oe(e,s);return r>0?s===o?r+=400:s.startsWith(o)?r+=220:s.includes(o)&&(r+=120):(r=oe(e,`${t.title} ${t.keywords||""} ${t.subtitle||""}`),r>0&&t.title.toLowerCase().includes(o)&&(r+=80)),r*(te[t.group]??1)},re=()=>{var e,t,o,s;const r=[],a=V("#tab_settings");if(!a)return r;for(const i of a.querySelectorAll('[id^="setting_"]')){const a=((null==(e=i.querySelector('label > span, .label-wrap > span, [data-testid="block-info"], span[data-testid="block-label"]'))?void 0:e.textContent)||(null==(t=i.querySelector("label"))?void 0:t.textContent)||"").trim();if(!a||a.length>160)continue;const n=(null==(s=null==(o=i.closest('.tabitem, [id^="settings_"]'))?void 0:o.id)?void 0:s.replace(/^settings_/,""))||"";r.push({id:i.id,label:a,section:n})}return r},ae=e.memo(({open:$,onClose:ee})=>{const{t:te}=t(),{styles:oe,cx:ae}=Z(),[ie,ne]=e.useState(""),le=e.useDeferredValue(ie),[ce,de]=e.useState(0),[pe,ue]=e.useState([]),me=e.useRef(null),ge=e.useRef(null),he=e.useCallback(()=>{var e;null==(e=document.querySelector("[data-lobe-theme-toggle]"))||e.click()},[]),xe=e.useMemo(()=>{const e=e=>te(`tools.palette.${e}`);return[...[{group:"action",icon:o,id:"generate",keywords:"run start",run:()=>p(),title:e("generate")},{group:"action",icon:s,id:"interrupt",keywords:"stop cancel",run:()=>u(),title:e("interrupt")},{group:"action",icon:r,id:"skip",keywords:"next",run:()=>m(),title:e("skip")},{group:"action",icon:a,id:"history",run:()=>g.emit("open:history"),title:e("openHistory")},{group:"action",icon:i,id:"presets",run:()=>g.emit("open:presets"),title:e("openPresets")},{group:"action",icon:n,id:"save-preset",run:async()=>{const e=h(),t=H(e),o=await K();await U({name:te("tools.presets.defaultName",{n:o.length+1}),parameters:t.parameters,tab:e}),x.success(te("tools.presets.saved"))},title:e("savePreset")},{group:"action",icon:l,id:"theme",keywords:"dark light mode",run:he,title:e("toggleTheme")},{group:"action",icon:c,id:"theme-settings",keywords:"lobe",run:()=>g.emit("open:settings"),title:e("themeSettings")},{group:"action",icon:d,id:"workspace",keywords:"layout toolbar panels",run:()=>g.emit("open:workspace"),title:te("workspace.title")}],...f().map(e=>({group:"tab",icon:d,id:`tab:${e.id}`,keywords:e.id,run:()=>{var t;return null==(t=b()[e.index])?void 0:t.click()},title:e.label}))]},[he,te]);e.useEffect(()=>{if(!$)return;let e=!1;const t=e=>te(`tools.palette.${e}`);return(async()=>{const[o,s,r,a,n]=await Promise.all([k(),j(),S(),K(),_.list({limit:30}).catch(()=>({items:[],total:0}))]);if(e)return;const l=new Set(r.favorites),c=[...a.map(e=>({group:"preset",icon:i,id:`preset:${e.id}`,name:e.name,run:async()=>{await G(e,h()),x.success(te("tools.presets.applied"))},subtitle:e.parameters,title:`${t("applyPreset")}: ${e.name}`})),...n.items.map(e=>{const t=C(e.infotext);return{group:"history",icon:M,id:`history:${e.id}`,keywords:e.infotext,run:async()=>{const t="img2img"===e.tab?"img2img":"txt2img";T(`tab_${t}`),await N(t,e.infotext),x.success(te("tools.history.applied"))},subtitle:`${new Date(e.time).toLocaleString()} · ${t.parametersLine}`,title:t.prompt||e.infotext.slice(0,80)}}),...[...s.values()].sort((e,t)=>Number(l.has(t.name))-Number(l.has(e.name))).map(e=>({group:"lora",icon:L,id:`lora:${e.name}`,keywords:`${e.alias} ${e.triggerWords.join(" ")}`,name:e.name,run:()=>{D(h(),`<lora:${e.alias}:${z(q(e.name))}>`),E(e.name)},subtitle:[l.has(e.name)?"★":"",O[e.arch],e.triggerWords.join(", ")].filter(Boolean).join(" · "),title:`${t("addLora")}: ${e.name}`})),...o.checkpoints.map(e=>({group:"checkpoint",icon:P,id:`ckpt:${e}`,name:e,run:()=>W("setting_sd_model_checkpoint",e),title:`${t("loadCheckpoint")}: ${e}`})),...o.samplers.map(e=>({group:"sampler",icon:A,id:`sampler:${e}`,name:e,run:()=>W(`${h()}_sampling`,e),title:`${t("setSampler")}: ${e}`})),...o.schedulers.map(e=>({group:"scheduler",icon:B,id:`scheduler:${e}`,name:e,run:()=>W(`${h()}_scheduler`,e),title:`${t("setScheduler")}: ${e}`})),...re().map(e=>({group:"setting",icon:e.section?I:R,id:`setting:${e.id}`,keywords:e.id.replace(/^setting_/,""),run:()=>(async(e,t)=>{T("tab_settings");const o=V("#settings_search input, #settings_search textarea");o&&F(o,t),await new Promise(e=>{setTimeout(e,250)});const s=V(`#${e}`);s&&(s.scrollIntoView({behavior:"smooth",block:"center"}),s.animate([{boxShadow:"0 0 0 2px var(--lobe-tools-primary, #1677ff)"},{boxShadow:"0 0 0 0 transparent"}],{duration:1600,easing:"ease-out"}))})(e.id,e.label),subtitle:e.id.replace(/^setting_/,""),title:e.label}))];ue(c)})().catch(e=>{console.error("[lobe] command index",e)}),()=>{e=!0}},[$]),e.useEffect(()=>{$&&(ne(""),de(0),setTimeout(()=>{var e;return null==(e=me.current)?void 0:e.focus()},50))},[$]);const fe=e.useMemo(()=>{const e=[...xe,...pe],t=le.trim();if(!t){const t=e.filter(e=>Y.has(e.group)),o=new Map;return t.filter(e=>{const t=(o.get(e.group)||0)+1;return o.set(e.group,t),"history"!==e.group||t<=5})}return e.map(e=>({command:e,score:se(t,e)})).filter(e=>e.score>0).sort((e,t)=>t.score-e.score||X.indexOf(e.command.group)-X.indexOf(t.command.group)).slice(0,60).map(e=>e.command)},[le,xe,pe]),be=e.useMemo(()=>{const e=[],t=new Map;for(const o of fe)t.has(o.group)||(t.set(o.group,[]),e.push(o.group)),t.get(o.group).push(o);return le.trim()||e.sort((e,t)=>X.indexOf(e)-X.indexOf(t)),e.map(e=>({commands:t.get(e),group:e}))},[fe,le]),ye=e.useMemo(()=>be.flatMap(e=>e.commands),[be]);e.useEffect(()=>{de(0)},[ie]),e.useEffect(()=>{var e,t;null==(t=null==(e=ge.current)?void 0:e.querySelector(`[data-index="${ce}"]`))||t.scrollIntoView({block:"nearest"})},[ce]);const we=e.useCallback(e=>{e&&(ee(),setTimeout(()=>{Promise.resolve(e.run()).catch(e=>console.error("[lobe] command",e))},60))},[ee]);let ve=-1;return y.jsx(w,{closable:!1,destroyOnClose:!0,footer:null,onCancel:ee,open:$,style:{top:"12vh"},styles:{body:{padding:0},container:{overflow:"hidden",padding:0}},width:640,children:y.jsxs("div",{id:"lobe-command-palette",onKeyDown:e=>{switch(e.key){case"ArrowDown":e.preventDefault(),de(e=>Math.min(ye.length-1,e+1));break;case"ArrowUp":e.preventDefault(),de(e=>Math.max(0,e-1));break;case"Enter":e.preventDefault(),we(ye[ce])}},children:[y.jsx(J,{"aria-activedescendant":ye[ce]?`lobe-command-${ce}`:void 0,"aria-controls":"lobe-command-results","aria-expanded":$,className:oe.input,onChange:e=>ne(e.target.value),placeholder:te("tools.palette.placeholder"),ref:me,role:"combobox",value:ie,variant:"borderless"}),y.jsxs("div",{className:oe.list,id:"lobe-command-results",ref:ge,role:"listbox",children:[0===ye.length&&y.jsx("div",{className:oe.empty,children:te("tools.palette.empty")}),be.map(e=>y.jsxs("div",{children:[y.jsx("div",{className:oe.group,children:te(`tools.palette.groups.${e.group}`)}),e.commands.map(e=>{ve++;const t=ve;return y.jsxs("div",{"aria-selected":t===ce,className:ae(oe.item,t===ce&&oe.active),"data-index":t,id:`lobe-command-${t}`,onClick:()=>we(e),onMouseMove:()=>t!==ce&&de(t),role:"option",children:[y.jsx(v,{icon:e.icon,size:{size:16}}),y.jsxs("div",{style:{flex:1,minWidth:0},children:[y.jsx("div",{className:oe.title,children:e.title}),e.subtitle&&y.jsx("div",{className:oe.subtitle,children:e.subtitle})]}),t===ce&&y.jsx(Q,{bordered:!1,style:{margin:0},children:"↵"})]},e.id)})]},e.group))]}),y.jsx("div",{className:oe.footer,children:te("tools.palette.hint")})]})})});export{ae as default};
