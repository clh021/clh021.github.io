var scanBlock = {
	data : [],  //初始化临时构造数据
	sequence : 0,  //初始化总份数
	firstClick : true,  // 第一次点
	events : {
		click : function(data, panel, block) {
			panel.selected(block);
			if(typeof leadalUtilObj.GetFileDataBase64 == 'function'){
				var callback=function(src_base64){
					var extName=data.src.substring(data.src.lastIndexOf(".")+1);
					src_base64="data:image/"+extName+";base64,"+src_base64;
					scanBlock.previewImg(src_base64);
					scanBlock.pageInfo();
					
				}
				leadalUtilObj.GetFileDataBase64(data.src,callback);
			}else{
				var src_base64 = chrome.getBase64File(data.src);
				scanBlock.previewImg(src_base64);
				scanBlock.pageInfo();
			}
		}
	},
	// 图片
	previewImg : function(src) {
		var _p = document.body.$p();
		_p.$('.js_scan_bigImg').attr('src', src).show();
		_p.$$end(2);
	},
	render : function(panel, data) {
		var _p = panel.$p();
		_p.$('+scan:block').attrs({
					caption : data.number,
					se_lect : 'true',
					img : data.url,
					selected : true
				}).model(data).cfg({
					panel : panel
				}).render();
		_p.$$end(2);
	},
	refreshImg : function(src) {
		var block = document.body.pid('scanblockId').currentBlock();
		block.refreshImg();
		if(typeof leadalUtilObj.GetFileDataBase64 == 'function'){
			var callback=function(src_base64){
				var extName=src.substring(src.lastIndexOf(".")+1);
				src_base64="data:image/"+extName+";base64,"+src_base64;
				scanBlock.previewImg(src_base64);
			}
			leadalUtilObj.GetFileDataBase64(src,callback)
		}else{
			var src_base64 = chrome.getBase64File(src);
			scanBlock.previewImg(src_base64);
		}
	},
	getData : function() {
		var data = document.body.pid('scanblockId').data();
		return data;
	},
	current : function() {
		var current = document.body.pid('scanblockId').currentBlock();
		var data = current.pmodel();
		return data;
	},
	/**
	 * 添加
	 */
	add : function(data) {
		this.sequence++;
		// 获取数据
		var number = this.sequence;
		data['number'] = number;
		this.data.push(data);
		// 加载小图
		var _p = document.body.$p();
		_p.$('.js_scan_blocks');
		var block = _p.ele();
		block.add(data);
		scanBlock.pageInfo();
		_p.$$end(2);
	},
	/**
	 * 前一张
	 */
	pre : function() {
		var panel = document.body.pid('scanblockId');
		panel.clickBlock(panel.pre());
		scanBlock.pageInfo();
	},
	/**
	 * 后一张
	 */
	next : function() {
		var panel = document.body.pid('scanblockId');
		panel.clickBlock(panel.next());
		scanBlock.pageInfo();
	},
	/**
	 * 上移
	 */
	move2pre : function() {
		document.body.pid('scanblockId').move2pre();
		scanBlock.pageInfo();
		scanBlock.refreshPageInfo();
	},
	/**
	 * 下移
	 */
	move2next : function() {
		document.body.pid('scanblockId').move2next();
		scanBlock.pageInfo();
		scanBlock.refreshPageInfo();
	},
	/**
	 * 左转
	 */
	leftTurn : function() {
		var src = this.current()['src'];
		var thumb = this.current()['thumb'];
		scannerObj.RotateImage(src, thumb, -90);
		this.refreshImg(src);

	},
	// 翻页信息
	pageInfo : function() {
		var panel = document.body.pid('scanblockId');
		var count = panel.count();
		var currentPage = panel.index() + 1;
		var _p = document.body.$p();
        if(scanBlock.firstClick){
           count = scanBlock.sequence;
           scanBlock.firstClick =false;
          }
		_p.$('.js_scaning_page_info').html(currentPage + '/' + count);
		_p.$$end(2);
	},
	/**
	 * 右转
	 */
	rightTurn : function() {
		var src = this.current()['src'];
		var thumb = this.current()['thumb'];
		scannerObj.RotateImage(src, thumb,90);
		this.refreshImg(src);
	},
	/**
	 * 删除
	 */
	del : function() {
		var panel = document.body.pid('scanblockId');
		var curIndex = panel.index();
		panel.del();
		scanBlock.refreshPageInfo();
		scanBlock.selectByIndex(curIndex);
	},
	
	selectByIndex : function(index){
		if(typeof index != "number" || index<0){
			return;
		}
		var panel = document.body.pid('scanblockId');
		var dataArr = panel.data();
		if(index>dataArr.length){
			index = dataArr.length-1;
		}
		var scanBlockArr = panel.getElementsByTagName('scan:block');
		
		var data = dataArr[index];
		if(!data){
			return;
		}
		var block = scanBlockArr[index];
		scanBlock.events.click(data, panel, block);
	},
	
	clear : function(){
		document.body.pid('scanblockId').clear();
		scanBlock.refreshPageInfo();
	},
	
	refreshPageInfo : function(){
		var scanObj = document.body.pid('scanblockId');
		if(scanObj){
			var lis = scanObj.getElementsByClassName('ld-top-block-title');
			this.sequence=lis.length;
			if(lis && lis.length>0){
				for(var i=0;i<lis.length;i++){
					lis[i].innerHTML="- "+(i+1)+" -";
				}
			}
		}
	},
	/**
	 * 直接保存并扫描下一个
	 */
	scanNextNow : function(){
		var path = '/top.scan/scan/save.nsp?docScheme=' + docScheme + '&userId='
		+ userId;
		var fileId = document.getElementById('scanDocId').value;
		var finalDocId = document.getElementById('finalDocId').value;
		var type = document.getElementById('type').value;
		if (fileId) {
			path = path + '&id=' + fileId;
		}
		if (finalDocId){
			path = path + '&finalDocId=' + finalDocId;
		}
		if (type){
			path = path + '&type=' + type;
		}
		var curWin = window;
		var panel = document.body.pid('scanblockId');
		var count = panel.count();
		if (count==0) {
			$window.alert('扫描的文件为空!');
			return;
		}
		
		
		
		
	},
	/**
	 * 保存
	 */
	save : function(docScheme, userId, isScanNext, saveCallback, isRedirectSave,docCategory) {
		var path = '/top.scan/scan/save.nsp?docScheme=' + docScheme + '&userId='
				+ userId;
		var fileId = document.getElementById('scanDocId').value;
		var finalDocId = document.getElementById('finalDocId').value;
		var type = document.getElementById('type').value;
		if (fileId) {
			path = path + '&id=' + fileId;
		}
		if (finalDocId){
			path = path + '&finalDocId=' + finalDocId;
		}
		if (type){
			path = path + '&type=' + type;
		}
		if(docCategory && docCategory!=""){
			path += "&docCategory="+docCategory;
		}
		var curWin = window;
		var panel = document.body.pid('scanblockId');
		var count = panel.count();
		if (count==0) {
			$window.alert('扫描的文件为空!');
			return;
		}
		if(isRedirectSave && isRedirectSave=="true"){
			ScanUtil.save(null, docScheme, userId, null, isScanNext, saveCallback);
		}else{
			$window.open({
				url : path,
				frameName : 'saveFrame',
				width : '800px',
				height : '290px',
				caption : '保存',
				btnBar : [{
					caption : '保存',
					tag : 'btn:blue',
					callback : function(pop) {
						ScanUtil.save(this, docScheme, userId, pop, isScanNext, saveCallback);
//									if(finalDocId&&type==1){ //登记界面直接扫描正文，扫描后关闭窗口
//										curWin.close();
//									}
					}
				}, {
					caption : '取消',
					tag : 'btn:red',
					callback : function(popup) {
						popup.close();
					}
				}]
			});
		}
	},
	/**
	 * 重新扫瞄
	 */
	clear : function() {
		// 显示设备信息
		/*
		var devices = document.getElementById("paperscanningId");
		if (devices.style.display == 'none')
			devices.style.display = 'block';
		// 隐藏扫描界面
		var paperbody = document.getElementById("paperbodyId");
		if (paperbody.style.display == 'block')
			paperbody.style.display = 'none';
		*/
		// 刷新扫描
		document.body.pid('scanblockId').clear();
		this.sequence = 0;
		
		netiler.$('#js_scan_bigImg').hide();
	}
}

