import{aR as S,bg as $,d as f,P as N,M as A,o as u,e as k,$ as v,w as i,aQ as L,u as E,b as P,an as y,n as g,al as B,Y as I,aw as T,K as D,c as V,g as C,f as a,i as F,_ as j}from"./index.19c0f551.js";import{E as M,a as K}from"./el-table-column.048f4e80.js";import"./el-checkbox.46d25761.js";import"./el-tag.46d74a3f.js";import{E as R}from"./el-upload.2a535243.js";import"./el-progress.e935b4fa.js";import{r as U,u as q}from"./xlsx.db07aefa.js";import"./Uint8Array.c679f373.js";import"./initCloneObject.85369360.js";import"./isEqual.54ccda44.js";import"./event.776e7e11.js";import"./cloneDeep.587e1d66.js";import"./baseClone.4b761982.js";const z=S({type:{type:String,values:["primary","success","warning","info","danger","default"],default:"default"},underline:{type:Boolean,default:!0},disabled:{type:Boolean,default:!1},href:{type:String,default:""},icon:{type:$}}),Q={click:c=>c instanceof MouseEvent},Y=["href"],G=f({name:"ElLink"}),H=f({...G,props:z,emits:Q,setup(c,{emit:r}){const l=c,s=N("link"),m=A(()=>[s.b(),s.m(l.type),s.is("disabled",l.disabled),s.is("underline",l.underline&&!l.disabled)]);function b(e){l.disabled||r("click",e)}return(e,o)=>(u(),k("a",{class:g(E(m)),href:e.disabled||!e.href?void 0:e.href,onClick:b},[e.icon?(u(),v(E(P),{key:0},{default:i(()=>[(u(),v(L(e.icon)))]),_:1})):y("v-if",!0),e.$slots.default?(u(),k("span",{key:1,class:g(E(s).e("inner"))},[B(e.$slots,"default")],2)):y("v-if",!0),e.$slots.icon?B(e.$slots,"icon",{key:2}):y("v-if",!0)],10,Y))}});var J=I(H,[["__file","link.vue"]]);const O=T(J);const W={class:"container"},X={class:"handle-box"},Z=f({name:"import"}),ee=f({...Z,setup(c){const r=D([]);(()=>{r.value=[{id:1,name:"\u5C0F\u660E",sno:"S001",class:"\u4E00\u73ED",age:"10",sex:"\u7537"},{id:2,name:"\u5C0F\u7EA2",sno:"S002",class:"\u4E00\u73ED",age:"9",sex:"\u5973"}]})();const s=D([]),m=async o=>(s.value=await b(o),!0),b=o=>new Promise(function(t,p){const d=new FileReader;d.onload=function(h){const n=h.target.result;let _=U(n,{type:"binary"});const w=_.SheetNames[0],x=q.sheet_to_json(_.Sheets[w]);t(x)},d.readAsBinaryString(o)}),e=async()=>{const o=s.value.map((t,p)=>({id:p,name:t.\u59D3\u540D,sno:t.\u5B66\u53F7,class:t.\u73ED\u7EA7,age:t.\u5E74\u9F84,sex:t.\u6027\u522B}));r.value.push(...o)};return(o,t)=>{const p=V,d=R,h=O,n=M,_=K;return u(),k("div",null,[C("div",W,[C("div",X,[a(d,{action:"#",limit:1,accept:".xlsx, .xls","show-file-list":!1,"before-upload":m,"http-request":e},{default:i(()=>[a(p,{class:"mr10",type:"success"},{default:i(()=>[F("\u6279\u91CF\u5BFC\u5165")]),_:1})]),_:1}),a(h,{href:"/template.xlsx",target:"_blank"},{default:i(()=>[F("\u4E0B\u8F7D\u6A21\u677F")]),_:1})]),a(_,{data:r.value,border:"",class:"table","header-cell-class-name":"table-header"},{default:i(()=>[a(n,{prop:"id",label:"ID",width:"55",align:"center"}),a(n,{prop:"name",label:"\u59D3\u540D"}),a(n,{prop:"sno",label:"\u5B66\u53F7"}),a(n,{prop:"class",label:"\u73ED\u7EA7"}),a(n,{prop:"age",label:"\u5E74\u9F84"}),a(n,{prop:"sex",label:"\u6027\u522B"})]),_:1},8,["data"])])])}}});const fe=j(ee,[["__scopeId","data-v-bcf2fe4a"]]);export{fe as default};