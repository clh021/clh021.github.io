import{aR as h,aS as o,aT as u,d as m,a7 as $,M as c,P as g,aj as f,J as N,o as _,$ as C,w as j,al as x,n as v,u as p,am as O,aQ as w,Y as E,aw as S}from"./index.19c0f551.js";const K=Symbol("rowContextKey"),P=h({tag:{type:String,default:"div"},span:{type:Number,default:24},offset:{type:Number,default:0},pull:{type:Number,default:0},push:{type:Number,default:0},xs:{type:o([Number,Object]),default:()=>u({})},sm:{type:o([Number,Object]),default:()=>u({})},md:{type:o([Number,Object]),default:()=>u({})},lg:{type:o([Number,Object]),default:()=>u({})},xl:{type:o([Number,Object]),default:()=>u({})}}),k=m({name:"ElCol"}),B=m({...k,props:P,setup(d){const t=d,{gutter:n}=$(K,{gutter:c(()=>0)}),a=g("col"),b=c(()=>{const e={};return n.value&&(e.paddingLeft=e.paddingRight=`${n.value/2}px`),e}),i=c(()=>{const e=[];return["span","offset","pull","push"].forEach(s=>{const l=t[s];f(l)&&(s==="span"?e.push(a.b(`${t[s]}`)):l>0&&e.push(a.b(`${s}-${t[s]}`)))}),["xs","sm","md","lg","xl"].forEach(s=>{f(t[s])?e.push(a.b(`${s}-${t[s]}`)):N(t[s])&&Object.entries(t[s]).forEach(([l,r])=>{e.push(l!=="span"?a.b(`${s}-${l}-${r}`):a.b(`${s}-${r}`))})}),n.value&&e.push(a.is("guttered")),[a.b(),e]});return(e,y)=>(_(),C(w(e.tag),{class:v(p(i)),style:O(p(b))},{default:j(()=>[x(e.$slots,"default")]),_:3},8,["class","style"]))}});var R=E(B,[["__file","col.vue"]]);const I=S(R);export{I as E,K as r};