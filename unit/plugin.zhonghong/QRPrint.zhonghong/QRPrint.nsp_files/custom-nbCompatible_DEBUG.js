/**
 * @fileOverview 兼容netiler browser客户端，目前依赖于netiler.js,NetilerUI.js,predator.js
 * 
 */

/*saloon.console工程中存在另外的Console全局变量会覆盖此Console*/
var Console = window.console;/*有些旧代码仍保存Console,保留该全局变量防止其报错*/
(function() {
	/**
	 * 判断
	 * navigator.userAgent.indexOf("netiler")
	 * 使用谷歌浏览器，chrome调不到方法报错处理
	 * 
	 * **/
	
	if (typeof chrome === 'undefined' || navigator.userAgent.indexOf("netiler")==-1) {
		return;
	}
	/** ******************* Netiler客户端控制台，以便支持console.log进行调试************** */
	if (chrome.getPref("console.enable","false") === "true") {
		var console_win;// 控制台窗口
		document.addEventListener("keypress", function(e) {
					console_win = chrome.findWindow("console_win");
					switch (e.keyCode) {
						case 123 :
							// F12按键
							if (chrome.window === console_win) {
								return;
							}
                            const url = NetilerUI.resetURL("/netiler.ui/clientConsole.nsp");
							if (console_win) {
								console_win.clientConsole.restoreWin();
								console_win.clientConsole.refreshMessage(Console.message);
							} else {
								chrome.open(url, "consoleBug", 700, 500);
								chrome.setAttribute("console_message", Console.message);
							}
							break;
					}
				}, false);
		if (chrome.getPref("error.enable") !== "false" && window.location.href.indexOf('clientConsole.nsp')==-1) {
			window.onerror = function(msg, url, line, d) {
				Console._refreshMessage(msg, true);
				console_win = chrome.findWindow("console_win");
				console_win && console_win.clientConsole.refreshMessage(Console.message);
			}
		}
		
		Console = {
			/**
			 * 消息池 {message:文件内容|url:文件地址|line:行数}
			 */
			message : [],
			/**
			 * 刷新消息池 isError:是否是错误消息
			 */
			_refreshMessage : function(message, isError) {
				var msgInfo=this._getInfo();
				var line = msgInfo.line;
				var url = msgInfo.url;
				var errorMsg= msgInfo.errorMsg;
				message = this._toString(message);
				this.message.push({
							message : message,
							textUrl : url,
							line : line,
							isError : isError,
							errorMsg: errorMsg ? errorMsg : null
						});
			},
			/**
			 * 得到所在行数及文件地址信息
			 */
			_getInfo : function() {
				var line, url;
				var _message_all = (new Error()).stack;
				var _messageArray = _message_all.split("@");
				_message = (_messageArray)[_messageArray.length-1];
				var commaP = _message.lastIndexOf(":");
				line = _message.substring((commaP + 1));
				url = _message.substring(0, commaP);
				return {
					line : line,
					url : url,
					errorMsg : _message.substring(0,_message.lastIndexOf(':'))
				}
			},
			/**
			 * 将各种类型的message转化为字符串
			 */
			_toString: function(message){
				if (message instanceof Array) {
					message = "[" + message + "]";
				} else {
					var _div = document.createElement("div");
					_div.innerHTML = message;
					message = _div.innerHTML;
				}
				return message;
			},
			/**
			 * 在控制台窗口输出内容
			 */
			log : function(message) {
				Console._refreshMessage(message, false);
				console_win = chrome.findWindow("console_win");
				if (console_win) {
					console_win.clientConsole.refreshMessage(Console.message);
				}
			},
			warn : function(message){
				Console._refreshMessage(message, true);
				console_win = chrome.findWindow("console_win");
				if (console_win) {
					console_win.clientConsole.refreshMessage(Console.message);
				}
			}
		}
		// override window.console API, compatible for Netiler Browser
		window.console.log = function() {
			Console.log.apply(Console, arguments);
		}
		window.console.error = window.console.warn = function(){
			Console.warn.apply(Console,arguments);
		}
	}
	
	/** ******************* Netiler客户端浏览器元素title属性支持***************** */
	if (chrome.getPref('netiler.browser.title.enable','false')==='false'){
		var topWin = chrome.window;
	
		document.onmouseover = function() {
			var event = NetilerUI.getEvent();
			var target = event.target;
			var intervalHandle = null, timeoutHandle = null, oleft = null, otop = null;
			var getTitle = function(tg) {
				var ele = null;
				if (tg && tg.tagName && probot.isValid((typeof tg.attr == "function" && tg.attr) ? tg.attr("title") : tg.getAttribute("title"))) {
					ele = tg.getAttribute("title");
				} else if (tg) {
					ele = getTitle(tg.parentNode);
				}
				return ele;
			}
			var ev = null;
			var docMove = function(e) {
				ev = e;
			}
	
			var clearTemp = function() {
				if (intervalHandle) {
					clearInterval(intervalHandle);
				}
				if (timeoutHandle) {
					clearTimeout(timeoutHandle);
					timeoutHandle = null;
				}
				target.removeEventListener("mouseleave", clearTemp, false);
				document.removeEventListener("mousemove", docMove, false);
			}
	
			var hideUITitle = function() {
				var uiTitleObj = topWin.netiler.$("#ui-title");
				if (uiTitleObj) {
					uiTitleObj.css({
								display : "none"
							});
				}
				clearTemp();
				this.removeEventListener("mousemove", hideUITitle, false);
				document.removeEventListener("DOMMouseScroll", hideUITitle, false);
				document.removeEventListener("mousedown", hideUITitle, false);
				target.removeEventListener("DOMMouseScroll", hideUITitle, false);
				target.removeEventListener("mousedown", hideUITitle, false);
			}
	
			var loadUITitle = function(e) {
				var bindEvents = function() {
					target.addEventListener('mousemove', hideUITitle, false);
					document.addEventListener("DOMMouseScroll", hideUITitle, false);
					target.addEventListener("DOMMouseScroll", hideUITitle, false);
					document.addEventListener("mousedown", hideUITitle, false);
					target.addEventListener("mousedown", hideUITitle, false);
				}
				timeoutHandle = setTimeout(function() {
							tp = e.screenY + 10;
							lt = e.screenX + 10;
							var uiTitleObj = topWin.netiler.$("#ui-title");
							if (uiTitleObj && timeoutHandle) {
								if (uiTitleObj.reloadTitle) {
									uiTitleObj.reloadTitle({
												left : lt,
												top : tp,
												text : getTitle(target)
											});
									bindEvents();
								}
							} else if (timeoutHandle) {
								var _p = $p(topWin.document.body);
								_p.$("+ui:title").attr({
											id : "ui-title",
											text : getTitle(target),
											uiStyle : "top:" + tp + "px;left:" + lt + "px"
										}).ready(function() {
											this.showTitle(tp, lt);
											bindEvents();
										}).render();
								_p.$$end();
							}
						}, 200);
			}
	
			if (target && target.tagName) {
				var mouseover = function(e) {
					var title = getTitle(target);
					if (!probot.isValid(title) || typeof $UI != "undefined") {
						return;
					}
					target.removeEventListener('mousemove', mouseover, false);
					target.addEventListener('mouseleave', clearTemp, false);
					oleft = e.screenX + 10;
					otop = e.screenY + 10;
					intervalHandle = setInterval(function() {
								var nleft = ev.screenX + 10;
								var ntop = ev.screenY + 10;
								if (nleft == oleft && ntop == otop) {
									if (intervalHandle) {
										clearInterval(intervalHandle);
									}
									loadUITitle(ev);
								} else {
									if (timeoutHandle) {
										clearTimeout(timeoutHandle);
									}
									oleft = nleft;
									otop = ntop;
								}
							}, 100);
					document.addEventListener("mousemove", docMove, false);
				}
				target.addEventListener('mousemove', mouseover, false);
			}
		}
	}

	/** ******************* 即时通讯v35版本 fileAPI支持 2017-4-6 added by yeshiqing***************** */
	var onClickPopMenu=function(item,event,itag){
		if(item.onclick){
			item.onclick(event,itag);
		}
	}
	var FileBind={
		binds:function(obj){
			for(var i=0;i<obj.Arr.length;i++){
				var fn =obj.Arr[i];
				this.bind(obj,fn);
			}
		},
		bind:function(obj,fn){
			obj.prototype[fn] = function(){
				return chrome.apply(this.file,fn,arguments);
			}
		}
	}
	var FileInfo=function(file){
		this.file=file;
		this.path=chrome.apply(this.file,'path');
	}
	
	FileInfo.Arr = ['getName','fileSizeInfo','launch','reveal','createDir','createFile','exists','fileSize','listFiles','hash','isDirectory','isHidden','lastModifiedTime','isFile','toRead','toWrite'];
	FileBind.binds(FileInfo);
	FileInfo.prototype.listFiles=function(){
		var list=  chrome.apply(this.file,'listFiles');
		var length= chrome.apply(list,'length');
		var files=[];
		for(var i=0;i<length;i++){
			var f=chrome.apply(list,i);
			f=new FileInfo(f);
			files.push(f);
		}
		return files;
	}
	
	var WriteFile=function(file){
		this.file=file;
	}
	
	WriteFile.Arr = ['fileSize','seek','writeBytes','writeByteArray','close'];
	FileBind.binds(WriteFile);
	
	var ReadFile=function(file){
		this.file=file;
	}
	
	ReadFile.Arr = ['seek','fileSize','readBytes','toBase64','toImageBase64','toPngBase64','toJpgBase64','close'];
	FileBind.binds(ReadFile);
	
	
	var NetilerDataBase=function(db){
		this.db=db;
	}
	NetilerDataBase.prototype.createIfNotExist = function() {
		chrome.apply(this.db,'createIfNotExist',arguments);
	}
	NetilerDataBase.prototype.create = function(db) {
		chrome.apply(this.db,'create',arguments);
	}
	NetilerDataBase.prototype.add = function(data, callback) {
		chrome.apply(this.db,'add',arguments);
	}
	NetilerDataBase.prototype.load = function(id, callback) {
		chrome.apply(this.db,'load',arguments);
	}
	NetilerDataBase.prototype.update = function(id, callback) {
		chrome.apply(this.db,'update',arguments);
	}
	NetilerDataBase.prototype.del = function(id, callback) {
		chrome.apply(this.db,'del',arguments);
	}
	NetilerDataBase.prototype.list = function(callback) {
		chrome.apply(this.db,'list',arguments);
	}
	
	//var FileList=function(list){
	//	this.list=list;
	//	this.length=chrome.apply(this.list,'length');
	//}
	//
	//FileList.prototype.getItem=function(n){
	//	var file= chrome.call(this.list,n);
	//	if(file){
	//		return new FileInfo(file);
	//	}
	//	return null;
	//}
	
	var exports = {
		onClickPopMenu : onClickPopMenu,
		FileBind:FileBind,
		FileInfo:FileInfo,
		WriteFile:WriteFile,
		ReadFile:ReadFile,
		NetilerDataBase:NetilerDataBase
	}
	Object.keys(exports).forEach(function(key, i){
		 window[key] = exports[key];
	});
})();
