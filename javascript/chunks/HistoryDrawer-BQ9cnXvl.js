import{r as e,u as t,a5 as s,J as o,q as a,z as i,S as r,a6 as l,T as n,a7 as c,a8 as d,a9 as m,aa as h,ab as p,a as x,ac as u,s as g,j,ad as y,ae as b,f,af as w,ag as k,ah as v,b as S,A as z,K as C,ai as $,aj as N,ak as q,al as E,am as B,an as T,ao as M,k as A,O as D,Q as R}from"./main-CoAB9ltG.js";import{u as F,Q as P}from"./QueuePanel-DoAKU0-A.js";import{l as I,c as _,p as L}from"./presets-D85jtrEZ.js";import{D as G,S as H,I as O}from"./index-BQnKWLY3.js";import{I as Q}from"./index-CKgoXHTU.js";import{E as W}from"./index-5SYwwDv2.js";import{C as Y}from"./index-B0Lr3Tcp.js";import{D as J}from"./index-CkR0fwXL.js";import"./index-Bobexnbb.js";import"./index-f_lodLO0.js";import"./index-CMpYqhD2.js";import"./SearchOutlined-Cy1A1lxm.js";import"./useBubbleLock-Bza87l9Z.js";const K=z(({css:e,token:t})=>({chips:e`
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
  `})),U=(e,t)=>{const s=new Date(e),o=new Date,a=e=>new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),i=Math.round((a(o)-a(s))/864e5);return 0===i?t("tools.history.today"):1===i?t("tools.history.yesterday"):s.toLocaleDateString(void 0,{day:"numeric",month:"long",weekday:"short",year:"numeric"})},V=e=>e.thumb?o.thumbUrl(e.thumb):e.url,X=[["Sampler",""],["Schedule type",""],["Steps","Steps"],["CFG scale","CFG"],["Size",""],["Seed","Seed"]],Z=e=>new Date(e.time).toLocaleString(),ee=e=>e.split(/[\n,]/).map(e=>e.trim()).filter(Boolean),te=e.memo(({a:e,b:t,classNames:s})=>{const o=ee(e),a=ee(t),r=new Set(o),l=new Set(a);return i.jsxs("span",{children:[a.map((e,t)=>i.jsxs("span",{children:[t>0&&", ",i.jsx("span",{className:r.has(e)?void 0:s.add,children:e})]},`b${t}`)),o.filter(e=>!l.has(e)).map((e,t)=>i.jsxs("span",{children:[(a.length>0||t>0)&&", ",i.jsx("span",{className:s.remove,children:e})]},`a${t}`))]})}),se=e.memo(({entries:e,onClose:s})=>{const{t:o}=t(),{styles:a}=K(),[r,n]=[...e].sort((e,t)=>e.time-t.time),c=C(r.infotext),d=C(n.infotext),m=new Map(c.parameters),h=new Map(d.parameters),p=[...new Set([...m.keys(),...h.keys()])];return i.jsxs(S,{centered:!0,footer:null,onCancel:s,open:!0,styles:{body:{maxHeight:"80dvh",overflowY:"auto"}},title:o("tools.history.compare"),width:860,children:[i.jsx(l,{gap:12,horizontal:!0,style:{marginBottom:12},children:[r,n].map((e,t)=>i.jsxs(l,{align:"center",gap:8,style:{flex:1,minWidth:0},children:[e.images[0]&&i.jsx("div",{style:{textAlign:"center",width:"100%"},children:i.jsx(O,{alt:C(e.infotext).prompt,preview:{src:e.images[0].url},src:e.images[0].url,style:{borderRadius:8,maxHeight:"34dvh",objectFit:"contain",width:"100%"}})}),i.jsxs(l,{gap:2,children:[i.jsx("b",{children:0===t?"A":"B"}),i.jsx("span",{className:a.time,children:Z(e)})]})]},e.id))}),i.jsx("div",{style:{maxHeight:"30dvh",overflow:"auto"},children:i.jsx("table",{className:a.table,children:i.jsxs("tbody",{children:[i.jsxs("tr",{className:c.prompt===d.prompt?void 0:a.diffRow,children:[i.jsx("th",{children:o("tools.history.prompt")}),i.jsx("td",{colSpan:2,children:i.jsx(te,{a:c.prompt,b:d.prompt,classNames:{add:a.diffAdd,remove:a.diffRemove}})})]}),i.jsxs("tr",{className:c.negative===d.negative?void 0:a.diffRow,children:[i.jsx("th",{children:o("tools.history.negative")}),i.jsx("td",{colSpan:2,children:i.jsx(te,{a:c.negative,b:d.negative,classNames:{add:a.diffAdd,remove:a.diffRemove}})})]}),i.jsxs("tr",{children:[i.jsx("th",{children:o("tools.history.parameter")}),i.jsx("th",{children:"A"}),i.jsx("th",{children:"B"})]}),p.map(e=>i.jsxs("tr",{className:m.get(e)===h.get(e)?void 0:a.diffRow,children:[i.jsx("th",{children:e}),i.jsx("td",{children:m.get(e)??"–"}),i.jsx("td",{children:h.get(e)??"–"})]},e))]})})})]})}),oe=e.memo(({entry:s,selected:o,selectionFull:a,onSelect:r,onDelete:c})=>{const{t:d}=t(),{styles:m}=K(),h=e.useMemo(()=>C(s.infotext),[s.infotext]),p=e.useMemo(()=>(e=>{const t=new Map(C(e.infotext).parameters);return X.flatMap(([e,s])=>{const o=t.get(e);return o?[s?`${s} ${o}`:o]:[]})})(s),[s.infotext]),u="img2img"===s.tab?"img2img":"txt2img",j=e.useMemo(()=>new Map(h.parameters).get("Seed"),[h]),y=s.images.slice(0,3);return i.jsxs(l,{className:m.entry,gap:8,children:[i.jsxs(l,{align:"center",gap:8,horizontal:!0,children:[i.jsx(Y,{"aria-label":`${d("tools.history.compare")}: ${Z(s)}`,checked:o,disabled:!o&&a,onChange:e=>r(s.id,e.target.checked)}),i.jsx("span",{className:m.time,children:new Date(s.time).toLocaleTimeString(void 0,{hour:"2-digit",minute:"2-digit"})}),i.jsx(n,{bordered:!1,style:{margin:0},children:s.tab}),s.images.length>1&&i.jsx("span",{className:m.time,children:d("tools.history.images",{count:s.images.length})})]}),i.jsxs(l,{gap:10,horizontal:!0,children:[y.length>0&&i.jsx(O.PreviewGroup,{items:s.images.map(e=>e.url),children:i.jsx(l,{gap:6,horizontal:!0,style:{flex:"none"},children:y.map((e,t)=>i.jsxs("div",{className:m.thumb,children:[i.jsx(O,{alt:h.prompt,fallback:V(e),preview:{src:e.url},src:V(e)}),t===y.length-1&&s.images.length>y.length&&i.jsxs("div",{className:m.more,style:{pointerEvents:"none"},children:["+",s.images.length-y.length]})]},t))})}),i.jsxs(l,{gap:6,style:{minWidth:0},children:[i.jsx("div",{className:m.prompt,title:h.prompt,children:h.prompt||"—"}),i.jsx("div",{className:m.chips,children:p.map(e=>i.jsx(n,{children:e},e))})]})]}),i.jsxs(l,{align:"center",gap:4,horizontal:!0,wrap:"wrap",children:[i.jsx(x,{onClick:async()=>{D(`tab_${u}`),await R(u,s.infotext),g.success(d("tools.history.applied"))},size:"small",type:"primary",children:d("tools.history.reuseAll")}),i.jsx(x,{onClick:()=>$(u,h.prompt,h.negative),size:"small",children:d("tools.history.reusePrompt")}),j&&i.jsx(x,{onClick:()=>N(u,j),size:"small",children:d("tools.history.reuseSeed")}),s.images.length>0&&i.jsx(J,{menu:{items:[{icon:i.jsx(q,{size:16}),key:"img2img",label:d("controls.sendToImg2img")},{icon:i.jsx(E,{size:16}),key:"inpaint",label:d("controls.sendToInpaint")},{icon:i.jsx(B,{size:16}),key:"extras",label:d("controls.sendToExtras")}],onClick:({key:e})=>{(async e=>{var t;const o=s.images[0];if(o)try{const s=await fetch(o.url);if(!s.ok)throw new Error("Image unavailable");const a=await s.blob(),i="function"==typeof gradioApp?gradioApp():document;D("extras"===e?"tab_extras":"tab_img2img"),"extras"!==e&&(null==(t=i.querySelectorAll("#mode_img2img > .tab-nav button")["inpaint"===e?2:0])||t.click());const r={extras:"extras_image",img2img:"img2img_image",inpaint:"img2maskimg"}[e];await new Promise(e=>{requestAnimationFrame(()=>e())});const l=i.querySelector(`#${r} input[type=file]`);if(!l)throw new Error("Image input unavailable");const n=new DataTransfer;n.items.add(new File([a],`generation.${a.type.split("/")[1]||"png"}`,{type:a.type})),l.files=n.files,l.dispatchEvent(new Event("change",{bubbles:!0}))}catch{g.error(d("tools.queue.error"))}})(e)}},children:i.jsx(x,{size:"small",children:d("tools.queue.send")})}),i.jsx("div",{style:{flex:1}}),i.jsx(f,{title:d("tools.history.copy"),children:i.jsx(w,{"aria-label":d("tools.history.copy"),icon:T,onClick:async()=>{await M(s.infotext),g.success(d("tools.history.copied"))},size:"small"})}),i.jsx(f,{title:d("tools.history.savePreset"),children:i.jsx(w,{"aria-label":d("tools.history.savePreset"),icon:A,onClick:async()=>{const e=await I();await _({name:d("tools.presets.defaultName",{n:e.length+1}),parameters:L(s.infotext),tab:u}),g.success(d("tools.presets.saved"))},size:"small"})}),i.jsx(f,{title:d("tools.history.delete"),children:i.jsx(w,{"aria-label":d("tools.history.delete"),icon:v,onClick:()=>c(s.id),size:"small"})})]})]})}),ae=e.memo(({open:z,onClose:C,initialSection:$})=>{const{t:N}=t(),{styles:q}=K(),E=S,{mobile:B}=F(),[T,M]=e.useState([]),[A,D]=e.useState(0),[R,I]=e.useState(""),[_,L]=e.useState(""),[O,Y]=e.useState(""),[J,V]=e.useState($||"history");e.useEffect(()=>{z&&V($||"history")},[z,$]);const X=s(),[Z,ee]=e.useState(!1),[te,ae]=e.useState([]),[ie,re]=e.useState(!1),le=e.useRef(0),ne=e.useCallback(async e=>{const t=++le.current;ee(!0);try{const s=await o.list({limit:40,offset:e,q:R,status:O,tab:_});if(t!==le.current)return;D(s.total),M(t=>0===e?s.items:[...t,...s.items])}catch{t===le.current&&0===e&&M([])}finally{t===le.current&&ee(!1)}},[R,O,_]);e.useEffect(()=>{if(!z)return;const e=setTimeout(()=>ne(0),R?250:0);return()=>clearTimeout(e)},[z,ne]),e.useEffect(()=>a.on("history:added",e=>{_&&e.tab!==_||z&&ne(0)}),[_,z,ne]),e.useEffect(()=>a.on("queue:changed",()=>{z&&ne(0)}),[z,ne]);const ce=e.useCallback(async e=>{await o.remove(e),M(t=>t.filter(t=>t.id!==e)),ae(t=>t.filter(t=>t!==e)),D(e=>Math.max(0,e-1))},[]),de=e.useCallback((e,t)=>{ae(s=>t?[...s,e].slice(-2):s.filter(t=>t!==e))},[]),me=e.useMemo(()=>{const e=[];for(const t of T){const s=U(t.time,N),o=e.at(-1);o&&o.label===s?o.entries.push(t):e.push({entries:[t],label:s})}return e},[T]),he=te.map(e=>T.find(t=>t.id===e)).filter(Boolean);return i.jsxs(G,{extra:i.jsxs(l,{gap:4,horizontal:!0,children:[i.jsx(f,{title:2===te.length?N("tools.history.compare"):N("tools.history.compareHint"),children:i.jsx(w,{"aria-label":N("tools.history.compare"),disabled:2!==he.length,icon:k,onClick:()=>re(!0)})}),i.jsx(f,{title:N("tools.history.clear"),children:i.jsx(w,{"aria-label":N("tools.history.clear"),icon:v,onClick:()=>E.confirm({centered:!0,okButtonProps:{danger:!0},onOk:async()=>{await o.clear(),ae([]),await ne(0)},title:N("tools.history.clearConfirm")})})})]}),onClose:C,open:z,placement:"right",styles:{body:{paddingBlock:0}},title:N(X?"tools.queue.drawer":"tools.history.title"),width:B?"100%":560,children:[X&&i.jsx(r,{block:!0,onChange:V,options:[{label:N("tools.history.title"),value:"history"},{label:`${N("tools.queue.title")} (${X.count})`,value:"queue"}],value:J}),X&&"queue"===J?i.jsx(P,{}):i.jsxs(l,{gap:10,style:{paddingBlock:12},children:[i.jsx(Q.Search,{allowClear:!0,onChange:e=>I(e.target.value),placeholder:N("tools.history.search"),value:R}),i.jsx(r,{block:!0,onChange:e=>L(String(e)),options:[{label:N("tools.history.all"),value:""},{label:"txt2img",value:"txt2img"},{label:"img2img",value:"img2img"}],value:_}),X&&i.jsx(r,{onChange:e=>Y(String(e)),options:[{label:N("tools.history.all"),value:""},...["bookmarked","done","failed","interrupted"].map(e=>({label:N(`tools.queue.${e}`),value:e}))],value:O}),0===T.length&&!Z&&i.jsx(W,{description:N("tools.history.empty"),image:W.PRESENTED_IMAGE_SIMPLE}),me.map(e=>i.jsxs(l,{gap:8,children:[i.jsx("div",{className:q.day,children:e.label}),e.entries.map(e=>i.jsxs("div",{className:"lobe-history-task",children:[i.jsx(oe,{entry:e,onDelete:ce,onSelect:de,selected:te.includes(e.id),selectionFull:te.length>=2},e.id),X&&i.jsxs(l,{gap:6,horizontal:!0,style:{flexWrap:"wrap",marginBlock:4},children:[e.status&&i.jsx(n,{icon:"done"===e.status?i.jsx(c,{size:13}):"failed"===e.status?i.jsx(d,{size:13}):"running"===e.status?i.jsx(m,{size:13}):"pending"===e.status?i.jsx(h,{size:13}):i.jsx(p,{size:13}),children:N(`tools.queue.${e.status}`)}),i.jsx(x,{"aria-pressed":Boolean(e.bookmarked),icon:i.jsx(j,{size:14}),onClick:()=>{u.patch(e.id,{bookmarked:!e.bookmarked}).then(()=>ne(0)).catch(()=>g.error(N("tools.queue.error")))},size:"small",children:N("tools.queue.bookmarked")}),e.replayable&&i.jsx(x,{icon:i.jsx(b,{size:14}),onClick:()=>{u.requeue(e.id).then(y).catch(()=>g.error(N("tools.queue.error")))},size:"small",children:N("tools.queue.requeue")}),e.images.length>0&&i.jsx(x,{onClick:()=>a.emit("open:lightbox",{index:T.indexOf(e),items:T}),size:"small",children:N("gallery.viewer")})]}),e.error&&i.jsx("p",{children:e.error})]},e.id))]},e.label)),Z&&i.jsx(H,{style:{margin:16}}),!Z&&T.length<A&&i.jsxs(x,{block:!0,onClick:()=>ne(T.length),children:[N("tools.history.loadMore")," (",T.length," / ",A,")"]})]}),ie&&2===he.length&&i.jsx(se,{entries:he,onClose:()=>re(!1)})]})});export{ae as default};
