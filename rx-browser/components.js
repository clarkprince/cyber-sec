/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t$2;const i$5=window,s$6=i$5.trustedTypes,e$5=s$6?s$6.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$8="$lit$",n$7=`lit$${(Math.random()+"").slice(9)}$`,l$4="?"+n$7,h$4=`<${l$4}>`,r$4=document,u$2=()=>r$4.createComment(""),d$1=t=>null===t||"object"!=typeof t&&"function"!=typeof t,c$5=Array.isArray,v=t=>c$5(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),a$2="[ \t\n\f\r]",f$1=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m$2=/>/g,p$1=RegExp(`>|${a$2}(?:([^\\s"'>=/]+)(${a$2}*=${a$2}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,w=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=w(1),b=w(2),T=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),E=new WeakMap,C=r$4.createTreeWalker(r$4,129,null,!1);function P(t,i){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$5?e$5.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,e=[];let l,r=2===i?"<svg>":"",u=f$1;for(let i=0;i<s;i++){const s=t[i];let d,c,v=-1,a=0;for(;a<s.length&&(u.lastIndex=a,c=u.exec(s),null!==c);)a=u.lastIndex,u===f$1?"!--"===c[1]?u=_:void 0!==c[1]?u=m$2:void 0!==c[2]?(y.test(c[2])&&(l=RegExp("</"+c[2],"g")),u=p$1):void 0!==c[3]&&(u=p$1):u===p$1?">"===c[0]?(u=null!=l?l:f$1,v=-1):void 0===c[1]?v=-2:(v=u.lastIndex-c[2].length,d=c[1],u=void 0===c[3]?p$1:'"'===c[3]?$:g):u===$||u===g?u=p$1:u===_||u===m$2?u=f$1:(u=p$1,l=void 0);const w=u===p$1&&t[i+1].startsWith("/>")?" ":"";r+=u===f$1?s+h$4:v>=0?(e.push(d),s.slice(0,v)+o$8+s.slice(v)+n$7+w):s+n$7+(-2===v?(e.push(void 0),i):w);}return [P(t,r+(t[s]||"<?>")+(2===i?"</svg>":"")),e]};class N{constructor({strings:t,_$litType$:i},e){let h;this.parts=[];let r=0,d=0;const c=t.length-1,v=this.parts,[a,f]=V(t,i);if(this.el=N.createElement(a,e),C.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(h=C.nextNode())&&v.length<c;){if(1===h.nodeType){if(h.hasAttributes()){const t=[];for(const i of h.getAttributeNames())if(i.endsWith(o$8)||i.startsWith(n$7)){const s=f[d++];if(t.push(i),void 0!==s){const t=h.getAttribute(s.toLowerCase()+o$8).split(n$7),i=/([.?@])?(.*)/.exec(s);v.push({type:1,index:r,name:i[2],strings:t,ctor:"."===i[1]?H:"?"===i[1]?L:"@"===i[1]?z:k});}else v.push({type:6,index:r});}for(const i of t)h.removeAttribute(i);}if(y.test(h.tagName)){const t=h.textContent.split(n$7),i=t.length-1;if(i>0){h.textContent=s$6?s$6.emptyScript:"";for(let s=0;s<i;s++)h.append(t[s],u$2()),C.nextNode(),v.push({type:2,index:++r});h.append(t[i],u$2());}}}else if(8===h.nodeType)if(h.data===l$4)v.push({type:2,index:r});else {let t=-1;for(;-1!==(t=h.data.indexOf(n$7,t+1));)v.push({type:7,index:r}),t+=n$7.length-1;}r++;}}static createElement(t,i){const s=r$4.createElement("template");return s.innerHTML=t,s}}function S$1(t,i,s=t,e){var o,n,l,h;if(i===T)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d$1(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=S$1(t,r._$AS(t,i.values),r,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:r$4).importNode(s,!0);C.currentNode=o;let n=C.nextNode(),l=0,h=0,u=e[0];for(;void 0!==u;){if(l===u.index){let i;2===u.type?i=new R(n,n.nextSibling,this,t):1===u.type?i=new u.ctor(n,u.name,u.strings,this,t):6===u.type&&(i=new Z(n,this,t)),this._$AV.push(i),u=e[++h];}l!==(null==u?void 0:u.index)&&(n=C.nextNode(),l++);}return C.currentNode=r$4,o}v(t){let i=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{constructor(t,i,s,e){var o;this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cp=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cp}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===(null==t?void 0:t.nodeType)&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S$1(this,t,i),d$1(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.g(t):void 0!==t.nodeType?this.$(t):v(t)?this.T(t):this._(t);}k(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}$(t){this._$AH!==t&&(this._$AR(),this._$AH=this.k(t));}_(t){this._$AH!==A&&d$1(this._$AH)?this._$AA.nextSibling.data=t:this.$(r$4.createTextNode(t)),this._$AH=t;}g(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=N.createElement(P(e.h,e.h[0]),this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.v(s);else {const t=new M(o,this),i=t.u(this.options);t.v(s),this.$(i),this._$AH=t;}}_$AC(t){let i=E.get(t.strings);return void 0===i&&E.set(t.strings,i=new N(t)),i}T(t){c$5(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new R(this.k(u$2()),this.k(u$2()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cp=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class k{constructor(t,i,s,e,o){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=S$1(this,t,i,0),n=!d$1(t)||t!==this._$AH&&t!==T,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=S$1(this,e[s+l],i,l),h===T&&(h=this._$AH[l]),n||(n=!d$1(h)||h!==this._$AH[l]),h===A?t=A:t!==A&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}const I=s$6?s$6.emptyScript:"";class L extends k{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==A?this.element.setAttribute(this.name,I):this.element.removeAttribute(this.name);}}class z extends k{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=S$1(this,t,i,0))&&void 0!==s?s:A)===T)return;const e=this._$AH,o=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A&&(e===A||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S$1(this,t);}}const j={O:o$8,P:n$7,A:l$4,C:1,M:V,L:M,R:v,D:S$1,I:R,V:k,H:L,N:z,U:H,F:Z},B=i$5.litHtmlPolyfillSupport;null==B||B(N,R),(null!==(t$2=i$5.litHtmlVersions)&&void 0!==t$2?t$2:i$5.litHtmlVersions=[]).push("2.8.0");const D=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new R(i.insertBefore(u$2(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},e$4=t=>(...e)=>({_$litDirective$:t,values:e});let i$4 = class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o$7=e$4(class extends i$4{constructor(t){var i;if(super(t),t.type!==t$1.ATTRIBUTE||"class"!==t.name||(null===(i=t.strings)||void 0===i?void 0:i.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return " "+Object.keys(t).filter((i=>t[i])).join(" ")+" "}update(i,[s]){var r,o;if(void 0===this.it){this.it=new Set,void 0!==i.strings&&(this.nt=new Set(i.strings.join(" ").split(/\s/).filter((t=>""!==t))));for(const t in s)s[t]&&!(null===(r=this.nt)||void 0===r?void 0:r.has(t))&&this.it.add(t);return this.render(s)}const e=i.element.classList;this.it.forEach((t=>{t in s||(e.remove(t),this.it.delete(t));}));for(const t in s){const i=!!s[t];i===this.it.has(t)||(null===(o=this.nt)||void 0===o?void 0:o.has(t))||(i?(e.add(t),this.it.add(t)):(e.remove(t),this.it.delete(t)));}return T}});

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=window,e$3=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$5=Symbol(),n$6=new WeakMap;let o$6 = class o{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$5)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$6.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$6.set(s,t));}return t}toString(){return this.cssText}};const r$3=t=>new o$6("string"==typeof t?t:t+"",void 0,s$5),i$3=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$6(n,t,s$5)},S=(s,n)=>{e$3?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$4=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var s$4;const e$2=window,r$2=e$2.trustedTypes,h$3=r$2?r$2.emptyScript:"",o$5=e$2.reactiveElementPolyfillSupport,n$5={toAttribute(t,i){switch(i){case Boolean:t=t?h$3:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$3={attribute:!0,type:String,converter:n$5,reflect:!1,hasChanged:a$1},d="finalized";let u$1 = class u extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$3){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$3}static finalize(){if(this.hasOwnProperty(d))return !1;this[d]=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$4(i));}else void 0!==i&&s.push(c$4(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$3){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$5).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$5;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}};u$1[d]=!0,u$1.elementProperties=new Map,u$1.elementStyles=[],u$1.shadowRootOptions={mode:"open"},null==o$5||o$5({ReactiveElement:u$1}),(null!==(s$4=e$2.reactiveElementVersions)&&void 0!==s$4?s$4:e$2.reactiveElementVersions=[]).push("1.6.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var l$2,o$4;let s$3 = class s extends u$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return T}};s$3.finalized=!0,s$3._$litElement$=!0,null===(l$2=globalThis.litElementHydrateSupport)||void 0===l$2||l$2.call(globalThis,{LitElement:s$3});const n$4=globalThis.litElementPolyfillSupport;null==n$4||n$4({LitElement:s$3});(null!==(o$4=globalThis.litElementVersions)&&void 0!==o$4?o$4:globalThis.litElementVersions=[]).push("3.3.2");

/**
 * TWElement: share the CSS stylesheet with the parent
 */
class TWElement extends s$3 {
    createRenderRoot() {
        const root = super.createRenderRoot();
        // @ts-ignore
        for (const sheet of document.styleSheets) {
            let link = document.createElement("link");
            link.href = sheet.href || "";
            link.rel = "stylesheet";
            root.appendChild(link);
        }
        return root;
    }
    _slottedChildren(selector, slot) {
        let sel = "slot";
        if (slot) {
            sel += " [name=" + slot + "]";
        }
        const slotElement = this.shadowRoot.querySelector(sel);
        const children = slotElement.assignedElements({ flatten: true });
        if (!selector) {
            return children;
        }
        return children.filter((e) => e.matches(selector));
    }
    // testPeek matches a selector in shadow root
    testPeek(selector) {
        const n = this.renderRoot.querySelector(selector);
        if (n == null) {
            throw new Error("no node matching selector " + selector);
        }
        return n;
    }
    // testPeekAll matches a selector in shadow root
    testPeekAll(selector) {
        return this.renderRoot.querySelectorAll(selector);
    }
}

class Collapse extends TWElement {
    static properties = {
        _isOpen: { state: true }
    }

    constructor() {
        super();
        this._isOpen = false;
    }

    toggle(e) {
        e.preventDefault();
        this._isOpen = !this._isOpen;
    }

    render() {
        return x`<a role="button" class="px-3 h-10 flex items-center justify-between bg-neutral-200 dark:bg-neutral-800 rounded-sm text-neutral-800 dark:text-gray-100 text-sm font-medium group" @click="${this.toggle}"><slot name="link"></slot><svg height="16" viewBox="0 0 15 16" class="${o$7({ 'rotate-180': this._isOpen })} group-hover:rotate-180 transition-transform"><path d="M3.125 10.0139L7.5 5.63892L11.875 10.0139" stroke="#F2F2F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a><div class="${o$7({ 'hidden': !this._isOpen })} p-2"><slot name="content"></slot></div>`
    }
}

customElements.define("wt-collapse", Collapse);

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function n$3(n,o,r){return n?o():null==r?void 0:r()}

const icons$2 = {
    urgent: b `<path d="M16.5828 7.98831L16.0212 2.05729C15.9927 1.74992 15.7479 1.50706 15.4406 1.47671L9.50954 0.9151H9.50195C9.44124 0.9151 9.39381 0.934073 9.35776 0.970122L0.4726 9.85528C0.455011 9.87283 0.441057 9.89368 0.431536 9.91663C0.422015 9.93959 0.417114 9.96419 0.417114 9.98904C0.417114 10.0139 0.422015 10.0385 0.431536 10.0614C0.441057 10.0844 0.455011 10.1052 0.4726 10.1228L7.37506 17.0253C7.41111 17.0613 7.45854 17.0803 7.50977 17.0803C7.56099 17.0803 7.60843 17.0613 7.64448 17.0253L16.5296 8.1401C16.5676 8.10026 16.5866 8.04523 16.5828 7.98831ZM7.50787 15.1203L2.37751 9.98999L9.96111 2.40639L14.6475 2.85037L15.0915 7.53675L7.50787 15.1203ZM11.6877 4.14055C10.7675 4.14055 10.018 4.88999 10.018 5.81019C10.018 6.73039 10.7675 7.47983 11.6877 7.47983C12.6079 7.47983 13.3573 6.73039 13.3573 5.81019C13.3573 4.88999 12.6079 4.14055 11.6877 4.14055ZM11.6877 6.41733C11.3518 6.41733 11.0805 6.14602 11.0805 5.81019C11.0805 5.47436 11.3518 5.20305 11.6877 5.20305C12.0235 5.20305 12.2948 5.47436 12.2948 5.81019C12.2948 6.14602 12.0235 6.41733 11.6877 6.41733Z"/>`,
    calendar: b `<path d="M12.2949 2.7791V2.77965H15.4824C15.818 2.77965 16.089 3.05072 16.089 3.38624V15.9845C16.089 16.32 15.818 16.591 15.4824 16.591H1.51815C1.18264 16.591 0.911569 16.32 0.911569 15.9845V3.38624C0.911569 3.05072 1.18264 2.77965 1.51815 2.77965H4.70565V2.7791H4.70621V1.56481C4.70621 1.48164 4.77427 1.41358 4.85744 1.41358H5.91994C6.00311 1.41358 6.07117 1.48164 6.07117 1.56481V2.7791H6.07173V2.77965H10.9289V2.7791H10.9294V1.56481C10.9294 1.48164 10.9975 1.41358 11.0807 1.41358H12.1432C12.2263 1.41358 12.2944 1.48164 12.2944 1.56481V2.7791H12.2949ZM2.27708 15.2255V15.2261H14.7235V15.2255H14.7241V8.0157H14.7235V8.01515H2.27708V8.0157H2.27652V15.2255H2.27708ZM2.27708 4.14517H2.27652V6.72553H2.27708V6.72608H14.7235V6.72553H14.7241V4.14517H14.7235V4.14461H12.2949V4.14517H12.2944V5.05588C12.2944 5.13906 12.2263 5.20711 12.1432 5.20711H11.0807C10.9975 5.20711 10.9294 5.13906 10.9294 5.05588V4.14517H10.9289V4.14461H6.07173V4.14517H6.07117V5.05588C6.07117 5.13906 6.00311 5.20711 5.91994 5.20711H4.85744C4.77427 5.20711 4.70621 5.13906 4.70621 5.05588V4.14517H4.70565V4.14461H2.27708V4.14517Z" stroke-width="0.00111607"/>`,
    tick: b `<path d="M21.7155 0.875H19.8432C19.5807 0.875 19.3316 0.995536 19.1709 1.20179L8.1271 15.192L2.83157 8.48214C2.75146 8.38043 2.64935 8.29819 2.53291 8.2416C2.41647 8.185 2.28871 8.15551 2.15925 8.15536H0.286924C0.107459 8.15536 0.00835212 8.36161 0.118174 8.50089L7.45478 17.7955C7.79764 18.2295 8.45657 18.2295 8.8021 17.7955L21.8842 1.21786C21.9941 1.08125 21.895 0.875 21.7155 0.875Z"/>`,
    user: b `<path d="M5 20C5 17.5 7 15.6 9.4 15.6H14.5C17 15.6 18.9 17.6 18.9 20M15 5.2C16.7 6.9 16.7 9.6 15 11.2C13.3 12.8 10.6 12.9 9 11.2C7.4 9.5 7.3 6.8 9 5.2C10.7 3.6 13.3 3.6 15 5.2Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    more: b `<path d="M10.25 16.25C10.1492 16.2466 10.0503 16.2227 9.95915 16.1797C9.86801 16.1367 9.78662 16.0755 9.71995 16C9.5795 15.8593 9.50061 15.6687 9.50061 15.47C9.50061 15.2712 9.5795 15.0806 9.71995 14.94L12.72 11.94L9.71995 8.93996C9.66063 8.79595 9.64761 8.63704 9.6827 8.4853C9.7178 8.33355 9.79927 8.1965 9.9158 8.09316C10.0323 7.98982 10.1781 7.92532 10.333 7.90862C10.4879 7.89192 10.6441 7.92385 10.78 7.99996L14.28 11.5C14.4204 11.6406 14.4993 11.8312 14.4993 12.03C14.4993 12.2287 14.4204 12.4193 14.28 12.56L10.78 16C10.7133 16.0755 10.6319 16.1367 10.5408 16.1797C10.4496 16.2227 10.3507 16.2466 10.25 16.25Z"/>`,
    copy: b `<path class="stroke-linejoin-round" d="M2 5h9v9H2z"></path><path class="stroke-linejoin-round" d="M5 5V2h9v9h-3"></path>`,
    pivot: b `<path d="M12 20.75C11.9045 20.7488 11.8099 20.7319 11.72 20.7C9.00413 19.495 6.73212 17.4724 5.22092 14.9143C3.70971 12.3562 3.03467 9.39015 3.28997 6.42999C3.29871 6.26297 3.36378 6.10384 3.47455 5.97853C3.58533 5.85323 3.73528 5.76915 3.89997 5.73999C6.6038 5.33069 9.23017 4.5148 11.69 3.31999C11.7873 3.2758 11.893 3.25293 12 3.25293C12.1069 3.25293 12.2126 3.2758 12.31 3.31999C14.7698 4.5148 17.3961 5.33069 20.1 5.73999C20.2647 5.76915 20.4146 5.85323 20.5254 5.97853C20.6362 6.10384 20.7012 6.26297 20.71 6.42999C20.9653 9.39015 20.2902 12.3562 18.779 14.9143C17.2678 17.4724 14.9958 19.495 12.28 20.7C12.19 20.7319 12.0954 20.7488 12 20.75ZM4.75997 7.10999C4.61102 9.61694 5.22247 12.1105 6.5143 14.2641C7.80613 16.4177 9.71812 18.1311 12 19.18C14.2818 18.1311 16.1938 16.4177 17.4856 14.2641C18.7775 12.1105 19.3889 9.61694 19.24 7.10999C16.7325 6.68438 14.2961 5.91373 12 4.81999C9.70387 5.91373 7.26741 6.68438 4.75997 7.10999Z"/>`,
    ellipsis: b `<path d="M12 13.75C12.9665 13.75 13.75 12.9665 13.75 12C13.75 11.0335 12.9665 10.25 12 10.25C11.0335 10.25 10.25 11.0335 10.25 12C10.25 12.9665 11.0335 13.75 12 13.75Z" fill="black"/><path d="M12 6.75C12.9665 6.75 13.75 5.9665 13.75 5C13.75 4.0335 12.9665 3.25 12 3.25C11.0335 3.25 10.25 4.0335 10.25 5C10.25 5.9665 11.0335 6.75 12 6.75Z" fill="black"/><path d="M12 20.75C12.9665 20.75 13.75 19.9665 13.75 19C13.75 18.0335 12.9665 17.25 12 17.25C11.0335 17.25 10.25 18.0335 10.25 19C10.25 19.9665 11.0335 20.75 12 20.75Z" fill="black"/>`,
    cell: b `<path d="M17.75 20.75C17.5974 20.747 17.4487 20.702 17.32 20.62L12 16.91L6.68 20.62C6.56249 20.6915 6.42757 20.7294 6.29 20.7294C6.15243 20.7294 6.01751 20.6915 5.9 20.62C5.78491 20.5607 5.68741 20.4722 5.61722 20.3634C5.54703 20.2546 5.50661 20.1293 5.5 20V6C5.5 5.27065 5.78973 4.57118 6.30546 4.05546C6.82118 3.53973 7.52065 3.25 8.25 3.25H15.75C16.4793 3.25 17.1788 3.53973 17.6945 4.05546C18.2103 4.57118 18.5 5.27065 18.5 6V20C18.5005 20.1362 18.4634 20.2698 18.3929 20.3863C18.3223 20.5027 18.2209 20.5974 18.1 20.66C17.9927 20.7189 17.8724 20.7498 17.75 20.75ZM12 15.25C12.1532 15.2484 12.3033 15.2938 12.43 15.38L17 18.56V6C17 5.66848 16.8683 5.35054 16.6339 5.11612C16.3995 4.8817 16.0815 4.75 15.75 4.75H8.25C7.91848 4.75 7.60054 4.8817 7.36612 5.11612C7.1317 5.35054 7 5.66848 7 6V18.56L11.57 15.38C11.6967 15.2938 11.8468 15.2484 12 15.25Z"/>`,
    data: b `<path d="M20.73 16.52C20.73 16.52 20.73 16.45 20.73 16.41V7.58999C20.7296 7.47524 20.7022 7.36218 20.65 7.25999C20.5763 7.10119 20.4488 6.97364 20.29 6.89999L12.29 3.31999C12.1926 3.2758 12.0869 3.25293 11.98 3.25293C11.873 3.25293 11.7674 3.2758 11.67 3.31999L3.66998 6.89999C3.54132 6.96474 3.43252 7.06303 3.35508 7.18448C3.27763 7.30592 3.23441 7.44603 3.22998 7.58999V16.41C3.23746 16.5532 3.28192 16.6921 3.35903 16.813C3.43614 16.9339 3.54327 17.0328 3.66998 17.1L11.67 20.68C11.7668 20.7262 11.8727 20.7501 11.98 20.7501C12.0872 20.7501 12.1932 20.7262 12.29 20.68L20.29 17.1C20.4055 17.0471 20.5061 16.9665 20.5829 16.8653C20.6596 16.7641 20.7102 16.6455 20.73 16.52ZM4.72998 8.73999L11.23 11.66V18.84L4.72998 15.93V8.73999ZM12.73 11.66L19.23 8.73999V15.93L12.73 18.84V11.66ZM12 4.81999L18.17 7.58999L12 10.35L5.82998 7.58999L12 4.81999Z"/>`,
    datasource: b `<path d="M15.94 7.61999L11.06 9.61999C10.7251 9.75225 10.421 9.95185 10.1664 10.2064C9.91182 10.461 9.71222 10.7651 9.57996 11.1L7.57996 15.98C7.54712 16.0636 7.54866 16.1567 7.58426 16.2392C7.61985 16.3216 7.68661 16.3866 7.76996 16.42C7.85062 16.4499 7.93931 16.4499 8.01996 16.42L12.9 14.42C13.2348 14.2877 13.539 14.0881 13.7935 13.8336C14.0481 13.579 14.2477 13.2748 14.38 12.94L16.38 8.05999C16.4128 7.97643 16.4113 7.88326 16.3757 7.80082C16.3401 7.71839 16.2733 7.65338 16.19 7.61999C16.1093 7.59013 16.0206 7.59013 15.94 7.61999ZM12 13C11.8022 13 11.6088 12.9413 11.4444 12.8315C11.2799 12.7216 11.1518 12.5654 11.0761 12.3827C11.0004 12.2 10.9806 11.9989 11.0192 11.8049C11.0578 11.6109 11.153 11.4327 11.2929 11.2929C11.4327 11.153 11.6109 11.0578 11.8049 11.0192C11.9989 10.9806 12.1999 11.0004 12.3826 11.0761C12.5654 11.1518 12.7216 11.28 12.8314 11.4444C12.9413 11.6089 13 11.8022 13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5195 12.8946 12.2652 13 12 13Z" class="fill-zinc-800 dark:fill-slate-100"/><path d="M12 21C10.22 21 8.47991 20.4722 6.99987 19.4832C5.51983 18.4943 4.36628 17.0887 3.68509 15.4442C3.0039 13.7996 2.82567 11.99 3.17294 10.2442C3.5202 8.49836 4.37737 6.89472 5.63604 5.63604C6.89472 4.37737 8.49836 3.5202 10.2442 3.17294C11.99 2.82567 13.7996 3.0039 15.4442 3.68509C17.0887 4.36628 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C21 14.387 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.387 21 12 21ZM12 4.5C10.5166 4.5 9.0666 4.93987 7.83323 5.76398C6.59986 6.58809 5.63856 7.75943 5.07091 9.12988C4.50325 10.5003 4.35473 12.0083 4.64411 13.4632C4.9335 14.918 5.64781 16.2544 6.6967 17.3033C7.7456 18.3522 9.08197 19.0665 10.5368 19.3559C11.9917 19.6453 13.4997 19.4968 14.8701 18.9291C16.2406 18.3614 17.4119 17.4001 18.236 16.1668C19.0601 14.9334 19.5 13.4834 19.5 12C19.5 10.0109 18.7098 8.10323 17.3033 6.6967C15.8968 5.29018 13.9891 4.5 12 4.5Z" class="fill-zinc-800 dark:fill-slate-100"/>`,
    search: b `<path d="M10.77 18.3C9.2807 18.3 7.82485 17.8584 6.58655 17.031C5.34825 16.2036 4.38311 15.0275 3.81318 13.6516C3.24325 12.2757 3.09413 10.7616 3.38468 9.30096C3.67523 7.84029 4.39239 6.49857 5.44548 5.44548C6.49857 4.39239 7.84029 3.67523 9.30096 3.38468C10.7616 3.09413 12.2757 3.24325 13.6516 3.81318C15.0275 4.38311 16.2036 5.34825 17.031 6.58655C17.8584 7.82485 18.3 9.2807 18.3 10.77C18.3 11.7588 18.1052 12.738 17.7268 13.6516C17.3484 14.5652 16.7937 15.3953 16.0945 16.0945C15.3953 16.7937 14.5652 17.3484 13.6516 17.7268C12.738 18.1052 11.7588 18.3 10.77 18.3ZM10.77 4.74999C9.58331 4.74999 8.42327 5.10189 7.43657 5.76118C6.44988 6.42046 5.68084 7.35754 5.22672 8.45389C4.77259 9.55025 4.65377 10.7566 4.88528 11.9205C5.11679 13.0844 5.68824 14.1535 6.52735 14.9926C7.36647 15.8317 8.43556 16.4032 9.59945 16.6347C10.7633 16.8662 11.9697 16.7474 13.0661 16.2933C14.1624 15.8391 15.0995 15.0701 15.7588 14.0834C16.4181 13.0967 16.77 11.9367 16.77 10.75C16.77 9.15869 16.1379 7.63257 15.0126 6.50735C13.8874 5.38213 12.3613 4.74999 10.77 4.74999Z" class="fill-zinc-800 dark:fill-slate-100"/><path d="M20 20.75C19.9014 20.7504 19.8038 20.7312 19.7128 20.6934C19.6218 20.6557 19.5392 20.6001 19.47 20.53L15.34 16.4C15.2075 16.2578 15.1354 16.0697 15.1388 15.8754C15.1422 15.6811 15.2209 15.4958 15.3583 15.3583C15.4958 15.2209 15.6811 15.1422 15.8754 15.1388C16.0697 15.1354 16.2578 15.2075 16.4 15.34L20.53 19.47C20.6704 19.6106 20.7493 19.8012 20.7493 20C20.7493 20.1987 20.6704 20.3893 20.53 20.53C20.4607 20.6001 20.3782 20.6557 20.2872 20.6934C20.1961 20.7312 20.0985 20.7504 20 20.75Z" class="fill-zinc-800 dark:fill-slate-100"/>`,
    connectors: b `<path d="M16.5 18.75H9.49997C8.28165 18.7499 7.08607 18.4201 6.04003 17.7955C4.99399 17.1709 4.13649 16.2749 3.55849 15.2024C2.98049 14.1299 2.70353 12.921 2.75699 11.7038C2.81045 10.4867 3.19234 9.30667 3.86215 8.28899C4.53196 7.27132 5.46471 6.4539 6.56149 5.92343C7.65826 5.39296 8.87816 5.16923 10.0918 5.27595C11.3054 5.38268 12.4676 5.81589 13.4549 6.52963C14.4423 7.24338 15.2181 8.21104 15.7 9.33C15.9637 9.27914 16.2314 9.25237 16.5 9.25C17.735 9.32578 18.8996 9.85055 19.7745 10.7255C20.6494 11.6004 21.1742 12.765 21.25 14C21.25 14.6238 21.1271 15.2415 20.8884 15.8177C20.6497 16.394 20.2998 16.9177 19.8587 17.3588C19.4177 17.7998 18.894 18.1497 18.3177 18.3884C17.7414 18.6271 17.1238 18.75 16.5 18.75ZM9.49997 6.75C8.10759 6.75 6.77223 7.30313 5.78766 8.28769C4.8031 9.27226 4.24997 10.6076 4.24997 12C4.24997 13.3924 4.8031 14.7277 5.78766 15.7123C6.77223 16.6969 8.10759 17.25 9.49997 17.25H16.5C17.3611 17.2474 18.1862 16.9041 18.7952 16.2952C19.4041 15.6863 19.7473 14.8611 19.75 14C19.6777 13.1623 19.3121 12.377 18.7176 11.7824C18.123 11.1879 17.3377 10.8223 16.5 10.75C16.1584 10.7576 15.8205 10.8218 15.5 10.94C15.3138 11.0146 15.1061 11.0146 14.92 10.94C14.8317 10.8955 14.7534 10.8336 14.6898 10.758C14.6262 10.6823 14.5787 10.5946 14.55 10.5C14.2275 9.4126 13.5608 8.45919 12.6502 7.78299C11.7396 7.10679 10.6342 6.74431 9.49997 6.75Z" class="fill-zinc-800 dark:fill-slate-100"/>`,
    help: b `<path d="M12 3C7.04 3 3 7.04 3 12C3 16.96 7.04 21 12 21C16.96 21 21 16.96 21 12C21 7.04 16.96 3 12 3ZM12 19.5C7.86 19.5 4.5 16.14 4.5 12C4.5 7.86 7.86 4.5 12 4.5C16.14 4.5 19.5 7.86 19.5 12C19.5 16.14 16.14 19.5 12 19.5ZM14.3 7.7C14.91 8.31 15.25 9.13 15.25 10C15.25 10.87 14.91 11.68 14.3 12.3C13.87 12.73 13.33 13.03 12.75 13.16V13.5C12.75 13.91 12.41 14.25 12 14.25C11.59 14.25 11.25 13.91 11.25 13.5V12.5C11.25 12.09 11.59 11.75 12 11.75C12.47 11.75 12.91 11.57 13.24 11.24C13.57 10.91 13.75 10.47 13.75 10C13.75 9.53 13.57 9.09 13.24 8.76C12.58 8.1 11.43 8.1 10.77 8.76C10.44 9.09 10.26 9.53 10.26 10C10.26 10.41 9.92 10.75 9.51 10.75C9.1 10.75 8.76 10.41 8.76 10C8.76 9.13 9.1 8.32 9.71 7.7C10.94 6.47 13.08 6.47 14.31 7.7H14.3ZM13 16.25C13 16.8 12.55 17.25 12 17.25C11.45 17.25 11 16.8 11 16.25C11 15.7 11.45 15.25 12 15.25C12.55 15.25 13 15.7 13 16.25Z" class="fill-zinc-800 dark:fill-slate-100"/>`,
    delete: b `<path d="M17 5.70001H1C0.901509 5.70001 0.803982 5.68061 0.712987 5.64292C0.621993 5.60523 0.539314 5.54999 0.46967 5.48034C0.400026 5.4107 0.344781 5.32802 0.30709 5.23703C0.269399 5.14603 0.25 5.0485 0.25 4.95001C0.25 4.85152 0.269399 4.75399 0.30709 4.663C0.344781 4.57201 0.400026 4.48933 0.46967 4.41968C0.539314 4.35004 0.621993 4.29479 0.712987 4.2571C0.803982 4.21941 0.901509 4.20001 1 4.20001H17C17.1989 4.20001 17.3897 4.27903 17.5303 4.41968C17.671 4.56033 17.75 4.7511 17.75 4.95001C17.75 5.14892 17.671 5.33969 17.5303 5.48034C17.3897 5.621 17.1989 5.70001 17 5.70001Z"></path><path d="M13.44 17.75H4.56C4.24309 17.7717 3.92503 17.7302 3.62427 17.628C3.3235 17.5259 3.04601 17.365 2.80788 17.1548C2.56975 16.9446 2.37572 16.6891 2.23704 16.4034C2.09836 16.1176 2.01779 15.8071 2 15.49V4.99998C2 4.80107 2.07902 4.61031 2.21967 4.46965C2.36032 4.329 2.55109 4.24998 2.75 4.24998C2.94891 4.24998 3.13968 4.329 3.28033 4.46965C3.42098 4.61031 3.5 4.80107 3.5 4.99998V15.49C3.5 15.9 3.97 16.25 4.5 16.25H13.38C13.94 16.25 14.38 15.9 14.38 15.49V4.99998C14.38 4.78516 14.4653 4.57913 14.6172 4.42723C14.7691 4.27532 14.9752 4.18998 15.19 4.18998C15.4048 4.18998 15.6109 4.27532 15.7628 4.42723C15.9147 4.57913 16 4.78516 16 4.99998V15.49C15.9822 15.8071 15.9016 16.1176 15.763 16.4034C15.6243 16.6891 15.4303 16.9446 15.1921 17.1548C14.954 17.365 14.6765 17.5259 14.3757 17.628C14.075 17.7302 13.7569 17.7717 13.44 17.75ZM13.56 4.74998C13.4611 4.75133 13.363 4.73285 13.2714 4.69563C13.1798 4.65842 13.0966 4.60323 13.0267 4.53331C12.9568 4.4634 12.9016 4.38018 12.8644 4.28858C12.8271 4.19698 12.8087 4.09885 12.81 3.99998V2.50998C12.81 2.09999 12.33 1.74998 11.81 1.74998H6.22C5.67 1.74998 5.22 2.09999 5.22 2.50998V3.99998C5.22 4.1989 5.14098 4.38966 5.00033 4.53031C4.85968 4.67097 4.66891 4.74998 4.47 4.74998C4.27109 4.74998 4.08032 4.67097 3.93967 4.53031C3.79902 4.38966 3.72 4.1989 3.72 3.99998V2.50998C3.75872 1.8813 4.04203 1.29275 4.50929 0.87035C4.97655 0.447951 5.5906 0.225271 6.22 0.249985H11.78C12.4145 0.217172 13.0362 0.436204 13.51 0.859437C13.9838 1.28267 14.2713 1.87586 14.31 2.50998V3.99998C14.3113 4.09931 14.2929 4.19792 14.2558 4.29007C14.2187 4.38222 14.1637 4.46608 14.0939 4.53679C14.0241 4.6075 13.941 4.66364 13.8493 4.70195C13.7577 4.74027 13.6593 4.75999 13.56 4.75998V4.74998Z"></path><path d="M7.21997 14C7.02186 13.9974 6.8326 13.9175 6.6925 13.7774C6.55241 13.6373 6.47256 13.4481 6.46997 13.25V8.71997C6.46997 8.52106 6.54899 8.33029 6.68964 8.18964C6.83029 8.04899 7.02106 7.96997 7.21997 7.96997C7.41888 7.96997 7.60965 8.04899 7.7503 8.18964C7.89095 8.33029 7.96997 8.52106 7.96997 8.71997V13.24C7.9713 13.3393 7.95287 13.4379 7.91578 13.5301C7.87868 13.6222 7.82364 13.7061 7.75387 13.7768C7.68409 13.8475 7.60096 13.9036 7.50931 13.9419C7.41766 13.9803 7.31931 14 7.21997 14Z"></path><path d="M10.78 14C10.5811 14 10.3904 13.921 10.2497 13.7803C10.109 13.6396 10.03 13.4489 10.03 13.25V8.71997C10.03 8.52106 10.109 8.33029 10.2497 8.18964C10.3904 8.04899 10.5811 7.96997 10.78 7.96997C10.9789 7.96997 11.1697 8.04899 11.3104 8.18964C11.451 8.33029 11.53 8.52106 11.53 8.71997V13.24C11.53 13.4398 11.4513 13.6316 11.311 13.7739C11.1706 13.9161 10.9799 13.9973 10.78 14Z"></path>`,
    book: b `<path id="Vector" d="M7.5 0.625005H1.375C1.05357 0.615571 0.7415 0.733951 0.507193 0.954199C0.272886 1.17445 0.135448 1.4786 0.125 1.8V8C0.138045 8.37712 0.300133 8.73367 0.57571 8.99144C0.851288 9.2492 1.21785 9.38715 1.595 9.375H7.5C7.59905 9.37371 7.69369 9.33379 7.76373 9.26374C7.83378 9.19369 7.8737 9.09906 7.875 9V1C7.8737 0.900951 7.83378 0.806319 7.76373 0.736272C7.69369 0.666224 7.59905 0.6263 7.5 0.625005ZM7.125 8.625H1.595C1.41669 8.63738 1.24076 8.57853 1.10578 8.46136C0.970806 8.3442 0.887811 8.17828 0.875 8C0.887811 7.82173 0.970806 7.65581 1.10578 7.53865C1.24076 7.42148 1.41669 7.36263 1.595 7.375H7.125V8.625ZM7.125 6.625H1.595C1.34328 6.62528 1.09568 6.6889 0.875 6.81V1.8C0.886452 1.67795 0.945141 1.5652 1.03855 1.4858C1.13196 1.4064 1.25269 1.36664 1.375 1.375H7.125V6.625Z" fill="black"/><path id="Vector_2" d="M2.375 3.375H5.625C5.72446 3.375 5.81984 3.33549 5.89016 3.26516C5.96049 3.19484 6 3.09946 6 3C6 2.90054 5.96049 2.80516 5.89016 2.73483C5.81984 2.66451 5.72446 2.625 5.625 2.625H2.375C2.27554 2.625 2.18016 2.66451 2.10984 2.73483C2.03951 2.80516 2 2.90054 2 3C2 3.09946 2.03951 3.19484 2.10984 3.26516C2.18016 3.33549 2.27554 3.375 2.375 3.375Z" fill="black"/><path id="Vector_3" d="M2.375 5.125H5.625C5.72446 5.125 5.81984 5.08549 5.89016 5.01516C5.96049 4.94484 6 4.84946 6 4.75C6 4.65054 5.96049 4.55516 5.89016 4.48484C5.81984 4.41451 5.72446 4.375 5.625 4.375H2.375C2.27554 4.375 2.18016 4.41451 2.10984 4.48484C2.03951 4.55516 2 4.65054 2 4.75C2 4.84946 2.03951 4.94484 2.10984 5.01516C2.18016 5.08549 2.27554 5.125 2.375 5.125Z" fill="black"/>`,
    shield: b `<path d="M12 20.75C11.9045 20.7488 11.8099 20.7319 11.72 20.7C9.00413 19.495 6.73212 17.4724 5.22092 14.9143C3.70971 12.3562 3.03467 9.39015 3.28997 6.42999C3.29871 6.26297 3.36378 6.10384 3.47455 5.97853C3.58533 5.85323 3.73528 5.76915 3.89997 5.73999C6.6038 5.33069 9.23017 4.5148 11.69 3.31999C11.7873 3.2758 11.893 3.25293 12 3.25293C12.1069 3.25293 12.2126 3.2758 12.31 3.31999C14.7698 4.5148 17.3961 5.33069 20.1 5.73999C20.2647 5.76915 20.4146 5.85323 20.5254 5.97853C20.6362 6.10384 20.7012 6.26297 20.71 6.42999C20.9653 9.39015 20.2902 12.3562 18.779 14.9143C17.2678 17.4724 14.9958 19.495 12.28 20.7C12.19 20.7319 12.0954 20.7488 12 20.75ZM4.75997 7.10999C4.61102 9.61694 5.22247 12.1105 6.5143 14.2641C7.80613 16.4177 9.71812 18.1311 12 19.18C14.2818 18.1311 16.1938 16.4177 17.4856 14.2641C18.7775 12.1105 19.3889 9.61694 19.24 7.10999C16.7325 6.68438 14.2961 5.91373 12 4.81999C9.70387 5.91373 7.26741 6.68438 4.75997 7.10999Z" fill="black"/>`,
    lock: b `<path d="M17 10.25H16.75V8C16.75 6.74022 16.2496 5.53204 15.3588 4.64124C14.468 3.75045 13.2598 3.25 12 3.25C10.7402 3.25 9.53204 3.75045 8.64124 4.64124C7.75045 5.53204 7.25 6.74022 7.25 8V10.25H7C6.27065 10.25 5.57118 10.5397 5.05546 11.0555C4.53973 11.5712 4.25 12.2707 4.25 13V18C4.25 18.7293 4.53973 19.4288 5.05546 19.9445C5.57118 20.4603 6.27065 20.75 7 20.75H17C17.7293 20.75 18.4288 20.4603 18.9445 19.9445C19.4603 19.4288 19.75 18.7293 19.75 18V13C19.75 12.2707 19.4603 11.5712 18.9445 11.0555C18.4288 10.5397 17.7293 10.25 17 10.25ZM8.75 8C8.75 7.13805 9.09241 6.3114 9.7019 5.7019C10.3114 5.09241 11.138 4.75 12 4.75C12.862 4.75 13.6886 5.09241 14.2981 5.7019C14.9076 6.3114 15.25 7.13805 15.25 8V10.25H8.75V8ZM18.25 18C18.25 18.3315 18.1183 18.6495 17.8839 18.8839C17.6495 19.1183 17.3315 19.25 17 19.25H7C6.66848 19.25 6.35054 19.1183 6.11612 18.8839C5.8817 18.6495 5.75 18.3315 5.75 18V13C5.75 12.6685 5.8817 12.3505 6.11612 12.1161C6.35054 11.8817 6.66848 11.75 7 11.75H17C17.3315 11.75 17.6495 11.8817 17.8839 12.1161C18.1183 12.3505 18.25 12.6685 18.25 13V18Z" fill="black"/>`,
    images: b `<path d="M18.5 3.75H8.5C7.77065 3.75 7.07118 4.03973 6.55546 4.55546C6.03973 5.07118 5.75 5.77065 5.75 6.5V6.75H5.5C4.77065 6.75 4.07118 7.03973 3.55546 7.55546C3.03973 8.07118 2.75 8.77065 2.75 9.5V17.5C2.75 18.2293 3.03973 18.9288 3.55546 19.4445C4.07118 19.9603 4.77065 20.25 5.5 20.25H15.5C16.2293 20.25 16.9288 19.9603 17.4445 19.4445C17.9603 18.9288 18.25 18.2293 18.25 17.5V17.25H18.5C19.2293 17.25 19.9288 16.9603 20.4445 16.4445C20.9603 15.9288 21.25 15.2293 21.25 14.5V6.5C21.25 5.77065 20.9603 5.07118 20.4445 4.55546C19.9288 4.03973 19.2293 3.75 18.5 3.75ZM7.25 6.5C7.25 6.16848 7.3817 5.85054 7.61612 5.61612C7.85054 5.3817 8.16848 5.25 8.5 5.25H18.5C18.8315 5.25 19.1495 5.3817 19.3839 5.61612C19.6183 5.85054 19.75 6.16848 19.75 6.5V12.7L17.48 10.79C17.4061 10.7257 17.3201 10.6768 17.2271 10.646C17.1341 10.6152 17.036 10.6032 16.9383 10.6106C16.8406 10.6181 16.7454 10.6448 16.6581 10.6893C16.5709 10.7339 16.4933 10.7953 16.43 10.87L15.36 12.13L11.36 8.25C11.2961 8.17377 11.2166 8.11204 11.127 8.06893C11.0373 8.02582 10.9395 8.00232 10.84 8C10.737 8.00389 10.6358 8.02898 10.5429 8.07372C10.45 8.11845 10.3673 8.18187 10.3 8.26L7.25 11.89V6.5ZM8.5 15.75C8.16848 15.75 7.85054 15.6183 7.61612 15.3839C7.3817 15.1495 7.25 14.8315 7.25 14.5V14.2L10.92 9.88L14.38 13.27L12.28 15.75H8.5ZM16.75 17.5C16.75 17.8315 16.6183 18.1495 16.3839 18.3839C16.1495 18.6183 15.8315 18.75 15.5 18.75H5.5C5.16848 18.75 4.85054 18.6183 4.61612 18.3839C4.3817 18.1495 4.25 17.8315 4.25 17.5V9.5C4.25 9.16848 4.3817 8.85054 4.61612 8.61612C4.85054 8.3817 5.16848 8.25 5.5 8.25H5.75V14.5C5.75 15.2293 6.03973 15.9288 6.55546 16.4445C7.07118 16.9603 7.77065 17.25 8.5 17.25H16.75V17.5ZM18.5 15.75H14.25L17.09 12.41L19.72 14.64C19.6903 14.9433 19.549 15.2247 19.3236 15.4298C19.0982 15.6349 18.8047 15.749 18.5 15.75Z" fill="black"/>`,
    times: b `<path d="M13.06 12L17.48 7.57999C17.5537 7.51133 17.6128 7.42853 17.6538 7.33653C17.6948 7.24453 17.7168 7.14521 17.7186 7.04451C17.7204 6.94381 17.7018 6.84378 17.6641 6.75039C17.6264 6.657 17.5703 6.57217 17.499 6.50095C17.4278 6.42973 17.343 6.37359 17.2496 6.33587C17.1562 6.29815 17.0562 6.27962 16.9555 6.2814C16.8548 6.28317 16.7555 6.30522 16.6635 6.34621C16.5715 6.3872 16.4887 6.4463 16.42 6.51999L12 10.94L7.58 6.51999C7.43782 6.38751 7.24978 6.31539 7.05548 6.31881C6.86118 6.32224 6.67579 6.40095 6.53838 6.53837C6.40096 6.67578 6.32225 6.86117 6.31882 7.05547C6.3154 7.24977 6.38752 7.43781 6.52 7.57999L10.94 12L6.52 16.42C6.37955 16.5606 6.30066 16.7512 6.30066 16.95C6.30066 17.1487 6.37955 17.3394 6.52 17.48C6.66062 17.6204 6.85125 17.6993 7.05 17.6993C7.24875 17.6993 7.43937 17.6204 7.58 17.48L12 13.06L16.42 17.48C16.5606 17.6204 16.7512 17.6993 16.95 17.6993C17.1488 17.6993 17.3394 17.6204 17.48 17.48C17.6204 17.3394 17.6993 17.1487 17.6993 16.95C17.6993 16.7512 17.6204 16.5606 17.48 16.42L13.06 12Z" fill="black"/>`,
    up: b `<path d="M32.3046 19.3445L18.9693 3.97623C18.8488 3.83716 18.6998 3.72563 18.5324 3.6492C18.3649 3.57276 18.1831 3.5332 17.999 3.5332C17.815 3.5332 17.6331 3.57276 17.4657 3.6492C17.2983 3.72563 17.1492 3.83716 17.0287 3.97623L3.69746 19.3445C3.65717 19.3909 3.63105 19.4478 3.62221 19.5085C3.61336 19.5693 3.62217 19.6313 3.64757 19.6872C3.67297 19.7431 3.7139 19.7905 3.76549 19.8237C3.81707 19.857 3.87714 19.8748 3.93853 19.8749H7.19299C7.37781 19.8749 7.5546 19.7945 7.67915 19.6539L16.4742 9.51685V32.1414C16.4742 32.3182 16.6189 32.4628 16.7957 32.4628H19.2064C19.3832 32.4628 19.5278 32.3182 19.5278 32.1414V9.51685L28.3229 19.6539C28.4434 19.7945 28.6202 19.8749 28.8091 19.8749H32.0635C32.3367 19.8749 32.4854 19.5535 32.3046 19.3445Z" fill="#111111"/>`,
    down: b `<path d="M32.0621 16.1255H28.8076C28.6228 16.1255 28.446 16.2059 28.3215 16.3465L19.5264 26.4836V3.85903C19.5264 3.68224 19.3817 3.5376 19.2049 3.5376H16.7942C16.6174 3.5376 16.4728 3.68224 16.4728 3.85903V26.4836L7.6777 16.3465C7.55717 16.2059 7.38038 16.1255 7.19154 16.1255H3.93708C3.66386 16.1255 3.5152 16.451 3.69601 16.6559L17.0313 32.0242C17.1518 32.1633 17.3008 32.2748 17.4683 32.3512C17.6357 32.4277 17.8176 32.4672 18.0016 32.4672C18.1856 32.4672 18.3675 32.4277 18.5349 32.3512C18.7023 32.2748 18.8514 32.1633 18.9719 32.0242L32.3032 16.6559C32.484 16.447 32.3353 16.1255 32.0621 16.1255Z" fill="#111111"/>`,
    width: b `<path d="M4.66133 4.5H2.25061C2.07383 4.5 1.92918 4.64464 1.92918 4.82143V31.1786C1.92918 31.3554 2.07383 31.5 2.25061 31.5H4.66133C4.83811 31.5 4.98276 31.3554 4.98276 31.1786V4.82143C4.98276 4.64464 4.83811 4.5 4.66133 4.5ZM33.7506 4.5H31.3399C31.1631 4.5 31.0185 4.64464 31.0185 4.82143V31.1786C31.0185 31.3554 31.1631 31.5 31.3399 31.5H33.7506C33.9274 31.5 34.072 31.3554 34.072 31.1786V4.82143C34.072 4.64464 33.9274 4.5 33.7506 4.5ZM28.9814 17.6906L23.8546 13.6446C23.8117 13.6109 23.7602 13.5899 23.7059 13.5841C23.6517 13.5783 23.5969 13.5879 23.5478 13.6118C23.4987 13.6357 23.4574 13.673 23.4285 13.7193C23.3997 13.7656 23.3844 13.8191 23.3845 13.8737V16.5536H12.6167V14.0304C12.6167 13.7893 12.3354 13.6527 12.1466 13.8013L7.01981 17.8513C6.98512 17.8781 6.95703 17.9125 6.93771 17.9519C6.91838 17.9913 6.90833 18.0345 6.90833 18.0784C6.90833 18.1222 6.91838 18.1654 6.93771 18.2048C6.95703 18.2442 6.98512 18.2786 7.01981 18.3054L12.1426 22.3554C12.3314 22.504 12.6127 22.3714 12.6127 22.1263V19.4464H23.3805V21.9696C23.3805 22.2107 23.6618 22.3473 23.8506 22.1987L28.9734 18.1487C29.1261 18.0321 29.1261 17.8071 28.9814 17.6906Z" fill="#111111"/>`,
    height: b `<path d="M31.1786 31.0141H4.82143C4.64464 31.0141 4.5 31.1587 4.5 31.3355V33.7462C4.5 33.923 4.64464 34.0677 4.82143 34.0677H31.1786C31.3554 34.0677 31.5 33.923 31.5 33.7462V31.3355C31.5 31.1587 31.3554 31.0141 31.1786 31.0141ZM31.1786 1.9248H4.82143C4.64464 1.9248 4.5 2.06945 4.5 2.24623V4.65695C4.5 4.83373 4.64464 4.97838 4.82143 4.97838H31.1786C31.3554 4.97838 31.5 4.83373 31.5 4.65695V2.24623C31.5 2.06945 31.3554 1.9248 31.1786 1.9248ZM21.9696 12.6123C22.2107 12.6123 22.3473 12.3311 22.1987 12.1422L18.1487 7.01543C18.1219 6.98074 18.0875 6.95265 18.0481 6.93333C18.0088 6.914 17.9655 6.90395 17.9217 6.90395C17.8778 6.90395 17.8346 6.914 17.7952 6.93333C17.7558 6.95265 17.7214 6.98074 17.6946 7.01543L13.6446 12.1422C13.6109 12.1851 13.5899 12.2366 13.5841 12.2909C13.5783 12.3452 13.5879 12.4 13.6118 12.449C13.6357 12.4981 13.673 12.5394 13.7193 12.5683C13.7656 12.5972 13.8191 12.6124 13.8737 12.6123H16.5536V23.3802H14.0304C13.7893 23.3802 13.6527 23.6614 13.8013 23.8503L17.8513 28.973C17.9679 29.1217 18.1929 29.1217 18.3054 28.973L22.3554 23.8503C22.504 23.6614 22.3714 23.3802 22.1263 23.3802H19.4464V12.6123H21.9696Z" fill="#111111"/>`,
};

class CopyButton extends TWElement {
    constructor() {
        super(...arguments);
        this.showpopup = false;
        this.popup = () => x `<div class="absolute border border-zinc-200 bg-white p-1">Value copied to clipboard!</div>`;
    }
    toclipboard() {
        navigator.clipboard.writeText(this.copyvalue);
        this.showpopup = true;
        window.setTimeout(() => (this.showpopup = false), 2000);
    }
    render() {
        return x `<div class="inline-flex items-bottom relative"><svg class="w-4 h-4 ml-1 mr-2 fill-none stroke-zinc-800 cursor-pointer" @click="${this.toclipboard}">${icons$2.copy}</svg><slot>no content to copy</slot></div>${n$3(this.showpopup, this.popup)}`;
    }
}
CopyButton.properties = {
    copyvalue: {},
    showpopup: { state: true },
};
customElements.define("wt-copybutton", CopyButton);

// Original copy from Go’s one


const enosys = () => {
  const err = new Error("not implemented");
  err.code = "ENOSYS";
  return err;
};

if (!globalThis.fs) {
  let outputBuf = "";
  globalThis.fs = {
    constants: {
      O_WRONLY: -1,
      O_RDWR: -1,
      O_CREAT: -1,
      O_TRUNC: -1,
      O_APPEND: -1,
      O_EXCL: -1,
    }, // unused
    writeSync(fd, buf) {
      outputBuf += decoder.decode(buf);
      const nl = outputBuf.lastIndexOf("\n");
      if (nl != -1) {
        console.log(outputBuf.substr(0, nl));
        outputBuf = outputBuf.substr(nl + 1);
      }
      return buf.length;
    },
    write(fd, buf, offset, length, position, callback) {
      if (offset !== 0 || length !== buf.length || position !== null) {
        callback(enosys());
        return;
      }
      const n = this.writeSync(fd, buf);
      callback(null, n);
    },
    chmod(path, mode, callback) {
      callback(enosys());
    },
    chown(path, uid, gid, callback) {
      callback(enosys());
    },
    close(fd, callback) {
      callback(enosys());
    },
    fchmod(fd, mode, callback) {
      callback(enosys());
    },
    fchown(fd, uid, gid, callback) {
      callback(enosys());
    },
    fstat(fd, callback) {
      callback(enosys());
    },
    fsync(fd, callback) {
      callback(null);
    },
    ftruncate(fd, length, callback) {
      callback(enosys());
    },
    lchown(path, uid, gid, callback) {
      callback(enosys());
    },
    link(path, link, callback) {
      callback(enosys());
    },
    lstat(path, callback) {
      callback(enosys());
    },
    mkdir(path, perm, callback) {
      callback(enosys());
    },
    open(path, flags, mode, callback) {
      callback(enosys());
    },
    read(fd, buffer, offset, length, position, callback) {
      callback(enosys());
    },
    readdir(path, callback) {
      callback(enosys());
    },
    readlink(path, callback) {
      callback(enosys());
    },
    rename(from, to, callback) {
      callback(enosys());
    },
    rmdir(path, callback) {
      callback(enosys());
    },
    stat(path, callback) {
      callback(enosys());
    },
    symlink(path, link, callback) {
      callback(enosys());
    },
    truncate(path, length, callback) {
      callback(enosys());
    },
    unlink(path, callback) {
      callback(enosys());
    },
    utimes(path, atime, mtime, callback) {
      callback(enosys());
    },
  };
}

if (!globalThis.process) {
  globalThis.process = {
    getuid() {
      return -1;
    },
    getgid() {
      return -1;
    },
    geteuid() {
      return -1;
    },
    getegid() {
      return -1;
    },
    getgroups() {
      throw enosys();
    },
    pid: -1,
    ppid: -1,
    umask() {
      throw enosys();
    },
    cwd() {
      throw enosys();
    },
    chdir() {
      throw enosys();
    },
  };
}

if (!globalThis.crypto) {
  throw new Error(
    "globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)",
  );
}

if (!globalThis.performance) {
  throw new Error(
    "globalThis.performance is not available, polyfill required (performance.now only)",
  );
}

if (!globalThis.TextEncoder) {
  throw new Error("globalThis.TextEncoder is not available, polyfill required");
}

if (!globalThis.TextDecoder) {
  throw new Error("globalThis.TextDecoder is not available, polyfill required");
}

const encoder = new TextEncoder("utf-8");
const decoder = new TextDecoder("utf-8");

class Go {
  constructor(argv = [], env = {}, scope = globalThis) {
    this.argv = ["js", ...argv];
    this.env = env;
    this.scope = scope;
    this.exit = (code) => {
      if (code !== 0) {
        console.warn("exit code:", code);
      }
    };
    this._exitPromise = new Promise((resolve) => {
      this._resolveExitPromise = resolve;
    });
    this._pendingEvent = null;
    this._scheduledTimeouts = new Map();
    this._nextCallbackTimeoutID = 1;

    const setInt64 = (addr, v) => {
      this.mem.setUint32(addr + 0, v, true);
      this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
    };

    const getInt64 = (addr) => {
      const low = this.mem.getUint32(addr + 0, true);
      const high = this.mem.getInt32(addr + 4, true);
      return low + high * 4294967296;
    };

    const loadValue = (addr) => {
      const f = this.mem.getFloat64(addr, true);
      if (f === 0) {
        return undefined;
      }
      if (!isNaN(f)) {
        return f;
      }

      const id = this.mem.getUint32(addr, true);
      return this._values[id];
    };

    const storeValue = (addr, v) => {
      const nanHead = 0x7ff80000;

      if (typeof v === "number" && v !== 0) {
        if (isNaN(v)) {
          this.mem.setUint32(addr + 4, nanHead, true);
          this.mem.setUint32(addr, 0, true);
          return;
        }
        this.mem.setFloat64(addr, v, true);
        return;
      }

      if (v === undefined) {
        this.mem.setFloat64(addr, 0, true);
        return;
      }

      let id = this._ids.get(v);
      if (id === undefined) {
        id = this._idPool.pop();
        if (id === undefined) {
          id = this._values.length;
        }
        this._values[id] = v;
        this._goRefCounts[id] = 0;
        this._ids.set(v, id);
      }
      this._goRefCounts[id]++;
      let typeFlag = 0;
      switch (typeof v) {
        case "object":
          if (v !== null) {
            typeFlag = 1;
          }
          break;
        case "string":
          typeFlag = 2;
          break;
        case "symbol":
          typeFlag = 3;
          break;
        case "function":
          typeFlag = 4;
          break;
      }
      this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
      this.mem.setUint32(addr, id, true);
    };

    const loadSlice = (addr) => {
      const array = getInt64(addr + 0);
      const len = getInt64(addr + 8);
      return new Uint8Array(this._inst.exports.mem.buffer, array, len);
    };

    const loadSliceOfValues = (addr) => {
      const array = getInt64(addr + 0);
      const len = getInt64(addr + 8);
      const a = new Array(len);
      for (let i = 0; i < len; i++) {
        a[i] = loadValue(array + i * 8);
      }
      return a;
    };

    const loadString = (addr) => {
      const saddr = getInt64(addr + 0);
      const len = getInt64(addr + 8);
      return decoder.decode(
        new DataView(this._inst.exports.mem.buffer, saddr, len),
      );
    };

    const timeOrigin = Date.now() - performance.now();
    this.importObject = {
      gojs: {
        // Go's SP does not change as long as no Go code is running. Some operations (e.g. calls, getters and setters)
        // may synchronously trigger a Go event handler. This makes Go code get executed in the middle of the imported
        // function. A goroutine can switch to a new stack if the current stack is too small (see morestack function).
        // This changes the SP, thus we have to update the SP used by the imported function.

        // func wasmExit(code int32)
        "runtime.wasmExit": (sp) => {
          sp >>>= 0;
          const code = this.mem.getInt32(sp + 8, true);
          this.exited = true;
          delete this._inst;
          delete this._values;
          delete this._goRefCounts;
          delete this._ids;
          delete this._idPool;
          this.exit(code);
        },

        // func wasmWrite(fd uintptr, p unsafe.Pointer, n int32)
        "runtime.wasmWrite": (sp) => {
          sp >>>= 0;
          const fd = getInt64(sp + 8);
          const p = getInt64(sp + 16);
          const n = this.mem.getInt32(sp + 24, true);
          fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
        },

        // func resetMemoryDataView()
        "runtime.resetMemoryDataView": (sp) => {
          this.mem = new DataView(this._inst.exports.mem.buffer);
        },

        // func nanotime1() int64
        "runtime.nanotime1": (sp) => {
          sp >>>= 0;
          setInt64(sp + 8, (timeOrigin + performance.now()) * 1000000);
        },

        // func walltime() (sec int64, nsec int32)
        "runtime.walltime": (sp) => {
          sp >>>= 0;
          const msec = new Date().getTime();
          setInt64(sp + 8, msec / 1000);
          this.mem.setInt32(sp + 16, (msec % 1000) * 1000000, true);
        },

        // func scheduleTimeoutEvent(delay int64) int32
        "runtime.scheduleTimeoutEvent": (sp) => {
          sp >>>= 0;
          const id = this._nextCallbackTimeoutID;
          this._nextCallbackTimeoutID++;
          this._scheduledTimeouts.set(
            id,
            setTimeout(
              () => {
                this._resume();
                while (this._scheduledTimeouts.has(id)) {
                  // for some reason Go failed to register the timeout event, log and try again
                  // (temporary workaround for https://github.com/golang/go/issues/28975)
                  console.warn("scheduleTimeoutEvent: missed timeout event");
                  this._resume();
                }
              },
              getInt64(sp + 8), // setTimeout has been seen to fire up to 1 millisecond early
            ),
          );
          this.mem.setInt32(sp + 16, id, true);
        },

        // func clearTimeoutEvent(id int32)
        "runtime.clearTimeoutEvent": (sp) => {
          sp >>>= 0;
          const id = this.mem.getInt32(sp + 8, true);
          clearTimeout(this._scheduledTimeouts.get(id));
          this._scheduledTimeouts.delete(id);
        },

        // func getRandomData(r []byte)
        "runtime.getRandomData": (sp) => {
          sp >>>= 0;
          crypto.getRandomValues(loadSlice(sp + 8));
        },

        // func finalizeRef(v ref)
        "syscall/js.finalizeRef": (sp) => {
          sp >>>= 0;
          const id = this.mem.getUint32(sp + 8, true);
          this._goRefCounts[id]--;
          if (this._goRefCounts[id] === 0) {
            const v = this._values[id];
            this._values[id] = null;
            this._ids.delete(v);
            this._idPool.push(id);
          }
        },

        // func stringVal(value string) ref
        "syscall/js.stringVal": (sp) => {
          sp >>>= 0;
          storeValue(sp + 24, loadString(sp + 8));
        },

        // func valueGet(v ref, p string) ref
        "syscall/js.valueGet": (sp) => {
          sp >>>= 0;
          const result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
          sp = this._inst.exports.getsp() >>> 0; // see comment above
          storeValue(sp + 32, result);
        },

        // func valueSet(v ref, p string, x ref)
        "syscall/js.valueSet": (sp) => {
          sp >>>= 0;
          Reflect.set(
            loadValue(sp + 8),
            loadString(sp + 16),
            loadValue(sp + 32),
          );
        },

        // func valueDelete(v ref, p string)
        "syscall/js.valueDelete": (sp) => {
          sp >>>= 0;
          Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
        },

        // func valueIndex(v ref, i int) ref
        "syscall/js.valueIndex": (sp) => {
          sp >>>= 0;
          storeValue(
            sp + 24,
            Reflect.get(loadValue(sp + 8), getInt64(sp + 16)),
          );
        },

        // valueSetIndex(v ref, i int, x ref)
        "syscall/js.valueSetIndex": (sp) => {
          sp >>>= 0;
          Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
        },

        // func valueCall(v ref, m string, args []ref) (ref, bool)
        "syscall/js.valueCall": (sp) => {
          sp >>>= 0;
          try {
            const v = loadValue(sp + 8);
            const m = Reflect.get(v, loadString(sp + 16));
            const args = loadSliceOfValues(sp + 32);
            const result = Reflect.apply(m, v, args);
            sp = this._inst.exports.getsp() >>> 0; // see comment above
            storeValue(sp + 56, result);
            this.mem.setUint8(sp + 64, 1);
          } catch (err) {
            sp = this._inst.exports.getsp() >>> 0; // see comment above
            storeValue(sp + 56, err);
            this.mem.setUint8(sp + 64, 0);
          }
        },

        // func valueInvoke(v ref, args []ref) (ref, bool)
        "syscall/js.valueInvoke": (sp) => {
          sp >>>= 0;
          try {
            const v = loadValue(sp + 8);
            const args = loadSliceOfValues(sp + 16);
            const result = Reflect.apply(v, undefined, args);
            sp = this._inst.exports.getsp() >>> 0; // see comment above
            storeValue(sp + 40, result);
            this.mem.setUint8(sp + 48, 1);
          } catch (err) {
            sp = this._inst.exports.getsp() >>> 0; // see comment above
            storeValue(sp + 40, err);
            this.mem.setUint8(sp + 48, 0);
          }
        },

        // func valueNew(v ref, args []ref) (ref, bool)
        "syscall/js.valueNew": (sp) => {
          sp >>>= 0;
          try {
            const v = loadValue(sp + 8);
            const args = loadSliceOfValues(sp + 16);
            const result = Reflect.construct(v, args);
            sp = this._inst.exports.getsp() >>> 0; // see comment above
            storeValue(sp + 40, result);
            this.mem.setUint8(sp + 48, 1);
          } catch (err) {
            sp = this._inst.exports.getsp() >>> 0; // see comment above
            storeValue(sp + 40, err);
            this.mem.setUint8(sp + 48, 0);
          }
        },

        // func valueLength(v ref) int
        "syscall/js.valueLength": (sp) => {
          sp >>>= 0;
          setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
        },

        // valuePrepareString(v ref) (ref, int)
        "syscall/js.valuePrepareString": (sp) => {
          sp >>>= 0;
          const str = encoder.encode(String(loadValue(sp + 8)));
          storeValue(sp + 16, str);
          setInt64(sp + 24, str.length);
        },

        // valueLoadString(v ref, b []byte)
        "syscall/js.valueLoadString": (sp) => {
          sp >>>= 0;
          const str = loadValue(sp + 8);
          loadSlice(sp + 16).set(str);
        },

        // func valueInstanceOf(v ref, t ref) bool
        "syscall/js.valueInstanceOf": (sp) => {
          sp >>>= 0;
          this.mem.setUint8(
            sp + 24,
            loadValue(sp + 8) instanceof loadValue(sp + 16) ? 1 : 0,
          );
        },

        // func copyBytesToGo(dst []byte, src ref) (int, bool)
        "syscall/js.copyBytesToGo": (sp) => {
          sp >>>= 0;
          const dst = loadSlice(sp + 8);
          const src = loadValue(sp + 32);
          if (
            !(src instanceof Uint8Array || src instanceof Uint8ClampedArray)
          ) {
            this.mem.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          setInt64(sp + 40, toCopy.length);
          this.mem.setUint8(sp + 48, 1);
        },

        // func copyBytesToJS(dst ref, src []byte) (int, bool)
        "syscall/js.copyBytesToJS": (sp) => {
          sp >>>= 0;
          const dst = loadValue(sp + 8);
          const src = loadSlice(sp + 16);
          if (
            !(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)
          ) {
            this.mem.setUint8(sp + 48, 0);
            return;
          }
          const toCopy = src.subarray(0, dst.length);
          dst.set(toCopy);
          setInt64(sp + 40, toCopy.length);
          this.mem.setUint8(sp + 48, 1);
        },

        debug: (value) => {
          console.debug(value);
        },
      },
    };
  }

  async run(instance, trip) {
    if (!(instance instanceof WebAssembly.Instance)) {
      throw new Error("Go.run: WebAssembly.Instance expected");
    }
    this._inst = instance;
    this.mem = new DataView(this._inst.exports.mem.buffer);
    this._values = [
      // JS values that Go currently has references to, indexed by reference id
      NaN,
      0,
      null,
      true,
      false,
      globalThis,
      this,
    ];
    this._goRefCounts = new Array(this._values.length).fill(Infinity); // number of references that Go has to a JS value, indexed by reference id
    this._ids = new Map([
      // mapping from JS values to reference ids
      [0, 1],
      [null, 2],
      [true, 3],
      [false, 4],
      [globalThis, 5],
      [this, 6],
    ]);
    this._idPool = []; // unused ids that have been garbage collected
    this.exited = false; // whether the Go program has exited

    // Pass command line arguments and environment variables to WebAssembly by writing them to the linear memory.
    let offset = 4096;

    const strPtr = (str) => {
      const ptr = offset;
      const bytes = encoder.encode(str + "\0");
      new Uint8Array(this.mem.buffer, offset, bytes.length).set(bytes);
      offset += bytes.length;
      if (offset % 8 !== 0) {
        offset += 8 - (offset % 8);
      }
      return ptr;
    };

    const argc = this.argv.length;

    const argvPtrs = [];
    this.argv.forEach((arg) => {
      argvPtrs.push(strPtr(arg));
    });
    argvPtrs.push(0);

    const keys = Object.keys(this.env).sort();
    keys.forEach((key) => {
      argvPtrs.push(strPtr(`${key}=${this.env[key]}`));
    });
    argvPtrs.push(0);

    const argv = offset;
    argvPtrs.forEach((ptr) => {
      this.mem.setUint32(offset, ptr, true);
      this.mem.setUint32(offset + 4, 0, true);
      offset += 8;
    });

    // The linker guarantees global data starts from at least wasmMinDataAddr.
    // Keep in sync with cmd/link/internal/ld/data.go:wasmMinDataAddr.
    const wasmMinDataAddr = 4096 + 8192;
    if (offset >= wasmMinDataAddr) {
      throw new Error(
        "total length of command line and environment variables exceeds limit",
      );
    }

    this._inst.exports.run(argc, argv);
    if (this.exited) {
      this._resolveExitPromise();
    }
    trip();
    await this._exitPromise;
  }

  _resume() {
    if (this.exited) {
      throw new Error("Go program has already exited");
    }
    this._inst.exports.resume();
    if (this.exited) {
      this._resolveExitPromise();
    }
  }

  _makeFuncWrapper(id) {
    const go = this;
    return function () {
      const event = { id: id, this: this, args: arguments };
      go._pendingEvent = event;
      go._resume();
      return event.result;
    };
  }
}

// Code generated by "rxabi -type IntentType"; DO NOT EDIT.
// This file should be tracked by the version manager
var IntentType;
(function (IntentType) {
    IntentType[IntentType["NoIntent"] = 0] = "NoIntent";
    IntentType[IntentType["Click"] = 1] = "Click";
    IntentType[IntentType["DoubleClick"] = 2] = "DoubleClick";
    IntentType[IntentType["DragStart"] = 3] = "DragStart";
    IntentType[IntentType["DragOver"] = 4] = "DragOver";
    IntentType[IntentType["DragEnd"] = 5] = "DragEnd";
    IntentType[IntentType["Drop"] = 6] = "Drop";
    IntentType[IntentType["EscPress"] = 7] = "EscPress";
    IntentType[IntentType["Scroll"] = 8] = "Scroll";
    IntentType[IntentType["Filter"] = 9] = "Filter";
    IntentType[IntentType["Change"] = 10] = "Change";
    IntentType[IntentType["Blur"] = 11] = "Blur";
    IntentType[IntentType["ChangeView"] = 12] = "ChangeView";
    IntentType[IntentType["CellIDChange"] = 13] = "CellIDChange";
    IntentType[IntentType["ShowDebugMenu"] = 14] = "ShowDebugMenu";
    IntentType[IntentType["Seppuku"] = 15] = "Seppuku";
})(IntentType || (IntentType = {}));

let flags = null;
let singleflight = null;
async function fetchFlags() {
    if (singleflight !== null) {
        return await singleflight;
    }
    const res = () => { };
    singleflight = new Promise(res);
    const rsp = (await fetch("/info", { method: "HEAD" })).headers.get("X-Feature-Flags") || "";
    flags = {};
    for (const f of rsp.split(",")) {
        flags[f] = true;
    }
}
async function hasFlag(name) {
    if (!flags) {
        await fetchFlags();
    }
    return name in flags;
}
async function listFlags() {
    if (!flags) {
        await fetchFlags();
    }
    return flags;
}

/** dist is the Eucledian distance of two points */
const dist = ([x1, y1], [x2, y2]) => {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return Math.sqrt(dx * dx + dy * dy);
};
/**
 * Projecting onto a DOM rectangle,
 * that is always made of horizontal and vertical lines
 * This simplifies the generic algorithm a lot
 */
function projectToRectSide(p, [l1, l2]) {
    const [px, py] = p;
    const [l1x, l1y] = l1;
    const [l2x, l2y] = l2;
    const vert = Math.abs(l1x - l2x) < 10e-4;
    const horiz = Math.abs(l1y - l2y) < 10e-4;
    if (vert) {
        const x = l1x;
        // we are in reversed coordinates in the DOM, but we don't care for this computation
        const by = Math.min(l1y, l2y);
        const ty = Math.max(l1y, l2y);
        // top point
        if (py > ty)
            return [x, ty];
        // bottom point
        if (py < by)
            return [x, by];
        // project on segment = keep point y but use vert segment x
        return [x, py];
    }
    else if (horiz) {
        // horiz
        const y = l1y;
        const lx = Math.min(l1x, l2x);
        const rx = Math.max(l1x, l2x);
        // left point
        if (px < lx)
            return [lx, y];
        // right point
        if (px > rx)
            return [rx, y];
        // project on segment = keep point x but use horiz segment y
        return [px, y];
    }
    else {
        console.error("Tried to project on a segment that is not a vertical or horizontal side of a rectangle. Return the segment center.");
        return [(l1x + l2x) / 2, (l1y + l2y) / 2];
    }
}
/**
 * Distance to the closest point to the rectangle bounds
 *
 * Gives the point that feels the closest to a block by a human user when clicking
 * as opposed to distance to the rectangle center that is an overestimation
 */
const distanceToRectBounds = (p, rect) => {
    const bl = [rect.left, rect.bottom];
    const br = [rect.right, rect.bottom];
    const tr = [rect.right, rect.top];
    const tl = [rect.left, rect.top];
    const segments = [
        [bl, br],
        [br, tr],
        [tr, tl],
        [tl, bl],
    ];
    const closestPoints = segments.map((s) => projectToRectSide(p, s));
    const distances = closestPoints.map((c) => dist(p, c));
    return Math.min(...distances);
};

function findClosestElement(possibleElements, x, y) {
    let closestElement = null;
    let minDistance = +Infinity;
    for (const elem of possibleElements) {
        const rects = elem.getClientRects();
        for (const rect of rects) {
            const d = distanceToRectBounds([x, y], rect);
            if (d < minDistance) {
                minDistance = d;
                closestElement = elem;
            }
        }
    }
    if (!closestElement) {
        throw new Error("Couldn't get closestElement");
    }
    return closestElement;
}
const notInLioLi = -1;
/**
 * locateEntity finds the closest element that raised the issue.
 * This is done through a mix of geometric and tree walking:
 *
 *  1. The algoritm look up from the element under the mouse pointer
 *  2. If the HTML node is a Lioli element (annotated with a `data-offset` attribute), it is returned
 *  3. If the HTML node is a Lioli record (annotated with a `data-record` attribute),
 *     then the lioli element located closest (in geometrical term) to the pointer is returned
 *  4. If the node is an entity (has an id), it is returned
 *
 * @see https://developer.mozilla.org/fr/docs/Web/API/Document/elementsFromPoint
 */
const locateEntity = async (x, y, doc = document, pdbgArg) => {
    const nodes = doc.elementsFromPoint(x, y);
    const pdbg = pdbgArg || ((await hasFlag("visualdebug")) ? visualdebug : nopDebugger);
    pdbg.init();
    let offsetElement = null;
    for (const n of nodes) {
        await pdbg.debug(n);
        if ("offset" in n.dataset) {
            // easy case: we got a direct hit on a LioLi member
            offsetElement = n;
            break;
        }
        else if ("record" in n.dataset) {
            // more interesting case: click happened somewhere in the paragraph containing the record
            // use min distance to locate the element
            const possibleElements = n.querySelectorAll("[data-offset]");
            if (!possibleElements.length) {
                console.warn("Warning: found a record with no selectable element, was it parsed correctlty?", { n });
                return null;
            }
            offsetElement = findClosestElement(possibleElements, x, y);
            break;
        }
        else if (n.id !== "") {
            // clicked an entity (or child of an entity) that is not a record or a node of a record
            // -> click events should be associated to this entity, return now
            return [n, notInLioLi];
        }
    }
    // clicked something that is neither part of the lioli or a known entity, nothing to do
    if (!offsetElement) {
        return null;
    }
    const offset = offsetElement.dataset["offset"];
    if (!offset) {
        throw new Error(`Selected element has no offset`);
    }
    const position = parseInt(offset);
    await pdbg.debug(offsetElement, position);
    return [offsetElement, position];
};
const nopDebugger = {
    init() { },
    async debug() { },
};
const visualdebug = {
    init() {
        this.debugClassName = "debug-node";
        this.viz = document.createElement("p");
        this.viz.classList.add(this.debugClassName, "bg-orange-700", "p-1", "absolute", "-top-3", "-left-1");
    },
    async debug(node, position) {
        const isDebugNode = node.classList.contains(this.debugClassName);
        if (isDebugNode) {
            return;
        }
        console.warn("visual debugger can add temporary nodes in the DOM, remember this fact when inspecting the DOM");
        node.classList.add("border", "border-orange-700", "relative");
        this.viz.innerText = position || "";
        // appending multiple times is a noop (will just move the node)
        node.appendChild(this.viz);
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        try {
            node.removeChild(this.viz);
        }
        catch (err) {
            // if appending multiple times, we can remove only once
            // a NotFoundError is normal here
            if (err.name !== "NotFoundError") {
                throw err;
            }
        }
        node.classList.remove("border", "border-orange-700", "relative");
    },
};

const PIVOT_DATA = "pivotcreation";
function pivotLabel(p) {
    return p.name || p.value;
}
const getPivotDragData = (ev) => {
    const pl = ev.dataTransfer?.getData(PIVOT_DATA);
    if (!pl) {
        return null;
    }
    return JSON.parse(pl);
};
const hasPivotData = (ev) => {
    return !!ev.dataTransfer?.types.includes(PIVOT_DATA);
};
const setPivotDragData = (ev, data) => {
    if (!ev.dataTransfer) {
        throw new Error("setPivotCreationData can only be called in a dragStart event");
    }
    ev.dataTransfer.clearData();
    ev.dataTransfer.effectAllowed = "copy";
    // using a custom format let's us check the validity of the drop during dragover/dragenter
    // @see https://stackoverflow.com/questions/28487352/dragndrop-datatransfer-getdata-empty
    ev.dataTransfer.setData(PIVOT_DATA, data);
};
function setPivotDragImage(ev, data /*PivotPiQLQuery*/) {
    if (!ev.dataTransfer) {
        throw new Error("setPivotCreationDragImage can only be called in a dragStart event");
    }
    // add some logic for a nice dragImage
    const dragImage = document.createElement("span");
    dragImage.dataset.testId = "dragImage-pivotcreation";
    dragImage.className =
        "bg-zinc-50 text-zinc-200 rounded-sm px-1" + " dragImage-" + PIVOT_DATA;
    const max = 60;
    const text = pivotLabel(data);
    const shortText = text.length < max ? text : text.slice(0, max - 3) + "...";
    dragImage.textContent = shortText;
    document.body.appendChild(dragImage);
    const imageRect = dragImage.getBoundingClientRect();
    ev.dataTransfer.setDragImage(dragImage, imageRect.width / 2, imageRect.height / 2);
}
/**
 * Noop if there is nothing to remove
 * To be called on dragend for element that can receive a pivot
 * @param {*} ev
 */
function removePivotDragImage() {
    document.querySelectorAll(".dragImage-" + PIVOT_DATA).forEach((e) => {
        document.body.removeChild(e);
    });
}

/**
 * acceptDrop prevents the drag event propagation, optionally only if pred is provided.
 * This has the effect of allowing the drag event to happen.
 * Return whether the event was accepted or not
 */
function acceptDrop(e, pred) {
    if (!pred || pred(e)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return true;
    }
    return false;
}

// Code generated by "rxabi -type OpType"; DO NOT EDIT.
// This file should be tracked by the version manager
var OpType;
(function (OpType) {
    OpType[OpType["OpTerm"] = 0] = "OpTerm";
    OpType[OpType["OpCreateElement"] = 1] = "OpCreateElement";
    OpType[OpType["OpSetClass"] = 2] = "OpSetClass";
    OpType[OpType["OpSetID"] = 3] = "OpSetID";
    OpType[OpType["OpSetAttr"] = 4] = "OpSetAttr";
    OpType[OpType["OpAddText"] = 5] = "OpAddText";
    OpType[OpType["OpReuse"] = 6] = "OpReuse";
    OpType[OpType["OpReID"] = 7] = "OpReID";
    OpType[OpType["OpNext"] = 8] = "OpNext";
})(OpType || (OpType = {}));

const CHUNK_SIZE = 400;
// openPipe is the Javascript end of the stream
// the stream is pull-triggered
globalThis.trout_sftw_openPipe = (readInto) => new ReadableStream({
    async pull(c) {
        if (!c.byobRequest) {
            throw new Error("this stream should only work with byob");
        }
        const v = c.byobRequest.view;
        if (v == null) {
            throw Error("empty byob view");
        }
        const buf = new Uint8Array(v.buffer, v.byteOffset, v.byteLength);
        const sz = await new Promise((resolve) => readInto(buf, resolve));
        if (sz >= 0) {
            c.byobRequest.respond(sz);
        }
        else {
            c.close();
        }
    },
    autoAllocateChunkSize: CHUNK_SIZE,
    // TODO(rdo) cancel
    type: "bytes",
});
const triggerDownload = async (name, content) => {
    // need to realize stream apparently :shrug:
    const rdr = content.getReader();
    const pump = new ReadableStream({
        start(ctrl) {
            return pump();
            async function pump() {
                const { done, value } = await rdr.read();
                if (done) {
                    ctrl.close();
                    return;
                }
                ctrl.enqueue(value);
                return pump();
            }
        }
    });
    const res = new Response(pump);
    const blob = await res.blob();
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name || "";
    document.body.appendChild(a);
    a.click();
    a.remove();
};

/**
 * @param evtName
 * @returns A typed function that dispatches a custom event
 * @example
 * const dispatchToggleView = customEventDispatcher<{view: "table" | "text"}>("wt-toggle-view")
 * // in viewtoggle.ts
 * dispatchToggleView({view:"table"})
 * // in notebook.ts
 * document.addEventListener("wt-toggle-view", (evt) => {
 *      console.log("Got details:", evt.detail)
 * })
 */
function customEventDispatcher(evtName) {
    const dispatchCustomEvent = (detail, target) => {
        const evt = new CustomEvent(evtName, {
            bubbles: true, composed: true,
            detail
        });
        const _target = target || window;
        _target.dispatchEvent(evt);
    };
    return dispatchCustomEvent;
}

const manifestChangeEvt = "manifest-change";
const dispatchManifestChange = customEventDispatcher(manifestChangeEvt);

const WASM_URL = "/assets/rxnb.wasm"; // per server configuration
const DEBOUNCE_TIMEOUT = 60; // ms time range. Tuned to ~1 event / rendering cycle at 16 fps
const RequestPProfEvent = "request-pprof";
const DebugGrammarEvent = "debug-grammar";
/**
 * DataCell is the wrapper around the Go WASM code.
 * It works as a shim to collect events and viewport information,
 * then pass to the engine for rendering.
 *
 * # Concurrency model
 *
 * The view is protected by an optimistic locking scheme:
 * an event is only processed if from the current gen.
 *
 * This guaranties that the tree structure in the view is the same than the one which raises the event.
 * Other properties (mouse position, viewport, scroll, …) are not tracked, and should be captured in the handler if desired.
 *
 * Note that changes to the gen can happen from Go, without JS calls:
 * this is the case when the network triggers the change.
 */
class DataCell extends HTMLElement {
    constructor() {
        super();
        this.gen = 0;
        this.debounce = false; // protects debounce process
        this.mxevent = false; // protects event loop task
        this.running = true;
        this.modifiers = [false, false, false];
        // note: this probably will need hoisting the manifest so we can update it without conflict
        this.updateManifest = (mfst) => {
            this.setAttribute("manifest", mfst);
            dispatchManifestChange(mfst, this);
        };
        this.loopCell = async (args) => {
            let finalCountDown = 20; // tadada ta, tadada da da da
            while (this.running && finalCountDown > 0) {
                finalCountDown--;
                this.go = new Go(args, {
                    // keep the localStorage item name to lowercase "debug"
                    // for consistency with NPM "debug" package
                    DEBUG: localStorage.getItem("debug"),
                    FLAGS: Object.keys(await listFlags()).join(","),
                    LOGLEVEL: localStorage.getItem("LOGLEVEL") || "",
                    WIDTH: window.screen.width.toString(),
                    HEIGHT: window.screen.height.toString(),
                    // trace gc action to prevent stop-the-world problems
                    GODEBUG: "gctrace=1",
                }, this);
                await DataCell.module
                    .then((module) => WebAssembly.instantiate(module, this.go.importObject))
                    .then((obj) => this.go.run(obj, this._tripModule));
                this.activeModule = new Promise((resolve) => {
                    this._tripModule = resolve;
                });
            }
        };
        /**
         * buildView is called by the Go code each time the view needs to be updated.
         *
         * instructions to rebuild the view are given in parr, following the XAS virtual machine format.
         * all operatiors are done in a document fragment, avoiding conflict with the existing nodes.
         */
        this.buildView = (parr) => {
            // Use fat arrow syntax to make sure "this" is bound to instance
            const program = new DataView(parr.buffer);
            // offsets
            const instr_size = 1;
            const str_size = 2;
            const decoder = new TextDecoder("utf-8");
            let ip = 0;
            const ndoc = new DocumentFragment();
            let anchor = ndoc; // covers initialization weirdness
            let next = anchor.firstChild;
            const loadString = () => {
                const len = program.getUint16(ip);
                ip += str_size;
                const txt = decoder.decode(new DataView(program.buffer, ip, len));
                ip += len;
                return txt;
            };
            while (ip < program.byteLength) {
                const instr = program.getUint8(ip);
                ip += instr_size;
                switch (instr) {
                    case OpType.OpTerm:
                        for (let p = this.endStyle.nextSibling; p !== null; p = p.nextSibling) {
                            p.remove();
                        }
                        this.shadowRoot.appendChild(ndoc);
                        this.gen++;
                        return;
                    case OpType.OpCreateElement:
                        {
                            const tag = loadString();
                            let n;
                            if (tag === "svg" || tag === "path") {
                                n = document.createElementNS("http://www.w3.org/2000/svg", tag);
                            }
                            else {
                                n = document.createElement(tag);
                            }
                            if (next) {
                                next.replaceWith(n);
                            }
                            else {
                                anchor.appendChild(n);
                            }
                            next = n.firstChild;
                            anchor = n;
                        }
                        break;
                    case OpType.OpReuse:
                        {
                            const ntt = loadString();
                            const n = this.shadowRoot.getElementById(ntt);
                            if (next) {
                                next.replaceWith(n);
                            }
                            else if (n) {
                                anchor.appendChild(n);
                            }
                            else {
                                throw new Error(`Couldn't reuse node of id '${ntt}', not found`);
                            }
                            next = n.nextSibling;
                        }
                        break;
                    case OpType.OpReID:
                        {
                            const from = loadString();
                            const to = loadString();
                            const n = ndoc.getElementById(from);
                            n.id = to;
                        }
                        break;
                    case OpType.OpSetClass:
                        {
                            const cname = loadString();
                            anchor.setAttribute("class", cname);
                        }
                        break;
                    case OpType.OpSetID:
                        {
                            const ntt = loadString();
                            anchor.id = ntt;
                        }
                        break;
                    case OpType.OpSetAttr:
                        {
                            const anm = loadString();
                            const avl = loadString();
                            // setAttribute lets us use the normal HTML name of the attribute
                            anchor.setAttribute(anm, avl);
                        }
                        break;
                    case OpType.OpAddText:
                        {
                            const txt = loadString();
                            if (next) {
                                next.replaceWith(txt);
                            }
                            else {
                                anchor.appendChild(document.createTextNode(txt));
                            }
                        }
                        break;
                    case OpType.OpNext:
                        {
                            next = anchor.nextSibling;
                            anchor = anchor.parentElement;
                        }
                        break;
                }
            }
            throw new Error("invalid XAS code, no term instructions");
        };
        /**
         * DOM element corresponding to an entity that is known by the wasm engine rx
         * Use an attribute-based selector such as ".closest("[id]")" to find the right element.
         */
        this.passEvent = (eventType, entityNode, world = {}) => {
            if (!(entityNode instanceof HTMLElement || entityNode instanceof SVGElement)) {
                throw new Error("event raised from entity which is not an HTML element");
            }
            // capture both entity and gen to prevent desync
            let entity = 0;
            if (entityNode.id === "") {
                console.warn(`entityId received an entityNode without id attribute: ${entityNode}`);
                return;
            }
            else {
                entity = parseInt(entityNode.id);
                if (isNaN(entity)) {
                    throw new Error(`node is using a non-number id "${entityNode.id}". Use "GiveKey()" in Go code to generate a valid id for an input`);
                }
            }
            const gen = this.gen;
            if (!this.shadowRoot.getElementById(entity.toString())) {
                // event was fired from a node has been deleted since
                // this is possible if the event is fired between the call to updateGo and the time the new rendering is done
                return;
            }
            if (this.mxevent) {
                // another event is being processed
                return;
            }
            this.mxevent = true;
            const sched = async () => {
                try {
                    const evt = {
                        gen: gen,
                        code: eventType,
                        entity: entity,
                        world,
                    };
                    const jsWorld = await this.buildJSWorld(evt.world);
                    await this.activeModule; // Go is ready to accept args
                    // all must be sync below this point
                    if (evt.gen === this.gen) {
                        this.updateGo(eventType, entity, jsWorld);
                    }
                    else {
                        // drop this event
                    }
                }
                finally {
                    this.mxevent = false;
                }
            };
            // note that the call, while using the async syntax, can actually be synchronous if the LioLi computation is synchronous.
            // this is the case if the [viewportToLioLi] is not using the visual debugger.
            // keeping this synchronous is required when we handle drag start event, where the payload and image must be found in the same loop.
            //
            // [dnd] https://html.spec.whatwg.org/multipage/dnd.html#concept-dnd-rw
            sched();
        };
        /** buildJSWorld completes the information already collected in the event */
        this.buildJSWorld = async (eventJsWorld = {}) => {
            const jsWorld = {
                point: eventJsWorld.point ??
                    ((await locateEntity(...this.mouse, this.shadowRoot)) || [null, 0])[1],
                mouse: this.mouse,
                registers: getRegisters(),
                modifiers: this.modifiers,
                // jsWorld computed in event listener has priority
                // over jsWorld computed based on instance attributes
                // as other value may be subject to race conditions
                ...eventJsWorld,
                gen: this.gen,
            };
            return jsWorld;
        };
        const shadow = this.attachShadow({ mode: "open" });
        for (const sheet of document.styleSheets) {
            if (!sheet.href) {
                continue;
            }
            let link = document.createElement("link");
            link.href = sheet.href;
            link.rel = "stylesheet";
            shadow.appendChild(link);
        }
        this.endStyle = shadow.lastChild;
        if (!DataCell.module) {
            console.time("compile module");
            DataCell.module = WebAssembly.compileStreaming(fetch(WASM_URL));
            console.timeEnd("compile module");
        }
        this.mouse = [0, 0];
        this.activeModule = new Promise((resolve) => (this._tripModule = resolve));
    }
    connectedCallback() {
        /**
         * Side-effect: will add WASM Scope-tied methods to "this"
         * @see main_js.go
         */
        this.loopCell(["-manifest=" + this.getAttribute("manifest")]);
        this.shadowRoot.addEventListener("click", this);
        this.shadowRoot.addEventListener("dblclick", this);
        this.shadowRoot.addEventListener("contextmenu", this);
        this.shadowRoot.addEventListener("change", this);
        // "blur" and "focus" don't bubble, "focusout" does
        // => "focusout" is what we want to listen for cell children being focused
        this.shadowRoot.addEventListener("focusout", this);
        this.shadowRoot.addEventListener("dragover", this);
        this.shadowRoot.addEventListener("dragenter", this);
        this.shadowRoot.addEventListener("drop", this);
        this.shadowRoot.addEventListener("dragend", this);
        this.shadowRoot.addEventListener("dragstart", this);
        this.shadowRoot.addEventListener(RequestPProfEvent, this);
        this.shadowRoot.addEventListener(DebugGrammarEvent, this);
        // document-tied events, must be removed in disconnectedCallback
        document.addEventListener("mousemove", this);
        document.addEventListener("keydown", this);
        document.addEventListener("wheel", this, { passive: false });
    }
    disconnectedCallback() {
        this.running = false;
        (async () => {
            await this.activeModule;
            this.updateGo(IntentType.Seppuku);
        })();
        document.removeEventListener("mousemove", this);
        document.removeEventListener("keydown", this);
        document.removeEventListener("wheel", this);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        console.warn("deprecated code path in observing cell ID");
        // full reload of the cell if one of these attributes change
        if (name !== "cell" || oldValue || !newValue) {
            console.debug("attribute changed", name);
            return;
        }
        // attribute change is possible very early in the rendering cycle
        // better wait until the module is ready to get it
        (async () => {
            await this.activeModule;
            let entity = this.shadowRoot.activeElement?.closest("[id]");
            if (!entity) {
                entity = this.shadowRoot.querySelector("[id]");
            }
            if (!entity) {
                this.running = false;
                this.updateGo(IntentType.Seppuku);
                return;
            }
            this.passEvent(IntentType.CellIDChange, entity, {
                registers: [newValue, "", "", ""],
            });
        })();
    }
    async handleEvent(event) {
        if (isClick(event) || isRightClick(event) || isDoubleClick(event)) {
            {
                // ignore clicks while in Regexp filter form or in pattern editor
                // TODO: clear that up. Mixes logic and rendering.
                const reinputs = [
                    ...this.shadowRoot.querySelectorAll('input[type="text"]'),
                    ...this.shadowRoot.querySelectorAll("textarea"),
                ];
                for (const reinput of reinputs) {
                    if (event.composedPath().includes(reinput)) {
                        return;
                    }
                }
            }
            {
                // Caught click while some content is highlighted, ignores it
                // TODO: fix know bug: document.getSelection() doesn't work as expected in Chrome with Shadow DOM
                const sel = document.getSelection();
                if (sel && sel.anchorOffset !== sel.focusOffset) {
                    return;
                }
            }
            event.preventDefault();
            // capture the mouse, in case the events gets delayed too much
            const mouse = [event.clientX, event.clientY];
            const ll = await locateEntity(...mouse, this.shadowRoot);
            if (ll == null) {
                return;
            }
            const [target, point] = ll;
            // order matters: since the event detail can be used to differentiate,
            // a double click is a click with a count of 2.
            let code;
            if (isDoubleClick(event)) {
                code = IntentType.DoubleClick;
            }
            else if (isClick(event)) {
                code = IntentType.Click;
            }
            else if (isRightClick(event)) {
                return; // we don’t handle it for now
            }
            this.modifiers = getModifiers(event);
            const [act, name, buffer, _] = await new Promise((continuation) => this.passEvent(code, parentEntity(target), { point, continuation }));
            if (act === "trigger-download") {
                triggerDownload(name, buffer);
            }
        }
        else if (event.type === "change") {
            this.passEvent(IntentType.Change, parentEntity(event.target), {
                registers: [event.target.value || "", "", "", ""],
            });
        }
        else if (event.type === "focusout") {
            // remove this condition if needing to track 'blur' event
            const val = event.target?.value;
            this.passEvent(IntentType.Blur, parentEntity(event.target), {
                registers: [val || "", "", "", ""],
            });
        }
        else if (isMouseMove(event)) {
            this.mouse = [event.clientX, event.clientY];
        }
        else if (isKeyDown(event)) {
            /** Key presses */
            if (!this.mouseInCell) {
                return;
            }
            const entity = this.shadowRoot
                .elementFromPoint(this.mouse[0], this.mouse[1])
                .closest("[id]");
            if (!entity) {
                console.warn("no entity found, cannot attach event");
                return;
            }
            switch (event.code) {
                case "Escape":
                    this.passEvent(IntentType.EscPress, entity);
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    this.passEvent(IntentType.Scroll, entity, {
                        registers: ["1", "", "", ""],
                    });
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    this.passEvent(IntentType.Scroll, entity, {
                        registers: ["-1", "", "", ""],
                    });
                    break;
                case "F10":
                    if (!event.ctrlKey) {
                        console.debug("no meta key");
                        return;
                    }
                    event.preventDefault();
                    this.passEvent(IntentType.ShowDebugMenu, this.shadowRoot.querySelector("[id]"));
                default:
                    return;
            }
        }
        else if (isDragOver(event)) {
            if (!acceptDrop(event, (e) => hasPivotData(e))) {
                return;
            }
            // we need to set those because of the prevent default, and mouse move is not fired during a drag
            this.mouse = [event.clientX, event.clientY];
            if (this.debounce) {
                return;
            }
            else {
                this.debounce = true;
                setTimeout(() => {
                    this.debounce = false;
                }, DEBOUNCE_TIMEOUT);
            }
            const entity = event.target.closest("[id]");
            // silence drops over empty zones (but should we not fold this into accepting the drop in the first place?)
            if (!entity)
                return;
            // NOTE: this may rerender the dropzone, thus breaking drop events
            // a drop event is only fired if valid dragenter/dragover have been seen before
            // and the DOM element for the dropzone is not rerendered in between
            this.passEvent(IntentType.DragOver, entity);
        }
        else if (isDragEnter(event)) {
            acceptDrop(event, (e) => hasPivotData(e));
        }
        else if (isDrop$1(event)) {
            if (!acceptDrop(event, (e) => hasPivotData(e))) {
                return;
            }
            removePivotDragImage(); // TODO(rdo) break that strong coupling
            const pivotData = getPivotDragData(event);
            if (!pivotData) {
                console.warn("Did not get pivot data, ignore drop");
                return;
            }
            const ll = await locateEntity(...this.mouse, this.shadowRoot);
            if (ll == null) {
                return;
            }
            const [target, point] = ll;
            this.passEvent(IntentType.Drop, parentEntity(target), {
                point,
                registers: [JSON.stringify(pivotData), "", "", ""],
            });
        }
        else if (isDragEnd(event)) {
            removePivotDragImage();
            const elem = event.target;
            if (!elem) {
                return;
            }
            const entity = elem.closest("[id]");
            this.passEvent(IntentType.DragEnd, entity);
        }
        else if (isDragStart(event)) {
            const elem = event.target;
            if (!elem) {
                return;
            }
            const entity = elem.closest("[id]");
            const [q, _t] = await new Promise((continuation) => this.passEvent(IntentType.DragStart, entity, { continuation }));
            setPivotDragData(event, q);
            setPivotDragImage(event, JSON.parse(q));
        }
        else if (isWheel(event)) {
            if (!this.mouseInCell) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation(); // prevent scroll capture by browser
            if (this.debounce) {
                return;
            }
            const direction = event.deltaY > 0 ? "10" : "-10";
            if (this.debounce) {
                return;
            }
            else {
                this.debounce = true;
                setTimeout(() => {
                    this.debounce = false;
                }, DEBOUNCE_TIMEOUT);
            }
            const entity = this.shadowRoot
                .elementFromPoint(event.clientX, event.clientY)
                .closest("[id]");
            if (!entity) {
                // if scroll does not happen in a part of the UI that is recorded
                return;
            }
            this.passEvent(IntentType.Scroll, entity, {
                registers: [direction, "", "", ""],
            });
        }
        else {
            console.log("Unknown event", event);
        }
    }
    /** mouseInCell is true if the pointer position is withing the boundary of the cell */
    get mouseInCell() {
        // global events, only accept if this is within the cell
        const vp = this.getBoundingClientRect();
        return (this.mouse[0] > vp.left &&
            this.mouse[0] < vp.right &&
            this.mouse[1] > vp.top &&
            this.mouse[1] < vp.bottom);
    }
}
customElements.define("wt-data", DataCell);
function getRegisters(targetNode) {
    const registers = Array(4).fill("");
    if (!targetNode) {
        return registers;
    }
    for (let ri = 1; ri <= 4; ri++) {
        const registryNode = targetNode.closest(`[data-r${ri}]`);
        if (registryNode) {
            registers[ri - 1] = registryNode.dataset[`r${ri}`];
        }
    }
    return registers;
}
function parentEntity(targetNode) {
    if (!(targetNode instanceof HTMLElement || targetNode instanceof SVGElement)) {
        console.error(targetNode);
        throw new Error("invalid target node");
    }
    const closest = targetNode?.closest("[id]");
    if (!closest) {
        console.error({ targetNode });
        throw new Error("Found no entity for current target. If you are using the visual debugger, you might have clicked on a floating visual element.");
    }
    return closest;
}
// support for Mac command key [ev.metaKey]
function getModifiers(ev) {
    if (!ev)
        return Array(3).fill(false);
    return [ev.ctrlKey || ev.metaKey, ev.shiftKey, ev.altKey];
}
// Typescript checks with inference
const isClick = (ev) => ev.type === "click";
const isDoubleClick = (ev) => ev.type === "dblclick" || (isClick(ev) && ev.detail == 2);
const isRightClick = (ev) => ev.type === "contextmenu";
const isMouseMove = (ev) => ev.type === "mousemove";
const isWheel = (ev) => ev.type === "wheel";
const isDragStart = (ev) => ev.type === "dragstart";
const isDragOver = (ev) => ev.type === "dragover";
const isDragEnter = (ev) => ev.type === "dragenter";
const isDrop$1 = (ev) => ev.type === "drop";
const isDragEnd = (ev) => ev.type === "dragend";
const isKeyDown = (ev) => ev.type === "keydown";

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const {I:l$1}=j,i$2=o=>null===o||"object"!=typeof o&&"function"!=typeof o,e$1=o=>void 0===o.strings,r$1=()=>document.createComment(""),c$3=(o,i,n)=>{var t;const v=o._$AA.parentNode,d=void 0===i?o._$AB:i._$AA;if(void 0===n){const i=v.insertBefore(r$1(),d),t=v.insertBefore(r$1(),d);n=new l$1(i,t,o,o.options);}else {const l=n._$AB.nextSibling,i=n._$AM,u=i!==o;if(u){let l;null===(t=n._$AQ)||void 0===t||t.call(n,o),n._$AM=o,void 0!==n._$AP&&(l=o._$AU)!==i._$AU&&n._$AP(l);}if(l!==d||u){let o=n._$AA;for(;o!==l;){const l=o.nextSibling;v.insertBefore(o,d),o=l;}}}return n},f=(o,l,i=o)=>(o._$AI(l,i),o),s$2={},a=(o,l=s$2)=>o._$AH=l,m$1=o=>o._$AH,p=o=>{var l;null===(l=o._$AP)||void 0===l||l.call(o,!1,!0);let i=o._$AA;const n=o._$AB.nextSibling;for(;i!==n;){const o=i.nextSibling;i.remove(),i=o;}};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s$1=(i,t)=>{var e,o;const r=i._$AN;if(void 0===r)return !1;for(const i of r)null===(o=(e=i)._$AO)||void 0===o||o.call(e,t,!1),s$1(i,t);return !0},o$3=i=>{let t,e;do{if(void 0===(t=i._$AM))break;e=t._$AN,e.delete(i),i=t;}while(0===(null==e?void 0:e.size))},r=i=>{for(let t;t=i._$AM;i=t){let e=t._$AN;if(void 0===e)t._$AN=e=new Set;else if(e.has(i))break;e.add(i),l(t);}};function n$2(i){void 0!==this._$AN?(o$3(this),this._$AM=i,r(this)):this._$AM=i;}function h$2(i,t=!1,e=0){const r=this._$AH,n=this._$AN;if(void 0!==n&&0!==n.size)if(t)if(Array.isArray(r))for(let i=e;i<r.length;i++)s$1(r[i],!1),o$3(r[i]);else null!=r&&(s$1(r,!1),o$3(r));else s$1(this,i);}const l=i=>{var t,s,o,r;i.type==t$1.CHILD&&(null!==(t=(o=i)._$AP)&&void 0!==t||(o._$AP=h$2),null!==(s=(r=i)._$AQ)&&void 0!==s||(r._$AQ=n$2));};let c$2 = class c extends i$4{constructor(){super(...arguments),this._$AN=void 0;}_$AT(i,t,e){super._$AT(i,t,e),r(this),this.isConnected=i._$AU;}_$AO(i,t=!0){var e,r;i!==this.isConnected&&(this.isConnected=i,i?null===(e=this.reconnected)||void 0===e||e.call(this):null===(r=this.disconnected)||void 0===r||r.call(this)),t&&(s$1(this,i),o$3(this));}setValue(t){if(e$1(this._$Ct))this._$Ct._$AI(t,this);else {const i=[...this._$Ct._$AH];i[this._$Ci]=t,this._$Ct._$AI(i,this,0);}}disconnected(){}reconnected(){}};

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e=()=>new o$2;let o$2 = class o{};const h$1=new WeakMap,n$1=e$4(class extends c$2{render(t){return A}update(t,[s]){var e;const o=s!==this.G;return o&&void 0!==this.G&&this.ot(void 0),(o||this.rt!==this.lt)&&(this.G=s,this.dt=null===(e=t.options)||void 0===e?void 0:e.host,this.ot(this.lt=t.element)),A}ot(i){var t;if("function"==typeof this.G){const s=null!==(t=this.dt)&&void 0!==t?t:globalThis;let e=h$1.get(s);void 0===e&&(e=new WeakMap,h$1.set(s,e)),void 0!==e.get(this.G)&&this.G.call(this.dt,void 0),e.set(this.G,i),void 0!==i&&this.G.call(this.dt,i);}else this.G.value=i;}get rt(){var i,t,s;return "function"==typeof this.G?null===(t=h$1.get(null!==(i=this.dt)&&void 0!==i?i:globalThis))||void 0===t?void 0:t.get(this.G):null===(s=this.G)||void 0===s?void 0:s.value}disconnected(){this.rt===this.lt&&this.ot(void 0);}reconnected(){this.ot(this.lt);}});

class Alert extends TWElement {
    constructor(type, text) {
        super();
        this.type = type;
        this.text = text;
        this.display = false;
    }
    open() {
        this.display = true;
    }
    close() {
        this.display = false;
    }
    defaultView() {
        return x `<div class="px-4 py-3 flex items-center justify-between fixed left-1/2 bottom-16 z-20 -translate-x-1/2 bg-red-100 border border-red-500 rounded"><p class="text-red-500">${this.text}</p></div>`;
    }
    // TODO in future might want to use different templates depending on alert's type. Also text is going to be more complicated than a simple string
    render() {
        return n$3(this.display, this.defaultView.bind(this), () => {
            return x ``;
        });
    }
}
Alert.properties = {
    type: { type: String },
    text: { type: String },
    display: { type: Boolean },
};
customElements.define("wt-alert", Alert);

const datasourceChangeEvt = "datasource-change";
const dispatchDatasourceChange = customEventDispatcher(datasourceChangeEvt);

// inputs lists all valid inputs elements in the form
// this is needed since slotted elements are not returned in form
function* inputs(elements) {
    const isValidInput = (e) => e.matches("button,input,output,select,textarea") && 'name' in e && 'value' in e;
    for (const elt of elements) {
        // direct nodes don’t need no tree walking
        if (isValidInput(elt)) {
            yield elt;
            continue;
        }
        const wlk = document.createTreeWalker(elt, NodeFilter.SHOW_ELEMENT, {
            acceptNode(node) {
                if (node instanceof Element && isValidInput(node)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                else {
                    return NodeFilter.FILTER_SKIP;
                }
            }
        });
        // start at next node, skip root
        let cn = wlk.nextNode();
        while (cn) {
            yield cn;
            cn = wlk.nextNode();
        }
    }
}

const icons$1 = {
    pencil: b `<path d="M3.45872 12.2841C3.49443 12.2841 3.53015 12.2805 3.56586 12.2752L6.56943 11.7484C6.60515 11.7412 6.63908 11.7252 6.66408 11.6984L14.2337 4.12874C14.2503 4.11222 14.2634 4.0926 14.2724 4.071C14.2813 4.0494 14.2859 4.02624 14.2859 4.00285C14.2859 3.97946 14.2813 3.95631 14.2724 3.9347C14.2634 3.9131 14.2503 3.89348 14.2337 3.87696L11.2659 0.907316C11.2319 0.873387 11.1873 0.85553 11.1391 0.85553C11.0909 0.85553 11.0462 0.873387 11.0123 0.907316L3.44265 8.47696C3.41586 8.50374 3.39979 8.53589 3.39265 8.5716L2.86586 11.5752C2.84849 11.6708 2.8547 11.7693 2.88395 11.862C2.91319 11.9547 2.9646 12.0389 3.03372 12.1073C3.15158 12.2216 3.29979 12.2841 3.45872 12.2841ZM4.66229 9.16982L11.1391 2.69482L12.448 4.00374L5.97122 10.4787L4.38372 10.7591L4.66229 9.16982ZM14.5712 13.7841H1.42836C1.11229 13.7841 0.856934 14.0395 0.856934 14.3555V14.9984C0.856934 15.077 0.921219 15.1412 0.999791 15.1412H14.9998C15.0784 15.1412 15.1426 15.077 15.1426 14.9984V14.3555C15.1426 14.0395 14.8873 13.7841 14.5712 13.7841Z"/>`,
    arrow: b `<path d="M14.6427 3.42871H13.3034C13.2123 3.42871 13.1266 3.47335 13.073 3.54657L7.99981 10.5394L2.92659 3.54657C2.87302 3.47335 2.78731 3.42871 2.69624 3.42871H1.35695C1.24088 3.42871 1.17302 3.56085 1.24088 3.6555L7.53731 12.3359C7.76588 12.6501 8.23374 12.6501 8.46052 12.3359L14.757 3.6555C14.8266 3.56085 14.7587 3.42871 14.6427 3.42871Z"/>`,
    check: b `<path d="M5 13L9 17L19 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    socket: b `<path d="M23.9316 1.31519L22.6845 0.067672C22.6374 0.0205959 22.5786 0 22.5168 0C22.455 0 22.3962 0.0235382 22.3492 0.067672L20.1108 2.30673C19.1377 1.64723 17.9889 1.29561 16.8135 1.29754C15.3075 1.29754 13.8016 1.87128 12.6515 3.0217L9.65425 6.01986C9.61046 6.0641 9.58589 6.12384 9.58589 6.1861C9.58589 6.24835 9.61046 6.3081 9.65425 6.35233L17.6459 14.3465C17.693 14.3935 17.7518 14.4141 17.8136 14.4141C17.8724 14.4141 17.9342 14.3906 17.9812 14.3465L20.9785 11.3483C23.0051 9.31813 23.2433 6.17874 21.6932 3.88967L23.9316 1.65061C24.0228 1.55645 24.0228 1.4064 23.9316 1.31519ZM19.5608 9.93306L17.8136 11.6808L12.3191 6.18463L14.0663 4.43692C14.7987 3.7043 15.7752 3.29827 16.8135 3.29827C17.8518 3.29827 18.8254 3.70136 19.5608 4.43692C20.2931 5.16955 20.6991 6.14638 20.6991 7.18499C20.6991 8.22361 20.2931 9.1975 19.5608 9.93306ZM13.9663 13.0224C13.9221 12.9786 13.8623 12.9541 13.8001 12.9541C13.7379 12.9541 13.6781 12.9786 13.6339 13.0224L11.675 14.982L9.01892 12.3251L10.9808 10.3626C11.072 10.2714 11.072 10.1214 10.9808 10.0302L9.91015 8.95918C9.86592 8.91537 9.8062 8.8908 9.74396 8.8908C9.68172 8.8908 9.622 8.91537 9.57778 8.95918L7.61589 10.9217L6.3511 9.65649C6.32914 9.63451 6.30298 9.61719 6.27417 9.60556C6.24536 9.59393 6.2145 9.58824 6.18344 9.58882C6.12462 9.58882 6.06285 9.61236 6.01579 9.65649L3.02148 12.6547C0.994886 14.6848 0.756636 17.8242 2.30673 20.1133L0.0683574 22.3523C0.0245658 22.3966 0 22.4563 0 22.5186C0 22.5808 0.0245658 22.6406 0.0683574 22.6848L1.31549 23.9323C1.36256 23.9794 1.42138 24 1.48315 24C1.54492 24 1.60375 23.9765 1.65081 23.9323L3.88918 21.6933C4.88042 22.367 6.03344 22.7025 7.18645 22.7025C8.69243 22.7025 10.1984 22.1287 11.3485 20.9783L14.3457 17.9801C14.4369 17.8889 14.4369 17.7389 14.3457 17.6477L13.0809 16.3825L15.0428 14.42C15.134 14.3288 15.134 14.1787 15.0428 14.0875L13.9663 13.0224ZM9.93074 19.566C9.57074 19.928 9.1426 20.215 8.67106 20.4104C8.19952 20.6058 7.69392 20.7059 7.18351 20.7047C6.14521 20.7047 5.17162 20.3016 4.43628 19.566C4.07444 19.2059 3.78753 18.7776 3.59215 18.306C3.39677 17.8343 3.29678 17.3285 3.29797 16.8179C3.29797 15.7793 3.70094 14.8054 4.43628 14.0699L6.18344 12.3222L11.6779 17.8183L9.93074 19.566Z"/>`,
    // when copying from Figma, be careful to remove irrelevant fill
    delete: b `<path d="M17 5.70001H1C0.901509 5.70001 0.803982 5.68061 0.712987 5.64292C0.621993 5.60523 0.539314 5.54999 0.46967 5.48034C0.400026 5.4107 0.344781 5.32802 0.30709 5.23703C0.269399 5.14603 0.25 5.0485 0.25 4.95001C0.25 4.85152 0.269399 4.75399 0.30709 4.663C0.344781 4.57201 0.400026 4.48933 0.46967 4.41968C0.539314 4.35004 0.621993 4.29479 0.712987 4.2571C0.803982 4.21941 0.901509 4.20001 1 4.20001H17C17.1989 4.20001 17.3897 4.27903 17.5303 4.41968C17.671 4.56033 17.75 4.7511 17.75 4.95001C17.75 5.14892 17.671 5.33969 17.5303 5.48034C17.3897 5.621 17.1989 5.70001 17 5.70001Z"/><path d="M13.44 17.75H4.56C4.24309 17.7717 3.92503 17.7302 3.62427 17.628C3.3235 17.5259 3.04601 17.365 2.80788 17.1548C2.56975 16.9446 2.37572 16.6891 2.23704 16.4034C2.09836 16.1176 2.01779 15.8071 2 15.49V4.99998C2 4.80107 2.07902 4.61031 2.21967 4.46965C2.36032 4.329 2.55109 4.24998 2.75 4.24998C2.94891 4.24998 3.13968 4.329 3.28033 4.46965C3.42098 4.61031 3.5 4.80107 3.5 4.99998V15.49C3.5 15.9 3.97 16.25 4.5 16.25H13.38C13.94 16.25 14.38 15.9 14.38 15.49V4.99998C14.38 4.78516 14.4653 4.57913 14.6172 4.42723C14.7691 4.27532 14.9752 4.18998 15.19 4.18998C15.4048 4.18998 15.6109 4.27532 15.7628 4.42723C15.9147 4.57913 16 4.78516 16 4.99998V15.49C15.9822 15.8071 15.9016 16.1176 15.763 16.4034C15.6243 16.6891 15.4303 16.9446 15.1921 17.1548C14.954 17.365 14.6765 17.5259 14.3757 17.628C14.075 17.7302 13.7569 17.7717 13.44 17.75ZM13.56 4.74998C13.4611 4.75133 13.363 4.73285 13.2714 4.69563C13.1798 4.65842 13.0966 4.60323 13.0267 4.53331C12.9568 4.4634 12.9016 4.38018 12.8644 4.28858C12.8271 4.19698 12.8087 4.09885 12.81 3.99998V2.50998C12.81 2.09999 12.33 1.74998 11.81 1.74998H6.22C5.67 1.74998 5.22 2.09999 5.22 2.50998V3.99998C5.22 4.1989 5.14098 4.38966 5.00033 4.53031C4.85968 4.67097 4.66891 4.74998 4.47 4.74998C4.27109 4.74998 4.08032 4.67097 3.93967 4.53031C3.79902 4.38966 3.72 4.1989 3.72 3.99998V2.50998C3.75872 1.8813 4.04203 1.29275 4.50929 0.87035C4.97655 0.447951 5.5906 0.225271 6.22 0.249985H11.78C12.4145 0.217172 13.0362 0.436204 13.51 0.859437C13.9838 1.28267 14.2713 1.87586 14.31 2.50998V3.99998C14.3113 4.09931 14.2929 4.19792 14.2558 4.29007C14.2187 4.38222 14.1637 4.46608 14.0939 4.53679C14.0241 4.6075 13.941 4.66364 13.8493 4.70195C13.7577 4.74027 13.6593 4.75999 13.56 4.75998V4.74998Z"/><path d="M7.21997 14C7.02186 13.9974 6.8326 13.9175 6.6925 13.7774C6.55241 13.6373 6.47256 13.4481 6.46997 13.25V8.71997C6.46997 8.52106 6.54899 8.33029 6.68964 8.18964C6.83029 8.04899 7.02106 7.96997 7.21997 7.96997C7.41888 7.96997 7.60965 8.04899 7.7503 8.18964C7.89095 8.33029 7.96997 8.52106 7.96997 8.71997V13.24C7.9713 13.3393 7.95287 13.4379 7.91578 13.5301C7.87868 13.6222 7.82364 13.7061 7.75387 13.7768C7.68409 13.8475 7.60096 13.9036 7.50931 13.9419C7.41766 13.9803 7.31931 14 7.21997 14Z"/><path d="M10.78 14C10.5811 14 10.3904 13.921 10.2497 13.7803C10.109 13.6396 10.03 13.4489 10.03 13.25V8.71997C10.03 8.52106 10.109 8.33029 10.2497 8.18964C10.3904 8.04899 10.5811 7.96997 10.78 7.96997C10.9789 7.96997 11.1697 8.04899 11.3104 8.18964C11.451 8.33029 11.53 8.52106 11.53 8.71997V13.24C11.53 13.4398 11.4513 13.6316 11.311 13.7739C11.1706 13.9161 10.9799 13.9973 10.78 14Z"/>`,
    replace: b `<path d="M0.78125 15.4063H3.01719C3.17188 15.4063 3.29844 15.2797 3.29844 15.125V6.14962H21.882V8.70196C21.882 8.76876 21.9031 8.83204 21.9453 8.88478C21.969 8.91514 21.9985 8.94052 22.032 8.95944C22.0655 8.97837 22.1025 8.99047 22.1407 8.99504C22.179 8.99962 22.2177 8.99658 22.2548 8.9861C22.2918 8.97562 22.3265 8.95791 22.3566 8.93399L27.3945 4.97892C27.5457 4.80313 27.5211 4.61681 27.3945 4.51485L22.3566 0.563291C22.3048 0.521821 22.2402 0.499474 22.1738 0.500009C22.0121 0.500009 21.8785 0.633603 21.8785 0.795322V3.34767H3.0207C1.63203 3.34767 0.5 4.4797 0.5 5.87188V15.125C0.5 15.2797 0.626562 15.4063 0.78125 15.4063ZM27.2188 12.5938H24.9828C24.8281 12.5938 24.7016 12.7203 24.7016 12.875V21.8504H6.11797V19.2981C6.11797 19.2313 6.09688 19.168 6.05469 19.1152C6.031 19.0849 6.00154 19.0595 5.968 19.0406C5.93446 19.0217 5.89751 19.0096 5.85927 19.005C5.82104 19.0004 5.78227 19.0034 5.74521 19.0139C5.70816 19.0244 5.67354 19.0421 5.64336 19.066L0.605469 23.0211C0.454297 23.1969 0.478906 23.3832 0.605469 23.4852L5.64336 27.4367C5.69609 27.4789 5.75938 27.5 5.82617 27.5C5.98789 27.5 6.12148 27.3664 6.12148 27.2047V24.6524H24.9863C26.375 24.6524 27.507 23.5203 27.507 22.1281V12.875C27.5 12.7203 27.3734 12.5938 27.2188 12.5938Z"/>`,
};
const colorMap = {
    // NOTE: tailwind class have to appear explicitely at some point
    // otherwise they won't be included in the bundle
    // hence the "bg-" prefix
    blue: "bg-sky-600",
    green: "bg-lime-600",
    "orange-600": "bg-orange-600",
    "orange-500": "bg-orange-500",
    "orange-300": "bg-orange-300",
};
class DatasourceCard extends TWElement {
    constructor() {
        super();
        this.slotFormElement = e();
        this.isColourChanged = false;
        this.isExpanded = false;
        this.isTested = -1;
        this.isAlert = false;
        this.alertMessage = "";
        this.height = 0;
    }
    connectedCallback() {
        super.connectedCallback();
        // put new datasources in edit mode
        if (!this.key) {
            this.isEdited = true;
        }
        if (this.isEdited) {
            this.isExpanded = true;
        }
        window.addEventListener("load", () => {
            this.height = this.offsetHeight;
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("load", () => {
            this.height = this.offsetHeight;
        });
    }
    async firstUpdated() {
        this.hasOrganizingNotebooks = await hasFlag("organizing_notebooks");
    }
    setAlert() {
        const alert = new Alert("danger", this.alertMessage);
        alert.open();
        return alert.render();
    }
    replace() {
        let data = new Array();
        for (const elt of inputs(this.slotFormElement.value.assignedElements({ flatten: true }))) {
            if (!elt.reportValidity()) {
                continue;
            }
            data.push({ name: elt.name, value: elt.value });
        }
        dispatchDatasourceChange(JSON.stringify(data), this);
    }
    defaultView() {
        const pencilSvg = x `<svg width="20" height="20" viewBox="0 0 16 16" class="dark:fill-white">${icons$1.pencil}</svg>`;
        const replaceSvg = x `<svg width="20" height="20" viewBox="0 0 32 32" class="dark:fill-white">${icons$1.replace}</svg>`;
        const deleteSvg = x `<svg width="20" height="20" viewBox="0 0 18 18" class="dark:fill-white">${icons$1.delete}</svg>`;
        const arrowSvg = x `<svg width="20" height="20" viewBox="0 0 16 16" class="dark:fill-white">${icons$1.arrow}</svg>`;
        let rotateClass = "";
        if (this.isExpanded) {
            rotateClass = "rotate-180";
        }
        const replaceBtn = x `<button type="button" class="py-1 bg-transparent border-0" @click="${this.replace}">${replaceSvg}</button>`;
        return x `<div class="min-w-0 grow flex justify-between"><slot name="configs"><div class="text-center m-2 w-full text-xs italic">New datasource, click the edit button to connect</div></slot><!-- bring in scope inputs from back-end --><slot ${n$1(this.slotFormElement)} name="form" class="hidden"></slot><div class="flex flex-col justify-between items-center mr-2.5"><div class="flex flex-col"><button type="button" class="mt-1.5 py-1 bg-transparent border-0" aria-label="Edit datasource" @click="${this.edit.bind(this)}">${pencilSvg}</button> <button type="button" name="action" value="delete" class="py-1 bg-transparent border-0" @click="${(e) => {
            e.stopPropagation();
            this.submit(e);
        }}">${deleteSvg}</button> ${this.hasOrganizingNotebooks ? replaceBtn : ""}</div><button type="button" class="${rotateClass} ${this.height < 96
            ? "hidden"
            : ""} py-1 transition-transform duration-300 bg-transparent border-0" @click="${(e) => {
            e.stopPropagation();
            this.isExpanded = !this.isExpanded;
        }}">${arrowSvg}</button></div></div>`;
    }
    edit(e) {
        e.stopPropagation();
        this.isEdited = !this.isEdited;
        this.isExpanded = true;
    }
    editView() {
        const checkSvg = x `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">${icons$1.check}</svg>`;
        const socketSvg = x `<svg width="20" height="20" viewBox="0 0 24 24" class="dark:fill-white">${icons$1.socket}</svg>`;
        let testClass = "";
        switch (this.isTested) {
            case 0: {
                testClass = "bg-red-600";
                break;
            }
            case 1: {
                testClass = "bg-green-600";
                break;
            }
            default: {
                testClass = "bg-neutral-100";
            }
        }
        return x `<form class="min-w-0 grow flex justify-between"><slot ${n$1(this.slotFormElement)} name="form"></slot><div class="p-3 flex flex-col"><button type="submit" name="action" value="save" title="Save" class="mb-2 p-0 bg-yellow-400 border-0 rounded" @click="${this.submit.bind(this)}">${checkSvg}</button><div class="flex relative"><button type="submit" name="action" value="test" title="Test" class="p-0.5 bg-transparent border-0" @click="${this.submit.bind(this)}">${socketSvg}</button> <span class="${testClass} h-2 w-2 block absolute -bottom-1 -right-1 z-20 rounded"></span></div></div>${n$3(this.isAlert, this.setAlert.bind(this), () => {
            return x ``;
        })}</form>`;
    }
    async submit(e) {
        e.preventDefault();
        e.stopPropagation();
        let action = e.currentTarget.value;
        // form data does not pass the slotted barriers
        let data = new FormData();
        if (action === "delete") {
            if (!confirm("Are you sure you want to delete this datasource?")) {
                return;
            }
        }
        data.append("action", action);
        data.append("color", this.color);
        // @ts-ignore
        for (const elt of inputs(this.slotFormElement.value.assignedElements({ flatten: true }))) {
            if (!elt.reportValidity()) {
                console.error("invalid input");
                return;
            }
            data.append(elt.name, elt.value);
        }
        const rsp = await fetch("/api/datasource", {
            method: "POST",
            body: data,
        }).then((r) => r.json());
        switch (action) {
            case "save": {
                this.isEdited = false;
                // force server-side refresh
                window.location.reload();
                break;
            }
            case "test": {
                if (rsp.Result == "ok") {
                    this.isTested = 1;
                    this.alertMessage = "";
                    this.isAlert = false;
                }
                else {
                    this.isTested = 0;
                    this.alertMessage = rsp.Message;
                    this.isAlert = true;
                }
                break;
            }
            case "delete": {
                window.location.reload();
                break;
            }
        }
    }
    render() {
        let colourButtons = [];
        for (const [color, colorDisplay] of Object.entries(colorMap)) {
            colourButtons.push(x `<button data-testid="color-select-${color}" type="button" value="save" class="h-6 w-6 ${colorDisplay} border-0" @click="${(e) => {
                this.color = color;
                this.isColourChanged = false;
                this.submit(e);
            }}"></button>`);
        }
        let heightClass = "";
        if (this.isExpanded) {
            heightClass = "max-h-128";
        }
        else {
            heightClass = "max-h-24";
        }
        return x `<div role="listitem" class="${heightClass} flex relative overflow-hidden transition-all duration-300 rounded dark:bg-neutral-600 dark:text-white" aria-label="Datasource ${this.key}"><button data-testid="change-color" aria-label="Change color" type="button" class="w-5 shrink-0 ${colorMap[this.color || "blue"]} border-0" @click="${(e) => {
            e.stopPropagation();
            this.isColourChanged = true;
        }}"></button> ${n$3(this.isColourChanged, () => {
            return x `<div id="color-choice-menu" class="py-2.5 px-3 absolute top-3 left-3 z-20 flex gap-x-2 bg-white border border-zinc-100 dark:bg-neutral-700">${colourButtons}</div>`;
        })} ${n$3(this.isEdited, this.editView.bind(this), this.defaultView.bind(this))}</div>`;
    }
}
DatasourceCard.properties = {
    color: { type: String },
    isEdited: { type: Boolean, attribute: "edited" },
    isColourChanged: { state: true },
    isExpanded: { state: true },
    isTested: { state: true },
    key: { type: String },
    type: { type: String },
    isAlert: { type: Boolean },
    alertMessage: { type: String },
    height: { state: true },
};
customElements.define("wt-datasource", DatasourceCard);

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function*o$1(o,f){if(void 0!==o){let i=0;for(const t of o)yield f(t,i++);}}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function*o(o,l,n=1){const t=void 0===l?0:o;null!=l||(l=o);for(let o=t;n>0?o<l:l<o;o+=n)yield o;}

//TODO: before removing flag change the amount of DSs per page to a more appropriate one
const pageLength = 6;
class DatasourceList extends TWElement {
    constructor() {
        super();
        this.cells = [];
        this.newCellFlag = false;
        this.isAlert = false;
        this.currentPages = [];
    }
    async firstUpdated() {
        if (await hasFlag("organizing_notebooks")) {
            this.shadowRoot?.addEventListener(datasourceChangeEvt, (ev) => {
                const dsForm = ev;
                if (dsForm.detail) {
                    const dsFormElements = JSON.parse(dsForm.detail);
                    for (const data of dsFormElements) {
                        if (data.name === "type") {
                            this.cells = [
                                ...this.cells,
                                { type: data.value, data: dsFormElements },
                            ];
                            this.doUpdate = true;
                        }
                    }
                }
            });
        }
        hasFlag("DSTabsPagination").then((hasFlag) => {
            if (!hasFlag) {
                //TODO: when flag is removed transfer buttons to render() function
                this.buttons = x `<div class="mb-14 w-fit flex overflow-hidden rounded">${this.tabsCaptions.map((v, i) => x `<button class="${i == 0
                    ? "bg-yellow-400 text-neutral-900"
                    : "border-l border-neutral-300 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-700 dark:text-white"} py-2.5 px-4 flex items-center transition-colors duration-300 text-sm font-medium" type="button" data-tab="tab${i}" @click="${this.tabChange.bind(this)}">${v}</button>`)}</div>`;
                for (let i = 0; i < this.tabsCaptions.length; i++) {
                    this.currentPages.push(0);
                }
                this.querySelectorAll(`[slot*="tab"]`).forEach((el, i) => {
                    const datasources = el.querySelectorAll(`wt-datasource`);
                    const datasourcesTotal = datasources.length;
                    if (datasourcesTotal > pageLength) {
                        const pagesAmount = Math.ceil(datasourcesTotal / pageLength);
                        let pagesButtons = [];
                        for (let j = 0; j < pagesAmount; j++) {
                            pagesButtons.push(x `<button type="button" data-tab="tab${i}" data-page="${j}" class="${j == 0
                                ? "rounded-l bg-yellow-400 text-neutral-900"
                                : "border-l border-neutral-300 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-700 dark:text-white"} ${j ==
                                pagesAmount - 1
                                ? "rounded-r"
                                : ""} py-2.5 px-4 flex items-center transition-colors duration-300 text-sm font-medium" @click="${this.pageChange.bind(this)}">${j + 1}</button>`);
                        }
                        const pagesButtonsBlock = x `<div class="mt-3 w-full flex justify-end">${pagesButtons}</div>`;
                        D(pagesButtonsBlock, el);
                        datasources.forEach((element, index) => {
                            if (index >= pageLength) {
                                element.classList.add("hidden");
                            }
                        });
                    }
                });
            }
        });
    }
    async updated() {
        if ((await hasFlag("organizing_notebooks")) && this.doUpdate) {
            for (const cell of this.cells) {
                const slotElement = this.shadowRoot?.querySelector(`slot[name="${cell.type}"]`);
                if (slotElement) {
                    for (let elk of inputs(slotElement.assignedElements({ flatten: true }))) {
                        for (const data of cell.data) {
                            if (data.name !== "key" && data.name === elk.name) {
                                elk.value = data.value;
                            }
                        }
                    }
                }
            }
        }
        this.doUpdate = false;
    }
    get slots() {
        return this._slottedChildren("wt-datasource");
    }
    setAlert() {
        const alert = new Alert("danger", "Please save created datasource first");
        alert.open();
        return alert.render();
    }
    select(e) {
        if (!this.newCellFlag) {
            this.newCellFlag = true;
            this.cells = [...this.cells, { type: e.target.value }];
        }
        else {
            this.isAlert = true;
        }
    }
    tabChange(e) {
        const tab = e.target.dataset.tab;
        this.querySelectorAll(`[slot*="tab"]`).forEach((el) => {
            el.classList.remove("fade-in");
            el.classList.add("fade-out");
            el.classList.remove("active");
        });
        this.querySelector(`[slot="${tab}"]`)?.classList.add("active", "fade-in");
        this.querySelector(`[slot="${tab}"]`)?.classList.remove("hidden", "fade-out");
        this.setButtonActive(e);
    }
    pageChange(e) {
        const tab = e.target.dataset.tab;
        const page = parseInt(e.target.dataset.page);
        this.querySelectorAll(`[slot="${tab}"] wt-datasource`).forEach((el, i) => {
            if (i < (page + 1) * pageLength && i >= page * pageLength) {
                el.classList.remove("hidden", "fade-out");
                el.classList.add("fade-in");
            }
            else {
                el.classList.remove("fade-in");
                el.classList.add("fade-out");
            }
        });
        this.setButtonActive(e);
    }
    setButtonActive(e) {
        e.target.parentNode.querySelectorAll("button").forEach((el) => {
            el.classList.remove("bg-yellow-400", "text-neutral-900");
            el.classList.add("bg-neutral-200", "dark:bg-neutral-700", "dark:text-white");
        });
        e.target.classList.add("bg-yellow-400", "text-neutral-900");
        e.target.classList.remove("bg-neutral-200", "dark:bg-neutral-700", "dark:text-white");
    }
    render() {
        let newCells = [];
        // let buttons: any;
        for (const cell of this.cells) {
            newCells.push(x `<slot name="${cell.type}"></slot>`);
        }
        return x `<div class="p-14 dark:bg-neutral-900 mb-8">${this.buttons}<div class="relative">${o$1(o(this.tabsCaptions.length), (i) => x `<slot name="tab${i}"></slot>`)}</div><div class="mb-4 flex items-center gap-x-6"><p class="mb-0 dark:text-white text-xl font-light">Connect another source</p><slot name="select" @change="${this.select.bind(this)}"></slot></div>${newCells} ${n$3(this.isAlert, this.setAlert.bind(this), () => {
            return x ``;
        })}</div>`;
    }
}
DatasourceList.properties = {
    tabs: { type: Array },
    tabsCaptions: { type: Array, attribute: "tabs-captions" },
    buttons: { state: true },
    cells: { state: true },
    newCellFlag: { state: true },
    isAlert: { type: Boolean },
    currentPages: { state: true },
};
customElements.define("wt-datasource-list", DatasourceList);

class wtNotif extends TWElement {
    constructor() {
        super();
        this.toggleNotifications = () => {
            this.hidden = !this.hidden;
        };
        this.notifications = [];
        this.banner = false;
        this.hidden = true;
    }
    async firstUpdated() {
        if (!evtSource || evtSource.readyState === EventSource.CLOSED) {
            evtSource = new EventSource("/notifications");
            evtSource.onmessage = (e) => this.notify(JSON.parse(e.data));
        }
        notifListeners.add(this);
        if (notifElement) {
            notifElement.addEventListener("click", this.toggleNotifications);
        }
        // event listener for when the user navigates away from the page
        // or refreshes the page
        window.addEventListener("beforeunload", () => {
            evtSource.close();
            // when a user navigates from the page without dismissing the notification
            this.removeBanner();
        });
        // get previously stored notifications, that are persisted on page change
        this.notifications =
            JSON.parse(localStorage.getItem("notifications") || "[]") || [];
        // check if there are any notifications that need to be displayed after page refresh
        if (this.notifications.some((v) => !v.read)) {
            this.banner = true;
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        notifElement.removeEventListener("click", this.toggleNotifications);
    }
    notify(n) {
        const day = 86400000; // ms
        const m = { read: false, exp: Date.now() + 2 * day, ...n };
        this.banner = true;
        this.notifications = [m, ...this.notifications];
        // inserting to local storage is here temporarily
        // disconnectedCallback not being called when navigating away from page
        this.updateStorage();
        // after 30 seconds the notification will be dismissed
        // might be a bit too long, but we can adjust later
        setTimeout(() => {
            this.removeBanner(m.ID);
        }, 30000);
    }
    renderBanner(notification) {
        let buttons = [];
        if (notification.Actions) {
            for (const button of notification.Actions) {
                buttons.push(x `<button class="text-white py-2 px-2 rounded text-xs bg-neutral-700 mr-2" @click="${() => this.doAction(button.URL)}">${button.Label}</button>`);
            }
        }
        return x `<div class="fixed bottom-6 flex justify-center w-full z-10"><div id="${notification.Err ? "notification-error" : "notification-success"}" class="pl-7 pr-5 py-4 ${notification.Err
            ? "bg-red-400"
            : "bg-green-400"} w-7/12 justify-between rounded-md flex"><div><div id="notification-error-text" class="text-white">${notification.Message}</div>${buttons.length > 0
            ? x `<div class="flex mt-6">${buttons}</div>`
            : A}</div><div class="text-3xl cursor-pointer text-white -mt-2" @click="${() => this.removeBanner()}">×</div></div></div>`;
    }
    doAction(url) {
        location.href = url;
    }
    removeBanner(ID) {
        this.banner = false;
        // assumption is that the first notification is the one that was displayed
        // will have to do some stress testing to see if this holds up
        for (const n of this.notifications) {
            if (!ID) {
                n.read = true;
            }
            else if (n.ID === ID) {
                n.read = true;
            }
        }
        // allow a hard reset for debugging purposes
        if (localStorage.getItem("notifications") !== null) {
            this.updateStorage();
        }
    }
    removeNotification(ID) {
        console.log("ID", ID);
        this.notifications = this.notifications.filter((n) => n.ID != ID);
        this.updateStorage();
    }
    updateStorage() {
        const now = Date.now();
        localStorage.setItem("notifications", JSON.stringify(this.notifications.filter((v) => v.exp && v.exp > now)));
    }
    renderPanel() {
        let panel;
        if (this.notifications.length > 0) {
            let notificationItems = [];
            for (const notification of this.notifications) {
                let buttons = [];
                if (notification.Actions) {
                    for (const button of notification.Actions) {
                        buttons.push(x `<button class="mr-2 py-2 px-2 rounded text-xs bg-neutral-700 text-white" @click="${() => this.doAction(button.URL)}">${button.Label}</button>`);
                    }
                }
                notificationItems.push(x `<div data-ID="${notification.ID}" class="notification-item flex text-sm items-center px-4 py-4 bg-neutral-200 dark:bg-neutral-600 border-b-[1px] border-neutral-400 z-10"><div><div class="${notification.Err
                    ? "bg-red-400"
                    : "bg-green-400"} rounded-full w-2 h-2 mr-4"></div></div><div class="w-11/12 break-all"><p class="text-sm">${notification.Message}</p>${buttons.length > 0
                    ? x `<div class="flex mt-3">${buttons}</div>`
                    : A}</div><button type="button" class="text-lg ml-2 mr-1" @click="${() => this.removeNotification(notification.ID)}">×</button></div>`);
            }
            panel = x `<div class="h-5/6 overflow-y-auto">${notificationItems}</div>`;
        }
        else {
            panel = x `<div class="grow flex flex-col items-center justify-center text-xl"><svg width="70" viewBox="0 0 24 24" class="fill-none stroke-neutral-900 dark:stroke-neutral-100"><path d="M15 17H20L18.595 15.595C18.4063 15.4063 18.2567 15.1822 18.1546 14.9357C18.0525 14.6891 18 14.4249 18 14.158V11C18.0002 9.75894 17.6156 8.54834 16.8992 7.53489C16.1829 6.52144 15.17 5.75496 14 5.341V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3C11.4696 3 10.9609 3.21071 10.5858 3.58579C10.2107 3.96086 10 4.46957 10 5V5.341C7.67 6.165 6 8.388 6 11V14.159C6 14.697 5.786 15.214 5.405 15.595L4 17H9M15 17H9M15 17V18C15 18.7956 14.6839 19.5587 14.1213 20.1213C13.5587 20.6839 12.7956 21 12 21C11.2044 21 10.4413 20.6839 9.87868 20.1213C9.31607 19.5587 9 18.7956 9 18V17" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><p>No notifications</p></div>`;
        }
        return x `<div style="height:calc(100vh - 20px)" class="w-1/5 flex flex-col fixed left-56 bottom-4 z-10 bg-neutral-50 dark:bg-neutral-800 rounded border-l border-neutral-200 dark:border-neutral-700"><div class="py-4 pl-6 pr-2 flex items-center justify-between border-b border-solid dark:border-neutral-600 text-2xl"><h3>Notifications</h3><button type="button" class="px-2" @click="${() => this.toggleNotifications()}">×</button></div>${panel}</div>`;
    }
    render() {
        // both panel and banner can be visible at the same time
        let display = new Array();
        if (this.banner) {
            display.push(this.renderBanner(this.notifications[0]));
        }
        if (!this.hidden) {
            display.push(this.renderPanel());
        }
        return x `${display}`;
    }
}
wtNotif.properties = {
    notifications: { type: Array },
    hidden: { type: Boolean },
    banner: { type: Boolean },
};
const notifListeners = new Set();
let evtSource = null;
const notifElement = document.getElementById("notifications");
console.assert(notifElement !== undefined, "No notification element on page, menu will not be triggered");
/** notify sends a notification to the user
 *
 * This is the JS equivalent of the Go code, and should only be used if the user can meaningfully act on the issue.
 * This call does not block the continuation of the flow, using a micro-task.
 */
const notify = (ID, Message, Err = false, Actions = []) => {
    queueMicrotask(() => {
        for (const l of notifListeners) {
            l.notify({ ID, Message, Err, Actions });
        }
    });
};
customElements.define("wt-notif", wtNotif);

const emptyUlid = Array(26).fill("0").join("");
/**
 * @returns null in case of error
 */
async function fetchPivot(id) {
    const params = new URLSearchParams();
    params.append("action", "read");
    params.append("pivot", id);
    try {
        const pivot = await fetch("/api/pivot?" + params.toString()).then((r) => r.json());
        return pivot;
    }
    catch (err) {
        console.error(`Error: could not fetch pivot ${id}`);
        return null;
    }
}
async function fetchNotebook(ID) {
    const r = await fetch("/api/notebook?action=read", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ID }),
    });
    if (r.status !== 200) {
        notify(ID, "the notebook could not be retrieved, retrying usually helps", true);
        return null;
    }
    try {
        const notebook = await r.json();
        // API may omit empty fields, add relevant default values
        if (!notebook.Cells) {
            notebook.Cells = [];
        }
        if (!notebook.Title) {
            notebook.Title = "";
        }
        return notebook;
    }
    catch (err) {
        console.error("Could not read response");
    }
    return null;
}

class DatasourceReplace extends TWElement {
    constructor() {
        super();
        this.datasources = [];
        this.datasourcelist = [];
    }
    firstUpdated() {
        this.fetchNotebook();
        this.fetchDatasources();
    }
    async fetchNotebook() {
        if (!this.notebookId) {
            return;
        }
        const nb = await fetchNotebook(this.notebookId);
        this.notebook = nb;
        return;
    }
    async fetchDatasources() {
        if (!this.notebook) {
            this.notebook = JSON.parse(this.nb);
        }
        try {
            this.datasources = await fetch("/datasources/list").then((r) => r.json());
        }
        catch (err) {
            console.error(err);
        }
        finally {
            this.getStreamList();
        }
    }
    getStreamList() {
        let ds = [];
        for (const src of this.datasources) {
            for (const stream of src.Streams) {
                ds.push({
                    id: stream.ID,
                    title: src.Title,
                });
            }
        }
        this.datasourcelist = ds;
    }
    saveNotebook() {
        if (this.isAudit) {
            // send to audit
            this.dispatchEvent(new CustomEvent("replace-datasource", {
                detail: {
                    notebook: this.notebook,
                },
            }));
            this.close();
            return;
        }
        fetch("/api/nbar?action=replace", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.notebook),
        });
        this.close();
        window.location.reload();
    }
    replaceDatasource(c, ev) {
        for (const cell of this.notebook.Cells) {
            if (cell.ID == c) {
                cell.DataSource = ev.target.value;
            }
        }
    }
    getCells() {
        let cells = [];
        if (this.notebook) {
            let c = 1;
            for (const cell of this.notebook.Cells) {
                cells.push(x `<div class="flex justify-between items-center py-4 border-b border-solid dark:border-neutral-600"><div class="text-base">${cell.Title ? cell.Title : "Cell #" + c}</div><select class="border border-zinc-200 bg-zinc-50 rounded-md p-2 focus:outline-0 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500 py-2 px-2 w-2/5" @input="${(ev) => this.replaceDatasource(cell.ID, ev)}"><option value="">Select Datasource</option>${this.datasourcelist.map((ds) => x `<option value="${ds.id}">${ds.title}</option>`)}</select></div>`);
                c++;
            }
        }
        return x `${cells}`;
    }
    close() {
        this.remove();
    }
    render() {
        return x `<div id="datasource-replace" class="center-float w-2/5 h-3/4 z-50 p-6 text-sm shadow-md border dark:border-neutral-700 rounded-sm bg-zinc-50 dark:bg-neutral-800 dark:text-neutral-50"><h1 class="text-2xl">Replace Datasources</h1><div class="py-4 h-3/4 overflow-auto">${this.getCells()}</div><div class="flex justify-end absolute bottom-4 right-4"><button class="py-3 px-6 flex items-center bg-yellow-400 rounded text-neutral-900 text-sm font-medium cursor-pointer mr-2" @click="${this.close}">Cancel</button> <button class="py-3 px-6 flex items-center bg-yellow-400 rounded text-neutral-900 text-sm font-medium cursor-pointer" @click="${this.saveNotebook}">Replace</button></div></div>`;
    }
}
DatasourceReplace.properties = {
    notebookId: { type: String },
    notebook: { state: true },
    datasourcelist: { state: true },
    isAudit: { type: Boolean },
    nb: { type: String },
};
customElements.define("wt-datasource-replace", DatasourceReplace);

// ::- Persistent data structure representing an ordered mapping from
// strings to values, with some convenient update methods.
function OrderedMap(content) {
  this.content = content;
}

OrderedMap.prototype = {
  constructor: OrderedMap,

  find: function(key) {
    for (var i = 0; i < this.content.length; i += 2)
      if (this.content[i] === key) return i
    return -1
  },

  // :: (string) → ?any
  // Retrieve the value stored under `key`, or return undefined when
  // no such key exists.
  get: function(key) {
    var found = this.find(key);
    return found == -1 ? undefined : this.content[found + 1]
  },

  // :: (string, any, ?string) → OrderedMap
  // Create a new map by replacing the value of `key` with a new
  // value, or adding a binding to the end of the map. If `newKey` is
  // given, the key of the binding will be replaced with that key.
  update: function(key, value, newKey) {
    var self = newKey && newKey != key ? this.remove(newKey) : this;
    var found = self.find(key), content = self.content.slice();
    if (found == -1) {
      content.push(newKey || key, value);
    } else {
      content[found + 1] = value;
      if (newKey) content[found] = newKey;
    }
    return new OrderedMap(content)
  },

  // :: (string) → OrderedMap
  // Return a map with the given key removed, if it existed.
  remove: function(key) {
    var found = this.find(key);
    if (found == -1) return this
    var content = this.content.slice();
    content.splice(found, 2);
    return new OrderedMap(content)
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the start of the map.
  addToStart: function(key, value) {
    return new OrderedMap([key, value].concat(this.remove(key).content))
  },

  // :: (string, any) → OrderedMap
  // Add a new key to the end of the map.
  addToEnd: function(key, value) {
    var content = this.remove(key).content.slice();
    content.push(key, value);
    return new OrderedMap(content)
  },

  // :: (string, string, any) → OrderedMap
  // Add a key after the given key. If `place` is not found, the new
  // key is added to the end.
  addBefore: function(place, key, value) {
    var without = this.remove(key), content = without.content.slice();
    var found = without.find(place);
    content.splice(found == -1 ? content.length : found, 0, key, value);
    return new OrderedMap(content)
  },

  // :: ((key: string, value: any))
  // Call the given function for each key/value pair in the map, in
  // order.
  forEach: function(f) {
    for (var i = 0; i < this.content.length; i += 2)
      f(this.content[i], this.content[i + 1]);
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by prepending the keys in this map that don't
  // appear in `map` before the keys in `map`.
  prepend: function(map) {
    map = OrderedMap.from(map);
    if (!map.size) return this
    return new OrderedMap(map.content.concat(this.subtract(map).content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a new map by appending the keys in this map that don't
  // appear in `map` after the keys in `map`.
  append: function(map) {
    map = OrderedMap.from(map);
    if (!map.size) return this
    return new OrderedMap(this.subtract(map).content.concat(map.content))
  },

  // :: (union<Object, OrderedMap>) → OrderedMap
  // Create a map containing all the keys in this map that don't
  // appear in `map`.
  subtract: function(map) {
    var result = this;
    map = OrderedMap.from(map);
    for (var i = 0; i < map.content.length; i += 2)
      result = result.remove(map.content[i]);
    return result
  },

  // :: () → Object
  // Turn ordered map into a plain object.
  toObject: function() {
    var result = {};
    this.forEach(function(key, value) { result[key] = value; });
    return result
  },

  // :: number
  // The amount of keys in this map.
  get size() {
    return this.content.length >> 1
  }
};

// :: (?union<Object, OrderedMap>) → OrderedMap
// Return a map with the given content. If null, create an empty
// map. If given an ordered map, return that map itself. If given an
// object, create a map from the object's properties.
OrderedMap.from = function(value) {
  if (value instanceof OrderedMap) return value
  var content = [];
  if (value) for (var prop in value) content.push(prop, value[prop]);
  return new OrderedMap(content)
};

function findDiffStart(a, b, pos) {
    for (let i = 0;; i++) {
        if (i == a.childCount || i == b.childCount)
            return a.childCount == b.childCount ? null : pos;
        let childA = a.child(i), childB = b.child(i);
        if (childA == childB) {
            pos += childA.nodeSize;
            continue;
        }
        if (!childA.sameMarkup(childB))
            return pos;
        if (childA.isText && childA.text != childB.text) {
            for (let j = 0; childA.text[j] == childB.text[j]; j++)
                pos++;
            return pos;
        }
        if (childA.content.size || childB.content.size) {
            let inner = findDiffStart(childA.content, childB.content, pos + 1);
            if (inner != null)
                return inner;
        }
        pos += childA.nodeSize;
    }
}
function findDiffEnd(a, b, posA, posB) {
    for (let iA = a.childCount, iB = b.childCount;;) {
        if (iA == 0 || iB == 0)
            return iA == iB ? null : { a: posA, b: posB };
        let childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize;
        if (childA == childB) {
            posA -= size;
            posB -= size;
            continue;
        }
        if (!childA.sameMarkup(childB))
            return { a: posA, b: posB };
        if (childA.isText && childA.text != childB.text) {
            let same = 0, minSize = Math.min(childA.text.length, childB.text.length);
            while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
                same++;
                posA--;
                posB--;
            }
            return { a: posA, b: posB };
        }
        if (childA.content.size || childB.content.size) {
            let inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
            if (inner)
                return inner;
        }
        posA -= size;
        posB -= size;
    }
}

/**
A fragment represents a node's collection of child nodes.

Like nodes, fragments are persistent data structures, and you
should not mutate them or their content. Rather, you create new
instances whenever needed. The API tries to make this easy.
*/
class Fragment {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    content, size) {
        this.content = content;
        this.size = size || 0;
        if (size == null)
            for (let i = 0; i < content.length; i++)
                this.size += content[i].nodeSize;
    }
    /**
    Invoke a callback for all descendant nodes between the given two
    positions (relative to start of this fragment). Doesn't descend
    into a node when the callback returns `false`.
    */
    nodesBetween(from, to, f, nodeStart = 0, parent) {
        for (let i = 0, pos = 0; pos < to; i++) {
            let child = this.content[i], end = pos + child.nodeSize;
            if (end > from && f(child, nodeStart + pos, parent || null, i) !== false && child.content.size) {
                let start = pos + 1;
                child.nodesBetween(Math.max(0, from - start), Math.min(child.content.size, to - start), f, nodeStart + start);
            }
            pos = end;
        }
    }
    /**
    Call the given callback for every descendant node. `pos` will be
    relative to the start of the fragment. The callback may return
    `false` to prevent traversal of a given node's children.
    */
    descendants(f) {
        this.nodesBetween(0, this.size, f);
    }
    /**
    Extract the text between `from` and `to`. See the same method on
    [`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
    */
    textBetween(from, to, blockSeparator, leafText) {
        let text = "", separated = true;
        this.nodesBetween(from, to, (node, pos) => {
            if (node.isText) {
                text += node.text.slice(Math.max(from, pos) - pos, to - pos);
                separated = !blockSeparator;
            }
            else if (node.isLeaf) {
                if (leafText) {
                    text += typeof leafText === "function" ? leafText(node) : leafText;
                }
                else if (node.type.spec.leafText) {
                    text += node.type.spec.leafText(node);
                }
                separated = !blockSeparator;
            }
            else if (!separated && node.isBlock) {
                text += blockSeparator;
                separated = true;
            }
        }, 0);
        return text;
    }
    /**
    Create a new fragment containing the combined content of this
    fragment and the other.
    */
    append(other) {
        if (!other.size)
            return this;
        if (!this.size)
            return other;
        let last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0;
        if (last.isText && last.sameMarkup(first)) {
            content[content.length - 1] = last.withText(last.text + first.text);
            i = 1;
        }
        for (; i < other.content.length; i++)
            content.push(other.content[i]);
        return new Fragment(content, this.size + other.size);
    }
    /**
    Cut out the sub-fragment between the two given positions.
    */
    cut(from, to = this.size) {
        if (from == 0 && to == this.size)
            return this;
        let result = [], size = 0;
        if (to > from)
            for (let i = 0, pos = 0; pos < to; i++) {
                let child = this.content[i], end = pos + child.nodeSize;
                if (end > from) {
                    if (pos < from || end > to) {
                        if (child.isText)
                            child = child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos));
                        else
                            child = child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1));
                    }
                    result.push(child);
                    size += child.nodeSize;
                }
                pos = end;
            }
        return new Fragment(result, size);
    }
    /**
    @internal
    */
    cutByIndex(from, to) {
        if (from == to)
            return Fragment.empty;
        if (from == 0 && to == this.content.length)
            return this;
        return new Fragment(this.content.slice(from, to));
    }
    /**
    Create a new fragment in which the node at the given index is
    replaced by the given node.
    */
    replaceChild(index, node) {
        let current = this.content[index];
        if (current == node)
            return this;
        let copy = this.content.slice();
        let size = this.size + node.nodeSize - current.nodeSize;
        copy[index] = node;
        return new Fragment(copy, size);
    }
    /**
    Create a new fragment by prepending the given node to this
    fragment.
    */
    addToStart(node) {
        return new Fragment([node].concat(this.content), this.size + node.nodeSize);
    }
    /**
    Create a new fragment by appending the given node to this
    fragment.
    */
    addToEnd(node) {
        return new Fragment(this.content.concat(node), this.size + node.nodeSize);
    }
    /**
    Compare this fragment to another one.
    */
    eq(other) {
        if (this.content.length != other.content.length)
            return false;
        for (let i = 0; i < this.content.length; i++)
            if (!this.content[i].eq(other.content[i]))
                return false;
        return true;
    }
    /**
    The first child of the fragment, or `null` if it is empty.
    */
    get firstChild() { return this.content.length ? this.content[0] : null; }
    /**
    The last child of the fragment, or `null` if it is empty.
    */
    get lastChild() { return this.content.length ? this.content[this.content.length - 1] : null; }
    /**
    The number of child nodes in this fragment.
    */
    get childCount() { return this.content.length; }
    /**
    Get the child node at the given index. Raise an error when the
    index is out of range.
    */
    child(index) {
        let found = this.content[index];
        if (!found)
            throw new RangeError("Index " + index + " out of range for " + this);
        return found;
    }
    /**
    Get the child node at the given index, if it exists.
    */
    maybeChild(index) {
        return this.content[index] || null;
    }
    /**
    Call `f` for every child node, passing the node, its offset
    into this parent node, and its index.
    */
    forEach(f) {
        for (let i = 0, p = 0; i < this.content.length; i++) {
            let child = this.content[i];
            f(child, p, i);
            p += child.nodeSize;
        }
    }
    /**
    Find the first position at which this fragment and another
    fragment differ, or `null` if they are the same.
    */
    findDiffStart(other, pos = 0) {
        return findDiffStart(this, other, pos);
    }
    /**
    Find the first position, searching from the end, at which this
    fragment and the given fragment differ, or `null` if they are
    the same. Since this position will not be the same in both
    nodes, an object with two separate positions is returned.
    */
    findDiffEnd(other, pos = this.size, otherPos = other.size) {
        return findDiffEnd(this, other, pos, otherPos);
    }
    /**
    Find the index and inner offset corresponding to a given relative
    position in this fragment. The result object will be reused
    (overwritten) the next time the function is called. (Not public.)
    */
    findIndex(pos, round = -1) {
        if (pos == 0)
            return retIndex(0, pos);
        if (pos == this.size)
            return retIndex(this.content.length, pos);
        if (pos > this.size || pos < 0)
            throw new RangeError(`Position ${pos} outside of fragment (${this})`);
        for (let i = 0, curPos = 0;; i++) {
            let cur = this.child(i), end = curPos + cur.nodeSize;
            if (end >= pos) {
                if (end == pos || round > 0)
                    return retIndex(i + 1, end);
                return retIndex(i, curPos);
            }
            curPos = end;
        }
    }
    /**
    Return a debugging string that describes this fragment.
    */
    toString() { return "<" + this.toStringInner() + ">"; }
    /**
    @internal
    */
    toStringInner() { return this.content.join(", "); }
    /**
    Create a JSON-serializeable representation of this fragment.
    */
    toJSON() {
        return this.content.length ? this.content.map(n => n.toJSON()) : null;
    }
    /**
    Deserialize a fragment from its JSON representation.
    */
    static fromJSON(schema, value) {
        if (!value)
            return Fragment.empty;
        if (!Array.isArray(value))
            throw new RangeError("Invalid input for Fragment.fromJSON");
        return new Fragment(value.map(schema.nodeFromJSON));
    }
    /**
    Build a fragment from an array of nodes. Ensures that adjacent
    text nodes with the same marks are joined together.
    */
    static fromArray(array) {
        if (!array.length)
            return Fragment.empty;
        let joined, size = 0;
        for (let i = 0; i < array.length; i++) {
            let node = array[i];
            size += node.nodeSize;
            if (i && node.isText && array[i - 1].sameMarkup(node)) {
                if (!joined)
                    joined = array.slice(0, i);
                joined[joined.length - 1] = node
                    .withText(joined[joined.length - 1].text + node.text);
            }
            else if (joined) {
                joined.push(node);
            }
        }
        return new Fragment(joined || array, size);
    }
    /**
    Create a fragment from something that can be interpreted as a
    set of nodes. For `null`, it returns the empty fragment. For a
    fragment, the fragment itself. For a node or array of nodes, a
    fragment containing those nodes.
    */
    static from(nodes) {
        if (!nodes)
            return Fragment.empty;
        if (nodes instanceof Fragment)
            return nodes;
        if (Array.isArray(nodes))
            return this.fromArray(nodes);
        if (nodes.attrs)
            return new Fragment([nodes], nodes.nodeSize);
        throw new RangeError("Can not convert " + nodes + " to a Fragment" +
            (nodes.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
    }
}
/**
An empty fragment. Intended to be reused whenever a node doesn't
contain anything (rather than allocating a new empty fragment for
each leaf node).
*/
Fragment.empty = new Fragment([], 0);
const found = { index: 0, offset: 0 };
function retIndex(index, offset) {
    found.index = index;
    found.offset = offset;
    return found;
}

function compareDeep(a, b) {
    if (a === b)
        return true;
    if (!(a && typeof a == "object") ||
        !(b && typeof b == "object"))
        return false;
    let array = Array.isArray(a);
    if (Array.isArray(b) != array)
        return false;
    if (array) {
        if (a.length != b.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (!compareDeep(a[i], b[i]))
                return false;
    }
    else {
        for (let p in a)
            if (!(p in b) || !compareDeep(a[p], b[p]))
                return false;
        for (let p in b)
            if (!(p in a))
                return false;
    }
    return true;
}

/**
A mark is a piece of information that can be attached to a node,
such as it being emphasized, in code font, or a link. It has a
type and optionally a set of attributes that provide further
information (such as the target of the link). Marks are created
through a `Schema`, which controls which types exist and which
attributes they have.
*/
class Mark {
    /**
    @internal
    */
    constructor(
    /**
    The type of this mark.
    */
    type, 
    /**
    The attributes associated with this mark.
    */
    attrs) {
        this.type = type;
        this.attrs = attrs;
    }
    /**
    Given a set of marks, create a new set which contains this one as
    well, in the right position. If this mark is already in the set,
    the set itself is returned. If any marks that are set to be
    [exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
    those are replaced by this one.
    */
    addToSet(set) {
        let copy, placed = false;
        for (let i = 0; i < set.length; i++) {
            let other = set[i];
            if (this.eq(other))
                return set;
            if (this.type.excludes(other.type)) {
                if (!copy)
                    copy = set.slice(0, i);
            }
            else if (other.type.excludes(this.type)) {
                return set;
            }
            else {
                if (!placed && other.type.rank > this.type.rank) {
                    if (!copy)
                        copy = set.slice(0, i);
                    copy.push(this);
                    placed = true;
                }
                if (copy)
                    copy.push(other);
            }
        }
        if (!copy)
            copy = set.slice();
        if (!placed)
            copy.push(this);
        return copy;
    }
    /**
    Remove this mark from the given set, returning a new set. If this
    mark is not in the set, the set itself is returned.
    */
    removeFromSet(set) {
        for (let i = 0; i < set.length; i++)
            if (this.eq(set[i]))
                return set.slice(0, i).concat(set.slice(i + 1));
        return set;
    }
    /**
    Test whether this mark is in the given set of marks.
    */
    isInSet(set) {
        for (let i = 0; i < set.length; i++)
            if (this.eq(set[i]))
                return true;
        return false;
    }
    /**
    Test whether this mark has the same type and attributes as
    another mark.
    */
    eq(other) {
        return this == other ||
            (this.type == other.type && compareDeep(this.attrs, other.attrs));
    }
    /**
    Convert this mark to a JSON-serializeable representation.
    */
    toJSON() {
        let obj = { type: this.type.name };
        for (let _ in this.attrs) {
            obj.attrs = this.attrs;
            break;
        }
        return obj;
    }
    /**
    Deserialize a mark from JSON.
    */
    static fromJSON(schema, json) {
        if (!json)
            throw new RangeError("Invalid input for Mark.fromJSON");
        let type = schema.marks[json.type];
        if (!type)
            throw new RangeError(`There is no mark type ${json.type} in this schema`);
        return type.create(json.attrs);
    }
    /**
    Test whether two sets of marks are identical.
    */
    static sameSet(a, b) {
        if (a == b)
            return true;
        if (a.length != b.length)
            return false;
        for (let i = 0; i < a.length; i++)
            if (!a[i].eq(b[i]))
                return false;
        return true;
    }
    /**
    Create a properly sorted mark set from null, a single mark, or an
    unsorted array of marks.
    */
    static setFrom(marks) {
        if (!marks || Array.isArray(marks) && marks.length == 0)
            return Mark.none;
        if (marks instanceof Mark)
            return [marks];
        let copy = marks.slice();
        copy.sort((a, b) => a.type.rank - b.type.rank);
        return copy;
    }
}
/**
The empty set of marks.
*/
Mark.none = [];

/**
Error type raised by [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) when
given an invalid replacement.
*/
class ReplaceError extends Error {
}
/*
ReplaceError = function(this: any, message: string) {
  let err = Error.call(this, message)
  ;(err as any).__proto__ = ReplaceError.prototype
  return err
} as any

ReplaceError.prototype = Object.create(Error.prototype)
ReplaceError.prototype.constructor = ReplaceError
ReplaceError.prototype.name = "ReplaceError"
*/
/**
A slice represents a piece cut out of a larger document. It
stores not only a fragment, but also the depth up to which nodes on
both side are ‘open’ (cut through).
*/
class Slice {
    /**
    Create a slice. When specifying a non-zero open depth, you must
    make sure that there are nodes of at least that depth at the
    appropriate side of the fragment—i.e. if the fragment is an
    empty paragraph node, `openStart` and `openEnd` can't be greater
    than 1.
    
    It is not necessary for the content of open nodes to conform to
    the schema's content constraints, though it should be a valid
    start/end/middle for such a node, depending on which sides are
    open.
    */
    constructor(
    /**
    The slice's content.
    */
    content, 
    /**
    The open depth at the start of the fragment.
    */
    openStart, 
    /**
    The open depth at the end.
    */
    openEnd) {
        this.content = content;
        this.openStart = openStart;
        this.openEnd = openEnd;
    }
    /**
    The size this slice would add when inserted into a document.
    */
    get size() {
        return this.content.size - this.openStart - this.openEnd;
    }
    /**
    @internal
    */
    insertAt(pos, fragment) {
        let content = insertInto(this.content, pos + this.openStart, fragment);
        return content && new Slice(content, this.openStart, this.openEnd);
    }
    /**
    @internal
    */
    removeBetween(from, to) {
        return new Slice(removeRange(this.content, from + this.openStart, to + this.openStart), this.openStart, this.openEnd);
    }
    /**
    Tests whether this slice is equal to another slice.
    */
    eq(other) {
        return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd;
    }
    /**
    @internal
    */
    toString() {
        return this.content + "(" + this.openStart + "," + this.openEnd + ")";
    }
    /**
    Convert a slice to a JSON-serializable representation.
    */
    toJSON() {
        if (!this.content.size)
            return null;
        let json = { content: this.content.toJSON() };
        if (this.openStart > 0)
            json.openStart = this.openStart;
        if (this.openEnd > 0)
            json.openEnd = this.openEnd;
        return json;
    }
    /**
    Deserialize a slice from its JSON representation.
    */
    static fromJSON(schema, json) {
        if (!json)
            return Slice.empty;
        let openStart = json.openStart || 0, openEnd = json.openEnd || 0;
        if (typeof openStart != "number" || typeof openEnd != "number")
            throw new RangeError("Invalid input for Slice.fromJSON");
        return new Slice(Fragment.fromJSON(schema, json.content), openStart, openEnd);
    }
    /**
    Create a slice from a fragment by taking the maximum possible
    open value on both side of the fragment.
    */
    static maxOpen(fragment, openIsolating = true) {
        let openStart = 0, openEnd = 0;
        for (let n = fragment.firstChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.firstChild)
            openStart++;
        for (let n = fragment.lastChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.lastChild)
            openEnd++;
        return new Slice(fragment, openStart, openEnd);
    }
}
/**
The empty slice.
*/
Slice.empty = new Slice(Fragment.empty, 0, 0);
function removeRange(content, from, to) {
    let { index, offset } = content.findIndex(from), child = content.maybeChild(index);
    let { index: indexTo, offset: offsetTo } = content.findIndex(to);
    if (offset == from || child.isText) {
        if (offsetTo != to && !content.child(indexTo).isText)
            throw new RangeError("Removing non-flat range");
        return content.cut(0, from).append(content.cut(to));
    }
    if (index != indexTo)
        throw new RangeError("Removing non-flat range");
    return content.replaceChild(index, child.copy(removeRange(child.content, from - offset - 1, to - offset - 1)));
}
function insertInto(content, dist, insert, parent) {
    let { index, offset } = content.findIndex(dist), child = content.maybeChild(index);
    if (offset == dist || child.isText) {
        if (parent && !parent.canReplace(index, index, insert))
            return null;
        return content.cut(0, dist).append(insert).append(content.cut(dist));
    }
    let inner = insertInto(child.content, dist - offset - 1, insert);
    return inner && content.replaceChild(index, child.copy(inner));
}
function replace($from, $to, slice) {
    if (slice.openStart > $from.depth)
        throw new ReplaceError("Inserted content deeper than insertion position");
    if ($from.depth - slice.openStart != $to.depth - slice.openEnd)
        throw new ReplaceError("Inconsistent open depths");
    return replaceOuter($from, $to, slice, 0);
}
function replaceOuter($from, $to, slice, depth) {
    let index = $from.index(depth), node = $from.node(depth);
    if (index == $to.index(depth) && depth < $from.depth - slice.openStart) {
        let inner = replaceOuter($from, $to, slice, depth + 1);
        return node.copy(node.content.replaceChild(index, inner));
    }
    else if (!slice.content.size) {
        return close(node, replaceTwoWay($from, $to, depth));
    }
    else if (!slice.openStart && !slice.openEnd && $from.depth == depth && $to.depth == depth) { // Simple, flat case
        let parent = $from.parent, content = parent.content;
        return close(parent, content.cut(0, $from.parentOffset).append(slice.content).append(content.cut($to.parentOffset)));
    }
    else {
        let { start, end } = prepareSliceForReplace(slice, $from);
        return close(node, replaceThreeWay($from, start, end, $to, depth));
    }
}
function checkJoin(main, sub) {
    if (!sub.type.compatibleContent(main.type))
        throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name);
}
function joinable$1($before, $after, depth) {
    let node = $before.node(depth);
    checkJoin(node, $after.node(depth));
    return node;
}
function addNode(child, target) {
    let last = target.length - 1;
    if (last >= 0 && child.isText && child.sameMarkup(target[last]))
        target[last] = child.withText(target[last].text + child.text);
    else
        target.push(child);
}
function addRange($start, $end, depth, target) {
    let node = ($end || $start).node(depth);
    let startIndex = 0, endIndex = $end ? $end.index(depth) : node.childCount;
    if ($start) {
        startIndex = $start.index(depth);
        if ($start.depth > depth) {
            startIndex++;
        }
        else if ($start.textOffset) {
            addNode($start.nodeAfter, target);
            startIndex++;
        }
    }
    for (let i = startIndex; i < endIndex; i++)
        addNode(node.child(i), target);
    if ($end && $end.depth == depth && $end.textOffset)
        addNode($end.nodeBefore, target);
}
function close(node, content) {
    node.type.checkContent(content);
    return node.copy(content);
}
function replaceThreeWay($from, $start, $end, $to, depth) {
    let openStart = $from.depth > depth && joinable$1($from, $start, depth + 1);
    let openEnd = $to.depth > depth && joinable$1($end, $to, depth + 1);
    let content = [];
    addRange(null, $from, depth, content);
    if (openStart && openEnd && $start.index(depth) == $end.index(depth)) {
        checkJoin(openStart, openEnd);
        addNode(close(openStart, replaceThreeWay($from, $start, $end, $to, depth + 1)), content);
    }
    else {
        if (openStart)
            addNode(close(openStart, replaceTwoWay($from, $start, depth + 1)), content);
        addRange($start, $end, depth, content);
        if (openEnd)
            addNode(close(openEnd, replaceTwoWay($end, $to, depth + 1)), content);
    }
    addRange($to, null, depth, content);
    return new Fragment(content);
}
function replaceTwoWay($from, $to, depth) {
    let content = [];
    addRange(null, $from, depth, content);
    if ($from.depth > depth) {
        let type = joinable$1($from, $to, depth + 1);
        addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content);
    }
    addRange($to, null, depth, content);
    return new Fragment(content);
}
function prepareSliceForReplace(slice, $along) {
    let extra = $along.depth - slice.openStart, parent = $along.node(extra);
    let node = parent.copy(slice.content);
    for (let i = extra - 1; i >= 0; i--)
        node = $along.node(i).copy(Fragment.from(node));
    return { start: node.resolveNoCache(slice.openStart + extra),
        end: node.resolveNoCache(node.content.size - slice.openEnd - extra) };
}

/**
You can [_resolve_](https://prosemirror.net/docs/ref/#model.Node.resolve) a position to get more
information about it. Objects of this class represent such a
resolved position, providing various pieces of context
information, and some helper methods.

Throughout this interface, methods that take an optional `depth`
parameter will interpret undefined as `this.depth` and negative
numbers as `this.depth + value`.
*/
class ResolvedPos {
    /**
    @internal
    */
    constructor(
    /**
    The position that was resolved.
    */
    pos, 
    /**
    @internal
    */
    path, 
    /**
    The offset this position has into its parent node.
    */
    parentOffset) {
        this.pos = pos;
        this.path = path;
        this.parentOffset = parentOffset;
        this.depth = path.length / 3 - 1;
    }
    /**
    @internal
    */
    resolveDepth(val) {
        if (val == null)
            return this.depth;
        if (val < 0)
            return this.depth + val;
        return val;
    }
    /**
    The parent node that the position points into. Note that even if
    a position points into a text node, that node is not considered
    the parent—text nodes are ‘flat’ in this model, and have no content.
    */
    get parent() { return this.node(this.depth); }
    /**
    The root node in which the position was resolved.
    */
    get doc() { return this.node(0); }
    /**
    The ancestor node at the given level. `p.node(p.depth)` is the
    same as `p.parent`.
    */
    node(depth) { return this.path[this.resolveDepth(depth) * 3]; }
    /**
    The index into the ancestor at the given level. If this points
    at the 3rd node in the 2nd paragraph on the top level, for
    example, `p.index(0)` is 1 and `p.index(1)` is 2.
    */
    index(depth) { return this.path[this.resolveDepth(depth) * 3 + 1]; }
    /**
    The index pointing after this position into the ancestor at the
    given level.
    */
    indexAfter(depth) {
        depth = this.resolveDepth(depth);
        return this.index(depth) + (depth == this.depth && !this.textOffset ? 0 : 1);
    }
    /**
    The (absolute) position at the start of the node at the given
    level.
    */
    start(depth) {
        depth = this.resolveDepth(depth);
        return depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
    }
    /**
    The (absolute) position at the end of the node at the given
    level.
    */
    end(depth) {
        depth = this.resolveDepth(depth);
        return this.start(depth) + this.node(depth).content.size;
    }
    /**
    The (absolute) position directly before the wrapping node at the
    given level, or, when `depth` is `this.depth + 1`, the original
    position.
    */
    before(depth) {
        depth = this.resolveDepth(depth);
        if (!depth)
            throw new RangeError("There is no position before the top-level node");
        return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1];
    }
    /**
    The (absolute) position directly after the wrapping node at the
    given level, or the original position when `depth` is `this.depth + 1`.
    */
    after(depth) {
        depth = this.resolveDepth(depth);
        if (!depth)
            throw new RangeError("There is no position after the top-level node");
        return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1] + this.path[depth * 3].nodeSize;
    }
    /**
    When this position points into a text node, this returns the
    distance between the position and the start of the text node.
    Will be zero for positions that point between nodes.
    */
    get textOffset() { return this.pos - this.path[this.path.length - 1]; }
    /**
    Get the node directly after the position, if any. If the position
    points into a text node, only the part of that node after the
    position is returned.
    */
    get nodeAfter() {
        let parent = this.parent, index = this.index(this.depth);
        if (index == parent.childCount)
            return null;
        let dOff = this.pos - this.path[this.path.length - 1], child = parent.child(index);
        return dOff ? parent.child(index).cut(dOff) : child;
    }
    /**
    Get the node directly before the position, if any. If the
    position points into a text node, only the part of that node
    before the position is returned.
    */
    get nodeBefore() {
        let index = this.index(this.depth);
        let dOff = this.pos - this.path[this.path.length - 1];
        if (dOff)
            return this.parent.child(index).cut(0, dOff);
        return index == 0 ? null : this.parent.child(index - 1);
    }
    /**
    Get the position at the given index in the parent node at the
    given depth (which defaults to `this.depth`).
    */
    posAtIndex(index, depth) {
        depth = this.resolveDepth(depth);
        let node = this.path[depth * 3], pos = depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
        for (let i = 0; i < index; i++)
            pos += node.child(i).nodeSize;
        return pos;
    }
    /**
    Get the marks at this position, factoring in the surrounding
    marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
    position is at the start of a non-empty node, the marks of the
    node after it (if any) are returned.
    */
    marks() {
        let parent = this.parent, index = this.index();
        // In an empty parent, return the empty array
        if (parent.content.size == 0)
            return Mark.none;
        // When inside a text node, just return the text node's marks
        if (this.textOffset)
            return parent.child(index).marks;
        let main = parent.maybeChild(index - 1), other = parent.maybeChild(index);
        // If the `after` flag is true of there is no node before, make
        // the node after this position the main reference.
        if (!main) {
            let tmp = main;
            main = other;
            other = tmp;
        }
        // Use all marks in the main node, except those that have
        // `inclusive` set to false and are not present in the other node.
        let marks = main.marks;
        for (var i = 0; i < marks.length; i++)
            if (marks[i].type.spec.inclusive === false && (!other || !marks[i].isInSet(other.marks)))
                marks = marks[i--].removeFromSet(marks);
        return marks;
    }
    /**
    Get the marks after the current position, if any, except those
    that are non-inclusive and not present at position `$end`. This
    is mostly useful for getting the set of marks to preserve after a
    deletion. Will return `null` if this position is at the end of
    its parent node or its parent node isn't a textblock (in which
    case no marks should be preserved).
    */
    marksAcross($end) {
        let after = this.parent.maybeChild(this.index());
        if (!after || !after.isInline)
            return null;
        let marks = after.marks, next = $end.parent.maybeChild($end.index());
        for (var i = 0; i < marks.length; i++)
            if (marks[i].type.spec.inclusive === false && (!next || !marks[i].isInSet(next.marks)))
                marks = marks[i--].removeFromSet(marks);
        return marks;
    }
    /**
    The depth up to which this position and the given (non-resolved)
    position share the same parent nodes.
    */
    sharedDepth(pos) {
        for (let depth = this.depth; depth > 0; depth--)
            if (this.start(depth) <= pos && this.end(depth) >= pos)
                return depth;
        return 0;
    }
    /**
    Returns a range based on the place where this position and the
    given position diverge around block content. If both point into
    the same textblock, for example, a range around that textblock
    will be returned. If they point into different blocks, the range
    around those blocks in their shared ancestor is returned. You can
    pass in an optional predicate that will be called with a parent
    node to see if a range into that parent is acceptable.
    */
    blockRange(other = this, pred) {
        if (other.pos < this.pos)
            return other.blockRange(this);
        for (let d = this.depth - (this.parent.inlineContent || this.pos == other.pos ? 1 : 0); d >= 0; d--)
            if (other.pos <= this.end(d) && (!pred || pred(this.node(d))))
                return new NodeRange(this, other, d);
        return null;
    }
    /**
    Query whether the given position shares the same parent node.
    */
    sameParent(other) {
        return this.pos - this.parentOffset == other.pos - other.parentOffset;
    }
    /**
    Return the greater of this and the given position.
    */
    max(other) {
        return other.pos > this.pos ? other : this;
    }
    /**
    Return the smaller of this and the given position.
    */
    min(other) {
        return other.pos < this.pos ? other : this;
    }
    /**
    @internal
    */
    toString() {
        let str = "";
        for (let i = 1; i <= this.depth; i++)
            str += (str ? "/" : "") + this.node(i).type.name + "_" + this.index(i - 1);
        return str + ":" + this.parentOffset;
    }
    /**
    @internal
    */
    static resolve(doc, pos) {
        if (!(pos >= 0 && pos <= doc.content.size))
            throw new RangeError("Position " + pos + " out of range");
        let path = [];
        let start = 0, parentOffset = pos;
        for (let node = doc;;) {
            let { index, offset } = node.content.findIndex(parentOffset);
            let rem = parentOffset - offset;
            path.push(node, index, start + offset);
            if (!rem)
                break;
            node = node.child(index);
            if (node.isText)
                break;
            parentOffset = rem - 1;
            start += offset + 1;
        }
        return new ResolvedPos(pos, path, parentOffset);
    }
    /**
    @internal
    */
    static resolveCached(doc, pos) {
        for (let i = 0; i < resolveCache.length; i++) {
            let cached = resolveCache[i];
            if (cached.pos == pos && cached.doc == doc)
                return cached;
        }
        let result = resolveCache[resolveCachePos] = ResolvedPos.resolve(doc, pos);
        resolveCachePos = (resolveCachePos + 1) % resolveCacheSize;
        return result;
    }
}
let resolveCache = [], resolveCachePos = 0, resolveCacheSize = 12;
/**
Represents a flat range of content, i.e. one that starts and
ends in the same node.
*/
class NodeRange {
    /**
    Construct a node range. `$from` and `$to` should point into the
    same node until at least the given `depth`, since a node range
    denotes an adjacent set of nodes in a single parent node.
    */
    constructor(
    /**
    A resolved position along the start of the content. May have a
    `depth` greater than this object's `depth` property, since
    these are the positions that were used to compute the range,
    not re-resolved positions directly at its boundaries.
    */
    $from, 
    /**
    A position along the end of the content. See
    caveat for [`$from`](https://prosemirror.net/docs/ref/#model.NodeRange.$from).
    */
    $to, 
    /**
    The depth of the node that this range points into.
    */
    depth) {
        this.$from = $from;
        this.$to = $to;
        this.depth = depth;
    }
    /**
    The position at the start of the range.
    */
    get start() { return this.$from.before(this.depth + 1); }
    /**
    The position at the end of the range.
    */
    get end() { return this.$to.after(this.depth + 1); }
    /**
    The parent node that the range points into.
    */
    get parent() { return this.$from.node(this.depth); }
    /**
    The start index of the range in the parent node.
    */
    get startIndex() { return this.$from.index(this.depth); }
    /**
    The end index of the range in the parent node.
    */
    get endIndex() { return this.$to.indexAfter(this.depth); }
}

const emptyAttrs = Object.create(null);
/**
This class represents a node in the tree that makes up a
ProseMirror document. So a document is an instance of `Node`, with
children that are also instances of `Node`.

Nodes are persistent data structures. Instead of changing them, you
create new ones with the content you want. Old ones keep pointing
at the old document shape. This is made cheaper by sharing
structure between the old and new data as much as possible, which a
tree shape like this (without back pointers) makes easy.

**Do not** directly mutate the properties of a `Node` object. See
[the guide](/docs/guide/#doc) for more information.
*/
class Node {
    /**
    @internal
    */
    constructor(
    /**
    The type of node that this is.
    */
    type, 
    /**
    An object mapping attribute names to values. The kind of
    attributes allowed and required are
    [determined](https://prosemirror.net/docs/ref/#model.NodeSpec.attrs) by the node type.
    */
    attrs, 
    // A fragment holding the node's children.
    content, 
    /**
    The marks (things like whether it is emphasized or part of a
    link) applied to this node.
    */
    marks = Mark.none) {
        this.type = type;
        this.attrs = attrs;
        this.marks = marks;
        this.content = content || Fragment.empty;
    }
    /**
    The size of this node, as defined by the integer-based [indexing
    scheme](/docs/guide/#doc.indexing). For text nodes, this is the
    amount of characters. For other leaf nodes, it is one. For
    non-leaf nodes, it is the size of the content plus two (the
    start and end token).
    */
    get nodeSize() { return this.isLeaf ? 1 : 2 + this.content.size; }
    /**
    The number of children that the node has.
    */
    get childCount() { return this.content.childCount; }
    /**
    Get the child node at the given index. Raises an error when the
    index is out of range.
    */
    child(index) { return this.content.child(index); }
    /**
    Get the child node at the given index, if it exists.
    */
    maybeChild(index) { return this.content.maybeChild(index); }
    /**
    Call `f` for every child node, passing the node, its offset
    into this parent node, and its index.
    */
    forEach(f) { this.content.forEach(f); }
    /**
    Invoke a callback for all descendant nodes recursively between
    the given two positions that are relative to start of this
    node's content. The callback is invoked with the node, its
    position relative to the original node (method receiver),
    its parent node, and its child index. When the callback returns
    false for a given node, that node's children will not be
    recursed over. The last parameter can be used to specify a
    starting position to count from.
    */
    nodesBetween(from, to, f, startPos = 0) {
        this.content.nodesBetween(from, to, f, startPos, this);
    }
    /**
    Call the given callback for every descendant node. Doesn't
    descend into a node when the callback returns `false`.
    */
    descendants(f) {
        this.nodesBetween(0, this.content.size, f);
    }
    /**
    Concatenates all the text nodes found in this fragment and its
    children.
    */
    get textContent() {
        return (this.isLeaf && this.type.spec.leafText)
            ? this.type.spec.leafText(this)
            : this.textBetween(0, this.content.size, "");
    }
    /**
    Get all text between positions `from` and `to`. When
    `blockSeparator` is given, it will be inserted to separate text
    from different block nodes. If `leafText` is given, it'll be
    inserted for every non-text leaf node encountered, otherwise
    [`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec^leafText) will be used.
    */
    textBetween(from, to, blockSeparator, leafText) {
        return this.content.textBetween(from, to, blockSeparator, leafText);
    }
    /**
    Returns this node's first child, or `null` if there are no
    children.
    */
    get firstChild() { return this.content.firstChild; }
    /**
    Returns this node's last child, or `null` if there are no
    children.
    */
    get lastChild() { return this.content.lastChild; }
    /**
    Test whether two nodes represent the same piece of document.
    */
    eq(other) {
        return this == other || (this.sameMarkup(other) && this.content.eq(other.content));
    }
    /**
    Compare the markup (type, attributes, and marks) of this node to
    those of another. Returns `true` if both have the same markup.
    */
    sameMarkup(other) {
        return this.hasMarkup(other.type, other.attrs, other.marks);
    }
    /**
    Check whether this node's markup correspond to the given type,
    attributes, and marks.
    */
    hasMarkup(type, attrs, marks) {
        return this.type == type &&
            compareDeep(this.attrs, attrs || type.defaultAttrs || emptyAttrs) &&
            Mark.sameSet(this.marks, marks || Mark.none);
    }
    /**
    Create a new node with the same markup as this node, containing
    the given content (or empty, if no content is given).
    */
    copy(content = null) {
        if (content == this.content)
            return this;
        return new Node(this.type, this.attrs, content, this.marks);
    }
    /**
    Create a copy of this node, with the given set of marks instead
    of the node's own marks.
    */
    mark(marks) {
        return marks == this.marks ? this : new Node(this.type, this.attrs, this.content, marks);
    }
    /**
    Create a copy of this node with only the content between the
    given positions. If `to` is not given, it defaults to the end of
    the node.
    */
    cut(from, to = this.content.size) {
        if (from == 0 && to == this.content.size)
            return this;
        return this.copy(this.content.cut(from, to));
    }
    /**
    Cut out the part of the document between the given positions, and
    return it as a `Slice` object.
    */
    slice(from, to = this.content.size, includeParents = false) {
        if (from == to)
            return Slice.empty;
        let $from = this.resolve(from), $to = this.resolve(to);
        let depth = includeParents ? 0 : $from.sharedDepth(to);
        let start = $from.start(depth), node = $from.node(depth);
        let content = node.content.cut($from.pos - start, $to.pos - start);
        return new Slice(content, $from.depth - depth, $to.depth - depth);
    }
    /**
    Replace the part of the document between the given positions with
    the given slice. The slice must 'fit', meaning its open sides
    must be able to connect to the surrounding content, and its
    content nodes must be valid children for the node they are placed
    into. If any of this is violated, an error of type
    [`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
    */
    replace(from, to, slice) {
        return replace(this.resolve(from), this.resolve(to), slice);
    }
    /**
    Find the node directly after the given position.
    */
    nodeAt(pos) {
        for (let node = this;;) {
            let { index, offset } = node.content.findIndex(pos);
            node = node.maybeChild(index);
            if (!node)
                return null;
            if (offset == pos || node.isText)
                return node;
            pos -= offset + 1;
        }
    }
    /**
    Find the (direct) child node after the given offset, if any,
    and return it along with its index and offset relative to this
    node.
    */
    childAfter(pos) {
        let { index, offset } = this.content.findIndex(pos);
        return { node: this.content.maybeChild(index), index, offset };
    }
    /**
    Find the (direct) child node before the given offset, if any,
    and return it along with its index and offset relative to this
    node.
    */
    childBefore(pos) {
        if (pos == 0)
            return { node: null, index: 0, offset: 0 };
        let { index, offset } = this.content.findIndex(pos);
        if (offset < pos)
            return { node: this.content.child(index), index, offset };
        let node = this.content.child(index - 1);
        return { node, index: index - 1, offset: offset - node.nodeSize };
    }
    /**
    Resolve the given position in the document, returning an
    [object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
    */
    resolve(pos) { return ResolvedPos.resolveCached(this, pos); }
    /**
    @internal
    */
    resolveNoCache(pos) { return ResolvedPos.resolve(this, pos); }
    /**
    Test whether a given mark or mark type occurs in this document
    between the two given positions.
    */
    rangeHasMark(from, to, type) {
        let found = false;
        if (to > from)
            this.nodesBetween(from, to, node => {
                if (type.isInSet(node.marks))
                    found = true;
                return !found;
            });
        return found;
    }
    /**
    True when this is a block (non-inline node)
    */
    get isBlock() { return this.type.isBlock; }
    /**
    True when this is a textblock node, a block node with inline
    content.
    */
    get isTextblock() { return this.type.isTextblock; }
    /**
    True when this node allows inline content.
    */
    get inlineContent() { return this.type.inlineContent; }
    /**
    True when this is an inline node (a text node or a node that can
    appear among text).
    */
    get isInline() { return this.type.isInline; }
    /**
    True when this is a text node.
    */
    get isText() { return this.type.isText; }
    /**
    True when this is a leaf node.
    */
    get isLeaf() { return this.type.isLeaf; }
    /**
    True when this is an atom, i.e. when it does not have directly
    editable content. This is usually the same as `isLeaf`, but can
    be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
    on a node's spec (typically used when the node is displayed as
    an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
    */
    get isAtom() { return this.type.isAtom; }
    /**
    Return a string representation of this node for debugging
    purposes.
    */
    toString() {
        if (this.type.spec.toDebugString)
            return this.type.spec.toDebugString(this);
        let name = this.type.name;
        if (this.content.size)
            name += "(" + this.content.toStringInner() + ")";
        return wrapMarks(this.marks, name);
    }
    /**
    Get the content match in this node at the given index.
    */
    contentMatchAt(index) {
        let match = this.type.contentMatch.matchFragment(this.content, 0, index);
        if (!match)
            throw new Error("Called contentMatchAt on a node with invalid content");
        return match;
    }
    /**
    Test whether replacing the range between `from` and `to` (by
    child index) with the given replacement fragment (which defaults
    to the empty fragment) would leave the node's content valid. You
    can optionally pass `start` and `end` indices into the
    replacement fragment.
    */
    canReplace(from, to, replacement = Fragment.empty, start = 0, end = replacement.childCount) {
        let one = this.contentMatchAt(from).matchFragment(replacement, start, end);
        let two = one && one.matchFragment(this.content, to);
        if (!two || !two.validEnd)
            return false;
        for (let i = start; i < end; i++)
            if (!this.type.allowsMarks(replacement.child(i).marks))
                return false;
        return true;
    }
    /**
    Test whether replacing the range `from` to `to` (by index) with
    a node of the given type would leave the node's content valid.
    */
    canReplaceWith(from, to, type, marks) {
        if (marks && !this.type.allowsMarks(marks))
            return false;
        let start = this.contentMatchAt(from).matchType(type);
        let end = start && start.matchFragment(this.content, to);
        return end ? end.validEnd : false;
    }
    /**
    Test whether the given node's content could be appended to this
    node. If that node is empty, this will only return true if there
    is at least one node type that can appear in both nodes (to avoid
    merging completely incompatible nodes).
    */
    canAppend(other) {
        if (other.content.size)
            return this.canReplace(this.childCount, this.childCount, other.content);
        else
            return this.type.compatibleContent(other.type);
    }
    /**
    Check whether this node and its descendants conform to the
    schema, and raise error when they do not.
    */
    check() {
        this.type.checkContent(this.content);
        let copy = Mark.none;
        for (let i = 0; i < this.marks.length; i++)
            copy = this.marks[i].addToSet(copy);
        if (!Mark.sameSet(copy, this.marks))
            throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map(m => m.type.name)}`);
        this.content.forEach(node => node.check());
    }
    /**
    Return a JSON-serializeable representation of this node.
    */
    toJSON() {
        let obj = { type: this.type.name };
        for (let _ in this.attrs) {
            obj.attrs = this.attrs;
            break;
        }
        if (this.content.size)
            obj.content = this.content.toJSON();
        if (this.marks.length)
            obj.marks = this.marks.map(n => n.toJSON());
        return obj;
    }
    /**
    Deserialize a node from its JSON representation.
    */
    static fromJSON(schema, json) {
        if (!json)
            throw new RangeError("Invalid input for Node.fromJSON");
        let marks = null;
        if (json.marks) {
            if (!Array.isArray(json.marks))
                throw new RangeError("Invalid mark data for Node.fromJSON");
            marks = json.marks.map(schema.markFromJSON);
        }
        if (json.type == "text") {
            if (typeof json.text != "string")
                throw new RangeError("Invalid text node in JSON");
            return schema.text(json.text, marks);
        }
        let content = Fragment.fromJSON(schema, json.content);
        return schema.nodeType(json.type).create(json.attrs, content, marks);
    }
}
Node.prototype.text = undefined;
class TextNode extends Node {
    /**
    @internal
    */
    constructor(type, attrs, content, marks) {
        super(type, attrs, null, marks);
        if (!content)
            throw new RangeError("Empty text nodes are not allowed");
        this.text = content;
    }
    toString() {
        if (this.type.spec.toDebugString)
            return this.type.spec.toDebugString(this);
        return wrapMarks(this.marks, JSON.stringify(this.text));
    }
    get textContent() { return this.text; }
    textBetween(from, to) { return this.text.slice(from, to); }
    get nodeSize() { return this.text.length; }
    mark(marks) {
        return marks == this.marks ? this : new TextNode(this.type, this.attrs, this.text, marks);
    }
    withText(text) {
        if (text == this.text)
            return this;
        return new TextNode(this.type, this.attrs, text, this.marks);
    }
    cut(from = 0, to = this.text.length) {
        if (from == 0 && to == this.text.length)
            return this;
        return this.withText(this.text.slice(from, to));
    }
    eq(other) {
        return this.sameMarkup(other) && this.text == other.text;
    }
    toJSON() {
        let base = super.toJSON();
        base.text = this.text;
        return base;
    }
}
function wrapMarks(marks, str) {
    for (let i = marks.length - 1; i >= 0; i--)
        str = marks[i].type.name + "(" + str + ")";
    return str;
}

/**
Instances of this class represent a match state of a node type's
[content expression](https://prosemirror.net/docs/ref/#model.NodeSpec.content), and can be used to
find out whether further content matches here, and whether a given
position is a valid end of the node.
*/
class ContentMatch {
    /**
    @internal
    */
    constructor(
    /**
    True when this match state represents a valid end of the node.
    */
    validEnd) {
        this.validEnd = validEnd;
        /**
        @internal
        */
        this.next = [];
        /**
        @internal
        */
        this.wrapCache = [];
    }
    /**
    @internal
    */
    static parse(string, nodeTypes) {
        let stream = new TokenStream(string, nodeTypes);
        if (stream.next == null)
            return ContentMatch.empty;
        let expr = parseExpr(stream);
        if (stream.next)
            stream.err("Unexpected trailing text");
        let match = dfa(nfa(expr));
        checkForDeadEnds(match, stream);
        return match;
    }
    /**
    Match a node type, returning a match after that node if
    successful.
    */
    matchType(type) {
        for (let i = 0; i < this.next.length; i++)
            if (this.next[i].type == type)
                return this.next[i].next;
        return null;
    }
    /**
    Try to match a fragment. Returns the resulting match when
    successful.
    */
    matchFragment(frag, start = 0, end = frag.childCount) {
        let cur = this;
        for (let i = start; cur && i < end; i++)
            cur = cur.matchType(frag.child(i).type);
        return cur;
    }
    /**
    @internal
    */
    get inlineContent() {
        return this.next.length != 0 && this.next[0].type.isInline;
    }
    /**
    Get the first matching node type at this match position that can
    be generated.
    */
    get defaultType() {
        for (let i = 0; i < this.next.length; i++) {
            let { type } = this.next[i];
            if (!(type.isText || type.hasRequiredAttrs()))
                return type;
        }
        return null;
    }
    /**
    @internal
    */
    compatible(other) {
        for (let i = 0; i < this.next.length; i++)
            for (let j = 0; j < other.next.length; j++)
                if (this.next[i].type == other.next[j].type)
                    return true;
        return false;
    }
    /**
    Try to match the given fragment, and if that fails, see if it can
    be made to match by inserting nodes in front of it. When
    successful, return a fragment of inserted nodes (which may be
    empty if nothing had to be inserted). When `toEnd` is true, only
    return a fragment if the resulting match goes to the end of the
    content expression.
    */
    fillBefore(after, toEnd = false, startIndex = 0) {
        let seen = [this];
        function search(match, types) {
            let finished = match.matchFragment(after, startIndex);
            if (finished && (!toEnd || finished.validEnd))
                return Fragment.from(types.map(tp => tp.createAndFill()));
            for (let i = 0; i < match.next.length; i++) {
                let { type, next } = match.next[i];
                if (!(type.isText || type.hasRequiredAttrs()) && seen.indexOf(next) == -1) {
                    seen.push(next);
                    let found = search(next, types.concat(type));
                    if (found)
                        return found;
                }
            }
            return null;
        }
        return search(this, []);
    }
    /**
    Find a set of wrapping node types that would allow a node of the
    given type to appear at this position. The result may be empty
    (when it fits directly) and will be null when no such wrapping
    exists.
    */
    findWrapping(target) {
        for (let i = 0; i < this.wrapCache.length; i += 2)
            if (this.wrapCache[i] == target)
                return this.wrapCache[i + 1];
        let computed = this.computeWrapping(target);
        this.wrapCache.push(target, computed);
        return computed;
    }
    /**
    @internal
    */
    computeWrapping(target) {
        let seen = Object.create(null), active = [{ match: this, type: null, via: null }];
        while (active.length) {
            let current = active.shift(), match = current.match;
            if (match.matchType(target)) {
                let result = [];
                for (let obj = current; obj.type; obj = obj.via)
                    result.push(obj.type);
                return result.reverse();
            }
            for (let i = 0; i < match.next.length; i++) {
                let { type, next } = match.next[i];
                if (!type.isLeaf && !type.hasRequiredAttrs() && !(type.name in seen) && (!current.type || next.validEnd)) {
                    active.push({ match: type.contentMatch, type, via: current });
                    seen[type.name] = true;
                }
            }
        }
        return null;
    }
    /**
    The number of outgoing edges this node has in the finite
    automaton that describes the content expression.
    */
    get edgeCount() {
        return this.next.length;
    }
    /**
    Get the _n_​th outgoing edge from this node in the finite
    automaton that describes the content expression.
    */
    edge(n) {
        if (n >= this.next.length)
            throw new RangeError(`There's no ${n}th edge in this content match`);
        return this.next[n];
    }
    /**
    @internal
    */
    toString() {
        let seen = [];
        function scan(m) {
            seen.push(m);
            for (let i = 0; i < m.next.length; i++)
                if (seen.indexOf(m.next[i].next) == -1)
                    scan(m.next[i].next);
        }
        scan(this);
        return seen.map((m, i) => {
            let out = i + (m.validEnd ? "*" : " ") + " ";
            for (let i = 0; i < m.next.length; i++)
                out += (i ? ", " : "") + m.next[i].type.name + "->" + seen.indexOf(m.next[i].next);
            return out;
        }).join("\n");
    }
}
/**
@internal
*/
ContentMatch.empty = new ContentMatch(true);
class TokenStream {
    constructor(string, nodeTypes) {
        this.string = string;
        this.nodeTypes = nodeTypes;
        this.inline = null;
        this.pos = 0;
        this.tokens = string.split(/\s*(?=\b|\W|$)/);
        if (this.tokens[this.tokens.length - 1] == "")
            this.tokens.pop();
        if (this.tokens[0] == "")
            this.tokens.shift();
    }
    get next() { return this.tokens[this.pos]; }
    eat(tok) { return this.next == tok && (this.pos++ || true); }
    err(str) { throw new SyntaxError(str + " (in content expression '" + this.string + "')"); }
}
function parseExpr(stream) {
    let exprs = [];
    do {
        exprs.push(parseExprSeq(stream));
    } while (stream.eat("|"));
    return exprs.length == 1 ? exprs[0] : { type: "choice", exprs };
}
function parseExprSeq(stream) {
    let exprs = [];
    do {
        exprs.push(parseExprSubscript(stream));
    } while (stream.next && stream.next != ")" && stream.next != "|");
    return exprs.length == 1 ? exprs[0] : { type: "seq", exprs };
}
function parseExprSubscript(stream) {
    let expr = parseExprAtom(stream);
    for (;;) {
        if (stream.eat("+"))
            expr = { type: "plus", expr };
        else if (stream.eat("*"))
            expr = { type: "star", expr };
        else if (stream.eat("?"))
            expr = { type: "opt", expr };
        else if (stream.eat("{"))
            expr = parseExprRange(stream, expr);
        else
            break;
    }
    return expr;
}
function parseNum(stream) {
    if (/\D/.test(stream.next))
        stream.err("Expected number, got '" + stream.next + "'");
    let result = Number(stream.next);
    stream.pos++;
    return result;
}
function parseExprRange(stream, expr) {
    let min = parseNum(stream), max = min;
    if (stream.eat(",")) {
        if (stream.next != "}")
            max = parseNum(stream);
        else
            max = -1;
    }
    if (!stream.eat("}"))
        stream.err("Unclosed braced range");
    return { type: "range", min, max, expr };
}
function resolveName(stream, name) {
    let types = stream.nodeTypes, type = types[name];
    if (type)
        return [type];
    let result = [];
    for (let typeName in types) {
        let type = types[typeName];
        if (type.groups.indexOf(name) > -1)
            result.push(type);
    }
    if (result.length == 0)
        stream.err("No node type or group '" + name + "' found");
    return result;
}
function parseExprAtom(stream) {
    if (stream.eat("(")) {
        let expr = parseExpr(stream);
        if (!stream.eat(")"))
            stream.err("Missing closing paren");
        return expr;
    }
    else if (!/\W/.test(stream.next)) {
        let exprs = resolveName(stream, stream.next).map(type => {
            if (stream.inline == null)
                stream.inline = type.isInline;
            else if (stream.inline != type.isInline)
                stream.err("Mixing inline and block content");
            return { type: "name", value: type };
        });
        stream.pos++;
        return exprs.length == 1 ? exprs[0] : { type: "choice", exprs };
    }
    else {
        stream.err("Unexpected token '" + stream.next + "'");
    }
}
/**
Construct an NFA from an expression as returned by the parser. The
NFA is represented as an array of states, which are themselves
arrays of edges, which are `{term, to}` objects. The first state is
the entry state and the last node is the success state.

Note that unlike typical NFAs, the edge ordering in this one is
significant, in that it is used to contruct filler content when
necessary.
*/
function nfa(expr) {
    let nfa = [[]];
    connect(compile(expr, 0), node());
    return nfa;
    function node() { return nfa.push([]) - 1; }
    function edge(from, to, term) {
        let edge = { term, to };
        nfa[from].push(edge);
        return edge;
    }
    function connect(edges, to) {
        edges.forEach(edge => edge.to = to);
    }
    function compile(expr, from) {
        if (expr.type == "choice") {
            return expr.exprs.reduce((out, expr) => out.concat(compile(expr, from)), []);
        }
        else if (expr.type == "seq") {
            for (let i = 0;; i++) {
                let next = compile(expr.exprs[i], from);
                if (i == expr.exprs.length - 1)
                    return next;
                connect(next, from = node());
            }
        }
        else if (expr.type == "star") {
            let loop = node();
            edge(from, loop);
            connect(compile(expr.expr, loop), loop);
            return [edge(loop)];
        }
        else if (expr.type == "plus") {
            let loop = node();
            connect(compile(expr.expr, from), loop);
            connect(compile(expr.expr, loop), loop);
            return [edge(loop)];
        }
        else if (expr.type == "opt") {
            return [edge(from)].concat(compile(expr.expr, from));
        }
        else if (expr.type == "range") {
            let cur = from;
            for (let i = 0; i < expr.min; i++) {
                let next = node();
                connect(compile(expr.expr, cur), next);
                cur = next;
            }
            if (expr.max == -1) {
                connect(compile(expr.expr, cur), cur);
            }
            else {
                for (let i = expr.min; i < expr.max; i++) {
                    let next = node();
                    edge(cur, next);
                    connect(compile(expr.expr, cur), next);
                    cur = next;
                }
            }
            return [edge(cur)];
        }
        else if (expr.type == "name") {
            return [edge(from, undefined, expr.value)];
        }
        else {
            throw new Error("Unknown expr type");
        }
    }
}
function cmp(a, b) { return b - a; }
// Get the set of nodes reachable by null edges from `node`. Omit
// nodes with only a single null-out-edge, since they may lead to
// needless duplicated nodes.
function nullFrom(nfa, node) {
    let result = [];
    scan(node);
    return result.sort(cmp);
    function scan(node) {
        let edges = nfa[node];
        if (edges.length == 1 && !edges[0].term)
            return scan(edges[0].to);
        result.push(node);
        for (let i = 0; i < edges.length; i++) {
            let { term, to } = edges[i];
            if (!term && result.indexOf(to) == -1)
                scan(to);
        }
    }
}
// Compiles an NFA as produced by `nfa` into a DFA, modeled as a set
// of state objects (`ContentMatch` instances) with transitions
// between them.
function dfa(nfa) {
    let labeled = Object.create(null);
    return explore(nullFrom(nfa, 0));
    function explore(states) {
        let out = [];
        states.forEach(node => {
            nfa[node].forEach(({ term, to }) => {
                if (!term)
                    return;
                let set;
                for (let i = 0; i < out.length; i++)
                    if (out[i][0] == term)
                        set = out[i][1];
                nullFrom(nfa, to).forEach(node => {
                    if (!set)
                        out.push([term, set = []]);
                    if (set.indexOf(node) == -1)
                        set.push(node);
                });
            });
        });
        let state = labeled[states.join(",")] = new ContentMatch(states.indexOf(nfa.length - 1) > -1);
        for (let i = 0; i < out.length; i++) {
            let states = out[i][1].sort(cmp);
            state.next.push({ type: out[i][0], next: labeled[states.join(",")] || explore(states) });
        }
        return state;
    }
}
function checkForDeadEnds(match, stream) {
    for (let i = 0, work = [match]; i < work.length; i++) {
        let state = work[i], dead = !state.validEnd, nodes = [];
        for (let j = 0; j < state.next.length; j++) {
            let { type, next } = state.next[j];
            nodes.push(type.name);
            if (dead && !(type.isText || type.hasRequiredAttrs()))
                dead = false;
            if (work.indexOf(next) == -1)
                work.push(next);
        }
        if (dead)
            stream.err("Only non-generatable nodes (" + nodes.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
    }
}

// For node types where all attrs have a default value (or which don't
// have any attributes), build up a single reusable default attribute
// object, and use it for all nodes that don't specify specific
// attributes.
function defaultAttrs(attrs) {
    let defaults = Object.create(null);
    for (let attrName in attrs) {
        let attr = attrs[attrName];
        if (!attr.hasDefault)
            return null;
        defaults[attrName] = attr.default;
    }
    return defaults;
}
function computeAttrs(attrs, value) {
    let built = Object.create(null);
    for (let name in attrs) {
        let given = value && value[name];
        if (given === undefined) {
            let attr = attrs[name];
            if (attr.hasDefault)
                given = attr.default;
            else
                throw new RangeError("No value supplied for attribute " + name);
        }
        built[name] = given;
    }
    return built;
}
function initAttrs(attrs) {
    let result = Object.create(null);
    if (attrs)
        for (let name in attrs)
            result[name] = new Attribute(attrs[name]);
    return result;
}
/**
Node types are objects allocated once per `Schema` and used to
[tag](https://prosemirror.net/docs/ref/#model.Node.type) `Node` instances. They contain information
about the node type, such as its name and what kind of node it
represents.
*/
let NodeType$1 = class NodeType {
    /**
    @internal
    */
    constructor(
    /**
    The name the node type has in this schema.
    */
    name, 
    /**
    A link back to the `Schema` the node type belongs to.
    */
    schema, 
    /**
    The spec that this type is based on
    */
    spec) {
        this.name = name;
        this.schema = schema;
        this.spec = spec;
        /**
        The set of marks allowed in this node. `null` means all marks
        are allowed.
        */
        this.markSet = null;
        this.groups = spec.group ? spec.group.split(" ") : [];
        this.attrs = initAttrs(spec.attrs);
        this.defaultAttrs = defaultAttrs(this.attrs);
        this.contentMatch = null;
        this.inlineContent = null;
        this.isBlock = !(spec.inline || name == "text");
        this.isText = name == "text";
    }
    /**
    True if this is an inline type.
    */
    get isInline() { return !this.isBlock; }
    /**
    True if this is a textblock type, a block that contains inline
    content.
    */
    get isTextblock() { return this.isBlock && this.inlineContent; }
    /**
    True for node types that allow no content.
    */
    get isLeaf() { return this.contentMatch == ContentMatch.empty; }
    /**
    True when this node is an atom, i.e. when it does not have
    directly editable content.
    */
    get isAtom() { return this.isLeaf || !!this.spec.atom; }
    /**
    The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
    */
    get whitespace() {
        return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
    }
    /**
    Tells you whether this node type has any required attributes.
    */
    hasRequiredAttrs() {
        for (let n in this.attrs)
            if (this.attrs[n].isRequired)
                return true;
        return false;
    }
    /**
    Indicates whether this node allows some of the same content as
    the given node type.
    */
    compatibleContent(other) {
        return this == other || this.contentMatch.compatible(other.contentMatch);
    }
    /**
    @internal
    */
    computeAttrs(attrs) {
        if (!attrs && this.defaultAttrs)
            return this.defaultAttrs;
        else
            return computeAttrs(this.attrs, attrs);
    }
    /**
    Create a `Node` of this type. The given attributes are
    checked and defaulted (you can pass `null` to use the type's
    defaults entirely, if no required attributes exist). `content`
    may be a `Fragment`, a node, an array of nodes, or
    `null`. Similarly `marks` may be `null` to default to the empty
    set of marks.
    */
    create(attrs = null, content, marks) {
        if (this.isText)
            throw new Error("NodeType.create can't construct text nodes");
        return new Node(this, this.computeAttrs(attrs), Fragment.from(content), Mark.setFrom(marks));
    }
    /**
    Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
    against the node type's content restrictions, and throw an error
    if it doesn't match.
    */
    createChecked(attrs = null, content, marks) {
        content = Fragment.from(content);
        this.checkContent(content);
        return new Node(this, this.computeAttrs(attrs), content, Mark.setFrom(marks));
    }
    /**
    Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
    necessary to add nodes to the start or end of the given fragment
    to make it fit the node. If no fitting wrapping can be found,
    return null. Note that, due to the fact that required nodes can
    always be created, this will always succeed if you pass null or
    `Fragment.empty` as content.
    */
    createAndFill(attrs = null, content, marks) {
        attrs = this.computeAttrs(attrs);
        content = Fragment.from(content);
        if (content.size) {
            let before = this.contentMatch.fillBefore(content);
            if (!before)
                return null;
            content = before.append(content);
        }
        let matched = this.contentMatch.matchFragment(content);
        let after = matched && matched.fillBefore(Fragment.empty, true);
        if (!after)
            return null;
        return new Node(this, attrs, content.append(after), Mark.setFrom(marks));
    }
    /**
    Returns true if the given fragment is valid content for this node
    type with the given attributes.
    */
    validContent(content) {
        let result = this.contentMatch.matchFragment(content);
        if (!result || !result.validEnd)
            return false;
        for (let i = 0; i < content.childCount; i++)
            if (!this.allowsMarks(content.child(i).marks))
                return false;
        return true;
    }
    /**
    Throws a RangeError if the given fragment is not valid content for this
    node type.
    @internal
    */
    checkContent(content) {
        if (!this.validContent(content))
            throw new RangeError(`Invalid content for node ${this.name}: ${content.toString().slice(0, 50)}`);
    }
    /**
    Check whether the given mark type is allowed in this node.
    */
    allowsMarkType(markType) {
        return this.markSet == null || this.markSet.indexOf(markType) > -1;
    }
    /**
    Test whether the given set of marks are allowed in this node.
    */
    allowsMarks(marks) {
        if (this.markSet == null)
            return true;
        for (let i = 0; i < marks.length; i++)
            if (!this.allowsMarkType(marks[i].type))
                return false;
        return true;
    }
    /**
    Removes the marks that are not allowed in this node from the given set.
    */
    allowedMarks(marks) {
        if (this.markSet == null)
            return marks;
        let copy;
        for (let i = 0; i < marks.length; i++) {
            if (!this.allowsMarkType(marks[i].type)) {
                if (!copy)
                    copy = marks.slice(0, i);
            }
            else if (copy) {
                copy.push(marks[i]);
            }
        }
        return !copy ? marks : copy.length ? copy : Mark.none;
    }
    /**
    @internal
    */
    static compile(nodes, schema) {
        let result = Object.create(null);
        nodes.forEach((name, spec) => result[name] = new NodeType(name, schema, spec));
        let topType = schema.spec.topNode || "doc";
        if (!result[topType])
            throw new RangeError("Schema is missing its top node type ('" + topType + "')");
        if (!result.text)
            throw new RangeError("Every schema needs a 'text' type");
        for (let _ in result.text.attrs)
            throw new RangeError("The text node type should not have attributes");
        return result;
    }
};
// Attribute descriptors
class Attribute {
    constructor(options) {
        this.hasDefault = Object.prototype.hasOwnProperty.call(options, "default");
        this.default = options.default;
    }
    get isRequired() {
        return !this.hasDefault;
    }
}
// Marks
/**
Like nodes, marks (which are associated with nodes to signify
things like emphasis or being part of a link) are
[tagged](https://prosemirror.net/docs/ref/#model.Mark.type) with type objects, which are
instantiated once per `Schema`.
*/
class MarkType {
    /**
    @internal
    */
    constructor(
    /**
    The name of the mark type.
    */
    name, 
    /**
    @internal
    */
    rank, 
    /**
    The schema that this mark type instance is part of.
    */
    schema, 
    /**
    The spec on which the type is based.
    */
    spec) {
        this.name = name;
        this.rank = rank;
        this.schema = schema;
        this.spec = spec;
        this.attrs = initAttrs(spec.attrs);
        this.excluded = null;
        let defaults = defaultAttrs(this.attrs);
        this.instance = defaults ? new Mark(this, defaults) : null;
    }
    /**
    Create a mark of this type. `attrs` may be `null` or an object
    containing only some of the mark's attributes. The others, if
    they have defaults, will be added.
    */
    create(attrs = null) {
        if (!attrs && this.instance)
            return this.instance;
        return new Mark(this, computeAttrs(this.attrs, attrs));
    }
    /**
    @internal
    */
    static compile(marks, schema) {
        let result = Object.create(null), rank = 0;
        marks.forEach((name, spec) => result[name] = new MarkType(name, rank++, schema, spec));
        return result;
    }
    /**
    When there is a mark of this type in the given set, a new set
    without it is returned. Otherwise, the input set is returned.
    */
    removeFromSet(set) {
        for (var i = 0; i < set.length; i++)
            if (set[i].type == this) {
                set = set.slice(0, i).concat(set.slice(i + 1));
                i--;
            }
        return set;
    }
    /**
    Tests whether there is a mark of this type in the given set.
    */
    isInSet(set) {
        for (let i = 0; i < set.length; i++)
            if (set[i].type == this)
                return set[i];
    }
    /**
    Queries whether a given mark type is
    [excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
    */
    excludes(other) {
        return this.excluded.indexOf(other) > -1;
    }
}
/**
A document schema. Holds [node](https://prosemirror.net/docs/ref/#model.NodeType) and [mark
type](https://prosemirror.net/docs/ref/#model.MarkType) objects for the nodes and marks that may
occur in conforming documents, and provides functionality for
creating and deserializing such documents.

When given, the type parameters provide the names of the nodes and
marks in this schema.
*/
class Schema {
    /**
    Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
    */
    constructor(spec) {
        /**
        An object for storing whatever values modules may want to
        compute and cache per schema. (If you want to store something
        in it, try to use property names unlikely to clash.)
        */
        this.cached = Object.create(null);
        let instanceSpec = this.spec = {};
        for (let prop in spec)
            instanceSpec[prop] = spec[prop];
        instanceSpec.nodes = OrderedMap.from(spec.nodes),
            instanceSpec.marks = OrderedMap.from(spec.marks || {}),
            this.nodes = NodeType$1.compile(this.spec.nodes, this);
        this.marks = MarkType.compile(this.spec.marks, this);
        let contentExprCache = Object.create(null);
        for (let prop in this.nodes) {
            if (prop in this.marks)
                throw new RangeError(prop + " can not be both a node and a mark");
            let type = this.nodes[prop], contentExpr = type.spec.content || "", markExpr = type.spec.marks;
            type.contentMatch = contentExprCache[contentExpr] ||
                (contentExprCache[contentExpr] = ContentMatch.parse(contentExpr, this.nodes));
            type.inlineContent = type.contentMatch.inlineContent;
            type.markSet = markExpr == "_" ? null :
                markExpr ? gatherMarks(this, markExpr.split(" ")) :
                    markExpr == "" || !type.inlineContent ? [] : null;
        }
        for (let prop in this.marks) {
            let type = this.marks[prop], excl = type.spec.excludes;
            type.excluded = excl == null ? [type] : excl == "" ? [] : gatherMarks(this, excl.split(" "));
        }
        this.nodeFromJSON = this.nodeFromJSON.bind(this);
        this.markFromJSON = this.markFromJSON.bind(this);
        this.topNodeType = this.nodes[this.spec.topNode || "doc"];
        this.cached.wrappings = Object.create(null);
    }
    /**
    Create a node in this schema. The `type` may be a string or a
    `NodeType` instance. Attributes will be extended with defaults,
    `content` may be a `Fragment`, `null`, a `Node`, or an array of
    nodes.
    */
    node(type, attrs = null, content, marks) {
        if (typeof type == "string")
            type = this.nodeType(type);
        else if (!(type instanceof NodeType$1))
            throw new RangeError("Invalid node type: " + type);
        else if (type.schema != this)
            throw new RangeError("Node type from different schema used (" + type.name + ")");
        return type.createChecked(attrs, content, marks);
    }
    /**
    Create a text node in the schema. Empty text nodes are not
    allowed.
    */
    text(text, marks) {
        let type = this.nodes.text;
        return new TextNode(type, type.defaultAttrs, text, Mark.setFrom(marks));
    }
    /**
    Create a mark with the given type and attributes.
    */
    mark(type, attrs) {
        if (typeof type == "string")
            type = this.marks[type];
        return type.create(attrs);
    }
    /**
    Deserialize a node from its JSON representation. This method is
    bound.
    */
    nodeFromJSON(json) {
        return Node.fromJSON(this, json);
    }
    /**
    Deserialize a mark from its JSON representation. This method is
    bound.
    */
    markFromJSON(json) {
        return Mark.fromJSON(this, json);
    }
    /**
    @internal
    */
    nodeType(name) {
        let found = this.nodes[name];
        if (!found)
            throw new RangeError("Unknown node type: " + name);
        return found;
    }
}
function gatherMarks(schema, marks) {
    let found = [];
    for (let i = 0; i < marks.length; i++) {
        let name = marks[i], mark = schema.marks[name], ok = mark;
        if (mark) {
            found.push(mark);
        }
        else {
            for (let prop in schema.marks) {
                let mark = schema.marks[prop];
                if (name == "_" || (mark.spec.group && mark.spec.group.split(" ").indexOf(name) > -1))
                    found.push(ok = mark);
            }
        }
        if (!ok)
            throw new SyntaxError("Unknown mark type: '" + marks[i] + "'");
    }
    return found;
}

/**
A DOM parser represents a strategy for parsing DOM content into a
ProseMirror document conforming to a given schema. Its behavior is
defined by an array of [rules](https://prosemirror.net/docs/ref/#model.ParseRule).
*/
class DOMParser {
    /**
    Create a parser that targets the given schema, using the given
    parsing rules.
    */
    constructor(
    /**
    The schema into which the parser parses.
    */
    schema, 
    /**
    The set of [parse rules](https://prosemirror.net/docs/ref/#model.ParseRule) that the parser
    uses, in order of precedence.
    */
    rules) {
        this.schema = schema;
        this.rules = rules;
        /**
        @internal
        */
        this.tags = [];
        /**
        @internal
        */
        this.styles = [];
        rules.forEach(rule => {
            if (rule.tag)
                this.tags.push(rule);
            else if (rule.style)
                this.styles.push(rule);
        });
        // Only normalize list elements when lists in the schema can't directly contain themselves
        this.normalizeLists = !this.tags.some(r => {
            if (!/^(ul|ol)\b/.test(r.tag) || !r.node)
                return false;
            let node = schema.nodes[r.node];
            return node.contentMatch.matchType(node);
        });
    }
    /**
    Parse a document from the content of a DOM node.
    */
    parse(dom, options = {}) {
        let context = new ParseContext(this, options, false);
        context.addAll(dom, options.from, options.to);
        return context.finish();
    }
    /**
    Parses the content of the given DOM node, like
    [`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
    options. But unlike that method, which produces a whole node,
    this one returns a slice that is open at the sides, meaning that
    the schema constraints aren't applied to the start of nodes to
    the left of the input and the end of nodes at the end.
    */
    parseSlice(dom, options = {}) {
        let context = new ParseContext(this, options, true);
        context.addAll(dom, options.from, options.to);
        return Slice.maxOpen(context.finish());
    }
    /**
    @internal
    */
    matchTag(dom, context, after) {
        for (let i = after ? this.tags.indexOf(after) + 1 : 0; i < this.tags.length; i++) {
            let rule = this.tags[i];
            if (matches(dom, rule.tag) &&
                (rule.namespace === undefined || dom.namespaceURI == rule.namespace) &&
                (!rule.context || context.matchesContext(rule.context))) {
                if (rule.getAttrs) {
                    let result = rule.getAttrs(dom);
                    if (result === false)
                        continue;
                    rule.attrs = result || undefined;
                }
                return rule;
            }
        }
    }
    /**
    @internal
    */
    matchStyle(prop, value, context, after) {
        for (let i = after ? this.styles.indexOf(after) + 1 : 0; i < this.styles.length; i++) {
            let rule = this.styles[i], style = rule.style;
            if (style.indexOf(prop) != 0 ||
                rule.context && !context.matchesContext(rule.context) ||
                // Test that the style string either precisely matches the prop,
                // or has an '=' sign after the prop, followed by the given
                // value.
                style.length > prop.length &&
                    (style.charCodeAt(prop.length) != 61 || style.slice(prop.length + 1) != value))
                continue;
            if (rule.getAttrs) {
                let result = rule.getAttrs(value);
                if (result === false)
                    continue;
                rule.attrs = result || undefined;
            }
            return rule;
        }
    }
    /**
    @internal
    */
    static schemaRules(schema) {
        let result = [];
        function insert(rule) {
            let priority = rule.priority == null ? 50 : rule.priority, i = 0;
            for (; i < result.length; i++) {
                let next = result[i], nextPriority = next.priority == null ? 50 : next.priority;
                if (nextPriority < priority)
                    break;
            }
            result.splice(i, 0, rule);
        }
        for (let name in schema.marks) {
            let rules = schema.marks[name].spec.parseDOM;
            if (rules)
                rules.forEach(rule => {
                    insert(rule = copy(rule));
                    if (!(rule.mark || rule.ignore || rule.clearMark))
                        rule.mark = name;
                });
        }
        for (let name in schema.nodes) {
            let rules = schema.nodes[name].spec.parseDOM;
            if (rules)
                rules.forEach(rule => {
                    insert(rule = copy(rule));
                    if (!(rule.node || rule.ignore || rule.mark))
                        rule.node = name;
                });
        }
        return result;
    }
    /**
    Construct a DOM parser using the parsing rules listed in a
    schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
    [priority](https://prosemirror.net/docs/ref/#model.ParseRule.priority).
    */
    static fromSchema(schema) {
        return schema.cached.domParser ||
            (schema.cached.domParser = new DOMParser(schema, DOMParser.schemaRules(schema)));
    }
}
const blockTags = {
    address: true, article: true, aside: true, blockquote: true, canvas: true,
    dd: true, div: true, dl: true, fieldset: true, figcaption: true, figure: true,
    footer: true, form: true, h1: true, h2: true, h3: true, h4: true, h5: true,
    h6: true, header: true, hgroup: true, hr: true, li: true, noscript: true, ol: true,
    output: true, p: true, pre: true, section: true, table: true, tfoot: true, ul: true
};
const ignoreTags = {
    head: true, noscript: true, object: true, script: true, style: true, title: true
};
const listTags = { ol: true, ul: true };
// Using a bitfield for node context options
const OPT_PRESERVE_WS = 1, OPT_PRESERVE_WS_FULL = 2, OPT_OPEN_LEFT = 4;
function wsOptionsFor(type, preserveWhitespace, base) {
    if (preserveWhitespace != null)
        return (preserveWhitespace ? OPT_PRESERVE_WS : 0) |
            (preserveWhitespace === "full" ? OPT_PRESERVE_WS_FULL : 0);
    return type && type.whitespace == "pre" ? OPT_PRESERVE_WS | OPT_PRESERVE_WS_FULL : base & ~OPT_OPEN_LEFT;
}
class NodeContext {
    constructor(type, attrs, 
    // Marks applied to this node itself
    marks, 
    // Marks that can't apply here, but will be used in children if possible
    pendingMarks, solid, match, options) {
        this.type = type;
        this.attrs = attrs;
        this.marks = marks;
        this.pendingMarks = pendingMarks;
        this.solid = solid;
        this.options = options;
        this.content = [];
        // Marks applied to the node's children
        this.activeMarks = Mark.none;
        // Nested Marks with same type
        this.stashMarks = [];
        this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentMatch);
    }
    findWrapping(node) {
        if (!this.match) {
            if (!this.type)
                return [];
            let fill = this.type.contentMatch.fillBefore(Fragment.from(node));
            if (fill) {
                this.match = this.type.contentMatch.matchFragment(fill);
            }
            else {
                let start = this.type.contentMatch, wrap;
                if (wrap = start.findWrapping(node.type)) {
                    this.match = start;
                    return wrap;
                }
                else {
                    return null;
                }
            }
        }
        return this.match.findWrapping(node.type);
    }
    finish(openEnd) {
        if (!(this.options & OPT_PRESERVE_WS)) { // Strip trailing whitespace
            let last = this.content[this.content.length - 1], m;
            if (last && last.isText && (m = /[ \t\r\n\u000c]+$/.exec(last.text))) {
                let text = last;
                if (last.text.length == m[0].length)
                    this.content.pop();
                else
                    this.content[this.content.length - 1] = text.withText(text.text.slice(0, text.text.length - m[0].length));
            }
        }
        let content = Fragment.from(this.content);
        if (!openEnd && this.match)
            content = content.append(this.match.fillBefore(Fragment.empty, true));
        return this.type ? this.type.create(this.attrs, content, this.marks) : content;
    }
    popFromStashMark(mark) {
        for (let i = this.stashMarks.length - 1; i >= 0; i--)
            if (mark.eq(this.stashMarks[i]))
                return this.stashMarks.splice(i, 1)[0];
    }
    applyPending(nextType) {
        for (let i = 0, pending = this.pendingMarks; i < pending.length; i++) {
            let mark = pending[i];
            if ((this.type ? this.type.allowsMarkType(mark.type) : markMayApply(mark.type, nextType)) &&
                !mark.isInSet(this.activeMarks)) {
                this.activeMarks = mark.addToSet(this.activeMarks);
                this.pendingMarks = mark.removeFromSet(this.pendingMarks);
            }
        }
    }
    inlineContext(node) {
        if (this.type)
            return this.type.inlineContent;
        if (this.content.length)
            return this.content[0].isInline;
        return node.parentNode && !blockTags.hasOwnProperty(node.parentNode.nodeName.toLowerCase());
    }
}
class ParseContext {
    constructor(
    // The parser we are using.
    parser, 
    // The options passed to this parse.
    options, isOpen) {
        this.parser = parser;
        this.options = options;
        this.isOpen = isOpen;
        this.open = 0;
        let topNode = options.topNode, topContext;
        let topOptions = wsOptionsFor(null, options.preserveWhitespace, 0) | (isOpen ? OPT_OPEN_LEFT : 0);
        if (topNode)
            topContext = new NodeContext(topNode.type, topNode.attrs, Mark.none, Mark.none, true, options.topMatch || topNode.type.contentMatch, topOptions);
        else if (isOpen)
            topContext = new NodeContext(null, null, Mark.none, Mark.none, true, null, topOptions);
        else
            topContext = new NodeContext(parser.schema.topNodeType, null, Mark.none, Mark.none, true, null, topOptions);
        this.nodes = [topContext];
        this.find = options.findPositions;
        this.needsBlock = false;
    }
    get top() {
        return this.nodes[this.open];
    }
    // Add a DOM node to the content. Text is inserted as text node,
    // otherwise, the node is passed to `addElement` or, if it has a
    // `style` attribute, `addElementWithStyles`.
    addDOM(dom) {
        if (dom.nodeType == 3)
            this.addTextNode(dom);
        else if (dom.nodeType == 1)
            this.addElement(dom);
    }
    withStyleRules(dom, f) {
        let style = dom.getAttribute("style");
        if (!style)
            return f();
        let marks = this.readStyles(parseStyles(style));
        if (!marks)
            return; // A style with ignore: true
        let [addMarks, removeMarks] = marks, top = this.top;
        for (let i = 0; i < removeMarks.length; i++)
            this.removePendingMark(removeMarks[i], top);
        for (let i = 0; i < addMarks.length; i++)
            this.addPendingMark(addMarks[i]);
        f();
        for (let i = 0; i < addMarks.length; i++)
            this.removePendingMark(addMarks[i], top);
        for (let i = 0; i < removeMarks.length; i++)
            this.addPendingMark(removeMarks[i]);
    }
    addTextNode(dom) {
        let value = dom.nodeValue;
        let top = this.top;
        if (top.options & OPT_PRESERVE_WS_FULL ||
            top.inlineContext(dom) ||
            /[^ \t\r\n\u000c]/.test(value)) {
            if (!(top.options & OPT_PRESERVE_WS)) {
                value = value.replace(/[ \t\r\n\u000c]+/g, " ");
                // If this starts with whitespace, and there is no node before it, or
                // a hard break, or a text node that ends with whitespace, strip the
                // leading space.
                if (/^[ \t\r\n\u000c]/.test(value) && this.open == this.nodes.length - 1) {
                    let nodeBefore = top.content[top.content.length - 1];
                    let domNodeBefore = dom.previousSibling;
                    if (!nodeBefore ||
                        (domNodeBefore && domNodeBefore.nodeName == 'BR') ||
                        (nodeBefore.isText && /[ \t\r\n\u000c]$/.test(nodeBefore.text)))
                        value = value.slice(1);
                }
            }
            else if (!(top.options & OPT_PRESERVE_WS_FULL)) {
                value = value.replace(/\r?\n|\r/g, " ");
            }
            else {
                value = value.replace(/\r\n?/g, "\n");
            }
            if (value)
                this.insertNode(this.parser.schema.text(value));
            this.findInText(dom);
        }
        else {
            this.findInside(dom);
        }
    }
    // Try to find a handler for the given tag and use that to parse. If
    // none is found, the element's content nodes are added directly.
    addElement(dom, matchAfter) {
        let name = dom.nodeName.toLowerCase(), ruleID;
        if (listTags.hasOwnProperty(name) && this.parser.normalizeLists)
            normalizeList(dom);
        let rule = (this.options.ruleFromNode && this.options.ruleFromNode(dom)) ||
            (ruleID = this.parser.matchTag(dom, this, matchAfter));
        if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
            this.findInside(dom);
            this.ignoreFallback(dom);
        }
        else if (!rule || rule.skip || rule.closeParent) {
            if (rule && rule.closeParent)
                this.open = Math.max(0, this.open - 1);
            else if (rule && rule.skip.nodeType)
                dom = rule.skip;
            let sync, top = this.top, oldNeedsBlock = this.needsBlock;
            if (blockTags.hasOwnProperty(name)) {
                if (top.content.length && top.content[0].isInline && this.open) {
                    this.open--;
                    top = this.top;
                }
                sync = true;
                if (!top.type)
                    this.needsBlock = true;
            }
            else if (!dom.firstChild) {
                this.leafFallback(dom);
                return;
            }
            if (rule && rule.skip)
                this.addAll(dom);
            else
                this.withStyleRules(dom, () => this.addAll(dom));
            if (sync)
                this.sync(top);
            this.needsBlock = oldNeedsBlock;
        }
        else {
            this.withStyleRules(dom, () => {
                this.addElementByRule(dom, rule, rule.consuming === false ? ruleID : undefined);
            });
        }
    }
    // Called for leaf DOM nodes that would otherwise be ignored
    leafFallback(dom) {
        if (dom.nodeName == "BR" && this.top.type && this.top.type.inlineContent)
            this.addTextNode(dom.ownerDocument.createTextNode("\n"));
    }
    // Called for ignored nodes
    ignoreFallback(dom) {
        // Ignored BR nodes should at least create an inline context
        if (dom.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent))
            this.findPlace(this.parser.schema.text("-"));
    }
    // Run any style parser associated with the node's styles. Either
    // return an array of marks, or null to indicate some of the styles
    // had a rule with `ignore` set.
    readStyles(styles) {
        let add = Mark.none, remove = Mark.none;
        for (let i = 0; i < styles.length; i += 2) {
            for (let after = undefined;;) {
                let rule = this.parser.matchStyle(styles[i], styles[i + 1], this, after);
                if (!rule)
                    break;
                if (rule.ignore)
                    return null;
                if (rule.clearMark) {
                    this.top.pendingMarks.concat(this.top.activeMarks).forEach(m => {
                        if (rule.clearMark(m))
                            remove = m.addToSet(remove);
                    });
                }
                else {
                    add = this.parser.schema.marks[rule.mark].create(rule.attrs).addToSet(add);
                }
                if (rule.consuming === false)
                    after = rule;
                else
                    break;
            }
        }
        return [add, remove];
    }
    // Look up a handler for the given node. If none are found, return
    // false. Otherwise, apply it, use its return value to drive the way
    // the node's content is wrapped, and return true.
    addElementByRule(dom, rule, continueAfter) {
        let sync, nodeType, mark;
        if (rule.node) {
            nodeType = this.parser.schema.nodes[rule.node];
            if (!nodeType.isLeaf) {
                sync = this.enter(nodeType, rule.attrs || null, rule.preserveWhitespace);
            }
            else if (!this.insertNode(nodeType.create(rule.attrs))) {
                this.leafFallback(dom);
            }
        }
        else {
            let markType = this.parser.schema.marks[rule.mark];
            mark = markType.create(rule.attrs);
            this.addPendingMark(mark);
        }
        let startIn = this.top;
        if (nodeType && nodeType.isLeaf) {
            this.findInside(dom);
        }
        else if (continueAfter) {
            this.addElement(dom, continueAfter);
        }
        else if (rule.getContent) {
            this.findInside(dom);
            rule.getContent(dom, this.parser.schema).forEach(node => this.insertNode(node));
        }
        else {
            let contentDOM = dom;
            if (typeof rule.contentElement == "string")
                contentDOM = dom.querySelector(rule.contentElement);
            else if (typeof rule.contentElement == "function")
                contentDOM = rule.contentElement(dom);
            else if (rule.contentElement)
                contentDOM = rule.contentElement;
            this.findAround(dom, contentDOM, true);
            this.addAll(contentDOM);
        }
        if (sync && this.sync(startIn))
            this.open--;
        if (mark)
            this.removePendingMark(mark, startIn);
    }
    // Add all child nodes between `startIndex` and `endIndex` (or the
    // whole node, if not given). If `sync` is passed, use it to
    // synchronize after every block element.
    addAll(parent, startIndex, endIndex) {
        let index = startIndex || 0;
        for (let dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild, end = endIndex == null ? null : parent.childNodes[endIndex]; dom != end; dom = dom.nextSibling, ++index) {
            this.findAtPoint(parent, index);
            this.addDOM(dom);
        }
        this.findAtPoint(parent, index);
    }
    // Try to find a way to fit the given node type into the current
    // context. May add intermediate wrappers and/or leave non-solid
    // nodes that we're in.
    findPlace(node) {
        let route, sync;
        for (let depth = this.open; depth >= 0; depth--) {
            let cx = this.nodes[depth];
            let found = cx.findWrapping(node);
            if (found && (!route || route.length > found.length)) {
                route = found;
                sync = cx;
                if (!found.length)
                    break;
            }
            if (cx.solid)
                break;
        }
        if (!route)
            return false;
        this.sync(sync);
        for (let i = 0; i < route.length; i++)
            this.enterInner(route[i], null, false);
        return true;
    }
    // Try to insert the given node, adjusting the context when needed.
    insertNode(node) {
        if (node.isInline && this.needsBlock && !this.top.type) {
            let block = this.textblockFromContext();
            if (block)
                this.enterInner(block);
        }
        if (this.findPlace(node)) {
            this.closeExtra();
            let top = this.top;
            top.applyPending(node.type);
            if (top.match)
                top.match = top.match.matchType(node.type);
            let marks = top.activeMarks;
            for (let i = 0; i < node.marks.length; i++)
                if (!top.type || top.type.allowsMarkType(node.marks[i].type))
                    marks = node.marks[i].addToSet(marks);
            top.content.push(node.mark(marks));
            return true;
        }
        return false;
    }
    // Try to start a node of the given type, adjusting the context when
    // necessary.
    enter(type, attrs, preserveWS) {
        let ok = this.findPlace(type.create(attrs));
        if (ok)
            this.enterInner(type, attrs, true, preserveWS);
        return ok;
    }
    // Open a node of the given type
    enterInner(type, attrs = null, solid = false, preserveWS) {
        this.closeExtra();
        let top = this.top;
        top.applyPending(type);
        top.match = top.match && top.match.matchType(type);
        let options = wsOptionsFor(type, preserveWS, top.options);
        if ((top.options & OPT_OPEN_LEFT) && top.content.length == 0)
            options |= OPT_OPEN_LEFT;
        this.nodes.push(new NodeContext(type, attrs, top.activeMarks, top.pendingMarks, solid, null, options));
        this.open++;
    }
    // Make sure all nodes above this.open are finished and added to
    // their parents
    closeExtra(openEnd = false) {
        let i = this.nodes.length - 1;
        if (i > this.open) {
            for (; i > this.open; i--)
                this.nodes[i - 1].content.push(this.nodes[i].finish(openEnd));
            this.nodes.length = this.open + 1;
        }
    }
    finish() {
        this.open = 0;
        this.closeExtra(this.isOpen);
        return this.nodes[0].finish(this.isOpen || this.options.topOpen);
    }
    sync(to) {
        for (let i = this.open; i >= 0; i--)
            if (this.nodes[i] == to) {
                this.open = i;
                return true;
            }
        return false;
    }
    get currentPos() {
        this.closeExtra();
        let pos = 0;
        for (let i = this.open; i >= 0; i--) {
            let content = this.nodes[i].content;
            for (let j = content.length - 1; j >= 0; j--)
                pos += content[j].nodeSize;
            if (i)
                pos++;
        }
        return pos;
    }
    findAtPoint(parent, offset) {
        if (this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].node == parent && this.find[i].offset == offset)
                    this.find[i].pos = this.currentPos;
            }
    }
    findInside(parent) {
        if (this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node))
                    this.find[i].pos = this.currentPos;
            }
    }
    findAround(parent, content, before) {
        if (parent != content && this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node)) {
                    let pos = content.compareDocumentPosition(this.find[i].node);
                    if (pos & (before ? 2 : 4))
                        this.find[i].pos = this.currentPos;
                }
            }
    }
    findInText(textNode) {
        if (this.find)
            for (let i = 0; i < this.find.length; i++) {
                if (this.find[i].node == textNode)
                    this.find[i].pos = this.currentPos - (textNode.nodeValue.length - this.find[i].offset);
            }
    }
    // Determines whether the given context string matches this context.
    matchesContext(context) {
        if (context.indexOf("|") > -1)
            return context.split(/\s*\|\s*/).some(this.matchesContext, this);
        let parts = context.split("/");
        let option = this.options.context;
        let useRoot = !this.isOpen && (!option || option.parent.type == this.nodes[0].type);
        let minDepth = -(option ? option.depth + 1 : 0) + (useRoot ? 0 : 1);
        let match = (i, depth) => {
            for (; i >= 0; i--) {
                let part = parts[i];
                if (part == "") {
                    if (i == parts.length - 1 || i == 0)
                        continue;
                    for (; depth >= minDepth; depth--)
                        if (match(i - 1, depth))
                            return true;
                    return false;
                }
                else {
                    let next = depth > 0 || (depth == 0 && useRoot) ? this.nodes[depth].type
                        : option && depth >= minDepth ? option.node(depth - minDepth).type
                            : null;
                    if (!next || (next.name != part && next.groups.indexOf(part) == -1))
                        return false;
                    depth--;
                }
            }
            return true;
        };
        return match(parts.length - 1, this.open);
    }
    textblockFromContext() {
        let $context = this.options.context;
        if ($context)
            for (let d = $context.depth; d >= 0; d--) {
                let deflt = $context.node(d).contentMatchAt($context.indexAfter(d)).defaultType;
                if (deflt && deflt.isTextblock && deflt.defaultAttrs)
                    return deflt;
            }
        for (let name in this.parser.schema.nodes) {
            let type = this.parser.schema.nodes[name];
            if (type.isTextblock && type.defaultAttrs)
                return type;
        }
    }
    addPendingMark(mark) {
        let found = findSameMarkInSet(mark, this.top.pendingMarks);
        if (found)
            this.top.stashMarks.push(found);
        this.top.pendingMarks = mark.addToSet(this.top.pendingMarks);
    }
    removePendingMark(mark, upto) {
        for (let depth = this.open; depth >= 0; depth--) {
            let level = this.nodes[depth];
            let found = level.pendingMarks.lastIndexOf(mark);
            if (found > -1) {
                level.pendingMarks = mark.removeFromSet(level.pendingMarks);
            }
            else {
                level.activeMarks = mark.removeFromSet(level.activeMarks);
                let stashMark = level.popFromStashMark(mark);
                if (stashMark && level.type && level.type.allowsMarkType(stashMark.type))
                    level.activeMarks = stashMark.addToSet(level.activeMarks);
            }
            if (level == upto)
                break;
        }
    }
}
// Kludge to work around directly nested list nodes produced by some
// tools and allowed by browsers to mean that the nested list is
// actually part of the list item above it.
function normalizeList(dom) {
    for (let child = dom.firstChild, prevItem = null; child; child = child.nextSibling) {
        let name = child.nodeType == 1 ? child.nodeName.toLowerCase() : null;
        if (name && listTags.hasOwnProperty(name) && prevItem) {
            prevItem.appendChild(child);
            child = prevItem;
        }
        else if (name == "li") {
            prevItem = child;
        }
        else if (name) {
            prevItem = null;
        }
    }
}
// Apply a CSS selector.
function matches(dom, selector) {
    return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector);
}
// Tokenize a style attribute into property/value pairs.
function parseStyles(style) {
    let re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m, result = [];
    while (m = re.exec(style))
        result.push(m[1], m[2].trim());
    return result;
}
function copy(obj) {
    let copy = {};
    for (let prop in obj)
        copy[prop] = obj[prop];
    return copy;
}
// Used when finding a mark at the top level of a fragment parse.
// Checks whether it would be reasonable to apply a given mark type to
// a given node, by looking at the way the mark occurs in the schema.
function markMayApply(markType, nodeType) {
    let nodes = nodeType.schema.nodes;
    for (let name in nodes) {
        let parent = nodes[name];
        if (!parent.allowsMarkType(markType))
            continue;
        let seen = [], scan = (match) => {
            seen.push(match);
            for (let i = 0; i < match.edgeCount; i++) {
                let { type, next } = match.edge(i);
                if (type == nodeType)
                    return true;
                if (seen.indexOf(next) < 0 && scan(next))
                    return true;
            }
        };
        if (scan(parent.contentMatch))
            return true;
    }
}
function findSameMarkInSet(mark, set) {
    for (let i = 0; i < set.length; i++) {
        if (mark.eq(set[i]))
            return set[i];
    }
}

/**
A DOM serializer knows how to convert ProseMirror nodes and
marks of various types to DOM nodes.
*/
class DOMSerializer {
    /**
    Create a serializer. `nodes` should map node names to functions
    that take a node and return a description of the corresponding
    DOM. `marks` does the same for mark names, but also gets an
    argument that tells it whether the mark's content is block or
    inline content (for typical use, it'll always be inline). A mark
    serializer may be `null` to indicate that marks of that type
    should not be serialized.
    */
    constructor(
    /**
    The node serialization functions.
    */
    nodes, 
    /**
    The mark serialization functions.
    */
    marks) {
        this.nodes = nodes;
        this.marks = marks;
    }
    /**
    Serialize the content of this fragment to a DOM fragment. When
    not in the browser, the `document` option, containing a DOM
    document, should be passed so that the serializer can create
    nodes.
    */
    serializeFragment(fragment, options = {}, target) {
        if (!target)
            target = doc$1(options).createDocumentFragment();
        let top = target, active = [];
        fragment.forEach(node => {
            if (active.length || node.marks.length) {
                let keep = 0, rendered = 0;
                while (keep < active.length && rendered < node.marks.length) {
                    let next = node.marks[rendered];
                    if (!this.marks[next.type.name]) {
                        rendered++;
                        continue;
                    }
                    if (!next.eq(active[keep][0]) || next.type.spec.spanning === false)
                        break;
                    keep++;
                    rendered++;
                }
                while (keep < active.length)
                    top = active.pop()[1];
                while (rendered < node.marks.length) {
                    let add = node.marks[rendered++];
                    let markDOM = this.serializeMark(add, node.isInline, options);
                    if (markDOM) {
                        active.push([add, top]);
                        top.appendChild(markDOM.dom);
                        top = markDOM.contentDOM || markDOM.dom;
                    }
                }
            }
            top.appendChild(this.serializeNodeInner(node, options));
        });
        return target;
    }
    /**
    @internal
    */
    serializeNodeInner(node, options) {
        let { dom, contentDOM } = DOMSerializer.renderSpec(doc$1(options), this.nodes[node.type.name](node));
        if (contentDOM) {
            if (node.isLeaf)
                throw new RangeError("Content hole not allowed in a leaf node spec");
            this.serializeFragment(node.content, options, contentDOM);
        }
        return dom;
    }
    /**
    Serialize this node to a DOM node. This can be useful when you
    need to serialize a part of a document, as opposed to the whole
    document. To serialize a whole document, use
    [`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
    its [content](https://prosemirror.net/docs/ref/#model.Node.content).
    */
    serializeNode(node, options = {}) {
        let dom = this.serializeNodeInner(node, options);
        for (let i = node.marks.length - 1; i >= 0; i--) {
            let wrap = this.serializeMark(node.marks[i], node.isInline, options);
            if (wrap) {
                (wrap.contentDOM || wrap.dom).appendChild(dom);
                dom = wrap.dom;
            }
        }
        return dom;
    }
    /**
    @internal
    */
    serializeMark(mark, inline, options = {}) {
        let toDOM = this.marks[mark.type.name];
        return toDOM && DOMSerializer.renderSpec(doc$1(options), toDOM(mark, inline));
    }
    /**
    Render an [output spec](https://prosemirror.net/docs/ref/#model.DOMOutputSpec) to a DOM node. If
    the spec has a hole (zero) in it, `contentDOM` will point at the
    node with the hole.
    */
    static renderSpec(doc, structure, xmlNS = null) {
        if (typeof structure == "string")
            return { dom: doc.createTextNode(structure) };
        if (structure.nodeType != null)
            return { dom: structure };
        if (structure.dom && structure.dom.nodeType != null)
            return structure;
        let tagName = structure[0], space = tagName.indexOf(" ");
        if (space > 0) {
            xmlNS = tagName.slice(0, space);
            tagName = tagName.slice(space + 1);
        }
        let contentDOM;
        let dom = (xmlNS ? doc.createElementNS(xmlNS, tagName) : doc.createElement(tagName));
        let attrs = structure[1], start = 1;
        if (attrs && typeof attrs == "object" && attrs.nodeType == null && !Array.isArray(attrs)) {
            start = 2;
            for (let name in attrs)
                if (attrs[name] != null) {
                    let space = name.indexOf(" ");
                    if (space > 0)
                        dom.setAttributeNS(name.slice(0, space), name.slice(space + 1), attrs[name]);
                    else
                        dom.setAttribute(name, attrs[name]);
                }
        }
        for (let i = start; i < structure.length; i++) {
            let child = structure[i];
            if (child === 0) {
                if (i < structure.length - 1 || i > start)
                    throw new RangeError("Content hole must be the only child of its parent node");
                return { dom, contentDOM: dom };
            }
            else {
                let { dom: inner, contentDOM: innerContent } = DOMSerializer.renderSpec(doc, child, xmlNS);
                dom.appendChild(inner);
                if (innerContent) {
                    if (contentDOM)
                        throw new RangeError("Multiple content holes");
                    contentDOM = innerContent;
                }
            }
        }
        return { dom, contentDOM };
    }
    /**
    Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
    properties in a schema's node and mark specs.
    */
    static fromSchema(schema) {
        return schema.cached.domSerializer ||
            (schema.cached.domSerializer = new DOMSerializer(this.nodesFromSchema(schema), this.marksFromSchema(schema)));
    }
    /**
    Gather the serializers in a schema's node specs into an object.
    This can be useful as a base to build a custom serializer from.
    */
    static nodesFromSchema(schema) {
        let result = gatherToDOM(schema.nodes);
        if (!result.text)
            result.text = node => node.text;
        return result;
    }
    /**
    Gather the serializers in a schema's mark specs into an object.
    */
    static marksFromSchema(schema) {
        return gatherToDOM(schema.marks);
    }
}
function gatherToDOM(obj) {
    let result = {};
    for (let name in obj) {
        let toDOM = obj[name].spec.toDOM;
        if (toDOM)
            result[name] = toDOM;
    }
    return result;
}
function doc$1(options) {
    return options.document || window.document;
}

// Recovery values encode a range index and an offset. They are
// represented as numbers, because tons of them will be created when
// mapping, for example, a large number of decorations. The number's
// lower 16 bits provide the index, the remaining bits the offset.
//
// Note: We intentionally don't use bit shift operators to en- and
// decode these, since those clip to 32 bits, which we might in rare
// cases want to overflow. A 64-bit float can represent 48-bit
// integers precisely.
const lower16 = 0xffff;
const factor16 = Math.pow(2, 16);
function makeRecover(index, offset) { return index + offset * factor16; }
function recoverIndex(value) { return value & lower16; }
function recoverOffset(value) { return (value - (value & lower16)) / factor16; }
const DEL_BEFORE = 1, DEL_AFTER = 2, DEL_ACROSS = 4, DEL_SIDE = 8;
/**
An object representing a mapped position with extra
information.
*/
class MapResult {
    /**
    @internal
    */
    constructor(
    /**
    The mapped version of the position.
    */
    pos, 
    /**
    @internal
    */
    delInfo, 
    /**
    @internal
    */
    recover) {
        this.pos = pos;
        this.delInfo = delInfo;
        this.recover = recover;
    }
    /**
    Tells you whether the position was deleted, that is, whether the
    step removed the token on the side queried (via the `assoc`)
    argument from the document.
    */
    get deleted() { return (this.delInfo & DEL_SIDE) > 0; }
    /**
    Tells you whether the token before the mapped position was deleted.
    */
    get deletedBefore() { return (this.delInfo & (DEL_BEFORE | DEL_ACROSS)) > 0; }
    /**
    True when the token after the mapped position was deleted.
    */
    get deletedAfter() { return (this.delInfo & (DEL_AFTER | DEL_ACROSS)) > 0; }
    /**
    Tells whether any of the steps mapped through deletes across the
    position (including both the token before and after the
    position).
    */
    get deletedAcross() { return (this.delInfo & DEL_ACROSS) > 0; }
}
/**
A map describing the deletions and insertions made by a step, which
can be used to find the correspondence between positions in the
pre-step version of a document and the same position in the
post-step version.
*/
class StepMap {
    /**
    Create a position map. The modifications to the document are
    represented as an array of numbers, in which each group of three
    represents a modified chunk as `[start, oldSize, newSize]`.
    */
    constructor(
    /**
    @internal
    */
    ranges, 
    /**
    @internal
    */
    inverted = false) {
        this.ranges = ranges;
        this.inverted = inverted;
        if (!ranges.length && StepMap.empty)
            return StepMap.empty;
    }
    /**
    @internal
    */
    recover(value) {
        let diff = 0, index = recoverIndex(value);
        if (!this.inverted)
            for (let i = 0; i < index; i++)
                diff += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
        return this.ranges[index * 3] + diff + recoverOffset(value);
    }
    mapResult(pos, assoc = 1) { return this._map(pos, assoc, false); }
    map(pos, assoc = 1) { return this._map(pos, assoc, true); }
    /**
    @internal
    */
    _map(pos, assoc, simple) {
        let diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
        for (let i = 0; i < this.ranges.length; i += 3) {
            let start = this.ranges[i] - (this.inverted ? diff : 0);
            if (start > pos)
                break;
            let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex], end = start + oldSize;
            if (pos <= end) {
                let side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc;
                let result = start + diff + (side < 0 ? 0 : newSize);
                if (simple)
                    return result;
                let recover = pos == (assoc < 0 ? start : end) ? null : makeRecover(i / 3, pos - start);
                let del = pos == start ? DEL_AFTER : pos == end ? DEL_BEFORE : DEL_ACROSS;
                if (assoc < 0 ? pos != start : pos != end)
                    del |= DEL_SIDE;
                return new MapResult(result, del, recover);
            }
            diff += newSize - oldSize;
        }
        return simple ? pos + diff : new MapResult(pos + diff, 0, null);
    }
    /**
    @internal
    */
    touches(pos, recover) {
        let diff = 0, index = recoverIndex(recover);
        let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
        for (let i = 0; i < this.ranges.length; i += 3) {
            let start = this.ranges[i] - (this.inverted ? diff : 0);
            if (start > pos)
                break;
            let oldSize = this.ranges[i + oldIndex], end = start + oldSize;
            if (pos <= end && i == index * 3)
                return true;
            diff += this.ranges[i + newIndex] - oldSize;
        }
        return false;
    }
    /**
    Calls the given function on each of the changed ranges included in
    this map.
    */
    forEach(f) {
        let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
        for (let i = 0, diff = 0; i < this.ranges.length; i += 3) {
            let start = this.ranges[i], oldStart = start - (this.inverted ? diff : 0), newStart = start + (this.inverted ? 0 : diff);
            let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex];
            f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
            diff += newSize - oldSize;
        }
    }
    /**
    Create an inverted version of this map. The result can be used to
    map positions in the post-step document to the pre-step document.
    */
    invert() {
        return new StepMap(this.ranges, !this.inverted);
    }
    /**
    @internal
    */
    toString() {
        return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
    }
    /**
    Create a map that moves all positions by offset `n` (which may be
    negative). This can be useful when applying steps meant for a
    sub-document to a larger document, or vice-versa.
    */
    static offset(n) {
        return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [0, -n, 0] : [0, 0, n]);
    }
}
/**
A StepMap that contains no changed ranges.
*/
StepMap.empty = new StepMap([]);
/**
A mapping represents a pipeline of zero or more [step
maps](https://prosemirror.net/docs/ref/#transform.StepMap). It has special provisions for losslessly
handling mapping positions through a series of steps in which some
steps are inverted versions of earlier steps. (This comes up when
‘[rebasing](/docs/guide/#transform.rebasing)’ steps for
collaboration or history management.)
*/
class Mapping {
    /**
    Create a new mapping with the given position maps.
    */
    constructor(
    /**
    The step maps in this mapping.
    */
    maps = [], 
    /**
    @internal
    */
    mirror, 
    /**
    The starting position in the `maps` array, used when `map` or
    `mapResult` is called.
    */
    from = 0, 
    /**
    The end position in the `maps` array.
    */
    to = maps.length) {
        this.maps = maps;
        this.mirror = mirror;
        this.from = from;
        this.to = to;
    }
    /**
    Create a mapping that maps only through a part of this one.
    */
    slice(from = 0, to = this.maps.length) {
        return new Mapping(this.maps, this.mirror, from, to);
    }
    /**
    @internal
    */
    copy() {
        return new Mapping(this.maps.slice(), this.mirror && this.mirror.slice(), this.from, this.to);
    }
    /**
    Add a step map to the end of this mapping. If `mirrors` is
    given, it should be the index of the step map that is the mirror
    image of this one.
    */
    appendMap(map, mirrors) {
        this.to = this.maps.push(map);
        if (mirrors != null)
            this.setMirror(this.maps.length - 1, mirrors);
    }
    /**
    Add all the step maps in a given mapping to this one (preserving
    mirroring information).
    */
    appendMapping(mapping) {
        for (let i = 0, startSize = this.maps.length; i < mapping.maps.length; i++) {
            let mirr = mapping.getMirror(i);
            this.appendMap(mapping.maps[i], mirr != null && mirr < i ? startSize + mirr : undefined);
        }
    }
    /**
    Finds the offset of the step map that mirrors the map at the
    given offset, in this mapping (as per the second argument to
    `appendMap`).
    */
    getMirror(n) {
        if (this.mirror)
            for (let i = 0; i < this.mirror.length; i++)
                if (this.mirror[i] == n)
                    return this.mirror[i + (i % 2 ? -1 : 1)];
    }
    /**
    @internal
    */
    setMirror(n, m) {
        if (!this.mirror)
            this.mirror = [];
        this.mirror.push(n, m);
    }
    /**
    Append the inverse of the given mapping to this one.
    */
    appendMappingInverted(mapping) {
        for (let i = mapping.maps.length - 1, totalSize = this.maps.length + mapping.maps.length; i >= 0; i--) {
            let mirr = mapping.getMirror(i);
            this.appendMap(mapping.maps[i].invert(), mirr != null && mirr > i ? totalSize - mirr - 1 : undefined);
        }
    }
    /**
    Create an inverted version of this mapping.
    */
    invert() {
        let inverse = new Mapping;
        inverse.appendMappingInverted(this);
        return inverse;
    }
    /**
    Map a position through this mapping.
    */
    map(pos, assoc = 1) {
        if (this.mirror)
            return this._map(pos, assoc, true);
        for (let i = this.from; i < this.to; i++)
            pos = this.maps[i].map(pos, assoc);
        return pos;
    }
    /**
    Map a position through this mapping, returning a mapping
    result.
    */
    mapResult(pos, assoc = 1) { return this._map(pos, assoc, false); }
    /**
    @internal
    */
    _map(pos, assoc, simple) {
        let delInfo = 0;
        for (let i = this.from; i < this.to; i++) {
            let map = this.maps[i], result = map.mapResult(pos, assoc);
            if (result.recover != null) {
                let corr = this.getMirror(i);
                if (corr != null && corr > i && corr < this.to) {
                    i = corr;
                    pos = this.maps[corr].recover(result.recover);
                    continue;
                }
            }
            delInfo |= result.delInfo;
            pos = result.pos;
        }
        return simple ? pos : new MapResult(pos, delInfo, null);
    }
}

const stepsByID = Object.create(null);
/**
A step object represents an atomic change. It generally applies
only to the document it was created for, since the positions
stored in it will only make sense for that document.

New steps are defined by creating classes that extend `Step`,
overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
methods, and registering your class with a unique
JSON-serialization identifier using
[`Step.jsonID`](https://prosemirror.net/docs/ref/#transform.Step^jsonID).
*/
class Step {
    /**
    Get the step map that represents the changes made by this step,
    and which can be used to transform between positions in the old
    and the new document.
    */
    getMap() { return StepMap.empty; }
    /**
    Try to merge this step with another one, to be applied directly
    after it. Returns the merged step when possible, null if the
    steps can't be merged.
    */
    merge(other) { return null; }
    /**
    Deserialize a step from its JSON representation. Will call
    through to the step class' own implementation of this method.
    */
    static fromJSON(schema, json) {
        if (!json || !json.stepType)
            throw new RangeError("Invalid input for Step.fromJSON");
        let type = stepsByID[json.stepType];
        if (!type)
            throw new RangeError(`No step type ${json.stepType} defined`);
        return type.fromJSON(schema, json);
    }
    /**
    To be able to serialize steps to JSON, each step needs a string
    ID to attach to its JSON representation. Use this method to
    register an ID for your step classes. Try to pick something
    that's unlikely to clash with steps from other modules.
    */
    static jsonID(id, stepClass) {
        if (id in stepsByID)
            throw new RangeError("Duplicate use of step JSON ID " + id);
        stepsByID[id] = stepClass;
        stepClass.prototype.jsonID = id;
        return stepClass;
    }
}
/**
The result of [applying](https://prosemirror.net/docs/ref/#transform.Step.apply) a step. Contains either a
new document or a failure value.
*/
class StepResult {
    /**
    @internal
    */
    constructor(
    /**
    The transformed document, if successful.
    */
    doc, 
    /**
    The failure message, if unsuccessful.
    */
    failed) {
        this.doc = doc;
        this.failed = failed;
    }
    /**
    Create a successful step result.
    */
    static ok(doc) { return new StepResult(doc, null); }
    /**
    Create a failed step result.
    */
    static fail(message) { return new StepResult(null, message); }
    /**
    Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
    arguments. Create a successful result if it succeeds, and a
    failed one if it throws a `ReplaceError`.
    */
    static fromReplace(doc, from, to, slice) {
        try {
            return StepResult.ok(doc.replace(from, to, slice));
        }
        catch (e) {
            if (e instanceof ReplaceError)
                return StepResult.fail(e.message);
            throw e;
        }
    }
}

function mapFragment(fragment, f, parent) {
    let mapped = [];
    for (let i = 0; i < fragment.childCount; i++) {
        let child = fragment.child(i);
        if (child.content.size)
            child = child.copy(mapFragment(child.content, f, child));
        if (child.isInline)
            child = f(child, parent, i);
        mapped.push(child);
    }
    return Fragment.fromArray(mapped);
}
/**
Add a mark to all inline content between two positions.
*/
class AddMarkStep extends Step {
    /**
    Create a mark step.
    */
    constructor(
    /**
    The start of the marked range.
    */
    from, 
    /**
    The end of the marked range.
    */
    to, 
    /**
    The mark to add.
    */
    mark) {
        super();
        this.from = from;
        this.to = to;
        this.mark = mark;
    }
    apply(doc) {
        let oldSlice = doc.slice(this.from, this.to), $from = doc.resolve(this.from);
        let parent = $from.node($from.sharedDepth(this.to));
        let slice = new Slice(mapFragment(oldSlice.content, (node, parent) => {
            if (!node.isAtom || !parent.type.allowsMarkType(this.mark.type))
                return node;
            return node.mark(this.mark.addToSet(node.marks));
        }, parent), oldSlice.openStart, oldSlice.openEnd);
        return StepResult.fromReplace(doc, this.from, this.to, slice);
    }
    invert() {
        return new RemoveMarkStep(this.from, this.to, this.mark);
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        if (from.deleted && to.deleted || from.pos >= to.pos)
            return null;
        return new AddMarkStep(from.pos, to.pos, this.mark);
    }
    merge(other) {
        if (other instanceof AddMarkStep &&
            other.mark.eq(this.mark) &&
            this.from <= other.to && this.to >= other.from)
            return new AddMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
        return null;
    }
    toJSON() {
        return { stepType: "addMark", mark: this.mark.toJSON(),
            from: this.from, to: this.to };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number")
            throw new RangeError("Invalid input for AddMarkStep.fromJSON");
        return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("addMark", AddMarkStep);
/**
Remove a mark from all inline content between two positions.
*/
class RemoveMarkStep extends Step {
    /**
    Create a mark-removing step.
    */
    constructor(
    /**
    The start of the unmarked range.
    */
    from, 
    /**
    The end of the unmarked range.
    */
    to, 
    /**
    The mark to remove.
    */
    mark) {
        super();
        this.from = from;
        this.to = to;
        this.mark = mark;
    }
    apply(doc) {
        let oldSlice = doc.slice(this.from, this.to);
        let slice = new Slice(mapFragment(oldSlice.content, node => {
            return node.mark(this.mark.removeFromSet(node.marks));
        }, doc), oldSlice.openStart, oldSlice.openEnd);
        return StepResult.fromReplace(doc, this.from, this.to, slice);
    }
    invert() {
        return new AddMarkStep(this.from, this.to, this.mark);
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        if (from.deleted && to.deleted || from.pos >= to.pos)
            return null;
        return new RemoveMarkStep(from.pos, to.pos, this.mark);
    }
    merge(other) {
        if (other instanceof RemoveMarkStep &&
            other.mark.eq(this.mark) &&
            this.from <= other.to && this.to >= other.from)
            return new RemoveMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
        return null;
    }
    toJSON() {
        return { stepType: "removeMark", mark: this.mark.toJSON(),
            from: this.from, to: this.to };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number")
            throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
        return new RemoveMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("removeMark", RemoveMarkStep);
/**
Add a mark to a specific node.
*/
class AddNodeMarkStep extends Step {
    /**
    Create a node mark step.
    */
    constructor(
    /**
    The position of the target node.
    */
    pos, 
    /**
    The mark to add.
    */
    mark) {
        super();
        this.pos = pos;
        this.mark = mark;
    }
    apply(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node)
            return StepResult.fail("No node at mark step's position");
        let updated = node.type.create(node.attrs, null, this.mark.addToSet(node.marks));
        return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
    }
    invert(doc) {
        let node = doc.nodeAt(this.pos);
        if (node) {
            let newSet = this.mark.addToSet(node.marks);
            if (newSet.length == node.marks.length) {
                for (let i = 0; i < node.marks.length; i++)
                    if (!node.marks[i].isInSet(newSet))
                        return new AddNodeMarkStep(this.pos, node.marks[i]);
                return new AddNodeMarkStep(this.pos, this.mark);
            }
        }
        return new RemoveNodeMarkStep(this.pos, this.mark);
    }
    map(mapping) {
        let pos = mapping.mapResult(this.pos, 1);
        return pos.deletedAfter ? null : new AddNodeMarkStep(pos.pos, this.mark);
    }
    toJSON() {
        return { stepType: "addNodeMark", pos: this.pos, mark: this.mark.toJSON() };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.pos != "number")
            throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
        return new AddNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("addNodeMark", AddNodeMarkStep);
/**
Remove a mark from a specific node.
*/
class RemoveNodeMarkStep extends Step {
    /**
    Create a mark-removing step.
    */
    constructor(
    /**
    The position of the target node.
    */
    pos, 
    /**
    The mark to remove.
    */
    mark) {
        super();
        this.pos = pos;
        this.mark = mark;
    }
    apply(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node)
            return StepResult.fail("No node at mark step's position");
        let updated = node.type.create(node.attrs, null, this.mark.removeFromSet(node.marks));
        return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
    }
    invert(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node || !this.mark.isInSet(node.marks))
            return this;
        return new AddNodeMarkStep(this.pos, this.mark);
    }
    map(mapping) {
        let pos = mapping.mapResult(this.pos, 1);
        return pos.deletedAfter ? null : new RemoveNodeMarkStep(pos.pos, this.mark);
    }
    toJSON() {
        return { stepType: "removeNodeMark", pos: this.pos, mark: this.mark.toJSON() };
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.pos != "number")
            throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
        return new RemoveNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
    }
}
Step.jsonID("removeNodeMark", RemoveNodeMarkStep);

/**
Replace a part of the document with a slice of new content.
*/
class ReplaceStep extends Step {
    /**
    The given `slice` should fit the 'gap' between `from` and
    `to`—the depths must line up, and the surrounding nodes must be
    able to be joined with the open sides of the slice. When
    `structure` is true, the step will fail if the content between
    from and to is not just a sequence of closing and then opening
    tokens (this is to guard against rebased replace steps
    overwriting something they weren't supposed to).
    */
    constructor(
    /**
    The start position of the replaced range.
    */
    from, 
    /**
    The end position of the replaced range.
    */
    to, 
    /**
    The slice to insert.
    */
    slice, 
    /**
    @internal
    */
    structure = false) {
        super();
        this.from = from;
        this.to = to;
        this.slice = slice;
        this.structure = structure;
    }
    apply(doc) {
        if (this.structure && contentBetween(doc, this.from, this.to))
            return StepResult.fail("Structure replace would overwrite content");
        return StepResult.fromReplace(doc, this.from, this.to, this.slice);
    }
    getMap() {
        return new StepMap([this.from, this.to - this.from, this.slice.size]);
    }
    invert(doc) {
        return new ReplaceStep(this.from, this.from + this.slice.size, doc.slice(this.from, this.to));
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        if (from.deletedAcross && to.deletedAcross)
            return null;
        return new ReplaceStep(from.pos, Math.max(from.pos, to.pos), this.slice);
    }
    merge(other) {
        if (!(other instanceof ReplaceStep) || other.structure || this.structure)
            return null;
        if (this.from + this.slice.size == other.from && !this.slice.openEnd && !other.slice.openStart) {
            let slice = this.slice.size + other.slice.size == 0 ? Slice.empty
                : new Slice(this.slice.content.append(other.slice.content), this.slice.openStart, other.slice.openEnd);
            return new ReplaceStep(this.from, this.to + (other.to - other.from), slice, this.structure);
        }
        else if (other.to == this.from && !this.slice.openStart && !other.slice.openEnd) {
            let slice = this.slice.size + other.slice.size == 0 ? Slice.empty
                : new Slice(other.slice.content.append(this.slice.content), other.slice.openStart, this.slice.openEnd);
            return new ReplaceStep(other.from, this.to, slice, this.structure);
        }
        else {
            return null;
        }
    }
    toJSON() {
        let json = { stepType: "replace", from: this.from, to: this.to };
        if (this.slice.size)
            json.slice = this.slice.toJSON();
        if (this.structure)
            json.structure = true;
        return json;
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number")
            throw new RangeError("Invalid input for ReplaceStep.fromJSON");
        return new ReplaceStep(json.from, json.to, Slice.fromJSON(schema, json.slice), !!json.structure);
    }
}
Step.jsonID("replace", ReplaceStep);
/**
Replace a part of the document with a slice of content, but
preserve a range of the replaced content by moving it into the
slice.
*/
class ReplaceAroundStep extends Step {
    /**
    Create a replace-around step with the given range and gap.
    `insert` should be the point in the slice into which the content
    of the gap should be moved. `structure` has the same meaning as
    it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
    */
    constructor(
    /**
    The start position of the replaced range.
    */
    from, 
    /**
    The end position of the replaced range.
    */
    to, 
    /**
    The start of preserved range.
    */
    gapFrom, 
    /**
    The end of preserved range.
    */
    gapTo, 
    /**
    The slice to insert.
    */
    slice, 
    /**
    The position in the slice where the preserved range should be
    inserted.
    */
    insert, 
    /**
    @internal
    */
    structure = false) {
        super();
        this.from = from;
        this.to = to;
        this.gapFrom = gapFrom;
        this.gapTo = gapTo;
        this.slice = slice;
        this.insert = insert;
        this.structure = structure;
    }
    apply(doc) {
        if (this.structure && (contentBetween(doc, this.from, this.gapFrom) ||
            contentBetween(doc, this.gapTo, this.to)))
            return StepResult.fail("Structure gap-replace would overwrite content");
        let gap = doc.slice(this.gapFrom, this.gapTo);
        if (gap.openStart || gap.openEnd)
            return StepResult.fail("Gap is not a flat range");
        let inserted = this.slice.insertAt(this.insert, gap.content);
        if (!inserted)
            return StepResult.fail("Content does not fit in gap");
        return StepResult.fromReplace(doc, this.from, this.to, inserted);
    }
    getMap() {
        return new StepMap([this.from, this.gapFrom - this.from, this.insert,
            this.gapTo, this.to - this.gapTo, this.slice.size - this.insert]);
    }
    invert(doc) {
        let gap = this.gapTo - this.gapFrom;
        return new ReplaceAroundStep(this.from, this.from + this.slice.size + gap, this.from + this.insert, this.from + this.insert + gap, doc.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
    }
    map(mapping) {
        let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
        let gapFrom = mapping.map(this.gapFrom, -1), gapTo = mapping.map(this.gapTo, 1);
        if ((from.deletedAcross && to.deletedAcross) || gapFrom < from.pos || gapTo > to.pos)
            return null;
        return new ReplaceAroundStep(from.pos, to.pos, gapFrom, gapTo, this.slice, this.insert, this.structure);
    }
    toJSON() {
        let json = { stepType: "replaceAround", from: this.from, to: this.to,
            gapFrom: this.gapFrom, gapTo: this.gapTo, insert: this.insert };
        if (this.slice.size)
            json.slice = this.slice.toJSON();
        if (this.structure)
            json.structure = true;
        return json;
    }
    /**
    @internal
    */
    static fromJSON(schema, json) {
        if (typeof json.from != "number" || typeof json.to != "number" ||
            typeof json.gapFrom != "number" || typeof json.gapTo != "number" || typeof json.insert != "number")
            throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
        return new ReplaceAroundStep(json.from, json.to, json.gapFrom, json.gapTo, Slice.fromJSON(schema, json.slice), json.insert, !!json.structure);
    }
}
Step.jsonID("replaceAround", ReplaceAroundStep);
function contentBetween(doc, from, to) {
    let $from = doc.resolve(from), dist = to - from, depth = $from.depth;
    while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
        depth--;
        dist--;
    }
    if (dist > 0) {
        let next = $from.node(depth).maybeChild($from.indexAfter(depth));
        while (dist > 0) {
            if (!next || next.isLeaf)
                return true;
            next = next.firstChild;
            dist--;
        }
    }
    return false;
}

function addMark(tr, from, to, mark) {
    let removed = [], added = [];
    let removing, adding;
    tr.doc.nodesBetween(from, to, (node, pos, parent) => {
        if (!node.isInline)
            return;
        let marks = node.marks;
        if (!mark.isInSet(marks) && parent.type.allowsMarkType(mark.type)) {
            let start = Math.max(pos, from), end = Math.min(pos + node.nodeSize, to);
            let newSet = mark.addToSet(marks);
            for (let i = 0; i < marks.length; i++) {
                if (!marks[i].isInSet(newSet)) {
                    if (removing && removing.to == start && removing.mark.eq(marks[i]))
                        removing.to = end;
                    else
                        removed.push(removing = new RemoveMarkStep(start, end, marks[i]));
                }
            }
            if (adding && adding.to == start)
                adding.to = end;
            else
                added.push(adding = new AddMarkStep(start, end, mark));
        }
    });
    removed.forEach(s => tr.step(s));
    added.forEach(s => tr.step(s));
}
function removeMark(tr, from, to, mark) {
    let matched = [], step = 0;
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isInline)
            return;
        step++;
        let toRemove = null;
        if (mark instanceof MarkType) {
            let set = node.marks, found;
            while (found = mark.isInSet(set)) {
                (toRemove || (toRemove = [])).push(found);
                set = found.removeFromSet(set);
            }
        }
        else if (mark) {
            if (mark.isInSet(node.marks))
                toRemove = [mark];
        }
        else {
            toRemove = node.marks;
        }
        if (toRemove && toRemove.length) {
            let end = Math.min(pos + node.nodeSize, to);
            for (let i = 0; i < toRemove.length; i++) {
                let style = toRemove[i], found;
                for (let j = 0; j < matched.length; j++) {
                    let m = matched[j];
                    if (m.step == step - 1 && style.eq(matched[j].style))
                        found = m;
                }
                if (found) {
                    found.to = end;
                    found.step = step;
                }
                else {
                    matched.push({ style, from: Math.max(pos, from), to: end, step });
                }
            }
        }
    });
    matched.forEach(m => tr.step(new RemoveMarkStep(m.from, m.to, m.style)));
}
function clearIncompatible(tr, pos, parentType, match = parentType.contentMatch) {
    let node = tr.doc.nodeAt(pos);
    let replSteps = [], cur = pos + 1;
    for (let i = 0; i < node.childCount; i++) {
        let child = node.child(i), end = cur + child.nodeSize;
        let allowed = match.matchType(child.type);
        if (!allowed) {
            replSteps.push(new ReplaceStep(cur, end, Slice.empty));
        }
        else {
            match = allowed;
            for (let j = 0; j < child.marks.length; j++)
                if (!parentType.allowsMarkType(child.marks[j].type))
                    tr.step(new RemoveMarkStep(cur, end, child.marks[j]));
            if (child.isText && !parentType.spec.code) {
                let m, newline = /\r?\n|\r/g, slice;
                while (m = newline.exec(child.text)) {
                    if (!slice)
                        slice = new Slice(Fragment.from(parentType.schema.text(" ", parentType.allowedMarks(child.marks))), 0, 0);
                    replSteps.push(new ReplaceStep(cur + m.index, cur + m.index + m[0].length, slice));
                }
            }
        }
        cur = end;
    }
    if (!match.validEnd) {
        let fill = match.fillBefore(Fragment.empty, true);
        tr.replace(cur, cur, new Slice(fill, 0, 0));
    }
    for (let i = replSteps.length - 1; i >= 0; i--)
        tr.step(replSteps[i]);
}

function canCut(node, start, end) {
    return (start == 0 || node.canReplace(start, node.childCount)) &&
        (end == node.childCount || node.canReplace(0, end));
}
/**
Try to find a target depth to which the content in the given range
can be lifted. Will not go across
[isolating](https://prosemirror.net/docs/ref/#model.NodeSpec.isolating) parent nodes.
*/
function liftTarget(range) {
    let parent = range.parent;
    let content = parent.content.cutByIndex(range.startIndex, range.endIndex);
    for (let depth = range.depth;; --depth) {
        let node = range.$from.node(depth);
        let index = range.$from.index(depth), endIndex = range.$to.indexAfter(depth);
        if (depth < range.depth && node.canReplace(index, endIndex, content))
            return depth;
        if (depth == 0 || node.type.spec.isolating || !canCut(node, index, endIndex))
            break;
    }
    return null;
}
function lift(tr, range, target) {
    let { $from, $to, depth } = range;
    let gapStart = $from.before(depth + 1), gapEnd = $to.after(depth + 1);
    let start = gapStart, end = gapEnd;
    let before = Fragment.empty, openStart = 0;
    for (let d = depth, splitting = false; d > target; d--)
        if (splitting || $from.index(d) > 0) {
            splitting = true;
            before = Fragment.from($from.node(d).copy(before));
            openStart++;
        }
        else {
            start--;
        }
    let after = Fragment.empty, openEnd = 0;
    for (let d = depth, splitting = false; d > target; d--)
        if (splitting || $to.after(d + 1) < $to.end(d)) {
            splitting = true;
            after = Fragment.from($to.node(d).copy(after));
            openEnd++;
        }
        else {
            end++;
        }
    tr.step(new ReplaceAroundStep(start, end, gapStart, gapEnd, new Slice(before.append(after), openStart, openEnd), before.size - openStart, true));
}
/**
Try to find a valid way to wrap the content in the given range in a
node of the given type. May introduce extra nodes around and inside
the wrapper node, if necessary. Returns null if no valid wrapping
could be found. When `innerRange` is given, that range's content is
used as the content to fit into the wrapping, instead of the
content of `range`.
*/
function findWrapping(range, nodeType, attrs = null, innerRange = range) {
    let around = findWrappingOutside(range, nodeType);
    let inner = around && findWrappingInside(innerRange, nodeType);
    if (!inner)
        return null;
    return around.map(withAttrs)
        .concat({ type: nodeType, attrs }).concat(inner.map(withAttrs));
}
function withAttrs(type) { return { type, attrs: null }; }
function findWrappingOutside(range, type) {
    let { parent, startIndex, endIndex } = range;
    let around = parent.contentMatchAt(startIndex).findWrapping(type);
    if (!around)
        return null;
    let outer = around.length ? around[0] : type;
    return parent.canReplaceWith(startIndex, endIndex, outer) ? around : null;
}
function findWrappingInside(range, type) {
    let { parent, startIndex, endIndex } = range;
    let inner = parent.child(startIndex);
    let inside = type.contentMatch.findWrapping(inner.type);
    if (!inside)
        return null;
    let lastType = inside.length ? inside[inside.length - 1] : type;
    let innerMatch = lastType.contentMatch;
    for (let i = startIndex; innerMatch && i < endIndex; i++)
        innerMatch = innerMatch.matchType(parent.child(i).type);
    if (!innerMatch || !innerMatch.validEnd)
        return null;
    return inside;
}
function wrap(tr, range, wrappers) {
    let content = Fragment.empty;
    for (let i = wrappers.length - 1; i >= 0; i--) {
        if (content.size) {
            let match = wrappers[i].type.contentMatch.matchFragment(content);
            if (!match || !match.validEnd)
                throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
        }
        content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content));
    }
    let start = range.start, end = range.end;
    tr.step(new ReplaceAroundStep(start, end, start, end, new Slice(content, 0, 0), wrappers.length, true));
}
function setBlockType$1(tr, from, to, type, attrs) {
    if (!type.isTextblock)
        throw new RangeError("Type given to setBlockType should be a textblock");
    let mapFrom = tr.steps.length;
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isTextblock && !node.hasMarkup(type, attrs) && canChangeType(tr.doc, tr.mapping.slice(mapFrom).map(pos), type)) {
            // Ensure all markup that isn't allowed in the new node type is cleared
            tr.clearIncompatible(tr.mapping.slice(mapFrom).map(pos, 1), type);
            let mapping = tr.mapping.slice(mapFrom);
            let startM = mapping.map(pos, 1), endM = mapping.map(pos + node.nodeSize, 1);
            tr.step(new ReplaceAroundStep(startM, endM, startM + 1, endM - 1, new Slice(Fragment.from(type.create(attrs, null, node.marks)), 0, 0), 1, true));
            return false;
        }
    });
}
function canChangeType(doc, pos, type) {
    let $pos = doc.resolve(pos), index = $pos.index();
    return $pos.parent.canReplaceWith(index, index + 1, type);
}
/**
Change the type, attributes, and/or marks of the node at `pos`.
When `type` isn't given, the existing node type is preserved,
*/
function setNodeMarkup(tr, pos, type, attrs, marks) {
    let node = tr.doc.nodeAt(pos);
    if (!node)
        throw new RangeError("No node at given position");
    if (!type)
        type = node.type;
    let newNode = type.create(attrs, null, marks || node.marks);
    if (node.isLeaf)
        return tr.replaceWith(pos, pos + node.nodeSize, newNode);
    if (!type.validContent(node.content))
        throw new RangeError("Invalid content for node type " + type.name);
    tr.step(new ReplaceAroundStep(pos, pos + node.nodeSize, pos + 1, pos + node.nodeSize - 1, new Slice(Fragment.from(newNode), 0, 0), 1, true));
}
/**
Check whether splitting at the given position is allowed.
*/
function canSplit(doc, pos, depth = 1, typesAfter) {
    let $pos = doc.resolve(pos), base = $pos.depth - depth;
    let innerType = (typesAfter && typesAfter[typesAfter.length - 1]) || $pos.parent;
    if (base < 0 || $pos.parent.type.spec.isolating ||
        !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) ||
        !innerType.type.validContent($pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount)))
        return false;
    for (let d = $pos.depth - 1, i = depth - 2; d > base; d--, i--) {
        let node = $pos.node(d), index = $pos.index(d);
        if (node.type.spec.isolating)
            return false;
        let rest = node.content.cutByIndex(index, node.childCount);
        let overrideChild = typesAfter && typesAfter[i + 1];
        if (overrideChild)
            rest = rest.replaceChild(0, overrideChild.type.create(overrideChild.attrs));
        let after = (typesAfter && typesAfter[i]) || node;
        if (!node.canReplace(index + 1, node.childCount) || !after.type.validContent(rest))
            return false;
    }
    let index = $pos.indexAfter(base);
    let baseType = typesAfter && typesAfter[0];
    return $pos.node(base).canReplaceWith(index, index, baseType ? baseType.type : $pos.node(base + 1).type);
}
function split(tr, pos, depth = 1, typesAfter) {
    let $pos = tr.doc.resolve(pos), before = Fragment.empty, after = Fragment.empty;
    for (let d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
        before = Fragment.from($pos.node(d).copy(before));
        let typeAfter = typesAfter && typesAfter[i];
        after = Fragment.from(typeAfter ? typeAfter.type.create(typeAfter.attrs, after) : $pos.node(d).copy(after));
    }
    tr.step(new ReplaceStep(pos, pos, new Slice(before.append(after), depth, depth), true));
}
/**
Test whether the blocks before and after a given position can be
joined.
*/
function canJoin(doc, pos) {
    let $pos = doc.resolve(pos), index = $pos.index();
    return joinable($pos.nodeBefore, $pos.nodeAfter) &&
        $pos.parent.canReplace(index, index + 1);
}
function joinable(a, b) {
    return !!(a && b && !a.isLeaf && a.canAppend(b));
}
/**
Find an ancestor of the given position that can be joined to the
block before (or after if `dir` is positive). Returns the joinable
point, if any.
*/
function joinPoint(doc, pos, dir = -1) {
    let $pos = doc.resolve(pos);
    for (let d = $pos.depth;; d--) {
        let before, after, index = $pos.index(d);
        if (d == $pos.depth) {
            before = $pos.nodeBefore;
            after = $pos.nodeAfter;
        }
        else if (dir > 0) {
            before = $pos.node(d + 1);
            index++;
            after = $pos.node(d).maybeChild(index);
        }
        else {
            before = $pos.node(d).maybeChild(index - 1);
            after = $pos.node(d + 1);
        }
        if (before && !before.isTextblock && joinable(before, after) &&
            $pos.node(d).canReplace(index, index + 1))
            return pos;
        if (d == 0)
            break;
        pos = dir < 0 ? $pos.before(d) : $pos.after(d);
    }
}
function join(tr, pos, depth) {
    let step = new ReplaceStep(pos - depth, pos + depth, Slice.empty, true);
    tr.step(step);
}
/**
Try to find a point where a node of the given type can be inserted
near `pos`, by searching up the node hierarchy when `pos` itself
isn't a valid place but is at the start or end of a node. Return
null if no position was found.
*/
function insertPoint(doc, pos, nodeType) {
    let $pos = doc.resolve(pos);
    if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType))
        return pos;
    if ($pos.parentOffset == 0)
        for (let d = $pos.depth - 1; d >= 0; d--) {
            let index = $pos.index(d);
            if ($pos.node(d).canReplaceWith(index, index, nodeType))
                return $pos.before(d + 1);
            if (index > 0)
                return null;
        }
    if ($pos.parentOffset == $pos.parent.content.size)
        for (let d = $pos.depth - 1; d >= 0; d--) {
            let index = $pos.indexAfter(d);
            if ($pos.node(d).canReplaceWith(index, index, nodeType))
                return $pos.after(d + 1);
            if (index < $pos.node(d).childCount)
                return null;
        }
    return null;
}
/**
Finds a position at or around the given position where the given
slice can be inserted. Will look at parent nodes' nearest boundary
and try there, even if the original position wasn't directly at the
start or end of that node. Returns null when no position was found.
*/
function dropPoint(doc, pos, slice) {
    let $pos = doc.resolve(pos);
    if (!slice.content.size)
        return pos;
    let content = slice.content;
    for (let i = 0; i < slice.openStart; i++)
        content = content.firstChild.content;
    for (let pass = 1; pass <= (slice.openStart == 0 && slice.size ? 2 : 1); pass++) {
        for (let d = $pos.depth; d >= 0; d--) {
            let bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1;
            let insertPos = $pos.index(d) + (bias > 0 ? 1 : 0);
            let parent = $pos.node(d), fits = false;
            if (pass == 1) {
                fits = parent.canReplace(insertPos, insertPos, content);
            }
            else {
                let wrapping = parent.contentMatchAt(insertPos).findWrapping(content.firstChild.type);
                fits = wrapping && parent.canReplaceWith(insertPos, insertPos, wrapping[0]);
            }
            if (fits)
                return bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1);
        }
    }
    return null;
}

/**
‘Fit’ a slice into a given position in the document, producing a
[step](https://prosemirror.net/docs/ref/#transform.Step) that inserts it. Will return null if
there's no meaningful way to insert the slice here, or inserting it
would be a no-op (an empty slice over an empty range).
*/
function replaceStep(doc, from, to = from, slice = Slice.empty) {
    if (from == to && !slice.size)
        return null;
    let $from = doc.resolve(from), $to = doc.resolve(to);
    // Optimization -- avoid work if it's obvious that it's not needed.
    if (fitsTrivially($from, $to, slice))
        return new ReplaceStep(from, to, slice);
    return new Fitter($from, $to, slice).fit();
}
function fitsTrivially($from, $to, slice) {
    return !slice.openStart && !slice.openEnd && $from.start() == $to.start() &&
        $from.parent.canReplace($from.index(), $to.index(), slice.content);
}
// Algorithm for 'placing' the elements of a slice into a gap:
//
// We consider the content of each node that is open to the left to be
// independently placeable. I.e. in <p("foo"), p("bar")>, when the
// paragraph on the left is open, "foo" can be placed (somewhere on
// the left side of the replacement gap) independently from p("bar").
//
// This class tracks the state of the placement progress in the
// following properties:
//
//  - `frontier` holds a stack of `{type, match}` objects that
//    represent the open side of the replacement. It starts at
//    `$from`, then moves forward as content is placed, and is finally
//    reconciled with `$to`.
//
//  - `unplaced` is a slice that represents the content that hasn't
//    been placed yet.
//
//  - `placed` is a fragment of placed content. Its open-start value
//    is implicit in `$from`, and its open-end value in `frontier`.
class Fitter {
    constructor($from, $to, unplaced) {
        this.$from = $from;
        this.$to = $to;
        this.unplaced = unplaced;
        this.frontier = [];
        this.placed = Fragment.empty;
        for (let i = 0; i <= $from.depth; i++) {
            let node = $from.node(i);
            this.frontier.push({
                type: node.type,
                match: node.contentMatchAt($from.indexAfter(i))
            });
        }
        for (let i = $from.depth; i > 0; i--)
            this.placed = Fragment.from($from.node(i).copy(this.placed));
    }
    get depth() { return this.frontier.length - 1; }
    fit() {
        // As long as there's unplaced content, try to place some of it.
        // If that fails, either increase the open score of the unplaced
        // slice, or drop nodes from it, and then try again.
        while (this.unplaced.size) {
            let fit = this.findFittable();
            if (fit)
                this.placeNodes(fit);
            else
                this.openMore() || this.dropNode();
        }
        // When there's inline content directly after the frontier _and_
        // directly after `this.$to`, we must generate a `ReplaceAround`
        // step that pulls that content into the node after the frontier.
        // That means the fitting must be done to the end of the textblock
        // node after `this.$to`, not `this.$to` itself.
        let moveInline = this.mustMoveInline(), placedSize = this.placed.size - this.depth - this.$from.depth;
        let $from = this.$from, $to = this.close(moveInline < 0 ? this.$to : $from.doc.resolve(moveInline));
        if (!$to)
            return null;
        // If closing to `$to` succeeded, create a step
        let content = this.placed, openStart = $from.depth, openEnd = $to.depth;
        while (openStart && openEnd && content.childCount == 1) { // Normalize by dropping open parent nodes
            content = content.firstChild.content;
            openStart--;
            openEnd--;
        }
        let slice = new Slice(content, openStart, openEnd);
        if (moveInline > -1)
            return new ReplaceAroundStep($from.pos, moveInline, this.$to.pos, this.$to.end(), slice, placedSize);
        if (slice.size || $from.pos != this.$to.pos) // Don't generate no-op steps
            return new ReplaceStep($from.pos, $to.pos, slice);
        return null;
    }
    // Find a position on the start spine of `this.unplaced` that has
    // content that can be moved somewhere on the frontier. Returns two
    // depths, one for the slice and one for the frontier.
    findFittable() {
        let startDepth = this.unplaced.openStart;
        for (let cur = this.unplaced.content, d = 0, openEnd = this.unplaced.openEnd; d < startDepth; d++) {
            let node = cur.firstChild;
            if (cur.childCount > 1)
                openEnd = 0;
            if (node.type.spec.isolating && openEnd <= d) {
                startDepth = d;
                break;
            }
            cur = node.content;
        }
        // Only try wrapping nodes (pass 2) after finding a place without
        // wrapping failed.
        for (let pass = 1; pass <= 2; pass++) {
            for (let sliceDepth = pass == 1 ? startDepth : this.unplaced.openStart; sliceDepth >= 0; sliceDepth--) {
                let fragment, parent = null;
                if (sliceDepth) {
                    parent = contentAt(this.unplaced.content, sliceDepth - 1).firstChild;
                    fragment = parent.content;
                }
                else {
                    fragment = this.unplaced.content;
                }
                let first = fragment.firstChild;
                for (let frontierDepth = this.depth; frontierDepth >= 0; frontierDepth--) {
                    let { type, match } = this.frontier[frontierDepth], wrap, inject = null;
                    // In pass 1, if the next node matches, or there is no next
                    // node but the parents look compatible, we've found a
                    // place.
                    if (pass == 1 && (first ? match.matchType(first.type) || (inject = match.fillBefore(Fragment.from(first), false))
                        : parent && type.compatibleContent(parent.type)))
                        return { sliceDepth, frontierDepth, parent, inject };
                    // In pass 2, look for a set of wrapping nodes that make
                    // `first` fit here.
                    else if (pass == 2 && first && (wrap = match.findWrapping(first.type)))
                        return { sliceDepth, frontierDepth, parent, wrap };
                    // Don't continue looking further up if the parent node
                    // would fit here.
                    if (parent && match.matchType(parent.type))
                        break;
                }
            }
        }
    }
    openMore() {
        let { content, openStart, openEnd } = this.unplaced;
        let inner = contentAt(content, openStart);
        if (!inner.childCount || inner.firstChild.isLeaf)
            return false;
        this.unplaced = new Slice(content, openStart + 1, Math.max(openEnd, inner.size + openStart >= content.size - openEnd ? openStart + 1 : 0));
        return true;
    }
    dropNode() {
        let { content, openStart, openEnd } = this.unplaced;
        let inner = contentAt(content, openStart);
        if (inner.childCount <= 1 && openStart > 0) {
            let openAtEnd = content.size - openStart <= openStart + inner.size;
            this.unplaced = new Slice(dropFromFragment(content, openStart - 1, 1), openStart - 1, openAtEnd ? openStart - 1 : openEnd);
        }
        else {
            this.unplaced = new Slice(dropFromFragment(content, openStart, 1), openStart, openEnd);
        }
    }
    // Move content from the unplaced slice at `sliceDepth` to the
    // frontier node at `frontierDepth`. Close that frontier node when
    // applicable.
    placeNodes({ sliceDepth, frontierDepth, parent, inject, wrap }) {
        while (this.depth > frontierDepth)
            this.closeFrontierNode();
        if (wrap)
            for (let i = 0; i < wrap.length; i++)
                this.openFrontierNode(wrap[i]);
        let slice = this.unplaced, fragment = parent ? parent.content : slice.content;
        let openStart = slice.openStart - sliceDepth;
        let taken = 0, add = [];
        let { match, type } = this.frontier[frontierDepth];
        if (inject) {
            for (let i = 0; i < inject.childCount; i++)
                add.push(inject.child(i));
            match = match.matchFragment(inject);
        }
        // Computes the amount of (end) open nodes at the end of the
        // fragment. When 0, the parent is open, but no more. When
        // negative, nothing is open.
        let openEndCount = (fragment.size + sliceDepth) - (slice.content.size - slice.openEnd);
        // Scan over the fragment, fitting as many child nodes as
        // possible.
        while (taken < fragment.childCount) {
            let next = fragment.child(taken), matches = match.matchType(next.type);
            if (!matches)
                break;
            taken++;
            if (taken > 1 || openStart == 0 || next.content.size) { // Drop empty open nodes
                match = matches;
                add.push(closeNodeStart(next.mark(type.allowedMarks(next.marks)), taken == 1 ? openStart : 0, taken == fragment.childCount ? openEndCount : -1));
            }
        }
        let toEnd = taken == fragment.childCount;
        if (!toEnd)
            openEndCount = -1;
        this.placed = addToFragment(this.placed, frontierDepth, Fragment.from(add));
        this.frontier[frontierDepth].match = match;
        // If the parent types match, and the entire node was moved, and
        // it's not open, close this frontier node right away.
        if (toEnd && openEndCount < 0 && parent && parent.type == this.frontier[this.depth].type && this.frontier.length > 1)
            this.closeFrontierNode();
        // Add new frontier nodes for any open nodes at the end.
        for (let i = 0, cur = fragment; i < openEndCount; i++) {
            let node = cur.lastChild;
            this.frontier.push({ type: node.type, match: node.contentMatchAt(node.childCount) });
            cur = node.content;
        }
        // Update `this.unplaced`. Drop the entire node from which we
        // placed it we got to its end, otherwise just drop the placed
        // nodes.
        this.unplaced = !toEnd ? new Slice(dropFromFragment(slice.content, sliceDepth, taken), slice.openStart, slice.openEnd)
            : sliceDepth == 0 ? Slice.empty
                : new Slice(dropFromFragment(slice.content, sliceDepth - 1, 1), sliceDepth - 1, openEndCount < 0 ? slice.openEnd : sliceDepth - 1);
    }
    mustMoveInline() {
        if (!this.$to.parent.isTextblock)
            return -1;
        let top = this.frontier[this.depth], level;
        if (!top.type.isTextblock || !contentAfterFits(this.$to, this.$to.depth, top.type, top.match, false) ||
            (this.$to.depth == this.depth && (level = this.findCloseLevel(this.$to)) && level.depth == this.depth))
            return -1;
        let { depth } = this.$to, after = this.$to.after(depth);
        while (depth > 1 && after == this.$to.end(--depth))
            ++after;
        return after;
    }
    findCloseLevel($to) {
        scan: for (let i = Math.min(this.depth, $to.depth); i >= 0; i--) {
            let { match, type } = this.frontier[i];
            let dropInner = i < $to.depth && $to.end(i + 1) == $to.pos + ($to.depth - (i + 1));
            let fit = contentAfterFits($to, i, type, match, dropInner);
            if (!fit)
                continue;
            for (let d = i - 1; d >= 0; d--) {
                let { match, type } = this.frontier[d];
                let matches = contentAfterFits($to, d, type, match, true);
                if (!matches || matches.childCount)
                    continue scan;
            }
            return { depth: i, fit, move: dropInner ? $to.doc.resolve($to.after(i + 1)) : $to };
        }
    }
    close($to) {
        let close = this.findCloseLevel($to);
        if (!close)
            return null;
        while (this.depth > close.depth)
            this.closeFrontierNode();
        if (close.fit.childCount)
            this.placed = addToFragment(this.placed, close.depth, close.fit);
        $to = close.move;
        for (let d = close.depth + 1; d <= $to.depth; d++) {
            let node = $to.node(d), add = node.type.contentMatch.fillBefore(node.content, true, $to.index(d));
            this.openFrontierNode(node.type, node.attrs, add);
        }
        return $to;
    }
    openFrontierNode(type, attrs = null, content) {
        let top = this.frontier[this.depth];
        top.match = top.match.matchType(type);
        this.placed = addToFragment(this.placed, this.depth, Fragment.from(type.create(attrs, content)));
        this.frontier.push({ type, match: type.contentMatch });
    }
    closeFrontierNode() {
        let open = this.frontier.pop();
        let add = open.match.fillBefore(Fragment.empty, true);
        if (add.childCount)
            this.placed = addToFragment(this.placed, this.frontier.length, add);
    }
}
function dropFromFragment(fragment, depth, count) {
    if (depth == 0)
        return fragment.cutByIndex(count, fragment.childCount);
    return fragment.replaceChild(0, fragment.firstChild.copy(dropFromFragment(fragment.firstChild.content, depth - 1, count)));
}
function addToFragment(fragment, depth, content) {
    if (depth == 0)
        return fragment.append(content);
    return fragment.replaceChild(fragment.childCount - 1, fragment.lastChild.copy(addToFragment(fragment.lastChild.content, depth - 1, content)));
}
function contentAt(fragment, depth) {
    for (let i = 0; i < depth; i++)
        fragment = fragment.firstChild.content;
    return fragment;
}
function closeNodeStart(node, openStart, openEnd) {
    if (openStart <= 0)
        return node;
    let frag = node.content;
    if (openStart > 1)
        frag = frag.replaceChild(0, closeNodeStart(frag.firstChild, openStart - 1, frag.childCount == 1 ? openEnd - 1 : 0));
    if (openStart > 0) {
        frag = node.type.contentMatch.fillBefore(frag).append(frag);
        if (openEnd <= 0)
            frag = frag.append(node.type.contentMatch.matchFragment(frag).fillBefore(Fragment.empty, true));
    }
    return node.copy(frag);
}
function contentAfterFits($to, depth, type, match, open) {
    let node = $to.node(depth), index = open ? $to.indexAfter(depth) : $to.index(depth);
    if (index == node.childCount && !type.compatibleContent(node.type))
        return null;
    let fit = match.fillBefore(node.content, true, index);
    return fit && !invalidMarks(type, node.content, index) ? fit : null;
}
function invalidMarks(type, fragment, start) {
    for (let i = start; i < fragment.childCount; i++)
        if (!type.allowsMarks(fragment.child(i).marks))
            return true;
    return false;
}
function definesContent(type) {
    return type.spec.defining || type.spec.definingForContent;
}
function replaceRange(tr, from, to, slice) {
    if (!slice.size)
        return tr.deleteRange(from, to);
    let $from = tr.doc.resolve(from), $to = tr.doc.resolve(to);
    if (fitsTrivially($from, $to, slice))
        return tr.step(new ReplaceStep(from, to, slice));
    let targetDepths = coveredDepths($from, tr.doc.resolve(to));
    // Can't replace the whole document, so remove 0 if it's present
    if (targetDepths[targetDepths.length - 1] == 0)
        targetDepths.pop();
    // Negative numbers represent not expansion over the whole node at
    // that depth, but replacing from $from.before(-D) to $to.pos.
    let preferredTarget = -($from.depth + 1);
    targetDepths.unshift(preferredTarget);
    // This loop picks a preferred target depth, if one of the covering
    // depths is not outside of a defining node, and adds negative
    // depths for any depth that has $from at its start and does not
    // cross a defining node.
    for (let d = $from.depth, pos = $from.pos - 1; d > 0; d--, pos--) {
        let spec = $from.node(d).type.spec;
        if (spec.defining || spec.definingAsContext || spec.isolating)
            break;
        if (targetDepths.indexOf(d) > -1)
            preferredTarget = d;
        else if ($from.before(d) == pos)
            targetDepths.splice(1, 0, -d);
    }
    // Try to fit each possible depth of the slice into each possible
    // target depth, starting with the preferred depths.
    let preferredTargetIndex = targetDepths.indexOf(preferredTarget);
    let leftNodes = [], preferredDepth = slice.openStart;
    for (let content = slice.content, i = 0;; i++) {
        let node = content.firstChild;
        leftNodes.push(node);
        if (i == slice.openStart)
            break;
        content = node.content;
    }
    // Back up preferredDepth to cover defining textblocks directly
    // above it, possibly skipping a non-defining textblock.
    for (let d = preferredDepth - 1; d >= 0; d--) {
        let type = leftNodes[d].type, def = definesContent(type);
        if (def && $from.node(preferredTargetIndex).type != type)
            preferredDepth = d;
        else if (def || !type.isTextblock)
            break;
    }
    for (let j = slice.openStart; j >= 0; j--) {
        let openDepth = (j + preferredDepth + 1) % (slice.openStart + 1);
        let insert = leftNodes[openDepth];
        if (!insert)
            continue;
        for (let i = 0; i < targetDepths.length; i++) {
            // Loop over possible expansion levels, starting with the
            // preferred one
            let targetDepth = targetDepths[(i + preferredTargetIndex) % targetDepths.length], expand = true;
            if (targetDepth < 0) {
                expand = false;
                targetDepth = -targetDepth;
            }
            let parent = $from.node(targetDepth - 1), index = $from.index(targetDepth - 1);
            if (parent.canReplaceWith(index, index, insert.type, insert.marks))
                return tr.replace($from.before(targetDepth), expand ? $to.after(targetDepth) : to, new Slice(closeFragment(slice.content, 0, slice.openStart, openDepth), openDepth, slice.openEnd));
        }
    }
    let startSteps = tr.steps.length;
    for (let i = targetDepths.length - 1; i >= 0; i--) {
        tr.replace(from, to, slice);
        if (tr.steps.length > startSteps)
            break;
        let depth = targetDepths[i];
        if (depth < 0)
            continue;
        from = $from.before(depth);
        to = $to.after(depth);
    }
}
function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
    if (depth < oldOpen) {
        let first = fragment.firstChild;
        fragment = fragment.replaceChild(0, first.copy(closeFragment(first.content, depth + 1, oldOpen, newOpen, first)));
    }
    if (depth > newOpen) {
        let match = parent.contentMatchAt(0);
        let start = match.fillBefore(fragment).append(fragment);
        fragment = start.append(match.matchFragment(start).fillBefore(Fragment.empty, true));
    }
    return fragment;
}
function replaceRangeWith(tr, from, to, node) {
    if (!node.isInline && from == to && tr.doc.resolve(from).parent.content.size) {
        let point = insertPoint(tr.doc, from, node.type);
        if (point != null)
            from = to = point;
    }
    tr.replaceRange(from, to, new Slice(Fragment.from(node), 0, 0));
}
function deleteRange(tr, from, to) {
    let $from = tr.doc.resolve(from), $to = tr.doc.resolve(to);
    let covered = coveredDepths($from, $to);
    for (let i = 0; i < covered.length; i++) {
        let depth = covered[i], last = i == covered.length - 1;
        if ((last && depth == 0) || $from.node(depth).type.contentMatch.validEnd)
            return tr.delete($from.start(depth), $to.end(depth));
        if (depth > 0 && (last || $from.node(depth - 1).canReplace($from.index(depth - 1), $to.indexAfter(depth - 1))))
            return tr.delete($from.before(depth), $to.after(depth));
    }
    for (let d = 1; d <= $from.depth && d <= $to.depth; d++) {
        if (from - $from.start(d) == $from.depth - d && to > $from.end(d) && $to.end(d) - to != $to.depth - d)
            return tr.delete($from.before(d), to);
    }
    tr.delete(from, to);
}
// Returns an array of all depths for which $from - $to spans the
// whole content of the nodes at that depth.
function coveredDepths($from, $to) {
    let result = [], minDepth = Math.min($from.depth, $to.depth);
    for (let d = minDepth; d >= 0; d--) {
        let start = $from.start(d);
        if (start < $from.pos - ($from.depth - d) ||
            $to.end(d) > $to.pos + ($to.depth - d) ||
            $from.node(d).type.spec.isolating ||
            $to.node(d).type.spec.isolating)
            break;
        if (start == $to.start(d) ||
            (d == $from.depth && d == $to.depth && $from.parent.inlineContent && $to.parent.inlineContent &&
                d && $to.start(d - 1) == start - 1))
            result.push(d);
    }
    return result;
}

/**
Update an attribute in a specific node.
*/
class AttrStep extends Step {
    /**
    Construct an attribute step.
    */
    constructor(
    /**
    The position of the target node.
    */
    pos, 
    /**
    The attribute to set.
    */
    attr, 
    // The attribute's new value.
    value) {
        super();
        this.pos = pos;
        this.attr = attr;
        this.value = value;
    }
    apply(doc) {
        let node = doc.nodeAt(this.pos);
        if (!node)
            return StepResult.fail("No node at attribute step's position");
        let attrs = Object.create(null);
        for (let name in node.attrs)
            attrs[name] = node.attrs[name];
        attrs[this.attr] = this.value;
        let updated = node.type.create(attrs, null, node.marks);
        return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
    }
    getMap() {
        return StepMap.empty;
    }
    invert(doc) {
        return new AttrStep(this.pos, this.attr, doc.nodeAt(this.pos).attrs[this.attr]);
    }
    map(mapping) {
        let pos = mapping.mapResult(this.pos, 1);
        return pos.deletedAfter ? null : new AttrStep(pos.pos, this.attr, this.value);
    }
    toJSON() {
        return { stepType: "attr", pos: this.pos, attr: this.attr, value: this.value };
    }
    static fromJSON(schema, json) {
        if (typeof json.pos != "number" || typeof json.attr != "string")
            throw new RangeError("Invalid input for AttrStep.fromJSON");
        return new AttrStep(json.pos, json.attr, json.value);
    }
}
Step.jsonID("attr", AttrStep);

/**
@internal
*/
let TransformError = class extends Error {
};
TransformError = function TransformError(message) {
    let err = Error.call(this, message);
    err.__proto__ = TransformError.prototype;
    return err;
};
TransformError.prototype = Object.create(Error.prototype);
TransformError.prototype.constructor = TransformError;
TransformError.prototype.name = "TransformError";
/**
Abstraction to build up and track an array of
[steps](https://prosemirror.net/docs/ref/#transform.Step) representing a document transformation.

Most transforming methods return the `Transform` object itself, so
that they can be chained.
*/
class Transform {
    /**
    Create a transform that starts with the given document.
    */
    constructor(
    /**
    The current document (the result of applying the steps in the
    transform).
    */
    doc) {
        this.doc = doc;
        /**
        The steps in this transform.
        */
        this.steps = [];
        /**
        The documents before each of the steps.
        */
        this.docs = [];
        /**
        A mapping with the maps for each of the steps in this transform.
        */
        this.mapping = new Mapping;
    }
    /**
    The starting document.
    */
    get before() { return this.docs.length ? this.docs[0] : this.doc; }
    /**
    Apply a new step in this transform, saving the result. Throws an
    error when the step fails.
    */
    step(step) {
        let result = this.maybeStep(step);
        if (result.failed)
            throw new TransformError(result.failed);
        return this;
    }
    /**
    Try to apply a step in this transformation, ignoring it if it
    fails. Returns the step result.
    */
    maybeStep(step) {
        let result = step.apply(this.doc);
        if (!result.failed)
            this.addStep(step, result.doc);
        return result;
    }
    /**
    True when the document has been changed (when there are any
    steps).
    */
    get docChanged() {
        return this.steps.length > 0;
    }
    /**
    @internal
    */
    addStep(step, doc) {
        this.docs.push(this.doc);
        this.steps.push(step);
        this.mapping.appendMap(step.getMap());
        this.doc = doc;
    }
    /**
    Replace the part of the document between `from` and `to` with the
    given `slice`.
    */
    replace(from, to = from, slice = Slice.empty) {
        let step = replaceStep(this.doc, from, to, slice);
        if (step)
            this.step(step);
        return this;
    }
    /**
    Replace the given range with the given content, which may be a
    fragment, node, or array of nodes.
    */
    replaceWith(from, to, content) {
        return this.replace(from, to, new Slice(Fragment.from(content), 0, 0));
    }
    /**
    Delete the content between the given positions.
    */
    delete(from, to) {
        return this.replace(from, to, Slice.empty);
    }
    /**
    Insert the given content at the given position.
    */
    insert(pos, content) {
        return this.replaceWith(pos, pos, content);
    }
    /**
    Replace a range of the document with a given slice, using
    `from`, `to`, and the slice's
    [`openStart`](https://prosemirror.net/docs/ref/#model.Slice.openStart) property as hints, rather
    than fixed start and end points. This method may grow the
    replaced area or close open nodes in the slice in order to get a
    fit that is more in line with WYSIWYG expectations, by dropping
    fully covered parent nodes of the replaced region when they are
    marked [non-defining as
    context](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext), or including an
    open parent node from the slice that _is_ marked as [defining
    its content](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
    
    This is the method, for example, to handle paste. The similar
    [`replace`](https://prosemirror.net/docs/ref/#transform.Transform.replace) method is a more
    primitive tool which will _not_ move the start and end of its given
    range, and is useful in situations where you need more precise
    control over what happens.
    */
    replaceRange(from, to, slice) {
        replaceRange(this, from, to, slice);
        return this;
    }
    /**
    Replace the given range with a node, but use `from` and `to` as
    hints, rather than precise positions. When from and to are the same
    and are at the start or end of a parent node in which the given
    node doesn't fit, this method may _move_ them out towards a parent
    that does allow the given node to be placed. When the given range
    completely covers a parent node, this method may completely replace
    that parent node.
    */
    replaceRangeWith(from, to, node) {
        replaceRangeWith(this, from, to, node);
        return this;
    }
    /**
    Delete the given range, expanding it to cover fully covered
    parent nodes until a valid replace is found.
    */
    deleteRange(from, to) {
        deleteRange(this, from, to);
        return this;
    }
    /**
    Split the content in the given range off from its parent, if there
    is sibling content before or after it, and move it up the tree to
    the depth specified by `target`. You'll probably want to use
    [`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
    sure the lift is valid.
    */
    lift(range, target) {
        lift(this, range, target);
        return this;
    }
    /**
    Join the blocks around the given position. If depth is 2, their
    last and first siblings are also joined, and so on.
    */
    join(pos, depth = 1) {
        join(this, pos, depth);
        return this;
    }
    /**
    Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
    The wrappers are assumed to be valid in this position, and should
    probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
    */
    wrap(range, wrappers) {
        wrap(this, range, wrappers);
        return this;
    }
    /**
    Set the type of all textblocks (partly) between `from` and `to` to
    the given node type with the given attributes.
    */
    setBlockType(from, to = from, type, attrs = null) {
        setBlockType$1(this, from, to, type, attrs);
        return this;
    }
    /**
    Change the type, attributes, and/or marks of the node at `pos`.
    When `type` isn't given, the existing node type is preserved,
    */
    setNodeMarkup(pos, type, attrs = null, marks) {
        setNodeMarkup(this, pos, type, attrs, marks);
        return this;
    }
    /**
    Set a single attribute on a given node to a new value.
    */
    setNodeAttribute(pos, attr, value) {
        this.step(new AttrStep(pos, attr, value));
        return this;
    }
    /**
    Add a mark to the node at position `pos`.
    */
    addNodeMark(pos, mark) {
        this.step(new AddNodeMarkStep(pos, mark));
        return this;
    }
    /**
    Remove a mark (or a mark of the given type) from the node at
    position `pos`.
    */
    removeNodeMark(pos, mark) {
        if (!(mark instanceof Mark)) {
            let node = this.doc.nodeAt(pos);
            if (!node)
                throw new RangeError("No node at position " + pos);
            mark = mark.isInSet(node.marks);
            if (!mark)
                return this;
        }
        this.step(new RemoveNodeMarkStep(pos, mark));
        return this;
    }
    /**
    Split the node at the given position, and optionally, if `depth` is
    greater than one, any number of nodes above that. By default, the
    parts split off will inherit the node type of the original node.
    This can be changed by passing an array of types and attributes to
    use after the split.
    */
    split(pos, depth = 1, typesAfter) {
        split(this, pos, depth, typesAfter);
        return this;
    }
    /**
    Add the given mark to the inline content between `from` and `to`.
    */
    addMark(from, to, mark) {
        addMark(this, from, to, mark);
        return this;
    }
    /**
    Remove marks from inline nodes between `from` and `to`. When
    `mark` is a single mark, remove precisely that mark. When it is
    a mark type, remove all marks of that type. When it is null,
    remove all marks of any type.
    */
    removeMark(from, to, mark) {
        removeMark(this, from, to, mark);
        return this;
    }
    /**
    Removes all marks and nodes from the content of the node at
    `pos` that don't match the given new parent node type. Accepts
    an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
    third argument.
    */
    clearIncompatible(pos, parentType, match) {
        clearIncompatible(this, pos, parentType, match);
        return this;
    }
}

const classesById = Object.create(null);
/**
Superclass for editor selections. Every selection type should
extend this. Should not be instantiated directly.
*/
class Selection {
    /**
    Initialize a selection with the head and anchor and ranges. If no
    ranges are given, constructs a single range across `$anchor` and
    `$head`.
    */
    constructor(
    /**
    The resolved anchor of the selection (the side that stays in
    place when the selection is modified).
    */
    $anchor, 
    /**
    The resolved head of the selection (the side that moves when
    the selection is modified).
    */
    $head, ranges) {
        this.$anchor = $anchor;
        this.$head = $head;
        this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
    }
    /**
    The selection's anchor, as an unresolved position.
    */
    get anchor() { return this.$anchor.pos; }
    /**
    The selection's head.
    */
    get head() { return this.$head.pos; }
    /**
    The lower bound of the selection's main range.
    */
    get from() { return this.$from.pos; }
    /**
    The upper bound of the selection's main range.
    */
    get to() { return this.$to.pos; }
    /**
    The resolved lower  bound of the selection's main range.
    */
    get $from() {
        return this.ranges[0].$from;
    }
    /**
    The resolved upper bound of the selection's main range.
    */
    get $to() {
        return this.ranges[0].$to;
    }
    /**
    Indicates whether the selection contains any content.
    */
    get empty() {
        let ranges = this.ranges;
        for (let i = 0; i < ranges.length; i++)
            if (ranges[i].$from.pos != ranges[i].$to.pos)
                return false;
        return true;
    }
    /**
    Get the content of this selection as a slice.
    */
    content() {
        return this.$from.doc.slice(this.from, this.to, true);
    }
    /**
    Replace the selection with a slice or, if no slice is given,
    delete the selection. Will append to the given transaction.
    */
    replace(tr, content = Slice.empty) {
        // Put the new selection at the position after the inserted
        // content. When that ended in an inline node, search backwards,
        // to get the position after that node. If not, search forward.
        let lastNode = content.content.lastChild, lastParent = null;
        for (let i = 0; i < content.openEnd; i++) {
            lastParent = lastNode;
            lastNode = lastNode.lastChild;
        }
        let mapFrom = tr.steps.length, ranges = this.ranges;
        for (let i = 0; i < ranges.length; i++) {
            let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
            tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i ? Slice.empty : content);
            if (i == 0)
                selectionToInsertionEnd(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1);
        }
    }
    /**
    Replace the selection with the given node, appending the changes
    to the given transaction.
    */
    replaceWith(tr, node) {
        let mapFrom = tr.steps.length, ranges = this.ranges;
        for (let i = 0; i < ranges.length; i++) {
            let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
            let from = mapping.map($from.pos), to = mapping.map($to.pos);
            if (i) {
                tr.deleteRange(from, to);
            }
            else {
                tr.replaceRangeWith(from, to, node);
                selectionToInsertionEnd(tr, mapFrom, node.isInline ? -1 : 1);
            }
        }
    }
    /**
    Find a valid cursor or leaf node selection starting at the given
    position and searching back if `dir` is negative, and forward if
    positive. When `textOnly` is true, only consider cursor
    selections. Will return null when no valid selection position is
    found.
    */
    static findFrom($pos, dir, textOnly = false) {
        let inner = $pos.parent.inlineContent ? new TextSelection($pos)
            : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
        if (inner)
            return inner;
        for (let depth = $pos.depth - 1; depth >= 0; depth--) {
            let found = dir < 0
                ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly)
                : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
            if (found)
                return found;
        }
        return null;
    }
    /**
    Find a valid cursor or leaf node selection near the given
    position. Searches forward first by default, but if `bias` is
    negative, it will search backwards first.
    */
    static near($pos, bias = 1) {
        return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0));
    }
    /**
    Find the cursor or leaf node selection closest to the start of
    the given document. Will return an
    [`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
    exists.
    */
    static atStart(doc) {
        return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc);
    }
    /**
    Find the cursor or leaf node selection closest to the end of the
    given document.
    */
    static atEnd(doc) {
        return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) || new AllSelection(doc);
    }
    /**
    Deserialize the JSON representation of a selection. Must be
    implemented for custom classes (as a static class method).
    */
    static fromJSON(doc, json) {
        if (!json || !json.type)
            throw new RangeError("Invalid input for Selection.fromJSON");
        let cls = classesById[json.type];
        if (!cls)
            throw new RangeError(`No selection type ${json.type} defined`);
        return cls.fromJSON(doc, json);
    }
    /**
    To be able to deserialize selections from JSON, custom selection
    classes must register themselves with an ID string, so that they
    can be disambiguated. Try to pick something that's unlikely to
    clash with classes from other modules.
    */
    static jsonID(id, selectionClass) {
        if (id in classesById)
            throw new RangeError("Duplicate use of selection JSON ID " + id);
        classesById[id] = selectionClass;
        selectionClass.prototype.jsonID = id;
        return selectionClass;
    }
    /**
    Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
    which is a value that can be mapped without having access to a
    current document, and later resolved to a real selection for a
    given document again. (This is used mostly by the history to
    track and restore old selections.) The default implementation of
    this method just converts the selection to a text selection and
    returns the bookmark for that.
    */
    getBookmark() {
        return TextSelection.between(this.$anchor, this.$head).getBookmark();
    }
}
Selection.prototype.visible = true;
/**
Represents a selected range in a document.
*/
class SelectionRange {
    /**
    Create a range.
    */
    constructor(
    /**
    The lower bound of the range.
    */
    $from, 
    /**
    The upper bound of the range.
    */
    $to) {
        this.$from = $from;
        this.$to = $to;
    }
}
let warnedAboutTextSelection = false;
function checkTextSelection($pos) {
    if (!warnedAboutTextSelection && !$pos.parent.inlineContent) {
        warnedAboutTextSelection = true;
        console["warn"]("TextSelection endpoint not pointing into a node with inline content (" + $pos.parent.type.name + ")");
    }
}
/**
A text selection represents a classical editor selection, with a
head (the moving side) and anchor (immobile side), both of which
point into textblock nodes. It can be empty (a regular cursor
position).
*/
class TextSelection extends Selection {
    /**
    Construct a text selection between the given points.
    */
    constructor($anchor, $head = $anchor) {
        checkTextSelection($anchor);
        checkTextSelection($head);
        super($anchor, $head);
    }
    /**
    Returns a resolved position if this is a cursor selection (an
    empty text selection), and null otherwise.
    */
    get $cursor() { return this.$anchor.pos == this.$head.pos ? this.$head : null; }
    map(doc, mapping) {
        let $head = doc.resolve(mapping.map(this.head));
        if (!$head.parent.inlineContent)
            return Selection.near($head);
        let $anchor = doc.resolve(mapping.map(this.anchor));
        return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head);
    }
    replace(tr, content = Slice.empty) {
        super.replace(tr, content);
        if (content == Slice.empty) {
            let marks = this.$from.marksAcross(this.$to);
            if (marks)
                tr.ensureMarks(marks);
        }
    }
    eq(other) {
        return other instanceof TextSelection && other.anchor == this.anchor && other.head == this.head;
    }
    getBookmark() {
        return new TextBookmark(this.anchor, this.head);
    }
    toJSON() {
        return { type: "text", anchor: this.anchor, head: this.head };
    }
    /**
    @internal
    */
    static fromJSON(doc, json) {
        if (typeof json.anchor != "number" || typeof json.head != "number")
            throw new RangeError("Invalid input for TextSelection.fromJSON");
        return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head));
    }
    /**
    Create a text selection from non-resolved positions.
    */
    static create(doc, anchor, head = anchor) {
        let $anchor = doc.resolve(anchor);
        return new this($anchor, head == anchor ? $anchor : doc.resolve(head));
    }
    /**
    Return a text selection that spans the given positions or, if
    they aren't text positions, find a text selection near them.
    `bias` determines whether the method searches forward (default)
    or backwards (negative number) first. Will fall back to calling
    [`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
    doesn't contain a valid text position.
    */
    static between($anchor, $head, bias) {
        let dPos = $anchor.pos - $head.pos;
        if (!bias || dPos)
            bias = dPos >= 0 ? 1 : -1;
        if (!$head.parent.inlineContent) {
            let found = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true);
            if (found)
                $head = found.$head;
            else
                return Selection.near($head, bias);
        }
        if (!$anchor.parent.inlineContent) {
            if (dPos == 0) {
                $anchor = $head;
            }
            else {
                $anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor;
                if (($anchor.pos < $head.pos) != (dPos < 0))
                    $anchor = $head;
            }
        }
        return new TextSelection($anchor, $head);
    }
}
Selection.jsonID("text", TextSelection);
class TextBookmark {
    constructor(anchor, head) {
        this.anchor = anchor;
        this.head = head;
    }
    map(mapping) {
        return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head));
    }
    resolve(doc) {
        return TextSelection.between(doc.resolve(this.anchor), doc.resolve(this.head));
    }
}
/**
A node selection is a selection that points at a single node. All
nodes marked [selectable](https://prosemirror.net/docs/ref/#model.NodeSpec.selectable) can be the
target of a node selection. In such a selection, `from` and `to`
point directly before and after the selected node, `anchor` equals
`from`, and `head` equals `to`..
*/
class NodeSelection extends Selection {
    /**
    Create a node selection. Does not verify the validity of its
    argument.
    */
    constructor($pos) {
        let node = $pos.nodeAfter;
        let $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
        super($pos, $end);
        this.node = node;
    }
    map(doc, mapping) {
        let { deleted, pos } = mapping.mapResult(this.anchor);
        let $pos = doc.resolve(pos);
        if (deleted)
            return Selection.near($pos);
        return new NodeSelection($pos);
    }
    content() {
        return new Slice(Fragment.from(this.node), 0, 0);
    }
    eq(other) {
        return other instanceof NodeSelection && other.anchor == this.anchor;
    }
    toJSON() {
        return { type: "node", anchor: this.anchor };
    }
    getBookmark() { return new NodeBookmark(this.anchor); }
    /**
    @internal
    */
    static fromJSON(doc, json) {
        if (typeof json.anchor != "number")
            throw new RangeError("Invalid input for NodeSelection.fromJSON");
        return new NodeSelection(doc.resolve(json.anchor));
    }
    /**
    Create a node selection from non-resolved positions.
    */
    static create(doc, from) {
        return new NodeSelection(doc.resolve(from));
    }
    /**
    Determines whether the given node may be selected as a node
    selection.
    */
    static isSelectable(node) {
        return !node.isText && node.type.spec.selectable !== false;
    }
}
NodeSelection.prototype.visible = false;
Selection.jsonID("node", NodeSelection);
class NodeBookmark {
    constructor(anchor) {
        this.anchor = anchor;
    }
    map(mapping) {
        let { deleted, pos } = mapping.mapResult(this.anchor);
        return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos);
    }
    resolve(doc) {
        let $pos = doc.resolve(this.anchor), node = $pos.nodeAfter;
        if (node && NodeSelection.isSelectable(node))
            return new NodeSelection($pos);
        return Selection.near($pos);
    }
}
/**
A selection type that represents selecting the whole document
(which can not necessarily be expressed with a text selection, when
there are for example leaf block nodes at the start or end of the
document).
*/
class AllSelection extends Selection {
    /**
    Create an all-selection over the given document.
    */
    constructor(doc) {
        super(doc.resolve(0), doc.resolve(doc.content.size));
    }
    replace(tr, content = Slice.empty) {
        if (content == Slice.empty) {
            tr.delete(0, tr.doc.content.size);
            let sel = Selection.atStart(tr.doc);
            if (!sel.eq(tr.selection))
                tr.setSelection(sel);
        }
        else {
            super.replace(tr, content);
        }
    }
    toJSON() { return { type: "all" }; }
    /**
    @internal
    */
    static fromJSON(doc) { return new AllSelection(doc); }
    map(doc) { return new AllSelection(doc); }
    eq(other) { return other instanceof AllSelection; }
    getBookmark() { return AllBookmark; }
}
Selection.jsonID("all", AllSelection);
const AllBookmark = {
    map() { return this; },
    resolve(doc) { return new AllSelection(doc); }
};
// FIXME we'll need some awareness of text direction when scanning for selections
// Try to find a selection inside the given node. `pos` points at the
// position where the search starts. When `text` is true, only return
// text selections.
function findSelectionIn(doc, node, pos, index, dir, text = false) {
    if (node.inlineContent)
        return TextSelection.create(doc, pos);
    for (let i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
        let child = node.child(i);
        if (!child.isAtom) {
            let inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text);
            if (inner)
                return inner;
        }
        else if (!text && NodeSelection.isSelectable(child)) {
            return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0));
        }
        pos += child.nodeSize * dir;
    }
    return null;
}
function selectionToInsertionEnd(tr, startLen, bias) {
    let last = tr.steps.length - 1;
    if (last < startLen)
        return;
    let step = tr.steps[last];
    if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep))
        return;
    let map = tr.mapping.maps[last], end;
    map.forEach((_from, _to, _newFrom, newTo) => { if (end == null)
        end = newTo; });
    tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
}

const UPDATED_SEL = 1, UPDATED_MARKS = 2, UPDATED_SCROLL = 4;
/**
An editor state transaction, which can be applied to a state to
create an updated state. Use
[`EditorState.tr`](https://prosemirror.net/docs/ref/#state.EditorState.tr) to create an instance.

Transactions track changes to the document (they are a subclass of
[`Transform`](https://prosemirror.net/docs/ref/#transform.Transform)), but also other state changes,
like selection updates and adjustments of the set of [stored
marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks). In addition, you can store
metadata properties in a transaction, which are extra pieces of
information that client code or plugins can use to describe what a
transaction represents, so that they can update their [own
state](https://prosemirror.net/docs/ref/#state.StateField) accordingly.

The [editor view](https://prosemirror.net/docs/ref/#view.EditorView) uses a few metadata
properties: it will attach a property `"pointer"` with the value
`true` to selection transactions directly caused by mouse or touch
input, a `"composition"` property holding an ID identifying the
composition that caused it to transactions caused by composed DOM
input, and a `"uiEvent"` property of that may be `"paste"`,
`"cut"`, or `"drop"`.
*/
class Transaction extends Transform {
    /**
    @internal
    */
    constructor(state) {
        super(state.doc);
        // The step count for which the current selection is valid.
        this.curSelectionFor = 0;
        // Bitfield to track which aspects of the state were updated by
        // this transaction.
        this.updated = 0;
        // Object used to store metadata properties for the transaction.
        this.meta = Object.create(null);
        this.time = Date.now();
        this.curSelection = state.selection;
        this.storedMarks = state.storedMarks;
    }
    /**
    The transaction's current selection. This defaults to the editor
    selection [mapped](https://prosemirror.net/docs/ref/#state.Selection.map) through the steps in the
    transaction, but can be overwritten with
    [`setSelection`](https://prosemirror.net/docs/ref/#state.Transaction.setSelection).
    */
    get selection() {
        if (this.curSelectionFor < this.steps.length) {
            this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor));
            this.curSelectionFor = this.steps.length;
        }
        return this.curSelection;
    }
    /**
    Update the transaction's current selection. Will determine the
    selection that the editor gets when the transaction is applied.
    */
    setSelection(selection) {
        if (selection.$from.doc != this.doc)
            throw new RangeError("Selection passed to setSelection must point at the current document");
        this.curSelection = selection;
        this.curSelectionFor = this.steps.length;
        this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
        this.storedMarks = null;
        return this;
    }
    /**
    Whether the selection was explicitly updated by this transaction.
    */
    get selectionSet() {
        return (this.updated & UPDATED_SEL) > 0;
    }
    /**
    Set the current stored marks.
    */
    setStoredMarks(marks) {
        this.storedMarks = marks;
        this.updated |= UPDATED_MARKS;
        return this;
    }
    /**
    Make sure the current stored marks or, if that is null, the marks
    at the selection, match the given set of marks. Does nothing if
    this is already the case.
    */
    ensureMarks(marks) {
        if (!Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks))
            this.setStoredMarks(marks);
        return this;
    }
    /**
    Add a mark to the set of stored marks.
    */
    addStoredMark(mark) {
        return this.ensureMarks(mark.addToSet(this.storedMarks || this.selection.$head.marks()));
    }
    /**
    Remove a mark or mark type from the set of stored marks.
    */
    removeStoredMark(mark) {
        return this.ensureMarks(mark.removeFromSet(this.storedMarks || this.selection.$head.marks()));
    }
    /**
    Whether the stored marks were explicitly set for this transaction.
    */
    get storedMarksSet() {
        return (this.updated & UPDATED_MARKS) > 0;
    }
    /**
    @internal
    */
    addStep(step, doc) {
        super.addStep(step, doc);
        this.updated = this.updated & ~UPDATED_MARKS;
        this.storedMarks = null;
    }
    /**
    Update the timestamp for the transaction.
    */
    setTime(time) {
        this.time = time;
        return this;
    }
    /**
    Replace the current selection with the given slice.
    */
    replaceSelection(slice) {
        this.selection.replace(this, slice);
        return this;
    }
    /**
    Replace the selection with the given node. When `inheritMarks` is
    true and the content is inline, it inherits the marks from the
    place where it is inserted.
    */
    replaceSelectionWith(node, inheritMarks = true) {
        let selection = this.selection;
        if (inheritMarks)
            node = node.mark(this.storedMarks || (selection.empty ? selection.$from.marks() : (selection.$from.marksAcross(selection.$to) || Mark.none)));
        selection.replaceWith(this, node);
        return this;
    }
    /**
    Delete the selection.
    */
    deleteSelection() {
        this.selection.replace(this);
        return this;
    }
    /**
    Replace the given range, or the selection if no range is given,
    with a text node containing the given string.
    */
    insertText(text, from, to) {
        let schema = this.doc.type.schema;
        if (from == null) {
            if (!text)
                return this.deleteSelection();
            return this.replaceSelectionWith(schema.text(text), true);
        }
        else {
            if (to == null)
                to = from;
            to = to == null ? from : to;
            if (!text)
                return this.deleteRange(from, to);
            let marks = this.storedMarks;
            if (!marks) {
                let $from = this.doc.resolve(from);
                marks = to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
            }
            this.replaceRangeWith(from, to, schema.text(text, marks));
            if (!this.selection.empty)
                this.setSelection(Selection.near(this.selection.$to));
            return this;
        }
    }
    /**
    Store a metadata property in this transaction, keyed either by
    name or by plugin.
    */
    setMeta(key, value) {
        this.meta[typeof key == "string" ? key : key.key] = value;
        return this;
    }
    /**
    Retrieve a metadata property for a given name or plugin.
    */
    getMeta(key) {
        return this.meta[typeof key == "string" ? key : key.key];
    }
    /**
    Returns true if this transaction doesn't contain any metadata,
    and can thus safely be extended.
    */
    get isGeneric() {
        for (let _ in this.meta)
            return false;
        return true;
    }
    /**
    Indicate that the editor should scroll the selection into view
    when updated to the state produced by this transaction.
    */
    scrollIntoView() {
        this.updated |= UPDATED_SCROLL;
        return this;
    }
    /**
    True when this transaction has had `scrollIntoView` called on it.
    */
    get scrolledIntoView() {
        return (this.updated & UPDATED_SCROLL) > 0;
    }
}

function bind(f, self) {
    return !self || !f ? f : f.bind(self);
}
class FieldDesc {
    constructor(name, desc, self) {
        this.name = name;
        this.init = bind(desc.init, self);
        this.apply = bind(desc.apply, self);
    }
}
const baseFields = [
    new FieldDesc("doc", {
        init(config) { return config.doc || config.schema.topNodeType.createAndFill(); },
        apply(tr) { return tr.doc; }
    }),
    new FieldDesc("selection", {
        init(config, instance) { return config.selection || Selection.atStart(instance.doc); },
        apply(tr) { return tr.selection; }
    }),
    new FieldDesc("storedMarks", {
        init(config) { return config.storedMarks || null; },
        apply(tr, _marks, _old, state) { return state.selection.$cursor ? tr.storedMarks : null; }
    }),
    new FieldDesc("scrollToSelection", {
        init() { return 0; },
        apply(tr, prev) { return tr.scrolledIntoView ? prev + 1 : prev; }
    })
];
// Object wrapping the part of a state object that stays the same
// across transactions. Stored in the state's `config` property.
class Configuration {
    constructor(schema, plugins) {
        this.schema = schema;
        this.plugins = [];
        this.pluginsByKey = Object.create(null);
        this.fields = baseFields.slice();
        if (plugins)
            plugins.forEach(plugin => {
                if (this.pluginsByKey[plugin.key])
                    throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")");
                this.plugins.push(plugin);
                this.pluginsByKey[plugin.key] = plugin;
                if (plugin.spec.state)
                    this.fields.push(new FieldDesc(plugin.key, plugin.spec.state, plugin));
            });
    }
}
/**
The state of a ProseMirror editor is represented by an object of
this type. A state is a persistent data structure—it isn't
updated, but rather a new state value is computed from an old one
using the [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) method.

A state holds a number of built-in fields, and plugins can
[define](https://prosemirror.net/docs/ref/#state.PluginSpec.state) additional fields.
*/
class EditorState {
    /**
    @internal
    */
    constructor(
    /**
    @internal
    */
    config) {
        this.config = config;
    }
    /**
    The schema of the state's document.
    */
    get schema() {
        return this.config.schema;
    }
    /**
    The plugins that are active in this state.
    */
    get plugins() {
        return this.config.plugins;
    }
    /**
    Apply the given transaction to produce a new state.
    */
    apply(tr) {
        return this.applyTransaction(tr).state;
    }
    /**
    @internal
    */
    filterTransaction(tr, ignore = -1) {
        for (let i = 0; i < this.config.plugins.length; i++)
            if (i != ignore) {
                let plugin = this.config.plugins[i];
                if (plugin.spec.filterTransaction && !plugin.spec.filterTransaction.call(plugin, tr, this))
                    return false;
            }
        return true;
    }
    /**
    Verbose variant of [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) that
    returns the precise transactions that were applied (which might
    be influenced by the [transaction
    hooks](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) of
    plugins) along with the new state.
    */
    applyTransaction(rootTr) {
        if (!this.filterTransaction(rootTr))
            return { state: this, transactions: [] };
        let trs = [rootTr], newState = this.applyInner(rootTr), seen = null;
        // This loop repeatedly gives plugins a chance to respond to
        // transactions as new transactions are added, making sure to only
        // pass the transactions the plugin did not see before.
        for (;;) {
            let haveNew = false;
            for (let i = 0; i < this.config.plugins.length; i++) {
                let plugin = this.config.plugins[i];
                if (plugin.spec.appendTransaction) {
                    let n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this;
                    let tr = n < trs.length &&
                        plugin.spec.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState);
                    if (tr && newState.filterTransaction(tr, i)) {
                        tr.setMeta("appendedTransaction", rootTr);
                        if (!seen) {
                            seen = [];
                            for (let j = 0; j < this.config.plugins.length; j++)
                                seen.push(j < i ? { state: newState, n: trs.length } : { state: this, n: 0 });
                        }
                        trs.push(tr);
                        newState = newState.applyInner(tr);
                        haveNew = true;
                    }
                    if (seen)
                        seen[i] = { state: newState, n: trs.length };
                }
            }
            if (!haveNew)
                return { state: newState, transactions: trs };
        }
    }
    /**
    @internal
    */
    applyInner(tr) {
        if (!tr.before.eq(this.doc))
            throw new RangeError("Applying a mismatched transaction");
        let newInstance = new EditorState(this.config), fields = this.config.fields;
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            newInstance[field.name] = field.apply(tr, this[field.name], this, newInstance);
        }
        return newInstance;
    }
    /**
    Start a [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
    */
    get tr() { return new Transaction(this); }
    /**
    Create a new state.
    */
    static create(config) {
        let $config = new Configuration(config.doc ? config.doc.type.schema : config.schema, config.plugins);
        let instance = new EditorState($config);
        for (let i = 0; i < $config.fields.length; i++)
            instance[$config.fields[i].name] = $config.fields[i].init(config, instance);
        return instance;
    }
    /**
    Create a new state based on this one, but with an adjusted set
    of active plugins. State fields that exist in both sets of
    plugins are kept unchanged. Those that no longer exist are
    dropped, and those that are new are initialized using their
    [`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method, passing in the new
    configuration object..
    */
    reconfigure(config) {
        let $config = new Configuration(this.schema, config.plugins);
        let fields = $config.fields, instance = new EditorState($config);
        for (let i = 0; i < fields.length; i++) {
            let name = fields[i].name;
            instance[name] = this.hasOwnProperty(name) ? this[name] : fields[i].init(config, instance);
        }
        return instance;
    }
    /**
    Serialize this state to JSON. If you want to serialize the state
    of plugins, pass an object mapping property names to use in the
    resulting JSON object to plugin objects. The argument may also be
    a string or number, in which case it is ignored, to support the
    way `JSON.stringify` calls `toString` methods.
    */
    toJSON(pluginFields) {
        let result = { doc: this.doc.toJSON(), selection: this.selection.toJSON() };
        if (this.storedMarks)
            result.storedMarks = this.storedMarks.map(m => m.toJSON());
        if (pluginFields && typeof pluginFields == 'object')
            for (let prop in pluginFields) {
                if (prop == "doc" || prop == "selection")
                    throw new RangeError("The JSON fields `doc` and `selection` are reserved");
                let plugin = pluginFields[prop], state = plugin.spec.state;
                if (state && state.toJSON)
                    result[prop] = state.toJSON.call(plugin, this[plugin.key]);
            }
        return result;
    }
    /**
    Deserialize a JSON representation of a state. `config` should
    have at least a `schema` field, and should contain array of
    plugins to initialize the state with. `pluginFields` can be used
    to deserialize the state of plugins, by associating plugin
    instances with the property names they use in the JSON object.
    */
    static fromJSON(config, json, pluginFields) {
        if (!json)
            throw new RangeError("Invalid input for EditorState.fromJSON");
        if (!config.schema)
            throw new RangeError("Required config field 'schema' missing");
        let $config = new Configuration(config.schema, config.plugins);
        let instance = new EditorState($config);
        $config.fields.forEach(field => {
            if (field.name == "doc") {
                instance.doc = Node.fromJSON(config.schema, json.doc);
            }
            else if (field.name == "selection") {
                instance.selection = Selection.fromJSON(instance.doc, json.selection);
            }
            else if (field.name == "storedMarks") {
                if (json.storedMarks)
                    instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON);
            }
            else {
                if (pluginFields)
                    for (let prop in pluginFields) {
                        let plugin = pluginFields[prop], state = plugin.spec.state;
                        if (plugin.key == field.name && state && state.fromJSON &&
                            Object.prototype.hasOwnProperty.call(json, prop)) {
                            instance[field.name] = state.fromJSON.call(plugin, config, json[prop], instance);
                            return;
                        }
                    }
                instance[field.name] = field.init(config, instance);
            }
        });
        return instance;
    }
}

function bindProps(obj, self, target) {
    for (let prop in obj) {
        let val = obj[prop];
        if (val instanceof Function)
            val = val.bind(self);
        else if (prop == "handleDOMEvents")
            val = bindProps(val, self, {});
        target[prop] = val;
    }
    return target;
}
/**
Plugins bundle functionality that can be added to an editor.
They are part of the [editor state](https://prosemirror.net/docs/ref/#state.EditorState) and
may influence that state and the view that contains it.
*/
class Plugin {
    /**
    Create a plugin.
    */
    constructor(
    /**
    The plugin's [spec object](https://prosemirror.net/docs/ref/#state.PluginSpec).
    */
    spec) {
        this.spec = spec;
        /**
        The [props](https://prosemirror.net/docs/ref/#view.EditorProps) exported by this plugin.
        */
        this.props = {};
        if (spec.props)
            bindProps(spec.props, this, this.props);
        this.key = spec.key ? spec.key.key : createKey("plugin");
    }
    /**
    Extract the plugin's state field from an editor state.
    */
    getState(state) { return state[this.key]; }
}
const keys = Object.create(null);
function createKey(name) {
    if (name in keys)
        return name + "$" + ++keys[name];
    keys[name] = 0;
    return name + "$";
}
/**
A key is used to [tag](https://prosemirror.net/docs/ref/#state.PluginSpec.key) plugins in a way
that makes it possible to find them, given an editor state.
Assigning a key does mean only one plugin of that type can be
active in a state.
*/
class PluginKey {
    /**
    Create a plugin key.
    */
    constructor(name = "key") { this.key = createKey(name); }
    /**
    Get the active plugin with this key, if any, from an editor
    state.
    */
    get(state) { return state.config.pluginsByKey[this.key]; }
    /**
    Get the plugin's state from an editor state.
    */
    getState(state) { return state[this.key]; }
}

/**
Delete the selection, if there is one.
*/
const deleteSelection = (state, dispatch) => {
    if (state.selection.empty)
        return false;
    if (dispatch)
        dispatch(state.tr.deleteSelection().scrollIntoView());
    return true;
};
function atBlockStart$1(state, view) {
    let { $cursor } = state.selection;
    if (!$cursor || (view ? !view.endOfTextblock("backward", state)
        : $cursor.parentOffset > 0))
        return null;
    return $cursor;
}
/**
If the selection is empty and at the start of a textblock, try to
reduce the distance between that block and the one before it—if
there's a block directly before it that can be joined, join them.
If not, try to move the selected block closer to the next one in
the document structure by lifting it out of its parent or moving it
into a parent of the previous block. Will use the view for accurate
(bidi-aware) start-of-textblock detection if given.
*/
const joinBackward = (state, dispatch, view) => {
    let $cursor = atBlockStart$1(state, view);
    if (!$cursor)
        return false;
    let $cut = findCutBefore($cursor);
    // If there is no node before this, try to lift
    if (!$cut) {
        let range = $cursor.blockRange(), target = range && liftTarget(range);
        if (target == null)
            return false;
        if (dispatch)
            dispatch(state.tr.lift(range, target).scrollIntoView());
        return true;
    }
    let before = $cut.nodeBefore;
    // Apply the joining algorithm
    if (!before.type.spec.isolating && deleteBarrier(state, $cut, dispatch))
        return true;
    // If the node below has no content and the node above is
    // selectable, delete the node below and select the one above.
    if ($cursor.parent.content.size == 0 &&
        (textblockAt(before, "end") || NodeSelection.isSelectable(before))) {
        let delStep = replaceStep(state.doc, $cursor.before(), $cursor.after(), Slice.empty);
        if (delStep && delStep.slice.size < delStep.to - delStep.from) {
            if (dispatch) {
                let tr = state.tr.step(delStep);
                tr.setSelection(textblockAt(before, "end") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1)
                    : NodeSelection.create(tr.doc, $cut.pos - before.nodeSize));
                dispatch(tr.scrollIntoView());
            }
            return true;
        }
    }
    // If the node before is an atom, delete it
    if (before.isAtom && $cut.depth == $cursor.depth - 1) {
        if (dispatch)
            dispatch(state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView());
        return true;
    }
    return false;
};
function textblockAt(node, side, only = false) {
    for (let scan = node; scan; scan = (side == "start" ? scan.firstChild : scan.lastChild)) {
        if (scan.isTextblock)
            return true;
        if (only && scan.childCount != 1)
            return false;
    }
    return false;
}
/**
When the selection is empty and at the start of a textblock, select
the node before that textblock, if possible. This is intended to be
bound to keys like backspace, after
[`joinBackward`](https://prosemirror.net/docs/ref/#commands.joinBackward) or other deleting
commands, as a fall-back behavior when the schema doesn't allow
deletion at the selected point.
*/
const selectNodeBackward = (state, dispatch, view) => {
    let { $head, empty } = state.selection, $cut = $head;
    if (!empty)
        return false;
    if ($head.parent.isTextblock) {
        if (view ? !view.endOfTextblock("backward", state) : $head.parentOffset > 0)
            return false;
        $cut = findCutBefore($head);
    }
    let node = $cut && $cut.nodeBefore;
    if (!node || !NodeSelection.isSelectable(node))
        return false;
    if (dispatch)
        dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $cut.pos - node.nodeSize)).scrollIntoView());
    return true;
};
function findCutBefore($pos) {
    if (!$pos.parent.type.spec.isolating)
        for (let i = $pos.depth - 1; i >= 0; i--) {
            if ($pos.index(i) > 0)
                return $pos.doc.resolve($pos.before(i + 1));
            if ($pos.node(i).type.spec.isolating)
                break;
        }
    return null;
}
function atBlockEnd(state, view) {
    let { $cursor } = state.selection;
    if (!$cursor || (view ? !view.endOfTextblock("forward", state)
        : $cursor.parentOffset < $cursor.parent.content.size))
        return null;
    return $cursor;
}
/**
If the selection is empty and the cursor is at the end of a
textblock, try to reduce or remove the boundary between that block
and the one after it, either by joining them or by moving the other
block closer to this one in the tree structure. Will use the view
for accurate start-of-textblock detection if given.
*/
const joinForward = (state, dispatch, view) => {
    let $cursor = atBlockEnd(state, view);
    if (!$cursor)
        return false;
    let $cut = findCutAfter($cursor);
    // If there is no node after this, there's nothing to do
    if (!$cut)
        return false;
    let after = $cut.nodeAfter;
    // Try the joining algorithm
    if (deleteBarrier(state, $cut, dispatch))
        return true;
    // If the node above has no content and the node below is
    // selectable, delete the node above and select the one below.
    if ($cursor.parent.content.size == 0 &&
        (textblockAt(after, "start") || NodeSelection.isSelectable(after))) {
        let delStep = replaceStep(state.doc, $cursor.before(), $cursor.after(), Slice.empty);
        if (delStep && delStep.slice.size < delStep.to - delStep.from) {
            if (dispatch) {
                let tr = state.tr.step(delStep);
                tr.setSelection(textblockAt(after, "start") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos)), 1)
                    : NodeSelection.create(tr.doc, tr.mapping.map($cut.pos)));
                dispatch(tr.scrollIntoView());
            }
            return true;
        }
    }
    // If the next node is an atom, delete it
    if (after.isAtom && $cut.depth == $cursor.depth - 1) {
        if (dispatch)
            dispatch(state.tr.delete($cut.pos, $cut.pos + after.nodeSize).scrollIntoView());
        return true;
    }
    return false;
};
/**
When the selection is empty and at the end of a textblock, select
the node coming after that textblock, if possible. This is intended
to be bound to keys like delete, after
[`joinForward`](https://prosemirror.net/docs/ref/#commands.joinForward) and similar deleting
commands, to provide a fall-back behavior when the schema doesn't
allow deletion at the selected point.
*/
const selectNodeForward = (state, dispatch, view) => {
    let { $head, empty } = state.selection, $cut = $head;
    if (!empty)
        return false;
    if ($head.parent.isTextblock) {
        if (view ? !view.endOfTextblock("forward", state) : $head.parentOffset < $head.parent.content.size)
            return false;
        $cut = findCutAfter($head);
    }
    let node = $cut && $cut.nodeAfter;
    if (!node || !NodeSelection.isSelectable(node))
        return false;
    if (dispatch)
        dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $cut.pos)).scrollIntoView());
    return true;
};
function findCutAfter($pos) {
    if (!$pos.parent.type.spec.isolating)
        for (let i = $pos.depth - 1; i >= 0; i--) {
            let parent = $pos.node(i);
            if ($pos.index(i) + 1 < parent.childCount)
                return $pos.doc.resolve($pos.after(i + 1));
            if (parent.type.spec.isolating)
                break;
        }
    return null;
}
/**
If the selection is in a node whose type has a truthy
[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, replace the
selection with a newline character.
*/
const newlineInCode = (state, dispatch) => {
    let { $head, $anchor } = state.selection;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor))
        return false;
    if (dispatch)
        dispatch(state.tr.insertText("\n").scrollIntoView());
    return true;
};
function defaultBlockAt(match) {
    for (let i = 0; i < match.edgeCount; i++) {
        let { type } = match.edge(i);
        if (type.isTextblock && !type.hasRequiredAttrs())
            return type;
    }
    return null;
}
/**
When the selection is in a node with a truthy
[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, create a
default block after the code block, and move the cursor there.
*/
const exitCode = (state, dispatch) => {
    let { $head, $anchor } = state.selection;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor))
        return false;
    let above = $head.node(-1), after = $head.indexAfter(-1), type = defaultBlockAt(above.contentMatchAt(after));
    if (!type || !above.canReplaceWith(after, after, type))
        return false;
    if (dispatch) {
        let pos = $head.after(), tr = state.tr.replaceWith(pos, pos, type.createAndFill());
        tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
        dispatch(tr.scrollIntoView());
    }
    return true;
};
/**
If a block node is selected, create an empty paragraph before (if
it is its parent's first child) or after it.
*/
const createParagraphNear = (state, dispatch) => {
    let sel = state.selection, { $from, $to } = sel;
    if (sel instanceof AllSelection || $from.parent.inlineContent || $to.parent.inlineContent)
        return false;
    let type = defaultBlockAt($to.parent.contentMatchAt($to.indexAfter()));
    if (!type || !type.isTextblock)
        return false;
    if (dispatch) {
        let side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos;
        let tr = state.tr.insert(side, type.createAndFill());
        tr.setSelection(TextSelection.create(tr.doc, side + 1));
        dispatch(tr.scrollIntoView());
    }
    return true;
};
/**
If the cursor is in an empty textblock that can be lifted, lift the
block.
*/
const liftEmptyBlock = (state, dispatch) => {
    let { $cursor } = state.selection;
    if (!$cursor || $cursor.parent.content.size)
        return false;
    if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
        let before = $cursor.before();
        if (canSplit(state.doc, before)) {
            if (dispatch)
                dispatch(state.tr.split(before).scrollIntoView());
            return true;
        }
    }
    let range = $cursor.blockRange(), target = range && liftTarget(range);
    if (target == null)
        return false;
    if (dispatch)
        dispatch(state.tr.lift(range, target).scrollIntoView());
    return true;
};
/**
Create a variant of [`splitBlock`](https://prosemirror.net/docs/ref/#commands.splitBlock) that uses
a custom function to determine the type of the newly split off block.
*/
function splitBlockAs(splitNode) {
    return (state, dispatch) => {
        let { $from, $to } = state.selection;
        if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
            if (!$from.parentOffset || !canSplit(state.doc, $from.pos))
                return false;
            if (dispatch)
                dispatch(state.tr.split($from.pos).scrollIntoView());
            return true;
        }
        if (!$from.parent.isBlock)
            return false;
        if (dispatch) {
            let atEnd = $to.parentOffset == $to.parent.content.size;
            let tr = state.tr;
            if (state.selection instanceof TextSelection || state.selection instanceof AllSelection)
                tr.deleteSelection();
            let deflt = $from.depth == 0 ? null : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
            let splitType = splitNode && splitNode($to.parent, atEnd);
            let types = splitType ? [splitType] : atEnd && deflt ? [{ type: deflt }] : undefined;
            let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
            if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt ? [{ type: deflt }] : undefined)) {
                if (deflt)
                    types = [{ type: deflt }];
                can = true;
            }
            if (can) {
                tr.split(tr.mapping.map($from.pos), 1, types);
                if (!atEnd && !$from.parentOffset && $from.parent.type != deflt) {
                    let first = tr.mapping.map($from.before()), $first = tr.doc.resolve(first);
                    if (deflt && $from.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt))
                        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
                }
            }
            dispatch(tr.scrollIntoView());
        }
        return true;
    };
}
/**
Split the parent block of the selection. If the selection is a text
selection, also delete its content.
*/
const splitBlock = splitBlockAs();
/**
Select the whole document.
*/
const selectAll = (state, dispatch) => {
    if (dispatch)
        dispatch(state.tr.setSelection(new AllSelection(state.doc)));
    return true;
};
function joinMaybeClear(state, $pos, dispatch) {
    let before = $pos.nodeBefore, after = $pos.nodeAfter, index = $pos.index();
    if (!before || !after || !before.type.compatibleContent(after.type))
        return false;
    if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
        if (dispatch)
            dispatch(state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView());
        return true;
    }
    if (!$pos.parent.canReplace(index, index + 1) || !(after.isTextblock || canJoin(state.doc, $pos.pos)))
        return false;
    if (dispatch)
        dispatch(state.tr
            .clearIncompatible($pos.pos, before.type, before.contentMatchAt(before.childCount))
            .join($pos.pos)
            .scrollIntoView());
    return true;
}
function deleteBarrier(state, $cut, dispatch) {
    let before = $cut.nodeBefore, after = $cut.nodeAfter, conn, match;
    if (before.type.spec.isolating || after.type.spec.isolating)
        return false;
    if (joinMaybeClear(state, $cut, dispatch))
        return true;
    let canDelAfter = $cut.parent.canReplace($cut.index(), $cut.index() + 1);
    if (canDelAfter &&
        (conn = (match = before.contentMatchAt(before.childCount)).findWrapping(after.type)) &&
        match.matchType(conn[0] || after.type).validEnd) {
        if (dispatch) {
            let end = $cut.pos + after.nodeSize, wrap = Fragment.empty;
            for (let i = conn.length - 1; i >= 0; i--)
                wrap = Fragment.from(conn[i].create(null, wrap));
            wrap = Fragment.from(before.copy(wrap));
            let tr = state.tr.step(new ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new Slice(wrap, 1, 0), conn.length, true));
            let joinAt = end + 2 * conn.length;
            if (canJoin(tr.doc, joinAt))
                tr.join(joinAt);
            dispatch(tr.scrollIntoView());
        }
        return true;
    }
    let selAfter = Selection.findFrom($cut, 1);
    let range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && liftTarget(range);
    if (target != null && target >= $cut.depth) {
        if (dispatch)
            dispatch(state.tr.lift(range, target).scrollIntoView());
        return true;
    }
    if (canDelAfter && textblockAt(after, "start", true) && textblockAt(before, "end")) {
        let at = before, wrap = [];
        for (;;) {
            wrap.push(at);
            if (at.isTextblock)
                break;
            at = at.lastChild;
        }
        let afterText = after, afterDepth = 1;
        for (; !afterText.isTextblock; afterText = afterText.firstChild)
            afterDepth++;
        if (at.canReplace(at.childCount, at.childCount, afterText.content)) {
            if (dispatch) {
                let end = Fragment.empty;
                for (let i = wrap.length - 1; i >= 0; i--)
                    end = Fragment.from(wrap[i].copy(end));
                let tr = state.tr.step(new ReplaceAroundStep($cut.pos - wrap.length, $cut.pos + after.nodeSize, $cut.pos + afterDepth, $cut.pos + after.nodeSize - afterDepth, new Slice(end, wrap.length, 0), 0, true));
                dispatch(tr.scrollIntoView());
            }
            return true;
        }
    }
    return false;
}
function selectTextblockSide(side) {
    return function (state, dispatch) {
        let sel = state.selection, $pos = side < 0 ? sel.$from : sel.$to;
        let depth = $pos.depth;
        while ($pos.node(depth).isInline) {
            if (!depth)
                return false;
            depth--;
        }
        if (!$pos.node(depth).isTextblock)
            return false;
        if (dispatch)
            dispatch(state.tr.setSelection(TextSelection.create(state.doc, side < 0 ? $pos.start(depth) : $pos.end(depth))));
        return true;
    };
}
/**
Moves the cursor to the start of current text block.
*/
const selectTextblockStart = selectTextblockSide(-1);
/**
Moves the cursor to the end of current text block.
*/
const selectTextblockEnd = selectTextblockSide(1);
/**
Returns a command that tries to set the selected textblocks to the
given node type with the given attributes.
*/
function setBlockType(nodeType, attrs = null) {
    return function (state, dispatch) {
        let applicable = false;
        for (let i = 0; i < state.selection.ranges.length && !applicable; i++) {
            let { $from: { pos: from }, $to: { pos: to } } = state.selection.ranges[i];
            state.doc.nodesBetween(from, to, (node, pos) => {
                if (applicable)
                    return false;
                if (!node.isTextblock || node.hasMarkup(nodeType, attrs))
                    return;
                if (node.type == nodeType) {
                    applicable = true;
                }
                else {
                    let $pos = state.doc.resolve(pos), index = $pos.index();
                    applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
                }
            });
        }
        if (!applicable)
            return false;
        if (dispatch) {
            let tr = state.tr;
            for (let i = 0; i < state.selection.ranges.length; i++) {
                let { $from: { pos: from }, $to: { pos: to } } = state.selection.ranges[i];
                tr.setBlockType(from, to, nodeType, attrs);
            }
            dispatch(tr.scrollIntoView());
        }
        return true;
    };
}
function markApplies$1(doc, ranges, type) {
    for (let i = 0; i < ranges.length; i++) {
        let { $from, $to } = ranges[i];
        let can = $from.depth == 0 ? doc.inlineContent && doc.type.allowsMarkType(type) : false;
        doc.nodesBetween($from.pos, $to.pos, node => {
            if (can)
                return false;
            can = node.inlineContent && node.type.allowsMarkType(type);
        });
        if (can)
            return true;
    }
    return false;
}
/**
Create a command function that toggles the given mark with the
given attributes. Will return `false` when the current selection
doesn't support that mark. This will remove the mark if any marks
of that type exist in the selection, or add it otherwise. If the
selection is empty, this applies to the [stored
marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks) instead of a range of the
document.
*/
function toggleMark(markType, attrs = null) {
    return function (state, dispatch) {
        let { empty, $cursor, ranges } = state.selection;
        if ((empty && !$cursor) || !markApplies$1(state.doc, ranges, markType))
            return false;
        if (dispatch) {
            if ($cursor) {
                if (markType.isInSet(state.storedMarks || $cursor.marks()))
                    dispatch(state.tr.removeStoredMark(markType));
                else
                    dispatch(state.tr.addStoredMark(markType.create(attrs)));
            }
            else {
                let has = false, tr = state.tr;
                for (let i = 0; !has && i < ranges.length; i++) {
                    let { $from, $to } = ranges[i];
                    has = state.doc.rangeHasMark($from.pos, $to.pos, markType);
                }
                for (let i = 0; i < ranges.length; i++) {
                    let { $from, $to } = ranges[i];
                    if (has) {
                        tr.removeMark($from.pos, $to.pos, markType);
                    }
                    else {
                        let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore;
                        let spaceStart = start && start.isText ? /^\s*/.exec(start.text)[0].length : 0;
                        let spaceEnd = end && end.isText ? /\s*$/.exec(end.text)[0].length : 0;
                        if (from + spaceStart < to) {
                            from += spaceStart;
                            to -= spaceEnd;
                        }
                        tr.addMark(from, to, markType.create(attrs));
                    }
                }
                dispatch(tr.scrollIntoView());
            }
        }
        return true;
    };
}
/**
Combine a number of command functions into a single function (which
calls them one by one until one returns true).
*/
function chainCommands$1(...commands) {
    return function (state, dispatch, view) {
        for (let i = 0; i < commands.length; i++)
            if (commands[i](state, dispatch, view))
                return true;
        return false;
    };
}
let backspace = chainCommands$1(deleteSelection, joinBackward, selectNodeBackward);
let del = chainCommands$1(deleteSelection, joinForward, selectNodeForward);
/**
A basic keymap containing bindings not specific to any schema.
Binds the following keys (when multiple commands are listed, they
are chained with [`chainCommands`](https://prosemirror.net/docs/ref/#commands.chainCommands)):

* **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
* **Mod-Enter** to `exitCode`
* **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
* **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
* **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
* **Mod-a** to `selectAll`
*/
const pcBaseKeymap = {
    "Enter": chainCommands$1(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
    "Mod-Enter": exitCode,
    "Backspace": backspace,
    "Mod-Backspace": backspace,
    "Shift-Backspace": backspace,
    "Delete": del,
    "Mod-Delete": del,
    "Mod-a": selectAll
};
/**
A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
**Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
**Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
Ctrl-Delete.
*/
const macBaseKeymap = {
    "Ctrl-h": pcBaseKeymap["Backspace"],
    "Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
    "Ctrl-d": pcBaseKeymap["Delete"],
    "Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
    "Alt-Delete": pcBaseKeymap["Mod-Delete"],
    "Alt-d": pcBaseKeymap["Mod-Delete"],
    "Ctrl-a": selectTextblockStart,
    "Ctrl-e": selectTextblockEnd
};
for (let key in pcBaseKeymap)
    macBaseKeymap[key] = pcBaseKeymap[key];
const mac$3 = typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
    // @ts-ignore
    : typeof os != "undefined" && os.platform ? os.platform() == "darwin" : false;
/**
Depending on the detected platform, this will hold
[`pcBasekeymap`](https://prosemirror.net/docs/ref/#commands.pcBaseKeymap) or
[`macBaseKeymap`](https://prosemirror.net/docs/ref/#commands.macBaseKeymap).
*/
const baseKeymap = mac$3 ? macBaseKeymap : pcBaseKeymap;

const domIndex = function (node) {
    for (var index = 0;; index++) {
        node = node.previousSibling;
        if (!node)
            return index;
    }
};
const parentNode = function (node) {
    let parent = node.assignedSlot || node.parentNode;
    return parent && parent.nodeType == 11 ? parent.host : parent;
};
let reusedRange = null;
// Note that this will always return the same range, because DOM range
// objects are every expensive, and keep slowing down subsequent DOM
// updates, for some reason.
const textRange = function (node, from, to) {
    let range = reusedRange || (reusedRange = document.createRange());
    range.setEnd(node, to == null ? node.nodeValue.length : to);
    range.setStart(node, from || 0);
    return range;
};
// Scans forward and backward through DOM positions equivalent to the
// given one to see if the two are in the same place (i.e. after a
// text node vs at the end of that text node)
const isEquivalentPosition = function (node, off, targetNode, targetOff) {
    return targetNode && (scanFor(node, off, targetNode, targetOff, -1) ||
        scanFor(node, off, targetNode, targetOff, 1));
};
const atomElements = /^(img|br|input|textarea|hr)$/i;
function scanFor(node, off, targetNode, targetOff, dir) {
    for (;;) {
        if (node == targetNode && off == targetOff)
            return true;
        if (off == (dir < 0 ? 0 : nodeSize(node))) {
            let parent = node.parentNode;
            if (!parent || parent.nodeType != 1 || hasBlockDesc(node) || atomElements.test(node.nodeName) ||
                node.contentEditable == "false")
                return false;
            off = domIndex(node) + (dir < 0 ? 0 : 1);
            node = parent;
        }
        else if (node.nodeType == 1) {
            node = node.childNodes[off + (dir < 0 ? -1 : 0)];
            if (node.contentEditable == "false")
                return false;
            off = dir < 0 ? nodeSize(node) : 0;
        }
        else {
            return false;
        }
    }
}
function nodeSize(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
function isOnEdge(node, offset, parent) {
    for (let atStart = offset == 0, atEnd = offset == nodeSize(node); atStart || atEnd;) {
        if (node == parent)
            return true;
        let index = domIndex(node);
        node = node.parentNode;
        if (!node)
            return false;
        atStart = atStart && index == 0;
        atEnd = atEnd && index == nodeSize(node);
    }
}
function hasBlockDesc(dom) {
    let desc;
    for (let cur = dom; cur; cur = cur.parentNode)
        if (desc = cur.pmViewDesc)
            break;
    return desc && desc.node && desc.node.isBlock && (desc.dom == dom || desc.contentDOM == dom);
}
// Work around Chrome issue https://bugs.chromium.org/p/chromium/issues/detail?id=447523
// (isCollapsed inappropriately returns true in shadow dom)
const selectionCollapsed = function (domSel) {
    return domSel.focusNode && isEquivalentPosition(domSel.focusNode, domSel.focusOffset, domSel.anchorNode, domSel.anchorOffset);
};
function keyEvent(keyCode, key) {
    let event = document.createEvent("Event");
    event.initEvent("keydown", true, true);
    event.keyCode = keyCode;
    event.key = event.code = key;
    return event;
}
function deepActiveElement(doc) {
    let elt = doc.activeElement;
    while (elt && elt.shadowRoot)
        elt = elt.shadowRoot.activeElement;
    return elt;
}
function caretFromPoint(doc, x, y) {
    if (doc.caretPositionFromPoint) {
        try { // Firefox throws for this call in hard-to-predict circumstances (#994)
            let pos = doc.caretPositionFromPoint(x, y);
            if (pos)
                return { node: pos.offsetNode, offset: pos.offset };
        }
        catch (_) { }
    }
    if (doc.caretRangeFromPoint) {
        let range = doc.caretRangeFromPoint(x, y);
        if (range)
            return { node: range.startContainer, offset: range.startOffset };
    }
}

const nav = typeof navigator != "undefined" ? navigator : null;
const doc = typeof document != "undefined" ? document : null;
const agent = (nav && nav.userAgent) || "";
const ie_edge = /Edge\/(\d+)/.exec(agent);
const ie_upto10 = /MSIE \d/.exec(agent);
const ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agent);
const ie$1 = !!(ie_upto10 || ie_11up || ie_edge);
const ie_version = ie_upto10 ? document.documentMode : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0;
const gecko = !ie$1 && /gecko\/(\d+)/i.test(agent);
gecko && +(/Firefox\/(\d+)/.exec(agent) || [0, 0])[1];
const _chrome = !ie$1 && /Chrome\/(\d+)/.exec(agent);
const chrome = !!_chrome;
const chrome_version = _chrome ? +_chrome[1] : 0;
const safari = !ie$1 && !!nav && /Apple Computer/.test(nav.vendor);
// Is true for both iOS and iPadOS for convenience
const ios = safari && (/Mobile\/\w+/.test(agent) || !!nav && nav.maxTouchPoints > 2);
const mac$2 = ios || (nav ? /Mac/.test(nav.platform) : false);
const windows = nav ? /Win/.test(nav.platform) : false;
const android = /Android \d/.test(agent);
const webkit = !!doc && "webkitFontSmoothing" in doc.documentElement.style;
const webkit_version = webkit ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;

function windowRect(doc) {
    return { left: 0, right: doc.documentElement.clientWidth,
        top: 0, bottom: doc.documentElement.clientHeight };
}
function getSide(value, side) {
    return typeof value == "number" ? value : value[side];
}
function clientRect(node) {
    let rect = node.getBoundingClientRect();
    // Adjust for elements with style "transform: scale()"
    let scaleX = (rect.width / node.offsetWidth) || 1;
    let scaleY = (rect.height / node.offsetHeight) || 1;
    // Make sure scrollbar width isn't included in the rectangle
    return { left: rect.left, right: rect.left + node.clientWidth * scaleX,
        top: rect.top, bottom: rect.top + node.clientHeight * scaleY };
}
function scrollRectIntoView(view, rect, startDOM) {
    let scrollThreshold = view.someProp("scrollThreshold") || 0, scrollMargin = view.someProp("scrollMargin") || 5;
    let doc = view.dom.ownerDocument;
    for (let parent = startDOM || view.dom;; parent = parentNode(parent)) {
        if (!parent)
            break;
        if (parent.nodeType != 1)
            continue;
        let elt = parent;
        let atTop = elt == doc.body;
        let bounding = atTop ? windowRect(doc) : clientRect(elt);
        let moveX = 0, moveY = 0;
        if (rect.top < bounding.top + getSide(scrollThreshold, "top"))
            moveY = -(bounding.top - rect.top + getSide(scrollMargin, "top"));
        else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, "bottom"))
            moveY = rect.bottom - rect.top > bounding.bottom - bounding.top
                ? rect.top + getSide(scrollMargin, "top") - bounding.top
                : rect.bottom - bounding.bottom + getSide(scrollMargin, "bottom");
        if (rect.left < bounding.left + getSide(scrollThreshold, "left"))
            moveX = -(bounding.left - rect.left + getSide(scrollMargin, "left"));
        else if (rect.right > bounding.right - getSide(scrollThreshold, "right"))
            moveX = rect.right - bounding.right + getSide(scrollMargin, "right");
        if (moveX || moveY) {
            if (atTop) {
                doc.defaultView.scrollBy(moveX, moveY);
            }
            else {
                let startX = elt.scrollLeft, startY = elt.scrollTop;
                if (moveY)
                    elt.scrollTop += moveY;
                if (moveX)
                    elt.scrollLeft += moveX;
                let dX = elt.scrollLeft - startX, dY = elt.scrollTop - startY;
                rect = { left: rect.left - dX, top: rect.top - dY, right: rect.right - dX, bottom: rect.bottom - dY };
            }
        }
        if (atTop || /^(fixed|sticky)$/.test(getComputedStyle(parent).position))
            break;
    }
}
// Store the scroll position of the editor's parent nodes, along with
// the top position of an element near the top of the editor, which
// will be used to make sure the visible viewport remains stable even
// when the size of the content above changes.
function storeScrollPos(view) {
    let rect = view.dom.getBoundingClientRect(), startY = Math.max(0, rect.top);
    let refDOM, refTop;
    for (let x = (rect.left + rect.right) / 2, y = startY + 1; y < Math.min(innerHeight, rect.bottom); y += 5) {
        let dom = view.root.elementFromPoint(x, y);
        if (!dom || dom == view.dom || !view.dom.contains(dom))
            continue;
        let localRect = dom.getBoundingClientRect();
        if (localRect.top >= startY - 20) {
            refDOM = dom;
            refTop = localRect.top;
            break;
        }
    }
    return { refDOM: refDOM, refTop: refTop, stack: scrollStack(view.dom) };
}
function scrollStack(dom) {
    let stack = [], doc = dom.ownerDocument;
    for (let cur = dom; cur; cur = parentNode(cur)) {
        stack.push({ dom: cur, top: cur.scrollTop, left: cur.scrollLeft });
        if (dom == doc)
            break;
    }
    return stack;
}
// Reset the scroll position of the editor's parent nodes to that what
// it was before, when storeScrollPos was called.
function resetScrollPos({ refDOM, refTop, stack }) {
    let newRefTop = refDOM ? refDOM.getBoundingClientRect().top : 0;
    restoreScrollStack(stack, newRefTop == 0 ? 0 : newRefTop - refTop);
}
function restoreScrollStack(stack, dTop) {
    for (let i = 0; i < stack.length; i++) {
        let { dom, top, left } = stack[i];
        if (dom.scrollTop != top + dTop)
            dom.scrollTop = top + dTop;
        if (dom.scrollLeft != left)
            dom.scrollLeft = left;
    }
}
let preventScrollSupported = null;
// Feature-detects support for .focus({preventScroll: true}), and uses
// a fallback kludge when not supported.
function focusPreventScroll(dom) {
    if (dom.setActive)
        return dom.setActive(); // in IE
    if (preventScrollSupported)
        return dom.focus(preventScrollSupported);
    let stored = scrollStack(dom);
    dom.focus(preventScrollSupported == null ? {
        get preventScroll() {
            preventScrollSupported = { preventScroll: true };
            return true;
        }
    } : undefined);
    if (!preventScrollSupported) {
        preventScrollSupported = false;
        restoreScrollStack(stored, 0);
    }
}
function findOffsetInNode(node, coords) {
    let closest, dxClosest = 2e8, coordsClosest, offset = 0;
    let rowBot = coords.top, rowTop = coords.top;
    let firstBelow, coordsBelow;
    for (let child = node.firstChild, childIndex = 0; child; child = child.nextSibling, childIndex++) {
        let rects;
        if (child.nodeType == 1)
            rects = child.getClientRects();
        else if (child.nodeType == 3)
            rects = textRange(child).getClientRects();
        else
            continue;
        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            if (rect.top <= rowBot && rect.bottom >= rowTop) {
                rowBot = Math.max(rect.bottom, rowBot);
                rowTop = Math.min(rect.top, rowTop);
                let dx = rect.left > coords.left ? rect.left - coords.left
                    : rect.right < coords.left ? coords.left - rect.right : 0;
                if (dx < dxClosest) {
                    closest = child;
                    dxClosest = dx;
                    coordsClosest = dx && closest.nodeType == 3 ? {
                        left: rect.right < coords.left ? rect.right : rect.left,
                        top: coords.top
                    } : coords;
                    if (child.nodeType == 1 && dx)
                        offset = childIndex + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0);
                    continue;
                }
            }
            else if (rect.top > coords.top && !firstBelow && rect.left <= coords.left && rect.right >= coords.left) {
                firstBelow = child;
                coordsBelow = { left: Math.max(rect.left, Math.min(rect.right, coords.left)), top: rect.top };
            }
            if (!closest && (coords.left >= rect.right && coords.top >= rect.top ||
                coords.left >= rect.left && coords.top >= rect.bottom))
                offset = childIndex + 1;
        }
    }
    if (!closest && firstBelow) {
        closest = firstBelow;
        coordsClosest = coordsBelow;
        dxClosest = 0;
    }
    if (closest && closest.nodeType == 3)
        return findOffsetInText(closest, coordsClosest);
    if (!closest || (dxClosest && closest.nodeType == 1))
        return { node, offset };
    return findOffsetInNode(closest, coordsClosest);
}
function findOffsetInText(node, coords) {
    let len = node.nodeValue.length;
    let range = document.createRange();
    for (let i = 0; i < len; i++) {
        range.setEnd(node, i + 1);
        range.setStart(node, i);
        let rect = singleRect(range, 1);
        if (rect.top == rect.bottom)
            continue;
        if (inRect(coords, rect))
            return { node, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0) };
    }
    return { node, offset: 0 };
}
function inRect(coords, rect) {
    return coords.left >= rect.left - 1 && coords.left <= rect.right + 1 &&
        coords.top >= rect.top - 1 && coords.top <= rect.bottom + 1;
}
function targetKludge(dom, coords) {
    let parent = dom.parentNode;
    if (parent && /^li$/i.test(parent.nodeName) && coords.left < dom.getBoundingClientRect().left)
        return parent;
    return dom;
}
function posFromElement(view, elt, coords) {
    let { node, offset } = findOffsetInNode(elt, coords), bias = -1;
    if (node.nodeType == 1 && !node.firstChild) {
        let rect = node.getBoundingClientRect();
        bias = rect.left != rect.right && coords.left > (rect.left + rect.right) / 2 ? 1 : -1;
    }
    return view.docView.posFromDOM(node, offset, bias);
}
function posFromCaret(view, node, offset, coords) {
    // Browser (in caretPosition/RangeFromPoint) will agressively
    // normalize towards nearby inline nodes. Since we are interested in
    // positions between block nodes too, we first walk up the hierarchy
    // of nodes to see if there are block nodes that the coordinates
    // fall outside of. If so, we take the position before/after that
    // block. If not, we call `posFromDOM` on the raw node/offset.
    let outsideBlock = -1;
    for (let cur = node, sawBlock = false;;) {
        if (cur == view.dom)
            break;
        let desc = view.docView.nearestDesc(cur, true);
        if (!desc)
            return null;
        if (desc.dom.nodeType == 1 && (desc.node.isBlock && desc.parent && !sawBlock || !desc.contentDOM)) {
            let rect = desc.dom.getBoundingClientRect();
            if (desc.node.isBlock && desc.parent && !sawBlock) {
                sawBlock = true;
                if (rect.left > coords.left || rect.top > coords.top)
                    outsideBlock = desc.posBefore;
                else if (rect.right < coords.left || rect.bottom < coords.top)
                    outsideBlock = desc.posAfter;
            }
            if (!desc.contentDOM && outsideBlock < 0 && !desc.node.isText) {
                // If we are inside a leaf, return the side of the leaf closer to the coords
                let before = desc.node.isBlock ? coords.top < (rect.top + rect.bottom) / 2
                    : coords.left < (rect.left + rect.right) / 2;
                return before ? desc.posBefore : desc.posAfter;
            }
        }
        cur = desc.dom.parentNode;
    }
    return outsideBlock > -1 ? outsideBlock : view.docView.posFromDOM(node, offset, -1);
}
function elementFromPoint(element, coords, box) {
    let len = element.childNodes.length;
    if (len && box.top < box.bottom) {
        for (let startI = Math.max(0, Math.min(len - 1, Math.floor(len * (coords.top - box.top) / (box.bottom - box.top)) - 2)), i = startI;;) {
            let child = element.childNodes[i];
            if (child.nodeType == 1) {
                let rects = child.getClientRects();
                for (let j = 0; j < rects.length; j++) {
                    let rect = rects[j];
                    if (inRect(coords, rect))
                        return elementFromPoint(child, coords, rect);
                }
            }
            if ((i = (i + 1) % len) == startI)
                break;
        }
    }
    return element;
}
// Given an x,y position on the editor, get the position in the document.
function posAtCoords(view, coords) {
    let doc = view.dom.ownerDocument, node, offset = 0;
    let caret = caretFromPoint(doc, coords.left, coords.top);
    if (caret)
        ({ node, offset } = caret);
    let elt = (view.root.elementFromPoint ? view.root : doc)
        .elementFromPoint(coords.left, coords.top);
    let pos;
    if (!elt || !view.dom.contains(elt.nodeType != 1 ? elt.parentNode : elt)) {
        let box = view.dom.getBoundingClientRect();
        if (!inRect(coords, box))
            return null;
        elt = elementFromPoint(view.dom, coords, box);
        if (!elt)
            return null;
    }
    // Safari's caretRangeFromPoint returns nonsense when on a draggable element
    if (safari) {
        for (let p = elt; node && p; p = parentNode(p))
            if (p.draggable)
                node = undefined;
    }
    elt = targetKludge(elt, coords);
    if (node) {
        if (gecko && node.nodeType == 1) {
            // Firefox will sometimes return offsets into <input> nodes, which
            // have no actual children, from caretPositionFromPoint (#953)
            offset = Math.min(offset, node.childNodes.length);
            // It'll also move the returned position before image nodes,
            // even if those are behind it.
            if (offset < node.childNodes.length) {
                let next = node.childNodes[offset], box;
                if (next.nodeName == "IMG" && (box = next.getBoundingClientRect()).right <= coords.left &&
                    box.bottom > coords.top)
                    offset++;
            }
        }
        let prev;
        // When clicking above the right side of an uneditable node, Chrome will report a cursor position after that node.
        if (webkit && offset && node.nodeType == 1 && (prev = node.childNodes[offset - 1]).nodeType == 1 &&
            prev.contentEditable == "false" && prev.getBoundingClientRect().top >= coords.top)
            offset--;
        // Suspiciously specific kludge to work around caret*FromPoint
        // never returning a position at the end of the document
        if (node == view.dom && offset == node.childNodes.length - 1 && node.lastChild.nodeType == 1 &&
            coords.top > node.lastChild.getBoundingClientRect().bottom)
            pos = view.state.doc.content.size;
        // Ignore positions directly after a BR, since caret*FromPoint
        // 'round up' positions that would be more accurately placed
        // before the BR node.
        else if (offset == 0 || node.nodeType != 1 || node.childNodes[offset - 1].nodeName != "BR")
            pos = posFromCaret(view, node, offset, coords);
    }
    if (pos == null)
        pos = posFromElement(view, elt, coords);
    let desc = view.docView.nearestDesc(elt, true);
    return { pos, inside: desc ? desc.posAtStart - desc.border : -1 };
}
function nonZero(rect) {
    return rect.top < rect.bottom || rect.left < rect.right;
}
function singleRect(target, bias) {
    let rects = target.getClientRects();
    if (rects.length) {
        let first = rects[bias < 0 ? 0 : rects.length - 1];
        if (nonZero(first))
            return first;
    }
    return Array.prototype.find.call(rects, nonZero) || target.getBoundingClientRect();
}
const BIDI = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
// Given a position in the document model, get a bounding box of the
// character at that position, relative to the window.
function coordsAtPos(view, pos, side) {
    let { node, offset, atom } = view.docView.domFromPos(pos, side < 0 ? -1 : 1);
    let supportEmptyRange = webkit || gecko;
    if (node.nodeType == 3) {
        // These browsers support querying empty text ranges. Prefer that in
        // bidi context or when at the end of a node.
        if (supportEmptyRange && (BIDI.test(node.nodeValue) || (side < 0 ? !offset : offset == node.nodeValue.length))) {
            let rect = singleRect(textRange(node, offset, offset), side);
            // Firefox returns bad results (the position before the space)
            // when querying a position directly after line-broken
            // whitespace. Detect this situation and and kludge around it
            if (gecko && offset && /\s/.test(node.nodeValue[offset - 1]) && offset < node.nodeValue.length) {
                let rectBefore = singleRect(textRange(node, offset - 1, offset - 1), -1);
                if (rectBefore.top == rect.top) {
                    let rectAfter = singleRect(textRange(node, offset, offset + 1), -1);
                    if (rectAfter.top != rect.top)
                        return flattenV(rectAfter, rectAfter.left < rectBefore.left);
                }
            }
            return rect;
        }
        else {
            let from = offset, to = offset, takeSide = side < 0 ? 1 : -1;
            if (side < 0 && !offset) {
                to++;
                takeSide = -1;
            }
            else if (side >= 0 && offset == node.nodeValue.length) {
                from--;
                takeSide = 1;
            }
            else if (side < 0) {
                from--;
            }
            else {
                to++;
            }
            return flattenV(singleRect(textRange(node, from, to), takeSide), takeSide < 0);
        }
    }
    let $dom = view.state.doc.resolve(pos - (atom || 0));
    // Return a horizontal line in block context
    if (!$dom.parent.inlineContent) {
        if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
            let before = node.childNodes[offset - 1];
            if (before.nodeType == 1)
                return flattenH(before.getBoundingClientRect(), false);
        }
        if (atom == null && offset < nodeSize(node)) {
            let after = node.childNodes[offset];
            if (after.nodeType == 1)
                return flattenH(after.getBoundingClientRect(), true);
        }
        return flattenH(node.getBoundingClientRect(), side >= 0);
    }
    // Inline, not in text node (this is not Bidi-safe)
    if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
        let before = node.childNodes[offset - 1];
        let target = before.nodeType == 3 ? textRange(before, nodeSize(before) - (supportEmptyRange ? 0 : 1))
            // BR nodes tend to only return the rectangle before them.
            // Only use them if they are the last element in their parent
            : before.nodeType == 1 && (before.nodeName != "BR" || !before.nextSibling) ? before : null;
        if (target)
            return flattenV(singleRect(target, 1), false);
    }
    if (atom == null && offset < nodeSize(node)) {
        let after = node.childNodes[offset];
        while (after.pmViewDesc && after.pmViewDesc.ignoreForCoords)
            after = after.nextSibling;
        let target = !after ? null : after.nodeType == 3 ? textRange(after, 0, (supportEmptyRange ? 0 : 1))
            : after.nodeType == 1 ? after : null;
        if (target)
            return flattenV(singleRect(target, -1), true);
    }
    // All else failed, just try to get a rectangle for the target node
    return flattenV(singleRect(node.nodeType == 3 ? textRange(node) : node, -side), side >= 0);
}
function flattenV(rect, left) {
    if (rect.width == 0)
        return rect;
    let x = left ? rect.left : rect.right;
    return { top: rect.top, bottom: rect.bottom, left: x, right: x };
}
function flattenH(rect, top) {
    if (rect.height == 0)
        return rect;
    let y = top ? rect.top : rect.bottom;
    return { top: y, bottom: y, left: rect.left, right: rect.right };
}
function withFlushedState(view, state, f) {
    let viewState = view.state, active = view.root.activeElement;
    if (viewState != state)
        view.updateState(state);
    if (active != view.dom)
        view.focus();
    try {
        return f();
    }
    finally {
        if (viewState != state)
            view.updateState(viewState);
        if (active != view.dom && active)
            active.focus();
    }
}
// Whether vertical position motion in a given direction
// from a position would leave a text block.
function endOfTextblockVertical(view, state, dir) {
    let sel = state.selection;
    let $pos = dir == "up" ? sel.$from : sel.$to;
    return withFlushedState(view, state, () => {
        let { node: dom } = view.docView.domFromPos($pos.pos, dir == "up" ? -1 : 1);
        for (;;) {
            let nearest = view.docView.nearestDesc(dom, true);
            if (!nearest)
                break;
            if (nearest.node.isBlock) {
                dom = nearest.contentDOM || nearest.dom;
                break;
            }
            dom = nearest.dom.parentNode;
        }
        let coords = coordsAtPos(view, $pos.pos, 1);
        for (let child = dom.firstChild; child; child = child.nextSibling) {
            let boxes;
            if (child.nodeType == 1)
                boxes = child.getClientRects();
            else if (child.nodeType == 3)
                boxes = textRange(child, 0, child.nodeValue.length).getClientRects();
            else
                continue;
            for (let i = 0; i < boxes.length; i++) {
                let box = boxes[i];
                if (box.bottom > box.top + 1 &&
                    (dir == "up" ? coords.top - box.top > (box.bottom - coords.top) * 2
                        : box.bottom - coords.bottom > (coords.bottom - box.top) * 2))
                    return false;
            }
        }
        return true;
    });
}
const maybeRTL = /[\u0590-\u08ac]/;
function endOfTextblockHorizontal(view, state, dir) {
    let { $head } = state.selection;
    if (!$head.parent.isTextblock)
        return false;
    let offset = $head.parentOffset, atStart = !offset, atEnd = offset == $head.parent.content.size;
    let sel = view.domSelection();
    // If the textblock is all LTR, or the browser doesn't support
    // Selection.modify (Edge), fall back to a primitive approach
    if (!maybeRTL.test($head.parent.textContent) || !sel.modify)
        return dir == "left" || dir == "backward" ? atStart : atEnd;
    return withFlushedState(view, state, () => {
        // This is a huge hack, but appears to be the best we can
        // currently do: use `Selection.modify` to move the selection by
        // one character, and see if that moves the cursor out of the
        // textblock (or doesn't move it at all, when at the start/end of
        // the document).
        let { focusNode: oldNode, focusOffset: oldOff, anchorNode, anchorOffset } = view.domSelectionRange();
        let oldBidiLevel = sel.caretBidiLevel // Only for Firefox
        ;
        sel.modify("move", dir, "character");
        let parentDOM = $head.depth ? view.docView.domAfterPos($head.before()) : view.dom;
        let { focusNode: newNode, focusOffset: newOff } = view.domSelectionRange();
        let result = newNode && !parentDOM.contains(newNode.nodeType == 1 ? newNode : newNode.parentNode) ||
            (oldNode == newNode && oldOff == newOff);
        // Restore the previous selection
        try {
            sel.collapse(anchorNode, anchorOffset);
            if (oldNode && (oldNode != anchorNode || oldOff != anchorOffset) && sel.extend)
                sel.extend(oldNode, oldOff);
        }
        catch (_) { }
        if (oldBidiLevel != null)
            sel.caretBidiLevel = oldBidiLevel;
        return result;
    });
}
let cachedState = null;
let cachedDir = null;
let cachedResult = false;
function endOfTextblock(view, state, dir) {
    if (cachedState == state && cachedDir == dir)
        return cachedResult;
    cachedState = state;
    cachedDir = dir;
    return cachedResult = dir == "up" || dir == "down"
        ? endOfTextblockVertical(view, state, dir)
        : endOfTextblockHorizontal(view, state, dir);
}

// View descriptions are data structures that describe the DOM that is
// used to represent the editor's content. They are used for:
//
// - Incremental redrawing when the document changes
//
// - Figuring out what part of the document a given DOM position
//   corresponds to
//
// - Wiring in custom implementations of the editing interface for a
//   given node
//
// They form a doubly-linked mutable tree, starting at `view.docView`.
const NOT_DIRTY = 0, CHILD_DIRTY = 1, CONTENT_DIRTY = 2, NODE_DIRTY = 3;
// Superclass for the various kinds of descriptions. Defines their
// basic structure and shared methods.
class ViewDesc {
    constructor(parent, children, dom, 
    // This is the node that holds the child views. It may be null for
    // descs that don't have children.
    contentDOM) {
        this.parent = parent;
        this.children = children;
        this.dom = dom;
        this.contentDOM = contentDOM;
        this.dirty = NOT_DIRTY;
        // An expando property on the DOM node provides a link back to its
        // description.
        dom.pmViewDesc = this;
    }
    // Used to check whether a given description corresponds to a
    // widget/mark/node.
    matchesWidget(widget) { return false; }
    matchesMark(mark) { return false; }
    matchesNode(node, outerDeco, innerDeco) { return false; }
    matchesHack(nodeName) { return false; }
    // When parsing in-editor content (in domchange.js), we allow
    // descriptions to determine the parse rules that should be used to
    // parse them.
    parseRule() { return null; }
    // Used by the editor's event handler to ignore events that come
    // from certain descs.
    stopEvent(event) { return false; }
    // The size of the content represented by this desc.
    get size() {
        let size = 0;
        for (let i = 0; i < this.children.length; i++)
            size += this.children[i].size;
        return size;
    }
    // For block nodes, this represents the space taken up by their
    // start/end tokens.
    get border() { return 0; }
    destroy() {
        this.parent = undefined;
        if (this.dom.pmViewDesc == this)
            this.dom.pmViewDesc = undefined;
        for (let i = 0; i < this.children.length; i++)
            this.children[i].destroy();
    }
    posBeforeChild(child) {
        for (let i = 0, pos = this.posAtStart;; i++) {
            let cur = this.children[i];
            if (cur == child)
                return pos;
            pos += cur.size;
        }
    }
    get posBefore() {
        return this.parent.posBeforeChild(this);
    }
    get posAtStart() {
        return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
    }
    get posAfter() {
        return this.posBefore + this.size;
    }
    get posAtEnd() {
        return this.posAtStart + this.size - 2 * this.border;
    }
    localPosFromDOM(dom, offset, bias) {
        // If the DOM position is in the content, use the child desc after
        // it to figure out a position.
        if (this.contentDOM && this.contentDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode)) {
            if (bias < 0) {
                let domBefore, desc;
                if (dom == this.contentDOM) {
                    domBefore = dom.childNodes[offset - 1];
                }
                else {
                    while (dom.parentNode != this.contentDOM)
                        dom = dom.parentNode;
                    domBefore = dom.previousSibling;
                }
                while (domBefore && !((desc = domBefore.pmViewDesc) && desc.parent == this))
                    domBefore = domBefore.previousSibling;
                return domBefore ? this.posBeforeChild(desc) + desc.size : this.posAtStart;
            }
            else {
                let domAfter, desc;
                if (dom == this.contentDOM) {
                    domAfter = dom.childNodes[offset];
                }
                else {
                    while (dom.parentNode != this.contentDOM)
                        dom = dom.parentNode;
                    domAfter = dom.nextSibling;
                }
                while (domAfter && !((desc = domAfter.pmViewDesc) && desc.parent == this))
                    domAfter = domAfter.nextSibling;
                return domAfter ? this.posBeforeChild(desc) : this.posAtEnd;
            }
        }
        // Otherwise, use various heuristics, falling back on the bias
        // parameter, to determine whether to return the position at the
        // start or at the end of this view desc.
        let atEnd;
        if (dom == this.dom && this.contentDOM) {
            atEnd = offset > domIndex(this.contentDOM);
        }
        else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) {
            atEnd = dom.compareDocumentPosition(this.contentDOM) & 2;
        }
        else if (this.dom.firstChild) {
            if (offset == 0)
                for (let search = dom;; search = search.parentNode) {
                    if (search == this.dom) {
                        atEnd = false;
                        break;
                    }
                    if (search.previousSibling)
                        break;
                }
            if (atEnd == null && offset == dom.childNodes.length)
                for (let search = dom;; search = search.parentNode) {
                    if (search == this.dom) {
                        atEnd = true;
                        break;
                    }
                    if (search.nextSibling)
                        break;
                }
        }
        return (atEnd == null ? bias > 0 : atEnd) ? this.posAtEnd : this.posAtStart;
    }
    nearestDesc(dom, onlyNodes = false) {
        for (let first = true, cur = dom; cur; cur = cur.parentNode) {
            let desc = this.getDesc(cur), nodeDOM;
            if (desc && (!onlyNodes || desc.node)) {
                // If dom is outside of this desc's nodeDOM, don't count it.
                if (first && (nodeDOM = desc.nodeDOM) &&
                    !(nodeDOM.nodeType == 1 ? nodeDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode) : nodeDOM == dom))
                    first = false;
                else
                    return desc;
            }
        }
    }
    getDesc(dom) {
        let desc = dom.pmViewDesc;
        for (let cur = desc; cur; cur = cur.parent)
            if (cur == this)
                return desc;
    }
    posFromDOM(dom, offset, bias) {
        for (let scan = dom; scan; scan = scan.parentNode) {
            let desc = this.getDesc(scan);
            if (desc)
                return desc.localPosFromDOM(dom, offset, bias);
        }
        return -1;
    }
    // Find the desc for the node after the given pos, if any. (When a
    // parent node overrode rendering, there might not be one.)
    descAt(pos) {
        for (let i = 0, offset = 0; i < this.children.length; i++) {
            let child = this.children[i], end = offset + child.size;
            if (offset == pos && end != offset) {
                while (!child.border && child.children.length)
                    child = child.children[0];
                return child;
            }
            if (pos < end)
                return child.descAt(pos - offset - child.border);
            offset = end;
        }
    }
    domFromPos(pos, side) {
        if (!this.contentDOM)
            return { node: this.dom, offset: 0, atom: pos + 1 };
        // First find the position in the child array
        let i = 0, offset = 0;
        for (let curPos = 0; i < this.children.length; i++) {
            let child = this.children[i], end = curPos + child.size;
            if (end > pos || child instanceof TrailingHackViewDesc) {
                offset = pos - curPos;
                break;
            }
            curPos = end;
        }
        // If this points into the middle of a child, call through
        if (offset)
            return this.children[i].domFromPos(offset - this.children[i].border, side);
        // Go back if there were any zero-length widgets with side >= 0 before this point
        for (let prev; i && !(prev = this.children[i - 1]).size && prev instanceof WidgetViewDesc && prev.side >= 0; i--) { }
        // Scan towards the first useable node
        if (side <= 0) {
            let prev, enter = true;
            for (;; i--, enter = false) {
                prev = i ? this.children[i - 1] : null;
                if (!prev || prev.dom.parentNode == this.contentDOM)
                    break;
            }
            if (prev && side && enter && !prev.border && !prev.domAtom)
                return prev.domFromPos(prev.size, side);
            return { node: this.contentDOM, offset: prev ? domIndex(prev.dom) + 1 : 0 };
        }
        else {
            let next, enter = true;
            for (;; i++, enter = false) {
                next = i < this.children.length ? this.children[i] : null;
                if (!next || next.dom.parentNode == this.contentDOM)
                    break;
            }
            if (next && enter && !next.border && !next.domAtom)
                return next.domFromPos(0, side);
            return { node: this.contentDOM, offset: next ? domIndex(next.dom) : this.contentDOM.childNodes.length };
        }
    }
    // Used to find a DOM range in a single parent for a given changed
    // range.
    parseRange(from, to, base = 0) {
        if (this.children.length == 0)
            return { node: this.contentDOM, from, to, fromOffset: 0, toOffset: this.contentDOM.childNodes.length };
        let fromOffset = -1, toOffset = -1;
        for (let offset = base, i = 0;; i++) {
            let child = this.children[i], end = offset + child.size;
            if (fromOffset == -1 && from <= end) {
                let childBase = offset + child.border;
                // FIXME maybe descend mark views to parse a narrower range?
                if (from >= childBase && to <= end - child.border && child.node &&
                    child.contentDOM && this.contentDOM.contains(child.contentDOM))
                    return child.parseRange(from, to, childBase);
                from = offset;
                for (let j = i; j > 0; j--) {
                    let prev = this.children[j - 1];
                    if (prev.size && prev.dom.parentNode == this.contentDOM && !prev.emptyChildAt(1)) {
                        fromOffset = domIndex(prev.dom) + 1;
                        break;
                    }
                    from -= prev.size;
                }
                if (fromOffset == -1)
                    fromOffset = 0;
            }
            if (fromOffset > -1 && (end > to || i == this.children.length - 1)) {
                to = end;
                for (let j = i + 1; j < this.children.length; j++) {
                    let next = this.children[j];
                    if (next.size && next.dom.parentNode == this.contentDOM && !next.emptyChildAt(-1)) {
                        toOffset = domIndex(next.dom);
                        break;
                    }
                    to += next.size;
                }
                if (toOffset == -1)
                    toOffset = this.contentDOM.childNodes.length;
                break;
            }
            offset = end;
        }
        return { node: this.contentDOM, from, to, fromOffset, toOffset };
    }
    emptyChildAt(side) {
        if (this.border || !this.contentDOM || !this.children.length)
            return false;
        let child = this.children[side < 0 ? 0 : this.children.length - 1];
        return child.size == 0 || child.emptyChildAt(side);
    }
    domAfterPos(pos) {
        let { node, offset } = this.domFromPos(pos, 0);
        if (node.nodeType != 1 || offset == node.childNodes.length)
            throw new RangeError("No node after pos " + pos);
        return node.childNodes[offset];
    }
    // View descs are responsible for setting any selection that falls
    // entirely inside of them, so that custom implementations can do
    // custom things with the selection. Note that this falls apart when
    // a selection starts in such a node and ends in another, in which
    // case we just use whatever domFromPos produces as a best effort.
    setSelection(anchor, head, root, force = false) {
        // If the selection falls entirely in a child, give it to that child
        let from = Math.min(anchor, head), to = Math.max(anchor, head);
        for (let i = 0, offset = 0; i < this.children.length; i++) {
            let child = this.children[i], end = offset + child.size;
            if (from > offset && to < end)
                return child.setSelection(anchor - offset - child.border, head - offset - child.border, root, force);
            offset = end;
        }
        let anchorDOM = this.domFromPos(anchor, anchor ? -1 : 1);
        let headDOM = head == anchor ? anchorDOM : this.domFromPos(head, head ? -1 : 1);
        let domSel = root.getSelection();
        let brKludge = false;
        // On Firefox, using Selection.collapse to put the cursor after a
        // BR node for some reason doesn't always work (#1073). On Safari,
        // the cursor sometimes inexplicable visually lags behind its
        // reported position in such situations (#1092).
        if ((gecko || safari) && anchor == head) {
            let { node, offset } = anchorDOM;
            if (node.nodeType == 3) {
                brKludge = !!(offset && node.nodeValue[offset - 1] == "\n");
                // Issue #1128
                if (brKludge && offset == node.nodeValue.length) {
                    for (let scan = node, after; scan; scan = scan.parentNode) {
                        if (after = scan.nextSibling) {
                            if (after.nodeName == "BR")
                                anchorDOM = headDOM = { node: after.parentNode, offset: domIndex(after) + 1 };
                            break;
                        }
                        let desc = scan.pmViewDesc;
                        if (desc && desc.node && desc.node.isBlock)
                            break;
                    }
                }
            }
            else {
                let prev = node.childNodes[offset - 1];
                brKludge = prev && (prev.nodeName == "BR" || prev.contentEditable == "false");
            }
        }
        // Firefox can act strangely when the selection is in front of an
        // uneditable node. See #1163 and https://bugzilla.mozilla.org/show_bug.cgi?id=1709536
        if (gecko && domSel.focusNode && domSel.focusNode != headDOM.node && domSel.focusNode.nodeType == 1) {
            let after = domSel.focusNode.childNodes[domSel.focusOffset];
            if (after && after.contentEditable == "false")
                force = true;
        }
        if (!(force || brKludge && safari) &&
            isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset) &&
            isEquivalentPosition(headDOM.node, headDOM.offset, domSel.focusNode, domSel.focusOffset))
            return;
        // Selection.extend can be used to create an 'inverted' selection
        // (one where the focus is before the anchor), but not all
        // browsers support it yet.
        let domSelExtended = false;
        if ((domSel.extend || anchor == head) && !brKludge) {
            domSel.collapse(anchorDOM.node, anchorDOM.offset);
            try {
                if (anchor != head)
                    domSel.extend(headDOM.node, headDOM.offset);
                domSelExtended = true;
            }
            catch (_) {
                // In some cases with Chrome the selection is empty after calling
                // collapse, even when it should be valid. This appears to be a bug, but
                // it is difficult to isolate. If this happens fallback to the old path
                // without using extend.
                // Similarly, this could crash on Safari if the editor is hidden, and
                // there was no selection.
            }
        }
        if (!domSelExtended) {
            if (anchor > head) {
                let tmp = anchorDOM;
                anchorDOM = headDOM;
                headDOM = tmp;
            }
            let range = document.createRange();
            range.setEnd(headDOM.node, headDOM.offset);
            range.setStart(anchorDOM.node, anchorDOM.offset);
            domSel.removeAllRanges();
            domSel.addRange(range);
        }
    }
    ignoreMutation(mutation) {
        return !this.contentDOM && mutation.type != "selection";
    }
    get contentLost() {
        return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
    }
    // Remove a subtree of the element tree that has been touched
    // by a DOM change, so that the next update will redraw it.
    markDirty(from, to) {
        for (let offset = 0, i = 0; i < this.children.length; i++) {
            let child = this.children[i], end = offset + child.size;
            if (offset == end ? from <= end && to >= offset : from < end && to > offset) {
                let startInside = offset + child.border, endInside = end - child.border;
                if (from >= startInside && to <= endInside) {
                    this.dirty = from == offset || to == end ? CONTENT_DIRTY : CHILD_DIRTY;
                    if (from == startInside && to == endInside &&
                        (child.contentLost || child.dom.parentNode != this.contentDOM))
                        child.dirty = NODE_DIRTY;
                    else
                        child.markDirty(from - startInside, to - startInside);
                    return;
                }
                else {
                    child.dirty = child.dom == child.contentDOM && child.dom.parentNode == this.contentDOM && !child.children.length
                        ? CONTENT_DIRTY : NODE_DIRTY;
                }
            }
            offset = end;
        }
        this.dirty = CONTENT_DIRTY;
    }
    markParentsDirty() {
        let level = 1;
        for (let node = this.parent; node; node = node.parent, level++) {
            let dirty = level == 1 ? CONTENT_DIRTY : CHILD_DIRTY;
            if (node.dirty < dirty)
                node.dirty = dirty;
        }
    }
    get domAtom() { return false; }
    get ignoreForCoords() { return false; }
}
// A widget desc represents a widget decoration, which is a DOM node
// drawn between the document nodes.
class WidgetViewDesc extends ViewDesc {
    constructor(parent, widget, view, pos) {
        let self, dom = widget.type.toDOM;
        if (typeof dom == "function")
            dom = dom(view, () => {
                if (!self)
                    return pos;
                if (self.parent)
                    return self.parent.posBeforeChild(self);
            });
        if (!widget.type.spec.raw) {
            if (dom.nodeType != 1) {
                let wrap = document.createElement("span");
                wrap.appendChild(dom);
                dom = wrap;
            }
            dom.contentEditable = "false";
            dom.classList.add("ProseMirror-widget");
        }
        super(parent, [], dom, null);
        this.widget = widget;
        this.widget = widget;
        self = this;
    }
    matchesWidget(widget) {
        return this.dirty == NOT_DIRTY && widget.type.eq(this.widget.type);
    }
    parseRule() { return { ignore: true }; }
    stopEvent(event) {
        let stop = this.widget.spec.stopEvent;
        return stop ? stop(event) : false;
    }
    ignoreMutation(mutation) {
        return mutation.type != "selection" || this.widget.spec.ignoreSelection;
    }
    destroy() {
        this.widget.type.destroy(this.dom);
        super.destroy();
    }
    get domAtom() { return true; }
    get side() { return this.widget.type.side; }
}
class CompositionViewDesc extends ViewDesc {
    constructor(parent, dom, textDOM, text) {
        super(parent, [], dom, null);
        this.textDOM = textDOM;
        this.text = text;
    }
    get size() { return this.text.length; }
    localPosFromDOM(dom, offset) {
        if (dom != this.textDOM)
            return this.posAtStart + (offset ? this.size : 0);
        return this.posAtStart + offset;
    }
    domFromPos(pos) {
        return { node: this.textDOM, offset: pos };
    }
    ignoreMutation(mut) {
        return mut.type === 'characterData' && mut.target.nodeValue == mut.oldValue;
    }
}
// A mark desc represents a mark. May have multiple children,
// depending on how the mark is split. Note that marks are drawn using
// a fixed nesting order, for simplicity and predictability, so in
// some cases they will be split more often than would appear
// necessary.
class MarkViewDesc extends ViewDesc {
    constructor(parent, mark, dom, contentDOM) {
        super(parent, [], dom, contentDOM);
        this.mark = mark;
    }
    static create(parent, mark, inline, view) {
        let custom = view.nodeViews[mark.type.name];
        let spec = custom && custom(mark, view, inline);
        if (!spec || !spec.dom)
            spec = DOMSerializer.renderSpec(document, mark.type.spec.toDOM(mark, inline));
        return new MarkViewDesc(parent, mark, spec.dom, spec.contentDOM || spec.dom);
    }
    parseRule() {
        if ((this.dirty & NODE_DIRTY) || this.mark.type.spec.reparseInView)
            return null;
        return { mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM };
    }
    matchesMark(mark) { return this.dirty != NODE_DIRTY && this.mark.eq(mark); }
    markDirty(from, to) {
        super.markDirty(from, to);
        // Move dirty info to nearest node view
        if (this.dirty != NOT_DIRTY) {
            let parent = this.parent;
            while (!parent.node)
                parent = parent.parent;
            if (parent.dirty < this.dirty)
                parent.dirty = this.dirty;
            this.dirty = NOT_DIRTY;
        }
    }
    slice(from, to, view) {
        let copy = MarkViewDesc.create(this.parent, this.mark, true, view);
        let nodes = this.children, size = this.size;
        if (to < size)
            nodes = replaceNodes(nodes, to, size, view);
        if (from > 0)
            nodes = replaceNodes(nodes, 0, from, view);
        for (let i = 0; i < nodes.length; i++)
            nodes[i].parent = copy;
        copy.children = nodes;
        return copy;
    }
}
// Node view descs are the main, most common type of view desc, and
// correspond to an actual node in the document. Unlike mark descs,
// they populate their child array themselves.
class NodeViewDesc extends ViewDesc {
    constructor(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos) {
        super(parent, [], dom, contentDOM);
        this.node = node;
        this.outerDeco = outerDeco;
        this.innerDeco = innerDeco;
        this.nodeDOM = nodeDOM;
    }
    // By default, a node is rendered using the `toDOM` method from the
    // node type spec. But client code can use the `nodeViews` spec to
    // supply a custom node view, which can influence various aspects of
    // the way the node works.
    //
    // (Using subclassing for this was intentionally decided against,
    // since it'd require exposing a whole slew of finicky
    // implementation details to the user code that they probably will
    // never need.)
    static create(parent, node, outerDeco, innerDeco, view, pos) {
        let custom = view.nodeViews[node.type.name], descObj;
        let spec = custom && custom(node, view, () => {
            // (This is a function that allows the custom view to find its
            // own position)
            if (!descObj)
                return pos;
            if (descObj.parent)
                return descObj.parent.posBeforeChild(descObj);
        }, outerDeco, innerDeco);
        let dom = spec && spec.dom, contentDOM = spec && spec.contentDOM;
        if (node.isText) {
            if (!dom)
                dom = document.createTextNode(node.text);
            else if (dom.nodeType != 3)
                throw new RangeError("Text must be rendered as a DOM text node");
        }
        else if (!dom) {
            ({ dom, contentDOM } = DOMSerializer.renderSpec(document, node.type.spec.toDOM(node)));
        }
        if (!contentDOM && !node.isText && dom.nodeName != "BR") { // Chrome gets confused by <br contenteditable=false>
            if (!dom.hasAttribute("contenteditable"))
                dom.contentEditable = "false";
            if (node.type.spec.draggable)
                dom.draggable = true;
        }
        let nodeDOM = dom;
        dom = applyOuterDeco(dom, outerDeco, node);
        if (spec)
            return descObj = new CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM || null, nodeDOM, spec, view, pos + 1);
        else if (node.isText)
            return new TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view);
        else
            return new NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM || null, nodeDOM, view, pos + 1);
    }
    parseRule() {
        // Experimental kludge to allow opt-in re-parsing of nodes
        if (this.node.type.spec.reparseInView)
            return null;
        // FIXME the assumption that this can always return the current
        // attrs means that if the user somehow manages to change the
        // attrs in the dom, that won't be picked up. Not entirely sure
        // whether this is a problem
        let rule = { node: this.node.type.name, attrs: this.node.attrs };
        if (this.node.type.whitespace == "pre")
            rule.preserveWhitespace = "full";
        if (!this.contentDOM) {
            rule.getContent = () => this.node.content;
        }
        else if (!this.contentLost) {
            rule.contentElement = this.contentDOM;
        }
        else {
            // Chrome likes to randomly recreate parent nodes when
            // backspacing things. When that happens, this tries to find the
            // new parent.
            for (let i = this.children.length - 1; i >= 0; i--) {
                let child = this.children[i];
                if (this.dom.contains(child.dom.parentNode)) {
                    rule.contentElement = child.dom.parentNode;
                    break;
                }
            }
            if (!rule.contentElement)
                rule.getContent = () => Fragment.empty;
        }
        return rule;
    }
    matchesNode(node, outerDeco, innerDeco) {
        return this.dirty == NOT_DIRTY && node.eq(this.node) &&
            sameOuterDeco(outerDeco, this.outerDeco) && innerDeco.eq(this.innerDeco);
    }
    get size() { return this.node.nodeSize; }
    get border() { return this.node.isLeaf ? 0 : 1; }
    // Syncs `this.children` to match `this.node.content` and the local
    // decorations, possibly introducing nesting for marks. Then, in a
    // separate step, syncs the DOM inside `this.contentDOM` to
    // `this.children`.
    updateChildren(view, pos) {
        let inline = this.node.inlineContent, off = pos;
        let composition = view.composing ? this.localCompositionInfo(view, pos) : null;
        let localComposition = composition && composition.pos > -1 ? composition : null;
        let compositionInChild = composition && composition.pos < 0;
        let updater = new ViewTreeUpdater(this, localComposition && localComposition.node, view);
        iterDeco(this.node, this.innerDeco, (widget, i, insideNode) => {
            if (widget.spec.marks)
                updater.syncToMarks(widget.spec.marks, inline, view);
            else if (widget.type.side >= 0 && !insideNode)
                updater.syncToMarks(i == this.node.childCount ? Mark.none : this.node.child(i).marks, inline, view);
            // If the next node is a desc matching this widget, reuse it,
            // otherwise insert the widget as a new view desc.
            updater.placeWidget(widget, view, off);
        }, (child, outerDeco, innerDeco, i) => {
            // Make sure the wrapping mark descs match the node's marks.
            updater.syncToMarks(child.marks, inline, view);
            // Try several strategies for drawing this node
            let compIndex;
            if (updater.findNodeMatch(child, outerDeco, innerDeco, i)) ;
            else if (compositionInChild && view.state.selection.from > off &&
                view.state.selection.to < off + child.nodeSize &&
                (compIndex = updater.findIndexWithChild(composition.node)) > -1 &&
                updater.updateNodeAt(child, outerDeco, innerDeco, compIndex, view)) ;
            else if (updater.updateNextNode(child, outerDeco, innerDeco, view, i, off)) ;
            else {
                // Add it as a new view
                updater.addNode(child, outerDeco, innerDeco, view, off);
            }
            off += child.nodeSize;
        });
        // Drop all remaining descs after the current position.
        updater.syncToMarks([], inline, view);
        if (this.node.isTextblock)
            updater.addTextblockHacks();
        updater.destroyRest();
        // Sync the DOM if anything changed
        if (updater.changed || this.dirty == CONTENT_DIRTY) {
            // May have to protect focused DOM from being changed if a composition is active
            if (localComposition)
                this.protectLocalComposition(view, localComposition);
            renderDescs(this.contentDOM, this.children, view);
            if (ios)
                iosHacks(this.dom);
        }
    }
    localCompositionInfo(view, pos) {
        // Only do something if both the selection and a focused text node
        // are inside of this node
        let { from, to } = view.state.selection;
        if (!(view.state.selection instanceof TextSelection) || from < pos || to > pos + this.node.content.size)
            return null;
        let sel = view.domSelectionRange();
        let textNode = nearbyTextNode(sel.focusNode, sel.focusOffset);
        if (!textNode || !this.dom.contains(textNode.parentNode))
            return null;
        if (this.node.inlineContent) {
            // Find the text in the focused node in the node, stop if it's not
            // there (may have been modified through other means, in which
            // case it should overwritten)
            let text = textNode.nodeValue;
            let textPos = findTextInFragment(this.node.content, text, from - pos, to - pos);
            return textPos < 0 ? null : { node: textNode, pos: textPos, text };
        }
        else {
            return { node: textNode, pos: -1, text: "" };
        }
    }
    protectLocalComposition(view, { node, pos, text }) {
        // The node is already part of a local view desc, leave it there
        if (this.getDesc(node))
            return;
        // Create a composition view for the orphaned nodes
        let topNode = node;
        for (;; topNode = topNode.parentNode) {
            if (topNode.parentNode == this.contentDOM)
                break;
            while (topNode.previousSibling)
                topNode.parentNode.removeChild(topNode.previousSibling);
            while (topNode.nextSibling)
                topNode.parentNode.removeChild(topNode.nextSibling);
            if (topNode.pmViewDesc)
                topNode.pmViewDesc = undefined;
        }
        let desc = new CompositionViewDesc(this, topNode, node, text);
        view.input.compositionNodes.push(desc);
        // Patch up this.children to contain the composition view
        this.children = replaceNodes(this.children, pos, pos + text.length, view, desc);
    }
    // If this desc must be updated to match the given node decoration,
    // do so and return true.
    update(node, outerDeco, innerDeco, view) {
        if (this.dirty == NODE_DIRTY ||
            !node.sameMarkup(this.node))
            return false;
        this.updateInner(node, outerDeco, innerDeco, view);
        return true;
    }
    updateInner(node, outerDeco, innerDeco, view) {
        this.updateOuterDeco(outerDeco);
        this.node = node;
        this.innerDeco = innerDeco;
        if (this.contentDOM)
            this.updateChildren(view, this.posAtStart);
        this.dirty = NOT_DIRTY;
    }
    updateOuterDeco(outerDeco) {
        if (sameOuterDeco(outerDeco, this.outerDeco))
            return;
        let needsWrap = this.nodeDOM.nodeType != 1;
        let oldDOM = this.dom;
        this.dom = patchOuterDeco(this.dom, this.nodeDOM, computeOuterDeco(this.outerDeco, this.node, needsWrap), computeOuterDeco(outerDeco, this.node, needsWrap));
        if (this.dom != oldDOM) {
            oldDOM.pmViewDesc = undefined;
            this.dom.pmViewDesc = this;
        }
        this.outerDeco = outerDeco;
    }
    // Mark this node as being the selected node.
    selectNode() {
        if (this.nodeDOM.nodeType == 1)
            this.nodeDOM.classList.add("ProseMirror-selectednode");
        if (this.contentDOM || !this.node.type.spec.draggable)
            this.dom.draggable = true;
    }
    // Remove selected node marking from this node.
    deselectNode() {
        if (this.nodeDOM.nodeType == 1)
            this.nodeDOM.classList.remove("ProseMirror-selectednode");
        if (this.contentDOM || !this.node.type.spec.draggable)
            this.dom.removeAttribute("draggable");
    }
    get domAtom() { return this.node.isAtom; }
}
// Create a view desc for the top-level document node, to be exported
// and used by the view class.
function docViewDesc(doc, outerDeco, innerDeco, dom, view) {
    applyOuterDeco(dom, outerDeco, doc);
    let docView = new NodeViewDesc(undefined, doc, outerDeco, innerDeco, dom, dom, dom, view, 0);
    if (docView.contentDOM)
        docView.updateChildren(view, 0);
    return docView;
}
class TextViewDesc extends NodeViewDesc {
    constructor(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) {
        super(parent, node, outerDeco, innerDeco, dom, null, nodeDOM, view, 0);
    }
    parseRule() {
        let skip = this.nodeDOM.parentNode;
        while (skip && skip != this.dom && !skip.pmIsDeco)
            skip = skip.parentNode;
        return { skip: (skip || true) };
    }
    update(node, outerDeco, innerDeco, view) {
        if (this.dirty == NODE_DIRTY || (this.dirty != NOT_DIRTY && !this.inParent()) ||
            !node.sameMarkup(this.node))
            return false;
        this.updateOuterDeco(outerDeco);
        if ((this.dirty != NOT_DIRTY || node.text != this.node.text) && node.text != this.nodeDOM.nodeValue) {
            this.nodeDOM.nodeValue = node.text;
            if (view.trackWrites == this.nodeDOM)
                view.trackWrites = null;
        }
        this.node = node;
        this.dirty = NOT_DIRTY;
        return true;
    }
    inParent() {
        let parentDOM = this.parent.contentDOM;
        for (let n = this.nodeDOM; n; n = n.parentNode)
            if (n == parentDOM)
                return true;
        return false;
    }
    domFromPos(pos) {
        return { node: this.nodeDOM, offset: pos };
    }
    localPosFromDOM(dom, offset, bias) {
        if (dom == this.nodeDOM)
            return this.posAtStart + Math.min(offset, this.node.text.length);
        return super.localPosFromDOM(dom, offset, bias);
    }
    ignoreMutation(mutation) {
        return mutation.type != "characterData" && mutation.type != "selection";
    }
    slice(from, to, view) {
        let node = this.node.cut(from, to), dom = document.createTextNode(node.text);
        return new TextViewDesc(this.parent, node, this.outerDeco, this.innerDeco, dom, dom, view);
    }
    markDirty(from, to) {
        super.markDirty(from, to);
        if (this.dom != this.nodeDOM && (from == 0 || to == this.nodeDOM.nodeValue.length))
            this.dirty = NODE_DIRTY;
    }
    get domAtom() { return false; }
}
// A dummy desc used to tag trailing BR or IMG nodes created to work
// around contentEditable terribleness.
class TrailingHackViewDesc extends ViewDesc {
    parseRule() { return { ignore: true }; }
    matchesHack(nodeName) { return this.dirty == NOT_DIRTY && this.dom.nodeName == nodeName; }
    get domAtom() { return true; }
    get ignoreForCoords() { return this.dom.nodeName == "IMG"; }
}
// A separate subclass is used for customized node views, so that the
// extra checks only have to be made for nodes that are actually
// customized.
class CustomNodeViewDesc extends NodeViewDesc {
    constructor(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, spec, view, pos) {
        super(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos);
        this.spec = spec;
    }
    // A custom `update` method gets to decide whether the update goes
    // through. If it does, and there's a `contentDOM` node, our logic
    // updates the children.
    update(node, outerDeco, innerDeco, view) {
        if (this.dirty == NODE_DIRTY)
            return false;
        if (this.spec.update) {
            let result = this.spec.update(node, outerDeco, innerDeco);
            if (result)
                this.updateInner(node, outerDeco, innerDeco, view);
            return result;
        }
        else if (!this.contentDOM && !node.isLeaf) {
            return false;
        }
        else {
            return super.update(node, outerDeco, innerDeco, view);
        }
    }
    selectNode() {
        this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
    }
    deselectNode() {
        this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
    }
    setSelection(anchor, head, root, force) {
        this.spec.setSelection ? this.spec.setSelection(anchor, head, root)
            : super.setSelection(anchor, head, root, force);
    }
    destroy() {
        if (this.spec.destroy)
            this.spec.destroy();
        super.destroy();
    }
    stopEvent(event) {
        return this.spec.stopEvent ? this.spec.stopEvent(event) : false;
    }
    ignoreMutation(mutation) {
        return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : super.ignoreMutation(mutation);
    }
}
// Sync the content of the given DOM node with the nodes associated
// with the given array of view descs, recursing into mark descs
// because this should sync the subtree for a whole node at a time.
function renderDescs(parentDOM, descs, view) {
    let dom = parentDOM.firstChild, written = false;
    for (let i = 0; i < descs.length; i++) {
        let desc = descs[i], childDOM = desc.dom;
        if (childDOM.parentNode == parentDOM) {
            while (childDOM != dom) {
                dom = rm(dom);
                written = true;
            }
            dom = dom.nextSibling;
        }
        else {
            written = true;
            parentDOM.insertBefore(childDOM, dom);
        }
        if (desc instanceof MarkViewDesc) {
            let pos = dom ? dom.previousSibling : parentDOM.lastChild;
            renderDescs(desc.contentDOM, desc.children, view);
            dom = pos ? pos.nextSibling : parentDOM.firstChild;
        }
    }
    while (dom) {
        dom = rm(dom);
        written = true;
    }
    if (written && view.trackWrites == parentDOM)
        view.trackWrites = null;
}
const OuterDecoLevel = function (nodeName) {
    if (nodeName)
        this.nodeName = nodeName;
};
OuterDecoLevel.prototype = Object.create(null);
const noDeco = [new OuterDecoLevel];
function computeOuterDeco(outerDeco, node, needsWrap) {
    if (outerDeco.length == 0)
        return noDeco;
    let top = needsWrap ? noDeco[0] : new OuterDecoLevel, result = [top];
    for (let i = 0; i < outerDeco.length; i++) {
        let attrs = outerDeco[i].type.attrs;
        if (!attrs)
            continue;
        if (attrs.nodeName)
            result.push(top = new OuterDecoLevel(attrs.nodeName));
        for (let name in attrs) {
            let val = attrs[name];
            if (val == null)
                continue;
            if (needsWrap && result.length == 1)
                result.push(top = new OuterDecoLevel(node.isInline ? "span" : "div"));
            if (name == "class")
                top.class = (top.class ? top.class + " " : "") + val;
            else if (name == "style")
                top.style = (top.style ? top.style + ";" : "") + val;
            else if (name != "nodeName")
                top[name] = val;
        }
    }
    return result;
}
function patchOuterDeco(outerDOM, nodeDOM, prevComputed, curComputed) {
    // Shortcut for trivial case
    if (prevComputed == noDeco && curComputed == noDeco)
        return nodeDOM;
    let curDOM = nodeDOM;
    for (let i = 0; i < curComputed.length; i++) {
        let deco = curComputed[i], prev = prevComputed[i];
        if (i) {
            let parent;
            if (prev && prev.nodeName == deco.nodeName && curDOM != outerDOM &&
                (parent = curDOM.parentNode) && parent.nodeName.toLowerCase() == deco.nodeName) {
                curDOM = parent;
            }
            else {
                parent = document.createElement(deco.nodeName);
                parent.pmIsDeco = true;
                parent.appendChild(curDOM);
                prev = noDeco[0];
                curDOM = parent;
            }
        }
        patchAttributes(curDOM, prev || noDeco[0], deco);
    }
    return curDOM;
}
function patchAttributes(dom, prev, cur) {
    for (let name in prev)
        if (name != "class" && name != "style" && name != "nodeName" && !(name in cur))
            dom.removeAttribute(name);
    for (let name in cur)
        if (name != "class" && name != "style" && name != "nodeName" && cur[name] != prev[name])
            dom.setAttribute(name, cur[name]);
    if (prev.class != cur.class) {
        let prevList = prev.class ? prev.class.split(" ").filter(Boolean) : [];
        let curList = cur.class ? cur.class.split(" ").filter(Boolean) : [];
        for (let i = 0; i < prevList.length; i++)
            if (curList.indexOf(prevList[i]) == -1)
                dom.classList.remove(prevList[i]);
        for (let i = 0; i < curList.length; i++)
            if (prevList.indexOf(curList[i]) == -1)
                dom.classList.add(curList[i]);
        if (dom.classList.length == 0)
            dom.removeAttribute("class");
    }
    if (prev.style != cur.style) {
        if (prev.style) {
            let prop = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, m;
            while (m = prop.exec(prev.style))
                dom.style.removeProperty(m[1]);
        }
        if (cur.style)
            dom.style.cssText += cur.style;
    }
}
function applyOuterDeco(dom, deco, node) {
    return patchOuterDeco(dom, dom, noDeco, computeOuterDeco(deco, node, dom.nodeType != 1));
}
function sameOuterDeco(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!a[i].type.eq(b[i].type))
            return false;
    return true;
}
// Remove a DOM node and return its next sibling.
function rm(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
}
// Helper class for incrementally updating a tree of mark descs and
// the widget and node descs inside of them.
class ViewTreeUpdater {
    constructor(top, lock, view) {
        this.lock = lock;
        this.view = view;
        // Index into `this.top`'s child array, represents the current
        // update position.
        this.index = 0;
        // When entering a mark, the current top and index are pushed
        // onto this.
        this.stack = [];
        // Tracks whether anything was changed
        this.changed = false;
        this.top = top;
        this.preMatch = preMatch(top.node.content, top);
    }
    // Destroy and remove the children between the given indices in
    // `this.top`.
    destroyBetween(start, end) {
        if (start == end)
            return;
        for (let i = start; i < end; i++)
            this.top.children[i].destroy();
        this.top.children.splice(start, end - start);
        this.changed = true;
    }
    // Destroy all remaining children in `this.top`.
    destroyRest() {
        this.destroyBetween(this.index, this.top.children.length);
    }
    // Sync the current stack of mark descs with the given array of
    // marks, reusing existing mark descs when possible.
    syncToMarks(marks, inline, view) {
        let keep = 0, depth = this.stack.length >> 1;
        let maxKeep = Math.min(depth, marks.length);
        while (keep < maxKeep &&
            (keep == depth - 1 ? this.top : this.stack[(keep + 1) << 1])
                .matchesMark(marks[keep]) && marks[keep].type.spec.spanning !== false)
            keep++;
        while (keep < depth) {
            this.destroyRest();
            this.top.dirty = NOT_DIRTY;
            this.index = this.stack.pop();
            this.top = this.stack.pop();
            depth--;
        }
        while (depth < marks.length) {
            this.stack.push(this.top, this.index + 1);
            let found = -1;
            for (let i = this.index; i < Math.min(this.index + 3, this.top.children.length); i++) {
                let next = this.top.children[i];
                if (next.matchesMark(marks[depth]) && !this.isLocked(next.dom)) {
                    found = i;
                    break;
                }
            }
            if (found > -1) {
                if (found > this.index) {
                    this.changed = true;
                    this.destroyBetween(this.index, found);
                }
                this.top = this.top.children[this.index];
            }
            else {
                let markDesc = MarkViewDesc.create(this.top, marks[depth], inline, view);
                this.top.children.splice(this.index, 0, markDesc);
                this.top = markDesc;
                this.changed = true;
            }
            this.index = 0;
            depth++;
        }
    }
    // Try to find a node desc matching the given data. Skip over it and
    // return true when successful.
    findNodeMatch(node, outerDeco, innerDeco, index) {
        let found = -1, targetDesc;
        if (index >= this.preMatch.index &&
            (targetDesc = this.preMatch.matches[index - this.preMatch.index]).parent == this.top &&
            targetDesc.matchesNode(node, outerDeco, innerDeco)) {
            found = this.top.children.indexOf(targetDesc, this.index);
        }
        else {
            for (let i = this.index, e = Math.min(this.top.children.length, i + 5); i < e; i++) {
                let child = this.top.children[i];
                if (child.matchesNode(node, outerDeco, innerDeco) && !this.preMatch.matched.has(child)) {
                    found = i;
                    break;
                }
            }
        }
        if (found < 0)
            return false;
        this.destroyBetween(this.index, found);
        this.index++;
        return true;
    }
    updateNodeAt(node, outerDeco, innerDeco, index, view) {
        let child = this.top.children[index];
        if (child.dirty == NODE_DIRTY && child.dom == child.contentDOM)
            child.dirty = CONTENT_DIRTY;
        if (!child.update(node, outerDeco, innerDeco, view))
            return false;
        this.destroyBetween(this.index, index);
        this.index++;
        return true;
    }
    findIndexWithChild(domNode) {
        for (;;) {
            let parent = domNode.parentNode;
            if (!parent)
                return -1;
            if (parent == this.top.contentDOM) {
                let desc = domNode.pmViewDesc;
                if (desc)
                    for (let i = this.index; i < this.top.children.length; i++) {
                        if (this.top.children[i] == desc)
                            return i;
                    }
                return -1;
            }
            domNode = parent;
        }
    }
    // Try to update the next node, if any, to the given data. Checks
    // pre-matches to avoid overwriting nodes that could still be used.
    updateNextNode(node, outerDeco, innerDeco, view, index, pos) {
        for (let i = this.index; i < this.top.children.length; i++) {
            let next = this.top.children[i];
            if (next instanceof NodeViewDesc) {
                let preMatch = this.preMatch.matched.get(next);
                if (preMatch != null && preMatch != index)
                    return false;
                let nextDOM = next.dom, updated;
                // Can't update if nextDOM is or contains this.lock, except if
                // it's a text node whose content already matches the new text
                // and whose decorations match the new ones.
                let locked = this.isLocked(nextDOM) &&
                    !(node.isText && next.node && next.node.isText && next.nodeDOM.nodeValue == node.text &&
                        next.dirty != NODE_DIRTY && sameOuterDeco(outerDeco, next.outerDeco));
                if (!locked && next.update(node, outerDeco, innerDeco, view)) {
                    this.destroyBetween(this.index, i);
                    if (next.dom != nextDOM)
                        this.changed = true;
                    this.index++;
                    return true;
                }
                else if (!locked && (updated = this.recreateWrapper(next, node, outerDeco, innerDeco, view, pos))) {
                    this.top.children[this.index] = updated;
                    if (updated.contentDOM) {
                        updated.dirty = CONTENT_DIRTY;
                        updated.updateChildren(view, pos + 1);
                        updated.dirty = NOT_DIRTY;
                    }
                    this.changed = true;
                    this.index++;
                    return true;
                }
                break;
            }
        }
        return false;
    }
    // When a node with content is replaced by a different node with
    // identical content, move over its children.
    recreateWrapper(next, node, outerDeco, innerDeco, view, pos) {
        if (next.dirty || node.isAtom || !next.children.length ||
            !next.node.content.eq(node.content))
            return null;
        let wrapper = NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view, pos);
        if (wrapper.contentDOM) {
            wrapper.children = next.children;
            next.children = [];
            for (let ch of wrapper.children)
                ch.parent = wrapper;
        }
        next.destroy();
        return wrapper;
    }
    // Insert the node as a newly created node desc.
    addNode(node, outerDeco, innerDeco, view, pos) {
        let desc = NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view, pos);
        if (desc.contentDOM)
            desc.updateChildren(view, pos + 1);
        this.top.children.splice(this.index++, 0, desc);
        this.changed = true;
    }
    placeWidget(widget, view, pos) {
        let next = this.index < this.top.children.length ? this.top.children[this.index] : null;
        if (next && next.matchesWidget(widget) &&
            (widget == next.widget || !next.widget.type.toDOM.parentNode)) {
            this.index++;
        }
        else {
            let desc = new WidgetViewDesc(this.top, widget, view, pos);
            this.top.children.splice(this.index++, 0, desc);
            this.changed = true;
        }
    }
    // Make sure a textblock looks and behaves correctly in
    // contentEditable.
    addTextblockHacks() {
        let lastChild = this.top.children[this.index - 1], parent = this.top;
        while (lastChild instanceof MarkViewDesc) {
            parent = lastChild;
            lastChild = parent.children[parent.children.length - 1];
        }
        if (!lastChild || // Empty textblock
            !(lastChild instanceof TextViewDesc) ||
            /\n$/.test(lastChild.node.text) ||
            (this.view.requiresGeckoHackNode && /\s$/.test(lastChild.node.text))) {
            // Avoid bugs in Safari's cursor drawing (#1165) and Chrome's mouse selection (#1152)
            if ((safari || chrome) && lastChild && lastChild.dom.contentEditable == "false")
                this.addHackNode("IMG", parent);
            this.addHackNode("BR", this.top);
        }
    }
    addHackNode(nodeName, parent) {
        if (parent == this.top && this.index < parent.children.length && parent.children[this.index].matchesHack(nodeName)) {
            this.index++;
        }
        else {
            let dom = document.createElement(nodeName);
            if (nodeName == "IMG") {
                dom.className = "ProseMirror-separator";
                dom.alt = "";
            }
            if (nodeName == "BR")
                dom.className = "ProseMirror-trailingBreak";
            let hack = new TrailingHackViewDesc(this.top, [], dom, null);
            if (parent != this.top)
                parent.children.push(hack);
            else
                parent.children.splice(this.index++, 0, hack);
            this.changed = true;
        }
    }
    isLocked(node) {
        return this.lock && (node == this.lock || node.nodeType == 1 && node.contains(this.lock.parentNode));
    }
}
// Iterate from the end of the fragment and array of descs to find
// directly matching ones, in order to avoid overeagerly reusing those
// for other nodes. Returns the fragment index of the first node that
// is part of the sequence of matched nodes at the end of the
// fragment.
function preMatch(frag, parentDesc) {
    let curDesc = parentDesc, descI = curDesc.children.length;
    let fI = frag.childCount, matched = new Map, matches = [];
    outer: while (fI > 0) {
        let desc;
        for (;;) {
            if (descI) {
                let next = curDesc.children[descI - 1];
                if (next instanceof MarkViewDesc) {
                    curDesc = next;
                    descI = next.children.length;
                }
                else {
                    desc = next;
                    descI--;
                    break;
                }
            }
            else if (curDesc == parentDesc) {
                break outer;
            }
            else {
                // FIXME
                descI = curDesc.parent.children.indexOf(curDesc);
                curDesc = curDesc.parent;
            }
        }
        let node = desc.node;
        if (!node)
            continue;
        if (node != frag.child(fI - 1))
            break;
        --fI;
        matched.set(desc, fI);
        matches.push(desc);
    }
    return { index: fI, matched, matches: matches.reverse() };
}
function compareSide(a, b) {
    return a.type.side - b.type.side;
}
// This function abstracts iterating over the nodes and decorations in
// a fragment. Calls `onNode` for each node, with its local and child
// decorations. Splits text nodes when there is a decoration starting
// or ending inside of them. Calls `onWidget` for each widget.
function iterDeco(parent, deco, onWidget, onNode) {
    let locals = deco.locals(parent), offset = 0;
    // Simple, cheap variant for when there are no local decorations
    if (locals.length == 0) {
        for (let i = 0; i < parent.childCount; i++) {
            let child = parent.child(i);
            onNode(child, locals, deco.forChild(offset, child), i);
            offset += child.nodeSize;
        }
        return;
    }
    let decoIndex = 0, active = [], restNode = null;
    for (let parentIndex = 0;;) {
        let widget, widgets;
        while (decoIndex < locals.length && locals[decoIndex].to == offset) {
            let next = locals[decoIndex++];
            if (next.widget) {
                if (!widget)
                    widget = next;
                else
                    (widgets || (widgets = [widget])).push(next);
            }
        }
        if (widget) {
            if (widgets) {
                widgets.sort(compareSide);
                for (let i = 0; i < widgets.length; i++)
                    onWidget(widgets[i], parentIndex, !!restNode);
            }
            else {
                onWidget(widget, parentIndex, !!restNode);
            }
        }
        let child, index;
        if (restNode) {
            index = -1;
            child = restNode;
            restNode = null;
        }
        else if (parentIndex < parent.childCount) {
            index = parentIndex;
            child = parent.child(parentIndex++);
        }
        else {
            break;
        }
        for (let i = 0; i < active.length; i++)
            if (active[i].to <= offset)
                active.splice(i--, 1);
        while (decoIndex < locals.length && locals[decoIndex].from <= offset && locals[decoIndex].to > offset)
            active.push(locals[decoIndex++]);
        let end = offset + child.nodeSize;
        if (child.isText) {
            let cutAt = end;
            if (decoIndex < locals.length && locals[decoIndex].from < cutAt)
                cutAt = locals[decoIndex].from;
            for (let i = 0; i < active.length; i++)
                if (active[i].to < cutAt)
                    cutAt = active[i].to;
            if (cutAt < end) {
                restNode = child.cut(cutAt - offset);
                child = child.cut(0, cutAt - offset);
                end = cutAt;
                index = -1;
            }
        }
        let outerDeco = child.isInline && !child.isLeaf ? active.filter(d => !d.inline) : active.slice();
        onNode(child, outerDeco, deco.forChild(offset, child), index);
        offset = end;
    }
}
// List markers in Mobile Safari will mysteriously disappear
// sometimes. This works around that.
function iosHacks(dom) {
    if (dom.nodeName == "UL" || dom.nodeName == "OL") {
        let oldCSS = dom.style.cssText;
        dom.style.cssText = oldCSS + "; list-style: square !important";
        window.getComputedStyle(dom).listStyle;
        dom.style.cssText = oldCSS;
    }
}
function nearbyTextNode(node, offset) {
    for (;;) {
        if (node.nodeType == 3)
            return node;
        if (node.nodeType == 1 && offset > 0) {
            if (node.childNodes.length > offset && node.childNodes[offset].nodeType == 3)
                return node.childNodes[offset];
            node = node.childNodes[offset - 1];
            offset = nodeSize(node);
        }
        else if (node.nodeType == 1 && offset < node.childNodes.length) {
            node = node.childNodes[offset];
            offset = 0;
        }
        else {
            return null;
        }
    }
}
// Find a piece of text in an inline fragment, overlapping from-to
function findTextInFragment(frag, text, from, to) {
    for (let i = 0, pos = 0; i < frag.childCount && pos <= to;) {
        let child = frag.child(i++), childStart = pos;
        pos += child.nodeSize;
        if (!child.isText)
            continue;
        let str = child.text;
        while (i < frag.childCount) {
            let next = frag.child(i++);
            pos += next.nodeSize;
            if (!next.isText)
                break;
            str += next.text;
        }
        if (pos >= from) {
            if (pos >= to && str.slice(to - text.length - childStart, to - childStart) == text)
                return to - text.length;
            let found = childStart < to ? str.lastIndexOf(text, to - childStart - 1) : -1;
            if (found >= 0 && found + text.length + childStart >= from)
                return childStart + found;
            if (from == to && str.length >= (to + text.length) - childStart &&
                str.slice(to - childStart, to - childStart + text.length) == text)
                return to;
        }
    }
    return -1;
}
// Replace range from-to in an array of view descs with replacement
// (may be null to just delete). This goes very much against the grain
// of the rest of this code, which tends to create nodes with the
// right shape in one go, rather than messing with them after
// creation, but is necessary in the composition hack.
function replaceNodes(nodes, from, to, view, replacement) {
    let result = [];
    for (let i = 0, off = 0; i < nodes.length; i++) {
        let child = nodes[i], start = off, end = off += child.size;
        if (start >= to || end <= from) {
            result.push(child);
        }
        else {
            if (start < from)
                result.push(child.slice(0, from - start, view));
            if (replacement) {
                result.push(replacement);
                replacement = undefined;
            }
            if (end > to)
                result.push(child.slice(to - start, child.size, view));
        }
    }
    return result;
}

function selectionFromDOM(view, origin = null) {
    let domSel = view.domSelectionRange(), doc = view.state.doc;
    if (!domSel.focusNode)
        return null;
    let nearestDesc = view.docView.nearestDesc(domSel.focusNode), inWidget = nearestDesc && nearestDesc.size == 0;
    let head = view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset, 1);
    if (head < 0)
        return null;
    let $head = doc.resolve(head), $anchor, selection;
    if (selectionCollapsed(domSel)) {
        $anchor = $head;
        while (nearestDesc && !nearestDesc.node)
            nearestDesc = nearestDesc.parent;
        let nearestDescNode = nearestDesc.node;
        if (nearestDesc && nearestDescNode.isAtom && NodeSelection.isSelectable(nearestDescNode) && nearestDesc.parent
            && !(nearestDescNode.isInline && isOnEdge(domSel.focusNode, domSel.focusOffset, nearestDesc.dom))) {
            let pos = nearestDesc.posBefore;
            selection = new NodeSelection(head == pos ? $head : doc.resolve(pos));
        }
    }
    else {
        let anchor = view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset, 1);
        if (anchor < 0)
            return null;
        $anchor = doc.resolve(anchor);
    }
    if (!selection) {
        let bias = origin == "pointer" || (view.state.selection.head < $head.pos && !inWidget) ? 1 : -1;
        selection = selectionBetween(view, $anchor, $head, bias);
    }
    return selection;
}
function editorOwnsSelection(view) {
    return view.editable ? view.hasFocus() :
        hasSelection(view) && document.activeElement && document.activeElement.contains(view.dom);
}
function selectionToDOM(view, force = false) {
    let sel = view.state.selection;
    syncNodeSelection(view, sel);
    if (!editorOwnsSelection(view))
        return;
    // The delayed drag selection causes issues with Cell Selections
    // in Safari. And the drag selection delay is to workarond issues
    // which only present in Chrome.
    if (!force && view.input.mouseDown && view.input.mouseDown.allowDefault && chrome) {
        let domSel = view.domSelectionRange(), curSel = view.domObserver.currentSelection;
        if (domSel.anchorNode && curSel.anchorNode &&
            isEquivalentPosition(domSel.anchorNode, domSel.anchorOffset, curSel.anchorNode, curSel.anchorOffset)) {
            view.input.mouseDown.delayedSelectionSync = true;
            view.domObserver.setCurSelection();
            return;
        }
    }
    view.domObserver.disconnectSelection();
    if (view.cursorWrapper) {
        selectCursorWrapper(view);
    }
    else {
        let { anchor, head } = sel, resetEditableFrom, resetEditableTo;
        if (brokenSelectBetweenUneditable && !(sel instanceof TextSelection)) {
            if (!sel.$from.parent.inlineContent)
                resetEditableFrom = temporarilyEditableNear(view, sel.from);
            if (!sel.empty && !sel.$from.parent.inlineContent)
                resetEditableTo = temporarilyEditableNear(view, sel.to);
        }
        view.docView.setSelection(anchor, head, view.root, force);
        if (brokenSelectBetweenUneditable) {
            if (resetEditableFrom)
                resetEditable(resetEditableFrom);
            if (resetEditableTo)
                resetEditable(resetEditableTo);
        }
        if (sel.visible) {
            view.dom.classList.remove("ProseMirror-hideselection");
        }
        else {
            view.dom.classList.add("ProseMirror-hideselection");
            if ("onselectionchange" in document)
                removeClassOnSelectionChange(view);
        }
    }
    view.domObserver.setCurSelection();
    view.domObserver.connectSelection();
}
// Kludge to work around Webkit not allowing a selection to start/end
// between non-editable block nodes. We briefly make something
// editable, set the selection, then set it uneditable again.
const brokenSelectBetweenUneditable = safari || chrome && chrome_version < 63;
function temporarilyEditableNear(view, pos) {
    let { node, offset } = view.docView.domFromPos(pos, 0);
    let after = offset < node.childNodes.length ? node.childNodes[offset] : null;
    let before = offset ? node.childNodes[offset - 1] : null;
    if (safari && after && after.contentEditable == "false")
        return setEditable(after);
    if ((!after || after.contentEditable == "false") &&
        (!before || before.contentEditable == "false")) {
        if (after)
            return setEditable(after);
        else if (before)
            return setEditable(before);
    }
}
function setEditable(element) {
    element.contentEditable = "true";
    if (safari && element.draggable) {
        element.draggable = false;
        element.wasDraggable = true;
    }
    return element;
}
function resetEditable(element) {
    element.contentEditable = "false";
    if (element.wasDraggable) {
        element.draggable = true;
        element.wasDraggable = null;
    }
}
function removeClassOnSelectionChange(view) {
    let doc = view.dom.ownerDocument;
    doc.removeEventListener("selectionchange", view.input.hideSelectionGuard);
    let domSel = view.domSelectionRange();
    let node = domSel.anchorNode, offset = domSel.anchorOffset;
    doc.addEventListener("selectionchange", view.input.hideSelectionGuard = () => {
        if (domSel.anchorNode != node || domSel.anchorOffset != offset) {
            doc.removeEventListener("selectionchange", view.input.hideSelectionGuard);
            setTimeout(() => {
                if (!editorOwnsSelection(view) || view.state.selection.visible)
                    view.dom.classList.remove("ProseMirror-hideselection");
            }, 20);
        }
    });
}
function selectCursorWrapper(view) {
    let domSel = view.domSelection(), range = document.createRange();
    let node = view.cursorWrapper.dom, img = node.nodeName == "IMG";
    if (img)
        range.setEnd(node.parentNode, domIndex(node) + 1);
    else
        range.setEnd(node, 0);
    range.collapse(false);
    domSel.removeAllRanges();
    domSel.addRange(range);
    // Kludge to kill 'control selection' in IE11 when selecting an
    // invisible cursor wrapper, since that would result in those weird
    // resize handles and a selection that considers the absolutely
    // positioned wrapper, rather than the root editable node, the
    // focused element.
    if (!img && !view.state.selection.visible && ie$1 && ie_version <= 11) {
        node.disabled = true;
        node.disabled = false;
    }
}
function syncNodeSelection(view, sel) {
    if (sel instanceof NodeSelection) {
        let desc = view.docView.descAt(sel.from);
        if (desc != view.lastSelectedViewDesc) {
            clearNodeSelection(view);
            if (desc)
                desc.selectNode();
            view.lastSelectedViewDesc = desc;
        }
    }
    else {
        clearNodeSelection(view);
    }
}
// Clear all DOM statefulness of the last node selection.
function clearNodeSelection(view) {
    if (view.lastSelectedViewDesc) {
        if (view.lastSelectedViewDesc.parent)
            view.lastSelectedViewDesc.deselectNode();
        view.lastSelectedViewDesc = undefined;
    }
}
function selectionBetween(view, $anchor, $head, bias) {
    return view.someProp("createSelectionBetween", f => f(view, $anchor, $head))
        || TextSelection.between($anchor, $head, bias);
}
function hasFocusAndSelection(view) {
    if (view.editable && !view.hasFocus())
        return false;
    return hasSelection(view);
}
function hasSelection(view) {
    let sel = view.domSelectionRange();
    if (!sel.anchorNode)
        return false;
    try {
        // Firefox will raise 'permission denied' errors when accessing
        // properties of `sel.anchorNode` when it's in a generated CSS
        // element.
        return view.dom.contains(sel.anchorNode.nodeType == 3 ? sel.anchorNode.parentNode : sel.anchorNode) &&
            (view.editable || view.dom.contains(sel.focusNode.nodeType == 3 ? sel.focusNode.parentNode : sel.focusNode));
    }
    catch (_) {
        return false;
    }
}
function anchorInRightPlace(view) {
    let anchorDOM = view.docView.domFromPos(view.state.selection.anchor, 0);
    let domSel = view.domSelectionRange();
    return isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset);
}

function moveSelectionBlock(state, dir) {
    let { $anchor, $head } = state.selection;
    let $side = dir > 0 ? $anchor.max($head) : $anchor.min($head);
    let $start = !$side.parent.inlineContent ? $side : $side.depth ? state.doc.resolve(dir > 0 ? $side.after() : $side.before()) : null;
    return $start && Selection.findFrom($start, dir);
}
function apply(view, sel) {
    view.dispatch(view.state.tr.setSelection(sel).scrollIntoView());
    return true;
}
function selectHorizontally(view, dir, mods) {
    let sel = view.state.selection;
    if (sel instanceof TextSelection) {
        if (!sel.empty || mods.indexOf("s") > -1) {
            return false;
        }
        else if (view.endOfTextblock(dir > 0 ? "forward" : "backward")) {
            let next = moveSelectionBlock(view.state, dir);
            if (next && (next instanceof NodeSelection))
                return apply(view, next);
            return false;
        }
        else if (!(mac$2 && mods.indexOf("m") > -1)) {
            let $head = sel.$head, node = $head.textOffset ? null : dir < 0 ? $head.nodeBefore : $head.nodeAfter, desc;
            if (!node || node.isText)
                return false;
            let nodePos = dir < 0 ? $head.pos - node.nodeSize : $head.pos;
            if (!(node.isAtom || (desc = view.docView.descAt(nodePos)) && !desc.contentDOM))
                return false;
            if (NodeSelection.isSelectable(node)) {
                return apply(view, new NodeSelection(dir < 0 ? view.state.doc.resolve($head.pos - node.nodeSize) : $head));
            }
            else if (webkit) {
                // Chrome and Safari will introduce extra pointless cursor
                // positions around inline uneditable nodes, so we have to
                // take over and move the cursor past them (#937)
                return apply(view, new TextSelection(view.state.doc.resolve(dir < 0 ? nodePos : nodePos + node.nodeSize)));
            }
            else {
                return false;
            }
        }
    }
    else if (sel instanceof NodeSelection && sel.node.isInline) {
        return apply(view, new TextSelection(dir > 0 ? sel.$to : sel.$from));
    }
    else {
        let next = moveSelectionBlock(view.state, dir);
        if (next)
            return apply(view, next);
        return false;
    }
}
function nodeLen(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
function isIgnorable(dom, dir) {
    if (dom.contentEditable == "false")
        return true;
    let desc = dom.pmViewDesc;
    return desc && desc.size == 0 && (dir < 0 || dom.nextSibling || dom.nodeName != "BR");
}
function skipIgnoredNodes(view, dir) {
    return dir < 0 ? skipIgnoredNodesBefore(view) : skipIgnoredNodesAfter(view);
}
// Make sure the cursor isn't directly after one or more ignored
// nodes, which will confuse the browser's cursor motion logic.
function skipIgnoredNodesBefore(view) {
    let sel = view.domSelectionRange();
    let node = sel.focusNode, offset = sel.focusOffset;
    if (!node)
        return;
    let moveNode, moveOffset, force = false;
    // Gecko will do odd things when the selection is directly in front
    // of a non-editable node, so in that case, move it into the next
    // node if possible. Issue prosemirror/prosemirror#832.
    if (gecko && node.nodeType == 1 && offset < nodeLen(node) && isIgnorable(node.childNodes[offset], -1))
        force = true;
    for (;;) {
        if (offset > 0) {
            if (node.nodeType != 1) {
                break;
            }
            else {
                let before = node.childNodes[offset - 1];
                if (isIgnorable(before, -1)) {
                    moveNode = node;
                    moveOffset = --offset;
                }
                else if (before.nodeType == 3) {
                    node = before;
                    offset = node.nodeValue.length;
                }
                else
                    break;
            }
        }
        else if (isBlockNode(node)) {
            break;
        }
        else {
            let prev = node.previousSibling;
            while (prev && isIgnorable(prev, -1)) {
                moveNode = node.parentNode;
                moveOffset = domIndex(prev);
                prev = prev.previousSibling;
            }
            if (!prev) {
                node = node.parentNode;
                if (node == view.dom)
                    break;
                offset = 0;
            }
            else {
                node = prev;
                offset = nodeLen(node);
            }
        }
    }
    if (force)
        setSelFocus(view, node, offset);
    else if (moveNode)
        setSelFocus(view, moveNode, moveOffset);
}
// Make sure the cursor isn't directly before one or more ignored
// nodes.
function skipIgnoredNodesAfter(view) {
    let sel = view.domSelectionRange();
    let node = sel.focusNode, offset = sel.focusOffset;
    if (!node)
        return;
    let len = nodeLen(node);
    let moveNode, moveOffset;
    for (;;) {
        if (offset < len) {
            if (node.nodeType != 1)
                break;
            let after = node.childNodes[offset];
            if (isIgnorable(after, 1)) {
                moveNode = node;
                moveOffset = ++offset;
            }
            else
                break;
        }
        else if (isBlockNode(node)) {
            break;
        }
        else {
            let next = node.nextSibling;
            while (next && isIgnorable(next, 1)) {
                moveNode = next.parentNode;
                moveOffset = domIndex(next) + 1;
                next = next.nextSibling;
            }
            if (!next) {
                node = node.parentNode;
                if (node == view.dom)
                    break;
                offset = len = 0;
            }
            else {
                node = next;
                offset = 0;
                len = nodeLen(node);
            }
        }
    }
    if (moveNode)
        setSelFocus(view, moveNode, moveOffset);
}
function isBlockNode(dom) {
    let desc = dom.pmViewDesc;
    return desc && desc.node && desc.node.isBlock;
}
function textNodeAfter(node, offset) {
    while (node && offset == node.childNodes.length && !hasBlockDesc(node)) {
        offset = domIndex(node) + 1;
        node = node.parentNode;
    }
    while (node && offset < node.childNodes.length) {
        let next = node.childNodes[offset];
        if (next.nodeType == 3)
            return next;
        if (next.nodeType == 1 && next.contentEditable == "false")
            break;
        node = next;
        offset = 0;
    }
}
function textNodeBefore(node, offset) {
    while (node && !offset && !hasBlockDesc(node)) {
        offset = domIndex(node);
        node = node.parentNode;
    }
    while (node && offset) {
        let next = node.childNodes[offset - 1];
        if (next.nodeType == 3)
            return next;
        if (next.nodeType == 1 && next.contentEditable == "false")
            break;
        node = next;
        offset = node.childNodes.length;
    }
}
function setSelFocus(view, node, offset) {
    if (node.nodeType != 3) {
        let before, after;
        if (after = textNodeAfter(node, offset)) {
            node = after;
            offset = 0;
        }
        else if (before = textNodeBefore(node, offset)) {
            node = before;
            offset = before.nodeValue.length;
        }
    }
    let sel = view.domSelection();
    if (selectionCollapsed(sel)) {
        let range = document.createRange();
        range.setEnd(node, offset);
        range.setStart(node, offset);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    else if (sel.extend) {
        sel.extend(node, offset);
    }
    view.domObserver.setCurSelection();
    let { state } = view;
    // If no state update ends up happening, reset the selection.
    setTimeout(() => {
        if (view.state == state)
            selectionToDOM(view);
    }, 50);
}
function findDirection(view, pos) {
    let $pos = view.state.doc.resolve(pos);
    if (!(chrome || windows) && $pos.parent.inlineContent) {
        let coords = view.coordsAtPos(pos);
        if (pos > $pos.start()) {
            let before = view.coordsAtPos(pos - 1);
            let mid = (before.top + before.bottom) / 2;
            if (mid > coords.top && mid < coords.bottom && Math.abs(before.left - coords.left) > 1)
                return before.left < coords.left ? "ltr" : "rtl";
        }
        if (pos < $pos.end()) {
            let after = view.coordsAtPos(pos + 1);
            let mid = (after.top + after.bottom) / 2;
            if (mid > coords.top && mid < coords.bottom && Math.abs(after.left - coords.left) > 1)
                return after.left > coords.left ? "ltr" : "rtl";
        }
    }
    let computed = getComputedStyle(view.dom).direction;
    return computed == "rtl" ? "rtl" : "ltr";
}
// Check whether vertical selection motion would involve node
// selections. If so, apply it (if not, the result is left to the
// browser)
function selectVertically(view, dir, mods) {
    let sel = view.state.selection;
    if (sel instanceof TextSelection && !sel.empty || mods.indexOf("s") > -1)
        return false;
    if (mac$2 && mods.indexOf("m") > -1)
        return false;
    let { $from, $to } = sel;
    if (!$from.parent.inlineContent || view.endOfTextblock(dir < 0 ? "up" : "down")) {
        let next = moveSelectionBlock(view.state, dir);
        if (next && (next instanceof NodeSelection))
            return apply(view, next);
    }
    if (!$from.parent.inlineContent) {
        let side = dir < 0 ? $from : $to;
        let beyond = sel instanceof AllSelection ? Selection.near(side, dir) : Selection.findFrom(side, dir);
        return beyond ? apply(view, beyond) : false;
    }
    return false;
}
function stopNativeHorizontalDelete(view, dir) {
    if (!(view.state.selection instanceof TextSelection))
        return true;
    let { $head, $anchor, empty } = view.state.selection;
    if (!$head.sameParent($anchor))
        return true;
    if (!empty)
        return false;
    if (view.endOfTextblock(dir > 0 ? "forward" : "backward"))
        return true;
    let nextNode = !$head.textOffset && (dir < 0 ? $head.nodeBefore : $head.nodeAfter);
    if (nextNode && !nextNode.isText) {
        let tr = view.state.tr;
        if (dir < 0)
            tr.delete($head.pos - nextNode.nodeSize, $head.pos);
        else
            tr.delete($head.pos, $head.pos + nextNode.nodeSize);
        view.dispatch(tr);
        return true;
    }
    return false;
}
function switchEditable(view, node, state) {
    view.domObserver.stop();
    node.contentEditable = state;
    view.domObserver.start();
}
// Issue #867 / #1090 / https://bugs.chromium.org/p/chromium/issues/detail?id=903821
// In which Safari (and at some point in the past, Chrome) does really
// wrong things when the down arrow is pressed when the cursor is
// directly at the start of a textblock and has an uneditable node
// after it
function safariDownArrowBug(view) {
    if (!safari || view.state.selection.$head.parentOffset > 0)
        return false;
    let { focusNode, focusOffset } = view.domSelectionRange();
    if (focusNode && focusNode.nodeType == 1 && focusOffset == 0 &&
        focusNode.firstChild && focusNode.firstChild.contentEditable == "false") {
        let child = focusNode.firstChild;
        switchEditable(view, child, "true");
        setTimeout(() => switchEditable(view, child, "false"), 20);
    }
    return false;
}
// A backdrop key mapping used to make sure we always suppress keys
// that have a dangerous default effect, even if the commands they are
// bound to return false, and to make sure that cursor-motion keys
// find a cursor (as opposed to a node selection) when pressed. For
// cursor-motion keys, the code in the handlers also takes care of
// block selections.
function getMods(event) {
    let result = "";
    if (event.ctrlKey)
        result += "c";
    if (event.metaKey)
        result += "m";
    if (event.altKey)
        result += "a";
    if (event.shiftKey)
        result += "s";
    return result;
}
function captureKeyDown(view, event) {
    let code = event.keyCode, mods = getMods(event);
    if (code == 8 || (mac$2 && code == 72 && mods == "c")) { // Backspace, Ctrl-h on Mac
        return stopNativeHorizontalDelete(view, -1) || skipIgnoredNodes(view, -1);
    }
    else if ((code == 46 && !event.shiftKey) || (mac$2 && code == 68 && mods == "c")) { // Delete, Ctrl-d on Mac
        return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodes(view, 1);
    }
    else if (code == 13 || code == 27) { // Enter, Esc
        return true;
    }
    else if (code == 37 || (mac$2 && code == 66 && mods == "c")) { // Left arrow, Ctrl-b on Mac
        let dir = code == 37 ? (findDirection(view, view.state.selection.from) == "ltr" ? -1 : 1) : -1;
        return selectHorizontally(view, dir, mods) || skipIgnoredNodes(view, dir);
    }
    else if (code == 39 || (mac$2 && code == 70 && mods == "c")) { // Right arrow, Ctrl-f on Mac
        let dir = code == 39 ? (findDirection(view, view.state.selection.from) == "ltr" ? 1 : -1) : 1;
        return selectHorizontally(view, dir, mods) || skipIgnoredNodes(view, dir);
    }
    else if (code == 38 || (mac$2 && code == 80 && mods == "c")) { // Up arrow, Ctrl-p on Mac
        return selectVertically(view, -1, mods) || skipIgnoredNodes(view, -1);
    }
    else if (code == 40 || (mac$2 && code == 78 && mods == "c")) { // Down arrow, Ctrl-n on Mac
        return safariDownArrowBug(view) || selectVertically(view, 1, mods) || skipIgnoredNodes(view, 1);
    }
    else if (mods == (mac$2 ? "m" : "c") &&
        (code == 66 || code == 73 || code == 89 || code == 90)) { // Mod-[biyz]
        return true;
    }
    return false;
}

function serializeForClipboard(view, slice) {
    view.someProp("transformCopied", f => { slice = f(slice, view); });
    let context = [], { content, openStart, openEnd } = slice;
    while (openStart > 1 && openEnd > 1 && content.childCount == 1 && content.firstChild.childCount == 1) {
        openStart--;
        openEnd--;
        let node = content.firstChild;
        context.push(node.type.name, node.attrs != node.type.defaultAttrs ? node.attrs : null);
        content = node.content;
    }
    let serializer = view.someProp("clipboardSerializer") || DOMSerializer.fromSchema(view.state.schema);
    let doc = detachedDoc(), wrap = doc.createElement("div");
    wrap.appendChild(serializer.serializeFragment(content, { document: doc }));
    let firstChild = wrap.firstChild, needsWrap, wrappers = 0;
    while (firstChild && firstChild.nodeType == 1 && (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])) {
        for (let i = needsWrap.length - 1; i >= 0; i--) {
            let wrapper = doc.createElement(needsWrap[i]);
            while (wrap.firstChild)
                wrapper.appendChild(wrap.firstChild);
            wrap.appendChild(wrapper);
            wrappers++;
        }
        firstChild = wrap.firstChild;
    }
    if (firstChild && firstChild.nodeType == 1)
        firstChild.setAttribute("data-pm-slice", `${openStart} ${openEnd}${wrappers ? ` -${wrappers}` : ""} ${JSON.stringify(context)}`);
    let text = view.someProp("clipboardTextSerializer", f => f(slice, view)) ||
        slice.content.textBetween(0, slice.content.size, "\n\n");
    return { dom: wrap, text };
}
// Read a slice of content from the clipboard (or drop data).
function parseFromClipboard(view, text, html, plainText, $context) {
    let inCode = $context.parent.type.spec.code;
    let dom, slice;
    if (!html && !text)
        return null;
    let asText = text && (plainText || inCode || !html);
    if (asText) {
        view.someProp("transformPastedText", f => { text = f(text, inCode || plainText, view); });
        if (inCode)
            return text ? new Slice(Fragment.from(view.state.schema.text(text.replace(/\r\n?/g, "\n"))), 0, 0) : Slice.empty;
        let parsed = view.someProp("clipboardTextParser", f => f(text, $context, plainText, view));
        if (parsed) {
            slice = parsed;
        }
        else {
            let marks = $context.marks();
            let { schema } = view.state, serializer = DOMSerializer.fromSchema(schema);
            dom = document.createElement("div");
            text.split(/(?:\r\n?|\n)+/).forEach(block => {
                let p = dom.appendChild(document.createElement("p"));
                if (block)
                    p.appendChild(serializer.serializeNode(schema.text(block, marks)));
            });
        }
    }
    else {
        view.someProp("transformPastedHTML", f => { html = f(html, view); });
        dom = readHTML(html);
        if (webkit)
            restoreReplacedSpaces(dom);
    }
    let contextNode = dom && dom.querySelector("[data-pm-slice]");
    let sliceData = contextNode && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(contextNode.getAttribute("data-pm-slice") || "");
    if (sliceData && sliceData[3])
        for (let i = +sliceData[3]; i > 0; i--) {
            let child = dom.firstChild;
            while (child && child.nodeType != 1)
                child = child.nextSibling;
            if (!child)
                break;
            dom = child;
        }
    if (!slice) {
        let parser = view.someProp("clipboardParser") || view.someProp("domParser") || DOMParser.fromSchema(view.state.schema);
        slice = parser.parseSlice(dom, {
            preserveWhitespace: !!(asText || sliceData),
            context: $context,
            ruleFromNode(dom) {
                if (dom.nodeName == "BR" && !dom.nextSibling &&
                    dom.parentNode && !inlineParents.test(dom.parentNode.nodeName))
                    return { ignore: true };
                return null;
            }
        });
    }
    if (sliceData) {
        slice = addContext(closeSlice(slice, +sliceData[1], +sliceData[2]), sliceData[4]);
    }
    else { // HTML wasn't created by ProseMirror. Make sure top-level siblings are coherent
        slice = Slice.maxOpen(normalizeSiblings(slice.content, $context), true);
        if (slice.openStart || slice.openEnd) {
            let openStart = 0, openEnd = 0;
            for (let node = slice.content.firstChild; openStart < slice.openStart && !node.type.spec.isolating; openStart++, node = node.firstChild) { }
            for (let node = slice.content.lastChild; openEnd < slice.openEnd && !node.type.spec.isolating; openEnd++, node = node.lastChild) { }
            slice = closeSlice(slice, openStart, openEnd);
        }
    }
    view.someProp("transformPasted", f => { slice = f(slice, view); });
    return slice;
}
const inlineParents = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
// Takes a slice parsed with parseSlice, which means there hasn't been
// any content-expression checking done on the top nodes, tries to
// find a parent node in the current context that might fit the nodes,
// and if successful, rebuilds the slice so that it fits into that parent.
//
// This addresses the problem that Transform.replace expects a
// coherent slice, and will fail to place a set of siblings that don't
// fit anywhere in the schema.
function normalizeSiblings(fragment, $context) {
    if (fragment.childCount < 2)
        return fragment;
    for (let d = $context.depth; d >= 0; d--) {
        let parent = $context.node(d);
        let match = parent.contentMatchAt($context.index(d));
        let lastWrap, result = [];
        fragment.forEach(node => {
            if (!result)
                return;
            let wrap = match.findWrapping(node.type), inLast;
            if (!wrap)
                return result = null;
            if (inLast = result.length && lastWrap.length && addToSibling(wrap, lastWrap, node, result[result.length - 1], 0)) {
                result[result.length - 1] = inLast;
            }
            else {
                if (result.length)
                    result[result.length - 1] = closeRight(result[result.length - 1], lastWrap.length);
                let wrapped = withWrappers(node, wrap);
                result.push(wrapped);
                match = match.matchType(wrapped.type);
                lastWrap = wrap;
            }
        });
        if (result)
            return Fragment.from(result);
    }
    return fragment;
}
function withWrappers(node, wrap, from = 0) {
    for (let i = wrap.length - 1; i >= from; i--)
        node = wrap[i].create(null, Fragment.from(node));
    return node;
}
// Used to group adjacent nodes wrapped in similar parents by
// normalizeSiblings into the same parent node
function addToSibling(wrap, lastWrap, node, sibling, depth) {
    if (depth < wrap.length && depth < lastWrap.length && wrap[depth] == lastWrap[depth]) {
        let inner = addToSibling(wrap, lastWrap, node, sibling.lastChild, depth + 1);
        if (inner)
            return sibling.copy(sibling.content.replaceChild(sibling.childCount - 1, inner));
        let match = sibling.contentMatchAt(sibling.childCount);
        if (match.matchType(depth == wrap.length - 1 ? node.type : wrap[depth + 1]))
            return sibling.copy(sibling.content.append(Fragment.from(withWrappers(node, wrap, depth + 1))));
    }
}
function closeRight(node, depth) {
    if (depth == 0)
        return node;
    let fragment = node.content.replaceChild(node.childCount - 1, closeRight(node.lastChild, depth - 1));
    let fill = node.contentMatchAt(node.childCount).fillBefore(Fragment.empty, true);
    return node.copy(fragment.append(fill));
}
function closeRange(fragment, side, from, to, depth, openEnd) {
    let node = side < 0 ? fragment.firstChild : fragment.lastChild, inner = node.content;
    if (fragment.childCount > 1)
        openEnd = 0;
    if (depth < to - 1)
        inner = closeRange(inner, side, from, to, depth + 1, openEnd);
    if (depth >= from)
        inner = side < 0 ? node.contentMatchAt(0).fillBefore(inner, openEnd <= depth).append(inner)
            : inner.append(node.contentMatchAt(node.childCount).fillBefore(Fragment.empty, true));
    return fragment.replaceChild(side < 0 ? 0 : fragment.childCount - 1, node.copy(inner));
}
function closeSlice(slice, openStart, openEnd) {
    if (openStart < slice.openStart)
        slice = new Slice(closeRange(slice.content, -1, openStart, slice.openStart, 0, slice.openEnd), openStart, slice.openEnd);
    if (openEnd < slice.openEnd)
        slice = new Slice(closeRange(slice.content, 1, openEnd, slice.openEnd, 0, 0), slice.openStart, openEnd);
    return slice;
}
// Trick from jQuery -- some elements must be wrapped in other
// elements for innerHTML to work. I.e. if you do `div.innerHTML =
// "<td>..</td>"` the table cells are ignored.
const wrapMap = {
    thead: ["table"],
    tbody: ["table"],
    tfoot: ["table"],
    caption: ["table"],
    colgroup: ["table"],
    col: ["table", "colgroup"],
    tr: ["table", "tbody"],
    td: ["table", "tbody", "tr"],
    th: ["table", "tbody", "tr"]
};
let _detachedDoc = null;
function detachedDoc() {
    return _detachedDoc || (_detachedDoc = document.implementation.createHTMLDocument("title"));
}
function readHTML(html) {
    let metas = /^(\s*<meta [^>]*>)*/.exec(html);
    if (metas)
        html = html.slice(metas[0].length);
    let elt = detachedDoc().createElement("div");
    let firstTag = /<([a-z][^>\s]+)/i.exec(html), wrap;
    if (wrap = firstTag && wrapMap[firstTag[1].toLowerCase()])
        html = wrap.map(n => "<" + n + ">").join("") + html + wrap.map(n => "</" + n + ">").reverse().join("");
    elt.innerHTML = html;
    if (wrap)
        for (let i = 0; i < wrap.length; i++)
            elt = elt.querySelector(wrap[i]) || elt;
    return elt;
}
// Webkit browsers do some hard-to-predict replacement of regular
// spaces with non-breaking spaces when putting content on the
// clipboard. This tries to convert such non-breaking spaces (which
// will be wrapped in a plain span on Chrome, a span with class
// Apple-converted-space on Safari) back to regular spaces.
function restoreReplacedSpaces(dom) {
    let nodes = dom.querySelectorAll(chrome ? "span:not([class]):not([style])" : "span.Apple-converted-space");
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.childNodes.length == 1 && node.textContent == "\u00a0" && node.parentNode)
            node.parentNode.replaceChild(dom.ownerDocument.createTextNode(" "), node);
    }
}
function addContext(slice, context) {
    if (!slice.size)
        return slice;
    let schema = slice.content.firstChild.type.schema, array;
    try {
        array = JSON.parse(context);
    }
    catch (e) {
        return slice;
    }
    let { content, openStart, openEnd } = slice;
    for (let i = array.length - 2; i >= 0; i -= 2) {
        let type = schema.nodes[array[i]];
        if (!type || type.hasRequiredAttrs())
            break;
        content = Fragment.from(type.create(array[i + 1], content));
        openStart++;
        openEnd++;
    }
    return new Slice(content, openStart, openEnd);
}

// A collection of DOM events that occur within the editor, and callback functions
// to invoke when the event fires.
const handlers = {};
const editHandlers = {};
const passiveHandlers = { touchstart: true, touchmove: true };
class InputState {
    constructor() {
        this.shiftKey = false;
        this.mouseDown = null;
        this.lastKeyCode = null;
        this.lastKeyCodeTime = 0;
        this.lastClick = { time: 0, x: 0, y: 0, type: "" };
        this.lastSelectionOrigin = null;
        this.lastSelectionTime = 0;
        this.lastIOSEnter = 0;
        this.lastIOSEnterFallbackTimeout = -1;
        this.lastFocus = 0;
        this.lastTouch = 0;
        this.lastAndroidDelete = 0;
        this.composing = false;
        this.composingTimeout = -1;
        this.compositionNodes = [];
        this.compositionEndedAt = -2e8;
        this.compositionID = 1;
        // Set to a composition ID when there are pending changes at compositionend
        this.compositionPendingChanges = 0;
        this.domChangeCount = 0;
        this.eventHandlers = Object.create(null);
        this.hideSelectionGuard = null;
    }
}
function initInput(view) {
    for (let event in handlers) {
        let handler = handlers[event];
        view.dom.addEventListener(event, view.input.eventHandlers[event] = (event) => {
            if (eventBelongsToView(view, event) && !runCustomHandler(view, event) &&
                (view.editable || !(event.type in editHandlers)))
                handler(view, event);
        }, passiveHandlers[event] ? { passive: true } : undefined);
    }
    // On Safari, for reasons beyond my understanding, adding an input
    // event handler makes an issue where the composition vanishes when
    // you press enter go away.
    if (safari)
        view.dom.addEventListener("input", () => null);
    ensureListeners(view);
}
function setSelectionOrigin(view, origin) {
    view.input.lastSelectionOrigin = origin;
    view.input.lastSelectionTime = Date.now();
}
function destroyInput(view) {
    view.domObserver.stop();
    for (let type in view.input.eventHandlers)
        view.dom.removeEventListener(type, view.input.eventHandlers[type]);
    clearTimeout(view.input.composingTimeout);
    clearTimeout(view.input.lastIOSEnterFallbackTimeout);
}
function ensureListeners(view) {
    view.someProp("handleDOMEvents", currentHandlers => {
        for (let type in currentHandlers)
            if (!view.input.eventHandlers[type])
                view.dom.addEventListener(type, view.input.eventHandlers[type] = event => runCustomHandler(view, event));
    });
}
function runCustomHandler(view, event) {
    return view.someProp("handleDOMEvents", handlers => {
        let handler = handlers[event.type];
        return handler ? handler(view, event) || event.defaultPrevented : false;
    });
}
function eventBelongsToView(view, event) {
    if (!event.bubbles)
        return true;
    if (event.defaultPrevented)
        return false;
    for (let node = event.target; node != view.dom; node = node.parentNode)
        if (!node || node.nodeType == 11 ||
            (node.pmViewDesc && node.pmViewDesc.stopEvent(event)))
            return false;
    return true;
}
function dispatchEvent(view, event) {
    if (!runCustomHandler(view, event) && handlers[event.type] &&
        (view.editable || !(event.type in editHandlers)))
        handlers[event.type](view, event);
}
editHandlers.keydown = (view, _event) => {
    let event = _event;
    view.input.shiftKey = event.keyCode == 16 || event.shiftKey;
    if (inOrNearComposition(view, event))
        return;
    view.input.lastKeyCode = event.keyCode;
    view.input.lastKeyCodeTime = Date.now();
    // Suppress enter key events on Chrome Android, because those tend
    // to be part of a confused sequence of composition events fired,
    // and handling them eagerly tends to corrupt the input.
    if (android && chrome && event.keyCode == 13)
        return;
    if (event.keyCode != 229)
        view.domObserver.forceFlush();
    // On iOS, if we preventDefault enter key presses, the virtual
    // keyboard gets confused. So the hack here is to set a flag that
    // makes the DOM change code recognize that what just happens should
    // be replaced by whatever the Enter key handlers do.
    if (ios && event.keyCode == 13 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        let now = Date.now();
        view.input.lastIOSEnter = now;
        view.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
            if (view.input.lastIOSEnter == now) {
                view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter")));
                view.input.lastIOSEnter = 0;
            }
        }, 200);
    }
    else if (view.someProp("handleKeyDown", f => f(view, event)) || captureKeyDown(view, event)) {
        event.preventDefault();
    }
    else {
        setSelectionOrigin(view, "key");
    }
};
editHandlers.keyup = (view, event) => {
    if (event.keyCode == 16)
        view.input.shiftKey = false;
};
editHandlers.keypress = (view, _event) => {
    let event = _event;
    if (inOrNearComposition(view, event) || !event.charCode ||
        event.ctrlKey && !event.altKey || mac$2 && event.metaKey)
        return;
    if (view.someProp("handleKeyPress", f => f(view, event))) {
        event.preventDefault();
        return;
    }
    let sel = view.state.selection;
    if (!(sel instanceof TextSelection) || !sel.$from.sameParent(sel.$to)) {
        let text = String.fromCharCode(event.charCode);
        if (!/[\r\n]/.test(text) && !view.someProp("handleTextInput", f => f(view, sel.$from.pos, sel.$to.pos, text)))
            view.dispatch(view.state.tr.insertText(text).scrollIntoView());
        event.preventDefault();
    }
};
function eventCoords(event) { return { left: event.clientX, top: event.clientY }; }
function isNear(event, click) {
    let dx = click.x - event.clientX, dy = click.y - event.clientY;
    return dx * dx + dy * dy < 100;
}
function runHandlerOnContext(view, propName, pos, inside, event) {
    if (inside == -1)
        return false;
    let $pos = view.state.doc.resolve(inside);
    for (let i = $pos.depth + 1; i > 0; i--) {
        if (view.someProp(propName, f => i > $pos.depth ? f(view, pos, $pos.nodeAfter, $pos.before(i), event, true)
            : f(view, pos, $pos.node(i), $pos.before(i), event, false)))
            return true;
    }
    return false;
}
function updateSelection(view, selection, origin) {
    if (!view.focused)
        view.focus();
    let tr = view.state.tr.setSelection(selection);
    if (origin == "pointer")
        tr.setMeta("pointer", true);
    view.dispatch(tr);
}
function selectClickedLeaf(view, inside) {
    if (inside == -1)
        return false;
    let $pos = view.state.doc.resolve(inside), node = $pos.nodeAfter;
    if (node && node.isAtom && NodeSelection.isSelectable(node)) {
        updateSelection(view, new NodeSelection($pos), "pointer");
        return true;
    }
    return false;
}
function selectClickedNode(view, inside) {
    if (inside == -1)
        return false;
    let sel = view.state.selection, selectedNode, selectAt;
    if (sel instanceof NodeSelection)
        selectedNode = sel.node;
    let $pos = view.state.doc.resolve(inside);
    for (let i = $pos.depth + 1; i > 0; i--) {
        let node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
        if (NodeSelection.isSelectable(node)) {
            if (selectedNode && sel.$from.depth > 0 &&
                i >= sel.$from.depth && $pos.before(sel.$from.depth + 1) == sel.$from.pos)
                selectAt = $pos.before(sel.$from.depth);
            else
                selectAt = $pos.before(i);
            break;
        }
    }
    if (selectAt != null) {
        updateSelection(view, NodeSelection.create(view.state.doc, selectAt), "pointer");
        return true;
    }
    else {
        return false;
    }
}
function handleSingleClick(view, pos, inside, event, selectNode) {
    return runHandlerOnContext(view, "handleClickOn", pos, inside, event) ||
        view.someProp("handleClick", f => f(view, pos, event)) ||
        (selectNode ? selectClickedNode(view, inside) : selectClickedLeaf(view, inside));
}
function handleDoubleClick(view, pos, inside, event) {
    return runHandlerOnContext(view, "handleDoubleClickOn", pos, inside, event) ||
        view.someProp("handleDoubleClick", f => f(view, pos, event));
}
function handleTripleClick(view, pos, inside, event) {
    return runHandlerOnContext(view, "handleTripleClickOn", pos, inside, event) ||
        view.someProp("handleTripleClick", f => f(view, pos, event)) ||
        defaultTripleClick(view, inside, event);
}
function defaultTripleClick(view, inside, event) {
    if (event.button != 0)
        return false;
    let doc = view.state.doc;
    if (inside == -1) {
        if (doc.inlineContent) {
            updateSelection(view, TextSelection.create(doc, 0, doc.content.size), "pointer");
            return true;
        }
        return false;
    }
    let $pos = doc.resolve(inside);
    for (let i = $pos.depth + 1; i > 0; i--) {
        let node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
        let nodePos = $pos.before(i);
        if (node.inlineContent)
            updateSelection(view, TextSelection.create(doc, nodePos + 1, nodePos + 1 + node.content.size), "pointer");
        else if (NodeSelection.isSelectable(node))
            updateSelection(view, NodeSelection.create(doc, nodePos), "pointer");
        else
            continue;
        return true;
    }
}
function forceDOMFlush(view) {
    return endComposition(view);
}
const selectNodeModifier = mac$2 ? "metaKey" : "ctrlKey";
handlers.mousedown = (view, _event) => {
    let event = _event;
    view.input.shiftKey = event.shiftKey;
    let flushed = forceDOMFlush(view);
    let now = Date.now(), type = "singleClick";
    if (now - view.input.lastClick.time < 500 && isNear(event, view.input.lastClick) && !event[selectNodeModifier]) {
        if (view.input.lastClick.type == "singleClick")
            type = "doubleClick";
        else if (view.input.lastClick.type == "doubleClick")
            type = "tripleClick";
    }
    view.input.lastClick = { time: now, x: event.clientX, y: event.clientY, type };
    let pos = view.posAtCoords(eventCoords(event));
    if (!pos)
        return;
    if (type == "singleClick") {
        if (view.input.mouseDown)
            view.input.mouseDown.done();
        view.input.mouseDown = new MouseDown(view, pos, event, !!flushed);
    }
    else if ((type == "doubleClick" ? handleDoubleClick : handleTripleClick)(view, pos.pos, pos.inside, event)) {
        event.preventDefault();
    }
    else {
        setSelectionOrigin(view, "pointer");
    }
};
class MouseDown {
    constructor(view, pos, event, flushed) {
        this.view = view;
        this.pos = pos;
        this.event = event;
        this.flushed = flushed;
        this.delayedSelectionSync = false;
        this.mightDrag = null;
        this.startDoc = view.state.doc;
        this.selectNode = !!event[selectNodeModifier];
        this.allowDefault = event.shiftKey;
        let targetNode, targetPos;
        if (pos.inside > -1) {
            targetNode = view.state.doc.nodeAt(pos.inside);
            targetPos = pos.inside;
        }
        else {
            let $pos = view.state.doc.resolve(pos.pos);
            targetNode = $pos.parent;
            targetPos = $pos.depth ? $pos.before() : 0;
        }
        const target = flushed ? null : event.target;
        const targetDesc = target ? view.docView.nearestDesc(target, true) : null;
        this.target = targetDesc ? targetDesc.dom : null;
        let { selection } = view.state;
        if (event.button == 0 &&
            targetNode.type.spec.draggable && targetNode.type.spec.selectable !== false ||
            selection instanceof NodeSelection && selection.from <= targetPos && selection.to > targetPos)
            this.mightDrag = {
                node: targetNode,
                pos: targetPos,
                addAttr: !!(this.target && !this.target.draggable),
                setUneditable: !!(this.target && gecko && !this.target.hasAttribute("contentEditable"))
            };
        if (this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable)) {
            this.view.domObserver.stop();
            if (this.mightDrag.addAttr)
                this.target.draggable = true;
            if (this.mightDrag.setUneditable)
                setTimeout(() => {
                    if (this.view.input.mouseDown == this)
                        this.target.setAttribute("contentEditable", "false");
                }, 20);
            this.view.domObserver.start();
        }
        view.root.addEventListener("mouseup", this.up = this.up.bind(this));
        view.root.addEventListener("mousemove", this.move = this.move.bind(this));
        setSelectionOrigin(view, "pointer");
    }
    done() {
        this.view.root.removeEventListener("mouseup", this.up);
        this.view.root.removeEventListener("mousemove", this.move);
        if (this.mightDrag && this.target) {
            this.view.domObserver.stop();
            if (this.mightDrag.addAttr)
                this.target.removeAttribute("draggable");
            if (this.mightDrag.setUneditable)
                this.target.removeAttribute("contentEditable");
            this.view.domObserver.start();
        }
        if (this.delayedSelectionSync)
            setTimeout(() => selectionToDOM(this.view));
        this.view.input.mouseDown = null;
    }
    up(event) {
        this.done();
        if (!this.view.dom.contains(event.target))
            return;
        let pos = this.pos;
        if (this.view.state.doc != this.startDoc)
            pos = this.view.posAtCoords(eventCoords(event));
        this.updateAllowDefault(event);
        if (this.allowDefault || !pos) {
            setSelectionOrigin(this.view, "pointer");
        }
        else if (handleSingleClick(this.view, pos.pos, pos.inside, event, this.selectNode)) {
            event.preventDefault();
        }
        else if (event.button == 0 &&
            (this.flushed ||
                // Safari ignores clicks on draggable elements
                (safari && this.mightDrag && !this.mightDrag.node.isAtom) ||
                // Chrome will sometimes treat a node selection as a
                // cursor, but still report that the node is selected
                // when asked through getSelection. You'll then get a
                // situation where clicking at the point where that
                // (hidden) cursor is doesn't change the selection, and
                // thus doesn't get a reaction from ProseMirror. This
                // works around that.
                (chrome && !this.view.state.selection.visible &&
                    Math.min(Math.abs(pos.pos - this.view.state.selection.from), Math.abs(pos.pos - this.view.state.selection.to)) <= 2))) {
            updateSelection(this.view, Selection.near(this.view.state.doc.resolve(pos.pos)), "pointer");
            event.preventDefault();
        }
        else {
            setSelectionOrigin(this.view, "pointer");
        }
    }
    move(event) {
        this.updateAllowDefault(event);
        setSelectionOrigin(this.view, "pointer");
        if (event.buttons == 0)
            this.done();
    }
    updateAllowDefault(event) {
        if (!this.allowDefault && (Math.abs(this.event.x - event.clientX) > 4 ||
            Math.abs(this.event.y - event.clientY) > 4))
            this.allowDefault = true;
    }
}
handlers.touchstart = view => {
    view.input.lastTouch = Date.now();
    forceDOMFlush(view);
    setSelectionOrigin(view, "pointer");
};
handlers.touchmove = view => {
    view.input.lastTouch = Date.now();
    setSelectionOrigin(view, "pointer");
};
handlers.contextmenu = view => forceDOMFlush(view);
function inOrNearComposition(view, event) {
    if (view.composing)
        return true;
    // See https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/.
    // On Japanese input method editors (IMEs), the Enter key is used to confirm character
    // selection. On Safari, when Enter is pressed, compositionend and keydown events are
    // emitted. The keydown event triggers newline insertion, which we don't want.
    // This method returns true if the keydown event should be ignored.
    // We only ignore it once, as pressing Enter a second time *should* insert a newline.
    // Furthermore, the keydown event timestamp must be close to the compositionEndedAt timestamp.
    // This guards against the case where compositionend is triggered without the keyboard
    // (e.g. character confirmation may be done with the mouse), and keydown is triggered
    // afterwards- we wouldn't want to ignore the keydown event in this case.
    if (safari && Math.abs(event.timeStamp - view.input.compositionEndedAt) < 500) {
        view.input.compositionEndedAt = -2e8;
        return true;
    }
    return false;
}
// Drop active composition after 5 seconds of inactivity on Android
const timeoutComposition = android ? 5000 : -1;
editHandlers.compositionstart = editHandlers.compositionupdate = view => {
    if (!view.composing) {
        view.domObserver.flush();
        let { state } = view, $pos = state.selection.$from;
        if (state.selection.empty &&
            (state.storedMarks ||
                (!$pos.textOffset && $pos.parentOffset && $pos.nodeBefore.marks.some(m => m.type.spec.inclusive === false)))) {
            // Need to wrap the cursor in mark nodes different from the ones in the DOM context
            view.markCursor = view.state.storedMarks || $pos.marks();
            endComposition(view, true);
            view.markCursor = null;
        }
        else {
            endComposition(view);
            // In firefox, if the cursor is after but outside a marked node,
            // the inserted text won't inherit the marks. So this moves it
            // inside if necessary.
            if (gecko && state.selection.empty && $pos.parentOffset && !$pos.textOffset && $pos.nodeBefore.marks.length) {
                let sel = view.domSelectionRange();
                for (let node = sel.focusNode, offset = sel.focusOffset; node && node.nodeType == 1 && offset != 0;) {
                    let before = offset < 0 ? node.lastChild : node.childNodes[offset - 1];
                    if (!before)
                        break;
                    if (before.nodeType == 3) {
                        view.domSelection().collapse(before, before.nodeValue.length);
                        break;
                    }
                    else {
                        node = before;
                        offset = -1;
                    }
                }
            }
        }
        view.input.composing = true;
    }
    scheduleComposeEnd(view, timeoutComposition);
};
editHandlers.compositionend = (view, event) => {
    if (view.composing) {
        view.input.composing = false;
        view.input.compositionEndedAt = event.timeStamp;
        view.input.compositionPendingChanges = view.domObserver.pendingRecords().length ? view.input.compositionID : 0;
        if (view.input.compositionPendingChanges)
            Promise.resolve().then(() => view.domObserver.flush());
        view.input.compositionID++;
        scheduleComposeEnd(view, 20);
    }
};
function scheduleComposeEnd(view, delay) {
    clearTimeout(view.input.composingTimeout);
    if (delay > -1)
        view.input.composingTimeout = setTimeout(() => endComposition(view), delay);
}
function clearComposition(view) {
    if (view.composing) {
        view.input.composing = false;
        view.input.compositionEndedAt = timestampFromCustomEvent();
    }
    while (view.input.compositionNodes.length > 0)
        view.input.compositionNodes.pop().markParentsDirty();
}
function timestampFromCustomEvent() {
    let event = document.createEvent("Event");
    event.initEvent("event", true, true);
    return event.timeStamp;
}
/**
@internal
*/
function endComposition(view, forceUpdate = false) {
    if (android && view.domObserver.flushingSoon >= 0)
        return;
    view.domObserver.forceFlush();
    clearComposition(view);
    if (forceUpdate || view.docView && view.docView.dirty) {
        let sel = selectionFromDOM(view);
        if (sel && !sel.eq(view.state.selection))
            view.dispatch(view.state.tr.setSelection(sel));
        else
            view.updateState(view.state);
        return true;
    }
    return false;
}
function captureCopy(view, dom) {
    // The extra wrapper is somehow necessary on IE/Edge to prevent the
    // content from being mangled when it is put onto the clipboard
    if (!view.dom.parentNode)
        return;
    let wrap = view.dom.parentNode.appendChild(document.createElement("div"));
    wrap.appendChild(dom);
    wrap.style.cssText = "position: fixed; left: -10000px; top: 10px";
    let sel = getSelection(), range = document.createRange();
    range.selectNodeContents(dom);
    // Done because IE will fire a selectionchange moving the selection
    // to its start when removeAllRanges is called and the editor still
    // has focus (which will mess up the editor's selection state).
    view.dom.blur();
    sel.removeAllRanges();
    sel.addRange(range);
    setTimeout(() => {
        if (wrap.parentNode)
            wrap.parentNode.removeChild(wrap);
        view.focus();
    }, 50);
}
// This is very crude, but unfortunately both these browsers _pretend_
// that they have a clipboard API—all the objects and methods are
// there, they just don't work, and they are hard to test.
const brokenClipboardAPI = (ie$1 && ie_version < 15) ||
    (ios && webkit_version < 604);
handlers.copy = editHandlers.cut = (view, _event) => {
    let event = _event;
    let sel = view.state.selection, cut = event.type == "cut";
    if (sel.empty)
        return;
    // IE and Edge's clipboard interface is completely broken
    let data = brokenClipboardAPI ? null : event.clipboardData;
    let slice = sel.content(), { dom, text } = serializeForClipboard(view, slice);
    if (data) {
        event.preventDefault();
        data.clearData();
        data.setData("text/html", dom.innerHTML);
        data.setData("text/plain", text);
    }
    else {
        captureCopy(view, dom);
    }
    if (cut)
        view.dispatch(view.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
};
function sliceSingleNode(slice) {
    return slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1 ? slice.content.firstChild : null;
}
function capturePaste(view, event) {
    if (!view.dom.parentNode)
        return;
    let plainText = view.input.shiftKey || view.state.selection.$from.parent.type.spec.code;
    let target = view.dom.parentNode.appendChild(document.createElement(plainText ? "textarea" : "div"));
    if (!plainText)
        target.contentEditable = "true";
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    let plain = view.input.shiftKey && view.input.lastKeyCode != 45;
    setTimeout(() => {
        view.focus();
        if (target.parentNode)
            target.parentNode.removeChild(target);
        if (plainText)
            doPaste(view, target.value, null, plain, event);
        else
            doPaste(view, target.textContent, target.innerHTML, plain, event);
    }, 50);
}
function doPaste(view, text, html, preferPlain, event) {
    let slice = parseFromClipboard(view, text, html, preferPlain, view.state.selection.$from);
    if (view.someProp("handlePaste", f => f(view, event, slice || Slice.empty)))
        return true;
    if (!slice)
        return false;
    let singleNode = sliceSingleNode(slice);
    let tr = singleNode
        ? view.state.tr.replaceSelectionWith(singleNode, preferPlain)
        : view.state.tr.replaceSelection(slice);
    view.dispatch(tr.scrollIntoView().setMeta("paste", true).setMeta("uiEvent", "paste"));
    return true;
}
editHandlers.paste = (view, _event) => {
    let event = _event;
    // Handling paste from JavaScript during composition is very poorly
    // handled by browsers, so as a dodgy but preferable kludge, we just
    // let the browser do its native thing there, except on Android,
    // where the editor is almost always composing.
    if (view.composing && !android)
        return;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    let plain = view.input.shiftKey && view.input.lastKeyCode != 45;
    if (data && doPaste(view, data.getData("text/plain"), data.getData("text/html"), plain, event))
        event.preventDefault();
    else
        capturePaste(view, event);
};
class Dragging {
    constructor(slice, move) {
        this.slice = slice;
        this.move = move;
    }
}
const dragCopyModifier = mac$2 ? "altKey" : "ctrlKey";
handlers.dragstart = (view, _event) => {
    let event = _event;
    let mouseDown = view.input.mouseDown;
    if (mouseDown)
        mouseDown.done();
    if (!event.dataTransfer)
        return;
    let sel = view.state.selection;
    let pos = sel.empty ? null : view.posAtCoords(eventCoords(event));
    if (pos && pos.pos >= sel.from && pos.pos <= (sel instanceof NodeSelection ? sel.to - 1 : sel.to)) ;
    else if (mouseDown && mouseDown.mightDrag) {
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, mouseDown.mightDrag.pos)));
    }
    else if (event.target && event.target.nodeType == 1) {
        let desc = view.docView.nearestDesc(event.target, true);
        if (desc && desc.node.type.spec.draggable && desc != view.docView)
            view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, desc.posBefore)));
    }
    let slice = view.state.selection.content(), { dom, text } = serializeForClipboard(view, slice);
    event.dataTransfer.clearData();
    event.dataTransfer.setData(brokenClipboardAPI ? "Text" : "text/html", dom.innerHTML);
    // See https://github.com/ProseMirror/prosemirror/issues/1156
    event.dataTransfer.effectAllowed = "copyMove";
    if (!brokenClipboardAPI)
        event.dataTransfer.setData("text/plain", text);
    view.dragging = new Dragging(slice, !event[dragCopyModifier]);
};
handlers.dragend = view => {
    let dragging = view.dragging;
    window.setTimeout(() => {
        if (view.dragging == dragging)
            view.dragging = null;
    }, 50);
};
editHandlers.dragover = editHandlers.dragenter = (_, e) => e.preventDefault();
editHandlers.drop = (view, _event) => {
    let event = _event;
    let dragging = view.dragging;
    view.dragging = null;
    if (!event.dataTransfer)
        return;
    let eventPos = view.posAtCoords(eventCoords(event));
    if (!eventPos)
        return;
    let $mouse = view.state.doc.resolve(eventPos.pos);
    let slice = dragging && dragging.slice;
    if (slice) {
        view.someProp("transformPasted", f => { slice = f(slice, view); });
    }
    else {
        slice = parseFromClipboard(view, event.dataTransfer.getData(brokenClipboardAPI ? "Text" : "text/plain"), brokenClipboardAPI ? null : event.dataTransfer.getData("text/html"), false, $mouse);
    }
    let move = !!(dragging && !event[dragCopyModifier]);
    if (view.someProp("handleDrop", f => f(view, event, slice || Slice.empty, move))) {
        event.preventDefault();
        return;
    }
    if (!slice)
        return;
    event.preventDefault();
    let insertPos = slice ? dropPoint(view.state.doc, $mouse.pos, slice) : $mouse.pos;
    if (insertPos == null)
        insertPos = $mouse.pos;
    let tr = view.state.tr;
    if (move)
        tr.deleteSelection();
    let pos = tr.mapping.map(insertPos);
    let isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1;
    let beforeInsert = tr.doc;
    if (isNode)
        tr.replaceRangeWith(pos, pos, slice.content.firstChild);
    else
        tr.replaceRange(pos, pos, slice);
    if (tr.doc.eq(beforeInsert))
        return;
    let $pos = tr.doc.resolve(pos);
    if (isNode && NodeSelection.isSelectable(slice.content.firstChild) &&
        $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice.content.firstChild)) {
        tr.setSelection(new NodeSelection($pos));
    }
    else {
        let end = tr.mapping.map(insertPos);
        tr.mapping.maps[tr.mapping.maps.length - 1].forEach((_from, _to, _newFrom, newTo) => end = newTo);
        tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(end)));
    }
    view.focus();
    view.dispatch(tr.setMeta("uiEvent", "drop"));
};
handlers.focus = view => {
    view.input.lastFocus = Date.now();
    if (!view.focused) {
        view.domObserver.stop();
        view.dom.classList.add("ProseMirror-focused");
        view.domObserver.start();
        view.focused = true;
        setTimeout(() => {
            if (view.docView && view.hasFocus() && !view.domObserver.currentSelection.eq(view.domSelectionRange()))
                selectionToDOM(view);
        }, 20);
    }
};
handlers.blur = (view, _event) => {
    let event = _event;
    if (view.focused) {
        view.domObserver.stop();
        view.dom.classList.remove("ProseMirror-focused");
        view.domObserver.start();
        if (event.relatedTarget && view.dom.contains(event.relatedTarget))
            view.domObserver.currentSelection.clear();
        view.focused = false;
    }
};
handlers.beforeinput = (view, _event) => {
    let event = _event;
    // We should probably do more with beforeinput events, but support
    // is so spotty that I'm still waiting to see where they are going.
    // Very specific hack to deal with backspace sometimes failing on
    // Chrome Android when after an uneditable node.
    if (chrome && android && event.inputType == "deleteContentBackward") {
        view.domObserver.flushSoon();
        let { domChangeCount } = view.input;
        setTimeout(() => {
            if (view.input.domChangeCount != domChangeCount)
                return; // Event already had some effect
            // This bug tends to close the virtual keyboard, so we refocus
            view.dom.blur();
            view.focus();
            if (view.someProp("handleKeyDown", f => f(view, keyEvent(8, "Backspace"))))
                return;
            let { $cursor } = view.state.selection;
            // Crude approximation of backspace behavior when no command handled it
            if ($cursor && $cursor.pos > 0)
                view.dispatch(view.state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView());
        }, 50);
    }
};
// Make sure all handlers get registered
for (let prop in editHandlers)
    handlers[prop] = editHandlers[prop];

function compareObjs(a, b) {
    if (a == b)
        return true;
    for (let p in a)
        if (a[p] !== b[p])
            return false;
    for (let p in b)
        if (!(p in a))
            return false;
    return true;
}
class WidgetType {
    constructor(toDOM, spec) {
        this.toDOM = toDOM;
        this.spec = spec || noSpec;
        this.side = this.spec.side || 0;
    }
    map(mapping, span, offset, oldOffset) {
        let { pos, deleted } = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1);
        return deleted ? null : new Decoration(pos - offset, pos - offset, this);
    }
    valid() { return true; }
    eq(other) {
        return this == other ||
            (other instanceof WidgetType &&
                (this.spec.key && this.spec.key == other.spec.key ||
                    this.toDOM == other.toDOM && compareObjs(this.spec, other.spec)));
    }
    destroy(node) {
        if (this.spec.destroy)
            this.spec.destroy(node);
    }
}
class InlineType {
    constructor(attrs, spec) {
        this.attrs = attrs;
        this.spec = spec || noSpec;
    }
    map(mapping, span, offset, oldOffset) {
        let from = mapping.map(span.from + oldOffset, this.spec.inclusiveStart ? -1 : 1) - offset;
        let to = mapping.map(span.to + oldOffset, this.spec.inclusiveEnd ? 1 : -1) - offset;
        return from >= to ? null : new Decoration(from, to, this);
    }
    valid(_, span) { return span.from < span.to; }
    eq(other) {
        return this == other ||
            (other instanceof InlineType && compareObjs(this.attrs, other.attrs) &&
                compareObjs(this.spec, other.spec));
    }
    static is(span) { return span.type instanceof InlineType; }
    destroy() { }
}
class NodeType {
    constructor(attrs, spec) {
        this.attrs = attrs;
        this.spec = spec || noSpec;
    }
    map(mapping, span, offset, oldOffset) {
        let from = mapping.mapResult(span.from + oldOffset, 1);
        if (from.deleted)
            return null;
        let to = mapping.mapResult(span.to + oldOffset, -1);
        if (to.deleted || to.pos <= from.pos)
            return null;
        return new Decoration(from.pos - offset, to.pos - offset, this);
    }
    valid(node, span) {
        let { index, offset } = node.content.findIndex(span.from), child;
        return offset == span.from && !(child = node.child(index)).isText && offset + child.nodeSize == span.to;
    }
    eq(other) {
        return this == other ||
            (other instanceof NodeType && compareObjs(this.attrs, other.attrs) &&
                compareObjs(this.spec, other.spec));
    }
    destroy() { }
}
/**
Decoration objects can be provided to the view through the
[`decorations` prop](https://prosemirror.net/docs/ref/#view.EditorProps.decorations). They come in
several variants—see the static members of this class for details.
*/
class Decoration {
    /**
    @internal
    */
    constructor(
    /**
    The start position of the decoration.
    */
    from, 
    /**
    The end position. Will be the same as `from` for [widget
    decorations](https://prosemirror.net/docs/ref/#view.Decoration^widget).
    */
    to, 
    /**
    @internal
    */
    type) {
        this.from = from;
        this.to = to;
        this.type = type;
    }
    /**
    @internal
    */
    copy(from, to) {
        return new Decoration(from, to, this.type);
    }
    /**
    @internal
    */
    eq(other, offset = 0) {
        return this.type.eq(other.type) && this.from + offset == other.from && this.to + offset == other.to;
    }
    /**
    @internal
    */
    map(mapping, offset, oldOffset) {
        return this.type.map(mapping, this, offset, oldOffset);
    }
    /**
    Creates a widget decoration, which is a DOM node that's shown in
    the document at the given position. It is recommended that you
    delay rendering the widget by passing a function that will be
    called when the widget is actually drawn in a view, but you can
    also directly pass a DOM node. `getPos` can be used to find the
    widget's current document position.
    */
    static widget(pos, toDOM, spec) {
        return new Decoration(pos, pos, new WidgetType(toDOM, spec));
    }
    /**
    Creates an inline decoration, which adds the given attributes to
    each inline node between `from` and `to`.
    */
    static inline(from, to, attrs, spec) {
        return new Decoration(from, to, new InlineType(attrs, spec));
    }
    /**
    Creates a node decoration. `from` and `to` should point precisely
    before and after a node in the document. That node, and only that
    node, will receive the given attributes.
    */
    static node(from, to, attrs, spec) {
        return new Decoration(from, to, new NodeType(attrs, spec));
    }
    /**
    The spec provided when creating this decoration. Can be useful
    if you've stored extra information in that object.
    */
    get spec() { return this.type.spec; }
    /**
    @internal
    */
    get inline() { return this.type instanceof InlineType; }
    /**
    @internal
    */
    get widget() { return this.type instanceof WidgetType; }
}
const none = [], noSpec = {};
/**
A collection of [decorations](https://prosemirror.net/docs/ref/#view.Decoration), organized in such
a way that the drawing algorithm can efficiently use and compare
them. This is a persistent data structure—it is not modified,
updates create a new value.
*/
class DecorationSet {
    /**
    @internal
    */
    constructor(local, children) {
        this.local = local.length ? local : none;
        this.children = children.length ? children : none;
    }
    /**
    Create a set of decorations, using the structure of the given
    document. This will consume (modify) the `decorations` array, so
    you must make a copy if you want need to preserve that.
    */
    static create(doc, decorations) {
        return decorations.length ? buildTree(decorations, doc, 0, noSpec) : empty;
    }
    /**
    Find all decorations in this set which touch the given range
    (including decorations that start or end directly at the
    boundaries) and match the given predicate on their spec. When
    `start` and `end` are omitted, all decorations in the set are
    considered. When `predicate` isn't given, all decorations are
    assumed to match.
    */
    find(start, end, predicate) {
        let result = [];
        this.findInner(start == null ? 0 : start, end == null ? 1e9 : end, result, 0, predicate);
        return result;
    }
    findInner(start, end, result, offset, predicate) {
        for (let i = 0; i < this.local.length; i++) {
            let span = this.local[i];
            if (span.from <= end && span.to >= start && (!predicate || predicate(span.spec)))
                result.push(span.copy(span.from + offset, span.to + offset));
        }
        for (let i = 0; i < this.children.length; i += 3) {
            if (this.children[i] < end && this.children[i + 1] > start) {
                let childOff = this.children[i] + 1;
                this.children[i + 2].findInner(start - childOff, end - childOff, result, offset + childOff, predicate);
            }
        }
    }
    /**
    Map the set of decorations in response to a change in the
    document.
    */
    map(mapping, doc, options) {
        if (this == empty || mapping.maps.length == 0)
            return this;
        return this.mapInner(mapping, doc, 0, 0, options || noSpec);
    }
    /**
    @internal
    */
    mapInner(mapping, node, offset, oldOffset, options) {
        let newLocal;
        for (let i = 0; i < this.local.length; i++) {
            let mapped = this.local[i].map(mapping, offset, oldOffset);
            if (mapped && mapped.type.valid(node, mapped))
                (newLocal || (newLocal = [])).push(mapped);
            else if (options.onRemove)
                options.onRemove(this.local[i].spec);
        }
        if (this.children.length)
            return mapChildren(this.children, newLocal || [], mapping, node, offset, oldOffset, options);
        else
            return newLocal ? new DecorationSet(newLocal.sort(byPos), none) : empty;
    }
    /**
    Add the given array of decorations to the ones in the set,
    producing a new set. Consumes the `decorations` array. Needs
    access to the current document to create the appropriate tree
    structure.
    */
    add(doc, decorations) {
        if (!decorations.length)
            return this;
        if (this == empty)
            return DecorationSet.create(doc, decorations);
        return this.addInner(doc, decorations, 0);
    }
    addInner(doc, decorations, offset) {
        let children, childIndex = 0;
        doc.forEach((childNode, childOffset) => {
            let baseOffset = childOffset + offset, found;
            if (!(found = takeSpansForNode(decorations, childNode, baseOffset)))
                return;
            if (!children)
                children = this.children.slice();
            while (childIndex < children.length && children[childIndex] < childOffset)
                childIndex += 3;
            if (children[childIndex] == childOffset)
                children[childIndex + 2] = children[childIndex + 2].addInner(childNode, found, baseOffset + 1);
            else
                children.splice(childIndex, 0, childOffset, childOffset + childNode.nodeSize, buildTree(found, childNode, baseOffset + 1, noSpec));
            childIndex += 3;
        });
        let local = moveSpans(childIndex ? withoutNulls(decorations) : decorations, -offset);
        for (let i = 0; i < local.length; i++)
            if (!local[i].type.valid(doc, local[i]))
                local.splice(i--, 1);
        return new DecorationSet(local.length ? this.local.concat(local).sort(byPos) : this.local, children || this.children);
    }
    /**
    Create a new set that contains the decorations in this set, minus
    the ones in the given array.
    */
    remove(decorations) {
        if (decorations.length == 0 || this == empty)
            return this;
        return this.removeInner(decorations, 0);
    }
    removeInner(decorations, offset) {
        let children = this.children, local = this.local;
        for (let i = 0; i < children.length; i += 3) {
            let found;
            let from = children[i] + offset, to = children[i + 1] + offset;
            for (let j = 0, span; j < decorations.length; j++)
                if (span = decorations[j]) {
                    if (span.from > from && span.to < to) {
                        decorations[j] = null;
                        (found || (found = [])).push(span);
                    }
                }
            if (!found)
                continue;
            if (children == this.children)
                children = this.children.slice();
            let removed = children[i + 2].removeInner(found, from + 1);
            if (removed != empty) {
                children[i + 2] = removed;
            }
            else {
                children.splice(i, 3);
                i -= 3;
            }
        }
        if (local.length)
            for (let i = 0, span; i < decorations.length; i++)
                if (span = decorations[i]) {
                    for (let j = 0; j < local.length; j++)
                        if (local[j].eq(span, offset)) {
                            if (local == this.local)
                                local = this.local.slice();
                            local.splice(j--, 1);
                        }
                }
        if (children == this.children && local == this.local)
            return this;
        return local.length || children.length ? new DecorationSet(local, children) : empty;
    }
    /**
    @internal
    */
    forChild(offset, node) {
        if (this == empty)
            return this;
        if (node.isLeaf)
            return DecorationSet.empty;
        let child, local;
        for (let i = 0; i < this.children.length; i += 3)
            if (this.children[i] >= offset) {
                if (this.children[i] == offset)
                    child = this.children[i + 2];
                break;
            }
        let start = offset + 1, end = start + node.content.size;
        for (let i = 0; i < this.local.length; i++) {
            let dec = this.local[i];
            if (dec.from < end && dec.to > start && (dec.type instanceof InlineType)) {
                let from = Math.max(start, dec.from) - start, to = Math.min(end, dec.to) - start;
                if (from < to)
                    (local || (local = [])).push(dec.copy(from, to));
            }
        }
        if (local) {
            let localSet = new DecorationSet(local.sort(byPos), none);
            return child ? new DecorationGroup([localSet, child]) : localSet;
        }
        return child || empty;
    }
    /**
    @internal
    */
    eq(other) {
        if (this == other)
            return true;
        if (!(other instanceof DecorationSet) ||
            this.local.length != other.local.length ||
            this.children.length != other.children.length)
            return false;
        for (let i = 0; i < this.local.length; i++)
            if (!this.local[i].eq(other.local[i]))
                return false;
        for (let i = 0; i < this.children.length; i += 3)
            if (this.children[i] != other.children[i] ||
                this.children[i + 1] != other.children[i + 1] ||
                !this.children[i + 2].eq(other.children[i + 2]))
                return false;
        return true;
    }
    /**
    @internal
    */
    locals(node) {
        return removeOverlap(this.localsInner(node));
    }
    /**
    @internal
    */
    localsInner(node) {
        if (this == empty)
            return none;
        if (node.inlineContent || !this.local.some(InlineType.is))
            return this.local;
        let result = [];
        for (let i = 0; i < this.local.length; i++) {
            if (!(this.local[i].type instanceof InlineType))
                result.push(this.local[i]);
        }
        return result;
    }
}
/**
The empty set of decorations.
*/
DecorationSet.empty = new DecorationSet([], []);
/**
@internal
*/
DecorationSet.removeOverlap = removeOverlap;
const empty = DecorationSet.empty;
// An abstraction that allows the code dealing with decorations to
// treat multiple DecorationSet objects as if it were a single object
// with (a subset of) the same interface.
class DecorationGroup {
    constructor(members) {
        this.members = members;
    }
    map(mapping, doc) {
        const mappedDecos = this.members.map(member => member.map(mapping, doc, noSpec));
        return DecorationGroup.from(mappedDecos);
    }
    forChild(offset, child) {
        if (child.isLeaf)
            return DecorationSet.empty;
        let found = [];
        for (let i = 0; i < this.members.length; i++) {
            let result = this.members[i].forChild(offset, child);
            if (result == empty)
                continue;
            if (result instanceof DecorationGroup)
                found = found.concat(result.members);
            else
                found.push(result);
        }
        return DecorationGroup.from(found);
    }
    eq(other) {
        if (!(other instanceof DecorationGroup) ||
            other.members.length != this.members.length)
            return false;
        for (let i = 0; i < this.members.length; i++)
            if (!this.members[i].eq(other.members[i]))
                return false;
        return true;
    }
    locals(node) {
        let result, sorted = true;
        for (let i = 0; i < this.members.length; i++) {
            let locals = this.members[i].localsInner(node);
            if (!locals.length)
                continue;
            if (!result) {
                result = locals;
            }
            else {
                if (sorted) {
                    result = result.slice();
                    sorted = false;
                }
                for (let j = 0; j < locals.length; j++)
                    result.push(locals[j]);
            }
        }
        return result ? removeOverlap(sorted ? result : result.sort(byPos)) : none;
    }
    // Create a group for the given array of decoration sets, or return
    // a single set when possible.
    static from(members) {
        switch (members.length) {
            case 0: return empty;
            case 1: return members[0];
            default: return new DecorationGroup(members.every(m => m instanceof DecorationSet) ? members :
                members.reduce((r, m) => r.concat(m instanceof DecorationSet ? m : m.members), []));
        }
    }
}
function mapChildren(oldChildren, newLocal, mapping, node, offset, oldOffset, options) {
    let children = oldChildren.slice();
    // Mark the children that are directly touched by changes, and
    // move those that are after the changes.
    for (let i = 0, baseOffset = oldOffset; i < mapping.maps.length; i++) {
        let moved = 0;
        mapping.maps[i].forEach((oldStart, oldEnd, newStart, newEnd) => {
            let dSize = (newEnd - newStart) - (oldEnd - oldStart);
            for (let i = 0; i < children.length; i += 3) {
                let end = children[i + 1];
                if (end < 0 || oldStart > end + baseOffset - moved)
                    continue;
                let start = children[i] + baseOffset - moved;
                if (oldEnd >= start) {
                    children[i + 1] = oldStart <= start ? -2 : -1;
                }
                else if (newStart >= offset && dSize) {
                    children[i] += dSize;
                    children[i + 1] += dSize;
                }
            }
            moved += dSize;
        });
        baseOffset = mapping.maps[i].map(baseOffset, -1);
    }
    // Find the child nodes that still correspond to a single node,
    // recursively call mapInner on them and update their positions.
    let mustRebuild = false;
    for (let i = 0; i < children.length; i += 3)
        if (children[i + 1] < 0) { // Touched nodes
            if (children[i + 1] == -2) {
                mustRebuild = true;
                children[i + 1] = -1;
                continue;
            }
            let from = mapping.map(oldChildren[i] + oldOffset), fromLocal = from - offset;
            if (fromLocal < 0 || fromLocal >= node.content.size) {
                mustRebuild = true;
                continue;
            }
            // Must read oldChildren because children was tagged with -1
            let to = mapping.map(oldChildren[i + 1] + oldOffset, -1), toLocal = to - offset;
            let { index, offset: childOffset } = node.content.findIndex(fromLocal);
            let childNode = node.maybeChild(index);
            if (childNode && childOffset == fromLocal && childOffset + childNode.nodeSize == toLocal) {
                let mapped = children[i + 2]
                    .mapInner(mapping, childNode, from + 1, oldChildren[i] + oldOffset + 1, options);
                if (mapped != empty) {
                    children[i] = fromLocal;
                    children[i + 1] = toLocal;
                    children[i + 2] = mapped;
                }
                else {
                    children[i + 1] = -2;
                    mustRebuild = true;
                }
            }
            else {
                mustRebuild = true;
            }
        }
    // Remaining children must be collected and rebuilt into the appropriate structure
    if (mustRebuild) {
        let decorations = mapAndGatherRemainingDecorations(children, oldChildren, newLocal, mapping, offset, oldOffset, options);
        let built = buildTree(decorations, node, 0, options);
        newLocal = built.local;
        for (let i = 0; i < children.length; i += 3)
            if (children[i + 1] < 0) {
                children.splice(i, 3);
                i -= 3;
            }
        for (let i = 0, j = 0; i < built.children.length; i += 3) {
            let from = built.children[i];
            while (j < children.length && children[j] < from)
                j += 3;
            children.splice(j, 0, built.children[i], built.children[i + 1], built.children[i + 2]);
        }
    }
    return new DecorationSet(newLocal.sort(byPos), children);
}
function moveSpans(spans, offset) {
    if (!offset || !spans.length)
        return spans;
    let result = [];
    for (let i = 0; i < spans.length; i++) {
        let span = spans[i];
        result.push(new Decoration(span.from + offset, span.to + offset, span.type));
    }
    return result;
}
function mapAndGatherRemainingDecorations(children, oldChildren, decorations, mapping, offset, oldOffset, options) {
    // Gather all decorations from the remaining marked children
    function gather(set, oldOffset) {
        for (let i = 0; i < set.local.length; i++) {
            let mapped = set.local[i].map(mapping, offset, oldOffset);
            if (mapped)
                decorations.push(mapped);
            else if (options.onRemove)
                options.onRemove(set.local[i].spec);
        }
        for (let i = 0; i < set.children.length; i += 3)
            gather(set.children[i + 2], set.children[i] + oldOffset + 1);
    }
    for (let i = 0; i < children.length; i += 3)
        if (children[i + 1] == -1)
            gather(children[i + 2], oldChildren[i] + oldOffset + 1);
    return decorations;
}
function takeSpansForNode(spans, node, offset) {
    if (node.isLeaf)
        return null;
    let end = offset + node.nodeSize, found = null;
    for (let i = 0, span; i < spans.length; i++) {
        if ((span = spans[i]) && span.from > offset && span.to < end) {
            (found || (found = [])).push(span);
            spans[i] = null;
        }
    }
    return found;
}
function withoutNulls(array) {
    let result = [];
    for (let i = 0; i < array.length; i++)
        if (array[i] != null)
            result.push(array[i]);
    return result;
}
// Build up a tree that corresponds to a set of decorations. `offset`
// is a base offset that should be subtracted from the `from` and `to`
// positions in the spans (so that we don't have to allocate new spans
// for recursive calls).
function buildTree(spans, node, offset, options) {
    let children = [], hasNulls = false;
    node.forEach((childNode, localStart) => {
        let found = takeSpansForNode(spans, childNode, localStart + offset);
        if (found) {
            hasNulls = true;
            let subtree = buildTree(found, childNode, offset + localStart + 1, options);
            if (subtree != empty)
                children.push(localStart, localStart + childNode.nodeSize, subtree);
        }
    });
    let locals = moveSpans(hasNulls ? withoutNulls(spans) : spans, -offset).sort(byPos);
    for (let i = 0; i < locals.length; i++)
        if (!locals[i].type.valid(node, locals[i])) {
            if (options.onRemove)
                options.onRemove(locals[i].spec);
            locals.splice(i--, 1);
        }
    return locals.length || children.length ? new DecorationSet(locals, children) : empty;
}
// Used to sort decorations so that ones with a low start position
// come first, and within a set with the same start position, those
// with an smaller end position come first.
function byPos(a, b) {
    return a.from - b.from || a.to - b.to;
}
// Scan a sorted array of decorations for partially overlapping spans,
// and split those so that only fully overlapping spans are left (to
// make subsequent rendering easier). Will return the input array if
// no partially overlapping spans are found (the common case).
function removeOverlap(spans) {
    let working = spans;
    for (let i = 0; i < working.length - 1; i++) {
        let span = working[i];
        if (span.from != span.to)
            for (let j = i + 1; j < working.length; j++) {
                let next = working[j];
                if (next.from == span.from) {
                    if (next.to != span.to) {
                        if (working == spans)
                            working = spans.slice();
                        // Followed by a partially overlapping larger span. Split that
                        // span.
                        working[j] = next.copy(next.from, span.to);
                        insertAhead(working, j + 1, next.copy(span.to, next.to));
                    }
                    continue;
                }
                else {
                    if (next.from < span.to) {
                        if (working == spans)
                            working = spans.slice();
                        // The end of this one overlaps with a subsequent span. Split
                        // this one.
                        working[i] = span.copy(span.from, next.from);
                        insertAhead(working, j, span.copy(next.from, span.to));
                    }
                    break;
                }
            }
    }
    return working;
}
function insertAhead(array, i, deco) {
    while (i < array.length && byPos(deco, array[i]) > 0)
        i++;
    array.splice(i, 0, deco);
}
// Get the decorations associated with the current props of a view.
function viewDecorations(view) {
    let found = [];
    view.someProp("decorations", f => {
        let result = f(view.state);
        if (result && result != empty)
            found.push(result);
    });
    if (view.cursorWrapper)
        found.push(DecorationSet.create(view.state.doc, [view.cursorWrapper.deco]));
    return DecorationGroup.from(found);
}

const observeOptions = {
    childList: true,
    characterData: true,
    characterDataOldValue: true,
    attributes: true,
    attributeOldValue: true,
    subtree: true
};
// IE11 has very broken mutation observers, so we also listen to DOMCharacterDataModified
const useCharData = ie$1 && ie_version <= 11;
class SelectionState {
    constructor() {
        this.anchorNode = null;
        this.anchorOffset = 0;
        this.focusNode = null;
        this.focusOffset = 0;
    }
    set(sel) {
        this.anchorNode = sel.anchorNode;
        this.anchorOffset = sel.anchorOffset;
        this.focusNode = sel.focusNode;
        this.focusOffset = sel.focusOffset;
    }
    clear() {
        this.anchorNode = this.focusNode = null;
    }
    eq(sel) {
        return sel.anchorNode == this.anchorNode && sel.anchorOffset == this.anchorOffset &&
            sel.focusNode == this.focusNode && sel.focusOffset == this.focusOffset;
    }
}
class DOMObserver {
    constructor(view, handleDOMChange) {
        this.view = view;
        this.handleDOMChange = handleDOMChange;
        this.queue = [];
        this.flushingSoon = -1;
        this.observer = null;
        this.currentSelection = new SelectionState;
        this.onCharData = null;
        this.suppressingSelectionUpdates = false;
        this.observer = window.MutationObserver &&
            new window.MutationObserver(mutations => {
                for (let i = 0; i < mutations.length; i++)
                    this.queue.push(mutations[i]);
                // IE11 will sometimes (on backspacing out a single character
                // text node after a BR node) call the observer callback
                // before actually updating the DOM, which will cause
                // ProseMirror to miss the change (see #930)
                if (ie$1 && ie_version <= 11 && mutations.some(m => m.type == "childList" && m.removedNodes.length ||
                    m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
                    this.flushSoon();
                else
                    this.flush();
            });
        if (useCharData) {
            this.onCharData = e => {
                this.queue.push({ target: e.target, type: "characterData", oldValue: e.prevValue });
                this.flushSoon();
            };
        }
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }
    flushSoon() {
        if (this.flushingSoon < 0)
            this.flushingSoon = window.setTimeout(() => { this.flushingSoon = -1; this.flush(); }, 20);
    }
    forceFlush() {
        if (this.flushingSoon > -1) {
            window.clearTimeout(this.flushingSoon);
            this.flushingSoon = -1;
            this.flush();
        }
    }
    start() {
        if (this.observer) {
            this.observer.takeRecords();
            this.observer.observe(this.view.dom, observeOptions);
        }
        if (this.onCharData)
            this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
        this.connectSelection();
    }
    stop() {
        if (this.observer) {
            let take = this.observer.takeRecords();
            if (take.length) {
                for (let i = 0; i < take.length; i++)
                    this.queue.push(take[i]);
                window.setTimeout(() => this.flush(), 20);
            }
            this.observer.disconnect();
        }
        if (this.onCharData)
            this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
        this.disconnectSelection();
    }
    connectSelection() {
        this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
    }
    disconnectSelection() {
        this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
    }
    suppressSelectionUpdates() {
        this.suppressingSelectionUpdates = true;
        setTimeout(() => this.suppressingSelectionUpdates = false, 50);
    }
    onSelectionChange() {
        if (!hasFocusAndSelection(this.view))
            return;
        if (this.suppressingSelectionUpdates)
            return selectionToDOM(this.view);
        // Deletions on IE11 fire their events in the wrong order, giving
        // us a selection change event before the DOM changes are
        // reported.
        if (ie$1 && ie_version <= 11 && !this.view.state.selection.empty) {
            let sel = this.view.domSelectionRange();
            // Selection.isCollapsed isn't reliable on IE
            if (sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
                return this.flushSoon();
        }
        this.flush();
    }
    setCurSelection() {
        this.currentSelection.set(this.view.domSelectionRange());
    }
    ignoreSelectionChange(sel) {
        if (!sel.focusNode)
            return true;
        let ancestors = new Set, container;
        for (let scan = sel.focusNode; scan; scan = parentNode(scan))
            ancestors.add(scan);
        for (let scan = sel.anchorNode; scan; scan = parentNode(scan))
            if (ancestors.has(scan)) {
                container = scan;
                break;
            }
        let desc = container && this.view.docView.nearestDesc(container);
        if (desc && desc.ignoreMutation({
            type: "selection",
            target: container.nodeType == 3 ? container.parentNode : container
        })) {
            this.setCurSelection();
            return true;
        }
    }
    pendingRecords() {
        if (this.observer)
            for (let mut of this.observer.takeRecords())
                this.queue.push(mut);
        return this.queue;
    }
    flush() {
        let { view } = this;
        if (!view.docView || this.flushingSoon > -1)
            return;
        let mutations = this.pendingRecords();
        if (mutations.length)
            this.queue = [];
        let sel = view.domSelectionRange();
        let newSel = !this.suppressingSelectionUpdates && !this.currentSelection.eq(sel) && hasFocusAndSelection(view) && !this.ignoreSelectionChange(sel);
        let from = -1, to = -1, typeOver = false, added = [];
        if (view.editable) {
            for (let i = 0; i < mutations.length; i++) {
                let result = this.registerMutation(mutations[i], added);
                if (result) {
                    from = from < 0 ? result.from : Math.min(result.from, from);
                    to = to < 0 ? result.to : Math.max(result.to, to);
                    if (result.typeOver)
                        typeOver = true;
                }
            }
        }
        if (gecko && added.length > 1) {
            let brs = added.filter(n => n.nodeName == "BR");
            if (brs.length == 2) {
                let a = brs[0], b = brs[1];
                if (a.parentNode && a.parentNode.parentNode == b.parentNode)
                    b.remove();
                else
                    a.remove();
            }
        }
        let readSel = null;
        // If it looks like the browser has reset the selection to the
        // start of the document after focus, restore the selection from
        // the state
        if (from < 0 && newSel && view.input.lastFocus > Date.now() - 200 &&
            Math.max(view.input.lastTouch, view.input.lastClick.time) < Date.now() - 300 &&
            selectionCollapsed(sel) && (readSel = selectionFromDOM(view)) &&
            readSel.eq(Selection.near(view.state.doc.resolve(0), 1))) {
            view.input.lastFocus = 0;
            selectionToDOM(view);
            this.currentSelection.set(sel);
            view.scrollToSelection();
        }
        else if (from > -1 || newSel) {
            if (from > -1) {
                view.docView.markDirty(from, to);
                checkCSS(view);
            }
            this.handleDOMChange(from, to, typeOver, added);
            if (view.docView && view.docView.dirty)
                view.updateState(view.state);
            else if (!this.currentSelection.eq(sel))
                selectionToDOM(view);
            this.currentSelection.set(sel);
        }
    }
    registerMutation(mut, added) {
        // Ignore mutations inside nodes that were already noted as inserted
        if (added.indexOf(mut.target) > -1)
            return null;
        let desc = this.view.docView.nearestDesc(mut.target);
        if (mut.type == "attributes" &&
            (desc == this.view.docView || mut.attributeName == "contenteditable" ||
                // Firefox sometimes fires spurious events for null/empty styles
                (mut.attributeName == "style" && !mut.oldValue && !mut.target.getAttribute("style"))))
            return null;
        if (!desc || desc.ignoreMutation(mut))
            return null;
        if (mut.type == "childList") {
            for (let i = 0; i < mut.addedNodes.length; i++)
                added.push(mut.addedNodes[i]);
            if (desc.contentDOM && desc.contentDOM != desc.dom && !desc.contentDOM.contains(mut.target))
                return { from: desc.posBefore, to: desc.posAfter };
            let prev = mut.previousSibling, next = mut.nextSibling;
            if (ie$1 && ie_version <= 11 && mut.addedNodes.length) {
                // IE11 gives us incorrect next/prev siblings for some
                // insertions, so if there are added nodes, recompute those
                for (let i = 0; i < mut.addedNodes.length; i++) {
                    let { previousSibling, nextSibling } = mut.addedNodes[i];
                    if (!previousSibling || Array.prototype.indexOf.call(mut.addedNodes, previousSibling) < 0)
                        prev = previousSibling;
                    if (!nextSibling || Array.prototype.indexOf.call(mut.addedNodes, nextSibling) < 0)
                        next = nextSibling;
                }
            }
            let fromOffset = prev && prev.parentNode == mut.target
                ? domIndex(prev) + 1 : 0;
            let from = desc.localPosFromDOM(mut.target, fromOffset, -1);
            let toOffset = next && next.parentNode == mut.target
                ? domIndex(next) : mut.target.childNodes.length;
            let to = desc.localPosFromDOM(mut.target, toOffset, 1);
            return { from, to };
        }
        else if (mut.type == "attributes") {
            return { from: desc.posAtStart - desc.border, to: desc.posAtEnd + desc.border };
        }
        else { // "characterData"
            return {
                from: desc.posAtStart,
                to: desc.posAtEnd,
                // An event was generated for a text change that didn't change
                // any text. Mark the dom change to fall back to assuming the
                // selection was typed over with an identical value if it can't
                // find another change.
                typeOver: mut.target.nodeValue == mut.oldValue
            };
        }
    }
}
let cssChecked = new WeakMap();
let cssCheckWarned = false;
function checkCSS(view) {
    if (cssChecked.has(view))
        return;
    cssChecked.set(view, null);
    if (['normal', 'nowrap', 'pre-line'].indexOf(getComputedStyle(view.dom).whiteSpace) !== -1) {
        view.requiresGeckoHackNode = gecko;
        if (cssCheckWarned)
            return;
        console["warn"]("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package.");
        cssCheckWarned = true;
    }
}
// Used to work around a Safari Selection/shadow DOM bug
// Based on https://github.com/codemirror/dev/issues/414 fix
function safariShadowSelectionRange(view) {
    let found;
    function read(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        found = event.getTargetRanges()[0];
    }
    // Because Safari (at least in 2018-2022) doesn't provide regular
    // access to the selection inside a shadowRoot, we have to perform a
    // ridiculous hack to get at it—using `execCommand` to trigger a
    // `beforeInput` event so that we can read the target range from the
    // event.
    view.dom.addEventListener("beforeinput", read, true);
    document.execCommand("indent");
    view.dom.removeEventListener("beforeinput", read, true);
    let anchorNode = found.startContainer, anchorOffset = found.startOffset;
    let focusNode = found.endContainer, focusOffset = found.endOffset;
    let currentAnchor = view.domAtPos(view.state.selection.anchor);
    // Since such a range doesn't distinguish between anchor and head,
    // use a heuristic that flips it around if its end matches the
    // current anchor.
    if (isEquivalentPosition(currentAnchor.node, currentAnchor.offset, focusNode, focusOffset))
        [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
}

// Note that all referencing and parsing is done with the
// start-of-operation selection and document, since that's the one
// that the DOM represents. If any changes came in in the meantime,
// the modification is mapped over those before it is applied, in
// readDOMChange.
function parseBetween(view, from_, to_) {
    let { node: parent, fromOffset, toOffset, from, to } = view.docView.parseRange(from_, to_);
    let domSel = view.domSelectionRange();
    let find;
    let anchor = domSel.anchorNode;
    if (anchor && view.dom.contains(anchor.nodeType == 1 ? anchor : anchor.parentNode)) {
        find = [{ node: anchor, offset: domSel.anchorOffset }];
        if (!selectionCollapsed(domSel))
            find.push({ node: domSel.focusNode, offset: domSel.focusOffset });
    }
    // Work around issue in Chrome where backspacing sometimes replaces
    // the deleted content with a random BR node (issues #799, #831)
    if (chrome && view.input.lastKeyCode === 8) {
        for (let off = toOffset; off > fromOffset; off--) {
            let node = parent.childNodes[off - 1], desc = node.pmViewDesc;
            if (node.nodeName == "BR" && !desc) {
                toOffset = off;
                break;
            }
            if (!desc || desc.size)
                break;
        }
    }
    let startDoc = view.state.doc;
    let parser = view.someProp("domParser") || DOMParser.fromSchema(view.state.schema);
    let $from = startDoc.resolve(from);
    let sel = null, doc = parser.parse(parent, {
        topNode: $from.parent,
        topMatch: $from.parent.contentMatchAt($from.index()),
        topOpen: true,
        from: fromOffset,
        to: toOffset,
        preserveWhitespace: $from.parent.type.whitespace == "pre" ? "full" : true,
        findPositions: find,
        ruleFromNode,
        context: $from
    });
    if (find && find[0].pos != null) {
        let anchor = find[0].pos, head = find[1] && find[1].pos;
        if (head == null)
            head = anchor;
        sel = { anchor: anchor + from, head: head + from };
    }
    return { doc, sel, from, to };
}
function ruleFromNode(dom) {
    let desc = dom.pmViewDesc;
    if (desc) {
        return desc.parseRule();
    }
    else if (dom.nodeName == "BR" && dom.parentNode) {
        // Safari replaces the list item or table cell with a BR
        // directly in the list node (?!) if you delete the last
        // character in a list item or table cell (#708, #862)
        if (safari && /^(ul|ol)$/i.test(dom.parentNode.nodeName)) {
            let skip = document.createElement("div");
            skip.appendChild(document.createElement("li"));
            return { skip };
        }
        else if (dom.parentNode.lastChild == dom || safari && /^(tr|table)$/i.test(dom.parentNode.nodeName)) {
            return { ignore: true };
        }
    }
    else if (dom.nodeName == "IMG" && dom.getAttribute("mark-placeholder")) {
        return { ignore: true };
    }
    return null;
}
const isInline = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
function readDOMChange(view, from, to, typeOver, addedNodes) {
    let compositionID = view.input.compositionPendingChanges || (view.composing ? view.input.compositionID : 0);
    view.input.compositionPendingChanges = 0;
    if (from < 0) {
        let origin = view.input.lastSelectionTime > Date.now() - 50 ? view.input.lastSelectionOrigin : null;
        let newSel = selectionFromDOM(view, origin);
        if (newSel && !view.state.selection.eq(newSel)) {
            if (chrome && android &&
                view.input.lastKeyCode === 13 && Date.now() - 100 < view.input.lastKeyCodeTime &&
                view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter"))))
                return;
            let tr = view.state.tr.setSelection(newSel);
            if (origin == "pointer")
                tr.setMeta("pointer", true);
            else if (origin == "key")
                tr.scrollIntoView();
            if (compositionID)
                tr.setMeta("composition", compositionID);
            view.dispatch(tr);
        }
        return;
    }
    let $before = view.state.doc.resolve(from);
    let shared = $before.sharedDepth(to);
    from = $before.before(shared + 1);
    to = view.state.doc.resolve(to).after(shared + 1);
    let sel = view.state.selection;
    let parse = parseBetween(view, from, to);
    let doc = view.state.doc, compare = doc.slice(parse.from, parse.to);
    let preferredPos, preferredSide;
    // Prefer anchoring to end when Backspace is pressed
    if (view.input.lastKeyCode === 8 && Date.now() - 100 < view.input.lastKeyCodeTime) {
        preferredPos = view.state.selection.to;
        preferredSide = "end";
    }
    else {
        preferredPos = view.state.selection.from;
        preferredSide = "start";
    }
    view.input.lastKeyCode = null;
    let change = findDiff(compare.content, parse.doc.content, parse.from, preferredPos, preferredSide);
    if ((ios && view.input.lastIOSEnter > Date.now() - 225 || android) &&
        addedNodes.some(n => n.nodeType == 1 && !isInline.test(n.nodeName)) &&
        (!change || change.endA >= change.endB) &&
        view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter")))) {
        view.input.lastIOSEnter = 0;
        return;
    }
    if (!change) {
        if (typeOver && sel instanceof TextSelection && !sel.empty && sel.$head.sameParent(sel.$anchor) &&
            !view.composing && !(parse.sel && parse.sel.anchor != parse.sel.head)) {
            change = { start: sel.from, endA: sel.to, endB: sel.to };
        }
        else {
            if (parse.sel) {
                let sel = resolveSelection(view, view.state.doc, parse.sel);
                if (sel && !sel.eq(view.state.selection)) {
                    let tr = view.state.tr.setSelection(sel);
                    if (compositionID)
                        tr.setMeta("composition", compositionID);
                    view.dispatch(tr);
                }
            }
            return;
        }
    }
    // Chrome sometimes leaves the cursor before the inserted text when
    // composing after a cursor wrapper. This moves it forward.
    if (chrome && view.cursorWrapper && parse.sel && parse.sel.anchor == view.cursorWrapper.deco.from &&
        parse.sel.head == parse.sel.anchor) {
        let size = change.endB - change.start;
        parse.sel = { anchor: parse.sel.anchor + size, head: parse.sel.anchor + size };
    }
    view.input.domChangeCount++;
    // Handle the case where overwriting a selection by typing matches
    // the start or end of the selected content, creating a change
    // that's smaller than what was actually overwritten.
    if (view.state.selection.from < view.state.selection.to &&
        change.start == change.endB &&
        view.state.selection instanceof TextSelection) {
        if (change.start > view.state.selection.from && change.start <= view.state.selection.from + 2 &&
            view.state.selection.from >= parse.from) {
            change.start = view.state.selection.from;
        }
        else if (change.endA < view.state.selection.to && change.endA >= view.state.selection.to - 2 &&
            view.state.selection.to <= parse.to) {
            change.endB += (view.state.selection.to - change.endA);
            change.endA = view.state.selection.to;
        }
    }
    // IE11 will insert a non-breaking space _ahead_ of the space after
    // the cursor space when adding a space before another space. When
    // that happened, adjust the change to cover the space instead.
    if (ie$1 && ie_version <= 11 && change.endB == change.start + 1 &&
        change.endA == change.start && change.start > parse.from &&
        parse.doc.textBetween(change.start - parse.from - 1, change.start - parse.from + 1) == " \u00a0") {
        change.start--;
        change.endA--;
        change.endB--;
    }
    let $from = parse.doc.resolveNoCache(change.start - parse.from);
    let $to = parse.doc.resolveNoCache(change.endB - parse.from);
    let $fromA = doc.resolve(change.start);
    let inlineChange = $from.sameParent($to) && $from.parent.inlineContent && $fromA.end() >= change.endA;
    let nextSel;
    // If this looks like the effect of pressing Enter (or was recorded
    // as being an iOS enter press), just dispatch an Enter key instead.
    if (((ios && view.input.lastIOSEnter > Date.now() - 225 &&
        (!inlineChange || addedNodes.some(n => n.nodeName == "DIV" || n.nodeName == "P"))) ||
        (!inlineChange && $from.pos < parse.doc.content.size && !$from.sameParent($to) &&
            (nextSel = Selection.findFrom(parse.doc.resolve($from.pos + 1), 1, true)) &&
            nextSel.head == $to.pos)) &&
        view.someProp("handleKeyDown", f => f(view, keyEvent(13, "Enter")))) {
        view.input.lastIOSEnter = 0;
        return;
    }
    // Same for backspace
    if (view.state.selection.anchor > change.start &&
        looksLikeJoin(doc, change.start, change.endA, $from, $to) &&
        view.someProp("handleKeyDown", f => f(view, keyEvent(8, "Backspace")))) {
        if (android && chrome)
            view.domObserver.suppressSelectionUpdates(); // #820
        return;
    }
    // Chrome Android will occasionally, during composition, delete the
    // entire composition and then immediately insert it again. This is
    // used to detect that situation.
    if (chrome && android && change.endB == change.start)
        view.input.lastAndroidDelete = Date.now();
    // This tries to detect Android virtual keyboard
    // enter-and-pick-suggestion action. That sometimes (see issue
    // #1059) first fires a DOM mutation, before moving the selection to
    // the newly created block. And then, because ProseMirror cleans up
    // the DOM selection, it gives up moving the selection entirely,
    // leaving the cursor in the wrong place. When that happens, we drop
    // the new paragraph from the initial change, and fire a simulated
    // enter key afterwards.
    if (android && !inlineChange && $from.start() != $to.start() && $to.parentOffset == 0 && $from.depth == $to.depth &&
        parse.sel && parse.sel.anchor == parse.sel.head && parse.sel.head == change.endA) {
        change.endB -= 2;
        $to = parse.doc.resolveNoCache(change.endB - parse.from);
        setTimeout(() => {
            view.someProp("handleKeyDown", function (f) { return f(view, keyEvent(13, "Enter")); });
        }, 20);
    }
    let chFrom = change.start, chTo = change.endA;
    let tr, storedMarks, markChange;
    if (inlineChange) {
        if ($from.pos == $to.pos) { // Deletion
            // IE11 sometimes weirdly moves the DOM selection around after
            // backspacing out the first element in a textblock
            if (ie$1 && ie_version <= 11 && $from.parentOffset == 0) {
                view.domObserver.suppressSelectionUpdates();
                setTimeout(() => selectionToDOM(view), 20);
            }
            tr = view.state.tr.delete(chFrom, chTo);
            storedMarks = doc.resolve(change.start).marksAcross(doc.resolve(change.endA));
        }
        else if ( // Adding or removing a mark
        change.endA == change.endB &&
            (markChange = isMarkChange($from.parent.content.cut($from.parentOffset, $to.parentOffset), $fromA.parent.content.cut($fromA.parentOffset, change.endA - $fromA.start())))) {
            tr = view.state.tr;
            if (markChange.type == "add")
                tr.addMark(chFrom, chTo, markChange.mark);
            else
                tr.removeMark(chFrom, chTo, markChange.mark);
        }
        else if ($from.parent.child($from.index()).isText && $from.index() == $to.index() - ($to.textOffset ? 0 : 1)) {
            // Both positions in the same text node -- simply insert text
            let text = $from.parent.textBetween($from.parentOffset, $to.parentOffset);
            if (view.someProp("handleTextInput", f => f(view, chFrom, chTo, text)))
                return;
            tr = view.state.tr.insertText(text, chFrom, chTo);
        }
    }
    if (!tr)
        tr = view.state.tr.replace(chFrom, chTo, parse.doc.slice(change.start - parse.from, change.endB - parse.from));
    if (parse.sel) {
        let sel = resolveSelection(view, tr.doc, parse.sel);
        // Chrome Android will sometimes, during composition, report the
        // selection in the wrong place. If it looks like that is
        // happening, don't update the selection.
        // Edge just doesn't move the cursor forward when you start typing
        // in an empty block or between br nodes.
        if (sel && !(chrome && android && view.composing && sel.empty &&
            (change.start != change.endB || view.input.lastAndroidDelete < Date.now() - 100) &&
            (sel.head == chFrom || sel.head == tr.mapping.map(chTo) - 1) ||
            ie$1 && sel.empty && sel.head == chFrom))
            tr.setSelection(sel);
    }
    if (storedMarks)
        tr.ensureMarks(storedMarks);
    if (compositionID)
        tr.setMeta("composition", compositionID);
    view.dispatch(tr.scrollIntoView());
}
function resolveSelection(view, doc, parsedSel) {
    if (Math.max(parsedSel.anchor, parsedSel.head) > doc.content.size)
        return null;
    return selectionBetween(view, doc.resolve(parsedSel.anchor), doc.resolve(parsedSel.head));
}
// Given two same-length, non-empty fragments of inline content,
// determine whether the first could be created from the second by
// removing or adding a single mark type.
function isMarkChange(cur, prev) {
    let curMarks = cur.firstChild.marks, prevMarks = prev.firstChild.marks;
    let added = curMarks, removed = prevMarks, type, mark, update;
    for (let i = 0; i < prevMarks.length; i++)
        added = prevMarks[i].removeFromSet(added);
    for (let i = 0; i < curMarks.length; i++)
        removed = curMarks[i].removeFromSet(removed);
    if (added.length == 1 && removed.length == 0) {
        mark = added[0];
        type = "add";
        update = (node) => node.mark(mark.addToSet(node.marks));
    }
    else if (added.length == 0 && removed.length == 1) {
        mark = removed[0];
        type = "remove";
        update = (node) => node.mark(mark.removeFromSet(node.marks));
    }
    else {
        return null;
    }
    let updated = [];
    for (let i = 0; i < prev.childCount; i++)
        updated.push(update(prev.child(i)));
    if (Fragment.from(updated).eq(cur))
        return { mark, type };
}
function looksLikeJoin(old, start, end, $newStart, $newEnd) {
    if (!$newStart.parent.isTextblock ||
        // The content must have shrunk
        end - start <= $newEnd.pos - $newStart.pos ||
        // newEnd must point directly at or after the end of the block that newStart points into
        skipClosingAndOpening($newStart, true, false) < $newEnd.pos)
        return false;
    let $start = old.resolve(start);
    // Start must be at the end of a block
    if ($start.parentOffset < $start.parent.content.size || !$start.parent.isTextblock)
        return false;
    let $next = old.resolve(skipClosingAndOpening($start, true, true));
    // The next textblock must start before end and end near it
    if (!$next.parent.isTextblock || $next.pos > end ||
        skipClosingAndOpening($next, true, false) < end)
        return false;
    // The fragments after the join point must match
    return $newStart.parent.content.cut($newStart.parentOffset).eq($next.parent.content);
}
function skipClosingAndOpening($pos, fromEnd, mayOpen) {
    let depth = $pos.depth, end = fromEnd ? $pos.end() : $pos.pos;
    while (depth > 0 && (fromEnd || $pos.indexAfter(depth) == $pos.node(depth).childCount)) {
        depth--;
        end++;
        fromEnd = false;
    }
    if (mayOpen) {
        let next = $pos.node(depth).maybeChild($pos.indexAfter(depth));
        while (next && !next.isLeaf) {
            next = next.firstChild;
            end++;
        }
    }
    return end;
}
function findDiff(a, b, pos, preferredPos, preferredSide) {
    let start = a.findDiffStart(b, pos);
    if (start == null)
        return null;
    let { a: endA, b: endB } = a.findDiffEnd(b, pos + a.size, pos + b.size);
    if (preferredSide == "end") {
        let adjust = Math.max(0, start - Math.min(endA, endB));
        preferredPos -= endA + adjust - start;
    }
    if (endA < start && a.size < b.size) {
        let move = preferredPos <= start && preferredPos >= endA ? start - preferredPos : 0;
        start -= move;
        endB = start + (endB - endA);
        endA = start;
    }
    else if (endB < start) {
        let move = preferredPos <= start && preferredPos >= endB ? start - preferredPos : 0;
        start -= move;
        endA = start + (endA - endB);
        endB = start;
    }
    return { start, endA, endB };
}
/**
An editor view manages the DOM structure that represents an
editable document. Its state and behavior are determined by its
[props](https://prosemirror.net/docs/ref/#view.DirectEditorProps).
*/
class EditorView {
    /**
    Create a view. `place` may be a DOM node that the editor should
    be appended to, a function that will place it into the document,
    or an object whose `mount` property holds the node to use as the
    document container. If it is `null`, the editor will not be
    added to the document.
    */
    constructor(place, props) {
        this._root = null;
        /**
        @internal
        */
        this.focused = false;
        /**
        Kludge used to work around a Chrome bug @internal
        */
        this.trackWrites = null;
        this.mounted = false;
        /**
        @internal
        */
        this.markCursor = null;
        /**
        @internal
        */
        this.cursorWrapper = null;
        /**
        @internal
        */
        this.lastSelectedViewDesc = undefined;
        /**
        @internal
        */
        this.input = new InputState;
        this.prevDirectPlugins = [];
        this.pluginViews = [];
        /**
        Holds `true` when a hack node is needed in Firefox to prevent the
        [space is eaten issue](https://github.com/ProseMirror/prosemirror/issues/651)
        @internal
        */
        this.requiresGeckoHackNode = false;
        /**
        When editor content is being dragged, this object contains
        information about the dragged slice and whether it is being
        copied or moved. At any other time, it is null.
        */
        this.dragging = null;
        this._props = props;
        this.state = props.state;
        this.directPlugins = props.plugins || [];
        this.directPlugins.forEach(checkStateComponent);
        this.dispatch = this.dispatch.bind(this);
        this.dom = (place && place.mount) || document.createElement("div");
        if (place) {
            if (place.appendChild)
                place.appendChild(this.dom);
            else if (typeof place == "function")
                place(this.dom);
            else if (place.mount)
                this.mounted = true;
        }
        this.editable = getEditable(this);
        updateCursorWrapper(this);
        this.nodeViews = buildNodeViews(this);
        this.docView = docViewDesc(this.state.doc, computeDocDeco(this), viewDecorations(this), this.dom, this);
        this.domObserver = new DOMObserver(this, (from, to, typeOver, added) => readDOMChange(this, from, to, typeOver, added));
        this.domObserver.start();
        initInput(this);
        this.updatePluginViews();
    }
    /**
    Holds `true` when a
    [composition](https://w3c.github.io/uievents/#events-compositionevents)
    is active.
    */
    get composing() { return this.input.composing; }
    /**
    The view's current [props](https://prosemirror.net/docs/ref/#view.EditorProps).
    */
    get props() {
        if (this._props.state != this.state) {
            let prev = this._props;
            this._props = {};
            for (let name in prev)
                this._props[name] = prev[name];
            this._props.state = this.state;
        }
        return this._props;
    }
    /**
    Update the view's props. Will immediately cause an update to
    the DOM.
    */
    update(props) {
        if (props.handleDOMEvents != this._props.handleDOMEvents)
            ensureListeners(this);
        let prevProps = this._props;
        this._props = props;
        if (props.plugins) {
            props.plugins.forEach(checkStateComponent);
            this.directPlugins = props.plugins;
        }
        this.updateStateInner(props.state, prevProps);
    }
    /**
    Update the view by updating existing props object with the object
    given as argument. Equivalent to `view.update(Object.assign({},
    view.props, props))`.
    */
    setProps(props) {
        let updated = {};
        for (let name in this._props)
            updated[name] = this._props[name];
        updated.state = this.state;
        for (let name in props)
            updated[name] = props[name];
        this.update(updated);
    }
    /**
    Update the editor's `state` prop, without touching any of the
    other props.
    */
    updateState(state) {
        this.updateStateInner(state, this._props);
    }
    updateStateInner(state, prevProps) {
        let prev = this.state, redraw = false, updateSel = false;
        // When stored marks are added, stop composition, so that they can
        // be displayed.
        if (state.storedMarks && this.composing) {
            clearComposition(this);
            updateSel = true;
        }
        this.state = state;
        let pluginsChanged = prev.plugins != state.plugins || this._props.plugins != prevProps.plugins;
        if (pluginsChanged || this._props.plugins != prevProps.plugins || this._props.nodeViews != prevProps.nodeViews) {
            let nodeViews = buildNodeViews(this);
            if (changedNodeViews(nodeViews, this.nodeViews)) {
                this.nodeViews = nodeViews;
                redraw = true;
            }
        }
        if (pluginsChanged || prevProps.handleDOMEvents != this._props.handleDOMEvents) {
            ensureListeners(this);
        }
        this.editable = getEditable(this);
        updateCursorWrapper(this);
        let innerDeco = viewDecorations(this), outerDeco = computeDocDeco(this);
        let scroll = prev.plugins != state.plugins && !prev.doc.eq(state.doc) ? "reset"
            : state.scrollToSelection > prev.scrollToSelection ? "to selection" : "preserve";
        let updateDoc = redraw || !this.docView.matchesNode(state.doc, outerDeco, innerDeco);
        if (updateDoc || !state.selection.eq(prev.selection))
            updateSel = true;
        let oldScrollPos = scroll == "preserve" && updateSel && this.dom.style.overflowAnchor == null && storeScrollPos(this);
        if (updateSel) {
            this.domObserver.stop();
            // Work around an issue in Chrome, IE, and Edge where changing
            // the DOM around an active selection puts it into a broken
            // state where the thing the user sees differs from the
            // selection reported by the Selection object (#710, #973,
            // #1011, #1013, #1035).
            let forceSelUpdate = updateDoc && (ie$1 || chrome) && !this.composing &&
                !prev.selection.empty && !state.selection.empty && selectionContextChanged(prev.selection, state.selection);
            if (updateDoc) {
                // If the node that the selection points into is written to,
                // Chrome sometimes starts misreporting the selection, so this
                // tracks that and forces a selection reset when our update
                // did write to the node.
                let chromeKludge = chrome ? (this.trackWrites = this.domSelectionRange().focusNode) : null;
                if (redraw || !this.docView.update(state.doc, outerDeco, innerDeco, this)) {
                    this.docView.updateOuterDeco([]);
                    this.docView.destroy();
                    this.docView = docViewDesc(state.doc, outerDeco, innerDeco, this.dom, this);
                }
                if (chromeKludge && !this.trackWrites)
                    forceSelUpdate = true;
            }
            // Work around for an issue where an update arriving right between
            // a DOM selection change and the "selectionchange" event for it
            // can cause a spurious DOM selection update, disrupting mouse
            // drag selection.
            if (forceSelUpdate ||
                !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) &&
                    anchorInRightPlace(this))) {
                selectionToDOM(this, forceSelUpdate);
            }
            else {
                syncNodeSelection(this, state.selection);
                this.domObserver.setCurSelection();
            }
            this.domObserver.start();
        }
        this.updatePluginViews(prev);
        if (scroll == "reset") {
            this.dom.scrollTop = 0;
        }
        else if (scroll == "to selection") {
            this.scrollToSelection();
        }
        else if (oldScrollPos) {
            resetScrollPos(oldScrollPos);
        }
    }
    /**
    @internal
    */
    scrollToSelection() {
        let startDOM = this.domSelectionRange().focusNode;
        if (this.someProp("handleScrollToSelection", f => f(this))) ;
        else if (this.state.selection instanceof NodeSelection) {
            let target = this.docView.domAfterPos(this.state.selection.from);
            if (target.nodeType == 1)
                scrollRectIntoView(this, target.getBoundingClientRect(), startDOM);
        }
        else {
            scrollRectIntoView(this, this.coordsAtPos(this.state.selection.head, 1), startDOM);
        }
    }
    destroyPluginViews() {
        let view;
        while (view = this.pluginViews.pop())
            if (view.destroy)
                view.destroy();
    }
    updatePluginViews(prevState) {
        if (!prevState || prevState.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
            this.prevDirectPlugins = this.directPlugins;
            this.destroyPluginViews();
            for (let i = 0; i < this.directPlugins.length; i++) {
                let plugin = this.directPlugins[i];
                if (plugin.spec.view)
                    this.pluginViews.push(plugin.spec.view(this));
            }
            for (let i = 0; i < this.state.plugins.length; i++) {
                let plugin = this.state.plugins[i];
                if (plugin.spec.view)
                    this.pluginViews.push(plugin.spec.view(this));
            }
        }
        else {
            for (let i = 0; i < this.pluginViews.length; i++) {
                let pluginView = this.pluginViews[i];
                if (pluginView.update)
                    pluginView.update(this, prevState);
            }
        }
    }
    someProp(propName, f) {
        let prop = this._props && this._props[propName], value;
        if (prop != null && (value = f ? f(prop) : prop))
            return value;
        for (let i = 0; i < this.directPlugins.length; i++) {
            let prop = this.directPlugins[i].props[propName];
            if (prop != null && (value = f ? f(prop) : prop))
                return value;
        }
        let plugins = this.state.plugins;
        if (plugins)
            for (let i = 0; i < plugins.length; i++) {
                let prop = plugins[i].props[propName];
                if (prop != null && (value = f ? f(prop) : prop))
                    return value;
            }
    }
    /**
    Query whether the view has focus.
    */
    hasFocus() {
        // Work around IE not handling focus correctly if resize handles are shown.
        // If the cursor is inside an element with resize handles, activeElement
        // will be that element instead of this.dom.
        if (ie$1) {
            // If activeElement is within this.dom, and there are no other elements
            // setting `contenteditable` to false in between, treat it as focused.
            let node = this.root.activeElement;
            if (node == this.dom)
                return true;
            if (!node || !this.dom.contains(node))
                return false;
            while (node && this.dom != node && this.dom.contains(node)) {
                if (node.contentEditable == 'false')
                    return false;
                node = node.parentElement;
            }
            return true;
        }
        return this.root.activeElement == this.dom;
    }
    /**
    Focus the editor.
    */
    focus() {
        this.domObserver.stop();
        if (this.editable)
            focusPreventScroll(this.dom);
        selectionToDOM(this);
        this.domObserver.start();
    }
    /**
    Get the document root in which the editor exists. This will
    usually be the top-level `document`, but might be a [shadow
    DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
    root if the editor is inside one.
    */
    get root() {
        let cached = this._root;
        if (cached == null)
            for (let search = this.dom.parentNode; search; search = search.parentNode) {
                if (search.nodeType == 9 || (search.nodeType == 11 && search.host)) {
                    if (!search.getSelection)
                        Object.getPrototypeOf(search).getSelection = () => search.ownerDocument.getSelection();
                    return this._root = search;
                }
            }
        return cached || document;
    }
    /**
    When an existing editor view is moved to a new document or
    shadow tree, call this to make it recompute its root.
    */
    updateRoot() {
        this._root = null;
    }
    /**
    Given a pair of viewport coordinates, return the document
    position that corresponds to them. May return null if the given
    coordinates aren't inside of the editor. When an object is
    returned, its `pos` property is the position nearest to the
    coordinates, and its `inside` property holds the position of the
    inner node that the position falls inside of, or -1 if it is at
    the top level, not in any node.
    */
    posAtCoords(coords) {
        return posAtCoords(this, coords);
    }
    /**
    Returns the viewport rectangle at a given document position.
    `left` and `right` will be the same number, as this returns a
    flat cursor-ish rectangle. If the position is between two things
    that aren't directly adjacent, `side` determines which element
    is used. When < 0, the element before the position is used,
    otherwise the element after.
    */
    coordsAtPos(pos, side = 1) {
        return coordsAtPos(this, pos, side);
    }
    /**
    Find the DOM position that corresponds to the given document
    position. When `side` is negative, find the position as close as
    possible to the content before the position. When positive,
    prefer positions close to the content after the position. When
    zero, prefer as shallow a position as possible.
    
    Note that you should **not** mutate the editor's internal DOM,
    only inspect it (and even that is usually not necessary).
    */
    domAtPos(pos, side = 0) {
        return this.docView.domFromPos(pos, side);
    }
    /**
    Find the DOM node that represents the document node after the
    given position. May return `null` when the position doesn't point
    in front of a node or if the node is inside an opaque node view.
    
    This is intended to be able to call things like
    `getBoundingClientRect` on that DOM node. Do **not** mutate the
    editor DOM directly, or add styling this way, since that will be
    immediately overriden by the editor as it redraws the node.
    */
    nodeDOM(pos) {
        let desc = this.docView.descAt(pos);
        return desc ? desc.nodeDOM : null;
    }
    /**
    Find the document position that corresponds to a given DOM
    position. (Whenever possible, it is preferable to inspect the
    document structure directly, rather than poking around in the
    DOM, but sometimes—for example when interpreting an event
    target—you don't have a choice.)
    
    The `bias` parameter can be used to influence which side of a DOM
    node to use when the position is inside a leaf node.
    */
    posAtDOM(node, offset, bias = -1) {
        let pos = this.docView.posFromDOM(node, offset, bias);
        if (pos == null)
            throw new RangeError("DOM position not inside the editor");
        return pos;
    }
    /**
    Find out whether the selection is at the end of a textblock when
    moving in a given direction. When, for example, given `"left"`,
    it will return true if moving left from the current cursor
    position would leave that position's parent textblock. Will apply
    to the view's current state by default, but it is possible to
    pass a different state.
    */
    endOfTextblock(dir, state) {
        return endOfTextblock(this, state || this.state, dir);
    }
    /**
    Run the editor's paste logic with the given HTML string. The
    `event`, if given, will be passed to the
    [`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
    */
    pasteHTML(html, event) {
        return doPaste(this, "", html, false, event || new ClipboardEvent("paste"));
    }
    /**
    Run the editor's paste logic with the given plain-text input.
    */
    pasteText(text, event) {
        return doPaste(this, text, null, true, event || new ClipboardEvent("paste"));
    }
    /**
    Removes the editor from the DOM and destroys all [node
    views](https://prosemirror.net/docs/ref/#view.NodeView).
    */
    destroy() {
        if (!this.docView)
            return;
        destroyInput(this);
        this.destroyPluginViews();
        if (this.mounted) {
            this.docView.update(this.state.doc, [], viewDecorations(this), this);
            this.dom.textContent = "";
        }
        else if (this.dom.parentNode) {
            this.dom.parentNode.removeChild(this.dom);
        }
        this.docView.destroy();
        this.docView = null;
    }
    /**
    This is true when the view has been
    [destroyed](https://prosemirror.net/docs/ref/#view.EditorView.destroy) (and thus should not be
    used anymore).
    */
    get isDestroyed() {
        return this.docView == null;
    }
    /**
    Used for testing.
    */
    dispatchEvent(event) {
        return dispatchEvent(this, event);
    }
    /**
    Dispatch a transaction. Will call
    [`dispatchTransaction`](https://prosemirror.net/docs/ref/#view.DirectEditorProps.dispatchTransaction)
    when given, and otherwise defaults to applying the transaction to
    the current state and calling
    [`updateState`](https://prosemirror.net/docs/ref/#view.EditorView.updateState) with the result.
    This method is bound to the view instance, so that it can be
    easily passed around.
    */
    dispatch(tr) {
        let dispatchTransaction = this._props.dispatchTransaction;
        if (dispatchTransaction)
            dispatchTransaction.call(this, tr);
        else
            this.updateState(this.state.apply(tr));
    }
    /**
    @internal
    */
    domSelectionRange() {
        return safari && this.root.nodeType === 11 && deepActiveElement(this.dom.ownerDocument) == this.dom
            ? safariShadowSelectionRange(this) : this.domSelection();
    }
    /**
    @internal
    */
    domSelection() {
        return this.root.getSelection();
    }
}
function computeDocDeco(view) {
    let attrs = Object.create(null);
    attrs.class = "ProseMirror";
    attrs.contenteditable = String(view.editable);
    view.someProp("attributes", value => {
        if (typeof value == "function")
            value = value(view.state);
        if (value)
            for (let attr in value) {
                if (attr == "class")
                    attrs.class += " " + value[attr];
                else if (attr == "style")
                    attrs.style = (attrs.style ? attrs.style + ";" : "") + value[attr];
                else if (!attrs[attr] && attr != "contenteditable" && attr != "nodeName")
                    attrs[attr] = String(value[attr]);
            }
    });
    if (!attrs.translate)
        attrs.translate = "no";
    return [Decoration.node(0, view.state.doc.content.size, attrs)];
}
function updateCursorWrapper(view) {
    if (view.markCursor) {
        let dom = document.createElement("img");
        dom.className = "ProseMirror-separator";
        dom.setAttribute("mark-placeholder", "true");
        dom.setAttribute("alt", "");
        view.cursorWrapper = { dom, deco: Decoration.widget(view.state.selection.head, dom, { raw: true, marks: view.markCursor }) };
    }
    else {
        view.cursorWrapper = null;
    }
}
function getEditable(view) {
    return !view.someProp("editable", value => value(view.state) === false);
}
function selectionContextChanged(sel1, sel2) {
    let depth = Math.min(sel1.$anchor.sharedDepth(sel1.head), sel2.$anchor.sharedDepth(sel2.head));
    return sel1.$anchor.start(depth) != sel2.$anchor.start(depth);
}
function buildNodeViews(view) {
    let result = Object.create(null);
    function add(obj) {
        for (let prop in obj)
            if (!Object.prototype.hasOwnProperty.call(result, prop))
                result[prop] = obj[prop];
    }
    view.someProp("nodeViews", add);
    view.someProp("markViews", add);
    return result;
}
function changedNodeViews(a, b) {
    let nA = 0, nB = 0;
    for (let prop in a) {
        if (a[prop] != b[prop])
            return true;
        nA++;
    }
    for (let _ in b)
        nB++;
    return nA != nB;
}
function checkStateComponent(plugin) {
    if (plugin.spec.state || plugin.spec.filterTransaction || plugin.spec.appendTransaction)
        throw new RangeError("Plugins passed directly to the view must not have a state component");
}

function debounce(f, timeoutMS) {
    let lastcall;
    return (...args) => {
        // not yet called || called a while ago
        if (!lastcall || lastcall + timeoutMS < performance.now()) {
            lastcall = performance.now();
            window.setTimeout(() => f(...args), timeoutMS);
        }
    };
}

/**
 * Track if mouse is pressed in element,
 * and released in OR out of element
 */
class MouseStatus {
    constructor(host) {
        this.isup = false;
        this.isdown = false;
        this.onMouseUp = () => {
            this.isup = true;
            // if mouse is released anywhere
            // after being pressed from within the element
            // trigger an update
            if (this.isdown) {
                this.isdown = false;
                this.host.requestUpdate();
            }
        };
        (this.host = host).addController(this);
        this.isup = true;
    }
    hostConnected() {
        this.host.addEventListener("mousedown", (event) => {
            this.isup = false;
            this.isdown = true;
        });
        // in Firefox, "this.host.addEventListener" is enough
        // but not in Chrome => need to tie the event to document
        document.addEventListener("mouseup", this.onMouseUp);
    }
    hostDisconnected() {
        document.removeEventListener("mouseup", this.onMouseUp);
    }
}
/**
 * FocusStatus will set hasfocus to true
 * Get focus by clicking the element
 * Lose focus by clicking outside the element AND its children
 *
 * @example Clicking the text editor will get the focus
 * Clicking on the tooltip menu will keep the focus
 * Clicking outside of both will lose the focus
 *
 * /!\ If we later move the tooltip-editor to the body,
 * via a portal or another solution
 * where it's not a children of the editor anymore
 * we will need to improve this solution
 */
class FocusStatus {
    constructor(host) {
        this.hasfocus = false;
        (this.host = host).addController(this);
    }
    hostConnected() {
        this.host.addEventListener("focus", (event) => {
            this.hasfocus = true;
        });
        this.host.addEventListener("blur", (event) => {
            // focus is lost for a component that is not a child of the menu
            // NOTE: if the tooltip is not a child of the editor anymore,
            // we might want to handle this logic differently and check if the target is children of the tooltip
            const leavingEditor = !event.relatedTarget ||
                (event.relatedTarget &&
                    !this.host.contains(event.relatedTarget));
            if (leavingEditor) {
                this.hasfocus = false;
                this.host.requestUpdate();
            }
        });
    }
}

// filesAttach returns the stream of file items attached to a drop event.
// depending on the browser, we automatically migrate from items to files.
// cf https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#process_the_drop
function filesAttached(ev) {
    if (!ev.dataTransfer)
        return [];
    if (ev.dataTransfer.items) {
        return [...ev.dataTransfer.items]
            .filter((item) => item.kind === "file")
            .map((item) => item.getAsFile())
            .filter((f) => !!f); // TS not infering filter
    }
    else {
        // Use DataTransfer interface to access the file(s)
        return [...ev.dataTransfer.files];
    }
}
async function uploadFile(e, notebook) {
    e.preventDefault();
    e.stopPropagation();
    const [file] = filesAttached(e);
    if (!file) {
        console.error("No data on file");
        throw new Error("No file data");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    const res = await fetch(`/api/datasource?action=save&type=upload&title=${file.name}&notebook=${notebook}`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) {
        console.error(`Error uploading file: ${res.statusText}`);
        throw new Error(`Failed to upload file: ${res.statusText}`);
    }
    const data = await res.json();
    return { dataSource: data.Streams[0], title: file.name };
}

const dispatchCreateCell = customEventDispatcher("create-cell");
const DATASOURCE_LOAD = "datasourceload";
function hasDatasourceData(ev) {
    const types = ev.dataTransfer?.types;
    if (!types)
        return false;
    if (types.includes(DATASOURCE_LOAD))
        return true;
    return filesAttached(ev).length > 0;
}
async function getDatasourceDragData(ev, notebookId) {
    const datasourceDefStr = ev.dataTransfer?.getData(DATASOURCE_LOAD);
    let datasourceDef = null;
    if (filesAttached(ev).length > 0) {
        datasourceDef = await uploadFile(ev, notebookId);
    }
    else {
        if (!datasourceDefStr) {
            return null;
        }
        datasourceDef = JSON.parse(datasourceDefStr);
    }
    return datasourceDef;
}
const CELL_DATA = "celldata";
function setCellDragData(ev, data) {
    if (!ev.dataTransfer) {
        throw new Error("setCellDragData can only be called in a dragStart event");
    }
    ev.dataTransfer.clearData();
    ev.dataTransfer.effectAllowed = "copy";
    ev.dataTransfer.setData(CELL_DATA, JSON.stringify(data));
}
function hasCellData(ev) {
    return !!ev.dataTransfer?.types.includes(CELL_DATA);
}
function getCellDragData(ev) {
    const cell = ev.dataTransfer?.getData(CELL_DATA);
    if (!cell) {
        return null;
    }
    return JSON.parse(cell);
}

function hasPillData(e) {
    return hasPivotData(e) || hasCellData(e); // add the check needed for each entity here
}
function acceptPillDrop(e) {
    return acceptDrop(e, (e) => {
        return hasPillData(e);
    });
}
function getPillAttrs(e) {
    let attrs;
    if (hasPivotData(e)) {
        const pivot = getPivotDragData(e);
        attrs = {
            "data-type": "pivot",
            "data-entity-json": JSON.stringify(pivot),
        };
    }
    else if (hasCellData(e)) {
        const cell = getCellDragData(e);
        attrs = {
            "data-type": "cell",
            "data-entity-json": JSON.stringify(cell),
        };
    }
    else {
        throw new Error(`Dropped element is neither a pivot or a cell, can't insert in text editor`);
    }
    return attrs;
}
/**
 * ProseMirror command to move a pill after a drop
 */
function movePillCmd(dragPos, dropPos, e) {
    return function (state, dispatch) {
        // why dispatch can be undefined?
        if (!dispatch)
            return false;
        const attrs = getPillAttrs(e);
        const pill = state.schema.nodes.pill.create(attrs);
        const tr = state.tr;
        // moving = remove pill at old position and insert into new position
        tr.delete(dragPos, dragPos + 1);
        tr.insert(dropPos, pill);
        dispatch(tr);
        return true;
    };
}
/**
 * ProseMirror command to insert a new pill after a drop
 */
function insertPillCmd(pos, e) {
    return function (state, dispatch) {
        // why dispatch can be undefined?
        if (!dispatch)
            return false;
        const attrs = getPillAttrs(e);
        const pill = state.schema.nodes.pill.create(attrs);
        dispatch(state.tr.insert(pos, pill));
        return true;
    };
}

/**
 * Pill text for export (not used when rendering within the editor, only when copy pasting)
 * @param node
 * @returns
 */
function getPillText(node) {
    const attrs = node.attrs;
    const pillType = node.attrs["data-type"];
    const dataStr = attrs["data-entity-json"];
    switch (pillType) {
        case "pivot":
            const pivot = JSON.parse(dataStr);
            return pivot.value;
        case "cell":
            const cell = JSON.parse(dataStr);
            return cell.Title;
        case "user":
            const user = JSON.parse(dataStr);
            return user.Name;
        case "playbook":
            const playbook = JSON.parse(dataStr);
            return playbook.Title || playbook.ID;
        default:
            return "datapill";
    }
}
const pillNodes = {
    pill: {
        // this prevents user to change the entity value
        // if edition is needed, implement it in the web component that represents the entity instead
        atom: true,
        // allow to drag without a first click to select the pill
        draggable: true,
        group: "inline",
        inline: true,
        selectable: true,
        attrs: {
            "data-entity-json": {},
            "data-type": {},
            // trick to get TS validation for the field names
        },
        // Used only for copy-pasting, not actual rendering which is delegated to a NodeView
        // => render here whatever is useful to parse back
        // and display the pill correctly when pasted outside of the editor
        toDOM(node) {
            return [
                // Fake custom element => this just to make the match easier during "parseDOM"
                // When pasting outside of the editor, it will simply display the content of the node
                "wt-clipboard-datapill",
                {
                    "data-type": node.attrs["data-type"],
                    "data-entity-json": node.attrs["data-entity-json"],
                },
                getPillText(node),
            ];
        },
        // This parsing logic is triggered when copy pasting from within the cell
        // TODO: this is a palliative, ideally we should avoid parsing pills from HTML
        // (prosemirror handles drag and drop within the editor better than copy-paste)
        parseDOM: [
            {
                tag: "wt-clipboard-datapill",
                getAttrs: (domNode) => {
                    if (!(domNode instanceof HTMLElement))
                        return false;
                    return {
                        "data-entity-json": domNode.getAttribute("data-entity-json"),
                        // @ts-ignore
                        "data-type": domNode.getAttribute("data-type"),
                    };
                },
            },
        ],
    },
    search_pill: {
        atom: true,
        group: "inline",
        inline: true,
        selectable: false,
        draggable: false,
    },
}; // trick to get both a closed list of nodes and validation

const hole = 0;
function getAttributes(dom) {
    if (typeof dom === "string")
        return false;
    const result = {};
    const attributes = dom.attributes;
    let attr;
    for (let i = 0; i < attributes.length; i++) {
        attr = attributes[i];
        result[attr.name] = attr.value;
    }
    return result;
}
function commonAttributes() {
    return {
        style: { default: null },
        class: { default: null },
        id: { default: null },
    };
}
function hasAttrs(attrs, exclude) {
    for (const attr in attrs) {
        if (attr && attrs[attr] !== null && attr !== exclude) {
            return true;
        }
    }
    return false;
}
function omit(attrs, exclude) {
    const result = {};
    for (const attr in attrs) {
        if (attr && attrs[attr] !== null && attr !== exclude) {
            result[attr] = attrs[attr];
        }
    }
    return result;
}

/**
 * schema is used by all elements that must manipulate the editor content
 * => be careful to avoid circular dependencies:
 * isolate code that defines the schema
 * from code that consumes it (components, commands)
 */
const nodes = {
    doc: { content: "block+" },
    paragraph: {
        content: "inline*",
        group: "block",
        parseDOM: [{ tag: "p" }],
        toDOM() {
            return ["p", 0];
        },
    },
    // NOTE: we don't support code explicitely "code" blocks,
    // pre tag is more general
    pre: {
        content: "block*",
        group: "block",
        defining: true,
        parseDOM: [{ tag: "pre" }],
        toDOM() {
            return ["pre", { class: "px-1 bg-zinc-200 dark:bg-zinc-700" }, 0];
        },
    },
    blockquote: {
        content: "block+",
        group: "block",
        defining: true,
        parseDOM: [{ tag: "blockquote" }],
        toDOM() {
            return ["blockquote", { class: "pl-2 border-l-2 border-zinc-200" }, 0];
        },
    },
    heading: {
        attrs: { level: { default: 1 } },
        content: "inline*",
        group: "block",
        defining: true,
        parseDOM: [
            { tag: "h1", attrs: { level: 1 } },
            { tag: "h2", attrs: { level: 2 } },
            { tag: "h3", attrs: { level: 3 } },
        ],
        toDOM(node) {
            const level = node.attrs.level;
            if (level < 1 || level > 6) {
                console.warn(`Found an invalid level for a heading: ${level}, will fallback to a paragraph`);
                return ["p", 0];
            }
            return ["h" + node.attrs.level, 0];
        },
    },
    text: { group: "inline" },
    // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
    // `alt`, and `href` attributes. The latter two default to the empty
    // string.
    image: {
        inline: true,
        attrs: {
            src: {},
            alt: { default: null },
            title: { default: null },
        },
        group: "inline",
        draggable: true,
        parseDOM: [
            {
                tag: "img[src]",
                getAttrs(dom) {
                    return {
                        src: dom.getAttribute("src"),
                        title: dom.getAttribute("title"),
                        alt: dom.getAttribute("alt"),
                    };
                },
            },
        ],
        toDOM(node) {
            let { src, alt, title } = node.attrs;
            return ["img", { src, alt, title }];
        },
    },
    hard_break: {
        inline: true,
        group: "inline",
        selectable: false,
        parseDOM: [{ tag: "br" }],
        toDOM() {
            return ["br"];
        },
    },
    // order matters: more specific list types must be before the generic list types
    // otherwise "parseDOM" will ignore them and always prefer a generic list
    task_list: {
        content: "task_list_item+",
        group: "block",
        attrs: { ...commonAttributes() },
        toDOM: (_node) => ["ul", { class: "tasklist" }, 0],
        // parseDOM is needed to allow copy-pasting
        parseDOM: [
            {
                tag: "ul",
                getAttrs(node) {
                    assertNodeHTML(node);
                    if (node.classList.contains("tasklist"))
                        return getAttributes(node);
                    return false;
                },
            },
        ],
    },
    task_list_item: {
        content: "block*",
        attrs: { ...commonAttributes(), checked: { default: false } },
        defining: true,
        // task_list_item uses a NodeView but toDOM is still needed for copy-pasting
        toDOM: (_node) => ["li", { class: "tasklist_item" }, 0],
        parseDOM: [
            {
                tag: "li",
                getAttrs(node) {
                    assertNodeHTML(node);
                    if (node.classList.contains("tasklist-item"))
                        return getAttributes(node);
                    return false;
                },
            },
        ],
    },
    ordered_list: {
        content: "list_item+",
        group: "block",
        attrs: {
            ...commonAttributes(),
            type: { default: null },
            order: { default: 1 },
        },
        parseDOM: [
            {
                tag: "ol",
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement))
                        return false;
                    return {
                        ...getAttributes(dom),
                        order: dom.hasAttribute("start")
                            ? parseInt(dom.getAttribute("start") || "1", 10)
                            : 1,
                    };
                },
            },
        ],
        toDOM: (node) => {
            return node.attrs.order === 1
                ? hasAttrs(node.attrs, "order")
                    ? ["ol", omit(node.attrs, "order"), hole]
                    : ["ol", hole]
                : [
                    "ol",
                    { ...omit(node.attrs, "order"), start: node.attrs.order },
                    hole,
                ];
        },
    },
    bullet_list: {
        content: "list_item+",
        group: "block",
        attrs: { ...commonAttributes() },
        parseDOM: [{ tag: "ul", getAttrs: getAttributes }],
        toDOM: (node) => hasAttrs(node.attrs) ? ["ul", omit(node.attrs), hole] : ["ul", 0],
    },
    list_item: {
        content: "block*",
        attrs: { ...commonAttributes() },
        parseDOM: [{ tag: "li", getAttrs: getAttributes }],
        toDOM: (node) => hasAttrs(node.attrs) ? ["li", omit(node.attrs), hole] : ["li", 0],
        defining: true,
    },
    ...pillNodes,
};
/**
 * Used both for styling and DOM parsing
 * => changing these names will break existing editor text
 * => do not use specific Tailwind colors here
 */
const colorClasses = {
    yellow: `text-qualitative-yellow`,
    red: `text-qualitative-red`,
    green: `text-qualitative-green`,
};
function assertNodeHTML(node) {
    if (!(node instanceof HTMLElement))
        throw new Error(`Expected an HTML Element, got ${node && typeof node}.`);
}
/**
 * Check that the element matches a given color
 * + select the attribute
 *
 * Note: in prosemirror parseDOM, "attrs" is NOT a matcher, it only select preserved attributes
 * We need "getAttrs" to actually match a color based on an element attributes (+ select preserved attributes)
 * @param color
 * @returns
 */
function matchColorAttrs(color) {
    return function getAttrs(node) {
        assertNodeHTML(node);
        const expectedClass = colorClasses[color];
        const hasColor = node.classList.contains(expectedClass);
        if (!hasColor)
            return false;
        // will remove all node attributes
        // (the color class will be reintroduced later on by "toDOM")
        return null;
    };
}
const marks = {
    link: {
        attrs: {
            href: {},
            title: { default: null },
            contentEditable: { default: false },
        },
        inclusive: false,
        parseDOM: [
            {
                tag: "a[href]",
                getAttrs(dom) {
                    return {
                        contentEditable: dom.getAttribute("contentEditable"),
                        href: dom.getAttribute("href"),
                        title: dom.getAttribute("title"),
                    };
                },
            },
        ],
        toDOM(node) {
            let { contentEditable, href, title } = node.attrs;
            return ["a", { contentEditable, href, title }, 0];
        },
    },
    // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
    // Has parse rules that also match `<i>` and `font-style: italic`.
    em: {
        parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
        toDOM() {
            return ["em", 0];
        },
    },
    // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
    // also match `<b>` and `font-weight: bold`.
    strong: {
        parseDOM: [
            { tag: "strong" },
            // This works around a Google Docs misbehavior where
            // pasted content will be inexplicably wrapped in `<b>`
            // tags with a font-weight normal.
            {
                tag: "b",
                getAttrs: (node) => node.style.fontWeight != "normal" && null,
            },
            {
                style: "font-weight",
                getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
            },
        ],
        toDOM() {
            return ["strong", 0];
        },
    },
    underline: {
        parseDOM: [{ tag: "u" }],
        toDOM() {
            return ["u", 0];
        },
    },
    colour_red: {
        parseDOM: [{ tag: "span", getAttrs: matchColorAttrs("red") }],
        toDOM() {
            return ["span", { class: colorClasses["red"] }, 0];
        },
    },
    colour_yellow: {
        parseDOM: [{ tag: "span", getAttrs: matchColorAttrs("yellow") }],
        toDOM() {
            return ["span", { class: colorClasses["yellow"] }, 0];
        },
    },
    colour_green: {
        parseDOM: [{ tag: "span", getAttrs: matchColorAttrs("green") }],
        toDOM() {
            return ["span", { class: colorClasses["green"] }, 0];
        },
    },
}; // allows to get both a closed list of marks and validation of the values
const schema = new Schema({ nodes, marks });
const colorMarks = [
    schema.marks.colour_red,
    schema.marks.colour_yellow,
    schema.marks.colour_green,
];
const listNodes = [
    schema.nodes.bullet_list,
    schema.nodes.ordered_list,
    schema.nodes.task_list,
];
/**
 * Listing listItemNodes allow to add the shortcuts that creates a new item on "Enter"
 */
const listItemNodes = [
    schema.nodes.task_list_item,
    schema.nodes.list_item,
];

// prosemirror commands are NOT composable
// we need to extract internal code if we want to reuse their logic
// => feel free to refactor this file to extract whatever utility is needed to build new commands
// => however please try to keep the exported commands API consistent 
// so we can later on propose upstream change in prosemirror
// @see  https://discuss.prosemirror.net/t/refactor-commands-into-transform-helpers/479/14
function atBlockStart(state, view) {
    let { $cursor } = state.selection;
    if (!$cursor || (view ? !view.endOfTextblock("backward", state)
        : $cursor.parentOffset > 0))
        return null;
    return $cursor;
}
/**
 * @param acceptedTypes An optional whitelist of accepted node type
 * Without this parameter, the merged node will adopt the type of the upward node
 */
const joinUpTr = (tr, acceptedTypes) => {
    let sel = tr.selection, nodeSel = sel instanceof NodeSelection, point;
    if (nodeSel) {
        if (sel.node.isTextblock || !canJoin(tr.doc, sel.from))
            return false;
        point = sel.from;
    }
    else {
        point = joinPoint(tr.doc, sel.from, -1);
        if (point == null)
            return false;
    }
    // nodeBefore has to be defined since we found a joinPoint
    const nodeBefore = tr.doc.resolve(point).nodeBefore;
    if (acceptedTypes && !acceptedTypes.includes(nodeBefore.type))
        return false;
    tr.join(point);
    if (nodeSel)
        tr.setSelection(NodeSelection.create(tr.doc, point - nodeBefore.nodeSize));
    tr.scrollIntoView();
    return tr;
};
const joinDownTr = (tr, acceptedTypes) => {
    let sel = tr.selection, point;
    if (sel instanceof NodeSelection) {
        if (sel.node.isTextblock || !canJoin(tr.doc, sel.to))
            return false;
        point = sel.to;
    }
    else {
        point = joinPoint(tr.doc, sel.to, 1);
        if (point == null)
            return false;
    }
    // nodeAfter has to exist otherwise joinPoint would return null
    const nodeAfter = tr.doc.resolve(point).nodeAfter;
    if (acceptedTypes && !acceptedTypes.includes(nodeAfter.type))
        return false;
    // contrary to joining up, join down doesn't need a selection update
    return tr.join(point).scrollIntoView();
};
/// Combine a number of command functions into a single function (which
/// calls them one by one until one returns true).
function chainCommands(...commands) {
    return function (state, dispatch, view) {
        for (let i = 0; i < commands.length; i++)
            if (commands[i](state, dispatch, view))
                return true;
        return false;
    };
}
typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
    // @ts-ignore
    : typeof os != "undefined" && os.platform ? os.platform() == "darwin" : false;

// prosemirror commands are NOT composable
// we need to extract internal code if we want to reuse their logic
// => feel free to refactor this file to extract whatever utility is needed to build new commands
// => however please try to keep the exported commands API consistent
// so we can later on propose upstream change in prosemirror
// @see  https://discuss.prosemirror.net/t/refactor-commands-into-transform-helpers/479/14
function wrapInListTr(tr, listType, attrs = null) {
    let { $from, $to } = tr.selection;
    let range = $from.blockRange($to), doJoin = false, outerRange = range;
    if (!range)
        return false;
    // This is at the top of an existing list item
    if (range.depth >= 2 &&
        $from.node(range.depth - 1).type.compatibleContent(listType) &&
        range.startIndex == 0) {
        // Don't do anything if this is the top of the list
        if ($from.index(range.depth - 1) == 0)
            return false;
        let $insert = tr.doc.resolve(range.start - 2);
        outerRange = new NodeRange($insert, $insert, range.depth);
        if (range.endIndex < range.parent.childCount)
            range = new NodeRange($from, tr.doc.resolve($to.end(range.depth)), range.depth);
        doJoin = true;
    }
    let wrap = findWrapping(outerRange, listType, attrs, range);
    if (!wrap)
        return false;
    //if (dispatch) dispatch(doWrapInList(state.tr, range, wrap, doJoin, listType).scrollIntoView())
    return doWrapInList(tr, range, wrap, doJoin, listType).scrollIntoView();
}
function doWrapInList(tr, range, wrappers, joinBefore, listType) {
    let content = Fragment.empty;
    for (let i = wrappers.length - 1; i >= 0; i--)
        content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content));
    tr.step(new ReplaceAroundStep(range.start - (joinBefore ? 2 : 0), range.end, range.start, range.end, new Slice(content, 0, 0), wrappers.length, true));
    let found = 0;
    for (let i = 0; i < wrappers.length; i++)
        if (wrappers[i].type == listType)
            found = i + 1;
    let splitDepth = wrappers.length - found;
    let splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0), parent = range.parent;
    for (let i = range.startIndex, e = range.endIndex, first = true; i < e; i++, first = false) {
        if (!first && canSplit(tr.doc, splitPos, splitDepth)) {
            tr.split(splitPos, splitDepth);
            splitPos += 2 * splitDepth;
        }
        splitPos += parent.child(i).nodeSize;
    }
    return tr;
}
/// Build a command that splits a non-empty textblock at the top level
/// of a list item by also splitting that list item.
function splitListItem(itemType, attrs) {
    return function (state, dispatch) {
        let { $from, $to, node } = state.selection;
        if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to))
            return false;
        let grandParent = $from.node(-1);
        if (grandParent.type != itemType)
            return false;
        if ($from.parent.content.size == 0 &&
            $from.node(-1).childCount == $from.indexAfter(-1)) {
            // In an empty block. If this is a nested list, the wrapping
            // list item should be split. Otherwise, bail out and let next
            // command handle lifting.
            if ($from.depth == 3 ||
                $from.node(-3).type != itemType ||
                $from.index(-2) != $from.node(-2).childCount - 1)
                return false;
            if (dispatch) {
                let wrap = Fragment.empty;
                let depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
                // Build a fragment containing empty versions of the structure
                // from the outer list item to the parent node of the cursor
                for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d--)
                    wrap = Fragment.from($from.node(d).copy(wrap));
                let depthAfter = $from.indexAfter(-1) < $from.node(-2).childCount
                    ? 1
                    : $from.indexAfter(-2) < $from.node(-3).childCount
                        ? 2
                        : 3;
                // Add a second list item with an empty default start node
                wrap = wrap.append(Fragment.from(itemType.createAndFill()));
                let start = $from.before($from.depth - (depthBefore - 1));
                let tr = state.tr.replace(start, $from.after(-depthAfter), new Slice(wrap, 4 - depthBefore, 0));
                let sel = -1;
                tr.doc.nodesBetween(start, tr.doc.content.size, (node, pos) => {
                    if (sel > -1)
                        return false;
                    if (node.isTextblock && node.content.size == 0)
                        sel = pos + 1;
                });
                if (sel > -1)
                    tr.setSelection(Selection.near(tr.doc.resolve(sel)));
                dispatch(tr.scrollIntoView());
            }
            return true;
        }
        let nextType = $to.pos == $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
        let tr = state.tr.delete($from.pos, $to.pos);
        let types = nextType
            ? [
                // set new node attributes or just copy attributes of the split item
                attrs ? { type: itemType, attrs } : null,
                // block that is created within the split item (= a paragraph usually)
                { type: nextType },
            ]
            : undefined;
        // TODO: this is a hack because somehow canSplit fails if we pass attributes for the node
        // @see https://github.com/ProseMirror/prosemirror-schema-list/pull/11
        const splitTypes = types ? [null, types[1]] : undefined;
        if (!canSplit(tr.doc, $from.pos, 2, /*types*/ splitTypes))
            return false;
        if (dispatch)
            dispatch(tr.split($from.pos, 2, types).scrollIntoView());
        return true;
    };
}
function liftListItemTr(tr, itemType) {
    let { $from, $to } = tr.selection;
    let range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild.type == itemType);
    if (!range)
        return false;
    if ($from.node(range.depth - 1).type == itemType)
        // Inside a parent list
        return liftToOuterListTr(tr, itemType, range);
    // Outer list node
    else
        return liftOutOfListTr(tr, range);
}
function liftToOuterListTr(tr, itemType, range) {
    let end = range.end, endOfList = range.$to.end(range.depth);
    if (end < endOfList) {
        // There are siblings after the lifted items, which must become
        // children of the last item
        tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList, new Slice(Fragment.from(itemType.create(null, range.parent.copy())), 1, 0), 1, true));
        range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
    }
    const target = liftTarget(range);
    if (target == null)
        return false;
    tr.lift(range, target);
    let after = tr.mapping.map(end, -1) - 1;
    if (canJoin(tr.doc, after))
        tr.join(after);
    tr.scrollIntoView();
    return tr;
}
function liftOutOfListTr(tr, range) {
    let list = range.parent;
    // Merge the list items into a single big item
    for (let pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
        pos -= list.child(i).nodeSize;
        tr.delete(pos - 1, pos + 1);
    }
    let $start = tr.doc.resolve(range.start), item = $start.nodeAfter;
    if (tr.mapping.map(range.end) != range.start + $start.nodeAfter.nodeSize)
        return false;
    let atStart = range.startIndex == 0, atEnd = range.endIndex == list.childCount;
    let parent = $start.node(-1), indexBefore = $start.index(-1);
    if (!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1, item.content.append(atEnd ? Fragment.empty : Fragment.from(list))))
        return false;
    let start = $start.pos, end = start + item.nodeSize;
    // Strip off the surrounding list. At the sides where we're not at
    // the end of the list, the existing list is closed. At sides where
    // this is the end, it is overwritten to its end.
    tr.step(new ReplaceAroundStep(start - (atStart ? 1 : 0), end + (atEnd ? 1 : 0), start + 1, end - 1, new Slice((atStart
        ? Fragment.empty
        : Fragment.from(list.copy(Fragment.empty))).append(atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))), atStart ? 0 : 1, atEnd ? 0 : 1), atStart ? 0 : 1));
    tr.scrollIntoView();
    return tr;
}

/**
 * All our commands expect "dispatch" to exist,
 * but prosemirror makes this argument optional
 * assertDispatch checks its presence with proper typing
 */
function assertDispatch(cmdName, dispatch) {
    if (!dispatch)
        throw new Error(`${cmdName} command expects dispatch to be defined`);
}
function getCursor(state) {
    const { selection } = state;
    if (!(selection instanceof TextSelection))
        return null;
    if (!selection.$cursor)
        return null;
    return selection.$cursor;
}

// utilities
function isPillSelection(state) {
    if (!(state.selection instanceof NodeSelection))
        return false;
    return [schema.nodes.pill, schema.nodes.search_pill].includes(state.selection.node.type);
}
function hasColour(state) {
    return colorMarks.some((mt) => markInSelection(state, mt));
}
function nodeInSelection(state, node) {
    const node1 = state.selection.$from.node(1);
    if (!node1) {
        // TODO: fixme, can reproduce by pressing ctrl+a
        // @see https://www.notion.so/trout-software/PKG-highlighting-all-with-ctrl-a-will-not-display-the-right-button-as-focused-8f6f31952bf440a7b283a26803c199d7?pvs=4
        console.warn("no node(1)");
    }
    return node1?.type == node;
}
function headingInSelection(state, level) {
    const attrs = state.selection.$from.node(state.selection.$from.depth).attrs;
    if (attrs) {
        if (attrs.level)
            return attrs.level == level;
        else
            return level == 0;
    }
    else
        return false;
}
/**
 * 0 => no heading since it starts at 1
 */
function headingLevelAtCursor(state) {
    const $cursor = getCursor(state);
    if (!$cursor)
        return 0;
    const maybeHeading = $cursor.node(1);
    if (maybeHeading.type === schema.nodes.heading) {
        return maybeHeading.attrs.level || 1;
    }
    return 0;
}
// commands
function removeBlockIfAtStartCmd() {
    return function (state, dispatch) {
        assertDispatch("removeBlockIfAtStart", dispatch);
        if (atBlockStart(state)) {
            return setBlockType(schema.nodes.paragraph)(state, dispatch);
        }
        return false;
    };
}
function makeHeadlineCmd(level) {
    if (level < 0 && level > 6)
        throw new Error("Heading level cannot be below 0 or above 6");
    if (level === 0) {
        return setBlockType(schema.nodes.paragraph);
    }
    else {
        // TODO: also make the block top-level so it's not in a list
        return setBlockType(schema.nodes.heading, { level });
    }
}
({
    task_list: schema.nodes.task_list_item,
});
/**
 * True if the selection doesn't mix multiple lists
 * or list items and other kind of blocks
 *
 * NOTE: this rule is limitative and may become more flexible in the feature
 * provided we manage to implement lifting a range spanning over multiple lists
 */
function canToggleList(selection) {
    const range = selection.$from.blockRange(selection.$to);
    // - range is [bullet_list, paragraph] => false (user selected list items + paragraph)
    // - range is [bullet_list, ordered_list] => false (user selected multiple lists)
    // - range is [list_item, list_item] => true (user selected items of a single list)
    // - range is [paragraph, paragraph] => true ()
    if (!range)
        return false;
    for (let nodeIdx = range.startIndex; nodeIdx < range.endIndex; nodeIdx++) {
        const maybeList = range.parent.child(nodeIdx);
        if (listNodes.includes(maybeList.type))
            return false;
    }
    return true;
}
/**
 *
 * @param mt The list type: bullet, ordered, task...
 * @param state Editor state
 * @param li Optionally pass a custom list item type (for instance "task_list_item"). "list_item" is used as default.
 * @returns
 */
function toggleListCmd(mt, li = schema.nodes.list_item) {
    return function (state, dispatch) {
        assertDispatch("toggleList", dispatch);
        // remove other type of list if any
        let tr = state.tr;
        if (!canToggleList(tr.selection)) {
            console.warn("Can't yet toggle list for mismatching items");
            return false;
        }
        // TODO: this code is not robust to selecting multiple lists
        // instead, get current selection and iterate over the Range
        const innerNode = state.selection.$from.node(1);
        // already applied => remove the node type
        if (innerNode.type === mt) {
            if (liftListItemTr(tr, li)) {
                dispatch(tr);
                return true;
            }
            return false;
        }
        // not applied => remove other types and apply
        for (const markType of listNodes) {
            if (innerNode.type === markType) {
                if (!liftListItemTr(tr, li))
                    return false;
                break;
            }
        }
        // apply wanted type
        if (!wrapInListTr(tr, mt))
            return false;
        // merge with above and below node if that makes sense
        joinUpTr(tr, [mt]);
        joinDownTr(tr, [mt]);
        // dispatch
        dispatch(tr);
        return true;
    };
}
/**
 * Assuming a single selection via highlighting
 */
function markInSelection(state, mt) {
    let { doc, selection } = state;
    // from and to are actually the selection bounds if there are disjoing range
    // but we don't care about multi-range selection as highlighting allow only one
    return doc.rangeHasMark(selection.from, selection.to, mt);
}
/**
 * Test if current cursor is within a mark eg a "strong" text
 * But also check storedMarks = the mark applied to the next typed character
 * even when there is not yet a mark
 */
function markAtCursor(state, mt) {
    const $cursor = getCursor(state);
    if (!$cursor)
        return false;
    return !!mt.isInSet(state.storedMarks || $cursor.marks());
}
function markApplies(doc, selection, type) {
    const { $from, $to } = selection;
    let can = $from.depth == 0
        ? doc.inlineContent && doc.type.allowsMarkType(type)
        : false;
    doc.nodesBetween($from.pos, $to.pos, (node) => {
        if (can)
            return false;
        can = node.inlineContent && node.type.allowsMarkType(type);
    });
    return can;
}
/**
 * Will reset selection so we don't have strange highlighting behaviour
 * @param mt
 * @returns
 */
function toggleColourCmd(mt) {
    return function (state, dispatch) {
        assertDispatch("toggleColours", dispatch);
        const tr = state.tr;
        let { empty, $from, $to } = state.selection;
        if (empty)
            return false;
        for (const markType of colorMarks) {
            if (markType === mt) {
                if (!markApplies(state.doc, state.selection, markType))
                    continue;
                let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore;
                let spaceStart = start && start.isText ? /^\s*/.exec(start.text)[0].length : 0;
                let spaceEnd = end && end.isText ? /\s*$/.exec(end.text)[0].length : 0;
                if (from + spaceStart < to) {
                    from += spaceStart;
                    to -= spaceEnd;
                }
                tr.addMark(from, to, markType.create( /*attrs*/));
            }
            else {
                const has = markInSelection(state, markType);
                if (has) {
                    // remove other colors, and the current one if it's already there
                    tr.removeMark($from.pos, $to.pos, markType);
                }
            }
        }
        dispatch(tr);
        return true;
    };
}
function removeColoursCmd() {
    return function (state, dispatch) {
        assertDispatch("removeColours", dispatch);
        const tr = state.tr;
        const { $from, $to } = state.selection;
        for (const markType of colorMarks) {
            const has = markInSelection(state, markType);
            if (has) {
                // remove other colors, and the current one if it's already there
                tr.removeMark($from.pos, $to.pos, markType);
            }
        }
        if (!tr.docChanged)
            return false;
        dispatch(tr);
        return true;
    };
}
function breaklineCmd() {
    return function (state, dispatch) {
        assertDispatch("breakline", dispatch);
        if (dispatch)
            dispatch(state.tr
                .replaceSelectionWith(schema.nodes.hard_break.create())
                .scrollIntoView());
        return true;
    };
}

/**
 * Call f() only if it hasn't been called since X ms
 */
function throttle(f, timeoutMS) {
    let lastcall;
    return (...args) => {
        // not yet called || called a while ago
        if (!lastcall || lastcall + timeoutMS < performance.now()) {
            lastcall = performance.now();
            f(...args);
        }
    };
}

const markHintTemplates = {
    [schema.marks.strong.name]: x `<strong>B</strong>`,
    [schema.marks.em.name]: x `<em>E</em>`,
    [schema.marks.underline.name]: x `<span class="underline">U</span>`,
};
const nodeHintTemplates = {
    [schema.nodes.heading.name](level) {
        return x `<span>h${level}</span>`;
    },
};
function getCursorPos(edstate) {
    if (!(edstate.selection instanceof TextSelection))
        return null;
    return edstate.selection.$cursor?.pos ?? null;
}
function hasNonEmptyTextSelection(edstate) {
    const { selection } = edstate;
    if (!(selection instanceof TextSelection))
        return false;
    return selection.head - selection.anchor !== 0;
}
function selectionAcceptsInlineContent(edstate) {
    const cursorPos = getCursorPos(edstate);
    if (cursorPos === null)
        return false;
    // NOTE: when selecting some text, cursorPos is zero
    // => it points to the "doc", which do not accept inlineContent
    // that's why this function will return false in this case
    let $pos = edstate.doc.resolve(cursorPos);
    let isBlock = !$pos.parent.inlineContent;
    if (isBlock)
        return false;
    return true;
}
class EditorSmartCursor extends TWElement {
    constructor() {
        super();
        this.cursorRef = e();
        this.updateCursorScreenPosition = () => {
            const cursorPos = getCursorPos(this.edstate);
            if (cursorPos === null)
                return;
            let coords = this.view.coordsAtPos(cursorPos);
            const rect = {
                left: coords.left - this.width / 2,
                right: coords.left + this.width / 2,
                top: coords.top,
                bottom: coords.bottom,
            };
            let parent = this.view.dom.offsetParent;
            let parentLeft, parentTop;
            /*
                if (!parent || parent == document.body && getComputedStyle(parent).position == "static") {
                    parentLeft = -scrollX//-pageXOffset
                    parentTop = -scrollY//-pageYOffset
                } else {
                    */
            const parentRect = parent.getBoundingClientRect();
            parentLeft = parentRect.left - parent.scrollLeft;
            parentTop = parentRect.top - parent.scrollTop;
            //}
            this.cursorWidth = rect.right - rect.left;
            this.cursorHeight = rect.bottom - rect.top;
            this.leftPx = rect.left - parentLeft;
            this.topPx = rect.top - parentTop;
            // detect if out of parent bound, for later display
            const parentWidth = parentRect.right - parentRect.left;
            const parentHeight = parentRect.bottom - parentRect.top;
            this.outOfParentBounds =
                this.leftPx < 0 ||
                    this.topPx < 0 ||
                    this.leftPx + this.cursorWidth > parentWidth ||
                    this.topPx + this.cursorHeight > parentHeight;
        };
        /**
         * If we didn't scroll for ~2 frames, update the cursor position
         */
        this.seenScroll = debounce(() => {
            this.updateCursorScreenPosition();
            this.scrolling = false;
        }, 64);
        /**
         * Will hide the cursor and wait for scroll to be done
         */
        this.handleScroll = throttle(() => {
            this.scrolling = true;
            this.seenScroll();
        }, 48); // timeout must be smaller than "seenScroll" debounce
        this.shouldShow = () => {
            // not a valid cursor
            if (getCursorPos(this.edstate) === null)
                return false;
            if (hasNonEmptyTextSelection(this.edstate))
                return false;
            if (!selectionAcceptsInlineContent(this.edstate))
                return false;
            // scrolling or cursor out of visible bounds
            if (this.scrolling)
                return false;
            if (this.outOfParentBounds)
                return false;
            return true;
        };
        this.width = 2;
    }
    connectedCallback() {
        super.connectedCallback();
        this.view.dom.addEventListener("scroll", this.handleScroll);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.view.dom.removeEventListener("scroll", this.handleScroll);
    }
    updated() {
        // NOTE: always update even if the cursor is not visible
        // so when it reappears eg after a scroll end it is at the right position
        this.updateCursorScreenPosition();
    }
    render() {
        if (!this.shouldShow())
            return A;
        const hints = [schema.marks.strong, schema.marks.em, schema.marks.underline]
            .filter((mt) => markAtCursor(this.edstate, mt))
            .map((mt) => x `<span class="mx-[0.1em]">${markHintTemplates[mt.name]}</span>`);
        const headingLevel = headingLevelAtCursor(this.edstate);
        if (headingLevel) {
            hints.push(nodeHintTemplates[schema.nodes.heading.name](headingLevel));
        }
        // NOTE: we can't position with dynamic values using Tailwind
        // hence the inline style
        // "Cursor wrapper" is positionned as a whole within the editor
        //      It has the same height as the Cursor
        // Then "Smart indicator" is positioned relatively
        //      it is offseted from its own height, estimated to 20px (update if needed)
        //      so the parent takes its width and we can use "left: -50%"
        //      this means the indicator will "push" the cursor below, contrary to an absolute position
        // Cursor is positionned absolutely to 0 to counter-balance the smart indicator height
        //      See tailwind config for the animation definition
        return x `<div class="${"smart-cursor-wrapper" +
            // since we rely on a ref to compute the cursor,
            // it has to be rendered even when we don't show it
            // for instance when it is out of the visible scope
            // + " " + this.shouldShow() ? "" : "invisible"
            " " +
            "absolute z-10 pointer-events-none" +
            " " +
            "animate-blinkcursor"}" ${n$1(this.cursorRef)} style="${`top: ${this.topPx}px; left: ${this.leftPx}px; height: ${this.cursorHeight}px`}">${n$3(hints.length, () => x `<div class="smart-indicator relative bg-blue-400 rounded text-white text-xs px-[0.2em] py-[0.1em]" style="${`top:-20px; left: -50%`}">${hints}</div>`)}<div class="bg-blue-400 smart-cursor absolute top-0 left-0" style="${`width:${this.cursorWidth}px;height:${this.cursorHeight}px`}"/></div>`;
    }
}
EditorSmartCursor.properties = {
    edstate: { type: Object },
    view: { type: Object },
    cursorHeight: { type: Number, state: true },
    cursorWidth: { type: Number, state: true },
    leftPx: { type: Number, state: true },
    topPx: { type: Number, state: true },
    scrolling: { type: Boolean, state: true },
};
customElements.define("wt-editor-smart-cursor", EditorSmartCursor);

class DragDropController {
    constructor(host) {
        /**
         * Will be non-null ONLY when dragging an element from WHITHIN the text editor
         * prosemirror already offers a "view.dragging"
         * but it is tailored to its default drag and drop handler
         * with text/plain or text/html dataTransfer only
         */
        this.draggingWithin = null;
        (this.host = host).addController(this);
    }
    hostConnected() { }
    isDragging() {
        return this.dragging;
    }
    enterDrag() {
        this.dragging = true;
        this.host.requestUpdate();
    }
    resetDrag() {
        this.draggingWithin = null;
        this.dragging = false;
        this.host.requestUpdate();
    }
    /**
     * When dragging from within the text editor,
     * remember the position so we can delete/re-insert the element
     */
    setInitialPosition(dragPos) {
        this.draggingWithin = { dragPos };
        this.host.requestUpdate();
    }
    getInitialPositon() {
        return this.draggingWithin?.dragPos;
    }
}
function handleDragEvents(dstate, cmdRunner) {
    const handlers = {
        /**
         * Tracks drag and dropping from within the editor
         */
        dragstart: (view, event) => {
            if (!hasPillData(event)) {
                return; // use the default handler as usual
            }
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (!pos)
                return;
            // /!\ pos.pos is NOT what we want, it might match a position after the dragged node
            // inside matches
            dstate.setInitialPosition(pos?.inside || 0);
            return true; // bypass prosemirror default handler
        },
        dragenter: () => {
            dstate.enterDrag();
        },
        dragend: () => {
            dstate.resetDrag();
        },
        /**
         * prose-mirror default drag and drop handlers forces text/plain or text/html
         * This custom handler allow using custom JSON data eg pivot or cell definitions
         */
        drop: (view, event) => {
            // copy initial drag position and immediately reset the state
            const dragPos = dstate.getInitialPositon();
            dstate.resetDrag();
            if (!acceptPillDrop(event)) {
                return; // use prose-mirror default handler
            }
            const mousePos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
            });
            if (!mousePos) {
                console.warn("no valid position for drop event");
                return;
            }
            // allow to drop after the text, in this case inside will be -1
            const dropPos = mousePos.inside < 0 ? mousePos.pos - 1 : mousePos.pos;
            if (typeof dragPos === "number") {
                cmdRunner.doCommand(movePillCmd(dragPos, dropPos, event));
            }
            else {
                cmdRunner.doCommand(insertPillCmd(dropPos, event));
            }
        },
    };
    return handlers;
}

function clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
}
/**
 * A floating tooltip, positionned based on the editor cursor position
 */
class EditorTooltip extends TWElement {
    constructor() {
        super(...arguments);
        this.tooltip = e();
        this.positionTooltip = () => {
            if (!this.tooltip.value) {
                return;
            }
            const tooltipRect = this.getBoundingClientRect();
            const tooltipPosition = this.selectionPosition();
            const left = tooltipPosition.left - tooltipRect.left;
            const top = tooltipPosition.top - tooltipRect.top - 5;
            this.tooltip.value.style.setProperty("top", `${top}px`);
            this.tooltip.value.style.setProperty("left", `${left}px`);
        };
    }
    updated() {
        // TODO: also position on scroll, see "editor-cursor" logic for the smart cursor
        this.positionTooltip();
    }
    selectionPosition() {
        const selectionCoords = this.view.coordsAtPos(this.edstate.selection.from);
        // selection might be out of view (eg select multiple paragraphs with scrolling)
        // we must clamp the coordinates so the tooltip stays around the editor view
        const viewCoords = this.view.dom.getBoundingClientRect();
        return {
            left: clamp(selectionCoords.left, viewCoords.left, viewCoords.right),
            top: clamp(selectionCoords.top, viewCoords.top, viewCoords.bottom),
        };
    }
    render() {
        return x `<div ${n$1(this.tooltip)} id="wt-editor-tooltip" class="${o$7({
            "flex absolute z-20 -translate-y-full border bg-zinc-100 dark:bg-neutral-700 border-zinc-300 dark:border-neutral-400 rounded-sm": true,
            invisible: !this.visible,
        })}"><slot></slot></div>`;
    }
}
EditorTooltip.properties = {
    visible: { type: Boolean },
    view: { type: Object },
    edstate: { type: Object },
};
customElements.define("wt-editor-tooltip", EditorTooltip);

/**
 * NodeView is prosemirror system for creating more complex custom element
 * Here we need it to check the checkboxes, as clicking do not update the DOM
 *
 * NOTE: we could use a web component for the same purpose,
 * but NodeView integrate better with prosemirror editor state
 * (accessing the current "Node", getting its position)
 */
class TaskListItemView {
    constructor(node, view, getPos) {
        const wrapper = document.createElement("li");
        // list-none is important to keep a "li" without having a bullet
        wrapper.className = "task-item flex list-none";
        const inputWrapper = document.createElement("div");
        // Important for firefox: since prosemirror has "contenteditable=true"
        // we must wrap the checkbox within a non editable div
        // this attribute can't be set directly on the input
        inputWrapper.setAttribute("contenteditable", "false");
        // border-transparent is a trick to keep the element width consistent on hover
        inputWrapper.className =
            "border-r border-transparent hover:border-slate-200 hover:dark:border-slate-700 mr-2";
        const contentWrapper = document.createElement("div");
        this.input = this.renderInput(node, view, getPos);
        // init input checked
        this.updateInput(node);
        inputWrapper.appendChild(this.input);
        wrapper.appendChild(inputWrapper);
        wrapper.appendChild(contentWrapper);
        this.dom = wrapper;
        this.contentDOM = contentWrapper;
    }
    renderInput(node, view, getPos) {
        const input = document.createElement("input");
        input.className = "mr-2 w-[16px] h-[16px] cursor-pointer";
        input.setAttribute("type", "checkbox");
        input.addEventListener("click", (e) => {
            e.preventDefault();
            const tr = view.state.tr;
            tr.setNodeAttribute(getPos(), "checked", !node.attrs.checked);
            view.dispatch(tr);
            view.focus();
        });
        return input;
    }
    updateInput(node) {
        const nodeChecked = node.attrs.checked;
        const inputChecked = this.input.checked;
        if (nodeChecked && !inputChecked) {
            // set for convenience (copy-pasting outside of editor, debugging...)
            this.input.setAttribute("checked", "");
            // this will actually check the input (IDL attribute)
            this.input.checked = true;
            return true;
        }
        else if (!nodeChecked && inputChecked) {
            this.input.removeAttribute("checked");
            this.input.checked = false;
            return true;
        }
        return false;
    }
    update(node) {
        return this.updateInput(node);
    }
    stopEvent() {
        return true;
    }
}

/**
 * NodeView that passes down the current editor view to a custom element
 *
 * /!\ this.nodeView will be available only **after** the custom element is constructed
 *
 * This additional NodeView is needed because "toDOM" doesn't have access to the Editor view
 */
class CustomElementView {
    constructor(
    /** If specific attributes are needed, create the element yourself
     * otherwise just pass the element tag
     */
    customElem, 
    // Passed by prosemirror to the NodeView
    nodeView) {
        const elem = (typeof customElem === "string"
            ? document.createElement(customElem)
            : customElem);
        // equivalent to setting a JS property ".edstate=${edstate}" in Lit templates
        elem.nodeView = nodeView;
        this.dom = elem;
    }
}

/**
 * Remove the search pill and position cursor
 * Deleting the node may lose focus
 */
function removeSearchPillTr(tr, pos) {
    // defensive check
    if (tr.doc.nodeAt(pos)?.type === schema.nodes.search_pill) {
        // put a cursor where we removed the node
        tr.delete(pos, pos + 1);
        tr.setSelection(TextSelection.create(tr.doc, pos));
        return tr;
    }
    return false;
}
function createPillFromValue(type, value) {
    if (type === "users") {
        const user = value;
        return schema.nodes.pill.create({
            "data-type": "user",
            "data-entity-json": JSON.stringify(user),
        });
    }
    else if (type === "playbooks") {
        const playbook = value;
        return schema.nodes.pill.create({
            "data-type": "playbook",
            "data-entity-json": JSON.stringify(playbook),
        });
    }
    throw new Error(`type ${type} is not a valid datapill type`);
}
/**
 * A temporary pill to search for items before creating a complete datapill
 * Should be removed if user abandon the search
 * Should be replaced by a datapill if user selectes an item
 */
class EditorSearchPill extends TWElement {
    constructor() {
        super();
        this.handleKeydown = (evt) => {
            switch (evt.key) {
                // We delete the node when the input is empty before we press backspace
                // => that's why we need to test on keydown, keyup is too late
                case "Backspace": {
                    const inputVal = this.shadowRoot?.querySelector("input")?.value;
                    if (!inputVal) {
                        this.removeNodeAndLeaveAt();
                        // preventDefault is important otherwise the "@" is immediately deleted
                        evt.preventDefault();
                    }
                    return;
                }
                case "Enter": {
                    // TODO: we could select the first matching item instead,
                    // or allow keyboard navigation within the list and pick the selected one
                    this.removeNode();
                    // preventDefault is important otherwise a newline is added
                    evt.preventDefault();
                    evt.preventDefault();
                    return;
                }
            }
        };
        /** Same as removeNode but leaves the "@" */
        this.removeNodeAndLeaveAt = () => {
            const { view, getPos } = this.nodeView;
            const pos = getPos();
            if (typeof pos === "undefined")
                return;
            const tr = removeSearchPillTr(view.state.tr, pos);
            if (!tr)
                return;
            tr.insertText("@");
            view.dispatch(tr);
            // TODO: why focus is lost when deleting the node,
            // despite the selection being correct?
            view.dom.focus();
        };
        this.removeNode = (evt) => {
            const { view, getPos } = this.nodeView;
            // we lost focus because we clicked a button of the tooltip
            // => do not remove the node, otherwise "click" selectItem logic won't run
            if (evt && this.shadowRoot?.contains(evt.relatedTarget))
                return;
            const pos = this.nodeView.getPos();
            if (typeof pos !== "number")
                return;
            const tr = removeSearchPillTr(view.state.tr, pos);
            if (tr) {
                view.dispatch(tr);
                // TODO: why focus is lost when deleting the node,
                // despite the selection being correct?
                view.dom.focus();
            }
        };
        this.search = async (evt) => {
            evt.stopPropagation();
            this.results = null;
            const query = evt?.target?.value;
            if (!query)
                return;
            try {
                const [playbooksRes, usersRes] = await Promise.allSettled([
                    fetch("/search/query", {
                        method: "POST",
                        body: JSON.stringify({ query }),
                    }),
                    fetch("/search/users?q=" + encodeURIComponent(query)),
                ]);
                let playbooks = [];
                let users = [];
                if (playbooksRes.status === "fulfilled" && playbooksRes.value.ok) {
                    playbooks = (await playbooksRes.value.json())?.results;
                }
                if (usersRes.status === "fulfilled" && usersRes.value.ok) {
                    // value is null when no users are found
                    users = (await usersRes.value.json()) || [];
                }
                this.results = {
                    users,
                    playbooks,
                };
            }
            catch (err) {
                console.error(err);
            }
        };
        this.results = null;
        // Hide on scroll to avoid relying on a complicated positionning logic
    }
    connectedCallback() {
        super.connectedCallback();
        this.nodeView.view.dom.addEventListener("scroll", () => this.removeNode());
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.nodeView.view.dom.addEventListener("scroll", () => this.removeNode());
    }
    firstUpdated() {
        this.shadowRoot?.querySelector("input")?.focus();
    }
    selectItem(type, value) {
        const { view, getPos } = this.nodeView;
        const pos = getPos();
        if (typeof pos !== "number")
            return;
        const pill = createPillFromValue(type, value);
        const tr = view.state.tr;
        tr.replaceRangeWith(pos, pos + 1, pill);
        tr.setSelection(TextSelection.create(tr.doc, pos + 1));
        view.dispatch(tr);
        view.dom.focus();
    }
    renderSearchResult() {
        const showResults = !!this.results;
        const { results } = this;
        if (!results)
            return A;
        const emptyResults = !Object.values(results).find((rs) => !!rs.length);
        const headingCls = "text-xs capitalize mt-2 px-2 first-of-type:mt-0";
        const btnCls = "w-full text-left py-1 px-2 rounded hover:bg-zinc-200 dark:bg-neutral-600";
        return x `<div class="${[
            // TODO: why invisible?
            showResults ? "" : "invisible",
            "absolute top-full left-[16px] z-20 translate-y",
            "p-1 w-48 text-sm",
            "bg-zinc-100 dark:bg-neutral-700 border-zinc-300 dark:border-neutral-400 rounded-b",
        ].join(" ")}">${emptyResults
            ? x `<div class="p-1 text-left text-md">No results</div>`
            : x `${n$3(results.users.length, () => x `<h3 class="${headingCls}">Users</h3><ul>${results.users.map((a) => x `<li><button class="${btnCls}" @click="${() => this.selectItem("users", a)}">${a.Name}</button></li>`)}</ul><hr/>`)} ${n$3(results.playbooks.length, () => x `<h3 class="${headingCls}">Playbooks</h3><ul>${this.results?.playbooks.map((p) => x `<li><button class="${btnCls}" @click="${() => this.selectItem("playbooks", p)}">${p.Title || p.ID}</button></li>`)}</ul>`)}`}</div>`;
    }
    render() {
        // caret-current reenable the caret which is hidden by the smartcursor
        return x `<div class="inline-block relative"><svg class="inline" height="16px" width="16px" viewBox="0 0 24 24">${icons$2.search}</svg> <input type="text" placeholder="Type to search..." class="caret-current p-1 text-sm w-48" @keydown="${this.handleKeydown}" @blur="${(evt) => this.removeNode(evt)}" @input="${this.search}"/> ${this.renderSearchResult()}</div>`;
    }
}
EditorSearchPill.properties = {
    results: { type: Object, state: true },
    nodeView: { type: Object },
};
customElements.define("wt-editor-search-pill", EditorSearchPill);
class SearchPillNodeView extends CustomElementView {
    constructor(node, view, getPos) {
        super("wt-editor-search-pill", { node, view, getPos });
    }
    stopEvent() {
        // all events are swallowed by the search pill inputs
        return true;
    }
    // avoid displaying an ugly blue rect around the pil
    selectNode() {
        return;
    }
    deselectNode() {
        return;
    }
}

// Despite using a shadow DOM, the pill style is not isolated from its parent
// => it will take the parent text color for instance
// We have to explictely specify the styles that shouldn't change
const preventStylingCls = "not-italic no-underline font-normal text-xs" +
    " " +
    // should be the text default color, currently set in "notebook.html"
    "text-zinc-800 dark:text-neutral-200";
function updatePillEntity(nodeView, data) {
    const { view, getPos } = nodeView;
    const pos = getPos();
    if (typeof pos !== "number") {
        console.warn("no position found for pivot");
        return false;
    }
    // this will trigger a prosemirror rerender automatically,
    // no need to track the pivot value in Lit
    view.dispatch(view.state.tr.setNodeAttribute(pos, "data-entity-json", JSON.stringify(data)));
}
/***
 * Refresh pill data in the background and update prosemirror doc accordingly
 */
class PillRefreshController {
    constructor(host, nodeView, fetchData) {
        this.hostConnected = async () => {
            const data = await this.fetchData();
            if (data === false)
                return;
            if (data === null) {
                this.failedRefresh = true;
                this.host.requestUpdate();
                return;
            }
            // will rerender the pill NodeView with fresh data
            updatePillEntity(this.nodeView, data);
        };
        this.nodeView = nodeView;
        this.fetchData = fetchData;
        // must be at the end, otherwise hostConnected may kick in before the properties are set
        (this.host = host).addController(this);
    }
}
const notFoundIcon = () => x `<span title="We couldn't find this item in the database, we display its latest known value."><svg class="inline" width="12px" height="12px" viewbox="0 0 24 24">${icons$2.help}</svg></span>`;
/**
 * Use a stale-while-revalidate strategy to get fresh pivot data
 * but always display a value
 */
class EditorPivotPill extends TWElement {
    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback();
        // NOTE: initializing refresh controller in constructor is too early
        // as nodeView is passed after the DOM element creation (see CustomElementView)
        // => we initialize it after
        // NOTE2: this will kick the controller hostConnected db immediately,
        // since the component is already connected
        // be careful when implementing the controller constructor
        this.refreshCtrl = new PillRefreshController(this, this.nodeView, this.refreshData.bind(this));
    }
    async refreshData() {
        if (this.pivot.pivotid === emptyUlid) {
            // nothing to do for unsaved pivots, there is nothing to refresh
            return false;
        }
        const pivot = await fetchPivot(this.pivot.pivotid);
        if (!pivot) {
            return null;
        }
        return pivot;
    }
    render() {
        // TODO: show a warning somewhere if the refresh failed
        return x `${n$3(this.refreshCtrl.failedRefresh, notFoundIcon)}<wt-pivot-pill cls="${preventStylingCls}" @dragstart="${(e) => {
            setPivotDragData(e, JSON.stringify(this.pivot));
        }}" .pivot="${this.pivot}"></wt-pivot-pill>`;
    }
}
EditorPivotPill.properties = {
    pivot: { type: Object },
    nodeView: { type: Object },
};
customElements.define("wt-editor-pivot-pill", EditorPivotPill);
// TODO: refresh data
class EditorCellPill extends TWElement {
    constructor() {
        super();
    }
    render() {
        const { cell } = this;
        return x `<span draggable="${true}" @dragstart="${(e) => {
            setCellDragData(e, this.cell);
        }}" @dblclick="${(e) => {
            dispatchCreateCell({
                title: cell.Title,
                dataSource: cell.DataSource,
            }, this);
        }}" class="${"inline-block rounded-sm pr-1 shadow-sm dark:shadow-none hover:shadow " +
            " " +
            "border-2 border-zinc-200 dark:border-neutral-700" +
            " " +
            "dark:hover:bg-neutral-800 dark:bg-transparent" +
            " " +
            preventStylingCls}"><svg width="16" height="16" viewBox="0 0 24 24" class="inline fill-zinc-400 shrink-0">${icons$2.cell}</svg>${this.cell.Title}</span>`;
    }
}
EditorCellPill.properties = {
    cell: { type: Object },
    nodeView: { type: Object },
};
customElements.define("wt-editor-cell-pill", EditorCellPill);
// TODO: refresh data
class EditorUserPill extends TWElement {
    constructor() {
        super();
    }
    render() {
        const { user } = this;
        return x `<span class="${"inline-block rounded-sm pr-1 shadow-sm dark:shadow-none hover:shadow " +
            " " +
            "border-2 border-zinc-200 dark:border-neutral-700" +
            " " +
            "dark:hover:bg-neutral-800 dark:bg-transparent" +
            " " +
            preventStylingCls}"><svg width="16" height="16" viewBox="0 0 24 24" class="inline fill-zinc-400 shrink-0">${icons$2.cell}</svg> ${user.Name}</span>`;
    }
}
EditorUserPill.properties = {
    user: { type: Object },
    nodeView: { type: Object },
};
customElements.define("wt-editor-user-pill", EditorUserPill);
/**
 * Use a stale-while-revalidate strategy to get fresh notebook data
 * while always displaying a value
 */
class EditorPlaybookPill extends TWElement {
    constructor() {
        super();
    }
    connectedCallback() {
        super.connectedCallback();
        // NOTE: initializing refresh controller in constructor is too early
        // as nodeView is passed after the element creation
        this.refreshCtrl = new PillRefreshController(this, this.nodeView, this.refreshData.bind(this));
    }
    async refreshData() {
        const r = await fetch("/api/notebook?action=read", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ID: this.playbook.ID }),
        });
        if (r.status !== 200) {
            notify(this.playbook.ID, "the notebook could not be retrieved, retrying usually helps", true);
            return null;
        }
        try {
            const notebook = await r.json();
            return {
                Title: notebook.Title || "",
                ID: notebook.ID,
            };
        }
        catch (err) {
            console.error("Could not read response");
        }
        return null;
    }
    render() {
        return x `${n$3(this.refreshCtrl.failedRefresh, notFoundIcon)} <span><svg width="16" height="16" viewBox="0 0 8 10" class="inline fill-zinc-400 shrink-0">${icons$2.book}</svg> <a href="/notebook/${this.playbook.ID}">${this.playbook.Title || this.playbook.ID}</a></span>`;
    }
}
EditorPlaybookPill.properties = {
    playbook: { type: Object },
    nodeView: { type: Object },
};
customElements.define("wt-editor-playbook-pill", EditorPlaybookPill);
/**
 * NodeView links our Lit custom elements for datapills
 * with Prosemirror editor state
 */
const pillNodeViews = {
    search_pill(node, view, getPos) {
        return new SearchPillNodeView(node, view, getPos);
    },
    /**
     * We need a nodeView instead of "toDOM" to access the current view
     */
    pill(node, view, getPos) {
        // setting "text-xs" on the custom element tag corrects the line height
        // when rendering the pill into a heading
        // margin is preferred to padding so the border are correct during selection
        const pillClass = "mx-1 text-xs";
        const pillType = node.attrs["data-type"];
        switch (pillType) {
            case "pivot":
                const pivotPill = document.createElement("wt-editor-pivot-pill");
                pivotPill.className = pillClass;
                pivotPill.pivot = JSON.parse(node.attrs["data-entity-json"]);
                return new CustomElementView(pivotPill, { node, view, getPos });
            case "cell":
                const cellPill = document.createElement("wt-editor-cell-pill");
                cellPill.className = pillClass;
                cellPill.cell = JSON.parse(node.attrs["data-entity-json"]);
                return new CustomElementView(cellPill, { node, view, getPos });
            case "user":
                // TODO: craft custom element
                const userPill = document.createElement("wt-editor-user-pill");
                userPill.className = pillClass;
                userPill.user = JSON.parse(node.attrs["data-entity-json"]);
                return new CustomElementView(userPill, { node, view, getPos });
            case "playbook":
                // TODO: craft custom element
                const playbookPill = document.createElement("wt-editor-playbook-pill");
                playbookPill.className = pillClass;
                playbookPill.playbook = JSON.parse(node.attrs["data-entity-json"]);
                return new CustomElementView(playbookPill, { node, view, getPos });
            default:
                // we expect each pill type to be expclicitely added yhere
                throw new Error("Rendering an unknown type of pill: " + pillType);
        }
    },
};

const nodeViews = {
    task_list_item(node, view, getPos) {
        return new TaskListItemView(node, view, getPos);
    },
    ...pillNodeViews,
};

/**
Create a plugin that, when added to a ProseMirror instance,
causes a decoration to show up at the drop position when something
is dragged over the editor.

Nodes may add a `disableDropCursor` property to their spec to
control the showing of a drop cursor inside them. This may be a
boolean or a function, which will be called with a view and a
position, and should return a boolean.
*/
function dropCursor(options = {}) {
    return new Plugin({
        view(editorView) { return new DropCursorView(editorView, options); }
    });
}
class DropCursorView {
    constructor(editorView, options) {
        var _a;
        this.editorView = editorView;
        this.cursorPos = null;
        this.element = null;
        this.timeout = -1;
        this.width = (_a = options.width) !== null && _a !== void 0 ? _a : 1;
        this.color = options.color === false ? undefined : (options.color || "black");
        this.class = options.class;
        this.handlers = ["dragover", "dragend", "drop", "dragleave"].map(name => {
            let handler = (e) => { this[name](e); };
            editorView.dom.addEventListener(name, handler);
            return { name, handler };
        });
    }
    destroy() {
        this.handlers.forEach(({ name, handler }) => this.editorView.dom.removeEventListener(name, handler));
    }
    update(editorView, prevState) {
        if (this.cursorPos != null && prevState.doc != editorView.state.doc) {
            if (this.cursorPos > editorView.state.doc.content.size)
                this.setCursor(null);
            else
                this.updateOverlay();
        }
    }
    setCursor(pos) {
        if (pos == this.cursorPos)
            return;
        this.cursorPos = pos;
        if (pos == null) {
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
        else {
            this.updateOverlay();
        }
    }
    updateOverlay() {
        let $pos = this.editorView.state.doc.resolve(this.cursorPos);
        let isBlock = !$pos.parent.inlineContent, rect;
        if (isBlock) {
            let before = $pos.nodeBefore, after = $pos.nodeAfter;
            if (before || after) {
                let node = this.editorView.nodeDOM(this.cursorPos - (before ? before.nodeSize : 0));
                if (node) {
                    let nodeRect = node.getBoundingClientRect();
                    let top = before ? nodeRect.bottom : nodeRect.top;
                    if (before && after)
                        top = (top + this.editorView.nodeDOM(this.cursorPos).getBoundingClientRect().top) / 2;
                    rect = { left: nodeRect.left, right: nodeRect.right, top: top - this.width / 2, bottom: top + this.width / 2 };
                }
            }
        }
        if (!rect) {
            let coords = this.editorView.coordsAtPos(this.cursorPos);
            rect = { left: coords.left - this.width / 2, right: coords.left + this.width / 2, top: coords.top, bottom: coords.bottom };
        }
        let parent = this.editorView.dom.offsetParent;
        if (!this.element) {
            this.element = parent.appendChild(document.createElement("div"));
            if (this.class)
                this.element.className = this.class;
            this.element.style.cssText = "position: absolute; z-index: 50; pointer-events: none;";
            if (this.color) {
                this.element.style.backgroundColor = this.color;
            }
        }
        this.element.classList.toggle("prosemirror-dropcursor-block", isBlock);
        this.element.classList.toggle("prosemirror-dropcursor-inline", !isBlock);
        let parentLeft, parentTop;
        if (!parent || parent == document.body && getComputedStyle(parent).position == "static") {
            parentLeft = -pageXOffset;
            parentTop = -pageYOffset;
        }
        else {
            let rect = parent.getBoundingClientRect();
            parentLeft = rect.left - parent.scrollLeft;
            parentTop = rect.top - parent.scrollTop;
        }
        this.element.style.left = (rect.left - parentLeft) + "px";
        this.element.style.top = (rect.top - parentTop) + "px";
        this.element.style.width = (rect.right - rect.left) + "px";
        this.element.style.height = (rect.bottom - rect.top) + "px";
    }
    scheduleRemoval(timeout) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.setCursor(null), timeout);
    }
    dragover(event) {
        if (!this.editorView.editable)
            return;
        let pos = this.editorView.posAtCoords({ left: event.clientX, top: event.clientY });
        let node = pos && pos.inside >= 0 && this.editorView.state.doc.nodeAt(pos.inside);
        let disableDropCursor = node && node.type.spec.disableDropCursor;
        let disabled = typeof disableDropCursor == "function" ? disableDropCursor(this.editorView, pos, event) : disableDropCursor;
        if (pos && !disabled) {
            let target = pos.pos;
            if (this.editorView.dragging && this.editorView.dragging.slice) {
                let point = dropPoint(this.editorView.state.doc, target, this.editorView.dragging.slice);
                if (point != null)
                    target = point;
            }
            this.setCursor(target);
            this.scheduleRemoval(5000);
        }
    }
    dragend() {
        this.scheduleRemoval(20);
    }
    drop() {
        this.scheduleRemoval(20);
    }
    dragleave(event) {
        if (event.target == this.editorView.dom || !this.editorView.dom.contains(event.relatedTarget))
            this.setCursor(null);
    }
}

var GOOD_LEAF_SIZE = 200;

// :: class<T> A rope sequence is a persistent sequence data structure
// that supports appending, prepending, and slicing without doing a
// full copy. It is represented as a mostly-balanced tree.
var RopeSequence = function RopeSequence () {};

RopeSequence.prototype.append = function append (other) {
  if (!other.length) { return this }
  other = RopeSequence.from(other);

  return (!this.length && other) ||
    (other.length < GOOD_LEAF_SIZE && this.leafAppend(other)) ||
    (this.length < GOOD_LEAF_SIZE && other.leafPrepend(this)) ||
    this.appendInner(other)
};

// :: (union<[T], RopeSequence<T>>) → RopeSequence<T>
// Prepend an array or other rope to this one, returning a new rope.
RopeSequence.prototype.prepend = function prepend (other) {
  if (!other.length) { return this }
  return RopeSequence.from(other).append(this)
};

RopeSequence.prototype.appendInner = function appendInner (other) {
  return new Append(this, other)
};

// :: (?number, ?number) → RopeSequence<T>
// Create a rope repesenting a sub-sequence of this rope.
RopeSequence.prototype.slice = function slice (from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from >= to) { return RopeSequence.empty }
  return this.sliceInner(Math.max(0, from), Math.min(this.length, to))
};

// :: (number) → T
// Retrieve the element at the given position from this rope.
RopeSequence.prototype.get = function get (i) {
  if (i < 0 || i >= this.length) { return undefined }
  return this.getInner(i)
};

// :: ((element: T, index: number) → ?bool, ?number, ?number)
// Call the given function for each element between the given
// indices. This tends to be more efficient than looping over the
// indices and calling `get`, because it doesn't have to descend the
// tree for every element.
RopeSequence.prototype.forEach = function forEach (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  if (from <= to)
    { this.forEachInner(f, from, to, 0); }
  else
    { this.forEachInvertedInner(f, from, to, 0); }
};

// :: ((element: T, index: number) → U, ?number, ?number) → [U]
// Map the given functions over the elements of the rope, producing
// a flat array.
RopeSequence.prototype.map = function map (f, from, to) {
    if ( from === void 0 ) from = 0;
    if ( to === void 0 ) to = this.length;

  var result = [];
  this.forEach(function (elt, i) { return result.push(f(elt, i)); }, from, to);
  return result
};

// :: (?union<[T], RopeSequence<T>>) → RopeSequence<T>
// Create a rope representing the given array, or return the rope
// itself if a rope was given.
RopeSequence.from = function from (values) {
  if (values instanceof RopeSequence) { return values }
  return values && values.length ? new Leaf(values) : RopeSequence.empty
};

var Leaf = /*@__PURE__*/(function (RopeSequence) {
  function Leaf(values) {
    RopeSequence.call(this);
    this.values = values;
  }

  if ( RopeSequence ) Leaf.__proto__ = RopeSequence;
  Leaf.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Leaf.prototype.constructor = Leaf;

  var prototypeAccessors = { length: { configurable: true },depth: { configurable: true } };

  Leaf.prototype.flatten = function flatten () {
    return this.values
  };

  Leaf.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    return new Leaf(this.values.slice(from, to))
  };

  Leaf.prototype.getInner = function getInner (i) {
    return this.values[i]
  };

  Leaf.prototype.forEachInner = function forEachInner (f, from, to, start) {
    for (var i = from; i < to; i++)
      { if (f(this.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    for (var i = from - 1; i >= to; i--)
      { if (f(this.values[i], start + i) === false) { return false } }
  };

  Leaf.prototype.leafAppend = function leafAppend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(this.values.concat(other.flatten())) }
  };

  Leaf.prototype.leafPrepend = function leafPrepend (other) {
    if (this.length + other.length <= GOOD_LEAF_SIZE)
      { return new Leaf(other.flatten().concat(this.values)) }
  };

  prototypeAccessors.length.get = function () { return this.values.length };

  prototypeAccessors.depth.get = function () { return 0 };

  Object.defineProperties( Leaf.prototype, prototypeAccessors );

  return Leaf;
}(RopeSequence));

// :: RopeSequence
// The empty rope sequence.
RopeSequence.empty = new Leaf([]);

var Append = /*@__PURE__*/(function (RopeSequence) {
  function Append(left, right) {
    RopeSequence.call(this);
    this.left = left;
    this.right = right;
    this.length = left.length + right.length;
    this.depth = Math.max(left.depth, right.depth) + 1;
  }

  if ( RopeSequence ) Append.__proto__ = RopeSequence;
  Append.prototype = Object.create( RopeSequence && RopeSequence.prototype );
  Append.prototype.constructor = Append;

  Append.prototype.flatten = function flatten () {
    return this.left.flatten().concat(this.right.flatten())
  };

  Append.prototype.getInner = function getInner (i) {
    return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length)
  };

  Append.prototype.forEachInner = function forEachInner (f, from, to, start) {
    var leftLen = this.left.length;
    if (from < leftLen &&
        this.left.forEachInner(f, from, Math.min(to, leftLen), start) === false)
      { return false }
    if (to > leftLen &&
        this.right.forEachInner(f, Math.max(from - leftLen, 0), Math.min(this.length, to) - leftLen, start + leftLen) === false)
      { return false }
  };

  Append.prototype.forEachInvertedInner = function forEachInvertedInner (f, from, to, start) {
    var leftLen = this.left.length;
    if (from > leftLen &&
        this.right.forEachInvertedInner(f, from - leftLen, Math.max(to, leftLen) - leftLen, start + leftLen) === false)
      { return false }
    if (to < leftLen &&
        this.left.forEachInvertedInner(f, Math.min(from, leftLen), to, start) === false)
      { return false }
  };

  Append.prototype.sliceInner = function sliceInner (from, to) {
    if (from == 0 && to == this.length) { return this }
    var leftLen = this.left.length;
    if (to <= leftLen) { return this.left.slice(from, to) }
    if (from >= leftLen) { return this.right.slice(from - leftLen, to - leftLen) }
    return this.left.slice(from, leftLen).append(this.right.slice(0, to - leftLen))
  };

  Append.prototype.leafAppend = function leafAppend (other) {
    var inner = this.right.leafAppend(other);
    if (inner) { return new Append(this.left, inner) }
  };

  Append.prototype.leafPrepend = function leafPrepend (other) {
    var inner = this.left.leafPrepend(other);
    if (inner) { return new Append(inner, this.right) }
  };

  Append.prototype.appendInner = function appendInner (other) {
    if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1)
      { return new Append(this.left, new Append(this.right, other)) }
    return new Append(this, other)
  };

  return Append;
}(RopeSequence));

// ProseMirror's history isn't simply a way to roll back to a previous
// state, because ProseMirror supports applying changes without adding
// them to the history (for example during collaboration).
//
// To this end, each 'Branch' (one for the undo history and one for
// the redo history) keeps an array of 'Items', which can optionally
// hold a step (an actual undoable change), and always hold a position
// map (which is needed to move changes below them to apply to the
// current document).
//
// An item that has both a step and a selection bookmark is the start
// of an 'event' — a group of changes that will be undone or redone at
// once. (It stores only the bookmark, since that way we don't have to
// provide a document until the selection is actually applied, which
// is useful when compressing.)
// Used to schedule history compression
const max_empty_items = 500;
class Branch {
    constructor(items, eventCount) {
        this.items = items;
        this.eventCount = eventCount;
    }
    // Pop the latest event off the branch's history and apply it
    // to a document transform.
    popEvent(state, preserveItems) {
        if (this.eventCount == 0)
            return null;
        let end = this.items.length;
        for (;; end--) {
            let next = this.items.get(end - 1);
            if (next.selection) {
                --end;
                break;
            }
        }
        let remap, mapFrom;
        if (preserveItems) {
            remap = this.remapping(end, this.items.length);
            mapFrom = remap.maps.length;
        }
        let transform = state.tr;
        let selection, remaining;
        let addAfter = [], addBefore = [];
        this.items.forEach((item, i) => {
            if (!item.step) {
                if (!remap) {
                    remap = this.remapping(end, i + 1);
                    mapFrom = remap.maps.length;
                }
                mapFrom--;
                addBefore.push(item);
                return;
            }
            if (remap) {
                addBefore.push(new Item(item.map));
                let step = item.step.map(remap.slice(mapFrom)), map;
                if (step && transform.maybeStep(step).doc) {
                    map = transform.mapping.maps[transform.mapping.maps.length - 1];
                    addAfter.push(new Item(map, undefined, undefined, addAfter.length + addBefore.length));
                }
                mapFrom--;
                if (map)
                    remap.appendMap(map, mapFrom);
            }
            else {
                transform.maybeStep(item.step);
            }
            if (item.selection) {
                selection = remap ? item.selection.map(remap.slice(mapFrom)) : item.selection;
                remaining = new Branch(this.items.slice(0, end).append(addBefore.reverse().concat(addAfter)), this.eventCount - 1);
                return false;
            }
        }, this.items.length, 0);
        return { remaining: remaining, transform, selection: selection };
    }
    // Create a new branch with the given transform added.
    addTransform(transform, selection, histOptions, preserveItems) {
        let newItems = [], eventCount = this.eventCount;
        let oldItems = this.items, lastItem = !preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null;
        for (let i = 0; i < transform.steps.length; i++) {
            let step = transform.steps[i].invert(transform.docs[i]);
            let item = new Item(transform.mapping.maps[i], step, selection), merged;
            if (merged = lastItem && lastItem.merge(item)) {
                item = merged;
                if (i)
                    newItems.pop();
                else
                    oldItems = oldItems.slice(0, oldItems.length - 1);
            }
            newItems.push(item);
            if (selection) {
                eventCount++;
                selection = undefined;
            }
            if (!preserveItems)
                lastItem = item;
        }
        let overflow = eventCount - histOptions.depth;
        if (overflow > DEPTH_OVERFLOW) {
            oldItems = cutOffEvents(oldItems, overflow);
            eventCount -= overflow;
        }
        return new Branch(oldItems.append(newItems), eventCount);
    }
    remapping(from, to) {
        let maps = new Mapping;
        this.items.forEach((item, i) => {
            let mirrorPos = item.mirrorOffset != null && i - item.mirrorOffset >= from
                ? maps.maps.length - item.mirrorOffset : undefined;
            maps.appendMap(item.map, mirrorPos);
        }, from, to);
        return maps;
    }
    addMaps(array) {
        if (this.eventCount == 0)
            return this;
        return new Branch(this.items.append(array.map(map => new Item(map))), this.eventCount);
    }
    // When the collab module receives remote changes, the history has
    // to know about those, so that it can adjust the steps that were
    // rebased on top of the remote changes, and include the position
    // maps for the remote changes in its array of items.
    rebased(rebasedTransform, rebasedCount) {
        if (!this.eventCount)
            return this;
        let rebasedItems = [], start = Math.max(0, this.items.length - rebasedCount);
        let mapping = rebasedTransform.mapping;
        let newUntil = rebasedTransform.steps.length;
        let eventCount = this.eventCount;
        this.items.forEach(item => { if (item.selection)
            eventCount--; }, start);
        let iRebased = rebasedCount;
        this.items.forEach(item => {
            let pos = mapping.getMirror(--iRebased);
            if (pos == null)
                return;
            newUntil = Math.min(newUntil, pos);
            let map = mapping.maps[pos];
            if (item.step) {
                let step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
                let selection = item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
                if (selection)
                    eventCount++;
                rebasedItems.push(new Item(map, step, selection));
            }
            else {
                rebasedItems.push(new Item(map));
            }
        }, start);
        let newMaps = [];
        for (let i = rebasedCount; i < newUntil; i++)
            newMaps.push(new Item(mapping.maps[i]));
        let items = this.items.slice(0, start).append(newMaps).append(rebasedItems);
        let branch = new Branch(items, eventCount);
        if (branch.emptyItemCount() > max_empty_items)
            branch = branch.compress(this.items.length - rebasedItems.length);
        return branch;
    }
    emptyItemCount() {
        let count = 0;
        this.items.forEach(item => { if (!item.step)
            count++; });
        return count;
    }
    // Compressing a branch means rewriting it to push the air (map-only
    // items) out. During collaboration, these naturally accumulate
    // because each remote change adds one. The `upto` argument is used
    // to ensure that only the items below a given level are compressed,
    // because `rebased` relies on a clean, untouched set of items in
    // order to associate old items with rebased steps.
    compress(upto = this.items.length) {
        let remap = this.remapping(0, upto), mapFrom = remap.maps.length;
        let items = [], events = 0;
        this.items.forEach((item, i) => {
            if (i >= upto) {
                items.push(item);
                if (item.selection)
                    events++;
            }
            else if (item.step) {
                let step = item.step.map(remap.slice(mapFrom)), map = step && step.getMap();
                mapFrom--;
                if (map)
                    remap.appendMap(map, mapFrom);
                if (step) {
                    let selection = item.selection && item.selection.map(remap.slice(mapFrom));
                    if (selection)
                        events++;
                    let newItem = new Item(map.invert(), step, selection), merged, last = items.length - 1;
                    if (merged = items.length && items[last].merge(newItem))
                        items[last] = merged;
                    else
                        items.push(newItem);
                }
            }
            else if (item.map) {
                mapFrom--;
            }
        }, this.items.length, 0);
        return new Branch(RopeSequence.from(items.reverse()), events);
    }
}
Branch.empty = new Branch(RopeSequence.empty, 0);
function cutOffEvents(items, n) {
    let cutPoint;
    items.forEach((item, i) => {
        if (item.selection && (n-- == 0)) {
            cutPoint = i;
            return false;
        }
    });
    return items.slice(cutPoint);
}
class Item {
    constructor(
    // The (forward) step map for this item.
    map, 
    // The inverted step
    step, 
    // If this is non-null, this item is the start of a group, and
    // this selection is the starting selection for the group (the one
    // that was active before the first step was applied)
    selection, 
    // If this item is the inverse of a previous mapping on the stack,
    // this points at the inverse's offset
    mirrorOffset) {
        this.map = map;
        this.step = step;
        this.selection = selection;
        this.mirrorOffset = mirrorOffset;
    }
    merge(other) {
        if (this.step && other.step && !other.selection) {
            let step = other.step.merge(this.step);
            if (step)
                return new Item(step.getMap().invert(), step, this.selection);
        }
    }
}
// The value of the state field that tracks undo/redo history for that
// state. Will be stored in the plugin state when the history plugin
// is active.
class HistoryState {
    constructor(done, undone, prevRanges, prevTime, prevComposition) {
        this.done = done;
        this.undone = undone;
        this.prevRanges = prevRanges;
        this.prevTime = prevTime;
        this.prevComposition = prevComposition;
    }
}
const DEPTH_OVERFLOW = 20;
// Record a transformation in undo history.
function applyTransaction(history, state, tr, options) {
    let historyTr = tr.getMeta(historyKey), rebased;
    if (historyTr)
        return historyTr.historyState;
    if (tr.getMeta(closeHistoryKey))
        history = new HistoryState(history.done, history.undone, null, 0, -1);
    let appended = tr.getMeta("appendedTransaction");
    if (tr.steps.length == 0) {
        return history;
    }
    else if (appended && appended.getMeta(historyKey)) {
        if (appended.getMeta(historyKey).redo)
            return new HistoryState(history.done.addTransform(tr, undefined, options, mustPreserveItems(state)), history.undone, rangesFor(tr.mapping.maps[tr.steps.length - 1]), history.prevTime, history.prevComposition);
        else
            return new HistoryState(history.done, history.undone.addTransform(tr, undefined, options, mustPreserveItems(state)), null, history.prevTime, history.prevComposition);
    }
    else if (tr.getMeta("addToHistory") !== false && !(appended && appended.getMeta("addToHistory") === false)) {
        // Group transforms that occur in quick succession into one event.
        let composition = tr.getMeta("composition");
        let newGroup = history.prevTime == 0 ||
            (!appended && history.prevComposition != composition &&
                (history.prevTime < (tr.time || 0) - options.newGroupDelay || !isAdjacentTo(tr, history.prevRanges)));
        let prevRanges = appended ? mapRanges(history.prevRanges, tr.mapping) : rangesFor(tr.mapping.maps[tr.steps.length - 1]);
        return new HistoryState(history.done.addTransform(tr, newGroup ? state.selection.getBookmark() : undefined, options, mustPreserveItems(state)), Branch.empty, prevRanges, tr.time, composition == null ? history.prevComposition : composition);
    }
    else if (rebased = tr.getMeta("rebased")) {
        // Used by the collab module to tell the history that some of its
        // content has been rebased.
        return new HistoryState(history.done.rebased(tr, rebased), history.undone.rebased(tr, rebased), mapRanges(history.prevRanges, tr.mapping), history.prevTime, history.prevComposition);
    }
    else {
        return new HistoryState(history.done.addMaps(tr.mapping.maps), history.undone.addMaps(tr.mapping.maps), mapRanges(history.prevRanges, tr.mapping), history.prevTime, history.prevComposition);
    }
}
function isAdjacentTo(transform, prevRanges) {
    if (!prevRanges)
        return false;
    if (!transform.docChanged)
        return true;
    let adjacent = false;
    transform.mapping.maps[0].forEach((start, end) => {
        for (let i = 0; i < prevRanges.length; i += 2)
            if (start <= prevRanges[i + 1] && end >= prevRanges[i])
                adjacent = true;
    });
    return adjacent;
}
function rangesFor(map) {
    let result = [];
    map.forEach((_from, _to, from, to) => result.push(from, to));
    return result;
}
function mapRanges(ranges, mapping) {
    if (!ranges)
        return null;
    let result = [];
    for (let i = 0; i < ranges.length; i += 2) {
        let from = mapping.map(ranges[i], 1), to = mapping.map(ranges[i + 1], -1);
        if (from <= to)
            result.push(from, to);
    }
    return result;
}
// Apply the latest event from one branch to the document and shift the event
// onto the other branch.
function histTransaction(history, state, dispatch, redo) {
    let preserveItems = mustPreserveItems(state);
    let histOptions = historyKey.get(state).spec.config;
    let pop = (redo ? history.undone : history.done).popEvent(state, preserveItems);
    if (!pop)
        return;
    let selection = pop.selection.resolve(pop.transform.doc);
    let added = (redo ? history.done : history.undone).addTransform(pop.transform, state.selection.getBookmark(), histOptions, preserveItems);
    let newHist = new HistoryState(redo ? added : pop.remaining, redo ? pop.remaining : added, null, 0, -1);
    dispatch(pop.transform.setSelection(selection).setMeta(historyKey, { redo, historyState: newHist }).scrollIntoView());
}
let cachedPreserveItems = false, cachedPreserveItemsPlugins = null;
// Check whether any plugin in the given state has a
// `historyPreserveItems` property in its spec, in which case we must
// preserve steps exactly as they came in, so that they can be
// rebased.
function mustPreserveItems(state) {
    let plugins = state.plugins;
    if (cachedPreserveItemsPlugins != plugins) {
        cachedPreserveItems = false;
        cachedPreserveItemsPlugins = plugins;
        for (let i = 0; i < plugins.length; i++)
            if (plugins[i].spec.historyPreserveItems) {
                cachedPreserveItems = true;
                break;
            }
    }
    return cachedPreserveItems;
}
const historyKey = new PluginKey("history");
const closeHistoryKey = new PluginKey("closeHistory");
/**
Returns a plugin that enables the undo history for an editor. The
plugin will track undo and redo stacks, which can be used with the
[`undo`](https://prosemirror.net/docs/ref/#history.undo) and [`redo`](https://prosemirror.net/docs/ref/#history.redo) commands.

You can set an `"addToHistory"` [metadata
property](https://prosemirror.net/docs/ref/#state.Transaction.setMeta) of `false` on a transaction
to prevent it from being rolled back by undo.
*/
function history(config = {}) {
    config = { depth: config.depth || 100,
        newGroupDelay: config.newGroupDelay || 500 };
    return new Plugin({
        key: historyKey,
        state: {
            init() {
                return new HistoryState(Branch.empty, Branch.empty, null, 0, -1);
            },
            apply(tr, hist, state) {
                return applyTransaction(hist, state, tr, config);
            }
        },
        config,
        props: {
            handleDOMEvents: {
                beforeinput(view, e) {
                    let inputType = e.inputType;
                    let command = inputType == "historyUndo" ? undo : inputType == "historyRedo" ? redo : null;
                    if (!command)
                        return false;
                    e.preventDefault();
                    return command(view.state, view.dispatch);
                }
            }
        }
    });
}
/**
A command function that undoes the last change, if any.
*/
const undo = (state, dispatch) => {
    let hist = historyKey.getState(state);
    if (!hist || hist.done.eventCount == 0)
        return false;
    if (dispatch)
        histTransaction(hist, state, dispatch, false);
    return true;
};
/**
A command function that redoes the last undone change, if any.
*/
const redo = (state, dispatch) => {
    let hist = historyKey.getState(state);
    if (!hist || hist.undone.eventCount == 0)
        return false;
    if (dispatch)
        histTransaction(hist, state, dispatch, true);
    return true;
};

var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
};

var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: "\""
};

var mac$1 = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);

// Fill in the digit keys
for (var i$1 = 0; i$1 < 10; i$1++) base[48 + i$1] = base[96 + i$1] = String(i$1);

// The function keys
for (var i$1 = 1; i$1 <= 24; i$1++) base[i$1 + 111] = "F" + i$1;

// And the alphabetic keys
for (var i$1 = 65; i$1 <= 90; i$1++) {
  base[i$1] = String.fromCharCode(i$1 + 32);
  shift[i$1] = String.fromCharCode(i$1);
}

// For each code that doesn't have a shift-equivalent, copy the base name
for (var code in base) if (!shift.hasOwnProperty(code)) shift[code] = base[code];

function keyName(event) {
  // On macOS, keys held with Shift and Cmd don't reflect the effect of Shift in `.key`.
  // On IE, shift effect is never included in `.key`.
  var ignoreKey = mac$1 && event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey ||
      ie && event.shiftKey && event.key && event.key.length == 1 ||
      event.key == "Unidentified";
  var name = (!ignoreKey && event.key) ||
    (event.shiftKey ? shift : base)[event.keyCode] ||
    event.key || "Unidentified";
  // Edge sometimes produces wrong names (Issue #3)
  if (name == "Esc") name = "Escape";
  if (name == "Del") name = "Delete";
  // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8860571/
  if (name == "Left") name = "ArrowLeft";
  if (name == "Up") name = "ArrowUp";
  if (name == "Right") name = "ArrowRight";
  if (name == "Down") name = "ArrowDown";
  return name
}

const mac = typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : false;
function normalizeKeyName(name) {
    let parts = name.split(/-(?!$)/), result = parts[parts.length - 1];
    if (result == "Space")
        result = " ";
    let alt, ctrl, shift, meta;
    for (let i = 0; i < parts.length - 1; i++) {
        let mod = parts[i];
        if (/^(cmd|meta|m)$/i.test(mod))
            meta = true;
        else if (/^a(lt)?$/i.test(mod))
            alt = true;
        else if (/^(c|ctrl|control)$/i.test(mod))
            ctrl = true;
        else if (/^s(hift)?$/i.test(mod))
            shift = true;
        else if (/^mod$/i.test(mod)) {
            if (mac)
                meta = true;
            else
                ctrl = true;
        }
        else
            throw new Error("Unrecognized modifier name: " + mod);
    }
    if (alt)
        result = "Alt-" + result;
    if (ctrl)
        result = "Ctrl-" + result;
    if (meta)
        result = "Meta-" + result;
    if (shift)
        result = "Shift-" + result;
    return result;
}
function normalize(map) {
    let copy = Object.create(null);
    for (let prop in map)
        copy[normalizeKeyName(prop)] = map[prop];
    return copy;
}
function modifiers(name, event, shift = true) {
    if (event.altKey)
        name = "Alt-" + name;
    if (event.ctrlKey)
        name = "Ctrl-" + name;
    if (event.metaKey)
        name = "Meta-" + name;
    if (shift && event.shiftKey)
        name = "Shift-" + name;
    return name;
}
/**
Create a keymap plugin for the given set of bindings.

Bindings should map key names to [command](https://prosemirror.net/docs/ref/#commands)-style
functions, which will be called with `(EditorState, dispatch,
EditorView)` arguments, and should return true when they've handled
the key. Note that the view argument isn't part of the command
protocol, but can be used as an escape hatch if a binding needs to
directly interact with the UI.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key
identifier prefixed with zero or more modifiers. Key identifiers
are based on the strings that can appear in
[`KeyEvent.key`](https:developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized. For characters that are created by holding
shift, the `Shift-` prefix is implied, and should not be added
explicitly.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms.

You can add multiple keymap plugins to an editor. The order in
which they appear determines their precedence (the ones early in
the array get to dispatch first).
*/
function keymap(bindings) {
    return new Plugin({ props: { handleKeyDown: keydownHandler(bindings) } });
}
/**
Given a set of bindings (using the same format as
[`keymap`](https://prosemirror.net/docs/ref/#keymap.keymap)), return a [keydown
handler](https://prosemirror.net/docs/ref/#view.EditorProps.handleKeyDown) that handles them.
*/
function keydownHandler(bindings) {
    let map = normalize(bindings);
    return function (view, event) {
        let name = keyName(event), baseName, direct = map[modifiers(name, event)];
        if (direct && direct(view.state, view.dispatch, view))
            return true;
        // A character key
        if (name.length == 1 && name != " ") {
            if (event.shiftKey) {
                // In case the name was already modified by shift, try looking
                // it up without its shift modifier
                let noShift = map[modifiers(name, event, false)];
                if (noShift && noShift(view.state, view.dispatch, view))
                    return true;
            }
            if ((event.shiftKey || event.altKey || event.metaKey || name.charCodeAt(0) > 127) &&
                (baseName = base[event.keyCode]) && baseName != name) {
                // Try falling back to the keyCode when there's a modifier
                // active or the character produced isn't ASCII, and our table
                // produces a different name from the the keyCode. See #668,
                // #1060
                let fromCode = map[modifiers(baseName, event)];
                if (fromCode && fromCode(view.state, view.dispatch, view))
                    return true;
            }
        }
        return false;
    };
}

/**
Input rules are regular expressions describing a piece of text
that, when typed, causes something to happen. This might be
changing two dashes into an emdash, wrapping a paragraph starting
with `"> "` into a blockquote, or something entirely different.
*/
class InputRule {
    // :: (RegExp, union<string, (state: EditorState, match: [string], start: number, end: number) → ?Transaction>)
    /**
    Create an input rule. The rule applies when the user typed
    something and the text directly in front of the cursor matches
    `match`, which should end with `$`.
    
    The `handler` can be a string, in which case the matched text, or
    the first matched group in the regexp, is replaced by that
    string.
    
    Or a it can be a function, which will be called with the match
    array produced by
    [`RegExp.exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec),
    as well as the start and end of the matched range, and which can
    return a [transaction](https://prosemirror.net/docs/ref/#state.Transaction) that describes the
    rule's effect, or null to indicate the input was not handled.
    */
    constructor(
    /**
    @internal
    */
    match, handler) {
        this.match = match;
        this.match = match;
        this.handler = typeof handler == "string" ? stringHandler(handler) : handler;
    }
}
function stringHandler(string) {
    return function (state, match, start, end) {
        let insert = string;
        if (match[1]) {
            let offset = match[0].lastIndexOf(match[1]);
            insert += match[0].slice(offset + match[1].length);
            start += offset;
            let cutOff = start - end;
            if (cutOff > 0) {
                insert = match[0].slice(offset - cutOff, offset) + insert;
                start = end;
            }
        }
        return state.tr.insertText(insert, start, end);
    };
}
const MAX_MATCH = 500;
/**
Create an input rules plugin. When enabled, it will cause text
input that matches any of the given rules to trigger the rule's
action.
*/
function inputRules({ rules }) {
    let plugin = new Plugin({
        state: {
            init() { return null; },
            apply(tr, prev) {
                let stored = tr.getMeta(this);
                if (stored)
                    return stored;
                return tr.selectionSet || tr.docChanged ? null : prev;
            }
        },
        props: {
            handleTextInput(view, from, to, text) {
                return run(view, from, to, text, rules, plugin);
            },
            handleDOMEvents: {
                compositionend: (view) => {
                    setTimeout(() => {
                        let { $cursor } = view.state.selection;
                        if ($cursor)
                            run(view, $cursor.pos, $cursor.pos, "", rules, plugin);
                    });
                }
            }
        },
        isInputRules: true
    });
    return plugin;
}
function run(view, from, to, text, rules, plugin) {
    if (view.composing)
        return false;
    let state = view.state, $from = state.doc.resolve(from);
    if ($from.parent.type.spec.code)
        return false;
    let textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, null, "\ufffc") + text;
    for (let i = 0; i < rules.length; i++) {
        let match = rules[i].match.exec(textBefore);
        let tr = match && rules[i].handler(state, match, from - (match[0].length - text.length), to);
        if (!tr)
            continue;
        view.dispatch(tr.setMeta(plugin, { transform: tr, from, to, text }));
        return true;
    }
    return false;
}

/**
Build an input rule for automatically wrapping a textblock when a
given string is typed. The `regexp` argument is
directly passed through to the `InputRule` constructor. You'll
probably want the regexp to start with `^`, so that the pattern can
only occur at the start of a textblock.

`nodeType` is the type of node to wrap in. If it needs attributes,
you can either pass them directly, or pass a function that will
compute them from the regular expression match.

By default, if there's a node with the same type above the newly
wrapped node, the rule will try to [join](https://prosemirror.net/docs/ref/#transform.Transform.join) those
two nodes. You can pass a join predicate, which takes a regular
expression match and the node before the wrapped node, and can
return a boolean to indicate whether a join should happen.
*/
function wrappingInputRule(regexp, nodeType, getAttrs = null, joinPredicate) {
    return new InputRule(regexp, (state, match, start, end) => {
        let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
        let tr = state.tr.delete(start, end);
        let $start = tr.doc.resolve(start), range = $start.blockRange(), wrapping = range && findWrapping(range, nodeType, attrs);
        if (!wrapping)
            return null;
        tr.wrap(range, wrapping);
        let before = tr.doc.resolve(start - 1).nodeBefore;
        if (before && before.type == nodeType && canJoin(tr.doc, start - 1) &&
            (!joinPredicate || joinPredicate(match, before)))
            tr.join(start - 1);
        return tr;
    });
}
/**
Build an input rule that changes the type of a textblock when the
matched text is typed into it. You'll usually want to start your
regexp with `^` to that it is only matched at the start of a
textblock. The optional `getAttrs` parameter can be used to compute
the new node's attributes, and works the same as in the
`wrappingInputRule` function.
*/
function textblockTypeInputRule(regexp, nodeType, getAttrs = null) {
    return new InputRule(regexp, (state, match, start, end) => {
        let $start = state.doc.resolve(start);
        let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
        if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType))
            return null;
        return state.tr
            .delete(start, end)
            .setBlockType(start, start, nodeType, attrs);
    });
}

function buildKeymap() {
    const mac = typeof navigator != "undefined"
        ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
        : false;
    const km = {
        Enter: chainCommands(
        // NOTE: splitListItem copies all attributes from the previous node
        // => a new task list item after a checked item will also be checked
        ...listItemNodes.map((nodeType) => splitListItem(nodeType, 
        // do not copy the previous list item attributes
        {}))),
        "Shift-Enter": breaklineCmd(),
        "Mod-Enter": breaklineCmd(),
        "Mod-z": undo,
        "Mod-y": redo,
        "Mod-b": toggleMark(schema.marks.strong),
        "Mod-i": toggleMark(schema.marks.em),
        "Mod-u": toggleMark(schema.marks.underline),
        // TODO: backspace on empty block should remove heading level/block type if any
        Backspace: removeBlockIfAtStartCmd(),
    };
    if (mac) {
        km["Ctrl+Enter"] = breaklineCmd();
    }
    return km;
}

const mdHeadingRule = textblockTypeInputRule(/^(#{1,6}) $/, schema.nodes.heading, function getHeadingAttrs(match) {
    const level = match[1].length;
    if (level < 1 || level > 6) {
        console.warn("Heading input rule matched an invalid heading level:", level);
        return { level: 1 };
    }
    return {
        level,
    };
});
const mdBulletListRule = wrappingInputRule(/^([\-\*\+]) $/, schema.nodes.bullet_list, function (match) {
    return {};
});
/**
 * @example "1. " or "42) "
 * If digit is too big for display, start at 1
 * If there is another list **above**, will auto-join and fix numbering
 * If there is another list below, will NOT auto-join
 * Negative numbers are ignored (they start with a "-" not a digit)
 */
const mdOrderedListRule = wrappingInputRule(/^(\d+)([\.\)]) $/, schema.nodes.ordered_list, function (match) {
    // NOTE: we must wrap with an "ordered_list" and not a generic "list_item"
    // to be able to specify the right numbering
    const startOrder = parseInt(match[1]);
    if (isNaN(startOrder)) {
        console.warn("Started a list with an invalid number: " + startOrder);
        return {};
    }
    // list over 3 digits don't display well
    if (match[1].length > 3) {
        return {};
    }
    return {
        order: startOrder,
    };
});
function spanMultipleNodes(state, start, end) {
    const startNode = state.doc.nodeAt(start);
    const endNode = state.doc.nodeAt(end);
    if (endNode && startNode !== endNode) {
        console.warn("adding marks across multiple nodes, ignore:", startNode, endNode);
        return true;
    }
    return false;
}
const mdStarRule = new InputRule(/(\*{1,3})([^\*]+)(\*{1,3})$/, (state, match, start, end) => {
    // can only mark content of a node
    if (spanMultipleNodes(state, start, end)) {
        return null;
    }
    const beginStar = match[1];
    const content = match[2];
    const endStar = match[3];
    // not enough closing stars yet, ignore
    if (beginStar.length !== endStar.length)
        return null;
    const nbStar = beginStar.length;
    const mts = {
        1: [schema.marks.em],
        2: [schema.marks.strong],
        3: [schema.marks.em, schema.marks.strong],
    }[nbStar];
    const tr = state.tr;
    const newText = schema.text(content, mts.map((mt) => mt.create(null)));
    tr.replaceWith(start, end, newText);
    return tr;
});
/**
 * Technically github markdown spec doesn't handle "___" (three underscore)
 * but we accept it to keep symmetry with "***"
 */
const mdUnderscoreRule = new InputRule(/(\_{1,3})([^\_]+)(\_{1,3})$/, (state, match, start, end) => {
    // can only mark content of a node
    if (spanMultipleNodes(state, start, end)) {
        return null;
    }
    const beginStar = match[1];
    const content = match[2];
    const endStar = match[3];
    // not enough closing stars yet, ignore
    if (beginStar.length !== endStar.length)
        return null;
    const nbStar = beginStar.length;
    const mts = {
        1: [schema.marks.em],
        2: [schema.marks.strong],
        3: [schema.marks.em, schema.marks.strong],
    }[nbStar];
    const tr = state.tr;
    const newText = schema.text(content, mts.map((mt) => mt.create(null)));
    tr.replaceWith(start, end, newText);
    return tr;
});
/**
 * Matches "[ ] " or "[x] " at the begining of a line
 * NOTE: We do not match "- [ ]" with a dash because of the ambiguity with normal list "- "
 *
 */
const mdTaskListRule = wrappingInputRule(/^\[([\ x]?)\] $/, schema.nodes.task_list_item, function (match) {
    // "wrappingInputRule" automatically introduce necessary wrapping nodes
    // and join with existing ones
    // => you can safely wrap with "task_list_item" instead of "task_list"
    // this is needed to make the item checked
    if (match[1] === "x")
        return { checked: true };
    return {};
});
const mdPre = wrappingInputRule(/^```$/, schema.nodes.pre);
const mdBlockQuote = wrappingInputRule(/^> $/, schema.nodes.blockquote);
const markdownRules = [
    mdHeadingRule,
    mdOrderedListRule,
    mdBulletListRule,
    mdStarRule,
    mdUnderscoreRule,
    mdTaskListRule,
    mdPre,
    mdBlockQuote,
];

const HasSearchPill = hasFlag("searchpill");
const searchPillRule = new InputRule(/\ @$|^@$/, (state, match, start, end) => {
    if (!HasSearchPill)
        return null;
    // TODO: check if a search pill can be created here
    // there are helpers to do so based on the schema or at least examples in prosemirror codebase
    const tr = state.tr;
    // input rule will delete the space if any, reintroduce it
    if (start < end) {
        tr.insertText(" ");
    }
    // delete the @ but not the space
    const searchPill = schema.nodes.search_pill.create();
    tr.insert(end, searchPill);
    // select the pill directly, this prevents from having a cursor after the node
    tr.setSelection(NodeSelection.create(tr.doc, end));
    return tr;
});
const pillRules = [searchPillRule];

const plugins = [
    history(),
    keymap(buildKeymap()),
    // will add more default shortcuts
    // + fallback if no command of a custom shortcut match (eg pressing "Enter" outside of a list)
    keymap(baseKeymap),
    dropCursor({
        class: "bg-yellow-400",
        // @see https://github.com/ProseMirror/prosemirror-dropcursor/pull/17
        //color: null,
        color: "rgb(250 204 21)",
        width: 4,
    }),
    /**
     * Input rules are similar to keymap shortcut,
     * but can match regex
     * Useful to allow markdown shortcut,
     * or automatically convert some special characters
     */
    inputRules({
        rules: [...markdownRules, ...pillRules],
    }),
];

const paths = {
    strong: b `<path d="M16.9768 11.6829C17.8768 10.7454 18.4286 9.4784 18.4286 8.08555V7.81233C18.4286 4.93019 16.0687 2.5918 13.1598 2.5918H5.23393C4.82946 2.5918 4.5 2.92126 4.5 3.32573V21.5159C4.5 21.9525 4.85357 22.3061 5.29018 22.3061H13.8268C16.9607 22.3061 19.5 19.7829 19.5 16.6677V16.373C19.5 14.4177 18.4982 12.6954 16.9768 11.6829ZM7.07143 5.16323H13.0902C14.6196 5.16323 15.8571 6.35251 15.8571 7.82305V8.07751C15.8571 9.54537 14.617 10.7373 13.0902 10.7373H7.07143V5.16323ZM16.8911 16.665C16.8911 18.3498 15.5062 19.7159 13.7973 19.7159H7.07143V13.3248H13.7973C15.5062 13.3248 16.8911 14.6909 16.8911 16.3757V16.665Z"/>`,
    em: b `<path d="M19.6609 3.07227H8.08949C7.97163 3.07227 7.8752 3.16869 7.8752 3.28655V5.00084C7.8752 5.11869 7.97163 5.21512 8.08949 5.21512H12.9431L8.76449 19.7866H4.41984C4.30199 19.7866 4.20556 19.883 4.20556 20.0008V21.7151C4.20556 21.833 4.30199 21.9294 4.41984 21.9294H15.9913C16.1091 21.9294 16.2056 21.833 16.2056 21.7151V20.0008C16.2056 19.883 16.1091 19.7866 15.9913 19.7866H10.9931L15.1716 5.21512H19.6609C19.7788 5.21512 19.8752 5.11869 19.8752 5.00084V3.28655C19.8752 3.16869 19.7788 3.07227 19.6609 3.07227Z"/>`,
    underline: b `<path d="M20.3578 20.3231H3.64347C3.52561 20.3231 3.42918 20.4142 3.42918 20.5267V22.1552C3.42918 22.2677 3.52561 22.3588 3.64347 22.3588H20.3578C20.4756 22.3588 20.572 22.2677 20.572 22.1552V20.5267C20.572 20.4142 20.4756 20.3231 20.3578 20.3231ZM12.0006 18.2874C13.8595 18.2874 15.606 17.5615 16.9238 16.2463C18.2417 14.9311 18.9649 13.182 18.9649 11.3231V2.96596C18.9649 2.78917 18.8203 2.64453 18.6435 2.64453H17.0363C16.8595 2.64453 16.7149 2.78917 16.7149 2.96596V11.3231C16.7149 13.9213 14.5988 16.0374 12.0006 16.0374C9.4024 16.0374 7.28633 13.9213 7.28633 11.3231V2.96596C7.28633 2.78917 7.14168 2.64453 6.9649 2.64453H5.35776C5.18097 2.64453 5.03633 2.78917 5.03633 2.96596V11.3231C5.03633 13.182 5.76222 14.9285 7.0774 16.2463C8.39258 17.5642 10.1417 18.2874 12.0006 18.2874Z"/>`,
    title: b `<path d="M22.9284 9.92941H14.7855C14.6677 9.92941 14.5712 10.0258 14.5712 10.1437V13.1437C14.5712 13.2616 14.6677 13.358 14.7855 13.358H16.0712C16.1891 13.358 16.2855 13.2616 16.2855 13.1437V11.6437H17.8927V20.2151H16.6605C16.5427 20.2151 16.4462 20.3116 16.4462 20.4294V21.7151C16.4462 21.833 16.5427 21.9294 16.6605 21.9294H21.0534C21.1712 21.9294 21.2677 21.833 21.2677 21.7151V20.4294C21.2677 20.3116 21.1712 20.2151 21.0534 20.2151H19.8212V11.6437H21.4284V13.1437C21.4284 13.2616 21.5248 13.358 21.6427 13.358H22.9284C23.0462 13.358 23.1427 13.2616 23.1427 13.1437V10.1437C23.1427 10.0258 23.0462 9.92941 22.9284 9.92941ZM15.8569 6.71512V3.28655C15.8569 3.16869 15.7605 3.07227 15.6426 3.07227H1.07122C0.953362 3.07227 0.856934 3.16869 0.856934 3.28655V6.71512C0.856934 6.83298 0.953362 6.92941 1.07122 6.92941H2.57122C2.68908 6.92941 2.78551 6.83298 2.78551 6.71512V5.00084H7.28551V20.0008H4.82122C4.70336 20.0008 4.60693 20.0973 4.60693 20.2151V21.7151C4.60693 21.833 4.70336 21.9294 4.82122 21.9294H11.8926C12.0105 21.9294 12.1069 21.833 12.1069 21.7151V20.2151C12.1069 20.0973 12.0105 20.0008 11.8926 20.0008H9.42836V5.00084H13.9284V6.71512C13.9284 6.83298 14.0248 6.92941 14.1426 6.92941H15.6426C15.7605 6.92941 15.8569 6.83298 15.8569 6.71512Z"/>`,
    ordered_list: b `<path d="M22.9298 19.1445H7.28691C7.16905 19.1445 7.07262 19.241 7.07262 19.3588V20.8588C7.07262 20.9767 7.16905 21.0731 7.28691 21.0731H22.9298C23.0476 21.0731 23.1441 20.9767 23.1441 20.8588V19.3588C23.1441 19.241 23.0476 19.1445 22.9298 19.1445ZM22.9298 3.93025H7.28691C7.16905 3.93025 7.07262 4.02667 7.07262 4.14453V5.64453C7.07262 5.76239 7.16905 5.85882 7.28691 5.85882H22.9298C23.0476 5.85882 23.1441 5.76239 23.1441 5.64453V4.14453C23.1441 4.02667 23.0476 3.93025 22.9298 3.93025ZM22.9298 11.5374H7.28691C7.16905 11.5374 7.07262 11.6338 7.07262 11.7517V13.2517C7.07262 13.3695 7.16905 13.466 7.28691 13.466H22.9298C23.0476 13.466 23.1441 13.3695 23.1441 13.2517V11.7517C23.1441 11.6338 23.0476 11.5374 22.9298 11.5374ZM4.07262 17.8588H0.96548C0.906552 17.8588 0.858337 17.907 0.858337 17.966V18.8767C0.858337 18.9356 0.906552 18.9838 0.96548 18.9838H2.90477V19.5329H1.94852C1.88959 19.5329 1.84137 19.5811 1.84137 19.6401V20.5508C1.84137 20.6097 1.88959 20.6579 1.94852 20.6579H2.90477V21.2338H0.96548C0.906552 21.2338 0.858337 21.282 0.858337 21.341V22.2517C0.858337 22.3106 0.906552 22.3588 0.96548 22.3588H4.07262C4.13155 22.3588 4.17977 22.3106 4.17977 22.2517V17.966C4.17977 17.907 4.13155 17.8588 4.07262 17.8588ZM0.96548 3.8231H1.98334V7.03739C1.98334 7.09632 2.03155 7.14453 2.09048 7.14453H3.16191C3.22084 7.14453 3.26905 7.09632 3.26905 7.03739V2.85882C3.26905 2.74096 3.17262 2.64453 3.05477 2.64453H0.96548C0.906552 2.64453 0.858337 2.69275 0.858337 2.75167V3.71596C0.858337 3.77489 0.906552 3.8231 0.96548 3.8231ZM4.07262 10.2517H0.96548C0.906552 10.2517 0.858337 10.2999 0.858337 10.3588V11.3231C0.858337 11.382 0.906552 11.4302 0.96548 11.4302H2.79762L0.914587 13.5115C0.879071 13.5514 0.859104 13.6027 0.858337 13.6561V14.6445C0.858337 14.7035 0.906552 14.7517 0.96548 14.7517H4.07262C4.13155 14.7517 4.17977 14.7035 4.17977 14.6445V13.6802C4.17977 13.6213 4.13155 13.5731 4.07262 13.5731H2.24048L4.12352 11.4919C4.15903 11.452 4.179 11.4006 4.17977 11.3472V10.3588C4.17977 10.2999 4.13155 10.2517 4.07262 10.2517Z"/>`,
    bullet_list: b `<path d="M22.7151 3.93025H7.07227C6.95441 3.93025 6.85798 4.02667 6.85798 4.14453V5.64453C6.85798 5.76239 6.95441 5.85882 7.07227 5.85882H22.7151C22.833 5.85882 22.9294 5.76239 22.9294 5.64453V4.14453C22.9294 4.02667 22.833 3.93025 22.7151 3.93025ZM22.7151 11.5374H7.07227C6.95441 11.5374 6.85798 11.6338 6.85798 11.7517V13.2517C6.85798 13.3695 6.95441 13.466 7.07227 13.466H22.7151C22.833 13.466 22.9294 13.3695 22.9294 13.2517V11.7517C22.9294 11.6338 22.833 11.5374 22.7151 11.5374ZM22.7151 19.1445H7.07227C6.95441 19.1445 6.85798 19.241 6.85798 19.3588V20.8588C6.85798 20.9767 6.95441 21.0731 7.07227 21.0731H22.7151C22.833 21.0731 22.9294 20.9767 22.9294 20.8588V19.3588C22.9294 19.241 22.833 19.1445 22.7151 19.1445ZM1.07227 4.89453C1.07227 5.09151 1.11106 5.28657 1.18645 5.46856C1.26183 5.65054 1.37232 5.8159 1.51161 5.95519C1.65089 6.09448 1.81625 6.20497 1.99824 6.28035C2.18023 6.35573 2.37528 6.39453 2.57227 6.39453C2.76925 6.39453 2.9643 6.35573 3.14629 6.28035C3.32828 6.20497 3.49364 6.09448 3.63293 5.95519C3.77221 5.8159 3.8827 5.65054 3.95809 5.46856C4.03347 5.28657 4.07227 5.09151 4.07227 4.89453C4.07227 4.69755 4.03347 4.50249 3.95809 4.32051C3.8827 4.13852 3.77221 3.97316 3.63293 3.83387C3.49364 3.69458 3.32828 3.58409 3.14629 3.50871C2.9643 3.43333 2.76925 3.39453 2.57227 3.39453C2.37528 3.39453 2.18023 3.43333 1.99824 3.50871C1.81625 3.58409 1.65089 3.69458 1.51161 3.83387C1.37232 3.97316 1.26183 4.13852 1.18645 4.32051C1.11106 4.50249 1.07227 4.69755 1.07227 4.89453ZM1.07227 12.5017C1.07227 12.6987 1.11106 12.8937 1.18645 13.0757C1.26183 13.2577 1.37232 13.423 1.51161 13.5623C1.65089 13.7016 1.81625 13.8121 1.99824 13.8875C2.18023 13.9629 2.37528 14.0017 2.57227 14.0017C2.76925 14.0017 2.9643 13.9629 3.14629 13.8875C3.32828 13.8121 3.49364 13.7016 3.63293 13.5623C3.77221 13.423 3.8827 13.2577 3.95809 13.0757C4.03347 12.8937 4.07227 12.6987 4.07227 12.5017C4.07227 12.3047 4.03347 12.1096 3.95809 11.9276C3.8827 11.7457 3.77221 11.5803 3.63293 11.441C3.49364 11.3017 3.32828 11.1912 3.14629 11.1159C2.9643 11.0405 2.76925 11.0017 2.57227 11.0017C2.37528 11.0017 2.18023 11.0405 1.99824 11.1159C1.81625 11.1912 1.65089 11.3017 1.51161 11.441C1.37232 11.5803 1.26183 11.7457 1.18645 11.9276C1.11106 12.1096 1.07227 12.3047 1.07227 12.5017ZM1.07227 20.1088C1.07227 20.3058 1.11106 20.5009 1.18645 20.6828C1.26183 20.8648 1.37232 21.0302 1.51161 21.1695C1.65089 21.3088 1.81625 21.4193 1.99824 21.4946C2.18023 21.57 2.37528 21.6088 2.57227 21.6088C2.76925 21.6088 2.9643 21.57 3.14629 21.4946C3.32828 21.4193 3.49364 21.3088 3.63293 21.1695C3.77221 21.0302 3.8827 20.8648 3.95809 20.6828C4.03347 20.5009 4.07227 20.3058 4.07227 20.1088C4.07227 19.9118 4.03347 19.7168 3.95809 19.5348C3.8827 19.3528 3.77221 19.1874 3.63293 19.0482C3.49364 18.9089 3.32828 18.7984 3.14629 18.723C2.9643 18.6476 2.76925 18.6088 2.57227 18.6088C2.37528 18.6088 2.18023 18.6476 1.99824 18.723C1.81625 18.7984 1.65089 18.9089 1.51161 19.0482C1.37232 19.1874 1.26183 19.3528 1.18645 19.5348C1.11106 19.7168 1.07227 19.9118 1.07227 20.1088Z"/>`,
    task_list: b `<path d="M13.8295 22.8527C13.9478 23.0178 14.1037 23.1523 14.2843 23.245C14.4649 23.3378 14.665 23.3862 14.8681 23.3862C15.0712 23.3862 15.2713 23.3378 15.4519 23.245C15.6326 23.1523 15.7885 23.0178 15.9067 22.8527L24.3683 11.1206C24.521 10.9076 24.3683 10.6103 24.1072 10.6103H22.2228C21.813 10.6103 21.4232 10.8072 21.1822 11.1447L14.8701 19.9036L12.0094 15.9339C11.7683 15.6005 11.3826 15.3996 10.9688 15.3996H9.0844C8.82324 15.3996 8.67056 15.6969 8.82324 15.9098L13.8295 22.8527Z"/><path d="M31.7863 0.924805H2.2149C1.50374 0.924805 0.929184 1.49936 0.929184 2.21052V31.7819C0.929184 32.4931 1.50374 33.0677 2.2149 33.0677H31.7863C32.4975 33.0677 33.072 32.4931 33.072 31.7819V2.21052C33.072 1.49936 32.4975 0.924805 31.7863 0.924805ZM30.1792 30.1748H3.82204V3.81766H30.1792V30.1748Z"/>`,
    colour: b `<path d="M28.2221 27.3293C29.9779 27.3293 31.4122 25.8748 31.4122 24.0949C31.4122 21.9454 28.2221 18.4378 28.2221 18.4378C28.2221 18.4378 25.0319 21.9454 25.0319 24.0949C25.0319 25.8748 26.4663 27.3293 28.2221 27.3293ZM13.0707 25.5574C13.356 25.8427 13.818 25.8427 14.0993 25.5574L24.389 15.2717C24.6743 14.9864 24.6743 14.5244 24.389 14.2431L14.1033 3.95741C14.0792 3.9333 14.0511 3.9092 14.023 3.88911L10.881 0.747142C10.8125 0.679519 10.7201 0.641602 10.6238 0.641602C10.5276 0.641602 10.4352 0.679519 10.3667 0.747142L8.43813 2.67571C8.37051 2.74422 8.33259 2.8366 8.33259 2.93286C8.33259 3.02911 8.37051 3.1215 8.43813 3.19L11.1381 5.89L2.78902 14.2431C2.50375 14.5284 2.50375 14.9904 2.78902 15.2717L13.0707 25.5574ZM13.589 7.5333L20.777 14.7213H6.40509L13.589 7.5333ZM33.7506 30.2101H2.25063C2.07384 30.2101 1.9292 30.3547 1.9292 30.5315V33.7458C1.9292 33.9226 2.07384 34.0672 2.25063 34.0672H33.7506C33.9274 34.0672 34.0721 33.9226 34.0721 33.7458V30.5315C34.0721 30.3547 33.9274 30.2101 33.7506 30.2101Z"/>`,
    sync: b `<path d="M18.43 4.25C18.2319 4.25259 18.0426 4.33244 17.9025 4.47253C17.7625 4.61263 17.6826 4.80189 17.68 5V7.43L16.84 6.59C15.971 5.71363 14.8924 5.07396 13.7067 4.73172C12.5209 4.38948 11.2673 4.35604 10.065 4.63458C8.86267 4.91312 7.7515 5.49439 6.83703 6.32318C5.92255 7.15198 5.23512 8.20078 4.84001 9.37C4.79887 9.46531 4.77824 9.56821 4.77947 9.67202C4.7807 9.77583 4.80375 9.87821 4.84714 9.97252C4.89052 10.0668 4.95326 10.151 5.03129 10.2194C5.10931 10.2879 5.20087 10.3392 5.30001 10.37C5.38273 10.3844 5.4673 10.3844 5.55001 10.37C5.70646 10.3684 5.85861 10.3186 5.98568 10.2273C6.11275 10.136 6.20856 10.0078 6.26001 9.86C6.53938 9.0301 7.00847 8.27681 7.63001 7.66C8.70957 6.58464 10.1713 5.98085 11.695 5.98085C13.2188 5.98085 14.6805 6.58464 15.76 7.66L16.6 8.5H14.19C13.9911 8.5 13.8003 8.57902 13.6597 8.71967C13.519 8.86032 13.44 9.05109 13.44 9.25C13.44 9.44891 13.519 9.63968 13.6597 9.78033C13.8003 9.92098 13.9911 10 14.19 10H18.43C18.5289 10.0013 18.627 9.98286 18.7186 9.94565C18.8102 9.90844 18.8934 9.85324 18.9633 9.78333C19.0333 9.71341 19.0885 9.6302 19.1257 9.5386C19.1629 9.44699 19.1814 9.34886 19.18 9.25V5C19.18 4.80109 19.101 4.61032 18.9603 4.46967C18.8197 4.32902 18.6289 4.25 18.43 4.25Z"/><path d="M18.68 13.68C18.5837 13.6422 18.4808 13.6244 18.3774 13.6277C18.274 13.6311 18.1724 13.6555 18.0787 13.6995C17.9851 13.7435 17.9015 13.8062 17.8329 13.8836C17.7643 13.9611 17.7123 14.0517 17.68 14.15C17.4006 14.9799 16.9316 15.7332 16.31 16.35C15.2305 17.4254 13.7688 18.0291 12.245 18.0291C10.7213 18.0291 9.25957 17.4254 8.18001 16.35L7.34001 15.51H9.81002C10.0089 15.51 10.1997 15.431 10.3403 15.2903C10.481 15.1497 10.56 14.9589 10.56 14.76C10.56 14.5611 10.481 14.3703 10.3403 14.2297C10.1997 14.089 10.0089 14.01 9.81002 14.01H5.57001C5.47115 14.0086 5.37302 14.0271 5.28142 14.0643C5.18982 14.1016 5.1066 14.1568 5.03669 14.2267C4.96677 14.2966 4.91158 14.3798 4.87436 14.4714C4.83715 14.563 4.81867 14.6611 4.82001 14.76V19C4.82001 19.1989 4.89903 19.3897 5.03968 19.5303C5.18034 19.671 5.3711 19.75 5.57001 19.75C5.76893 19.75 5.95969 19.671 6.10034 19.5303C6.241 19.3897 6.32001 19.1989 6.32001 19V16.57L7.16001 17.41C8.02901 18.2864 9.10761 18.926 10.2934 19.2683C11.4791 19.6105 12.7327 19.6439 13.935 19.3654C15.1374 19.0869 16.2485 18.5056 17.163 17.6768C18.0775 16.848 18.7649 15.7992 19.16 14.63C19.1926 14.5362 19.2061 14.4368 19.1995 14.3377C19.1929 14.2386 19.1664 14.1418 19.1216 14.0532C19.0768 13.9645 19.0146 13.8858 18.9387 13.8217C18.8629 13.7576 18.7749 13.7094 18.68 13.68Z"/>`,
};
/**
 * Viewbox must be set based on the original icon aspect ratio
 */
const icons = {
    strong: x `<svg width="16" height="16" viewBox="0 0 24 25">${paths.strong}</svg>`,
    em: x `<svg width="16" height="16" viewBox="0 0 24 25">${paths.em}</svg>`,
    underline: x `<svg width="16" height="16" viewBox="0 0 24 25">${paths.underline}</svg>`,
    heading: x `<svg width="16" height="16" viewBox="0 0 24 25">${paths.title}</svg>`,
    ordered_list: x `<svg width="16" height="16" viewBox="0 0 24 25">${paths.ordered_list}</svg>`,
    bullet_list: x `<svg width="16" height="16" viewBox="0 0 24 25">${paths.bullet_list}</svg>`,
    task_list: x `<svg width="16" height="16" viewBox="0 0 34 34">${paths.task_list}</svg>`,
    colour: x `<svg width="16" height="16" viewBox="0 0 36 36">${paths.colour}</svg>`,
    sync: x `<svg width="16" height="16" viewBox="0 0 24 24">${paths.sync}</svg>`,
};
const prosestyle$1 = i$3 `.ProseMirror{outline:0;position:relative;padding:8px;height:100%;overflow:auto;word-wrap:break-word;white-space:pre-wrap;white-space:break-spaces;-webkit-font-variant-ligatures:none;font-variant-ligatures:none;font-feature-settings:"liga" 0}.ProseMirror pre{white-space:pre-wrap}.ProseMirror li{position:relative}.ProseMirror-hideselection ::selection{background:0 0}.ProseMirror-hideselection ::-moz-selection{background:0 0}.ProseMirror-hideselection{caret-color:transparent}.ProseMirror-selectednode{outline:2px solid #8cf}li.ProseMirror-selectednode{outline:0}li.ProseMirror-selectednode:after{content:"";position:absolute;left:-32px;right:-2px;top:-2px;bottom:-2px;border:2px solid #8cf;pointer-events:none}img.ProseMirror-separator{display:inline!important;border:none!important;margin:0!important}.ProseMirror ul{list-style-type:disc}.ProseMirror ol{list-style-type:decimal}.ProseMirror ol,.ProseMirror ul{margin-bottom:8px;padding-left:30px}.ProseMirror h1{font-size:32px}.ProseMirror h2{font-size:28px}.ProseMirror h3{font-size:24px}`;
/**
 * Mutually exclusive tooltip menu states
 */
var MenuState;
(function (MenuState) {
    MenuState[MenuState["nomenu"] = 0] = "nomenu";
    MenuState[MenuState["tooltip"] = 1] = "tooltip";
    MenuState[MenuState["heading"] = 2] = "heading";
    MenuState[MenuState["color"] = 3] = "color";
})(MenuState || (MenuState = {}));
class MenuController {
    constructor(host) {
        this._state = MenuState.nomenu;
        (this.host = host).addController(this);
    }
    hostConnected() {
        // having this function is mandatory for a Lit Controller even if not doing anything
    }
    get state() {
        return this._state;
    }
    /**
     * Setting the state will automatically request an update,
     * making this controller actually reactive
     */
    set state(s) {
        this._state = s;
        this.host.requestUpdate();
    }
    openMenu() {
        // Do nothing if menu is already open,
        // in order to preserve submenus
        if (this.menuVisible)
            return;
        this.state = MenuState.tooltip;
    }
    closeMenu() {
        this.state = MenuState.nomenu;
    }
    resetMenu() {
        this.state = MenuState.tooltip;
    }
    hasSubMenu(sm) {
        return this.state === sm;
    }
    _toggleSubMenu(sm) {
        if (this.hasSubMenu(sm)) {
            this.state = MenuState.tooltip;
        }
        else {
            this.state = sm;
        }
    }
    toggleColourMenu() {
        this._toggleSubMenu(MenuState.color);
    }
    toggleHeadingMenu() {
        this._toggleSubMenu(MenuState.heading);
    }
    /**
     * True if the main menu or any of the submenues is open
     */
    get menuVisible() {
        return this.state !== MenuState.nomenu;
    }
    get colorVisible() {
        return this.state === MenuState.color;
    }
    get headingVisible() {
        return this.state === MenuState.heading;
    }
}
class Editor extends TWElement {
    constructor() {
        super();
        this.focusStatus = new FocusStatus(this);
        this.mouseStatus = new MouseStatus(this);
        this.menu = new MenuController(this);
        this.needSync = false;
        this.firstUpdated = () => {
            this.loadEditorContent();
        };
        this.handleBlur = () => {
            this.needSync = true;
            this.doSave();
        };
        /**
         * Saving is debounced, it is safe to call this function rapidly
         */
        this.doSave = debounce(() => {
            this.saveDistant();
            this.needSync = false;
        }, 3000);
        /**
         * Initialize the view with actual content
         * if it fails, view will stay non-editable
         */
        this.loadEditorContent = async () => {
            const state = await this.readDistant();
            if (!state) {
                // we keep the initial dummy view, that is not editable
                return;
            }
            this.initEditor(state);
            // there is no rerender before this step =>
            // it's important that "this.view" stays the same object as the one from constructor
            // otherwise the blur event will be tied to an element that will disappear on ntext render
            const editorContent = this.renderRoot.querySelector(".ProseMirror");
            if (!editorContent)
                throw new Error("ProseMirror element not found, can't add event listeners");
            editorContent.addEventListener("blur", this.handleBlur);
        };
        this.initDummyEditor();
        this.dragging = new DragDropController(this);
        // keep the focus/blur logic top-level
        // using prosemirror handleDOMEvent will fire too many dragenter/dragleave events
        // TODO(rdo) migrate to `render` view instead
        this.addEventListener("dragenter", (evt) => {
            if (
            // anything acceptable by the text editor should trigger focus
            acceptPillDrop(evt) ||
                evt.dataTransfer?.types.includes("text/plain") ||
                evt.dataTransfer?.types.includes("text/html")) {
                this.view.focus();
            }
        });
        this.addEventListener("dragleave", (event) => {
            this.view.dom?.blur();
        });
    }
    /**
     * Initialize with a dummy state and non-editable view,
     * in order to have prose-mirror view in the DOM
     */
    initDummyEditor() {
        this.edstate = EditorState.create({ schema });
        this.view = new EditorView(null, {
            state: this.edstate,
            // do not extend me
        });
        this.view.editable = false;
    }
    /**
     * Actual initialization of the editor
     */
    initEditor(state) {
        this.edstate = state;
        this.view.update({
            state,
            /**
             * We use a custom dispatchTransaction so we can keep track in our component
             */
            dispatchTransaction: (tr) => {
                this.edstate = this.edstate.apply(tr);
                // important otherwise the view will be stale after a dispatch
                this.view.updateState(this.edstate);
                // save notebook in the background
                this.needSync = true;
                this.doSave();
            },
            nodeViews,
            handleDOMEvents: {
                ...handleDragEvents(this.dragging, this),
            },
        });
        this.view.editable = true;
    }
    manageMenuVisibility() {
        const hasHighlight = this.mouseStatus.isup &&
            // NOTE: editor state might sometimes be slightly inconsistent with shown highlighted text
            // but it should be considered the source of truth for text selection
            !this.edstate.selection.empty &&
            this.focusStatus.hasfocus;
        if (hasHighlight &&
            // Do not open tooltip menu when clicking a datapill (pivot, cell...)
            !isPillSelection(this.edstate)) {
            this.menu.openMenu();
        }
        else {
            this.menu.closeMenu();
        }
    }
    willUpdate() {
        this.manageMenuVisibility();
    }
    /**
     * NOTE: we support array commands as a convenience to reuse prosemirror built-ins,
     * however when multiple commands are needed to achieve an action,
     * we are supposed to refactor them into a single command (therefore using a single transaction)
     * by copy-pasting prosemirror internal code
     * This defeats the purpose of using a library, so it might be more relevant to contribute to ProseMirror
     * rather than copy-pasting most of its code here
     * @see  https://discuss.prosemirror.net/t/refactor-commands-into-transform-helpers/479/14
     */
    doCommand(cmd) {
        if (Array.isArray(cmd)) {
            for (const c of cmd) {
                c(this.edstate, this.view.dispatch);
            }
        }
        else {
            cmd(this.edstate, this.view.dispatch);
        }
    }
    markInSelection(mt) {
        return markInSelection(this.edstate, mt);
    }
    renderTooltipMenu() {
        let tooltip = A;
        const buttons = [];
        const btn_class = "h-8 w-8 flex items-center justify-center aria-selected:fill-sky-300 dark:fill-neutral-200 dark:aria-selected:fill-sky-600 first:rounded-l";
        // bold/italic/underline
        for (const mt of [
            schema.marks.strong,
            schema.marks.em,
            schema.marks.underline,
        ]) {
            buttons.push(x `<button class="${btn_class}" aria-label="${`Make text ${mt.name}`}" aria-selected="${this.markInSelection(mt)}" @click="${(ev) => {
                ev.stopImmediatePropagation();
                this.menu.resetMenu();
                this.doCommand(toggleMark(mt));
                // giving focus back will preserve the selection,
                // otherwise it ends up in a weird state when multiple nodes are selected
                this.view.focus();
            }}">${icons[mt.name]}</button>`);
        }
        // colour
        buttons.push(x `<button aria-label="Change text color" class="${btn_class}" @click="${() => this.menu.toggleColourMenu()}">${icons["colour"]}</button>`);
        // titles
        buttons.push(x `<button class="${btn_class}" @click="${() => this.menu.toggleHeadingMenu()}">${icons["heading"]}</button>`);
        // list levels
        if (canToggleList(this.edstate.selection)) {
            // specify list item types for lists that do not use the default "list_item"
            const listItems = {
                task_list: schema.nodes.task_list_item,
            };
            for (const ln of listNodes) {
                buttons.push(x `<button class="${btn_class}" aria-selected="${nodeInSelection(this.edstate, ln)}" aria-label="${ln.name}" @click="${() => {
                    this.menu.resetMenu();
                    this.doCommand(toggleListCmd(ln, listItems[ln.name]));
                    // giving focus back will preserve the selection highlight,
                    // otherwise it ends up in a weird state when multiple nodes are selected
                    this.view.focus();
                }}">${icons[ln.name]}</button>`);
            }
        }
        function renderColorIcon(col, name) {
            return x `<span><span class="px-0.5 text-center mr-1 border border-zinc-300 dark:border-neutral-400 rounded-sm ${col}">A</span> ${name}</span>`;
        }
        const color_buttons = [
            [schema.marks.colour_red, colorClasses["red"], "Red"],
            [schema.marks.colour_yellow, colorClasses["yellow"], "Yellow"],
            [schema.marks.colour_green, colorClasses["green"], "Green"],
        ].map(([mark, col, name]) => x `<li class="mb-1"><button class="px-2 py-0.5 h-full rounded-t" aria-selected="${this.markInSelection(mark)}" @click="${() => {
            this.doCommand(toggleColourCmd(mark));
            // after toggling a mark, DOM selection may be in a weird state
            // we remove the DOM selection so we can fix that and see the color
            // For unknown reason, this works on Chrome despite getSelection() not piercing the DOM
            document.getSelection()?.removeAllRanges();
        }}">${renderColorIcon(col, name)}</button></li>`);
        color_buttons.push(x `<li class="mb-1"><button class="px-2 py-0.5 h-full rounded-t" aria-selected="${!hasColour(this.edstate)}" @click="${() => {
            this.doCommand(removeColoursCmd());
            // after toggling a mark, DOM selection may be in a weird state
            // we remove the DOM selection so we can fix that and see the color
            // For unknown reason, this works on Chrome despite getSelection() not piercing the DOM
            document.getSelection()?.removeAllRanges();
        }}">${renderColorIcon("text-zinc-800 dark:text-neutral-200", "Default")}</button></li>`);
        const titles = [
            [1, "Heading 1"],
            [2, "Heading 2"],
            [3, "Heading 3"],
            [0, "Text"],
        ].map(([level, name]) => x `<li class="mb-1"><button class="px-2 py-0.5 w-full rounded-t text-left" aria-selected="${headingInSelection(this.edstate, level)}" @click="${() => {
            this.doCommand(makeHeadlineCmd(level));
        }}">${name}</button></li>`);
        // mounting the tooltip but making it invisible with CSS
        // allows to compute the right dimension on first render
        // and thus to position it cleanly when it appears
        tooltip = x `<wt-editor-tooltip .view="${this.view}" .edstate="${this.edstate}" .visible="${this.menu.menuVisible}">${buttons}<ul class="${o$7({
            "tooltip-submenu": true,
            "list-none pl-0 mb-0 absolute top-full left-24 z-20 translate-y-2.5 bg-zinc-100 dark:bg-neutral-700 border-zinc-300 dark:border-neutral-400 rounded-sm": true,
            invisible: !this.menu.colorVisible,
        })}">${color_buttons}</ul><ul class="${o$7({
            "list-none pl-0 mb-0 absolute top-full left-24 z-20 translate-y-2.5 bg-zinc-100 dark:bg-neutral-700 border-zinc-300 dark:border-neutral-400 rounded-sm": true,
            invisible: !this.menu.headingVisible,
        })}">${titles}</ul></wt-editor-tooltip>`;
        return tooltip;
    }
    render() {
        this.view.updateState(this.edstate);
        // TODO: set to CSS directly when removing the flag
        // (we cannot inject values in top-level Lit css tag)
        this.view.dom.style.caretColor = "transparent";
        const showSmartCursor = !this.dragging.isDragging() && this.focusStatus.hasfocus;
        // The slot is needed to correctly display the dropCursor
        return x `${this.renderTooltipMenu()} ${n$3(this.needSync, () => x `<div class="float-right fill-zinc-800 dark:fill-neutral-200 mr-8">${icons.sync}</div>`)} ${this.view.dom} ${n$3(showSmartCursor, () => x `<wt-editor-smart-cursor .edstate="${this.edstate}" .view="${this.view}"></wt-editor-smart-cursor>`)}<slot></slot>`;
    }
}
Editor.properties = {
    notebook: { type: String },
    // Tracking the editor state tells Lit to render after a ProseMirror transaction
    edstate: { state: true },
    needSync: { state: true },
};
Editor.styles = [prosestyle$1, i$3 ``];
class PlaybookEditor extends Editor {
    async saveDistant() {
        await fetch(`/api/notebook/editor?action=save&notebook=${this.notebook}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.edstate.doc.toJSON()),
        });
    }
    async readDistant() {
        const commonOpts = { plugins };
        const response = await fetch(`/api/notebook/editor?action=read&notebook=${this.notebook}`);
        if (!response.ok) {
            console.warn("Warning: we couldn't load the text editor content from server, an unexpected error has occurred. Please try to refresh the page.");
            return null;
        }
        else if (response.status === 204) {
            // no content, initialize with schema
            return EditorState.create({ ...commonOpts, schema: schema });
        }
        else {
            // previously saved content, initialize with previous state
            try {
                let content = await response.json();
                // TODO: if the document nodes cannot be parsed, display just as text? even if corrupted it's better than nothing?
                let doc = schema.nodeFromJSON(content);
                return EditorState.create({ ...commonOpts, doc });
            }
            catch (err) {
                console.warn("Warning: we found saved text editor content but it is not in a valid format. We will remove this content. Error:", err);
                // /!\ this will delete existing data
                return EditorState.create({ ...commonOpts, schema: schema });
            }
        }
    }
}
/**
 * EditorInput embeds a ProseMirror as a control to an HTML form.
 * It takes part into the standard flow of submission.
 */
class EditorInput extends Editor {
    constructor() {
        super();
        this.internals = this.attachInternals();
    }
    get form() {
        return this.internals.form;
    }
    get type() {
        return this.localName;
    }
    get validity() {
        return this.internals.validity;
    }
    get validationMessage() {
        return this.internals.validationMessage;
    }
    get willValidate() {
        return this.internals.willValidate;
    }
    checkValidity() {
        return this.internals.checkValidity();
    }
    reportValidity() {
        return this.internals.reportValidity();
    }
    async saveDistant() {
        this.internals.setValidity({});
        this.internals.setFormValue(JSON.stringify(this.edstate.doc.toJSON()));
        this.dispatchEvent(new Event("change", { bubbles: true }));
    }
    async readDistant() {
        const commonOpts = { plugins };
        const content = JSON.parse(this._slottedChildren().at(0)?.textContent?.trim() || "null");
        if (!content) {
            // no content, initialize with schema
            return EditorState.create({ ...commonOpts, schema: schema });
        }
        else {
            try {
                // TODO: if the document nodes cannot be parsed, display just as text? even if corrupted it's better than nothing?
                let doc = schema.nodeFromJSON(content);
                return EditorState.create({ ...commonOpts, doc });
            }
            catch (err) {
                console.warn("Warning: we found saved text editor content but it is not in a valid format. We will remove this content. Error:", err);
                // /!\ this will delete existing data
                return EditorState.create({ ...commonOpts, schema: schema });
            }
        }
    }
}
EditorInput.properties = {
    ...Editor.properties,
    src: { type: String },
    framework: { type: String },
    name: { type: String },
};
EditorInput.formAssociated = true;
customElements.define("wt-editor", PlaybookEditor);
customElements.define("wt-input-editor", EditorInput);

class InlineForm extends TWElement {
    constructor() {
        super(...arguments);
        this.expanded = false;
        this.formSlot = e();
    }
    async submit(ev) {
        const fd = new FormData();
        for (let i of inputs(this.formSlot.value.assignedElements())) {
            if (i.reportValidity()) {
                fd.append(i.name, i.value);
            }
            else {
                return;
            }
        }
        ev.preventDefault();
        const rsp = await fetch(this.action, {
            method: "POST",
            body: fd,
        });
        if (rsp.status === 200) {
            // TODO(rdo) all good actually, show pop-up
            window.location.replace(rsp.headers.get("Location"));
        }
        else if (rsp.status === 400) ;
        else {
            console.warn("unknown response status (API error):", rsp.statusText);
        }
    }
    render() {
        if (!this.expanded) {
            return x `<button class="py-3 px-4 flex items-center bg-yellow-400 text-neutral-900 rounded text-sm font-medium" @click="${() => {
                this.expanded = !this.expanded;
            }}">${this.value}</button>`;
        }
        return x `<form class="flex items-center text-sm font-medium" method="post" @submit="${this.submit.bind(this)}"><slot ${n$1(this.formSlot)}>No expanded content</slot><div class="ml-4 flex gap-2"><input type="submit" class="py-3 px-4 flex items-center bg-yellow-400 text-neutral-900 rounded text-sm font-medium cursor-pointer" value="${this.value}"/> <button class="py-3 px-4 flex items-center bg-neutral-200 dark:bg-neutral-700 rounded text-sm font-medium" @click="${() => {
            this.expanded = !this.expanded;
        }}">Cancel</button></div></form>`;
    }
}
InlineForm.properties = {
    value: { type: String },
    action: { type: String },
    expanded: { type: Boolean, state: true },
};
customElements.define("wt-inlineform", InlineForm);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const u=(e,s,t)=>{const r=new Map;for(let l=s;l<=t;l++)r.set(e[l],l);return r},c$1=e$4(class extends i$4{constructor(e){if(super(e),e.type!==t$1.CHILD)throw Error("repeat() can only be used in text expressions")}ct(e,s,t){let r;void 0===t?t=s:void 0!==s&&(r=s);const l=[],o=[];let i=0;for(const s of e)l[i]=r?r(s,i):i,o[i]=t(s,i),i++;return {values:o,keys:l}}render(e,s,t){return this.ct(e,s,t).values}update(s,[t,r,c]){var d;const a$1=m$1(s),{values:p$1,keys:v}=this.ct(t,r,c);if(!Array.isArray(a$1))return this.ut=v,p$1;const h=null!==(d=this.ut)&&void 0!==d?d:this.ut=[],m=[];let y,x,j=0,k=a$1.length-1,w=0,A=p$1.length-1;for(;j<=k&&w<=A;)if(null===a$1[j])j++;else if(null===a$1[k])k--;else if(h[j]===v[w])m[w]=f(a$1[j],p$1[w]),j++,w++;else if(h[k]===v[A])m[A]=f(a$1[k],p$1[A]),k--,A--;else if(h[j]===v[A])m[A]=f(a$1[j],p$1[A]),c$3(s,m[A+1],a$1[j]),j++,A--;else if(h[k]===v[w])m[w]=f(a$1[k],p$1[w]),c$3(s,a$1[j],a$1[k]),k--,w++;else if(void 0===y&&(y=u(v,w,A),x=u(h,j,k)),y.has(h[j]))if(y.has(h[k])){const e=x.get(v[w]),t=void 0!==e?a$1[e]:null;if(null===t){const e=c$3(s,a$1[j]);f(e,p$1[w]),m[w]=e;}else m[w]=f(t,p$1[w]),c$3(s,a$1[j],t),a$1[e]=null;w++;}else p(a$1[k]),k--;else p(a$1[j]),j++;for(;w<=A;){const e=c$3(s,m[A+1]);f(e,p$1[w]),m[w++]=e;}for(;j<=k;){const e=a$1[j++];null!==e&&p(e);}return this.ut=v,a(s,m),T}});

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
class s{constructor(t){this.G=t;}disconnect(){this.G=void 0;}reconnect(t){this.G=t;}deref(){return this.G}}class i{constructor(){this.Y=void 0,this.Z=void 0;}get(){return this.Y}pause(){var t;null!==(t=this.Y)&&void 0!==t||(this.Y=new Promise((t=>this.Z=t)));}resume(){var t;null===(t=this.Z)||void 0===t||t.call(this),this.Y=this.Z=void 0;}}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const n=t=>!i$2(t)&&"function"==typeof t.then,h=1073741823;class c extends c$2{constructor(){super(...arguments),this._$C_t=h,this._$Cwt=[],this._$Cq=new s(this),this._$CK=new i;}render(...s){var i;return null!==(i=s.find((t=>!n(t))))&&void 0!==i?i:T}update(s,i){const r=this._$Cwt;let e=r.length;this._$Cwt=i;const o=this._$Cq,c=this._$CK;this.isConnected||this.disconnected();for(let t=0;t<i.length&&!(t>this._$C_t);t++){const s=i[t];if(!n(s))return this._$C_t=t,s;t<e&&s===r[t]||(this._$C_t=h,e=0,Promise.resolve(s).then((async t=>{for(;c.get();)await c.get();const i=o.deref();if(void 0!==i){const r=i._$Cwt.indexOf(s);r>-1&&r<i._$C_t&&(i._$C_t=r,i.setValue(t));}})));}return T}disconnected(){this._$Cq.disconnect(),this._$CK.pause();}reconnected(){this._$Cq.reconnect(this),this._$CK.resume();}}const m=e$4(c);

/**
 * UI component to display a pivot pill
 *
 * At the time of writing (r1562) this component is not used in the Go-WASM code
 * which has its own way of computing pivot values, handling drag event and displaying them
 * This component is used outside of the datacell: text editor, left menu
 */
class PivotPill extends TWElement {
    constructor() {
        super();
    }
    render() {
        if (this.loading) {
            return x `<div class="${`inline-block mx-1 py-1 border-2 dark:border border-zinc-300 text-xs rounded cursor-pointer px-1 ${this.cls || ""}`}" title="${`Pivot id: ${this.pivotid}`}" draggable="false">Loading pivot...</div>`;
        }
        const { pivot } = this;
        const on = ("on" in pivot && pivot.on?.length > 0 && pivot.on[0]) || "";
        const prettyOn = on.startsWith("$.") ? on.slice(2) : on;
        const leftOp = on
            ? x `<div class="p-1 self-stretch bg-zinc-200 dark:bg-neutral-700 dark:border-r smallcaps">${prettyOn}</div>`
            : A;
        return x `<div class="${`inline-block border-2 dark:border border-zinc-300 text-xs rounded-sm cursor-pointer ${this.cls || ""}`}" draggable="true" data-value="${pivot.value}" data-on="${"on" in pivot && pivot.on}" @dragstart="${(e) => {
            setPivotDragData(e, JSON.stringify(this.pivot));
            setPivotDragImage(e, this.pivot);
        }}" @dragend="${removePivotDragImage}"><div class="flex items-center">${leftOp}<div class="px-1 truncate">${pivot.name || pivot.value}</div></div></div>`;
    }
}
PivotPill.properties = {
    pivot: { type: Object },
    loading: { type: Boolean },
    pivotid: { type: String },
    cls: { type: String },
};
customElements.define("wt-pivot-pill", PivotPill);

async function saveNotebook(updatedNotebook) {
    const rsp = await fetch("/api/notebook?action=save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNotebook),
    });
    if (rsp.status !== 200) {
        notify(updatedNotebook.ID, "the notebook could not be saved, retrying usually helps", true);
    }
}
function isDrop(ev) {
    return ev.type === "drop";
}
class NotebookBody extends TWElement {
    constructor() {
        super();
        // other state
        this.panel = "none";
        /** Native JS Map are bad for reactivity (not immutable) hence the object */
        this.pivots = {};
        /** track which cell menu is opened, using the cell ID */
        this.openedCellMenu = "";
        // opens/closes the snapshot submenu
        this.snapshotMenu = false;
        this.snapshots = [];
        this.adjustCellFlag = false;
        this.cellRefs = new Map();
    }
    firstUpdated() {
        this.fetchNotebook();
        /**
         * Notebook will rerender on manifest changes triggered by cells
         */
        this.shadowRoot?.addEventListener(manifestChangeEvt, (ev) => {
            const manifest = JSON.parse(ev.detail);
            // TODO: this leads to cascading requests (manifest, then pivots)
            // we could try populating the manifest in the backend
            if (manifest.Pivots !== null) {
                for (const pivot of manifest.Pivots) {
                    this.loadPivot(pivot);
                }
            }
            // be careful to create a new object to trigger re-render
            this.notebook = {
                ...this.notebook,
                Cells: this.notebook.Cells.map((cell) => {
                    if (cell.ID !== manifest.ID) {
                        return cell;
                    }
                    cell = { ...manifest };
                    return cell;
                }),
            };
        });
    }
    closePanels() {
        this.panel = "none";
    }
    openSearchPanel() {
        this.panel = "search";
    }
    openDataSourcePanel() {
        this.panel = "sources";
    }
    async loadPivot(p) {
        const pivot = await fetchPivot(p.Pivot);
        if (!pivot)
            return;
        this.pivots = { ...this.pivots, [pivot.pivotid]: { ...pivot, ...p } };
    }
    async cellDataFromDrop(ev) {
        if (hasCellData(ev)) {
            // duplicating a cell
            const cell = getCellDragData(ev);
            if (!cell?.DataSource)
                return null;
            return {
                dataSource: cell?.DataSource,
                title: cell?.Title || "cell",
            };
        }
        else if (hasDatasourceData(ev)) {
            // creating a new cell from a datasource, can be a file
            const data = await getDatasourceDragData(ev, this.notebook.ID);
            if (!data) {
                // dropped something that is not a data source
                console.warn("Dropped something that is not a datasource definition on notebook-body");
                return null;
            }
            return data;
        }
        return null;
    }
    /**
     * Will create a new cell from a datasource
     * or duplicate and existing cell
     */
    async createCell(ev) {
        ev.preventDefault();
        let data;
        if (isDrop(ev)) {
            data = await this.cellDataFromDrop(ev);
        }
        else {
            data = ev.detail;
        }
        if (!data) {
            console.warn("got a cell creation event but no data");
            return;
        }
        this.notebook.Cells = [
            ...this.notebook.Cells,
            {
                Title: data.title,
                DataSource: data.dataSource,
                ID: null,
                Pivots: [],
                Notebook: this.notebook.ID,
                CheckCell: false,
                Snapshot: null,
                Position: {
                    Col: 3,
                    Height: 0,
                    Row: this.notebook.Cells.length + 1,
                },
            },
        ];
        await this.saveNotebook();
    }
    async removeCell(cell) {
        if (!cell)
            return;
        if (!confirm("Are you sure you want to delete this cell?"))
            return;
        this.notebook.Cells = this.notebook.Cells.filter((c) => c.ID !== cell);
        await this.saveNotebook();
    }
    async adjustCell(ev, cell, action) {
        if (!cell)
            return;
        this.openedCellMenu = "";
        switch (action) {
            case "up":
                this.moveCell(cell, -1);
                break;
            case "down":
                this.moveCell(cell, 1);
                break;
            case "width":
                this.adjustWidth(cell, ev);
                break;
            case "height":
                this.adjustHeight(cell, ev);
                break;
        }
        await this.saveNotebook();
    }
    moveCell(cell, direction) {
        const cells = this.notebook.Cells;
        const index = cells.indexOf(cell);
        if (!cell.Position.Row ||
            cell.Position.Row === 0 ||
            cells.filter((c) => c.Row === 0).length == cells.length) {
            this.adjustRowForCells(cells, 0, 1);
        }
        if (this.isValidRange(index, direction, cells.length)) {
            // neighbor where their row is the same as the cell's row + direction
            const neighbors = cells.filter((c) => c.Position.Row === cell.Position.Row + direction);
            if (neighbors.length === 0) {
                if ((cell.Position.Row === 1 && direction === -1) ||
                    (cell.Position.Row === cells.length &&
                        direction === 1 &&
                        cell.Position.Col !== 3)) {
                    cell.Position.Col = 3;
                    cell.Position.Row = 1;
                    this.adjustRowForCells(cells, index + 1, direction);
                }
                cells.sort((a, b) => a.Position.Row - b.Position.Row);
                return;
            }
            // size of cells in the same row
            const ncol = neighbors.reduce((acc, c) => acc + c.Position.Col, 0);
            if (ncol > 0 && ncol < 3) {
                cell.Position.Col = 3 - ncol;
                cell.Position.Row += direction;
                this.adjustRowForCells(cells, index + 1, direction);
            }
            else {
                this.swapCells(cells, index, index + 1, direction);
            }
        }
        else {
            cell.Position.Col = 3;
            if (cell.Position.Row === 1 && direction === 1) {
                cell.Position.Row += direction;
                this.adjustRowForCells(cells, index + 1, direction);
            }
            else if (cell.Position.Row === 1 && direction === -1) {
                this.adjustRowForCells(cells, index + 1, 1);
            }
        }
        cells.sort((a, b) => a.Position.Row - b.Position.Row);
    }
    isValidRange(index, direction, cellCount) {
        return (index >= 0 && index + direction >= 0 && index + direction < cellCount);
    }
    swapCells(cells, index1, index2, direction) {
        if (index1 < 0 ||
            index1 >= cells.length ||
            index2 < 0 ||
            index2 >= cells.length) {
            console.error("Invalid indices provided for cell swapping.");
            return;
        }
        const temp = cells[index1];
        temp.Col = 3;
        cells[index1].Position.Row += direction;
        cells[index2].Position.Row -= direction;
        cells[index1] = cells[index2];
        cells[index2] = temp;
    }
    adjustRowForCells(cells, startIndex, direction) {
        for (let i = startIndex; i < cells.length; i++) {
            cells[i].Position.Row += direction;
        }
    }
    adjustWidth(cell, ev) {
        if (!cell.Position.Col || cell.Position.Col === 0)
            cell.Position.Col = 3;
        cell.Position.Col =
            ev.ctrlKey || ev.metaKey
                ? Math.min(3, cell.Position.Col + 1)
                : Math.max(1, cell.Position.Col - 1);
    }
    adjustHeight(cell, ev) {
        const ranges = [6, 20, 28, 36, 44, 56];
        if (!cell.Position.Height || cell.Position.Height === 0)
            cell.Position.Height = 44;
        const index = ranges.indexOf(cell.Position.Height);
        if (index >= 0) {
            if (ev.ctrlKey || ev.metaKey) {
                if (index < ranges.length - 1)
                    cell.Position.Height = ranges[index + 1];
            }
            else if (index > 0) {
                cell.Position.Height = ranges[index - 1];
            }
        }
    }
    // asynchronously save the metadata of the notebook
    // cells will be save separately, see main_js.go (cell.WireEngine(ngx))
    async saveNotebook() {
        this.notebook.Rev++;
        const updatedNotebook = {
            // don't forget to merge in existing fields
            ...this.notebook,
            Rev: this.notebook.Rev,
        };
        await saveNotebook(updatedNotebook);
        // refetch in the background
        // (UI state is already up to date, so we should have an optimistic UI)
        this.fetchNotebook();
    }
    toggleUrgent() {
        this.notebook = { ...this.notebook, Urgent: !this.notebook.Urgent };
        this.saveNotebook();
    }
    toggleResolved() {
        this.notebook = { ...this.notebook, Resolved: !this.notebook.Resolved };
        this.saveNotebook();
    }
    async fetchNotebook() {
        const nb = await fetchNotebook(this.notebookId);
        this.notebook = nb; // TODO: handle null notebook
        return;
    }
    async exportNotebook() {
        const status = this.validateNotebook();
        if (status != null) {
            notify(this.notebookId, status, true);
            return;
        }
        const rsp = await fetch(`/api/nbar?action=export&notebook=${this.notebookId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (rsp.status !== 200) {
            notify(this.notebookId, "the notebook could not be exported", true);
        }
        else {
            const blob = await rsp.blob();
            const url = window.URL.createObjectURL(blob);
            const filename = `${this.notebook.ID}.nbar`;
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        }
    }
    validateNotebook() {
        // check if notebook has a title
        if (!this.notebook.Title) {
            return "Notebook must have a title";
        }
        // check if notebook has at least one cell
        if (this.notebook.Cells.length === 0) {
            return "Notebook must have at least one cell";
        }
    }
    async fetchSnapshots(cell) {
        if (!cell)
            return;
        this.snapshots = [
            "Loading.."
        ];
        const rsp = await fetch(`/api/notebook/snapshot?action=list`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cell: cell,
            }),
        });
        if (rsp.status == 200) {
            const data = await rsp.json();
            this.snapshots = JSON.parse(data);
            if (this.snapshots.length == 0) {
                this.snapshots = [
                    "No snapshots found."
                ];
            }
        }
        else {
            notify(this.notebookId, "the snapshots could not be fetched", true);
        }
    }
    loadSnapshot(snapshot) { }
    async saveSnapshot(cell) {
        const rsp = await fetch(`/api/notebook/snapshot?action=save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cell: cell,
            }),
        });
        if (rsp.status == 200) {
            const data = await rsp.json();
            this.snapshots = [...this.snapshots, data.snapshot];
        }
        else {
            notify(this.notebookId, "the snapshot could not be saved", true);
        }
    }
    render() {
        if (!this.notebook)
            return; // waiting for state to be initialized
        document.title = this.notebook.Title;
        const adjustCellMenu = async (cell) => {
            const on = await hasFlag("adjust-cell");
            if (on) {
                return x `<div class="flex items-center justify-between pt-2 pb-1">Move <span class="flex items-center justify-between"><svg width="18" height="18" viewBox="0 0 40 40" class="dark:fill-white cursor-pointer mr-2" aria-label="move-up" @click="${(e) => {
                    this.adjustCell(e, cell, "up");
                }}">${icons$2.up}</svg> <svg width="18" height="18" viewBox="0 0 40 40" class="dark:fill-white cursor-pointer" aria-label="move-down" @click="${(e) => {
                    this.adjustCell(e, cell, "down");
                }}">${icons$2.down}</svg> <span></span></span></div><div class="flex items-center justify-between">Resize <span class="flex items-center justify-between"><svg width="18" height="18" viewBox="0 0 40 40" class="dark:fill-white cursor-pointer mr-2" aria-label="adjust-width" @click="${(e) => {
                    this.adjustCell(e, cell, "width");
                }}">${icons$2.width}</svg> <svg width="18" height="18" viewBox="0 0 40 40" class="dark:fill-white cursor-pointer" aria-label="adjust-height" @click="${(e) => {
                    this.adjustCell(e, cell, "height");
                }}">${icons$2.height}</svg></span></div><div class="border-b border-zinc-300 bg-white dark:bg-neutral-600 p-2 mb-1"></div>`;
            }
            else {
                return x ``;
            }
        };
        const snapshotAndEnforce = async (cell) => {
            const on = await hasFlag("snapshot-and-enforce");
            if (on) {
                return x `<div class="flex items-center justify-between cursor-pointer pb-1" @click="${async () => {
                    cell.CheckCell = !cell.CheckCell;
                    await this.saveNotebook();
                }}">${cell.CheckCell ? "Enforced" : "Enforce"} <span class="flex items-center justify-between"><svg width="20" height="20" viewBox="0 0 24 24" class="dark:fill-white mr-1">${icons$2.shield}</svg> ${cell.CheckCell
                    ? x `<svg width="22" height="22" viewBox="0 0 24 24" class="dark:fill-white mr-1">${icons$2.times}</svg>`
                    : x ``}</span></div><div><div class="flex items-center justify-between cursor-pointer pb-2" @click="${async () => {
                    this.snapshotMenu = !this.snapshotMenu;
                    await this.fetchSnapshots(cell);
                }}">${cell.Snapshot
                    ? x `Snapshot Taken: ${new Date(cell.Snapshot).toLocaleString()}`
                    : "Snapshot"}<div class="flex items-center"><svg width="20" height="20" viewBox="0 0 24 24" class="dark:fill-white mr-1 ml-2">${icons$2.lock}</svg> ${cell.Snapshot
                    ? x `<svg width="22" height="22" viewBox="0 0 24 24" class="dark:fill-white mr-1" @click="${async () => {
                        cell.Snapshot = null;
                        await this.saveNotebook();
                    }}">${icons$2.times}</svg>`
                    : x ``}</div></div>${this.snapshotMenu
                    ? x `<div class="absolute top-32 right-full w-48 bg-white border border-neutral-100 p-2 dark:bg-neutral-700 dark:border-neutral-500 -translate-y-full">${c$1(this.snapshots, (snapshot) => snapshot, (snapshot, _) => x `<div class="flex items-center justify-between cursor-pointer pt-1" @click="${async () => {
                        this.loadSnapshot(snapshot);
                    }}">Taken: ${snapshot}</div>`)} ${cell.Snapshot
                        ? x ``
                        : x `<hr class="mt-3"/><div class="pt-1 cursor-pointer" @click="${() => {
                            this.saveSnapshot(cell);
                        }}">New Snapshot</div>`}</div>`
                    : x ``}</div><hr/>`;
            }
            return "";
        };
        const cellMenu = (cell) => {
            return x `<div class="absolute z-10 bottom-1 right-14 border-b border-zinc-300 bg-white dark:bg-neutral-600 p-2 drop-shadow rounded flex flex-col min-w-[16rem] text-sm font-semibold text-zinc-600 dark:text-neutral-200">${m(adjustCellMenu(cell))} ${m(snapshotAndEnforce(cell))}<div class="flex items-center justify-between cursor-pointer text-sm font-semibold text-zinc-600 dark:text-neutral-200 pt-2" aria-label="delete-cell" @click="${() => {
                this.removeCell(cell.ID);
            }}">Delete <svg width="18" height="18" viewBox="0 0 24 24" class="dark:fill-white">${icons$2.delete}</svg></div></div>`;
        };
        const current_cells = c$1(this.notebook.Cells, (cell) => cell.ID, (cell, _) => {
            if (cell.ID) {
                const cellRef = e();
                this.cellRefs.set(cell.ID, cellRef);
                const cellWidth = this.adjustCellFlag
                    ? cell.Position.Col &&
                        cell.Position.Col > 0 &&
                        cell.Position.Col < 3
                        ? `w-${cell.Position.Col}/3 pr-2`
                        : "w-full"
                    : "";
                const cellHeight = this.adjustCellFlag
                    ? cell.Position.Height && cell.Position.Height > 0
                        ? `h-[${cell.Position.Height}rem]`
                        : "h-[44rem]"
                    : "";
                return x `<div class="${cellWidth}" aria-label="cell-wrapper"><div aria-label="cell-body-wrapper" class="${cellHeight} overflow-hidden mb-5 hover:shadow border border-zinc-200 dark:border-neutral-700 shadow-sm dark:shadow-none dark:hover:bg-neutral-800 dark:bg-transparent rounded relative shrink-0"><wt-data ${n$1(cellRef)} id="${cell.ID}" class="w-full" manifest="${JSON.stringify(cell)}"></wt-data><button @click="${() => {
                    if (this.openedCellMenu == cell.ID)
                        this.openedCellMenu = "";
                    else
                        this.openedCellMenu = cell.ID;
                }}" aria-label="cell-menu" class="absolute bottom-4 right-6 cursor-pointer z-10 rounded-sm text-xs p-1 border border-zinc-300 black dark:bg-neutral-600 dark:white"><svg width="18" height="18" viewBox="0 0 24 24" class="dark:fill-white">${icons$2.ellipsis}</svg></button> ${n$3(this.openedCellMenu == cell.ID, () => cellMenu(cell))}</div></div>`;
            }
        });
        const navigationArticles = [
            ["Explore", icons$2.datasource, this.openDataSourcePanel.bind(this)],
            ["Find", icons$2.search, this.openSearchPanel.bind(this)],
            ["Connect", icons$2.connectors, null],
            ["Help", icons$2.help, null],
        ].map(([name, icon, action]) => x `<article class="mt-1"><a href="#" class="vbox pl-2 text-xs" @click="${action}"><svg width="24" height="24" viewBox="0 0 24 24" class="mb-0.5 fill-zinc-400 stroke-zinc-400">${icon}</svg> <span class="text-sm font text-zinc-600 dark:text-neutral-200 pl-2">${name}</span></a></article>`);
        const overview = this.notebook.Cells.map((cell) => {
            return x `<!-- cell-overview --><article class="mb-2 flex flex-col"><button aria-label="Click to scroll" title="Click to scroll" @click="${() => {
                if (cell.ID) {
                    this.cellRefs
                        .get(cell.ID)
                        ?.value?.scrollIntoView({ behavior: "smooth" });
                }
            }}" draggable="${true}" @dragstart="${(e) => {
                setCellDragData(e, cell);
            }}"><h2 class="vbox italic text-zinc-600 dark:text-neutral-200 dark:font-semibold"><svg width="16" height="16" viewBox="0 0 24 24" class="fill-zinc-400 shrink-0">${icons$2.cell}</svg> <span class="truncate">${cell.Title}</span></h2><p>${cell.Datasource}</p></button><ul class="flex flex-col gap-1">${cell.Pivots?.map((p) => {
                if (p.Pivot in this.pivots) {
                    return x `<wt-pivot-pill cls="w-full" .pivot="${this.pivots[p.Pivot]}"></wt-pivot-pill>`;
                }
                else {
                    return x `<wt-pivot-pill cls="w-full" pivotid="${p.Pivot}" .loading="${true}"></wt-pivot-pill>`;
                }
            })}</ul></article>`;
        });
        let overlay = A;
        if (this.panel === "search") {
            overlay = x `<div class="center-float h-screen w-screen bg-zinc-500/60 z-10" @click="${this.closePanels.bind(this)}"></div><wt-search></wt-search>`;
        }
        else if (this.panel === "sources") {
            overlay = x `<div class="center-float h-screen w-screen bg-zinc-500/60 z-10" @click="${this.closePanels.bind(this)}"></div><wt-notebook-datasources @create-cell="${(ev) => {
                this.createCell(ev);
                this.closePanels();
            }}"></wt-notebook-datasources>`;
        }
        const title = x `<div class="mb-5 w-full flex items-center justify-between"><input type="text" class="w-4/5 text-2xl px-3 py-3 border-none bg-transparent text-neutral-900 dark:text-neutral-200 dark:border dark:border-neutral-700 dark:hover:bg-neutral-800" placeholder="Event - ${new Date(this.notebook.Created).toString()}" value="${this.notebook.Title}" @blur="${(e) => {
            this.notebook.Title = e.target?.value;
            this.saveNotebook();
        }}" aria-label="notebook-title"/><div><button type="button" class="py-3 px-4 bg-yellow-400 rounded text-neutral-900 text-sm font-medium mr-1" @click="${this.exportNotebook}">Export</button> <button type="button" class="py-3 px-4 bg-yellow-400 rounded text-neutral-900 text-sm font-medium" data-testid="share-button" onclick="navigator.clipboard.writeText(window.location.href)">Share</button></div></div>`;
        const topbar = x `<div class="mb-5 px-3 flex items-center text-sm dark:text-neutral-300"><p class="mr-6 flex items-center"><svg width="16" viewBox="0 0 24 24" class="mr-2 fill-none stroke-neutral-900 dark:stroke-neutral-100">${icons$2.user}</svg> ${this.owner}</p><p class="mr-6 flex items-center"><svg width="17" viewBox="0 0 17 18" class="mr-2 fill-neutral-900 stroke-neutral-900 dark:fill-neutral-100 dark:stroke-neutral-100">${icons$2.calendar}</svg> ${this.created}</p><button type="button" class="mr-6 flex items-center ${this.notebook.Urgent
            ? "text-red-500"
            : ""}" @click="${this.toggleUrgent.bind(this)}"><svg width="17" viewBox="0 0 17 18" class="mr-2 ${this.notebook.Urgent
            ? "fill-red-500"
            : "fill-neutral-900 dark:fill-neutral-100"}">${icons$2.urgent}</svg> ${this.notebook.Urgent ? "Urgent" : "Routine"}</button> <button type="button" class="mr-6 flex items-center ${this.notebook.Resolved
            ? "text-green-600"
            : ""}" @click="${this.toggleResolved.bind(this)}"><svg width="16" viewBox="0 0 22 19" class="mr-2 ${this.notebook.Resolved
            ? "fill-green-600"
            : "fill-neutral-900 dark:fill-neutral-100"}">${icons$2.tick}</svg> ${this.notebook.Resolved ? "Resolved" : "In Progress"}</button></div>`;
        const checkAdjustCellFlag = async () => {
            const on = await hasFlag("adjust-cell");
            this.adjustCellFlag = on;
        };
        m(checkAdjustCellFlag());
        return x `<!-- notebook-body --><div class="h-screen w-screen flex md:max-w-[100vw] top-0 left-0 z-20"><nav class="pt-4 flex flex-col shrink-0 w-48 bg-zinc-50 dark:bg-neutral-900 border-r border-zinc-200 dark:border-transparent"><section class="px-4 mb-5">${navigationArticles}</section><section class="px-2 flex flex-col items-left">${overview}</section></nav><!-- cells-wrapper --><div class="grow overflow-y-auto"><div class="p-7 flex flex-col h-full" @dragover="${(ev) => {
            ev.preventDefault();
        }}" @drop="${(ev) => {
            this.createCell(ev);
        }}" data-testid="notebook-cells-wrapper">${title} ${topbar}<wt-editor notebook="${this.notebook.ID}" class="w-3/4 max-w-[45rem] mb-5 border border-zinc-200 relative rounded shrink-0 min-h-4 max-h-80 focus:h-80 transition-height duration-500 ease-in-out" @create-cell="${(ev) => {
            this.createCell(ev);
        }}"></wt-editor>${this.adjustCellFlag
            ? x `<div class="flex flex-wrap">${current_cells}</div>`
            : current_cells}</div></div></div>${overlay}`;
    }
}
NotebookBody.properties = {
    notebookId: { type: String, attribute: "notebook-id" },
    notebook: { state: true },
    owner: { type: String },
    created: { type: String },
    panel: { state: true },
    pivots: { state: true },
    openedCellMenu: { state: true },
    snapshotMenu: { state: true },
    snapshots: { state: true },
};
customElements.define("wt-notebook-body", NotebookBody);

const emptyState = x `<p class="my-8">No Data Source yet, <a class="text-blue-600" href="/datasources">click to create one.</a></p>`;
class SourceList extends TWElement {
    constructor() {
        super();
        this.sources = [];
        this.list = [];
        this.searchList = [];
        this.searchValue = "";
        this.loading = true;
    }
    firstUpdated() {
        this.fetchList();
    }
    async fetchList() {
        try {
            this.sources = await fetch("/datasources/list").then((r) => r.json());
        }
        catch (err) {
            console.error(err);
            this.error = err.message;
        }
        finally {
            this.loading = false;
            this.getStreamList();
        }
    }
    getStreamList() {
        for (const src of this.sources) {
            for (const stream of src.Streams) {
                this.list.push({
                    id: stream.ID,
                    title: src.Title,
                    name: stream.Name,
                    description: src.Description,
                });
            }
        }
    }
    search(e) {
        console.log("Entered search");
        this.searchValue = e.target.value.toLowerCase();
        this.searchList = [];
        for (const el of this.list) {
            const name = el.name.toLowerCase();
            const title = el.title.toLowerCase();
            const description = el.description.toLowerCase();
            if (name.includes(this.searchValue) ||
                title.includes(this.searchValue) ||
                description.includes(this.searchValue)) {
                this.searchList.push(el);
            }
        }
        return this.searchList;
    }
    createCell(title, dataSource) {
        dispatchCreateCell({
            title,
            dataSource,
        }, this);
    }
    render() {
        let results = [];
        let searchResults = [];
        if (this.searchValue) {
            for (const el of this.searchList) {
                searchResults.push(x `<li class="border-b-1 border-zinc-600 cursor-pointer"><a class="vbox gap-1" @click="${() => this.createCell(el.name, el.id)}"><svg width="16" height="16" viewBox="0 0 24 24" class="fill-zinc-400 shrink-0">${icons$2.data}</svg><p class="font-bold mr-5">${el.title}</p><p>(${el.name})</p>${el.description &&
                    x `<p class="ml-5 text-sm italic text-zinc-500 dark:text-neutral-400">— ${el.description}</p>`}</a></li>`);
            }
        }
        else {
            for (const el of this.list) {
                results.push(x `<li class="border-b-1 border-zinc-600 cursor-pointer"><a class="vbox gap-1" @click="${() => this.createCell(el.name, el.id)}"><svg width="16" height="16" viewBox="0 0 24 24" class="fill-zinc-400 shrink-0">${icons$2.data}</svg><p class="font-bold mr-5">${el.title}</p><p>(${el.name})</p>${el.description &&
                    x `<p class="ml-5 text-sm italic text-zinc-500 dark:text-neutral-400">— ${el.description}</p>`}</a></li>`);
            }
        }
        const hasData = !this.loading && !this.error;
        return x `<div class="center-float h-2/3 w-1/3 z-50 p-6 text-sm shadow-md dark:border-neutral-700 rounded-sm bg-zinc-50 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-200 flex flex-col justify-stretch overflow-auto"><input class="bg-zinc-50 dark:bg-neutral-800 border-b-2 border-zinc-200" name="filter" placeholder=".*" @keyup="${this.search.bind(this)}"/> ${this.error &&
            x `<p class="my-8">Error while listing data sources:${this.error}. Refresh the page to try again.</p>`} ${hasData &&
            (this.searchValue
                ? searchResults.length > 0
                    ? x `<ul class="mt-4">${searchResults}</ul>`
                    : "Nothing found"
                : results.length > 0
                    ? x `<ul class="mt-4">${results}</ul>`
                    : emptyState)}</div>`;
    }
}
SourceList.properties = {
    sources: { state: true },
    list: { state: true },
    searchList: { state: true },
    searchValue: { state: true },
};
customElements.define("wt-notebook-datasources", SourceList);

// TODO(rdo) move this to Go and httpforms
class ScheduleForm extends TWElement {
    get notebookSelect() {
        return this._slottedChildren("select")[0];
    }
    async submit(e) {
        console.log("submit event sent");
        e.preventDefault();
        e.stopPropagation();
        const orig = e.target;
        let sub = new FormData();
        sub.append("notebook", this.notebookSelect.value);
        let sched = orig.elements["scheduleValue"]?.value;
        const reps = orig.elements["repetitions"].value
            ? "R" + orig.elements["repetitions"].value + "/"
            : "";
        const time = orig.elements["start-hour"].value
            ? orig.elements["start-hour"].value
            : "0";
        sched =
            reps +
                orig.elements["start-date"].value +
                "T" +
                time +
                "/P" +
                orig.elements["frequency"].value +
                orig.elements["interval"].value;
        sub.append("schedule", sched);
        let rsp;
        if (await hasFlag("StopSchedule")) {
            sub.append("action", "add");
            rsp = await fetch("/schedule", {
                method: "POST",
                body: sub,
            }).then((r) => r.json());
        }
        else {
            rsp = await fetch("/schedule/add", {
                method: "POST",
                body: sub,
            }).then((r) => r.json());
        }
        if (rsp.Result == "ok") {
            window.location.reload();
        }
        else {
            console.error(rsp.Message);
        }
    }
    render() {
        return x `<form class="px-8 py-6 2xl:w-[610px] flex flex-col dark:bg-neutral-800" @submit="${this.submit.bind(this)}"><h3 class="mb-6 text-xl">🤖 Schedule a control</h3><div class="mb-3 leading-10"><span class="mb-3.5 mr-2.5">For playbook</span><slot></slot></div><div class="mb-3 leading-10"><span class="mb-3.5 mr-2.5">That runs every</span> <input type="number" name="frequency" placeholder="3" min="1" required aria-label="frequency of repetitions" class="mb-3.5 mr-2.5 px-3 w-16 appearance-none bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0"/> <select name="interval" style="background-position:calc(100% - 12px)" aria-label="interval of repetitions" class="mb-3.5 mr-2.5 pl-4 pr-12 max-w-[200px] appearance-none bg-gray-50 dark:bg-neutral-700 bg-no-repeat bg-auto bg-light-down-arrow dark:bg-dark-down-arrow border border-gray-300 dark:border-0"><option value="D" selected="selected">day(s)</option><option value="W">week(s)</option><option value="M">month(s)</option><option value="Y">year(s)</option></select></div><div class="mb-3 leading-10"><span class="mb-3.5 mr-2.5">Starts on</span> <input type="date" name="start-date" aria-label="start date" class="mb-3.5 px-3 bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0"/> <span class="mx-2.5">at</span> <input type="number" name="start-hour" aria-label="hour of day" class="mb-3.5 mr-2.5 px-3 w-16 appearance-none bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0" min="0" max="23"/> <span class="mb-3.5 mr-2.5">hour</span></div><div class="mb-3 leading-10"><span class="mb-3.5 mr-2.5">Ends after</span> <input type="number" name="repetitions" placeholder="10" min="1" aria-label="number of repetitions" class="mb-3.5 mr-2.5 px-3 w-16 appearance-none bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0"/> <span class="mb-3.5 mr-2.5">checks.</span></div><button type="submit" title="Schedule" class="py-2.5 px-4 self-end flex items-center bg-yellow-400 rounded-sm text-neutral-900 text-sm font-medium"><span>Schedule</span></button></form>`;
    }
}
customElements.define("wt-schedule-form", ScheduleForm);

class WtSearch extends TWElement {
    constructor() {
        super();
        this.inputBox = e();
        this.startDate = e();
        this.endDate = e();
        this.isLoading = false;
        this.searchResponse = {
            results: [],
            authors: [],
            start: "",
            end: "",
            datasources: [],
        };
    }
    firstUpdated() {
        if (sessionStorage.getItem("searchQuery")) {
            this.inputBox.value.value = sessionStorage.getItem("searchQuery") || "";
        }
        if (sessionStorage.getItem("searchResponse")) {
            this.searchResponse = JSON.parse(sessionStorage.getItem("searchResponse") || "");
            this.applyFacets();
        }
        else {
            this.getDefaultFilters();
        }
    }
    // wait x seconds before searching
    // as a debounce mechanism to prevent too many requests
    async performSearch() {
        // clear the results from the previous search
        this.searchResponse = {
            results: [],
            authors: [],
            start: "",
            end: "",
            datasources: [],
        };
        this.error = "";
        this.isLoading = true;
        sessionStorage.removeItem("searchResponse");
        sessionStorage.removeItem("searchQuery");
        // check if query is empty
        const query = this.inputBox.value;
        if (!query || query.value === "") {
            this.isLoading = false;
            this.getDefaultFilters();
            return;
        }
        // clear the previous timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(async () => {
            // perform the search
            await this.search();
            this.isLoading = false;
        }, 500);
    }
    async search() {
        const query = this.shadowRoot.querySelector('input[name="query"]');
        const start = this.shadowRoot.querySelector('input[name="startdate"]');
        const end = this.shadowRoot.querySelector('input[name="enddate"]');
        const author = this.shadowRoot.querySelector('select[name="author"]');
        const datasource = this.shadowRoot.querySelector('select[name="datasource"]');
        try {
            const resp = await fetch("/search/query", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: query.value,
                    start: start.value,
                    end: end.value,
                    author: author.value,
                    datasource: datasource.value,
                }),
            });
            this.searchResponse = await resp.json();
            this.applyFacets();
            // store the search response in session storage
            // so that we can retrieve it when the user reopens the search page
            sessionStorage.setItem("searchResponse", JSON.stringify(this.searchResponse));
            sessionStorage.setItem("searchQuery", query.value);
        }
        catch (err) {
            this.error = "The search failed, update your query to try again.";
        }
    }
    async getDefaultFilters() {
        const resp = await fetch("/search/filters");
        this.searchResponse = await resp.json();
        this.applyFacets();
    }
    applyFacets() {
        const authors = this.shadowRoot.querySelector('select[name="author"]');
        const datasources = this.shadowRoot.querySelector('select[name="datasource"]');
        if (this.searchResponse.start) {
            this.startDate.value.valueAsDate = new Date(this.searchResponse.start);
        }
        if (this.searchResponse.end) {
            this.endDate.value.valueAsDate = new Date(this.searchResponse.end);
        }
        // TODO(pck) this should follow the rendering flow!!
        if (this.searchResponse.authors) {
            const currentAuthor = authors.value;
            authors.innerHTML = '<option value="">All</option>';
            this.searchResponse.authors.forEach((user) => {
                let option = document.createElement("option");
                option.value = user.ID;
                option.innerText = user.Name;
                authors.appendChild(option);
            });
            authors.value = currentAuthor;
        }
        if (this.searchResponse.datasources) {
            const currentDatasources = datasources.value;
            datasources.innerHTML = '<option value="">All</option>';
            this.searchResponse.datasources.forEach((datasource) => {
                let option = document.createElement("option");
                option.value = datasource.Key;
                option.innerText = datasource.Title;
                datasources.appendChild(option);
            });
            datasources.value = currentDatasources;
        }
    }
    pills(searchResults) {
        let datasources = A;
        if (searchResults.datasources) {
            datasources = searchResults.datasources.map((datasource) => {
                return x `<div class="pr-1 mb-1 flex flex-initial items-center bg-white border-2 border-zinc-300 rounded cursor-pointer text-xs"><svg width="16" height="16" viewBox="0 0 24 24" class="fill-zinc-400 shrink-0">${icons$2.data}</svg> <span class="pl-1 text-zinc-600">${datasource.Title}</span></div>`;
            });
        }
        let pivots = A;
        if (searchResults.pivots && searchResults.pivots.length > 0) {
            pivots = searchResults.pivots.map((pivot) => {
                return x `<div class="pr-1 mb-1 flex flex-initial items-center bg-white border-2 border-zinc-300 rounded cursor-pointer text-xs"><svg width="16" height="16" viewBox="0 0 24 24" class="fill-zinc-400 shrink-0">${icons$2.pivot}</svg> <span class="pl-1 text-zinc-600">${pivot.name}</span></div>`;
            });
        }
        return x `<div class="flex flex-wrap"><span class="mr-3">${datasources}</span> <span class="flex gap-1">${pivots}</span></div>`;
    }
    render() {
        const resultsHTML = this.searchResponse.results.map((result) => {
            return x `<a href="/notebook/${result.ID}" target="_blank"><div class="py-3 px-4 mb-1 border-b-1 border-zinc-200 rounded-md text-neutral-800 dark:text-neutral-200 dark:bg-neutral-700"><div>${this.pills(result)}</div><div class="text-base font-semibold">Title: ${result.Title}</div><div class="flex text-sm mb-3"><div class="mr-4"><span class="font-semibold">Author: </span>${result.Owner
                .Name}</div><div><span class="font-semibold">Date: </span>${new Date(result.Created).toDateString()}</div></div><wt-search-result notebook="${result.ID}"></wt-search-result></div></a>`;
        });
        return x `<div role="search" id="search" class="overflow-auto min-h-[400px] center-float h-2/3 w-2/3 z-50 p-6 text-sm shadow-md border dark:border-neutral-700 rounded-sm bg-zinc-50 dark:bg-neutral-800 dark:text-neutral-50"><input ${n$1(this.inputBox)} type="text" name="query" class="w-full p-3 border border-zinc-200 bg-zinc-50 rounded-sm focus:outline-0 dark:bg-neutral-600 dark:bg-text-200" aria-label="Search input" placeholder="IP Blocked Russia" @input="${() => this.performSearch()}"/><div class="flex h-full"><div class="w-1/4 mt-6 mr-5 mb-12"><div class="mb-3"><label class="block smallcaps mb-2 text-neutral-800 dark:text-neutral-200">Date</label><div class="flex justify-between"><input ${n$1(this.startDate)} type="date" name="startdate" class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 mr-4 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500" @input="${() => this.performSearch()}"/> <input ${n$1(this.endDate)} type="date" name="enddate" class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500" @input="${() => this.performSearch()}"/></div></div><div class="mb-3"><label class="block smallcaps mb-2 text-neutral-800 dark:text-neutral-200 text">Author</label> <select name="author" class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 w-full focus:outline-0 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500" @input="${() => this.performSearch()}"><option value="">All</option></select></div><div class="mb-3"><label class="block smallcaps mb-2 text-neutral-800 dark:text-neutral-200">Data Sources</label> <select name="datasource" class="border border-zinc-200 bg-zinc-50 rounded-sm p-2 w-full focus:outline-0 dark:text-neutral-200 dark:bg-neutral-600 dark:border-neutral-500" @input="${() => this.performSearch()}"><option value="">All</option></select></div></div><div class="w-3/4 border-l-2 border-neutral-200 dark:border-neutral-600 mt-4 mb-12 pl-5 overflow-auto">${resultsHTML.length > 0
            ? resultsHTML
            : this.isLoading
                ? x `Loading...`
                : x `No match … 😔`} ${this.error?.length > 0
            ? x `<p class="text-orange-600 dark:text-amber-400">${this.error}</p>`
            : A}<div></div></div></div></div>`;
    }
}
WtSearch.properties = {
    searchResponse: { state: true },
    error: { state: true },
    isLoading: { state: true },
};
const prosestyle = i$3 `.ProseMirror{word-wrap:break-word;white-space:normal}.ProseMirror pre{white-space:pre-wrap}`;
class SearchResult extends TWElement {
    constructor() {
        super();
        this.firstUpdated = () => {
            this.readExistingData();
        };
        this.edstate = EditorState.create({ schema: schema });
        this.view = new EditorView(this, {
            state: this.edstate,
            editable: () => false,
        });
    }
    async readExistingData() {
        const response = await fetch(`/api/notebook/editor?action=read&notebook=${this.notebook}`);
        let content = await response.json();
        let doc = schema.nodeFromJSON(content);
        this.edstate = EditorState.create({ doc });
    }
    render() {
        this.view.updateState(this.edstate);
        return x `<div class="dark:text-neutral-200 text-base font-light">${this.view.dom}</div>`;
    }
}
SearchResult.properties = {
    notebook: { type: String },
    edstate: { state: true },
};
SearchResult.styles = [prosestyle, i$3 ``];
customElements.define("wt-search", WtSearch);
customElements.define("wt-search-result", SearchResult);

const IncludeStyleSheets = (base) => class extends base {
    constructor(...args) {
        super(...args);
        const shadow = this.attachShadow({ mode: "open" });
        for (const sheet of document.styleSheets) {
            if (!sheet.href) {
                continue;
            }
            let link = document.createElement("link");
            link.href = sheet.href;
            link.rel = "stylesheet";
            shadow.appendChild(link);
        }
        this.endStyle = shadow.lastChild;
    }
};
/**
 * Submitter behaves like an interactive version of HTML form.
 * As opposed to a regular <form> element, form submission is always done asynchronously, and results injected in the page.
 * Data is only ever synchronized one way to the server (write-behind), but an error will be raised if the server data has been updated.
 *
 * This element is currently fairly minimalist, future extension should strive to be compatible with:
 * - https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement
 *  - https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 *
 * TODO(rdo): ETag management to detect stale data
 * TODO(rdo): integration with extended form elements
 */
class Submitter extends IncludeStyleSheets(HTMLElement) {
    connectedCallback() {
        if (!this.action) {
            console.error(`Submitter element added without an action property. No data will be sent.
This is likely a programming error`);
            return;
        }
        this.form = document.createElement("form");
        for (const elt of Array.from(this.children)) {
            this.form.appendChild(elt);
        }
        this.form.addEventListener("submit", this.submit.bind(this));
        this.shadowRoot.addEventListener("change", this.submit.bind(this));
        this.shadowRoot.appendChild(this.form);
    }
    get action() {
        return this.getAttribute("action");
    }
    async submit(ev) {
        if (!this.action)
            return;
        console.debug("submit sent", ev.target, this.form.elements);
        await fetch(this.action, {
            method: "POST",
            body: new FormData(this.form),
        });
    }
}
customElements.define("wt-submit", Submitter);