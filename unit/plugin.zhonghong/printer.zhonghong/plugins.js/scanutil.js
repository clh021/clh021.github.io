/**
 * 颜色汉化对照表
 */
var ColorMap = {
	'RGB' : '彩色',
	'GRAY': '灰度',
	'BW' : '黑白'
}

var ScanUtil = {
	/**
	 * 页数
	 */
	pageIndex : 0,
	
	locked : false,
	/**
	 * 控制正文选择
	 */
	hiddenMain : function(value) {
		var obj = document.getElementById('docTypes');
		if (value == 1) {
			var mainDocObjArr = document.getElementsByName("entity.entityId");
			if(mainDocObjArr && mainDocObjArr.length>0){
				mainDocObjArr[0].setValue("");
			}
			obj.style.display = 'none';
		} else {
			obj.style.display = 'block';
		}
	},
	/**
	 * 发起扫瞄
	 */
	send : function(docScheme,gridName,isRedirectSave,docCategory,beforeEndCbFun) {
		isRedirectSave=(isRedirectSave)?isRedirectSave:"";
		var platform = navigator.platform.toLowerCase();
		var scanType= document.getElementById("scanType");
		var url=null;
		var scanTypeValue=null;
		if(scanType){
			scanTypeValue=scanType.value;
		}
		if(platform.indexOf("linux") != -1 && scanTypeValue=="科图"){
			url = '/top.scan/scan/scaning2.nsp?docScheme='+docScheme+'&isRedirectSave='+isRedirectSave;
		}else{
			url = '/top.scan/scan/scaning.nsp?docScheme='+docScheme+'&isRedirectSave='+isRedirectSave;
		}
		if(docCategory && docCategory!=""){
			url+="&docCategory="+docCategory;
		}
		$window.open( {
			url : url,
			frameName : 'scanFrame',
			width : '80%',
			height : '86%',
			beforeClose : function(){
				netiler.$("#" + gridName).query();
				if(typeof beforeEndCbFun == "function"){
					beforeEndCbFun();
				}
			}
		})
	},
	/**
	 * 获取扫描设备
	 */
	findDevices : function(devs) {
		document.getElementById("devicesName").innerHTML="";
		if (devs) {
			devs = eval('('+devs+')');
			for(var i=0;i<devs.length;i++){
				var dev = devs[i];
				var option = document.createElement("option");
				option.innerHTML = dev.productName
				option.value = dev.id;
				document.getElementById("devicesName").appendChild(option);
			}
			
			var paramTrs = document.getElementsByName("linuxparams");
			if(devs[0] && paramTrs && paramTrs.length>0){
				this.getDeviceSolution(devs[0].id);
			}
		}
	},
	
	getDeviceSolution : function(id){
		var solution = scannerObj.GetCapability(id);
		solution = eval('('+solution+')');
		
		if(typeof solution == "undefined"){
			return;
		}
		var pixeltype = solution.pixeltype;
		var resolution = solution.resolution;
		
		document.getElementById("pixeltype").innerHTML = '';
		document.getElementById("resolution").innerHTML = '';
		for(var i=0;i<pixeltype.length;i++){
			var p = pixeltype[i];
			var option = document.createElement("option");
			
			if(ColorMap[p.value]){
				option.innerHTML = ColorMap[p.value];
			}else{
				option.innerHTML = p.value;
			}
			
			option.value = p.index;
			document.getElementById("pixeltype").appendChild(option);
		}
		
		for(var i=0;i<resolution.length;i++){
			var p = resolution[i];
			var option = document.createElement("option");
			option.innerHTML = p.value;
			if (option.value=='150') {
				option.selected=true;
			}
			option.value = p.index;
			
			document.getElementById("resolution").appendChild(option);
		}
	},
	
	/**
	 * 开始扫瞄
	 */
	start : function() {
		if (this.locked) {
			$window.alert('正在扫描文件!');
			return;
		}
		this.locked=true;
		var jservice = ScanFileService;
		if(jservice){
			jservice.createFileId(function(id){
				//生成新的扫描件ID
				document.getElementById('scanDocId').value=id;
				//获取相关设备参数
				var isDefault = false;
				var obj = document.getElementById("devicesName"); // selectid
				var devName = obj.options[obj.selectedIndex].value; // 选中值
				var configData = document.getElementsByName("isdefault");
				for (i = 0; i < configData.length; i++) {
					if (configData[i].checked && configData[i].value == 'true') {
						isDefault = true;
					}
				}
				
				//隐藏设备信息
				var devices = document.getElementById("paperscanningId"); // selectid
				devices.style.display = 'none';
				//显示扫描界面
				var paperbody = document.getElementById("paperbodyId");
				if(paperbody.style.display=='none')
				  paperbody.style.display = 'block';		
				//显示加载信息
				//var scanloading = document.getElementById("scanloadingId"); // selectid
				//scanloading.style.display = 'block';
				
				var dev = netiler.$('#devicesName').value;
				dev = parseInt(dev);
				
				var pixeltype = 0;
				var resolution = 0;
				var paperSingle =  0;
				var platform = navigator.platform.toLowerCase();
		        if(platform.indexOf("linux") != -1) {
					pixeltype = netiler.$('#pixeltype').value;
					if(netiler.$('#resolution')!=null){
					resolution = netiler.$('#resolution').value;
					}
					paperSingle =  netiler.$('#paperSingle').value;
					pixeltype = parseInt(pixeltype);
					resolution = parseInt(resolution);
					paperSingle = parseInt(paperSingle);
		        }
				
				$loading.show("正在扫描中...<br/><div style='padding:0 -moz-calc((100% - 118px) / 2);'><btn:red-big caption='已扫描完毕' onclick='ScanUtil.locked=false;$loading.hide();'></btn:red-big></div>");
				scannerObj.StartScan(dev,pixeltype,resolution,paperSingle,true);
				
			});
		}
	},
	
	/**
	 * 切换扫描仪
	 */
	changeScanner : function(){
		var btn_doScan = netiler.$('#btn_doScan');
		btn_doScan.setCaption("继续扫描");
		var btnSpan = btn_doScan.parentElement;
		btnSpan.setAttribute("onclick","ScanUtil.continueScan();");
		
		//显示设备信息
		var devices = document.getElementById("paperscanningId"); // selectid
		devices.style.display = 'block';
		//隐藏扫描界面
		var paperbody = document.getElementById("paperbodyId");
		if(paperbody.style.display=='none')
		  paperbody.style.display = 'block';
		
		$loading.show('正在识别扫描设备，请稍后...');
		scannerObj.GetListDataSources();
	},
	
	/**
	 * 继续扫描
	 */
	continueScan : function() {
		//获取相关设备参数
		var isDefault = false;
		var obj = document.getElementById("devicesName"); // selectid
		var devName = obj.options[obj.selectedIndex].value; // 选中值
		var configData = document.getElementsByName("isdefault");
		for (i = 0; i < configData.length; i++) {
			if (configData[i].checked && configData[i].value == 'true') {
				isDefault = true;
			}
		}
		
		//隐藏设备信息
		var devices = document.getElementById("paperscanningId"); // selectid
		devices.style.display = 'none';
		//显示扫描界面
		var paperbody = document.getElementById("paperbodyId");
		if(paperbody.style.display=='none')
		  paperbody.style.display = 'block';		
		
		var dev = netiler.$('#devicesName').value;
		dev = parseInt(dev);
		
		var pixeltype = 0;
		var resolution = 0;
		var paperSingle =  0;
		var platform = navigator.platform.toLowerCase();
        if(platform.indexOf("linux") != -1) {
			pixeltype = netiler.$('#pixeltype').value;
			resolution = netiler.$('#resolution').value;
			paperSingle =  netiler.$('#paperSingle').value;
			pixeltype = parseInt(pixeltype);
			resolution = parseInt(resolution);
			paperSingle = parseInt(paperSingle);
        }
		
		$loading.show("正在扫描中...<br/><div style='padding:0 -moz-calc((100% - 118px) / 2);'><btn:red-big caption='已扫描完毕' onclick='ScanUtil.locked=false;$loading.hide();'></btn:red-big></div>");
		scannerObj.StartScan(dev,pixeltype,resolution,paperSingle,true);
	},
	
	/**
	 * 追加扫描 纸质文件（继续放纸）
	 */
	addPaper : function(){
		if (this.locked) {
			$window.alert('正在扫描文件!','info');
			return;
		}
		this.locked=true;
		var dev = netiler.$('#devicesName').value;
//		var pixeltype = netiler.$('#pixeltype').value;
//		var resolution = netiler.$('#resolution').value;
//		var paperSingle =  netiler.$('#paperSingle').value;
		dev = parseInt(dev);
//		pixeltype = parseInt(pixeltype);
//		resolution = parseInt(resolution);
//		paperSingle = parseInt(paperSingle);
		
		var pixeltype = 0;
		var resolution = 0;
		var paperSingle =  0;
		parent.$loading.show("正在扫描中...<br/><div style='padding:0 -moz-calc((100% - 118px) / 2);'><btn:red-big caption='已扫描完毕' onclick='ScanUtil.locked=false;$loading.hide();'></btn:red-big></div>");
		scannerObj.StartScan(dev,pixeltype,resolution,paperSingle,true);
	},
	
	/**
	 * 继续扫描下一个新文件
	 */
	scanNext : function(docScheme, userId, isRedirectSave,docCategory){
		var isScanNext = true;
		var saveCallback = function(){
			ScanUtil.locked=false;
			scanBlock.clear();
			ScanUtil.start();
		}
		scanBlock.save(docScheme, userId, isScanNext, saveCallback, isRedirectSave,docCategory);
	},
	
	/**
	 * 创建数据
	 */
	creatdata : function(source, thumb) {
		if(typeof leadalUtilObj.GetFileDataBase64 == 'function'){
			var callback=function(thumb_base64){
				var extName=thumb.substring(thumb.lastIndexOf(".")+1);
				thumb_base64="data:image/"+extName+";base64,"+thumb_base64;
				var data = {};
				data['url'] = thumb_base64;
				data['selected']= 'true';
				data['src'] = source;
				data['thumb'] = thumb;
				scanBlock.add(data);
			}
			leadalUtilObj.GetFileDataBase64(thumb,callback);
		}else{
			var thumb_base64 = chrome.getBase64File(thumb);
			var data = {};
			data['url'] = thumb_base64;
			data['selected']= 'true';
			data['src'] = source;
			data['thumb'] = thumb;
			scanBlock.add(data);
		}
	},
	/**
	 * 扫描图片回调事件
	 */
	scanImage : function(source, thumb) {
		this.creatdata(source, thumb);
	},
	/**
	 * 扫描完毕回调事件
	 */
	scanImageComplete : function(result) {
		//隐藏加载
		//var scanloading = document.getElementById("scanloadingId"); // selectid
		//scanloading.style.display = 'none';
//		this.locked=false;
//		if(0==result){
//			alert("扫描完毕回调事件，未扫描文件！","info");	
//			ScanUtil.locked=false;
//		}else if(1==result){
		ScanUtil.locked=false;
		$window.alert('扫描完毕!','ok');
//		}
		if($loading){
			$loading.hide();
		}
		if(parent.$loading){
			parent.$loading.hide();
		}
		
	},
	/**
	 * 保存
	 */
	save: function(win,docScheme,userId,curWin,isScanNext,saveCallback,docCategory){
		if(!win){
			win=window;
			win.Opener=window;
			
			var fileId = document.getElementById('scanDocId').value;
			var finalDocId = document.getElementById('finalDocId').value;
			var type = document.getElementById('type').value;
			var param = [];
			param.push('{"name":"entity.name","value":""}');
			//存储类型
			param.push('{"name":"entity.type","value":"1"}');
			if(typeValue!=1){
				if(entityId==''){
					$window.alert('请选择关联的正文','info');
					return ;
				}
				param.push('{"name":"entity.entityId","value":"'+entityId+'"}');
			}
			
		}else{
			//获取保存的参数
			var formObj = win.document.forms[0];
			//文件名称
			var param = [];
			var name = formObj['entity.name'].value;
			var finalDocId = formObj['finalDocId'].value;
			if(name){
				param.push('{"name":"entity.name","value":"'+name+'"}');
			}else{
				$window.alert('请填写文件名!');
				return;
			}
			var typeValue;
			if(finalDocId){
				typeValue = formObj['entity.type'].value;
			}else{
				typeValue = win.document.getElementById('typeId').getValue();
			}
			if(typeValue){
				//存储类型
				param.push('{"name":"entity.type","value":"'+typeValue+'"}');
			}else{
				$window.alert('请选择存储类型!');
				return;
			}
			//alert(typeValue);
			//关联正文
			var entityId = formObj['entity.entityId'].value;
			//alert(entityId);
			//存在finalDocId时,无需关联正文
			if(finalDocId){
//			var actorId = formObj['actorId'].value;
				param.push('{"name":"entity.entityId","value":"'+entityId+'"}');
//			param.push('{"name":"actorId","value":"'+actorId+'"}');
			}else{
				if(typeValue!=1){
					if(entityId==''){
						$window.alert('请选择关联的正文','info');
						return ;
					}
					param.push('{"name":"entity.entityId","value":"'+entityId+'"}');
				}
			}
		}
		//用户ID
		param.push('{"name":"entity.creatorId","value":"'+userId+'"}');
		//收文还是发文
		param.push('{"name":"entity.docScheme","value":"'+docScheme+'"}');
		if(docCategory && docCategory!=""){
			param.push('{"name":"entity.docCategory","value":"'+docCategory+'"}');
		}
		
		var fileId = win.Opener.document.getElementById('scanDocId').value;
		param.push('{"name":"entity.id","value":"'+fileId+'"}');
		//图片数组
		var arr_imgs = [];
		for (var i=0;i<win.Opener.scanBlock.getData().length;i++)
		{
			var item = win.Opener.scanBlock.getData()[i];
			var reg = new RegExp("\\\\","gi");
			var new_temp = item.src.replace(reg,"/");
			arr_imgs.push("\""+new_temp+"\"");
		}
		param.push('{"name":"entity.pageSize","value":"'+win.Opener.scanBlock.data.length+'"}');
		var imgstr = "["+arr_imgs+"]";
		
		var  url = win.document.location.href;
		var items = url.split('/');
		var u = [];
		for(var i=0;i<3;i++){
			u.push(items[i]);
		}
		var domain = u.join('/');
		var path = domain+NetilerUI.resetURL('/top.scan/scan/upload.nsp?$event=upload&isScanFile=true');
		if(finalDocId){
			path = domain+NetilerUI.resetURL('/top.resource/docFile/scanUpload.nsp');
		}
		if(typeof BossDocService != "undefined"){
			BossDocService.syn.load(finalDocId,function(data){
	            if(data!=null){
	            	param.push('{"name":"entity.bossDocId","value":"'+finalDocId+'"}');
	    			path = domain+NetilerUI.resetURL('/top.bossDoc/register/view/info/scanUpload.nsp');
	    			finalDocId=null;
	            }
			});
	    }
		var pstr = "["+param+"]";
		win.Opener.parent.$loading.show("正在上传中");
		win.Opener.scannerObj.MergeImage2PDF(imgstr,path,pstr);
		
		if(true == isScanNext){
			win.Opener.ScanUtil.mergeImageComplete = function(res){
				win.Opener.parent.$loading.hide();
				win.Opener.scanBlock.clear();
				$window.alert('保存成功!');
				if(saveCallback){
					saveCallback();
				}
				if(curWin){
					curWin.close();
				}
			}
		}else{
			win.Opener.ScanUtil.mergeImageComplete = function(res){
				win.Opener.parent.$loading.hide();
				$window.alert('保存成功!');
				if(finalDocId){
					win.Opener.Opener.afterUpload(fileId);
					win.Opener.close();
				}else{
					win.Opener.scanBlock.clear();
					win.Opener.close();
				}
				if(curWin){
					curWin.close();
				}
			}
		}
		
		
	},
	
	mergeImageComplete : function(result){
		
	}
}