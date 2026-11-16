import{r as e,A as t,bU as o,aZ as n,bV as r,z as s}from"./main-D14liIKI.js";const i={dark:new Map,light:new Map},a=new Set;let l,c,d=new Set,m=!0,f=0;function g(){c||f>=25||(c=setTimeout(()=>{c=void 0,f+=1;for(const e of a)e()},300))}function p(e){let t=e.trim().replace(/,+$/u,"").trim();if(!t||t.startsWith("<")||t.startsWith("__")||t.startsWith("#"))return"";for(;/^[([{].*[)\]}]$/.test(t);)t=t.slice(1,-1).trim();const o=t.match(/^(.*?):\s*-?\d+(?:\.\d+)?$/);return o&&o[1].trim()&&(t=o[1].trim()),t=t.replaceAll(/\\([()[\]{}])/g,"$1").replaceAll("_"," ").trim().toLowerCase(),t.startsWith("@")&&(t=t.slice(1).trim()),t}function u(e,t){const o=p(e);if(!o)return;return(t?i.dark:i.light).get(o)??void 0}function h(t,o){const[n,r]=e.useState(0);return e.useEffect(()=>{const e=()=>r(e=>e+1);return a.add(e),()=>{a.delete(e)}},[]),e.useEffect(()=>{const e=t.map(p).filter(Boolean);e.length>0&&function(e,t){var o;if(0===e.length)return;const n=null==(o=window.lobeTagComplete)?void 0:o.lookupTagColors;if(!n)return void g();const r=t?i.dark:i.light;let s=!1;for(const i of e)i&&!r.has(i)&&(d.add(i),s=!0);s&&(m=t,l||(l=setTimeout(()=>{l=void 0;const e=[...d],t=m;d=new Set,0!==e.length&&n(e,t).then(o=>{if(!o)return void g();const n=t?i.dark:i.light;let r=!1;for(const t of e){const e=o[t]??null;n.get(t)!==e&&(n.set(t,e),e&&(r=!0))}if(r)for(const e of a)e()}).catch(()=>{g()})},40)))}(e,o)},[t.join(""),o,n]),n}"undefined"!=typeof window&&window.addEventListener("lobe:tagcomplete-loaded",()=>{c&&(clearTimeout(c),c=void 0),f=0;for(const e of[i.dark,i.light])for(const[t,o]of e)null===o&&e.delete(t);for(const e of a)e()});const k=t(({css:e,token:t,cx:o,stylish:n,prefixCls:r})=>{const s=`${r}-highlighter`;return{container:e`
      pointer-events: none;

      position: absolute;
      z-index: 0;

      overflow: hidden;

      padding: calc(8px + var(--input-border-width));

      pre {
        font-family: ${t.fontFamilyCode} !important;
        font-size: var(--lobe-prompt-font-size, 14px) !important;
        line-height: 1.5 !important;
        word-wrap: break-word !important;
        white-space: pre-wrap !important;
        vertical-align: bottom !important;
      }
    `,loading:o(n.blur,e`
        position: absolute;
        z-index: 10;
        top: 0;
        right: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        height: 34px;
        padding: 0 8px;
        border-radius: ${t.borderRadius}px;

        font-family: ${t.fontFamilyCode};
        color: ${t.colorTextTertiary};
      `),shiki:o(`${s}-shiki`,e`
        margin: 0;

        .shiki {
          overflow-x: auto;
          padding: 0;
          background: none !important;

          code,
          code span {
            font-family: ${t.fontFamilyCode} !important;
          }
        }
      `)}}),b=[{match:"[,]",name:"comma"},{match:"AND",name:"and"},{match:"BREAK",name:"break"},{captures:{0:{name:"model-bracket"},1:{name:"model-type"},2:{name:"model-name"},3:{name:"number"}},match:"<([^:]+):([^:]+):([^>]+)>"},{match:"[<|>]",name:"model-bracket"},{match:"[(|)|\\[|\\]|{|}\\\\]",name:"bracket"},{match:":\\d*\\.?\\d+|:\\.\\d+",name:"number"},{match:"[:|]",name:"func"},{match:"__.*__",name:"wildcards"}].map(e=>({captures:e.captures?Object.fromEntries(Object.entries(e.captures).map(([e,t])=>[Number(e),t.name])):void 0,name:e.name,re:new RegExp(e.match,"dg")})),x={dark:void 0,light:void 0},w=e=>{var t;const o=e?"dark":"light",n=x[o];if(n)return n;const r=(e=>{const t=e?"dark":"light",o=e?"#e5e7eb":"#1f2937",n=e?"#c4b5fd":"#6d28d9";return{colors:{"editor.foreground":o},name:t,tokenColors:[{scope:"comma",settings:{foreground:o}},{scope:["and","break"],settings:{foreground:e?"#93c5fd":"#1d4ed8"}},{scope:"bracket",settings:{foreground:n}},{scope:"model-type",settings:{fontStyle:"italic",foreground:e?"#fdba74":"#9a3412"}},{scope:"model-name",settings:{foreground:e?"#fcd34d":"#92400e"}},{scope:"model-bracket",settings:{foreground:n}},{scope:"number",settings:{foreground:n}},{scope:"func",settings:{foreground:n}},{scope:"wildcards",settings:{foreground:e?"#fde68a":"#854d0e"}}],type:t}})(e),s={};for(const a of r.tokenColors||[])for(const e of[a.scope||[]].flat())s[e]=a.settings;const i={foreground:null==(t=r.colors)?void 0:t["editor.foreground"],lines:new Map,scopes:s};return x[o]=i,i},v=e=>w(e).foreground,y=(e,t)=>{const o=w(t),n=o.lines.get(e);if(void 0!==n)return n;const r=[];for(const[s,i]of(e=>{const t=[],o=new Map;let n=0;for(;n<e.length;){let r;for(const t of b){let s=o.get(t);(void 0===s||s&&s.index<n)&&(t.re.lastIndex=n,s=t.re.exec(e),o.set(t,s)),s&&s[0].length>0&&(!r||s.index<r.match.index)&&(r={match:s,rule:t})}if(!r){t.push([e.slice(n),void 0]);break}const{match:s,rule:i}=r;s.index>n&&t.push([e.slice(n,s.index),void 0]);const a=s.index,l=a+s[0].length;if(i.captures){const o=s.indices;let n=a;for(const[r,s]of Object.entries(i.captures)){const a=o[Number(r)];"0"!==r&&a&&(n<a[0]&&t.push([e.slice(n,a[0]),i.captures[0]]),t.push([e.slice(...a),s]),n=a[1])}n<l&&t.push([e.slice(n,l),i.captures[0]])}else t.push([s[0],i.name]);n=l}return t})(e)){const e=i?o.scopes[i]:void 0,t=`color:${(null==e?void 0:e.foreground)||o.foreground}`+("italic"===(null==e?void 0:e.fontStyle)?";font-style:italic":""),n=r.at(-1);n&&n.style===t&&n.scope===i?n.text+=s:r.push({scope:i,style:t,text:s})}return o.lines.size>=256&&o.lines.delete(o.lines.keys().next().value),o.lines.set(e,r),r},C=e.memo(({categoryColor:e,dark:t,flags:o,text:n})=>{const r=v(t);return y(n,t).map(({scope:t,style:n,text:i},a)=>{const[l,c]=n.split(";"),d=((e,t)=>!e||("model-type"===e||"model-name"===e||"model-bracket"===e?t.models:"bracket"===e||"number"===e||"func"===e?t.weights:"wildcards"===e?t.wildcards:"and"!==e&&"break"!==e||t.keywords))(t,o),m=d?l.slice(6):r,f=o.tagColors&&e&&m.toLowerCase()===r.toLowerCase()&&","!==i.trim()?e:m;return s.jsx("span",{style:{color:f,fontStyle:d&&c?"italic":void 0},children:i},a)})}),j=e=>e.split(new RegExp("(?<=,)")),$=e.memo(({dark:e,flags:t,line:o})=>s.jsx("span",{className:"line",children:j(o).map((o,n)=>s.jsx(C,{categoryColor:t.tagColors?u(o,e):void 0,dark:e,flags:t,text:o},n))})),M=e.memo(({children:t})=>{const{styles:i}=k(),{isDarkMode:a}=o(),l=n(e=>({keywords:e.setting.highlightKeywords??!0,models:e.setting.highlightModels??!0,tagColors:e.setting.highlightTagColors??!0,weights:e.setting.highlightWeights??!0,wildcards:e.setting.highlightWildcards??!0}),r),c=e.useMemo(()=>t.split(/\r\n|\r|\n/),[t]),d=h(e.useMemo(()=>l.tagColors?c.flatMap(j):[],[l.tagColors,c]),a);return s.jsx("div",{className:i.shiki,children:s.jsx("pre",{className:"shiki "+(a?"dark":"light"),style:{color:v(a)},children:s.jsx("code",{id:"lobe_highlighter",children:c.map((t,o)=>s.jsxs(e.Fragment,{children:[o>0&&"\n",s.jsx($,{colorVersion:d,dark:a,flags:l,line:t})]},o))})})})});export{M as S,k as u};
