import{aB as e,r as t,c0 as r,z as n,af as i,aT as s,A as o,c1 as a,a6 as l,as as c,az as p,u as h}from"./main-D14liIKI.js";import{C as u}from"./check-hUJkpOoC.js";import{S as g}from"./SyntaxHighlighter-DsyClqei.js";
/**
 * @license lucide-react v1.70.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d={name:"copy",size:24,node:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]},f=e(d),m=r({block:"copy-button",elements:[]}),x=t.memo(({active:e,className:r,content:o,size:a,icon:l,glass:c=!0,onClick:p,...h})=>{const{copied:g,setCopied:d}=(()=>{const[e,r]=t.useState(!1);t.useEffect(()=>{if(!e)return;const t=setTimeout(()=>{r(!1)},2e3);return()=>{clearTimeout(t)}},[e]);const n=t.useCallback(()=>r(!0),[]);return t.useMemo(()=>({copied:e,setCopied:n}),[e])})(),x=l||f;return n.jsx(i,{glass:c,size:a,title:"Copy",...h,active:e||g,className:s(m(),r),icon:g?u:x,onClick:async e=>{const t="function"==typeof o?o():o;await(async e=>{try{await navigator.clipboard.writeText(e)}catch{const t=document.createElement("textarea");t.value=e,document.body.append(t),t.focus(),t.select(),document.execCommand("copy"),t.remove()}})(t),d(),null==p||p(e)}})});x.displayName="CopyButton";const y={attributes:!0,characterData:!0,childList:!0,subtree:!0},b=(e,{subSelector:r,valueProp:n="innerHTML"}={})=>{const[i,s]=t.useState("");return t.useEffect(()=>{const t=()=>("function"==typeof gradioApp?gradioApp():null)||document;let i=null,o=null;const a=e=>{const t=r?e.querySelector(r):e;t&&s(String((null==t?void 0:t[n])||""))},l=e=>{a(e),i=new MutationObserver(()=>{a(e)}),i.observe(e,y)},c=t(),p=c.querySelector(e);return p?l(p):(o=new MutationObserver(()=>{const r=t().querySelector(e);r&&(o&&(o.disconnect(),o=null),l(r))}),o.observe(c,{childList:!0,subtree:!0})),()=>{i&&i.disconnect(),o&&o.disconnect()}},[e,r,n]),String(i)},S=o(({css:e,token:t,isDarkMode:r})=>{const n=r?"dark":"light",i=r?a.lime[n][9]:a.green[n][10];return{configHeader:e`
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      width: 100%;
      padding: 6px 10px;
      cursor: pointer;
      user-select: none;
      font-family: ${t.fontFamilyCode};
      font-size: 12px;
      color: ${t.colorTextSecondary};
      background: ${t.colorFillTertiary};
      border: 0;
      border-radius: ${t.borderRadius}px;
      text-align: left;

      &:hover {
        color: ${t.colorText};
        background: ${t.colorFillSecondary};
      }
    `,configRow:e`
      padding: 1px 0;
      line-height: 1.35;
      border-bottom: 1px solid ${t.colorSplit};

      &:last-child {
        border-bottom: none;
      }
    `,configSummary:e`
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: ${t.colorText};
    `,configTitle:e`
      color: ${t.colorTextSecondary};
      flex-shrink: 0;
    `,configValue:e`
      color: ${t.colorInfoText};
      text-align: right;
      word-break: break-word;
    `,container:e`
      padding: 8px 10px 8px 12px;

      font-family: ${t.fontFamilyCode};
      font-size: 12px;

      background: ${t.colorFillTertiary};
      border-radius: ${t.borderRadius}px;
    `,highlight:e`
      pre {
        font-family: ${t.fontFamilyCode} !important;
        font-size: 13px !important;
        line-height: 1.5 !important;
        word-wrap: break-word !important;
        white-space: pre-wrap !important;
        vertical-align: bottom !important;
      }
    `,negative:e`
      span[style='color:${i.toUpperCase()}'] {
        color: ${t.colorErrorTextHover} !important;
      }
    `}}),v=o(({token:e,css:t,cx:r,prefixCls:n},i)=>{const s=`${n}-highlighter`,o=`${s}-hover-btn`,a=`${s}-hover-lang`,l=t`
      background-color: ${"block"===i?e.colorFillTertiary:"transparent"};
      border: 1px solid ${"block"===i?"transparent":e.colorBorder};

      &:hover {
        background-color: ${"block"===i?e.colorFillTertiary:e.colorFillQuaternary};
      }
    `;return{container:r(s,"pure"!==i&&l,t`
          position: relative;
          overflow: auto;
          border-radius: ${e.borderRadius}px;
          transition: background-color 100ms ${e.motionEaseOut};

          &:hover {
            .${o} {
              opacity: 1;
            }

            .${a} {
              opacity: 1;
            }
          }

          .prism-code {
            background: none !important;
          }

          pre {
            margin: 0 !important;
            padding: ${"pure"===i?0:"16px 24px"} !important;
            background: none !important;
          }

          code {
            background: transparent !important;
          }
        `),header:t`
        padding: 4px 8px;
        background: ${e.colorFillQuaternary};
      `,select:t`
        .${n}-select-selection-item {
          min-width: 100px;
          padding-inline-end: 0 !important;
          color: ${e.colorTextDescription};
          text-align: center;
        }
      `}}),k=t.memo(({children:e,title:r="Prompt",className:s,style:o,showCopy:a=!0,...h})=>{const[u,d]=t.useState(!0),{styles:f,cx:m}=v("block"),y=m(f.container,s);return n.jsxs("div",{className:y,"data-code-type":"highlighter",style:o,...h,children:[n.jsxs(l,{align:"center",className:f.header,horizontal:!0,justify:"space-between",children:[n.jsx(i,{icon:u?c:p,onClick:()=>d(!u),size:{blockSize:24,size:14,strokeWidth:3}}),n.jsx("span",{style:{fontSize:13,fontWeight:500},children:r}),a?n.jsx(x,{content:e,size:{blockSize:24,size:14,strokeWidth:1.75}}):n.jsx("div",{})]}),n.jsx("div",{style:u?{}:{height:0,overflow:"hidden"},children:n.jsx(g,{children:e})})]})});let T=function(e){return e.CR="\r",e.CRLF="\r\n",e.LF="\n",e}({});const A=/\r\n|\r(?!\n)|\n/g;var N,w,E;(E=N||(N={})).INCLUDE_SEPARATOR_NONE="NONE",E.INCLUDE_SEPARATOR_SEPARATELY="SEPARATELY",E.INCLUDE_SEPARATOR_LEFT="LEFT",E.INCLUDE_SEPARATOR_RIGHT="RIGHT",E.INCLUDE_SEPARATOR_ONLY="ONLY",function(e){e[e.ACTION_CLOSE=1]="ACTION_CLOSE",e[e.ACTION_OPEN=2]="ACTION_OPEN",e[e.ACTION_ADD_FRAGMENT=3]="ACTION_ADD_FRAGMENT",e[e.ACTION_NULL=4]="ACTION_NULL"}(w||(w={}));const j=e=>{let t,r;return function(...n){return r||(t=e(...n),r=!0),t}},C=e=>{if(!e)return!0;if(Array.isArray(e)){if(0===e.length)return!0}else if("object"==typeof e&&0===Object.keys(e).length)return!0;return!1},$=e=>e[0];function O(e){const t=[e].flat().filter(Boolean);return!C(t)&&{values:new Set(t),max:Math.max(...t),count:0,hasIndex(){return-1/0===this.max||this.values.has(this.count++)},isOverMax(){return-1/0!==this.max&&this.count>this.max}}}class R{constructor(e,t){this.string=e,this.searchSettings=t,this.prepareSearch()}prepareSearch(){for(const e of[this.searchSettings.separatorSearch,this.searchSettings.bracketsSearch])e.lastIndex=0;Object.assign(this,{brackets:[],pipe:[],currentMentions:[],position:0,isDone:!1,freeArea:{start:0,end:void 0},lastSeparator:void 0,searchString:this.searchSettings.ignoreCase&&!this.searchSettings.separatorSearch.ignoreCase?this.string.toUpperCase():this.string,indexes:O(this.searchSettings.indexes)})}get pipeIsEmpty(){return C(this.pipe)}getMentions(e,t){const r=[],n=[];for(const i of this.currentMentions)i.index>=e&&i.index<t?r.push(i.mention):n.push(i);return[r.length&&r,n]}trimResultText(e){return this.searchSettings.trimResult?e.trim():e}trimSeparatorText(e){return this.searchSettings.trimSeparators?e.trim():e}checkSeparator(e){const{string:t}=this,{check:r,includePositions:n,mentions:i}=this.searchSettings;let{0:s="",index:o=t.length,searchWithinData:a}=null!=e?e:{};const l=s.length,c=a?a.openPosition:this.position;let p=t.substring(c,o);s||(this.isDone=!0),p=this.trimResultText(p),s=this.trimSeparatorText(s);let h,u=a?[a.open,a.close]:s;if(n&&(p={text:p,position:c},u={text:u,position:o,isSeparator:!0}),i){p="string"==typeof p?{text:p}:p;const[e,t]=this.getMentions(c,o);e&&(p.mentions=e,h=t)}if(r&&s){const e=isNaN(this.tempPosition)?c:this.tempPosition;this.tempPosition=o+s.length;const n=this;if(!r({getString:j(()=>n.trimResultText(t.substring(e,o))),getTextAfter:j(()=>t.substring(o+s.length)),getMentions:j(()=>n.getMentions(e,o)[0]),getSeparator:j(()=>s),get string(){return this.getString()},get textAfter(){return this.getTextAfter()},get mentions(){return this.getMentions()},get separator(){return this.getSeparator()}}))return[];delete this.tempPosition}return h&&(this.currentMentions=h),this.position=o+l,[p,u,!0]}pushToPipe(e){if(this.indexes){if(!this.indexes.hasIndex())return;this.indexes.isOverMax()&&(this.isDone=!0)}this.pipe.push(e)}addToPipe(e){let[t,r,n]=this.checkSeparator(e);if(!n)return!1;switch(this.searchSettings.includeSeparatorMode){case"SEPARATELY":this.pushToPipe(t),r&&this.pushToPipe(r);break;case"LEFT":this.pushToPipe([t,r]);break;case"RIGHT":!("object"==typeof t?t.text:t)&&!this.lastSeparator||this.pushToPipe([this.lastSeparator,t]),this.lastSeparator=r;break;case"ONLY":r&&this.pushToPipe(r);break;default:this.pushToPipe(t)}return!this.pipeIsEmpty}findBrackets(){const{searchString:e,brackets:t,freeArea:r,searchSettings:n}=this,{bracketsSearch:i,separatorSearch:s,searchWithin:o}=n,a=o?()=>this.pipeIsEmpty:()=>("number"!=typeof r.start||r.start!==r.end)&&!r.end;for(;a();){var l;const a=i.exec(e);if(!a){if(o||isNaN(r.start))return!1;r.end=e.length-1;continue}const p=a[0],{close:h,ignoreMode:u,searchLevels:g}=(c=t)[c.length-1]||{};let d;switch((p===h?1:u&&4)||(d=n.bracketsMap[p])&&2||(null===(l=n.mentions)||void 0===l?void 0:l[p])&&3){case 1:const e=t.pop();o?(!0===g||g.includes(t.length+1))&&this.addToPipe(Object.assign(a,{searchWithinData:e})):C(t)&&(r.start=a.index,s&&s.lastIndex<r.start&&(s.lastIndex=r.start));break;case 2:t.push({...d,openPosition:a.index+p.length}),1!==t.length||o||(r.end=a.index);break;case 3:this.currentMentions.push({mention:n.mentions[p],index:a.index})}}var c;return!0}findSeparator(e){const{searchString:t,freeArea:r}=this,{separatorSearch:n}=this.searchSettings;let i;for(;!i;){if(e=e||n.exec(t))if(e.index<=r.end){const t=e.index>=r.start&&this.addToPipe(e);if(e=null,!t)continue}else r.start=r.end=void 0;else this.addToPipe();i=!0}return e}getNext(){let e;for(;this.pipeIsEmpty&&!this.isDone;)this.findBrackets()?this.searchSettings.searchWithin||(e=this.findSeparator(e)):this.isDone=!0;return this.pipeIsEmpty?null:this.pipe.shift()}getAll(){return[...this]}getRest(){const e=[];let t;for(;null!==(t=this.getNext());)e.push(t);return e}*[Symbol.iterator](){this.prepareSearch();const e=this;let t;do{t=e.getNext(),null!==t&&(yield t)}while(null!==t)}}function I(e,t){const r=this.merge(t);let n=new R(e,r);return"number"==typeof r.indexes?n.getNext():r.returnIterator?n:n.getAll()}function P(e){const t=I.bind(e);return Object.assign(t,{getOne(e,r,n={}){if(isNaN(r))throw new TypeError("second parameter of `getOne` function should be index");return t(e,{...n,indexes:r})},getFirst:(e,r={})=>t(e,{...r,indexes:0}),getIndexes(e,r,n={}){if(!Array.isArray(r))throw new TypeError("second parameter of `getOne` function should be array of indexes");return t(e,{...n,indexes:r})},getIterator:(e,r={})=>t(e,{...r,returnIterator:!0})})}let M;function _(e,t){const r=function(e,t){return{brackets:[],mentions:[],ignoreInsideQuotes:!0,includeSeparatorMode:"NONE",ignoreCase:!0,trimResult:!0,trimSeparators:!1,defaultBrackets:[["(",")"],["[","]"],["{","}"]],...t,separators:e,init(){return function(e){if(Array.isArray(e.mentions)||"string"==typeof e.mentions){const t=[e.mentions].flat().filter(Boolean).reduce((t,r)=>(t[e.ignoreCase?r.toUpperCase():r]=r,t),{});e.mentions=!C(t)&&t}return e.createBracketsMap().createBracketsSearch().createSeparatorsSearch()}(this)},merge(e){return t=this,(r=e)?(r={...t,...r},["brackets","mentions"].some(e=>e in r)&&r.init(),r):t;var t,r},arrayToPattern:e=>{return t=e,null!==(r=M)&&void 0!==r||(M=new Set(".{}[]^()+*?\\/$|".split(""))),t.map(e=>e instanceof RegExp?e.source:e.split("").map(e=>M.has(e)?"\\"+e:e).join("")).join("|");var t,r},createRegExp:e=>RegExp(e,"g"),createBracketsMap(){return function(e){let t=e.brackets=(r=e.brackets,n=e.defaultBrackets,!0===r?r=n.slice():"object"!=typeof r||Array.isArray(r)?"string"==typeof r&&(r=r.split(",").map(e=>{let t=e.trim().split(" ");if(2!==t.length){if(2!==$(t).length)throw new TypeError("open and close parts of brackets should be separated by space symbol");t=$(t).split("")}return t})):r=Object.entries(r),null!==(i=r)&&void 0!==i?i:[]);var r,n,i;return t=function(e,t){return t.ignoreInsideQuotes&&e.unshift(["'",,,!0],['"',,,!0]),e}(t,e),e.bracketsMap=function(e,t){return e.reduce((e,[r,n,...i])=>{1!==i.length||t||i.unshift(void 0);let[s=t&&1,o]=i;return"number"==typeof s&&(s=[s]),e[r]={open:r,ignoreMode:o,searchLevels:s,close:n||r},e},{})}(t,e.searchWithin),e}(this)},createBracketsSearch(){return function(e){const t=Object.entries(e.bracketsMap).flatMap(([,{close:e,open:t}])=>e!==t?[t,e]:t).concat(Object.keys(e.mentions||{})).filter(Boolean),r=e.arrayToPattern(t);return e.bracketsSearch=e.createRegExp(r),e}(this)},createSeparatorsSearch(){return function(e){const{separators:t}=e;if("string"==typeof t||Array.isArray(t)){const r=e.arrayToPattern([t].flat().filter(Boolean));e.separatorSearch=e.createRegExp(r)}else t?(e.separatorSearch=t,e.ignoreCase=t.ignoreCase):e.separatorSearch=/empty/;return e}(this)}}.init()}(e,t);return{splitSettings:r,splitFn:P(r)}}function L(...e){let[t,r,n]=function(e){if(null==e||!e.length)throw new RangeError("empty arguments");if(3===e.length)return e;if(1===e.length){const t=$(e);"string"==typeof t?e.push(",",{}):Array.isArray(t)?(e.unshift(null),e.push({})):"object"==typeof t&&e.unshift(null,",")}else if(2===e.length)"string"==typeof e[0]&&e[1]instanceof RegExp||"string"==typeof e[1]||Array.isArray(e[1])?e.push({}):e.unshift(null);else if(e.length>3)throw new RangeError("Too many arguments passed to splitSmartly function!!!");return e}(e);const{splitFn:i}=_(r,n);return null!==t?i(t):i}function z(e){return function(e,t=T.LF){return e.replace(A,t)}(e).replace(/[ \t\xa0]+(?=\n)/g,"").replace(/\n{3,}/g,"\n\n").replace(/^[\r\n]+|[\s\r\n]+$/g,"")}function F(e){return e.startsWith("Steps: ")}const D=/\r?\n/,B=/(?:\x00\x00\x00|\u200b\u200b\u200b)\r?\n/;function W(e){return B.test(e)}function U(e){const[,t,r]=e.match(/^([^:]+)\s*:\s*(.*)$/);return[t,r]}function H(e){const t=W(e=z(e));let r=function(e){return e.split(W(e)?B:D)}(e),n="",i="",s="";const o=r.slice();if(r.length){if(t){var a,l;const e=r.length;if(e>3)throw new TypeError;let t=r.pop();if(2===e){let e=t.split("\n");e.length>1&&F(e[e.length-1])&&(t=e.pop(),r.push(e.join("\n"))),console.dir(t.split("\n"))}if(F(t)&&(s=t,t=void 0),null!==(a=t)&&void 0!==a||(t=r.pop()),t.startsWith("Negative prompt: ")&&(i=t.slice(17),t=void 0),null!==(l=t)&&void 0!==l||(t=r.pop()),n=t,r.length)throw new TypeError}else{let e=r[r.length-1];if(e.startsWith("Steps: ")&&(s=r.pop(),e=void 0),r.length){let t=-1;for(let n=r.length-1;n>=0;n--)if(e=r[n],e.startsWith("Negative prompt: ")){t=n,r[n]=e.slice(17);break}-1!==t&&(i=r.splice(t).join("\n")),n=r.join("\n")}}n=n.replace(/\x00\x00\x00/g,""),i=i.replace(/\x00\x00\x00/g,"")}return{prompt:n,negative_prompt:i,infoline:s,infoline_extra:[],lines_raw:o}}function G(e,t){const r=null==t?void 0:t.cast_to_snake;let[n,i]=e;const s=parseFloat(i),o=/^0\d/.test(i)||isNaN(s)||i-s!=0;return r&&(n=function(e){return e.toLowerCase().replace(/ /g,"_")}(n)),[n,o?i:s]}var Y,Q;function*q(e,t){if(null!=t&&t.isIncludePrompts){const{prompt:t,negative_prompt:r,infoline:n}=H(e);yield["prompt",t],yield["negative_prompt",r],e=n}yield*function*(e,t){for(const r of e)yield G(r,t)}(function*(e){const t=L(e=z(e),[","],{brackets:!0,trimSeparators:!0});for(let r of t)if(null!=r&&r.length){const e=U(r);yield e}}(e),t)}(Q=Y||(Y={})).prompt="prompt",Q.negative_prompt="negative_prompt";const V=e=>L(e.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll(/^[\s\u0000,。，]+$/gm,"").replaceAll(/\n{2,}/g,"\n").replaceAll("\n","<br>"),[",","，","。"],{brackets:!0,trimSeparators:!0}).filter(e=>e.length).join(", ").replaceAll("<br>","\n").replaceAll(/^\s+|\s+$/gm,""),J=e=>{if(!e||"undefined"===e||!e.trim())return;const t=e.replaceAll(/<br\s*\/?>/gi,"\n").replaceAll("&lt;","<").replaceAll("&gt;",">");let{prompt:r,negative_prompt:n,...i}=function(e,t){return Object.fromEntries([...q(e,t)])}(t,{isIncludePrompts:!0});return r=(r||"").trim().replaceAll(/\s+$/g,""),n=(n||"").trim().replaceAll(/\s+$/g,""),r=r?V(r):"",n=n?V(n):"",{config:i,negative:n,positive:r}},K=["Steps","Sampler","CFG scale","Size","Model"],X=t.memo(({value:e,className:r,style:i,defaultExpanded:s=!1,showCopy:o=!0,showConfig:a=!0,showNegative:p=!0})=>{const{styles:u,cx:g}=S(),{t:d}=h(),[f,m]=t.useState(s),y=t.useMemo(()=>J(e),[e]);if(!e||"undefined"===e||!y)return null;const b=(null==y?void 0:y.config)?Object.entries(y.config):[],v=K.filter(e=>(null==y?void 0:y.config)&&e in y.config).map(e=>`${e}: ${y.config[e]}`).join(" · ");return n.jsxs(l,{className:r,gap:4,style:i,children:[(null==y?void 0:y.positive)&&n.jsx(k,{className:u.highlight,showCopy:o,title:d("imageInfo.positive"),children:y.positive}),p&&(null==y?void 0:y.negative)&&n.jsx(k,{className:g(u.highlight,u.negative),showCopy:o,title:d("imageInfo.negative"),children:y.negative}),a&&b.length>0&&n.jsxs(l,{gap:4,children:[n.jsxs("button",{"aria-expanded":f,className:u.configHeader,onClick:()=>m(e=>!e),type:"button",children:[n.jsx("span",{className:u.configSummary,children:v||`${b.length} params`}),n.jsx("span",{style:{flexShrink:0,opacity:.75},children:f?`− (${b.length})`:`+ (${b.length})`}),n.jsx(c,{size:14,style:{flexShrink:0,transform:f?"rotate(180deg)":"rotate(0deg)",transition:"transform 150ms ease"}})]}),f&&n.jsx(l,{className:u.container,style:o?{}:{paddingRight:12},children:b.map(([e,t])=>n.jsxs(l,{className:u.configRow,gap:8,horizontal:!0,justify:"space-between",children:[n.jsxs(l,{align:"center",className:u.configTitle,horizontal:!0,children:[e,":"]}),n.jsxs(l,{align:"center",className:u.configValue,gap:4,horizontal:!0,children:[t,o&&n.jsx(x,{content:t,size:"small"})]})]},e))})]})]})});export{X as I,b as u};
