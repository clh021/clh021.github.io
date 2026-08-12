netiler.namespace('com.leadal.top.bossDoc.service.BossDocService');
com.leadal.top.bossDoc.service.BossDocService={_service:'/doc/jservice/com.leadal.top.bossDoc.service.BossDocService.js',syn:{async:false},local:{}
,createData:function(){return netiler.remote.execute(this,'createData',arguments,1,0);}
,loadByEntityId:function(){return netiler.remote.execute(this,'loadByEntityId',arguments,1,0);}
,deleteByIds:function(){return netiler.remote.execute(this,'deleteByIds',arguments,1,0);}
,changeStatus:function(){return netiler.remote.execute(this,'changeStatus',arguments,2,0);}
,cleanRubish:function(){return netiler.remote.execute(this,'cleanRubish',arguments,0,0);}
,rubishById:function(){return netiler.remote.execute(this,'rubishById',arguments,1,0);}
,recoverByIds:function(){return netiler.remote.execute(this,'recoverByIds',arguments,1,0);}
,getNewDocNum:function(){return netiler.remote.execute(this,'getNewDocNum',arguments,2,0);}
,countStatus:function(){return netiler.remote.execute(this,'countStatus',arguments,1,0);}
,findBossDocByIds:function(){return netiler.remote.execute(this,'findBossDocByIds',arguments,1,0);}
,historyHandleViews:function(){return netiler.remote.execute(this,'historyHandleViews',arguments,2,0);}
,getYearByCategoryId:function(){return netiler.remote.execute(this,'getYearByCategoryId',arguments,1,0);}
,doExact:function(){return netiler.remote.execute(this,'doExact',arguments,1,0);}
,pageByDocCategoryId:function(){return netiler.remote.execute(this,'pageByDocCategoryId',arguments,5,0);}
,copyOther:function(){return netiler.remote.execute(this,'copyOther',arguments,2,0);}
,validIsExist:function(){return netiler.remote.execute(this,'validIsExist',arguments,1,0);}
,svaeData:function(){return netiler.remote.execute(this,'svaeData',arguments,1,0);}
,getBossSnOfdInfo:function(){return netiler.remote.execute(this,'getBossSnOfdInfo',arguments,1,0);}
,saveBossDoc:function(){return netiler.remote.execute(this,'saveBossDoc',arguments,1,0);}
,load:function(){return netiler.remote.execute(this,'load',arguments,1,0);}
};
netiler.system.clone(netiler.service,com.leadal.top.bossDoc.service.BossDocService);
netiler.system.clone(com.leadal.top.bossDoc.service.BossDocService,com.leadal.top.bossDoc.service.BossDocService.syn);
netiler.namespace('BossDocService');BossDocService=com.leadal.top.bossDoc.service.BossDocService;
