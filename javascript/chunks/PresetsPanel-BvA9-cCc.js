import{r as e,u as s,o as a,p as t,s as r,x as o,a4 as l,a as n,aA as i,ad as d,aB as c,M as p,y as m}from"./main-vZhtr4Ub.js";import{l as h,r as u,c as x,a as b,u as g,m as j,d as k,b as v}from"./presets-Dbgk9Par.js";import{I as f}from"./index-Bx7y1q0R.js";import{C as y}from"./index-Wjjb-3io.js";import{E as w}from"./index-C29-GZD1.js";import{T as S}from"./index-BKrkBge9.js";import{D as C}from"./index-COZxVUpv.js";import"./SearchOutlined-Bq6WyL1O.js";import"./useBubbleLock-COGQ7bHC.js";import"./collapse-BaEznz2I.js";const z=m(({css:e,token:s})=>({card:e`
    padding: 10px 12px;
    background: ${s.colorFillQuaternary};
    border: 1px solid ${s.colorBorderSecondary};
    border-radius: ${s.borderRadius}px;
    transition: border-color 150ms ${s.motionEaseOut};

    &:hover {
      border-color: ${s.colorPrimaryBorder};
    }
  `,chips:e`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .ant-tag {
      margin: 0;
      font-size: 11px;
      line-height: 18px;
    }
  `,name:e`
    overflow: hidden;
    flex: 1;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  `})),E=e.memo(()=>{const{t:m}=s(),{styles:E}=z(),B=p,[P,N]=e.useState([]),[$,L]=e.useState(""),[D,I]=e.useState(!1),[M,O]=e.useState(!1),[A,F]=e.useState();e.useEffect(()=>(h(!0).then(e=>N([...e])),a.on("presets:changed",()=>h().then(e=>N([...e])))),[]);const R=e.useCallback(async()=>{const e=t(),s=u(e,{includeSeed:D});await x({batchCount:M?s.batchCount:void 0,batchSize:M?s.batchSize:void 0,name:$.trim()||m("tools.presets.defaultName",{n:P.length+1}),parameters:s.parameters,tab:e}),L(""),r.success(m("tools.presets.saved"))},[$,D,M,P.length]),T=e.useCallback(async e=>{await b(e,t())?r.success(m("tools.presets.applied")):r.error(m("setting.button.saveError"))},[]),_=e.useCallback(async e=>{const s=t(),a=u(s,{includeSeed:/(^|,\s*)Seed:/.test(e.parameters)});await g(e.id,{batchCount:void 0===e.batchCount?void 0:a.batchCount,batchSize:void 0===e.batchSize?void 0:a.batchSize,parameters:a.parameters,tab:s}),r.success(m("tools.presets.saved"))},[]);return o.jsxs(l,{gap:12,children:[o.jsxs(l,{gap:8,children:[o.jsxs(l,{gap:8,children:[o.jsx(f,{allowClear:!0,maxLength:60,onChange:e=>L(e.target.value),onPressEnter:R,placeholder:m("tools.presets.name"),value:$}),o.jsx(n,{block:!0,icon:o.jsx(i,{size:14}),onClick:R,type:"primary",children:m("tools.presets.save")})]}),o.jsxs(l,{gap:4,horizontal:!0,wrap:"wrap",children:[o.jsx(y,{checked:D,onChange:e=>I(e.target.checked),children:m("tools.presets.includeSeed")}),o.jsx(y,{checked:M,onChange:e=>O(e.target.checked),children:m("tools.presets.includeBatch")})]})]}),0===P.length?o.jsx(w,{description:m("tools.presets.empty"),image:w.PRESENTED_IMAGE_SIMPLE}):P.map((e,s)=>o.jsxs(l,{className:E.card,gap:8,children:[o.jsxs(l,{align:"center",gap:6,horizontal:!0,children:[A===e.id?o.jsx(f,{autoFocus:!0,defaultValue:e.name,maxLength:60,onBlur:s=>{const a=s.target.value.trim();F(void 0),a&&a!==e.name&&g(e.id,{name:a})},onPressEnter:e=>e.target.blur(),size:"small"}):o.jsx("span",{className:E.name,title:e.name,children:e.name}),o.jsx(S,{bordered:!1,style:{margin:0},children:e.tab}),o.jsx(C,{menu:{items:[{key:"rename",label:m("tools.presets.rename")},{key:"overwrite",label:m("tools.presets.overwrite")},{disabled:0===s,key:"up",label:m("tools.presets.moveUp")},{disabled:s===P.length-1,key:"down",label:m("tools.presets.moveDown")},{danger:!0,key:"delete",label:m("tools.presets.delete")}],onClick:({key:s})=>{"rename"===s&&F(e.id),"overwrite"===s&&_(e),"up"===s&&j(e.id,-1),"down"===s&&j(e.id,1),"delete"===s&&B.confirm({centered:!0,okButtonProps:{danger:!0},onOk:()=>k(e.id),title:m("tools.presets.deleteConfirm")})}},trigger:["click"],children:o.jsx(d,{"aria-label":e.name,icon:c,size:"small"})})]}),o.jsx("div",{className:E.chips,children:v(e).map(e=>o.jsx(S,{children:e},e))}),o.jsx(n,{block:!0,onClick:()=>T(e),size:"small",children:m("tools.presets.apply")})]},e.id))]})});export{E as default};
