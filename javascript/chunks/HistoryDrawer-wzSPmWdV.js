import{r as e,u as t,a3 as s,E as o,o as a,x as i,S as r,a4 as l,a5 as n,a6 as c,a7 as d,a8 as m,a9 as h,a as p,aa as x,s as u,h as g,ab as j,ac as y,T as b,ad as f,ae as w,af as v,M as k,y as S,G as z,ag as C,ah as $,ai as N,aj as E,ak as q,al as B,am as T,i as M,K as D,N as R}from"./main-vZhtr4Ub.js";import{u as A,Q as F}from"./QueuePanel-Cl7Slv9A.js";import{l as P,c as I,p as _}from"./presets-Dbgk9Par.js";import{D as G,S as L,I as H}from"./index-BAzJf6YV.js";import{I as W}from"./index-Bx7y1q0R.js";import{E as O}from"./index-C29-GZD1.js";import{T as Q}from"./index-BKrkBge9.js";import{C as Y}from"./index-Wjjb-3io.js";import{D as K}from"./index-COZxVUpv.js";import"./index-CTcKuG7U.js";import"./index-CIsaUwLe.js";import"./index-DtQaaB4A.js";import"./SearchOutlined-Bq6WyL1O.js";import"./collapse-BaEznz2I.js";import"./useBubbleLock-COGQ7bHC.js";const U=S(({css:e,token:t})=>({chips:e`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .ant-tag {
      margin: 0;
      font-size: 11px;
      line-height: 18px;
    }
  `,day:e`
    position: sticky;
    z-index: 2;
    top: 0;

    padding: 6px 0;

    font-size: 12px;
    font-weight: 600;
    color: ${t.colorTextSecondary};
    text-transform: uppercase;
    letter-spacing: 0.04em;

    background: ${t.colorBgElevated};
  `,diffAdd:e`
    color: ${t.colorSuccessText};
    background: ${t.colorSuccessBg};
    border-radius: 3px;
  `,diffRemove:e`
    color: ${t.colorErrorText};
    text-decoration: line-through;
    background: ${t.colorErrorBg};
    border-radius: 3px;
  `,diffRow:e`
    background: ${t.colorWarningBg};
  `,entry:e`
    padding: 10px;
    background: ${t.colorFillQuaternary};
    border: 1px solid ${t.colorBorderSecondary};
    border-radius: ${t.borderRadiusLG}px;

    &:hover {
      border-color: ${t.colorPrimaryBorder};
    }
  `,more:e`
    position: absolute;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 600;
    color: #fff;

    background: rgb(0 0 0 / 50%);
    border-radius: ${t.borderRadius}px;
  `,prompt:e`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    font-size: 13px;
    line-height: 1.45;
    word-break: break-word;
  `,table:e`
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;

    td,
    th {
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
      border-bottom: 1px solid ${t.colorBorderSecondary};
    }

    th {
      width: 22%;
      color: ${t.colorTextSecondary};
    }
  `,thumb:e`
    position: relative;
    overflow: hidden;
    flex: none;

    width: 72px;
    height: 72px;

    background: ${t.colorFillTertiary};
    border-radius: ${t.borderRadius}px;

    img {
      object-fit: cover;
      width: 72px !important;
      height: 72px !important;
    }
  `,time:e`
    font-size: 12px;
    color: ${t.colorTextTertiary};
  `})),J=(e,t)=>{const s=new Date(e),o=new Date,a=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),i=Math.round((a(o)-a(s))/864e5);return 0===i?t("tools.history.today"):1===i?t("tools.history.yesterday"):s.toLocaleDateString(void 0,{day:"numeric",month:"long",weekday:"short",year:"numeric"})},V=e=>e.thumb?o.thumbUrl(e.thumb):e.url,X=[["Sampler",""],["Schedule type",""],["Steps","Steps"],["CFG scale","CFG"],["Size",""],["Seed","Seed"]],Z=e=>new Date(e.time).toLocaleString(),ee=e=>e.split(/[\n,]/).map(e=>e.trim()).filter(Boolean),te=e.memo(({a:e,b:t,classNames:s})=>{const o=ee(e),a=ee(t),r=new Set(o),l=new Set(a);return i.jsxs("span",{children:[a.map((e,t)=>i.jsxs("span",{children:[t>0&&", ",i.jsx("span",{className:r.has(e)?void 0:s.add,children:e})]},`b${t}`)),o.filter(e=>!l.has(e)).map((e,t)=>i.jsxs("span",{children:[(a.length>0||t>0)&&", ",i.jsx("span",{className:s.remove,children:e})]},`a${t}`))]})}),se=e.memo(({entries:e,onClose:s})=>{const{t:o}=t(),{styles:a}=U(),[r,n]=[...e].sort((e,t)=>e.time-t.time),c=z(r.infotext),d=z(n.infotext),m=new Map(c.parameters),h=new Map(d.parameters),p=[...new Set([...m.keys(),...h.keys()])];return i.jsxs(k,{centered:!0,footer:null,onCancel:s,open:!0,styles:{body:{maxHeight:"80dvh",overflowY:"auto"}},title:o("tools.history.compare"),width:860,children:[i.jsx(l,{gap:12,horizontal:!0,style:{marginBottom:12},children:[r,n].map((e,t)=>i.jsxs(l,{align:"center",gap:8,style:{flex:1,minWidth:0},children:[e.images[0]&&i.jsx("div",{style:{textAlign:"center",width:"100%"},children:i.jsx(H,{alt:z(e.infotext).prompt,preview:{src:e.images[0].url},src:e.images[0].url,style:{borderRadius:8,maxHeight:"34dvh",objectFit:"contain",width:"100%"}})}),i.jsxs(l,{gap:2,children:[i.jsx("b",{children:0===t?"A":"B"}),i.jsx("span",{className:a.time,children:Z(e)})]})]},e.id))}),i.jsx("div",{style:{maxHeight:"30dvh",overflow:"auto"},children:i.jsx("table",{className:a.table,children:i.jsxs("tbody",{children:[i.jsxs("tr",{className:c.prompt===d.prompt?void 0:a.diffRow,children:[i.jsx("th",{children:o("tools.history.prompt")}),i.jsx("td",{colSpan:2,children:i.jsx(te,{a:c.prompt,b:d.prompt,classNames:{add:a.diffAdd,remove:a.diffRemove}})})]}),i.jsxs("tr",{className:c.negative===d.negative?void 0:a.diffRow,children:[i.jsx("th",{children:o("tools.history.negative")}),i.jsx("td",{colSpan:2,children:i.jsx(te,{a:c.negative,b:d.negative,classNames:{add:a.diffAdd,remove:a.diffRemove}})})]}),i.jsxs("tr",{children:[i.jsx("th",{children:o("tools.history.parameter")}),i.jsx("th",{children:"A"}),i.jsx("th",{children:"B"})]}),p.map(e=>i.jsxs("tr",{className:m.get(e)===h.get(e)?void 0:a.diffRow,children:[i.jsx("th",{children:e}),i.jsx("td",{children:m.get(e)??"–"}),i.jsx("td",{children:h.get(e)??"–"})]},e))]})})})]})}),oe=e.memo(({entry:s,selected:o,selectionFull:a,onSelect:r,onDelete:n})=>{const{t:c}=t(),{styles:d}=U(),m=e.useMemo(()=>z(s.infotext),[s.infotext]),h=e.useMemo(()=>(e=>{const t=new Map(z(e.infotext).parameters);return X.flatMap(([e,s])=>{const o=t.get(e);return o?[s?`${s} ${o}`:o]:[]})})(s),[s.infotext]),x="img2img"===s.tab?"img2img":"txt2img",g=e.useMemo(()=>new Map(m.parameters).get("Seed"),[m]),j=s.images.slice(0,3);return i.jsxs(l,{className:d.entry,gap:8,children:[i.jsxs(l,{align:"center",gap:8,horizontal:!0,children:[i.jsx(Y,{"aria-label":`${c("tools.history.compare")}: ${Z(s)}`,checked:o,disabled:!o&&a,onChange:e=>r(s.id,e.target.checked)}),i.jsx("span",{className:d.time,children:new Date(s.time).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}),i.jsx(Q,{bordered:!1,style:{margin:0},children:s.tab}),s.images.length>1&&i.jsx("span",{className:d.time,children:c("tools.history.images",{count:s.images.length})})]}),i.jsxs(l,{gap:10,horizontal:!0,children:[j.length>0&&i.jsx(H.PreviewGroup,{items:s.images.map(e=>e.url),children:i.jsx(l,{gap:6,horizontal:!0,style:{flex:"none"},children:j.map((e,t)=>i.jsxs("div",{className:d.thumb,children:[i.jsx(H,{alt:m.prompt,fallback:V(e),preview:{src:e.url},src:V(e)}),t===j.length-1&&s.images.length>j.length&&i.jsxs("div",{className:d.more,style:{pointerEvents:"none"},children:["+",s.images.length-j.length]})]},t))})}),i.jsxs(l,{gap:6,style:{minWidth:0},children:[i.jsx("div",{className:d.prompt,title:m.prompt,children:m.prompt||"—"}),i.jsx("div",{className:d.chips,children:h.map(e=>i.jsx(Q,{children:e},e))})]})]}),i.jsxs(l,{align:"center",gap:4,horizontal:!0,wrap:"wrap",children:[i.jsx(p,{onClick:async()=>{D(`tab_${x}`),await R(x,s.infotext),u.success(c("tools.history.applied"))},size:"small",type:"primary",children:c("tools.history.reuseAll")}),i.jsx(p,{onClick:()=>C(x,m.prompt,m.negative),size:"small",children:c("tools.history.reusePrompt")}),g&&i.jsx(p,{onClick:()=>$(x,g),size:"small",children:c("tools.history.reuseSeed")}),s.images.length>0&&i.jsx(K,{menu:{items:[{icon:i.jsx(N,{size:16}),key:"img2img",label:c("controls.sendToImg2img")},{icon:i.jsx(E,{size:16}),key:"inpaint",label:c("controls.sendToInpaint")},{icon:i.jsx(q,{size:16}),key:"extras",label:c("controls.sendToExtras")}],onClick:({key:e})=>{(async e=>{var t;const o=s.images[0];if(o)try{const s=await fetch(o.url);if(!s.ok)throw new Error("Image unavailable");const a=await s.blob(),i="function"==typeof gradioApp?gradioApp():document;D("extras"===e?"tab_extras":"tab_img2img"),"extras"!==e&&(null==(t=i.querySelectorAll("#mode_img2img > .tab-nav button")["inpaint"===e?2:0])||t.click());const r={extras:"extras_image",img2img:"img2img_image",inpaint:"img2maskimg"}[e];await new Promise(e=>{requestAnimationFrame(()=>e())});const l=i.querySelector(`#${r} input[type=file]`);if(!l)throw new Error("Image input unavailable");const n=new DataTransfer;n.items.add(new File([a],`generation.${a.type.split("/")[1]||"png"}`,{type:a.type})),l.files=n.files,l.dispatchEvent(new Event("change",{bubbles:!0}))}catch{u.error(c("tools.queue.error"))}})(e)}},children:i.jsx(p,{size:"small",children:c("tools.queue.send")})}),i.jsx("div",{style:{flex:1}}),i.jsx(b,{title:c("tools.history.copy"),children:i.jsx(f,{"aria-label":c("tools.history.copy"),icon:B,onClick:async()=>{await T(s.infotext),u.success(c("tools.history.copied"))},size:"small"})}),i.jsx(b,{title:c("tools.history.savePreset"),children:i.jsx(f,{"aria-label":c("tools.history.savePreset"),icon:M,onClick:async()=>{const e=await P();await I({name:c("tools.presets.defaultName",{n:e.length+1}),parameters:_(s.infotext),tab:x}),u.success(c("tools.presets.saved"))},size:"small"})}),i.jsx(b,{title:c("tools.history.delete"),children:i.jsx(f,{"aria-label":c("tools.history.delete"),icon:v,onClick:()=>n(s.id),size:"small"})})]})]})}),ae=e.memo(({open:S,onClose:z,initialSection:C})=>{const{t:$}=t(),{styles:N}=U(),E=k,{mobile:q}=A(),[B,T]=e.useState([]),[M,D]=e.useState(0),[R,P]=e.useState(""),[I,_]=e.useState(""),[H,Y]=e.useState(""),[K,V]=e.useState(C||"history");e.useEffect(()=>{S&&V(C||"history")},[S,C]);const X=s(),[Z,ee]=e.useState(!1),[te,ae]=e.useState([]),[ie,re]=e.useState(!1),le=e.useRef(0),ne=e.useCallback(async e=>{const t=++le.current;ee(!0);try{const s=await o.list({limit:40,offset:e,q:R,status:H,tab:I});if(t!==le.current)return;D(s.total),T(t=>0===e?s.items:[...t,...s.items])}catch{t===le.current&&0===e&&T([])}finally{t===le.current&&ee(!1)}},[R,H,I]);e.useEffect(()=>{if(!S)return;const e=setTimeout(()=>ne(0),R?250:0);return()=>clearTimeout(e)},[S,ne]),e.useEffect(()=>a.on("history:added",e=>{I&&e.tab!==I||S&&ne(0)}),[I,S,ne]),e.useEffect(()=>a.on("queue:changed",()=>{S&&ne(0)}),[S,ne]);const ce=e.useCallback(async e=>{await o.remove(e),T(t=>t.filter(t=>t.id!==e)),ae(t=>t.filter(t=>t!==e)),D(e=>Math.max(0,e-1))},[]),de=e.useCallback((e,t)=>{ae(s=>t?[...s,e].slice(-2):s.filter(t=>t!==e))},[]),me=e.useMemo(()=>{const e=[];for(const t of B){const s=J(t.time,$),o=e.at(-1);o&&o.label===s?o.entries.push(t):e.push({entries:[t],label:s})}return e},[B]),he=te.map(e=>B.find(t=>t.id===e)).filter(Boolean);return i.jsxs(G,{extra:i.jsxs(l,{gap:4,horizontal:!0,children:[i.jsx(b,{title:2===te.length?$("tools.history.compare"):$("tools.history.compareHint"),children:i.jsx(f,{"aria-label":$("tools.history.compare"),disabled:2!==he.length,icon:w,onClick:()=>re(!0)})}),i.jsx(b,{title:$("tools.history.clear"),children:i.jsx(f,{"aria-label":$("tools.history.clear"),icon:v,onClick:()=>E.confirm({centered:!0,okButtonProps:{danger:!0},onOk:async()=>{await o.clear(),ae([]),await ne(0)},title:$("tools.history.clearConfirm")})})})]}),onClose:z,open:S,placement:"right",styles:{body:{paddingBlock:0}},title:$(X?"tools.queue.drawer":"tools.history.title"),width:q?"100%":560,children:[X&&i.jsx(r,{block:!0,onChange:V,options:[{label:$("tools.history.title"),value:"history"},{label:`${$("tools.queue.title")} (${X.count})`,value:"queue"}],value:K}),X&&"queue"===K?i.jsx(F,{}):i.jsxs(l,{gap:10,style:{paddingBlock:12},children:[i.jsx(W.Search,{allowClear:!0,onChange:e=>P(e.target.value),placeholder:$("tools.history.search"),value:R}),i.jsx(r,{block:!0,onChange:e=>_(String(e)),options:[{label:$("tools.history.all"),value:""},{label:"txt2img",value:"txt2img"},{label:"img2img",value:"img2img"}],value:I}),X&&i.jsx(r,{onChange:e=>Y(String(e)),options:[{label:$("tools.history.all"),value:""},...["bookmarked","done","failed","interrupted"].map(e=>({label:$(`tools.queue.${e}`),value:e}))],value:H}),0===B.length&&!Z&&i.jsx(O,{description:$("tools.history.empty"),image:O.PRESENTED_IMAGE_SIMPLE}),me.map(e=>i.jsxs(l,{gap:8,children:[i.jsx("div",{className:N.day,children:e.label}),e.entries.map(e=>i.jsxs("div",{className:"lobe-history-task",children:[i.jsx(oe,{entry:e,onDelete:ce,onSelect:de,selected:te.includes(e.id),selectionFull:te.length>=2},e.id),X&&i.jsxs(l,{gap:6,horizontal:!0,style:{flexWrap:"wrap",marginBlock:4},children:[e.status&&i.jsx(Q,{icon:"done"===e.status?i.jsx(n,{size:13}):"failed"===e.status?i.jsx(c,{size:13}):"running"===e.status?i.jsx(d,{size:13}):"pending"===e.status?i.jsx(m,{size:13}):i.jsx(h,{size:13}),children:$(`tools.queue.${e.status}`)}),i.jsx(p,{"aria-pressed":Boolean(e.bookmarked),icon:i.jsx(g,{size:14}),onClick:()=>{x.patch(e.id,{bookmarked:!e.bookmarked}).then(()=>ne(0)).catch(()=>u.error($("tools.queue.error")))},size:"small",children:$("tools.queue.bookmarked")}),e.replayable&&i.jsx(p,{icon:i.jsx(y,{size:14}),onClick:()=>{x.requeue(e.id).then(j).catch(()=>u.error($("tools.queue.error")))},size:"small",children:$("tools.queue.requeue")}),e.images.length>0&&i.jsx(p,{onClick:()=>a.emit("open:lightbox",{index:B.indexOf(e),items:B}),size:"small",children:$("gallery.viewer")})]}),e.error&&i.jsx("p",{children:e.error})]},e.id))]},e.label)),Z&&i.jsx(L,{style:{margin:16}}),!Z&&B.length<M&&i.jsxs(p,{block:!0,onClick:()=>ne(B.length),children:[$("tools.history.loadMore")," (",B.length," / ",M,")"]})]}),ie&&2===he.length&&i.jsx(se,{entries:he,onClose:()=>re(!1)})]})});export{ae as default};
