"use strict";exports.id=2347,exports.ids=[2347],exports.modules={32454:(e,t,r)=>{var o=Object.defineProperty,s=Object.getOwnPropertyDescriptor,a=Object.getOwnPropertyNames,i=Object.prototype.hasOwnProperty,n=(e,t,r)=>new Promise((o,s)=>{var a=e=>{try{n(r.next(e))}catch(e){s(e)}},i=e=>{try{n(r.throw(e))}catch(e){s(e)}},n=e=>e.done?o(e.value):Promise.resolve(e.value).then(a,i);n((r=r.apply(e,t)).next())}),l={};((e,t)=>{for(var r in t)o(e,r,{get:t[r],enumerable:!0})})(l,{SessionContextProvider:()=>p,useSession:()=>y,useSessionContext:()=>f,useSupabaseClient:()=>m,useUser:()=>g}),e.exports=((e,t,r,n)=>{if(t&&"object"==typeof t||"function"==typeof t)for(let l of a(t))i.call(e,l)||l===r||o(e,l,{get:()=>t[l],enumerable:!(n=s(t,l))||n.enumerable});return e})(o({},"__esModule",{value:!0}),l);var d=r(43210),u=r(60687),c=(0,d.createContext)({isLoading:!0,session:null,error:null,supabaseClient:{}}),p=({supabaseClient:e,initialSession:t=null,children:r})=>{let[o,s]=(0,d.useState)(t),[a,i]=(0,d.useState)(!t),[l,p]=(0,d.useState)();(0,d.useEffect)(()=>{!o&&t&&s(t)},[o,t]),(0,d.useEffect)(()=>{let t=!0;return!function(){n(this,null,function*(){let{data:{session:r},error:o}=yield e.auth.getSession();if(t){if(o){p(o),i(!1);return}s(r),i(!1)}})}(),()=>{t=!1}},[]),(0,d.useEffect)(()=>{let{data:{subscription:t}}=e.auth.onAuthStateChange((e,t)=>{t&&("SIGNED_IN"===e||"TOKEN_REFRESHED"===e||"USER_UPDATED"===e)&&s(t),"SIGNED_OUT"===e&&s(null)});return()=>{t.unsubscribe()}},[]);let f=(0,d.useMemo)(()=>a?{isLoading:!0,session:null,error:null,supabaseClient:e}:l?{isLoading:!1,session:null,error:l,supabaseClient:e}:{isLoading:!1,session:o,error:null,supabaseClient:e},[a,o,l]);return(0,u.jsx)(c.Provider,{value:f,children:r})},f=()=>{let e=(0,d.useContext)(c);if(void 0===e)throw Error("useSessionContext must be used within a SessionContextProvider.");return e};function m(){let e=(0,d.useContext)(c);if(void 0===e)throw Error("useSupabaseClient must be used within a SessionContextProvider.");return e.supabaseClient}var y=()=>{let e=(0,d.useContext)(c);if(void 0===e)throw Error("useSession must be used within a SessionContextProvider.");return e.session},g=()=>{var e,t;let r=(0,d.useContext)(c);if(void 0===r)throw Error("useUser must be used within a SessionContextProvider.");return null!=(t=null==(e=r.session)?void 0:e.user)?t:null}},37590:(e,t,r)=>{r.d(t,{l$:()=>ed,oR:()=>I});var o,s=r(43210);let a={data:""},i=e=>"object"==typeof window?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||a,n=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,l=/\/\*[^]*?\*\/|  +/g,d=/\n+/g,u=(e,t)=>{let r="",o="",s="";for(let a in e){let i=e[a];"@"==a[0]?"i"==a[1]?r=a+" "+i+";":o+="f"==a[1]?u(i,a):a+"{"+u(i,"k"==a[1]?"":t)+"}":"object"==typeof i?o+=u(i,t?t.replace(/([^,])+/g,e=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):a):null!=i&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=u.p?u.p(a,i):a+":"+i+";")}return r+(t&&s?t+"{"+s+"}":s)+o},c={},p=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+p(e[r]);return t}return e},f=(e,t,r,o,s)=>{let a=p(e),i=c[a]||(c[a]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(a));if(!c[i]){let t=a!==e?e:(e=>{let t,r,o=[{}];for(;t=n.exec(e.replace(l,""));)t[4]?o.shift():t[3]?(r=t[3].replace(d," ").trim(),o.unshift(o[0][r]=o[0][r]||{})):o[0][t[1]]=t[2].replace(d," ").trim();return o[0]})(e);c[i]=u(s?{["@keyframes "+i]:t}:t,r?"":"."+i)}let f=r&&c.g?c.g:null;return r&&(c.g=c[i]),((e,t,r,o)=>{o?t.data=t.data.replace(o,e):-1===t.data.indexOf(e)&&(t.data=r?e+t.data:t.data+e)})(c[i],t,o,f),i},m=(e,t,r)=>e.reduce((e,o,s)=>{let a=t[s];if(a&&a.call){let e=a(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;a=t?"."+t:e&&"object"==typeof e?e.props?"":u(e,""):!1===e?"":e}return e+o+(null==a?"":a)},"");function y(e){let t=this||{},r=e.call?e(t.p):e;return f(r.unshift?r.raw?m(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,i(t.target),t.g,t.o,t.k)}y.bind({g:1});let g,h,b,v=y.bind({k:1});function x(e,t){let r=this||{};return function(){let o=arguments;function s(a,i){let n=Object.assign({},a),l=n.className||s.className;r.p=Object.assign({theme:h&&h()},n),r.o=/ *go\d+/.test(l),n.className=y.apply(r,o)+(l?" "+l:""),t&&(n.ref=i);let d=e;return e[0]&&(d=n.as||e,delete n.as),b&&d[0]&&b(n),g(d,n)}return t?t(s):s}}var w=e=>"function"==typeof e,E=(e,t)=>w(e)?e(t):e,C=(()=>{let e=0;return()=>(++e).toString()})(),S=(()=>{let e;return()=>e})(),O=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return O(e,{type:+!!e.toasts.find(e=>e.id===r.id),toast:r});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+s}))}}},P=[],D={toasts:[],pausedAt:void 0},$=e=>{D=O(D,e),P.forEach(e=>{e(D)})},j={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},k=(e={})=>{let[t,r]=(0,s.useState)(D),o=(0,s.useRef)(D);(0,s.useEffect)(()=>(o.current!==D&&r(D),P.push(r),()=>{let e=P.indexOf(r);e>-1&&P.splice(e,1)}),[]);let a=t.toasts.map(t=>{var r,o,s;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(o=e[t.type])?void 0:o.duration)||(null==e?void 0:e.duration)||j[t.type],style:{...e.style,...null==(s=e[t.type])?void 0:s.style,...t.style}}});return{...t,toasts:a}},N=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||C()}),A=e=>(t,r)=>{let o=N(t,e,r);return $({type:2,toast:o}),o.id},I=(e,t)=>A("blank")(e,t);I.error=A("error"),I.success=A("success"),I.loading=A("loading"),I.custom=A("custom"),I.dismiss=e=>{$({type:3,toastId:e})},I.remove=e=>$({type:4,toastId:e}),I.promise=(e,t,r)=>{let o=I.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let s=t.success?E(t.success,e):void 0;return s?I.success(s,{id:o,...r,...null==r?void 0:r.success}):I.dismiss(o),e}).catch(e=>{let s=t.error?E(t.error,e):void 0;s?I.error(s,{id:o,...r,...null==r?void 0:r.error}):I.dismiss(o)}),e};var _=(e,t)=>{$({type:1,toast:{id:e,height:t}})},z=()=>{$({type:5,time:Date.now()})},T=new Map,L=1e3,M=(e,t=L)=>{if(T.has(e))return;let r=setTimeout(()=>{T.delete(e),$({type:4,toastId:e})},t);T.set(e,r)},U=e=>{let{toasts:t,pausedAt:r}=k(e);(0,s.useEffect)(()=>{if(r)return;let e=Date.now(),o=t.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(r<0){t.visible&&I.dismiss(t.id);return}return setTimeout(()=>I.dismiss(t.id),r)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[t,r]);let o=(0,s.useCallback)(()=>{r&&$({type:6,time:Date.now()})},[r]),a=(0,s.useCallback)((e,r)=>{let{reverseOrder:o=!1,gutter:s=8,defaultPosition:a}=r||{},i=t.filter(t=>(t.position||a)===(e.position||a)&&t.height),n=i.findIndex(t=>t.id===e.id),l=i.filter((e,t)=>t<n&&e.visible).length;return i.filter(e=>e.visible).slice(...o?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+s,0)},[t]);return(0,s.useEffect)(()=>{t.forEach(e=>{if(e.dismissed)M(e.id,e.removeDelay);else{let t=T.get(e.id);t&&(clearTimeout(t),T.delete(e.id))}})},[t]),{toasts:t,handlers:{updateHeight:_,startPause:z,endPause:o,calculateOffset:a}}},F=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,H=v`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,R=v`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,G=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${F} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${R} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,q=v`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,B=x("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${q} 1s linear infinite;
`,K=v`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Y=v`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Z=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${K} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Y} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,J=x("div")`
  position: absolute;
`,Q=x("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,V=v`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,W=x("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${V} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,X=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return void 0!==t?"string"==typeof t?s.createElement(W,null,t):t:"blank"===r?null:s.createElement(Q,null,s.createElement(B,{...o}),"loading"!==r&&s.createElement(J,null,"error"===r?s.createElement(G,{...o}):s.createElement(Z,{...o})))},ee=e=>`
0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,et=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}
`,er=x("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,eo=x("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,es=(e,t)=>{let r=e.includes("top")?1:-1,[o,s]=S()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[ee(r),et(r)];return{animation:t?`${v(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${v(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},ea=s.memo(({toast:e,position:t,style:r,children:o})=>{let a=e.height?es(e.position||t||"top-center",e.visible):{opacity:0},i=s.createElement(X,{toast:e}),n=s.createElement(eo,{...e.ariaProps},E(e.message,e));return s.createElement(er,{className:e.className,style:{...a,...r,...e.style}},"function"==typeof o?o({icon:i,message:n}):s.createElement(s.Fragment,null,i,n))});o=s.createElement,u.p=void 0,g=o,h=void 0,b=void 0;var ei=({id:e,className:t,style:r,onHeightUpdate:o,children:a})=>{let i=s.useCallback(t=>{if(t){let r=()=>{o(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return s.createElement("div",{ref:i,className:t,style:r},a)},en=(e,t)=>{let r=e.includes("top"),o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:S()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...r?{top:0}:{bottom:0},...o}},el=y`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ed=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:o,children:a,containerStyle:i,containerClassName:n})=>{let{toasts:l,handlers:d}=U(r);return s.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:n,onMouseEnter:d.startPause,onMouseLeave:d.endPause},l.map(r=>{let i=r.position||t,n=en(i,d.calculateOffset(r,{reverseOrder:e,gutter:o,defaultPosition:t}));return s.createElement(ei,{id:r.id,key:r.id,onHeightUpdate:d.updateHeight,className:r.visible?el:"",style:n},"custom"===r.type?E(r.message,r):a?a(r):s.createElement(ea,{toast:r,position:i}))}))}}};