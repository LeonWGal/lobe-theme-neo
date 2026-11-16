import{r as e,u as s,q as a,w as t,s as r,z as o,a6 as l,a as n,aC as i,T as c,af as d,aD as p,b as m,A as h}from"./main-D14liIKI.js";import{l as u,r as b,c as x,a as g,u as j,m as k,d as v,b as f}from"./presets-C-PawtqX.js";import{I as w}from"./index-xyjO_lk4.js";import{C as y}from"./index-D24CL7fS.js";import{E as C}from"./index-CSt6xw1W.js";import{D as S}from"./index-C9pQeOXs.js";import"./SearchOutlined-7hJeIIdp.js";import"./useBubbleLock-twApDnPT.js";const z=h(({css:e,token:s})=>({card:e`
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
  `})),E=e.memo(()=>{const{t:h}=s(),{styles:E}=z(),B=m,[P,N]=e.useState([]),[$,D]=e.useState(""),[L,I]=e.useState(!1),[O,A]=e.useState(!1),[F,M]=e.useState();e.useEffect(()=>(u(!0).then(e=>N([...e])),a.on("presets:changed",()=>u().then(e=>N([...e])))),[]);const R=e.useCallback(async()=>{const e=t(),s=b(e,{includeSeed:L});await x({batchCount:O?s.batchCount:void 0,batchSize:O?s.batchSize:void 0,name:$.trim()||h("tools.presets.defaultName",{n:P.length+1}),parameters:s.parameters,tab:e}),D(""),r.success(h("tools.presets.saved"))},[$,L,O,P.length]),T=e.useCallback(async e=>{await g(e,t())?r.success(h("tools.presets.applied")):r.error(h("setting.button.saveError"))},[]),_=e.useCallback(async e=>{const s=t(),a=b(s,{includeSeed:/(^|,\s*)Seed:/.test(e.parameters)});await j(e.id,{batchCount:void 0===e.batchCount?void 0:a.batchCount,batchSize:void 0===e.batchSize?void 0:a.batchSize,parameters:a.parameters,tab:s}),r.success(h("tools.presets.saved"))},[]);return o.jsxs(l,{gap:12,children:[o.jsxs(l,{gap:8,children:[o.jsxs(l,{gap:8,children:[o.jsx(w,{allowClear:!0,maxLength:60,onChange:e=>D(e.target.value),onPressEnter:R,placeholder:h("tools.presets.name"),value:$}),o.jsx(n,{block:!0,icon:o.jsx(i,{size:14}),onClick:R,type:"primary",children:h("tools.presets.save")})]}),o.jsxs(l,{gap:4,horizontal:!0,wrap:"wrap",children:[o.jsx(y,{checked:L,onChange:e=>I(e.target.checked),children:h("tools.presets.includeSeed")}),o.jsx(y,{checked:O,onChange:e=>A(e.target.checked),children:h("tools.presets.includeBatch")})]})]}),0===P.length?o.jsx(C,{description:h("tools.presets.empty"),image:C.PRESENTED_IMAGE_SIMPLE}):P.map((e,s)=>o.jsxs(l,{className:E.card,gap:8,children:[o.jsxs(l,{align:"center",gap:6,horizontal:!0,children:[F===e.id?o.jsx(w,{autoFocus:!0,defaultValue:e.name,maxLength:60,onBlur:s=>{const a=s.target.value.trim();M(void 0),a&&a!==e.name&&j(e.id,{name:a})},onPressEnter:e=>e.target.blur(),size:"small"}):o.jsx("span",{className:E.name,title:e.name,children:e.name}),o.jsx(c,{bordered:!1,style:{margin:0},children:e.tab}),o.jsx(S,{menu:{items:[{key:"rename",label:h("tools.presets.rename")},{key:"overwrite",label:h("tools.presets.overwrite")},{disabled:0===s,key:"up",label:h("tools.presets.moveUp")},{disabled:s===P.length-1,key:"down",label:h("tools.presets.moveDown")},{danger:!0,key:"delete",label:h("tools.presets.delete")}],onClick:({key:s})=>{"rename"===s&&M(e.id),"overwrite"===s&&_(e),"up"===s&&k(e.id,-1),"down"===s&&k(e.id,1),"delete"===s&&B.confirm({centered:!0,okButtonProps:{danger:!0},onOk:()=>v(e.id),title:h("tools.presets.deleteConfirm")})}},trigger:["click"],children:o.jsx(d,{"aria-label":e.name,icon:p,size:"small"})})]}),o.jsx("div",{className:E.chips,children:f(e).map(e=>o.jsx(c,{children:e},e))}),o.jsx(n,{block:!0,onClick:()=>T(e),size:"small",children:h("tools.presets.apply")})]},e.id))]})});export{E as default};
