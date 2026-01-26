/**
 * @fileOverview 现在起一个UI中间件作用。①对NetilerUI与predator.js进行扩展。②对一些常用UI进行封装以提供js调用接口
 * @author fqhunter leadal
 * @created 2014-09-26
 */

;(function(window){
    var $request = {
	    jservice : function(service, med, params, callback, loadingConfig) {
	        preq.jservice(service, med, params, callback, loadingConfig);
	    }
	}
	
	var $backevent = {
	    events : [],
	    reg : function(event) {
	        if (typeof MobileWindow == 'undefined') {
	            return;
	        }
	        var events = this.getEvents();
	        events.push(event);
	    },
	    back : function(e) {
	        if (typeof MobileWindow == 'undefined') {
	            return;
	        }
	        var events = this.getEvents();
	        if (events.length > 0) {
	            var event = events[events.length - 1];
	            if (event) {
	                var ret = event(e);
	                if (ret) {
	                    events.pop();
	                }
	            }
	        }
	    },
	    getEvents : function() {
	        var win = top;
	        if (probot.isNetilerBrowser()) {
	            win = chrome.window;
	        }
	        var events = this.events;
	        if (win.$backevent) {
	            events = win.$backevent.events;
	        }
	        return events;
	    },
	    pop : function() {
	        if (typeof MobileWindow == 'undefined') {
	            return;
	        }
	        var events = this.getEvents();
	        events.pop();
	    }
	}
	
	var GetRequest = function(queryString) {
    	if(!queryString){
    		queryString = location.search;
    	}
	    var theRequest = {};
	    if (queryString.indexOf("?") !== -1) {
	        var str = decodeURIComponent(queryString.substr(1));
	        var strs = str.split("&");
	        for (var i = 0; i < strs.length; i++) {
	            var search_arr = strs[i].split("=");
	            theRequest[search_arr[0]] = search_arr[1];
	        }
	    }
	    return theRequest;
	}
	
	var $refresh = {
	    callbacks : {},
	    keys : {},
	    doBind : false,/*该页面是否做过beforeunload关闭页面事件绑定*/
		/**
		 * 获取顶层窗口
		 */
	    topWin : function() {
	    	/**
		 * 判断
		 * navigator.userAgent.indexOf("netiler")
		 * 使用谷歌浏览器，chrome调不到方法报错处理
		 * 
		 * **/
	    	if(typeof chrome!='undefined' && (navigator.userAgent.indexOf("netiler")!=-1)){
	    		var win = chrome.findWindow('cis_footer');
	    		if(win){
	    			return win;
	    		}
	    	}
	        return $window.top();
	    },
		/**
		 * 向顶级窗口注册回调
		 * @param key 现在命名格式统一为`app.产品名.模块名.具体业务作用`，如`app.top.jse.getEtherpadInfo`
		 */
	    bind : function(key, callback) {
	        var win = this.topWin();
	        var callbacks = win.$refresh ? win.$refresh.callbacks : this.callbacks/*顶层窗口中不存在$refresh对象，即未引入netilerUI框架*/;
	        
	        $refresh.keys[key] = key;
	        callbacks[key] = callback;
	        if (!this.doBind) {
	            this.doBind = true;
				if (typeof MobileWindow != 'undefined') {//beforeunload在E人E本兼容存在问题
					return true;
				}
				//窗口关闭前清除bind的events
				window.addEventListener("beforeunload", function() {
					try {
						for ( var key in $refresh.keys) {
							delete callbacks[key];
						}
					} catch (e) {
						console.warn(e);
					}
					return true;
				});
	        }
	    },
	    unbind : function(key) {
	        var win = this.topWin();
	        var callbacks = $refresh.callbacks;
	        if (win.$refresh) {
	            callbacks = win.$refresh.callbacks;
	        }
	        for (var i = 0; i < arguments.length; i++) {
	            var arg = arguments[i];
	            var cb = callbacks[arg];
	            if (cb) {
	                delete callbacks[arg];
	            }
	        }
	    },
	    /**
	     * 触发之前绑定到顶层窗口的方法。
	     * 接收多个参数。可以是连续的key，每个key后面都可以选择性地跟一个fn做参数，该fn返回值为数组（将作为对应的回调的参数传入）
	     */
	    notify : function() {
	        var win = this.topWin();
	        var callbacks = this.callbacks;
	        if (win.$refresh) {
	            callbacks = win.$refresh.callbacks;
	        }
	        var cbArg = null;
	        for (var i = arguments.length - 1; i >= 0; i--) {
	            var arg = arguments[i];
	            if (probot.isFun(arg)) {
	                cbArg = arg.call();
	            }
	            var cb = callbacks[arg];
	            if (cb) {
	                try {
	                    if (probot.isValid(cbArg)) {
	                        if (!probot.isValidArr(cbArg)) {
	                            cbArg = [cbArg];
	                        }
	                        return cb.apply(this, cbArg);
	                    } else {
	                        return cb();
	                    }
	                } catch (e) {
	                    console.error(e);
	                    delete callbacks[arg];
	                }
	            }
	        }
	    },
	    notifyAll : function() {
	        var win = this.topWin();
	        var callbacks = this.callbacks;
	        if (win.$refresh) {
	            callbacks = win.$refresh.callbacks;
	        }
	        for (var key in callbacks) {
	            var cb = callbacks[key];
	            if (cb) {
	                try {
	                    cb();
	                } catch (e) {
	                    delete callbacks[key];
	                }
	            }
	        }
	    },
	    /**
	     * @description 在$refresh绑定的回调方法资源池中，选择方法名以特定字符串开头的方法，并调用执行。
	     * @param {String}
	     *            str_start:在回调方法资源池中，检索以此字符串开头的方法名
	     * @param 第二参数往后:绑定的回调函数调用时将会接收的参数
	     */
	    notifyFor : function(str_start) {
	        if (typeof str_start != "string") {
	            console.warn("第一个参数必须为字符串类型");
	            return;
	        }
	        var win = this.topWin();
	        var callbacks = this.callbacks;
	        if (win.$refresh) {
	            callbacks = win.$refresh.callbacks;
	        }
	        var args = [].slice.call(arguments, 1);
	        for (var key in callbacks) {
	            if (key.indexOf(str_start) == 0) {
	                var cb = callbacks[key];
	                console.log(cb)
	                if (cb) {
	                    try {
	                        cb.apply(null, args);
	                    } catch (e) {
	                        // alert(e);
	                    }
	                }
	            }
	        }
	    }
	}
	
	var $util = {
	    _fileSizeSymbols : ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'],
	    /**
	     * 格式化文件大小
	     * 
	     * @param {}
	     *            bytes
	     * @return {}
	     */
	    formatFileSize : function(bytes) {
	        var i = -1;
	        do {
	            bytes = bytes / 1024;
	            i++;
	        } while (bytes > 1024);
	
	        return Math.max(bytes, 0.01).toFixed(2) + $util._fileSizeSymbols[i];
	    },
	    /**
	     * 循环做某事
	     */
	    recycle : function(callback, config){
	    	if(!probot.isFun(callback)){
	    		throw new Error("第一个参数必须为function类型");
	    	}
	    	var defaultConfig = {
	    		maxTime : 3000,/*以毫秒为单位*/
	    		interval : 100,/*轮询间隔*/
	    		isDoFirst : false/*是否事先执行回调*/
	    	}
	    	config = {
	    		maxTime : config && (config.maxTime || defaultConfig.maxTime),
	    		interval : config && (config.interval || defaultConfig.interval),
	    		isDoFirst : config && (config.isDoFirst || defaultConfig.isDoFirst)/*进入循环之前就执行一次回调*/
	    	}
	    	var start = Date.now();
	    	var duration = 0;/*以经过的时间*/
	    	var exceedLimit/*检测是否超出范围*/ = function(){
	    		if(duration >= config.maxTime){
	    			return true;
	    		}else{
	    			return false;
	    		}
	    	}
	    	
			if(config.isDoFirst && callback()){
				return;
			}
			
			var intervalHandler = setInterval(function(){
	    		duration = Date.now() - start;
	    		if(exceedLimit()){
		    		clearInterval(intervalHandler);
	    			return;
	    		}
	    		callback() && clearInterval(intervalHandler);
	    	}, config.interval);
	    },
	    /**
	     * 用函数去抖的方式调用函数（应对高频事件）
	     * 当函数不再持续触发并且过了指定的一段时间后再执行,非常适用于scroll事件
	     */
	    debounce : function(method, timeGap, context){
	    	if(!probot.isFun(method)){
	    		throw new Error("method param must be a function");
	    		return;
	    	}
	    	timeGap = probot.isNum(timeGap) ? timeGap : 200;
	    	context = context || this;
	    	clearTimeout(method.tID);
	    	method.tID = setTimeout(function(){
	    		method.call(context);
	    	}, timeGap);
	    },
	    /**
	     * 获取函数节流后的函数（应对高频事件）
	     * 用以控制函数调用频率。先触发，然后在指定的一段时间内再触发该方法将无效，等过了这段时间再次触发将有效
	     * @return {Function}
	     */
	    getThrottleFn : function(method, timeGap, context/*opt*/){
	    	if(!probot.isFun(method)){
	    		throw new Error("method param must be a function");
	    		return;
	    	}
	    	timeGap = probot.isNum(timeGap) ? timeGap : 200;
	    	context = context || this;
	    	var lastTime = 0;
	    	return function(){
	    		var now = Date.now();
	    		if(now - lastTime < timeGap){
	    			return;
	    		}
	    		lastTime = now;
	    		method.apply(context, arguments);
	    	}
	    }
	}
	
	/**
	 * 专门应对Netiler Browser终端打开窗口问题
	 */
	var $win = {
	    platform : (navigator.platform.indexOf("Linux") != -1)  && (navigator.userAgent.indexOf("@leadal") == -1) ? true : false,
	    open : function(httpURL, winName, width, height, left, top) {
	    		httpURL = NetilerUI.resetURL(httpURL);
	        if ($win.platform) {
	            httpURL = NetilerUI.resetURL('/netiler.ui/comm/linuxOpen.nsp?url=') + decodeURIComponent(httpURL);
	        }
	        if(probot.isNetilerBrowser()){
		        chrome.open(httpURL, winName, width, height, left, top);
	        }
	    },
	    openSelf : function(httpURL, winName, width, height, left, top) {
            httpURL = NetilerUI.resetURL(httpURL);
	    	if(probot.isNetilerBrowser()){
	        	chrome.open(httpURL, winName, width, height, left, top);
	    	}
	    },
	    /**
	     * 与open的区别在于：openWindow打开窗口是不透明的，open打开窗口是透明的
	     */
	    openWindow : function(httpURL, winName, width, height, left, top) {
            httpURL = NetilerUI.resetURL(httpURL);
	    	if(probot.isNetilerBrowser()){
	        	chrome.openWindow(httpURL, winName, width, height, left, top);
	    	}
	    },
	    /**
	     * 与showDialog区别 open为非透明 show为透明
	     */
	    openDialog : function(httpURL, dialogArguments, width, height, left, top) {
            httpURL = NetilerUI.resetURL(httpURL);
	    	if(probot.isNetilerBrowser()){
	        	chrome.openDialog(httpURL, dialogArguments, width, height, left, top);
	    	}
	    },
	
	    /**
	     * 打开对话框。与showModalDialog的区别在于blur的时候，普通对话框窗口会最小化，而漠视对话框不会。
	     */
	     //TODO showDialog _+ resetURL
	    showDialog : function(httpURL, dialogArguments, width, height, left, top) {
	    	httpURL = NetilerUI.resetURL(httpURL);
	        if ($win.platform) {
	            httpURL = '/netiler.ui/comm/linuxOpen.nsp?url=' + NetilerUI.resetURL(decodeURIComponent(httpURL));
	        }
	        if(probot.isNetilerBrowser()){
	        	chrome.showDialog(httpURL, dialogArguments, width, height, left, top);
	        }
	    },
	    /**
	     * 打开模式对话框。blur的时候，模式对话框窗口不最小化。
	     */
	    showModalDialog : function(httpURL, dialogArguments, width, height, left, top) {
            httpURL = NetilerUI.resetURL(httpURL);
	        if ($win.platform) {
	            httpURL = NetilerUI.resetURL('/netiler.ui/comm/linuxOpen.nsp?url=') + NetilerUI.resetURL(decodeURIComponent(httpURL));
	        }
	        if(probot.isNetilerBrowser()){
	        	chrome.showModalDialog(httpURL, dialogArguments, width, height, left, top);
	        }
	    },
	    /**
	     * 在客户端原生chrome.openDialog和chrome.showDialog进一步封装
	     * 
	     */
	    openWin : function(config) {
            var url =probot.isFalse(config.isResetUrl) ? config.url : NetilerUI.resetURL(config.url);
            var winName = config.caption;
	        var width = config.width;
	        var height = config.height;
	        var top = config.top;
	        var left = config.left;
	        var register = config.register;
	        var data = config.data;/*支持皮肤设置 config.data = {bgColor : "",bodyBgAlpha: ""}*/
	        var minimize = (data && probot.isBol(data.minimize)) ? data.minimize : false;
	        var winEvents = config.winEvents;
	        var openWindow = probot.isValid(config.openWindow) ? config.openWindow : false;/*是否打开不透明窗口，true为不透明*/
	        if (url.toLowerCase().indexOf('https') == 0 && probot.isNetilerBrowser() && chrome.addCert) {
	            chrome.addCert(url);
	        }
	        var reg/*是否执行chrome.regWindow操作*/ = typeof(register) != 'undefined' ? register : true;
	        if (probot.isNetilerBrowser()) {
	            var win = chrome.findWindow(winName);
	            if (win && reg) {
	                win.chrome.show();
	            } else {
	                if (openWindow) {
	                    $win.openDialog(NetilerUI.resetURL('/netiler.ui/comm/commOpenWin.nsp'), {
	                                caption : winName,
	                                url : url,
	                                reg : reg,
	                                winEvents : winEvents,
	                                data : data,
	                                minimize : minimize
	                            }, width, height, left, top);
	                } else {
	                    $win.showDialog(NetilerUI.resetURL('/netiler.ui/comm/commWin.nsp'), {
	                                caption : winName,
	                                url : url,
	                                reg : reg,
	                                winEvents : winEvents,
	                                data : data,
	                                minimize : minimize
	                            }, width, height, left, top);
	                }
	            }
	        }
	    }
	}
	
	var $window = {
	
	    activeChrome : function() {
	        if (probot.isNetilerBrowser()) {
	            try {
	                var switchWin = chrome.findWindow('SwitchWindow');
	                if (switchWin && switchWin.window) {
	                    var switchUI = switchWin.document.getElementsByTagName('WORKSPACE:SWITCH')[0];
	                    if (switchUI) {
	                        switchUI.showApp();
	                    }
	                } else {
	                	var suspensionWin = chrome.findWindow('suspensionWin');
	                	//主要兼容desktop那最小化后点击消息再最小化无效问题
	                	if(typeof suspensionWin != "undefined"){
	                		suspensionWin.showDesktop();
	                	}else{
	                		var netilerWin = chrome.findWindow('NetilerWindow');
	                		if (netilerWin && netilerWin.window) {
	                			netilerWin.chrome.show();
	                		} else {
	                			
	                		}
	                	}
	                	
	                }
	            } catch (e) {
	
	            }
	        }
	    },
	    /**
	     * 请求地址
	     * 
	     * @param {}
	     *            url
	     * @param {}
	     *            cb
	     */
	    requestUrl : function(url, cb, errorcb) {
	        var xmlhttp = null;
	        var stateChange = function() {
	            if (xmlhttp.readyState == 4) {// 4 = "loaded"
	                if (xmlhttp.status == 200) {// 200 = "OK"
	                    if (cb) {
	                        cb.call(this, xmlhttp.responseText);
	                    }
	                } else {
	                    // alert("Problem retrieving data:" + xmlhttp.statusText);
	                    if (errorcb) {
	                        errorcb.call(this);
	                    }
	                }
	            } else {
	            }
	        }
	        if (window.XMLHttpRequest) {// code for Firefox, Opera, IE7, etc.
	            xmlhttp = new XMLHttpRequest();
	        } else if (window.ActiveXObject) {// code for IE6, IE5
	            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	        }
	        if (xmlhttp != null) {
	            xmlhttp.onreadystatechange = stateChange;
	            xmlhttp.open("GET", url, true);
	            xmlhttp.send(null);
	        } else {
	            alert("Your browser does not support XMLHTTP.");
	        }
	    },
	    /**
	     * 获取顶级窗口。网页环境下正常获取，客户端环境优先选取即时通讯和门户的主窗口，如果没有再获取相对当前chrome的顶级窗口。
	     * @param isTopWindowInChrome 是否获得相对当前chrome窗口顶级window
	     */
	    top : function(isTopWindowInChrome/*该参数仅作框架内部使用*/) {
	        isTopWindowInChrome = probot.isBol(isTopWindowInChrome) ? isTopWindowInChrome : false;
	        
	        // 兼容网页
	        var win = top;
	        // 兼容客户端
	        if (probot.isNetilerBrowser()) {
	            if(isTopWindowInChrome === true){
	                win = chrome.window;
	            }else{
	                //Netiler客户端环境下的窗口名：NetilerWindow(门户)|mainPanelWin(即时通讯)
	                win = chrome.findWindow('NetilerWindow') || chrome.findWindow('mainPanelWin') || chrome.findWindow("desktopMiniWin");
                    win = win || chrome.window;
	            }
	        }
	        // 兼容跨域问题
	        try {
	            win.location.href; // 跨域无法读取属性
	        } catch (e) {
	            var _win = window;
	            try {
	                while (_win.parent && _win.parent.location.href && _win.parent.location.href != _win.location.href) {
	                    // 顶层窗口的parent.location.href还是它自己
	                    _win = _win.parent;
	                }
	            } catch (e) {
	                return _win;
	            }
                return _win;
	        }
	        
	        return win;
	    },
	    /**
	     * 获取顶级窗口。网页环境下正常获取，客户端环境下获取相对当前chrome的顶级窗口。
	     */
	    topWindowInChrome : function() {
	        var isTopWindowInChrome = true,
	            win = this.top(isTopWindowInChrome);
	        
	        return win;
	    },
	    /**
	     * 渲染popup底部左侧额外的内容(目前只做UI渲染，不支持事件绑定)
	     * 
	     * @param {DOMElement}
	     *            uiPopup
	     * @param {Object}
	     *            model `$window.popup`中extBar字段对应的数据
	     */
	    _renderPopupExtBar : function(uiPopup, model) {
	        var _p = $p(uiPopup).$("+popup:extBar");
	        if (probot.isArr(model)) {
	            var tagName, attrs;
	            model.forEach(function(uiTag, index) {
	                        _p.$("+" + uiTag.tag).attrs(uiTag.attrs).render().$$();
	                    })
	        } else if (probot.isObj(model)) {
	            _p.html(model.html)
	        }
	        _p.$$end();
	    },
	    /**
	     * popup方法中的内部使用方法，禁止外部调用
	     */
	    _setUrl2defConfig : function(defConfig){
	    	defConfig = probot.isObj(defConfig) ? defConfig : {};
	    	/*added at 2017-3-31 应对模块克隆需求*/
	    	var getNspName = function(url){
	        	if(url.indexOf('.nsp')!=-1){
	        	  	 var nspName = url.substring(0,url.indexOf('.nsp'));
	        	     nspName = nspName.substring(nspName.lastIndexOf('/')+1);
	        	     return nspName;
	            }else{
	            	return url + "index.nsp";/*added at 2017-4-14 应对这种不以nsp结尾的url，如`http://localhost:8080/saloon.home/`*/
	            }
	        }
	        
	    	var localUrl = window.location.href;
			var localNspName = getNspName(localUrl);
			var cloneCharIndex = localNspName.indexOf('@');
			if (cloneCharIndex != -1) {
				var cloneName = localNspName.substr(cloneCharIndex + 1);
				var openNspName = getNspName(defConfig.url);
				defConfig.url = defConfig.url.replace(openNspName + ".nsp",
						openNspName + '@' + cloneName + '.nsp');
			}
			
			return defConfig;
	    },
	    /**
	     * 弹出窗口
	     */
	     //TODO popup_+resetURL
	    popup : function(params) {
	    	var hasResetURL=false;
	    	if(params.noNameSpace==true || params.noNameSpace=="true"){
	    		params.url=params.url;
	    	}else{
	    		params.url=NetilerUI.resetURL(params.url);
	    		hasResetURL=true;
	    	}
	        var defConfig = {
	            caption : params.caption,
	            content : params.content,
	            beforeClose : params.beforeClose,
	            url : params.url,
	            loadMode : probot.isValid(params.loadMode) ? params.loadMode : "default",
	            icon : params.icon,
	            win : params.win,
	            msg : params.msg,
	            captionAlign : params.captionAlign,
	            layer : probot.isTrueFalse(params.layer) ? params.layer : true,
	            width : params.width,
	            height : params.height,
	            btnBar : params.btnBar,
	            dataParams : params.dataParams,
	            place : params.place ? params.place : 8,
	            extBar : params.extBar,
	            top : params.top,
	            right : params.right,
	            bottom : params.bottom,
	            left : params.left,
	            dragable : params.dragable === false ? false : true,
	            frameName : null,
	            hasFoot : false,
	            footerBg : params.footerBg,
	            noNameSpace : params.noNameSpace,
	            renderBody : params.renderBody,
	            basePath : params.basePath ? params.basePath :  "",//指定前缀
	            reload : params.reload ? params.reload : "",//是否需要重载（主要针对前一个basePath路径出错问题）
	            noBorder : params.noBorder,
	            hasResetURL : hasResetURL,
	            "class" : params.cls
	        }
	        //todo
			defConfig = this._setUrl2defConfig(defConfig);
	  
	        if (probot.isValid(defConfig.btnBar) == true) {
	            defConfig.hasFoot = true;
	        }
	        if (probot.isValid(defConfig.url)) {
	            defConfig.frameName = probot.isValid(params.frameName) ? params.frameName : putil.id('iframe');
	        }
	
	        var win = defConfig.win || $window.topWindowInChrome();
	        var frameName = defConfig.frameName;
	        var isIframe = false;
	        if (probot.isValid(defConfig.url)) {
	            try {
	                delete win.frames[frameName];
	            } catch (e) {
	                win.frames[frameName] = null;
	            }
	            isIframe = true;
	        }
	        var _p = $p(win.document.body);
	        if (defConfig.layer) {
	            _p.layer(true, win);
	        }
	
	        //为窗口绑定键盘事件
	        var enter_keydown = null, esc_keydown = null;
	        var removeEventHandler = function() {
	            if (typeof enter_keydown === "function") {
	                window.removeEventListener("keydown", enter_keydown, false);
	                $window.topWindowInChrome().removeEventListener("keydown", enter_keydown, false);
	            }
	            if (typeof esc_keydown === "function") {
	                window.removeEventListener("keydown", esc_keydown, false);
	                $window.topWindowInChrome().removeEventListener("keydown", esc_keydown, false);
	            }
	        }
	        
	        var content = defConfig.content;
	        delete defConfig.content;/*删除是因为没有必要写到ui:popup属性上*/
	        
	        //解决海泰浏览器插件层级太高问题
	        if(navigator.userAgent.indexOf("netiler")==-1){
		        $refresh.notifyFor("pdfFrame.hide");
	        }
	        
	        //处理ui:popup
	        _p.$('+ui:popup').attrs(defConfig).cfg({
	                    'opener' : window,
	                    'layerwin' : win,
	                    'beforeClose' : probot.isFun(defConfig.beforeClose) ? function(){
	                                        defConfig.beforeClose.call(this);
	                                        removeEventHandler();
	                                        //解决海泰浏览器插件层级太高问题
	                                        if(navigator.userAgent.indexOf("netiler")==-1){
	                                        	var winTop = $window.top();
	                                        	var popTagArr = winTop.document.getElementsByTagName("ui:popup");
	                                        	//最后一个弹窗的时候再开启
	                                        	if(popTagArr.length==1){
			                                        $refresh.notifyFor("pdfFrame.show");
	                                        	}
	                                        }
	                                    } : function(){
	                                        removeEventHandler();
	                                        //解决海泰浏览器插件层级太高问题
	                                        if(navigator.userAgent.indexOf("netiler")==-1){
	                                        	var winTop = $window.top();
	                                        	var popTagArr = winTop.document.getElementsByTagName("ui:popup");
	                                        	//最后一个弹窗的时候再开启
	                                        	if(popTagArr.length==1){
		                                        	$refresh.notifyFor("pdfFrame.show");
	                                        	}
	                                        }
	                                    },
	                    'loadMode' : defConfig.loadMode
	                }).style({
	                    display:"none"/*防止加入后产生滚动条*/
	                }).ready(function(){
	                    this.css({
	                        display:null
	                    })
	                });
	        var uiPopup = _p.ele();
	        //处理popup:body
	        if (probot.isValid(content)) {
	            _p.$('+popup:body').ready(function() {
	                        /* ready的目的是应对当iframe层级过深时,netiler客户端css重绘重排导致页面闪动*/
	                        this.html(content);
	                        this.enter_keydown = enter_keydown;
	                        this.esc_keydown = esc_keydown;
	                    });
	            _p.$$();
	        } else if (probot.isFun(defConfig.renderBody)) {
	            _p.$('+popup:body');
	            _p.$$();
	            defConfig.renderBody.call(_p.ele());
	        }
	
	        var extBar = defConfig.extBar;
	        if (typeof extBar === "object") {
	            this._renderPopupExtBar(uiPopup, extBar);
	        }
	
	        //处理popup:bar
	        var btnBar = defConfig.btnBar;
	        if (probot.isArr(btnBar)) {
	            _p.$('+popup:bar');
	            btnBar.forEach(function(btn, index) {
	                        var tag = btn.tag || 'btn:blue';
	                        var callback = function() {
	                                    btn.callback.call(isIframe ? win.frames[frameName] : uiPopup, uiPopup);
	                                }
	                                
	                        if(btn.keydown==="esc"){
					            esc_keydown = function(e) {
					                e.keyCode === 27 && callback();
					            }
					            window.addEventListener("keydown",esc_keydown,false);
					            $window.topWindowInChrome().addEventListener("keydown",esc_keydown,false);
					        }else if(btn.keydown==="enter"){
					            enter_keydown = function(e) {
					                e.keyCode === 13 && callback();
					            }
					            window.addEventListener("keydown",enter_keydown,false);
					            $window.topWindowInChrome().addEventListener("keydown",enter_keydown,false);
					        }
					        
	                        _p.$('+' + tag).attrs({
	                                    caption : btn.caption,
	                                    icon : btn.icon
	                                }).click(callback).ref('doRender');
	                        _p.$$();
	                    });
	            _p.$$();
	        }else if(btnBar === void 0){
	            //按下esc键关闭弹出窗
	            esc_keydown = function(e) {
	                e.keyCode === 27 && uiPopup.close();
	            }
	            window.addEventListener("keydown",esc_keydown,false);
	            $window.topWindowInChrome().addEventListener("keydown",esc_keydown,false);
	        }
	        
	        _p.ready(function(){
	        	this.esc_keydown = esc_keydown;
	        	this.enter_keydown = enter_keydown;
	        }).ref('doRender');
	        _p.$$end();
	        
	        return uiPopup;
	    },
	    /**
	     * 确认框
	     * 
	     * @param {String}
	     *            content 提示信息
	     * @param {Function}
	     *            callBack 点击确定按钮时，触发的函数
	     * @param {Function}
	     *            beforeClose 在关闭之前所要做的事情
	     * @param {Object}
	     *            config:配置属性。以后confirm新增添的属性都往这里面塞，不要再另加形式参数。最佳实践：以后编写API只暴露config一个参数（或预留出config参数）即可，有效避免参数过多的问题
	     */
	    confirm : function(content, callBack, beforeClose, config) {
	        var enter_keydown = null; // 绑定回车事件
	        var esc_keydown = null; // 绑定esc事件
	        config= config ? config : {};// filter null、undefined
	        config = { // 统一汇集成对象形式，使得整个代码易读。之后每添加一个配置属性都往这里面塞。
	            okLabel : probot.isValid(config.okLabel) ? config.okLabel : '确定',
	            cancelLabel : probot.isValid(config.cancelLabel) ? config.cancelLabel : '取消',
	            closeCB : probot.isFun(config.closeCB) ? config.closeCB : null, // 点击取消按钮时执行的回调
	            caption : probot.isStr(config.caption) ? config.caption : '消息提示', // 弹出框左上角的标题
	            width : probot.isValid(config.width) ? config.width : '360px',
	            height : probot.isValid(config.height) ? config.height : '220px',
	            top : probot.isValid(config.top) ? config.top : null,
	            icon : probot.isStr(config.icon) ? config.icon : 'msg-confirm', // 左上角icon图标
	            dragable : probot.isBol(config.dragable) ? config.dragable : true,
	            win : probot.isValid(config.win) ? config.win : null,
	            btnBar : probot.isArr(config.btnBar) ? config.btnBar : (probot.isArr(callBack) ? callBack : [])// 底部按钮
	        }
	
	        if (probot.isArr(config.btnBar) && config.btnBar.length === 0) {
	            var callback_cancel = probot.isFun(config.closeCB) ? function(popup) {
	                config.closeCB.apply(this, arguments);
	                popup.close();
	            } : function(popup) {
	                popup.close();
	            }
	            var callback_sure = probot.isFun(callBack) ? function(popup) {
	                callBack.apply(this, arguments);
	                popup.close();
	            } : function(popup) {
	                popup.close();
	            }
	            config.btnBar = [{
	                        caption : config.okLabel,
	                        callback : callback_sure,
	                        keydown : "enter"
	                    }, {
	                        tag : 'btn:red',
	                        caption : config.cancelLabel,
	                        callback : callback_cancel,
	                        keydown : "esc"
	                    }];
	        }
	        content = '<div class="a-table"><div class="a-table-cell" style="font-size:16px">' + content + '</div></div>';
	        this.open({
	                    content : content,
	                    place : 8,
	                    beforeClose : beforeClose,
	                    caption : config.caption,
	                    width : config.width,
	                    height : config.height,
	                    top : config.top,
	                    icon : config.icon,
	                    dragable : config.dragable,
	                    btnBar : config.btnBar,
	                    win : config.win
	                });
	    },
	
	    // 消息框
	    msg : function(content, btnBar) {
	        var renderBody;
	        if (probot.isFun(content)) {
	            renderBody = content;
	            content = undefined;
	        } else {
	            content = '<div class="a-table"><div class="a-table-cell">' + content + '</div></div>';
	        }
	
	        this.open({
	                    caption : '消息提示',
	                    content : content,
	                    renderBody : renderBody,
	                    btnBar : btnBar,
	                    place : 4,
	                    layer : false,
	                    width : '300px',
	                    height : '180px',
	                    msg : 'true',
	                    'icon' : 'msg-info'
	                });
	    },
	    // 消息列表
	    msglist : function(jservice, jmethod, jparams, render, events) {
	        render = probot.isFun(render) ? render : function(panel, data) {
	            var _p = panel.$p();
	            _p.$('+block:msg-list').cfg({
	                        'block' : panel.block
	                    }).attrs({
	                        type : 'mail',
	                        caption : '消息内容',
	                        time : '01-05'
	                    }).render().$$();
	            _p.$$end();
	        };
	        events = events ? events : {
	            del : function(data, block) {
	                this.del(block);
	            },
	            click : function(data) {
	                alert($o(data).toJSON())
	            },
	            more : function() {
	
	            }
	        };
	        $window.msg(function() {
	                    var p = this.$p();
	                    p.$('+div').style({
	                                width : '100%',
	                                height : '25px',
	                                lineHeight : '25px',
	                                bottom : '0',
	                                position : 'absolute',
	                                borderTop : '1px solid #ccc',
	                                overflow : 'auto'
	                            }).$('+span').css('msg-btn lf', +1).html('忽略全部').attachEvent('click', function() {
	                            }).$$().$('+span').css('msg-btn rf', +1).html('更多').$$(2);
	                    p.$('+div').style({
	                                width : '100%',
	                                top : '0',
	                                bottom : '26px',
	                                position : 'absolute',
	                                overflow : 'auto'
	                            });
	                    p.$('+ui:blocks').attrs({
	                                delAuto : "false",
	                                clickAuto : "true",
	                                islist : "true",
	                                "render" : 'true',
	                                "jservice" : jservice,
	                                "jmethod" : jmethod,
	                                "jparams" : jparams
	                            }).tagRender(render).tagEvents(events).render();
	
	                    p.$$end();
	                });
	    },
	    // 操作提示
	    alert : function(info, type, second, color) {
	        if(typeof MobileWindow != 'undefined' && MobileWindow.toast){
	        	MobileWindow.toast(info);
	        	return ;
	        }
	    	var win = $window.topWindowInChrome();
	        if (win && typeof win.$window != "undefined") {
	            win.msgBox.fadeIn(info, type, second, color);
	        } else {
	            msgBox.fadeIn(info, type, second, color);
	        }
	    },
	    // 打开窗口
	    open : function(caption, url, width, height, frameName, beforeClose, extBar, dataParams, win, noNameSpace) {
	    	var params;
	        if (!probot.isStr(caption)) {
				//add NetilerUI.resetURL(c
	        	//在下方执行popup的时候有经过设置，所以此处无需加重设url
//	        	if(caption&&caption.url){
//	        		if(caption&&caption.noNameSpace==true || caption&&caption.noNameSpace=="true"){
//			        	caption.url = caption.url;
//			        }else{
//			        	caption.url = NetilerUI.resetURL(caption.url);
//			        }
//	        	}
	            params = caption;
	        } else {
	        	//在下方执行popup的时候有经过设置，所以此处无需加重设url
//		        if(noNameSpace&&noNameSpace==true || noNameSpace&&noNameSpace=="true"){
//		        	url = url;
//		        }else{
//		        	url = NetilerUI.resetURL(url);
//		        }
	            params = {
	                caption : caption,
	                url : url,
	                frameName : frameName,
	                width : width,
	                height : height,
	                beforeClose : beforeClose,
	                extBar : extBar,
	                win : win,
	                dataParams : dataParams,
	                noNameSpace : noNameSpace
	            }
	        }
	        return this.popup(params);
	    },
	    /**
	     * 声音提醒
	     * 
	     * @param soundSrc
	     */
	    soundAlert : function(soundSrc) {
	
	        if (this.soundAlertRun) {
	            return;
	        }
	
	        this.soundAlertRun = true;
	
	        var audio = netiler.$('#soundAlertAudio');
	
	        if (audio) {
	            audio.remove();
	        }
	        audio = document.createElement('audio');
	        audio.attr('id', 'soundAlertAudio');
	        audio.attr('autoplay', 'true');
	        audio.attr('style', 'display:none');
	        audio.attr('controls', 'controls');
	
	        var html = '<source src="' + soundSrc + '" type="audio/ogg" />';
	        audio.html(html);
	        document.body.appendChild(audio);
	
	        this.soundAlertRun = false;
	    },
	
	    getGrid : function() {
	        var obj = this._getByTagName('UI:GRID');
	        if (obj == null) {
	            obj = this._getByTagName('PX:GRID');
	            if (obj == null) {
	                obj = this._getByTagName('UI:TREEGRID');
	            }
	        }
	        return obj;
	    },
	
	    getBlocks : function() {
	        return this._getByTagName('UI:BLOCKS');
	    },
	
	    getForm : function() {
	        return this._getByTagName('UI:FORM');
	    },
	
	    getTreepanel : function() {
	        return this._getByTagName('UI:TREEPANEL');
	    },
	
	    _getByTagName : function(name) {
	        var tags = document.getElementsByTagName(name);
	        if (tags.length == 0) {
	            return null;
	        } else if (tags.length == 1) {
	            return tags[0];
	        } else {
	            return tags;
	        }
	    },
	
	    getCookie : function(name) {
	        var strCookie = document.cookie;
	        var arrCookie = strCookie.split("; ");
	        for (var i = 0; i < arrCookie.length; i++) {
	            var c = arrCookie[i];
	            var index = c.indexOf("=");
	            var key = c.substr(0, index);
	            var value = c.substr(index + 1);
	            if (key == name) {
	                return value;
	            }
	        }
	        return "";
	    },
	    /**
	     * 返回当前阅读器对象(通过该对象，可调用close方法进行关闭)；
	     * 
	     * @method reader
	     * 
	     * @param {
	     *            Function|Array } data 加载数据方法或图片数据数组
	     * 
	     * 
	     * @param {Function}
	     *            format 数据格式化
	     * 
	     * 
	     * @param {Function}
	     *            callback 渲染结束回调函数
	     * 
	     * 
	     * @param {int}
	     *            zIndex 第几层
	     * 
	     * @return { plugins.reader } 阅读器对象
	     *         @example
	     *         ```javascript
	     * 数据格式 {
	     *           url : 'http://127.0.0.1:8080/com.leadal.px.ui/examples/plugins/scheduler/index.html',
	     *           width : 1440,
	     *           height : 710,
	     *           contentType : 'html'
	     *           }
	     * 1、$window.reader(function(){ this.jservice('jservice','jmathod',parames)} );
	     * 
	     * 2、$window.reader(function(){ this.data([{},{},{}])} );
	     * 
	     * 3、$window.reader([{},{},{}]);
	     * 
	     * 界面例子URL:/netiler.ui/demo/plugins/reader.nsp
	     * ```
	     */
	    reader : function(data, format, callback, zIndex) {
	        var p = document.body.$p();
	        p.$('+plugins:reader');
	        if (zIndex) {
	            p.attrs({
	                        zIndex : zIndex
	                    });
	        }
	        if (probot.isFun(format)) {
	            p.dformat(format);
	        }
	        p.set('data', data).ready(callback).render().$$end();
	    },
	
	    /**
	     * 上传文件
	     * 
	     * @param file
	     *            input file对象
	     * @param uploadUrl
	     *            上传地址
	     * @param args
	     *            其他参数 以对象{'key':'value'}形式提供
	     * @param callback
	     *            上传完回调
	     */
	    upload : function(file, uploadUrl, args, callback) {
	        if (!file) {
	            $window.alert('no file to upload');
	            return;
	        }
	        if (!uploadUrl) {
	            $window.alert('no desc uploadUrl to upload');
	            return;
	        }
            if(uploadUrl.indexOf("http") == -1) {
    	        uploadUrl =  NetilerUI.resetURL(uploadUrl);
            }
	        var files = file.files;
	
	        var allowExt = file.attr('ext');
	        if (allowExt && allowExt != '') {
	            var extArr = allowExt.split(',');
	            var name;
	            var rightCount = 0;
	            for (var j = 0; j < files.length; j++) {
	                var flag = false;
	                name = files[j].name;
	                name = name.substr(name.lastIndexOf('.') + 1);
	                for (var i = 0; i < extArr.length; i++) {
	                    if (name.toLowerCase() == extArr[i]) {
	                        flag = true;
	                        rightCount++;
	                        break;
	                    }
	                }
	                if (!flag) {
	                    break;
	                }
	            }
	            if (rightCount != files.length) {
	                $window.alert('请上传 ' + allowExt + ' 格式文件', 'info');
	                return;
	            }
	        }
	
	        var fd = new FormData();
	        var fileName = 'uploadFile';
	        if (file.name) {
	            fileName = file.name;
	        }
	
	        for (var i = 0; i < files.length; i++) {
	            fd.append(fileName, files[i]);
	        }
	
	        if (args && typeof args == 'object') {
	            for (var key in args) {
	                fd.append(key, args[key]);
	            }
	        }
	
	        $loading.show('正在上传，请稍后...');
	
	        var xhr = new XMLHttpRequest();
	        
	        xhr.open("POST", NetilerUI.resetURL(uploadUrl));
	        xhr.send(fd);
	
	        var uploadEndEvent = function(e) {
	            var result = e.target.responseText;
	            if (callback) {
	                callback(result);
	            }
	            $loading.hide();
	        }
	
	        var errorEvnt = function(e) {
	            $window.alert('上传失败', 'error');
	            $loading.hide();
	        }
	
	        xhr.addEventListener("load", function(e) {
	                    uploadEndEvent(e);
	                }, false);
	        xhr.addEventListener("error", function(e) {
	                    errorEvnt(e);
	                }, false);
	    },
	    /**
	     * 本地存储
	     */
	    storage : {
	        _validate : function(type) {
	            try {
	                var storage = window[type], x = '__storage_test__';
	                storage.setItem(x, x);
	                storage.removeItem(x);
	                return true;
	            } catch (e) {
	                return false;
	            }
	        },
	        set : function(key, value, isEncrypt) {
	            if (probot.isValid(key) && probot.isValid(value)) {
	                var setItem = function(k, v) {
	                    if ($window.storage._validate("localStorage")) {
	                        var ls = localStorage;
	                        if (probot.isObj(v)) {
	                            v = JSON.stringify(v);
	                        }
	                        ls.setItem(k, v);
	                    }
	                    return $window.storage.get(k);
	                }
	                if (isEncrypt) {
	                    var obj = {};
	                    if (probot.isObj(value)) {
	                        for (var k in value) {
	                            obj[k] = $crypto.aes.encode(value[k]);
	                        }
	                        value = obj;
	                    } else {
	                        value = $crypto.aes.encode(value);
	                    }
	                    return setItem(key, value);
	                } else {
	                    return setItem(key, value);
	                }
	            }
	        },
	        get : function(key, isUnEncrypt) {
	            if (!probot.isValid(key)) {
	                return;
	            }
	            var getItem = function() {
	                var value = null;
	                if ($window.storage._validate("localStorage")) {
	                    var ls = localStorage;
	                    try {
	                        value = JSON.parse(ls.getItem(key));
	                    } catch (e) {
	                        value = ls.getItem(key);
	                    }
	                }
	                return value;
	            }
	            if (isUnEncrypt) {
	                var value = getItem();
	                if (probot.isObj(value)) {
	                    var obj = {};
	                    for (var k in value) {
	                        obj[k] = $crypto.aes.decode(value[k])
	                    }
	                    return obj;
	                } else {
	                    return $crypto.aes.decode(value);
	                }
	            } else {
	                return getItem();
	            }
	        },
	        remove : function(key) {
	            if ($window.storage._validate("localStorage")) {
	                var ls = localStorage;
	                if (probot.isValid(key)) {
	                    ls.removeItem(key);
	                }
	            }
	        }
	    },
	    
	    _attrs_ : {},
	    
	    /**
	     * 设置属性
	     */
	    setAttr : function(key,value){
	        
	        if(key.split('.').length<3){
	            $window.alert('Attribute key must format with product.project.model to be unique');
	            return ;
	        }
	        
	        var win = $window.top();
	        if(value){
	            this._attrs_[key] = value;
	            win.$window._attrs_[key] = value;
	        }else{
	            delete this._attrs_[key];
	            delete win.$window._attrs_[key];
	        }
	        //页面销毁后，移除释放注册的属性。
	        window.addEventListener('beforeunload',function(){
	            for(var key in window.$window._attrs_){
	                delete win.$window._attrs_[key];
	            }
	        });
	    },
	    
	    /**
	     * 获取属性
	     */
	    getAttr : function(key){
	        var win = $window.top();
	        
	        var value =  win.$window._attrs_[key];
	        
	        if(typeof value == 'undefined'){
	            return null;
	        }
	        return value;
	    }
	};
	
	var $crypto = {
	
	    aes : {
	
	        ks : 'bjllOHQ3aTZsNTRlM3J1aQ==',
	        ivs : 'MDEyMzQ1Njc4OTEyMzQ1Ng==',
	        prefix : '{NUIA}',
	
	        /**
	         * @param text
	         *            待加密的串
	         * @param ks
	         *            自定义 key
	         * @param ivs
	         *            自定义 偏移量
	         */
	        encode : function(text, ks, ivs) {
	            if (typeof CryptoJS === 'undefined') {
	                alert('请引入 /com.leadal.netiler.ui/utils/crypto/rollups/aes.js');
	                return;
	            }
	            if (!ks) {
	                ks = this.ks;
	            }
	            if (!ivs) {
	                ivs = this.ivs;
	            }
	            var key = CryptoJS.enc.Utf8.parse(atob(ks));
	            var iv = CryptoJS.enc.Utf8.parse(atob(ivs));
	            var srcs = CryptoJS.enc.Utf8.parse(text);
	            var encrypted = CryptoJS.AES.encrypt(srcs, key, {
	                        iv : iv,
	                        mode : CryptoJS.mode.CBC
	                    });
	            return this.prefix + encrypted.toString();
	        },
	        /**
	         * @param encodeText
	         *            已加密的串
	         * @param ks
	         *            自定义 key
	         * @param ivs
	         *            自定义 偏移量
	         */
	        decode : function(encodeText, ks, ivs) {
	            if (typeof CryptoJS === 'undefined') {
	                alert('请引入 /com.leadal.netiler.ui/utils/crypto/rollups/aes.js');
	                return;
	            }
	            if (!encodeText) {
	                console.log('nothing to decode');
	                return null;
	            }
	            if (!this.isNetilerUIAES(encodeText)) {
	                console.log('text not encode with netilerui aes');
	                return null;
	            }
	
	            encodeText = encodeText.substr(6);
	
	            if (!ks) {
	                ks = this.ks;
	            }
	            if (!ivs) {
	                ivs = this.ivs;
	            }
	            var key = CryptoJS.enc.Utf8.parse(atob(ks));
	            var iv = CryptoJS.enc.Utf8.parse(atob(ivs))
	            var decrypt = CryptoJS.AES.decrypt(encodeText, key, {
	                        iv : iv,
	                        mode : CryptoJS.mode.CBC
	                    });
	            return CryptoJS.enc.Utf8.stringify(decrypt).toString();
	        },
	        /**
	         * 是否为UI AES加密串
	         */
	        isNetilerUIAES : function(encodeText) {
	            if (encodeText.indexOf(this.prefix) === 0) {
	                return true;
	            }
	            return false;
	        }
	    }
	};
	
	var $loading = {
		win : null,/*$loading所在load窗口*/
	    /**
	     * 显示loading信息
	     */
	    show : function(msg, config) {
	    	config = probot.isObj(config) ? config : {};
	        var win = config.win || window;
	        this.win = win;
	        var _p = $p(win.document.body);
	        var loading = netiler.$("#netiler_loading");
	        if (loading) {
	            return;
	        } else {
	            _p.$("+ui:loading").attr({
	                        id : "netiler_loading",
	                        msg : probot.isValid(msg) ? msg : '',
	                        icon : config.icon,/*目前提供default|balls|box|gears|pie几种类型*/
	                        background : config.background,
	                        blank : config.blank,
	                        msgColor : config.msgColor
	                    }).ready(function() {
	                        this.show();
	                    }).render();
	        }
	        _p.$$end();
	    },
	    hide : function() {
	        var _p = this.win.$p("*ui:loading");
	        var ele = _p.ele();
	        if (ele) {
	            ele.remove();
	        }
	        _p.$$end();
	    }
	}
	
	/**
	 * 进度标签的js调用方式
	 */
	var $progress = {
		/**
		 * ui:radialIndicator 标签
		 */
		radialIndicator : function(container, options) {
			function Radial(container, options) {
				var _this = this;
				if (typeof container == "string")
					container = document.querySelector(container);
	
				if (container.length)
					container = container[0];
	
				this.container = container;
				var _p = $p(this.container);
				if (!probot.isValid(options)) {
					options = {};
				}
				this.ready = false;
				this.radialObj = _p.$("+ui:radialIndicator").ele();
				_p.attr(options).ready(function() {
							_this.ready = true;
						}).render().$$end();
			}
			Radial.prototype = {
				value : function(num) {
					var _this = this;
					if (_this.ready) {
						this.radialObj.value(num);
					} else {
						setTimeout(function() {
									_this.value(num);
								}, 0);
					}
					return this;
				},
				animate : function(num) {
					var _this = this;
					if (_this.ready) {
						this.radialObj.animate(num);
					} else {
						setTimeout(function() {
									_this.value(num);
								}, 0);
					}
					return this;
				}
			}
			return new Radial(container, options);
		}
	}
	
	/**
	 * ui:default标签的js调用方式 
	 */
	var $default = {
	    pool : {},
	    /**
	     * 显示默认提示信息
	     * 
	     * @param {}
	     *            config = id,text,url,parent
	     */
	    show : function(config) {
	    	var _this = this;
	        var parent = probot.isValid(config.parent) ? config.parent : document.body;
	        var _p = $p(parent);
	        var uiDefault = null;
	        var id = probot.isValid(config.id) ? config.id : null;
	        if (probot.isStr(config)) {
	            id = config;
	        }
	        if (id) {
	            uiDefault = netiler.$("#" + id);
	            if (uiDefault) {
	                var text = probot.isValid(config.text) ? config.text : null;
	                $util.recycle(function(){
	                	if(NetilerUI.hasRendered(uiDefault)){
	        				uiDefault._show(text);
	        				return true;/*标识退出循环*/
	        			}
	                },{
	                	isDoFirst: true,
	                	maxTime:4000
	                });
	            } else {
	                config.hasReady = false;
	                $default.pool[id] = config;
	                _p.$("+ui:default").attr(config).render();
	            }
	            _p.$$end();
	        } else {
	            $window.alert('$default.show()参数需要指明Id值！', 'warn');
	        }
	    },
	    /**
	     * 隐藏默认提示信息
	     * 
	     * @param {}
	     *            id
	     */
	    hide : function(id) {
	        if (probot.isValid(id)) {
	        	$util.recycle(function(){
	        			if ($default.pool[id] && $default.pool[id].hasReady) {
	                            var uiDefault = netiler.$("#" + id);
	                            if (uiDefault) {
	                                uiDefault.hide();
	                            }
	                            return true;
	                        }
	                },{
	                	maxTime:4000
	                });
	        } else {
	            $window.alert('请传入要隐藏默认提示信息的Id值', 'warn');
	        }
	    }
	}
	
	/**
	 * 消息提示框
	 */
	var msgBox = (function(){
	    var msgBox = {
	        context : {},
	        fadeIn : function(info, type, second, color) {
	            second = second || 2;
	            var config = {
	                type : type,
	                color : color
	            };
	            var box = new MessageBox(config);
	            this.context[box.id] = box;
	            
	            const DELAY = 50;
	            setTimeout(function() {
	                        box.fadeIn(info);
	                    }, DELAY);
	            setTimeout(function() {
	                        box.fadeOut();
	                    }, 1000 * second + DELAY);
	        }
	    }
	    var MessageBox = function(config) {
	        var tmpl = '<div class="ld-msgBoxTheme" style="background:{{bgColor}};right:{{styleRight}};">\
	                        <i class="ld-msgbox {{iconClass}}"></i>\
	                        <span class="js_info">{{info}}</span>\
	                    </div>'
	        var box = document.createElement("ui:msgBox");
	        var randomId = "ld-msgBox_" + parseInt(Math.random() *1000) + Date.now();//Date.now()可能因为时间间隔短而重复
	        box.id = randomId;
	        var bgColor = config.color || "rgba(0,0,0,0.5)";
	        var iconClass = config.type;
	        var viewData = {
	            bgColor : bgColor,
	            iconClass : iconClass,
	            styleRight : "-500px",
	            info:""
	        }
	        box.innerHTML = compileTmpl(tmpl,viewData);
	        document.body.appendChild(box);
	        iconClass==null && box.querySelector("i").remove();
	        
	        this.id = randomId;
	        this.msgBox = box;
	        this.msgBoxDiv = document.getElementById(randomId).children[0];
	        this.msgInfoSpan = box.querySelector(".js_info");
	    }
	    
	    MessageBox.prototype = {
	        fadeIn : function(info) {
	            this.msgInfoSpan.innerHTML = '' + info;
	            this.msgBoxDiv.style.right = "40px";
	            initTop();
	        },
	        fadeOut : function() {
	            var msgBoxDiv = this.msgBoxDiv; 
	            var uiMsgBox= this.msgBox;
	            msgBoxDiv.style.right = "-300%";
	            setTimeout(function() {
	                        uiMsgBox.remove();
	                    }, 5000);
	            delete msgBox.context[this.id];
	            initTop();
	        }
	    }
	    
	    var compileTmpl = function(tmpl,viewData){
	        var reg = /{{([a-zA-Z$_][a-zA-Z$_0-9]*)}}/ig
	        return tmpl.replace(reg, function(raw, p1, offset, allStr){
	            return '' + viewData[p1];
	        });
	    }
	    
	    var initTop = function() {
	        var top = 155;
	        var context = msgBox.context;
	        Object.keys(context).forEach(function(id, i){
	            var div = context[id].msgBoxDiv;
	            div.style.top = top + "px";
	            top += (div.offsetHeight + 20);
	        });
	    }
	    
	    return msgBox;
	})();
	
	var Alert = function(msg) {
	    var win = probot.isNetilerBrowser() ? chrome.window : top;
	    if (win) {
	        var loading = win.$window._getByTagName('UI:LOADING');
	        /*remove loading 避免后台抛异常导致loading无法清除*/
	        loading && loading.remove();
	    }
	
	    $window.alert(msg, "warn");
	}
	
	/**
	 * 重写window对象的属性或方法
	 */
    /* 在uiPopup的内部iframe中调用`window.close()`方法可以关闭弹出的uiPopup*/
    window.close_ = window.close;
    window.close = function() {
        if (this.uiPopup) {
            this.uiPopup.close();
            this.uiPopup = null;
        } else {
            this.close_();
        }
    }
    /* 兼容客户端实现window.Opener（注意一定要大写）*/
    try {
        window.Opener = window.opener;
        /**
	 * 判断
	 * navigator.userAgent.indexOf("netiler")
	 * 使用谷歌浏览器，chrome调不到方法报错处理
	 * 
	 * **/
        if (probot.isNetilerBrowser() && (navigator.userAgent.indexOf("netiler")!=-1)) {
        	var __opener__ = chrome.getAttribute('__opener__');
            if (chrome.window && __opener__/*针对$window.popup打开的窗口*/ && !window.opener/*在客户端默认皆为null,并且该对象为只读对象无法被赋值*/) {
                /*@deprecated 在客户端window.opener为只读对象,赋值无效。请使用window.Opener*/
            	window.opener = __opener__;
                window.Opener = __opener__;
                chrome.setAttribute('__opener__',null);
            }
        }
    } catch (e) {
        console.error(e);
    }
	
	/** *******************扩展DOMElement元素的方法，使与PREDATOR统一**************************** */
	NetilerUI.extend(Element.prototype, {
	    /**
	     * 初始化表单域（比如把校验）
	     */
	    initFormField : function() {
	        var list = this.$('.n_ui_input_container');
	        for (var i = 0; i < list.length; i++) {
	            var item = list[i];
	            item.removeClass('a-ui-input-error');
	        }
	    },
	    /**
	     * 只读
	     * 
	     * @param {}
	     *            isReadOnly
	     */
	    readyOnly : function(isReadOnly) {
	        if (isReadOnly) {
	            this.addClass('a-ui-field-readonly');
	        } else {
	            this.removeClass('a-ui-field-readonly');
	        }
	    },
	    /**
	     * 根据规则校验表单元素，譬如input (在field.js中有使用到)
	     * 
	     * @param {}
	     *            params
	     */
	    validate : function(rule) {
	        rule = rule != undefined ? rule : this.rule;
	        var result = {
	            msgs : {},
	            error : false
	        };
	        if (rule && typeof validator === "object") {
	            result = validator.verify(rule, this.value, this);
	            var p = this.$p().$parent('a-ui-input-container');
	            if (result.error) {
	                p.css('a-ui-input-error', +1);
	            } else {
	                p.css('a-ui-input-error', -1);
	            }
	            p.$$end();
	        }
	        return result;
	    },
	    /**
	     * 针对表单标签元素进行校验（仅验证拥有required="true"属性表单元素）
	     * 
	     * @param {}
	     *            callback
	     */
	    formvalidate : function(callback) {
	        var validateTag = ['ui:text', 'ui:date', 'ui:select', 'ui:checkbox', 'ui:radio', 'ui:number', 'ui:textarea', 'ui:password', 'ui:tree'];
	        var error = false;
	        for (var i = 0; i < validateTag.length; i++) {
	            var tagName = validateTag[i];
	            var list = NetilerUI.$tag(tagName, this); /*将会返回该区域内的所有表单标签元素，this为表单标签搜索范围*/
	            for (var k = 0; k < list.length; k++) {
	                var field = list[k];
	                var result = field.tagValidate();
	                if (result.error == true) {
	                    error = true;
	                }
	            }
	        }
	        if (probot.isFun(callback)) {
	            callback.call(null, error);
	        }
	        return error;
	    },
	    /**
	     * 渲染内部的子元素标签，但并不包括自身的渲染（从前往后、从外向里进行DOM元素渲染）
	     * @param {Boolean}
	     *            registerAble 是否需要注册
	     * @param {Function}
	     *            ready 子标签执行完成后触发方法 当且仅当registerAble为true的时候有效
	     * @param {DOMElement}
	     *            board 注册的上个执行者(不常用)
	     */
	    renderBody : function(registerAble/*opt*/, ready/*opt*/, board/*opt*/) {
	    	registerAble = probot.isTrueFalse(registerAble) ? registerAble : false; 
	        var childs = this.children || this.childNodes;
	        if (registerAble) {
	            board = board ? board : this;
	            if (probot.isFun(ready)) {
	                $p(board).ready(ready).$$end();
	            }
	        }
	        var tags = [];
	        for (var i = 0; i < childs.length; i++) {
	            var tag = childs[i];
	            if (tag.nodeType == 1) {
	                var tagName = tag.tagName;
	                var ui = NetilerUI.uis[tagName];
	                if (ui) {
	                    if (registerAble) {
	                        $p(tag).register(board).$$end();
	                        tags.push(tag);
	                    } else {
	                        NetilerUI.doRender(tag);
	                    }
	
	                }
	                tag.renderBody(registerAble, undefined, board);
	            }
	        }
	        if (registerAble) {
	            $o(tags).each(function(i, tag) {
	                        NetilerUI.doRender(tag);
	                    });
	        }
	    },
	    $p : function() {
	        return $p(this);
	    },
	    pid : function(id) {
	        var _p = this.$p();
	        _p.$('#' + id);
	        var ele = _p.ele();
	        _p.$$end(2);
	        return ele;
	    },
	    pfind : function(key) {
	        var _p = this.$p();
	        _p.$(key);
	        var ele = _p.ele();
	        _p.$$end();
	        return ele;
	    },
	    // 配置信息
	    pcfg : function(key, value) {
	        if (probot.isInvalid(key)) {
	            var _p = this.$p();
	            var cfg = _p.cfg();
	            _p.$$end();
	            return cfg;
	        } else if (probot.isStr(key)) {
	            if (probot.isInvalid(value)) {
	                var _p = this.$p();
	                value = _p.cfg(key);
	                _p.$$end();
	                return value;
	            } else {
	                this.$p().cfg(key, value).$$end();
	            }
	        } else {
	            var _p = this.$p();
	            _p.cfg(key);
	            _p.$$end();
	        }
	    },
	    // 数据信息
	    pmodel : function(key, value) {
	        if (probot.isInvalid(key)) {
	            var _p = this.$p();
	            var model = _p.model();
	            _p.$$end();
	            return model;
	        } else if (probot.isStr(key)) {
	            if (probot.isInvalid(value)) {
	                var _p = this.$p();
	                value = _p.get(key);
	                _p.$$end();
	                return value;
	            } else {
	                this.$p().set(key, value).$$end();
	            }
	        } else {
	            var _p = this.$p();
	            _p.model(key);
	            _p.$$end();
	        }
	
	    },
	    //
	    pchild2data : function(keys) {
	        var _p = this.$p();
	        var data = _p.child2json(keys);
	        _p.set('data', data);
	        _p.$$end();
	    },
	    bodyHeight : function() {
	        var _p = $p(this);
	        var h = _p.bodyHeight();
	        _p.$$end();
	        return h;
	
	    },
	    // 距离上一个层的高度
	    py : function(relative) {
	        var _p = $p(this);
	        var pOffsetTop = _p.attr('pOffsetTop');
	        var y;
	        if (probot.isValid(pOffsetTop)) {
	            y = $o(pOffsetTop).toInt();
	        } else {
	            var pos = _p.getPosition(relative);
	            y = pos.y;
	        }
	        _p.$$end();
	        return y;
	    },
	    // 距离上一个层的长度
	    px : function(relative) {
	        var _p = $p(this);
	        var pos = _p.getPosition(relative);
	        _p.$$end();
	        return pos.x;
	    },
	    // ready
	    pready : function(fn, clear) {
	        var _p = $p(this);
	        _p.ready(fn, clear);
	        _p.$$end();
	    },
	    /**
	     * 元素是否包含该子元素
	     * @param  {DOMElement} childEle 需要验证的子元素
	     * @return {Boolean}     是否包含
	     */
	    pcontains : function(childEle) {
	        var _p = this.$p();
	        var contain = _p.contains(childEle);
	        _p.$$end();
	        return contain;
	    },
	    // 绑定计数器
	    pcounter : function(panel) {
	        panel = panel ? panel : this;
	        if (panel == this) {
	            panel.childUICount = 0;
	        }
	        var childs = this.children || this.childNodes;
	        for (var i = 0; i < childs.length; i++) {
	            var tag = childs[i];
	            if (tag.nodeType == 1) {
	                var tagName = tag.tagName;
	                var ui = NetilerUI.uis[tagName];
	                if (ui) {
	                    tag.pregister(panel);
	                } else {
	                    tag.pcounter(panel);
	                }
	            }
	        }
	    },
	    // 注册解析
	    pregister : function(panel) {
	        var _p = this.$p();
	        _p.register(panel);
	        _p.$$end();
	    },
	    // 扩展功能
	    pextends : function(features) {
	        predator.usb(this, features);
	    },
	    /**
	     * 获得标签元素数据源
	     * 
	     * @param {}
	     *            fn
	     * @param {}
	     *            params
	     */
	    pdata : function(fn, params, srcHtml) {
	        var _p = $p(this);
	        _p.data(fn, params, srcHtml);
	        _p.$$end();
	    },
	    /**
	     * 数据源是数组
	     * 
	     * @param {}
	     *            fn
	     * @param {}
	     *            params
	     */
	    pdataEach : function(fn, params) {
	        this.pdata(function(data, dformat) {
	                    if (probot.isArr(data)) {
	                        for (var i = 0; i < data.length; i++) {
	                            var item = dformat.call(data, data[i], i);
	                            fn.call(this, item);
	                        }
	                    }
	
	                }, params);
	    },
	    /**
	     * 标签部分渲染(外部渲染。即渲染过程不在标签内进行，而将其拿到标签外部根据业务需求去渲染)
	     * 
	     * @param {}
	     *            data
	     * @param {}
	     *            ele
	     */
	    prender : function(data, ele, ready) {
	        var _p = $p(this);
	        var fn = _p.tagRender(data);/*获得标签render属性对应的方法*/
	        _p.$$end();
	        return fn(ele ? ele : this, data, ready);
	    },
	    ppanel : function() {
	        return this.cfg['panel'];
	    },
	    /**
	     * 执行事件
	     * 
	     * @param {}
	     *            evtName 事件名称
	     * @param {}
	     *            args 事件参数
	     * @param {}
	     *            owner caller
	     */
	    pevents : function(evtName, args, owner) {
	        var _p = $p(this);
	        var events = _p.tagEvents();
	        var fn = events[evtName];
	        var ret;
	        if (probot.isFun(fn)) {
	            ret = fn.apply(owner ? owner : this, args);
	        }
	        _p.$$end();
	        return ret;
	    },
	    /**
	     * 距离页面最左侧的距离
	     * return {Number}
	     */
	    pageX : function() {
	        return this.offsetParent ? (this.offsetLeft + this.offsetParent.pageX()) : this.offsetLeft;
	    },
	    /**
	     * 距离页面最顶侧的距离
	     * return {Number}
	     */
	    pageY : function() {
	        return this.offsetParent ? (this.offsetTop + this.offsetParent.pageY()) : this.offsetTop;
	    },
	    getScrollTop : function(obj, top) {
	        var scrollTop = 0;
	        var nT = 0;
	        var t = 0;
	        if (top) {
	            scrollTop = top;
	        }
	        if (obj.scrollTop) {
	            nT = obj.scrollTop;
	        };
	        t = nT + scrollTop;
	        if (obj.parentNode) {
	            t = this.getScrollTop(obj.parentNode, t);
	        }
	        return t;
	    },
	    getScrollLeft : function(obj, left) {
	        var scrollLeft = 0;
	        var nL = 0;
	        var l = 0;
	        if (left) {
	            scrollLeft = left;
	        }
	        if (obj.scrollLeft) {
	            nL = obj.scrollLeft;
	        }
	        l = nL + scrollLeft;
	        if (obj.parentNode) {
	            l = this.getScrollLeft(obj.parentNode, l);
	        }
	        return l;
	    },
	    offsets : function() {
	        var offset = {
	            x : this.pageX() - this.getScrollLeft(this),
	            y : this.pageY() - this.getScrollTop(this)
	        }
	        return offset;
	    },
	    /**
	     * 向上移动
	     * 
	     * @param {}
	     *            curEle当前元素对象
	     * @param {}
	     *            containerObj容器元素对象
	     */
	    move2pre : function(curEle, containerObj) {
	        var pre = this.pre(curEle, containerObj);
	        if (probot.isValid(pre)) {
	            var current = curEle ? curEle : this;
	            var _p = $p(this.parentNode);
	            if (containerObj) {
	                _p.$$end();
	                _p = $p(containerObj);
	            }
	            _p.insert(current, 'before', pre);
	            // _p.$$();
	        }
	    },
	    /**
	     * 向下移动
	     * 
	     * @param {}
	     *            curEle当前元素对象
	     * @param {}
	     *            containerObj容器元素对象
	     */
	    move2next : function(curEle, containerObj) {
	        var next = this.next(curEle, containerObj);
	        if (probot.isValid(next)) {
	            var current = curEle ? curEle : this;
	            var _p = $p(this.parentNode);
	            if (containerObj) {
	                _p.$$end();
	                _p = $p(containerObj);
	            }
	            _p.insert(next, 'before', current);
	            // _p.$$();
	        }
	    },
	    /**
	     * 获取上一个元素对象
	     * 
	     * @param {}
	     *            curEle当前元素对象
	     * @param {}
	     *            containerObj容器元素对象
	     * @return {}
	     */
	    pre : function(curEle, containerObj) {
	        var current = curEle ? curEle : this;
	        var _p = $p(this.parentNode);
	        if (containerObj) {
	            _p.$$end();
	            _p = $p(containerObj);
	        }
	        var pre;
	        if (probot.isValid(current)) {
	            pre = _p.$(current).$('>pre').ele();
	            _p.$$(3);
	        }
	        // _p.$$();
	        return pre;
	    },
	    /**
	     * 获取下一个元素对象
	     * 
	     * @param {}
	     *            curEle当前元素对象
	     * @param {}
	     *            containerObj容器元素对象
	     * @return {}
	     */
	    next : function(curEle, containerObj) {
	        var current = curEle ? curEle : this;
	        var _p = $p(this.parentNode);
	        if (containerObj) {
	            _p.$$end();
	            _p = $p(containerObj);
	        }
	        var next;
	        if (probot.isValid(current)) {
	            next = _p.$(current).$('>next').ele();
	            _p.$$(3);
	        }
	        // _p.$$();
	        return next;
	    }
	});
	
	/** ********************扩展Netiler Form 对象 start************************** */
	if (typeof netilerTemplateForm == 'undefined') {
	    window.netilerTemplateForm = netiler.template.form;
	
	    /**
	     * netiler中的表单解析函数劫持
	     * 
	     * @param {}
	     *            tag
	     * @param {}
	     *            values
	     */
	    netiler.template.form = function(tag, values) {
	        netilerTemplateForm(tag, values);
	        var els = tag.elements;
	        var usn = tag.getAttribute('useSimpleName') == 'true';
	        values = values ? values : {};
	        for (var i = 0; i < els.length; i++) {
	            var el = els[i];
	            if (probot.isFun(el._setValue)) {
	                var name = el.name;
	                if (!name || name.length == 0) {
	                    continue;
	                }
	                if (usn) {
	                    name = name.substring(name.lastIndexOf('.') + 1);
	                }
	                var value = values[name];
	                el._setValue(value);
	            }
	
	        }
	
	    }
	}
	/** ********************扩展Netiler Form 对象 end************************** */
	
	/** 自动引入netiler.ui的style.icss文件，使`#style("base/comm","com.leadal.netiler.ui")彻底不用再写`**/
	;(function(){
		var href = NetilerUI.resetURL("/com.leadal.netiler.ui/icon/style.icss");
		var style = document.querySelector("link[href='" + href + "']");
		if(!style){
			netiler.addStyle2Header(href);
		}
	})();
	
	
	NetilerUI.ready(function() {
            var tag = NetilerUI.$('#app.name');
            if (tag) {
                var value = NetilerUI.params['app.name'];
                if (value) {
                    value = decodeURIComponent(value);
                }
                var defaultV = tag.attr('defaultAppName');
                if (!value) {
                    value = defaultV;
                }
                if (value) {
                    tag.html(value);
                }
                
                var iconTag = NetilerUI.$('#app.icon');
                if(iconTag){
                    value = NetilerUI.params['app.icon'];
                    if(value){
                        value = decodeURIComponent(value);
                        iconTag.style.backgroundImage = "url('"+value+"')";
                    }
                }
            }
        });
        
    var exports = {
    	$request : $request,
		$backevent : $backevent,    	
		GetRequest : GetRequest,
		$refresh : $refresh,
		$util : $util,
		$win : $win,
		$crypto : $crypto,
		$window : $window,
		$loading : $loading,
		$progress : $progress,
		$default : $default,
		msgBox : msgBox,
		Alert : Alert
    }
	Object.keys(exports).forEach(function(key, i){
		var value = exports[key];
		Object.defineProperty(window, key,{
			get : function(){
				return value;
			},
			set : function(newValue){
				value = newValue;
				console.warn("代码中存在`" + key + "`全局变量，与netiler框架中的全局变量冲突！");
			}
		});
	});
    
    window.addEventListener('mousedown',function(event){
    /**
	 * 判断
	 * navigator.userAgent.indexOf("netiler")
	 * 使用谷歌浏览器，chrome调不到方法报错处理
	 * 
	 * **/
    	if(typeof chrome!='undefined' && (navigator.userAgent.indexOf("netiler")!=-1)){
        	var fun = chrome.getAttribute('MouseClickEvent');
        	if(typeof fun == 'function'){
        		fun(event);
        	}
        }
    	return true;
    });
    
	// 十六进制颜色值的正则表达式
	/* RGB颜色转换为16进制 */
	String.prototype.colorHex = function() {
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		var that = this;
		if (/^(rgb|RGB)/.test(that)) {
			var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
			var strHex = "#";
			for (var i = 0; i < aColor.length; i++) {
				var hex = Number(aColor[i]).toString(16);
				if (hex === "0") {
					hex += hex;
				}
				strHex += hex;
			}
			if (strHex.length !== 7) {
				strHex = that;
			}
			return strHex;
		} else if (reg.test(that)) {
			var aNum = that.replace(/#/, "").split("");
			if (aNum.length === 6) {
				return that;
			} else if (aNum.length === 3) {
				var numHex = "#";
				for (var i = 0; i < aNum.length; i += 1) {
					numHex += (aNum[i] + aNum[i]);
				}
				return numHex;
			}
		} else {
			return that;
		}
	};

	/* 16进制颜色转为RGB格式 */
	String.prototype.colorRgb = function() {
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		var sColor = this.toLowerCase();
		if (sColor && reg.test(sColor)) {
			if (sColor.length === 4) {
				var sColorNew = "#";
				for (var i = 1; i < 4; i += 1) {
					sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
				}
				sColor = sColorNew;
			}
			// 处理六位的颜色值
			var sColorChange = [];
			for (var i = 1; i < 7; i += 2) {
				sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
			}
			return "RGB(" + sColorChange.join(",") + ")";
		} else {
			return sColor;
		}
	};
//    document.addEventListener('DOMAttrModified',function(evt){
//		if(evt.attrName=='src' || evt.attrName=='href'){
//			var url = evt.relatedNode.value;
//			evt.relatedNode.value = NetilerUI.resetURL(url);
//		}
//	},false);
    
})(window);