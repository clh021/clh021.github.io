netiler.namespace('com.leadal.top.scan.service.ScanFileService');
com.leadal.top.scan.service.ScanFileService={_service:'/doc/jservice/com.leadal.top.scan.service.ScanFileService.js',syn:{async:false},local:{}
,createFileId:function(){return netiler.remote.execute(this,'createFileId',arguments,0,0);}
,countByReceival:function(){return netiler.remote.execute(this,'countByReceival',arguments,0,0);}
,countByIssue:function(){return netiler.remote.execute(this,'countByIssue',arguments,0,0);}
,useScanFile:function(){return netiler.remote.execute(this,'useScanFile',arguments,2,0);}
,pageByDocSchemeMore:function(){return netiler.remote.execute(this,'pageByDocSchemeMore',arguments,4,0);}
,edit:function(){return netiler.remote.execute(this,'edit',arguments,1,0);}
,findByType:function(){return netiler.remote.execute(this,'findByType',arguments,2,0);}
,findByEntityId:function(){return netiler.remote.execute(this,'findByEntityId',arguments,1,0);}
,deleteById:function(){return netiler.remote.execute(this,'deleteById',arguments,1,0);}
,pageByDocScheme:function(){return netiler.remote.execute(this,'pageByDocScheme',arguments,3,0);}
,getVirtualOrganId:function(){return netiler.remote.execute(this,'getVirtualOrganId',arguments,1,0);}
,rename:function(){return netiler.remote.execute(this,'rename',arguments,2,0);}
};
netiler.system.clone(netiler.service,com.leadal.top.scan.service.ScanFileService);
netiler.system.clone(com.leadal.top.scan.service.ScanFileService,com.leadal.top.scan.service.ScanFileService.syn);
netiler.namespace('ScanFileService');ScanFileService=com.leadal.top.scan.service.ScanFileService;