var Scan = {
	/**
	 * 加载数据
	 */
	load : function(id) {
		parent.parent._frameIn("/top.scan/reader/view.nsp?id=" + id);
	},
	/**
	 * 加载数据
	 */
	loadRegister : function(finalDocId,docInfoId,docScheme) {
		parent.parent._frameIn("/top.register/register/form.nsp?finalDocId="+finalDocId+'&docInfoId='+docInfoId+'&docScheme='+docScheme);
	},
	/**
	 * 删除
	 */
	del : function(gridName,afterDel) {
		var gridObj = netiler.$("#" + gridName);
		var data = gridObj.selected(['id']);
		// var data = document.getElementsByName('id');
		// var ids = ['f117780977fe47cab51c3b3eccd535a8'];
		var ids = [];
		for (var i = 0; i < data.length; i++) {
			ids.push(data[i].id);
		}
		if (data.length > 0) {
			var cbDel = function() {
				var jservice = ScanFileService;
				if (jservice) {
					jservice.deleteById(ids.join(","), function() {
						
							netiler.$("#" + gridName).query();
								$window.alert('删除成功!');
								if(typeof afterDel == "function"){
									afterDel();
								}
							});
				}
			}
			$window.confirm("确定删除选中的记录？", cbDel);
		} else {
			$window.alert("请选择要删除的记录!");
		}
	},
	/**
	 * 登记
	 */
	reg : function(gridName) {
		var flage=true;
		var number=0;
		var gridObj = netiler.$("#" + gridName);
		var data = gridObj.selected(['id','type']);
		if(data.length!=1){
			$window.alert('请选择一条正文记录','info');
			return ;
		}
		if(data[0].type!=1){
			$window.alert('请勾选一条正文类型的记录','info');
			return ;
		}
		this.regToDocScheme("确定将选中的正文转登记？", null, gridName);
	},
	/**
	 * 移动到发文/收文
	 */
	regToDocScheme : function(title, docScheme, gridName) {
		var gridObj = netiler.$("#" + gridName);
		var data = gridObj.selected(['id','docScheme']);
		
		if (data.length > 0) {
			var id=data[0].id;
			if(docScheme==null){
				var docScheme = data[0].docScheme;
			}
			var cbDel = function() {
				var jservice = ScanRegisterService;
				if (jservice) {
					jservice.registerByDocScheme(id, docScheme,function(formData) {
						netiler.$("#" + gridName).query();
			        	$refresh.notifyFor('top.final.index');
			            $window.alert('操作成功!');
			        	Scan.loadRegister(formData.entity.id,formData.docInfo.id,docScheme);
			        	
		         	});
				}
			}
			$window.confirm(title, cbDel);
		} else {
			$window.alert("请选择要操作的记录!");
		}
	},
	/**
	 * 移动
	 */
	move : function(docScheme, gridName) {
		var operName;
		if (docScheme == 'issue')
			operName = '发文';
		if (docScheme == 'receival')
			operName = '收文';
		if (operName)
			this.regToDocScheme("确定将选中的正文转" + operName + "？", docScheme,
					gridName);
	},
	/**
	 * 重命名
	 */
	rename : function(gridName) {
		var gridObj = netiler.$("#" + gridName);
		var data = gridObj.selected(['id']);
		// var data = document.getElementsByName('id');
		// var ids = ['f117780977fe47cab51c3b3eccd535a8'];
		var ids = [];
		for (var i = 0; i < data.length; i++) {
			ids.push(data[i].id);
		}
		if (data.length < 1) {
			$window.alert("请选择要重命名的扫瞄件!");
			return;
		}
		if (data.length > 1) {
			$window.alert("只允许逐条重命名!");
			return;
		}
		var path = '/top.scan/scan/rename.nsp?id=' + ids;
		$window.open({
			url : path,
			frameName : 'renameFrame',
			width : '580px',
			height : '290px',
			caption : '重命名',
			btnBar : [{
				caption : '保存',
				tag : 'btn:blue',
				callback : function(popup) {
					var jservice = ScanFileService;
					if (jservice) {
						var newName = this.document.forms[0]['entity.name'].value;
						if (newName) {
							var curentWin = this;
							jservice.rename(ids.join(','), newName, function() {
										netiler.$("#" + gridName).query();
										$window.alert('保存成功!');
										popup.close();
									});
						} else {
							$window.alert('请填写文件名称!');
						}
					}
				}
			}, {
				caption : '取消',
				tag : 'btn:red',
				callback : function(popup) {
					popup.close();
				}
			}]
		})
	},
	/**
	 * 编辑
	 */
	edit : function(docScheme,gridName) {
		var gridObj = netiler.$("#" + gridName);
		var data = gridObj.selected(['id']);
		var ids = [];
		for (var i = 0; i < data.length; i++) {
			ids.push(data[i].id);
		}
		if (data.length < 1) {
			$window.alert("请选择要编辑的扫瞄件!");
			return;
		}
		if (data.length > 1) {
			$window.alert("只允许逐条编辑!");
			return;
		}
		var path = '/top.scan/scan/save.nsp?id=' + ids +"&docScheme="+docScheme;
		$window.open({
			url : path,
			frameName : 'editFrame',
			width : '580px',
			height : '290px',
			caption : '编辑',
			btnBar : [{
				caption : '保存',
				tag : 'btn:blue',
				callback : function(popup) {
					var jservice = ScanFileService;
					if (jservice) {
						var infoForm = this.document.forms[0];
						var id = infoForm['entity.id'].value;
						var newName = infoForm['entity.name'].value;
						var type = infoForm['entity.type'].value;
						var entityId = infoForm['entity.entityId'].value;
						
						var scanFile = {
								'id':id,
								'name':newName,
								'type':type,
								'entityId':entityId
						};
						
						var check = id && (id!="") && newName && (newName!="") && type && (type+""!="");
						
						if (check) {
							var curentWin = this;
							jservice.edit(scanFile, function() {
										netiler.$("#" + gridName).query();
										$window.alert('保存成功!');
										popup.close();
									});
						} else {
							$window.alert('请将信息填写完整!');
						}
					}
				}
			}, {
				caption : '取消',
				tag : 'btn:red',
				callback : function(popup) {
					popup.close();
				}
			}]
		})
	}
}

var ScanGridRender = {
	/**
	 * 查看标题
	 */
	viewHeading : function(name, map) {
		var str = '<span style="cursor:pointer" onclick="Scan.load(\'' + map.id
				+ '\');">' + map.name + '</span>';
		return str;
	}
}