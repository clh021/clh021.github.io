import{bD as Fe,by as $e,bU as Ae,aR as j,aS as le,aT as fe,d as R,a7 as ne,C as oe,P as H,K as g,N as k,Q as ue,ag as ve,o as L,e as I,n as me,u as S,am as Pe,Y as pe,L as W,cv as xe,cw as Se,M as U,a4 as _e,a5 as De,f as t,b as q,bE as ke,aq as Re,aY as Oe,bw as Y,bp as ze,ak as Ve,al as ae,cx as Me,av as Le,aj as Ie,at as re,aN as Ue,cy as ce,r as he,a6 as Ke,a2 as qe,ao as Ye,an as se,aw as je,ax as He,c as We,w as h,g as V,t as ee,i as M,a0 as de}from"./index.19c0f551.js";import{E as Qe,a as Xe}from"./el-table-column.048f4e80.js";import"./el-checkbox.46d25761.js";import"./el-tag.46d74a3f.js";import{c as D}from"./strings.08061521.js";import{U as ye}from"./event.776e7e11.js";import"./Uint8Array.c679f373.js";import"./initCloneObject.85369360.js";import"./isEqual.54ccda44.js";const Ge=(e,o,l)=>$e(e.subTree).filter(s=>{var n;return Ae(s)&&((n=s.type)==null?void 0:n.name)===o&&!!s.component}).map(s=>s.component.uid).map(s=>l[s]).filter(s=>!!s),Je=(e,o)=>{const l={},C=Fe([]);return{children:C,addChild:n=>{l[n.uid]=n,C.value=Ge(e,o,l)},removeChild:n=>{delete l[n],C.value=C.value.filter(_=>_.uid!==n)}}},Q=Symbol("tabsRootContextKey"),Ze=j({tabs:{type:le(Array),default:()=>fe([])}}),Ce="ElTabBar",et=R({name:Ce}),tt=R({...et,props:Ze,setup(e,{expose:o}){const l=e,C=W(),d=ne(Q);d||oe(Ce,"<el-tabs><el-tab-bar /></el-tabs>");const s=H("tabs"),n=g(),_=g(),i=()=>{let m=0,p=0;const b=["top","bottom"].includes(d.props.tabPosition)?"width":"height",a=b==="width"?"x":"y",A=a==="x"?"left":"top";return l.tabs.every(P=>{var u,F;const w=(F=(u=C.parent)==null?void 0:u.refs)==null?void 0:F[`tab-${P.uid}`];if(!w)return!1;if(!P.active)return!0;m=w[`offset${D(A)}`],p=w[`client${D(b)}`];const $=window.getComputedStyle(w);return b==="width"&&(l.tabs.length>1&&(p-=Number.parseFloat($.paddingLeft)+Number.parseFloat($.paddingRight)),m+=Number.parseFloat($.paddingLeft)),!1}),{[b]:`${p}px`,transform:`translate${D(a)}(${m}px)`}},f=()=>_.value=i();return k(()=>l.tabs,async()=>{await ue(),f()},{immediate:!0}),ve(n,()=>f()),o({ref:n,update:f}),(m,p)=>(L(),I("div",{ref_key:"barRef",ref:n,class:me([S(s).e("active-bar"),S(s).is(S(d).props.tabPosition)]),style:Pe(_.value)},null,6))}});var at=pe(tt,[["__file","tab-bar.vue"]]);const st=j({panes:{type:le(Array),default:()=>fe([])},currentName:{type:[String,Number],default:""},editable:Boolean,type:{type:String,values:["card","border-card",""],default:""},stretch:Boolean}),lt={tabClick:(e,o,l)=>l instanceof Event,tabRemove:(e,o)=>o instanceof Event},be="ElTabNav",nt=R({name:be,props:st,emits:lt,setup(e,{expose:o,emit:l}){const C=W(),d=ne(Q);d||oe(be,"<el-tabs><tab-nav /></el-tabs>");const s=H("tabs"),n=xe(),_=Se(),i=g(),f=g(),m=g(),p=g(),b=g(!1),a=g(0),A=g(!1),P=g(!0),u=U(()=>["top","bottom"].includes(d.props.tabPosition)?"width":"height"),F=U(()=>({transform:`translate${u.value==="width"?"X":"Y"}(-${a.value}px)`})),w=()=>{if(!i.value)return;const c=i.value[`offset${D(u.value)}`],v=a.value;if(!v)return;const r=v>c?v-c:0;a.value=r},$=()=>{if(!i.value||!f.value)return;const c=f.value[`offset${D(u.value)}`],v=i.value[`offset${D(u.value)}`],r=a.value;if(c-r<=v)return;const B=c-r>v*2?r+v:c-v;a.value=B},O=async()=>{const c=f.value;if(!b.value||!m.value||!i.value||!c)return;await ue();const v=m.value.querySelector(".is-active");if(!v)return;const r=i.value,B=["top","bottom"].includes(d.props.tabPosition),N=v.getBoundingClientRect(),E=r.getBoundingClientRect(),x=B?c.offsetWidth-E.width:c.offsetHeight-E.height,T=a.value;let y=T;B?(N.left<E.left&&(y=T-(E.left-N.left)),N.right>E.right&&(y=T+N.right-E.right)):(N.top<E.top&&(y=T-(E.top-N.top)),N.bottom>E.bottom&&(y=T+(N.bottom-E.bottom))),y=Math.max(y,0),a.value=Math.min(y,x)},K=()=>{var c;if(!f.value||!i.value)return;e.stretch&&((c=p.value)==null||c.update());const v=f.value[`offset${D(u.value)}`],r=i.value[`offset${D(u.value)}`],B=a.value;r<v?(b.value=b.value||{},b.value.prev=B,b.value.next=B+r<v,v-B<r&&(a.value=v-r)):(b.value=!1,B>0&&(a.value=0))},we=c=>{const v=c.code,{up:r,down:B,left:N,right:E}=Y;if(![r,B,N,E].includes(v))return;const x=Array.from(c.currentTarget.querySelectorAll("[role=tab]:not(.is-disabled)")),T=x.indexOf(c.target);let y;v===N||v===r?T===0?y=x.length-1:y=T-1:T<x.length-1?y=T+1:y=0,x[y].focus({preventScroll:!0}),x[y].click(),ie()},ie=()=>{P.value&&(A.value=!0)},X=()=>A.value=!1;return k(n,c=>{c==="hidden"?P.value=!1:c==="visible"&&setTimeout(()=>P.value=!0,50)}),k(_,c=>{c?setTimeout(()=>P.value=!0,50):P.value=!1}),ve(m,K),_e(()=>setTimeout(()=>O(),0)),De(()=>K()),o({scrollToActiveTab:O,removeFocus:X}),k(()=>e.panes,()=>C.update(),{flush:"post",deep:!0}),()=>{const c=b.value?[t("span",{class:[s.e("nav-prev"),s.is("disabled",!b.value.prev)],onClick:w},[t(q,null,{default:()=>[t(ke,null,null)]})]),t("span",{class:[s.e("nav-next"),s.is("disabled",!b.value.next)],onClick:$},[t(q,null,{default:()=>[t(Re,null,null)]})])]:null,v=e.panes.map((r,B)=>{var N,E,x,T;const y=r.uid,G=r.props.disabled,J=(E=(N=r.props.name)!=null?N:r.index)!=null?E:`${B}`,Z=!G&&(r.isClosable||e.editable);r.index=`${B}`;const Be=Z?t(q,{class:"is-icon-close",onClick:z=>l("tabRemove",r,z)},{default:()=>[t(Oe,null,null)]}):null,Ne=((T=(x=r.slots).label)==null?void 0:T.call(x))||r.props.label,Te=!G&&r.active?0:-1;return t("div",{ref:`tab-${y}`,class:[s.e("item"),s.is(d.props.tabPosition),s.is("active",r.active),s.is("disabled",G),s.is("closable",Z),s.is("focus",A.value)],id:`tab-${J}`,key:`tab-${y}`,"aria-controls":`pane-${J}`,role:"tab","aria-selected":r.active,tabindex:Te,onFocus:()=>ie(),onBlur:()=>X(),onClick:z=>{X(),l("tabClick",r,J,z)},onKeydown:z=>{Z&&(z.code===Y.delete||z.code===Y.backspace)&&l("tabRemove",r,z)}},[Ne,Be])});return t("div",{ref:m,class:[s.e("nav-wrap"),s.is("scrollable",!!b.value),s.is(d.props.tabPosition)]},[c,t("div",{class:s.e("nav-scroll"),ref:i},[t("div",{class:[s.e("nav"),s.is(d.props.tabPosition),s.is("stretch",e.stretch&&["top","bottom"].includes(d.props.tabPosition))],ref:f,style:F.value,role:"tablist",onKeydown:we},[e.type?null:t(at,{ref:p,tabs:[...e.panes]},null),v])])])}}}),ot=j({type:{type:String,values:["card","border-card",""],default:""},activeName:{type:[String,Number]},closable:Boolean,addable:Boolean,modelValue:{type:[String,Number]},editable:Boolean,tabPosition:{type:String,values:["top","right","bottom","left"],default:"top"},beforeLeave:{type:le(Function),default:()=>!0},stretch:Boolean}),te=e=>Le(e)||Ie(e),ut={[ye]:e=>te(e),tabClick:(e,o)=>o instanceof Event,tabChange:e=>te(e),edit:(e,o)=>["remove","add"].includes(o),tabRemove:e=>te(e),tabAdd:()=>!0},it=R({name:"ElTabs",props:ot,emits:ut,setup(e,{emit:o,slots:l,expose:C}){var d,s;const n=H("tabs"),{children:_,addChild:i,removeChild:f}=Je(W(),"ElTabPane"),m=g(),p=g((s=(d=e.modelValue)!=null?d:e.activeName)!=null?s:"0"),b=async(u,F=!1)=>{var w,$,O;if(!(p.value===u||re(u)))try{await((w=e.beforeLeave)==null?void 0:w.call(e,u,p.value))!==!1&&(p.value=u,F&&(o(ye,u),o("tabChange",u)),(O=($=m.value)==null?void 0:$.removeFocus)==null||O.call($))}catch{}},a=(u,F,w)=>{u.props.disabled||(b(F,!0),o("tabClick",u,w))},A=(u,F)=>{u.props.disabled||re(u.props.name)||(F.stopPropagation(),o("edit",u.props.name,"remove"),o("tabRemove",u.props.name))},P=()=>{o("edit",void 0,"add"),o("tabAdd")};return ze({from:'"activeName"',replacement:'"model-value" or "v-model"',scope:"ElTabs",version:"2.3.0",ref:"https://element-plus.org/en-US/component/tabs.html#attributes",type:"Attribute"},U(()=>!!e.activeName)),k(()=>e.activeName,u=>b(u)),k(()=>e.modelValue,u=>b(u)),k(p,async()=>{var u;await ue(),(u=m.value)==null||u.scrollToActiveTab()}),Ve(Q,{props:e,currentName:p,registerPane:i,unregisterPane:f}),C({currentName:p}),()=>{const u=l.addIcon,F=e.editable||e.addable?t("span",{class:n.e("new-tab"),tabindex:"0",onClick:P,onKeydown:O=>{O.code===Y.enter&&P()}},[u?ae(l,"addIcon"):t(q,{class:n.is("icon-plus")},{default:()=>[t(Me,null,null)]})]):null,w=t("div",{class:[n.e("header"),n.is(e.tabPosition)]},[F,t(nt,{ref:m,currentName:p.value,editable:e.editable,type:e.type,panes:_.value,stretch:e.stretch,onTabClick:a,onTabRemove:A},null)]),$=t("div",{class:n.e("content")},[ae(l,"default")]);return t("div",{class:[n.b(),n.m(e.tabPosition),{[n.m("card")]:e.type==="card",[n.m("border-card")]:e.type==="border-card"}]},[...e.tabPosition!=="bottom"?[w,$]:[$,w]])}}}),rt=j({label:{type:String,default:""},name:{type:[String,Number]},closable:Boolean,disabled:Boolean,lazy:Boolean}),ct=["id","aria-hidden","aria-labelledby"],Ee="ElTabPane",dt=R({name:Ee}),bt=R({...dt,props:rt,setup(e){const o=e,l=W(),C=Ue(),d=ne(Q);d||oe(Ee,"usage: <el-tabs><el-tab-pane /></el-tabs/>");const s=H("tab-pane"),n=g(),_=U(()=>o.closable||d.props.closable),i=ce(()=>{var a;return d.currentName.value===((a=o.name)!=null?a:n.value)}),f=g(i.value),m=U(()=>{var a;return(a=o.name)!=null?a:n.value}),p=ce(()=>!o.lazy||f.value||i.value);k(i,a=>{a&&(f.value=!0)});const b=he({uid:l.uid,slots:C,props:o,paneName:m,active:i,index:n,isClosable:_});return _e(()=>{d.registerPane(b)}),Ke(()=>{d.unregisterPane(b.uid)}),(a,A)=>S(p)?qe((L(),I("div",{key:0,id:`pane-${S(m)}`,class:me(S(s).b()),role:"tabpanel","aria-hidden":!S(i),"aria-labelledby":`tab-${S(m)}`},[ae(a.$slots,"default")],10,ct)),[[Ye,S(i)]]):se("v-if",!0)}});var ge=pe(bt,[["__file","tab-pane.vue"]]);const ft=je(it,{TabPane:ge}),vt=He(ge);const mt={class:"container"},pt={class:"message-title"},_t={class:"handle-row"},ht={class:"message-title"},yt={class:"handle-row"},Ct={class:"message-title"},Et={class:"handle-row"},gt=R({name:"tabs"}),St=R({...gt,setup(e){const o=g("first"),l=he({unread:[{date:"2018-04-19 20:00:00",title:"\u3010\u7CFB\u7EDF\u901A\u77E5\u3011\u8BE5\u7CFB\u7EDF\u5C06\u4E8E\u4ECA\u665A\u51CC\u66682\u70B9\u52305\u70B9\u8FDB\u884C\u5347\u7EA7\u7EF4\u62A4"},{date:"2018-04-19 21:00:00",title:"\u4ECA\u665A12\u70B9\u6574\u53D1\u5927\u7EA2\u5305\uFF0C\u5148\u5230\u5148\u5F97"}],read:[{date:"2018-04-19 20:00:00",title:"\u3010\u7CFB\u7EDF\u901A\u77E5\u3011\u8BE5\u7CFB\u7EDF\u5C06\u4E8E\u4ECA\u665A\u51CC\u66682\u70B9\u52305\u70B9\u8FDB\u884C\u5347\u7EA7\u7EF4\u62A4"}],recycle:[{date:"2018-04-19 20:00:00",title:"\u3010\u7CFB\u7EDF\u901A\u77E5\u3011\u8BE5\u7CFB\u7EDF\u5C06\u4E8E\u4ECA\u665A\u51CC\u66682\u70B9\u52305\u70B9\u8FDB\u884C\u5347\u7EA7\u7EF4\u62A4"}]}),C=n=>{const _=l.unread.splice(n,1);l.read=_.concat(l.read)},d=n=>{const _=l.read.splice(n,1);l.recycle=_.concat(l.recycle)},s=n=>{const _=l.recycle.splice(n,1);l.read=_.concat(l.read)};return(n,_)=>{const i=Qe,f=We,m=Xe,p=vt,b=ft;return L(),I("div",mt,[t(b,{modelValue:o.value,"onUpdate:modelValue":_[0]||(_[0]=a=>o.value=a)},{default:h(()=>[t(p,{label:`\u672A\u8BFB\u6D88\u606F(${l.unread.length})`,name:"first"},{default:h(()=>[t(m,{data:l.unread,"show-header":!1,style:{width:"100%"}},{default:h(()=>[t(i,null,{default:h(a=>[V("span",pt,ee(a.row.title),1)]),_:1}),t(i,{prop:"date",width:"180"}),t(i,{width:"120"},{default:h(a=>[t(f,{size:"small",onClick:A=>C(a.$index)},{default:h(()=>[M("\u6807\u4E3A\u5DF2\u8BFB")]),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"]),V("div",_t,[t(f,{type:"primary"},{default:h(()=>[M("\u5168\u90E8\u6807\u4E3A\u5DF2\u8BFB")]),_:1})])]),_:1},8,["label"]),t(p,{label:`\u5DF2\u8BFB\u6D88\u606F(${l.read.length})`,name:"second"},{default:h(()=>[o.value==="second"?(L(),I(de,{key:0},[t(m,{data:l.read,"show-header":!1,style:{width:"100%"}},{default:h(()=>[t(i,null,{default:h(a=>[V("span",ht,ee(a.row.title),1)]),_:1}),t(i,{prop:"date",width:"180"}),t(i,{width:"120"},{default:h(a=>[t(f,{type:"danger",size:"small",onClick:A=>d(a.$index)},{default:h(()=>[M("\u5220\u9664")]),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"]),V("div",yt,[t(f,{type:"danger"},{default:h(()=>[M("\u5220\u9664\u5168\u90E8")]),_:1})])],64)):se("",!0)]),_:1},8,["label"]),t(p,{label:`\u56DE\u6536\u7AD9(${l.recycle.length})`,name:"third"},{default:h(()=>[o.value==="third"?(L(),I(de,{key:0},[t(m,{data:l.recycle,"show-header":!1,style:{width:"100%"}},{default:h(()=>[t(i,null,{default:h(a=>[V("span",Ct,ee(a.row.title),1)]),_:1}),t(i,{prop:"date",width:"180"}),t(i,{width:"120"},{default:h(a=>[t(f,{size:"small",onClick:A=>s(a.$index)},{default:h(()=>[M("\u8FD8\u539F")]),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"]),V("div",Et,[t(f,{type:"danger"},{default:h(()=>[M("\u6E05\u7A7A\u56DE\u6536\u7AD9")]),_:1})])],64)):se("",!0)]),_:1},8,["label"])]),_:1},8,["modelValue"])])}}});export{St as default};