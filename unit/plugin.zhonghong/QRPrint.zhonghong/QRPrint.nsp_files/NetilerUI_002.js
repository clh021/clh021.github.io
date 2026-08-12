/**
 * @fileOverview NetilerUI.js前端库
 * @author leadal
 */

(function(window) {

	var NetilerElements = function() {}
	NetilerElements.prototype = new Array();
	NetilerElements.prototype.constructor = NetilerElements;

	/**
	 * <h3>Hello NetilerUI.js</h3>
	 * 
	 * @namespace NetilerUI
	 * @author LEADAL
	 * @see <a href="./NetilerUI.js.html">源码</a>
	 * @copyright LEADAL
	 */
	var NetilerUI = {
		local : false,
		scripts : {},
		styles : {},
		uis : {},//全部UI组件相关信息
		scriptset : {},
		styleset : {},
		elements : {},
		params : {},
		/** UI标签收集池 */
		pools : [],
		readies : [],/* 页面（包括UI标签）渲染完成后，将逐一执行堆栈中的函数 */
		count : 0,// 与渲染相关的script,style的条数
		/** renderUI方法中需要忽略的标签方法 */
		func_ignores : /^(begin|end|render|afterRender|initAttr|onready)$/i,
		/** renderUI方法中需要忽略的标签属性（虽暂时无用但希望暂时保留该正则 by yeshiqing） */
		attrs_ignores : /^(id|style|_.*|data\-.*|loadData|params|data|ajax|events|ready|render|jservice|jmethod|jparams|_rendered|_dorendered|parentUId)$/i,
		cssOnloadAllow : true,/* 在safari中link标签加载完成后没有onload行为，所以safari下需要单独处理 */
		timehandler : null,
		each : function(obj, callback) {
			if (obj instanceof Array) {
				for (var i = 0; i < obj.length; i++) {
					if (callback(obj[i]) === false) {
						break;
					}
				}
			} else {
				for (var key in obj) {
					if (callback(key, obj[key]) === false) {
						break;
					}
				}
			}
		},
		//提供动态主题样式功能 用法 NetilerUI.resetStyle("参数名称",'工程路径')
		resetStyle:function(key,project){
			if(typeof chrome =='undefined'){
				return;
			}
			var atr=chrome.getAttribute(key);
			//判断是否存在公共的颜色，如果存在则加载否则不加载
			if(typeof atr =='undefined'){
				return;
			}
			this.addStyle('/'+project+'/theme/@theme.css?'+atr);
		},
		resetTheme:function(key,style){
			if(typeof chrome =='undefined'){
				return;
			}
			var atr=chrome.getAttribute(key);
			if(typeof atr =='undefined'){
				return;
			}
			var c='';
			for(var i=2;i<arguments.length;i++){
				c+=arguments[i]+' {';
				c+=style+':'+atr+';';
				c+='}'
			}
			var s='<style>'+c+'<style>';
			document.write(s);
		},
		time : new Date().getTime(),
		/**
		 * @description 根据标示符的第一个符号，选取或创建DOM元素
		 * @param {String} element 选择器标识符，用于选取或创建DOM元素。标识区别在于第一个符号。
		 * @param {Object} attrs 创建元素需添加的属性。
		 * @param {Object} styles 创建元素需添加的内联样式。
		 * @param {DOMElement} tag 父级DOM元素用于DOM创建。
		 * @return {Object | HTMLCollection} 所选取的DOM元素或DOM元素集合。
		 *         @example
		 *         //DOM元素选取
		 * NetilerUI.$("#foo");//取到id值为foo的元素。与netiler.$相同。
		 * NetilerUI.$(".foo")//取到<b>所有</b>className值为.foo。【注意：返回值为NodeList】。与netiler.$不同。
		 * NetilerUI.$(".foo .bar");//代码底层调用querySelectorAll,支持符合querySelectorAll的css选择器。
		 * //DOM元素创建
		 * NetilerUI.$("+ui:text"); //创建标签名为ui:text的标签。
		 * NetilerUI.$("+ui:text",{name:"foo",class:"bar"},{color:"red",display:"none"},document.body);//创建&lt;ui:text class="bar" name="foo" style="color:red;display:none"&gt;&lt;ui:text&gt;元素并appendChild到document.body内部。
		 */
		$ : function(element, attrs, styles, tag) {
			if (element.tagName) {
				return element;
			}
			if (typeof element == "string") {
				var flag = element.substring(0, 1);
				if (flag == '<' && element.substring(element.length - 1) == '>') {
					var tagName = element.substring(1, element.length - 1);
					return this.$create(tagName, attrs, styles, tag);
				} else {
					var name = element.substring(1);
					switch (flag) {
						case '#' :
							return document.getElementById(name);
						case '.' :
							return this.$class(name, tag);
						case '>' :
							return this.$tag(name, tag);
						case '+' :
							if (tag) {
								var pid = tag.getAttribute("bodyParentUID");
								if (pid) {
									attrs = attrs || {};
									attrs.parentUId = pid;
								}
							}
							return this.$create(name, attrs, styles, tag);
						case '%' :
							if (tag) {
								if (NetilerUI.uis[tag.tagName]) {
									if (!attrs) {
										attrs = {};
									}
									attrs.parentUId = tag.id;
								}
							}
							return this.$create(name, attrs, styles, tag.$body());
						case ':' :
							return this.$els(tag, name);
						case '&' :
							return this.$name(name);
						default :
							if (tag) {
								return this.$tag(element, tag);
							} else {
								if (document.querySelector) {
									return document.querySelector(element);
								}
							}

					}
				}
			} else {
				return element;
			}
		},
		$id : function(id) {
			return document.getElementById(id);
		},
		$tag : function(tagName, tag) {
			if (!tag) {
				tag = document;
			}
			return tag.getElementsByTagName(tagName);
		},
		$els : function(el, flag) {
			switch (flag) {
				case 'child' :
					var ns = el.children || el.childNodes;
					var child = [];
					if (ns)
						for (var i = 0; i < ns.length; i++) {
							var n = ns[i];
							if (n.nodeType == 1) {
								child.push(n);
							}
						}
					return child;
				case 'parent' :
					return el.parentNode;
				case 'next' :
					el = el.nextSibling;
					while (el && el.nodeType != 1) {
						el = el.nextSibling;
					}
					return el;
				case 'pre' :
					el = el.previousSibling;
					while (el && el.nodeType != 1) {
						el = el.previousSibling;
					}
					return el;
				case 'first' :
					var ns = el.children || el.childNodes;
					if (ns.length > 0) {
						return ns[0];
					}
					return null;
				case 'last' :
					var ns = el.children || el.childNodes;
					if (ns.length > 0) {
						return ns[ns.length - 1];
					}
					return null;
				case 'uibody' :
					return el.getElementById('uibody_' + el.id);
				default :
					break;
			}
		},
		$create : function(tagName, attrs, styles, parent) {
			var el = document.createElement(tagName);
			if (attrs) {
				el.attrs(attrs);
			}
			if (styles) {
				el.css(styles);
			}
			if (parent) {
				parent.appendChild(el);
			}
			return el;
		},
		/**
		 * 根据className找到所有符合要求的元素
		 * 
		 * @param {String} className 可以是符合querySelectorAll的所有class
		 * @param {DOMElement} tag 搜索范围
		 * @return {NodeList|Array} 目前版本客户端返回值为类数组NodeList
		 * @ignore
		 */
		$class : function(className, tag) {
			if (!tag) {
				tag = document;
			}
			if (typeof tag.querySelectorAll === "function") {
				return tag.querySelectorAll('.' + className);
			}
			// 旧API，可兼容低版本火狐及IE、chrome
			var result = new NetilerElements();
			var candidates = tag.getElementsByTagName("*") || document.all;
			for (var i = 0, len = candidates.length; i < len; i++) {
				if (candidates[i].hasClass(className)) {
					result.push(candidates[i]);
				}
			}
			return result;// 是一个类数组
		},
		$name : function(name) {
			return document.getElementsByName(name);
		},
		Event_KEY : {
			KEY_BACKSPACE : 8,
			KEY_TAB : 9,
			KEY_ENTER : 13,
			KEY_ESC : 27,
			KEY_LEFT : 37,
			KEY_UP : 38,
			KEY_RIGHT : 39,
			KEY_DOWN : 40,
			KEY_DELETE : 46,
			KEY_HOME : 36,
			KEY_END : 35,
			KEY_PAGEUP : 33,
			KEY_PAGEDOWN : 34,
			KEY_INSERT : 45
		},
		/**
		 * @description 获取事件处理程序中的event对象的方法
		 *              @example
		 *              //【使用场景】常常是onclick的时候不传递event，然后内部去取到该值。
		 * //或是事件处理程序中调用到外部的方法，而又不便于再传递参数（毕竟参数越少越好）于是在外部方法体内部通过该方法得到event对象。
		 * var event=NetilerUI.getEvent();
		 */
		getEvent : function() {
			if (document.all) {
				return window.event;// 如果是ie
			}
			var func = NetilerUI.getEvent.caller;
			while (func != null) {
				var arg = func.arguments[0];
				if (arg) {
					if ((arg.constructor == Event || arg.constructor == MouseEvent)
							|| (typeof(arg) == "object" && arg.preventDefault && arg.stopPropagation)) {
						return arg;
					}
				}
				func = func.caller;
			}
			return null;
		},
		getEventTarget : function() {
			var event = NetilerUI.getEvent();
			return event.target || event.srcElement;
		},
		stopEvent : function() {
			var event = NetilerUI.getEvent();
			event.stopPropagation();
		},
		addEventHandler : function(oTarget, sEventType, fnHandler) {
			if (oTarget.addEventListener) {
				oTarget.addEventListener(sEventType, fnHandler, false);
			} else if (oTarget.attachEvent) {
				oTarget.attachEvent("on" + sEventType, fnHandler);
			} else {
				oTarget["on" + sEventType] = fnHandler;
			}
		},
		removeEventHandler : function(oTarget, sEventType, fnHandler) {
			if (oTarget.removeEventListener) {
				oTarget.removeEventListener(sEventType, fnHandler, false);
			} else if (oTarget.detachEvent) {
				oTarget.detachEvent("on" + sEventType, fnHandler);
			} else {
				oTarget["on" + sEventType] = null;
			}
		},
		bindAsEventListener : function(object, fun) {
			var args = Array.prototype.slice.call(arguments).slice(2);
			return function(event) {
				return fun.apply(object, [event || window.event].concat(args));
			}
		},
		hide : function() {
			document.body.style.visibility = 'hidden';
		},
		show : function() {
			document.body.style.visibility = '';
			if (typeof chrome != "undefined" && chrome.hideLoading) {
				setTimeout(function() {
							chrome.hideLoading();
						}, 100);
			}
		},
		rsonload : function() {
			if (this.loaded) {
				return;
			}
			var readyState = this.readyState;
			if (typeof readyState == 'undefined'/* 兼容safari */|| readyState == 'loaded' || readyState == 'complete') {
				this.loaded = true;
				NetilerUI.count--;
				if (this.tagName == 'SCRIPT') {
					var parent = this.parentNode;
					parent.removeChild(this);
				}
			}
		},
		/**
		 * @description 标签组件渲染完成时执行回调。应用场景:需要等到所有标签渲染完成之后，比如取到组件中的DOM元素,调用标签的方法。js原生方法window.onload只是做到等velocity模板中的DOM结构渲染完毕，不能保证标签内部已渲染完成。
		 * @param {function} fun 绑定的回调函数
		 *            @example
		 *            //注意NetilerUI.ready不适合判断jservice（ajax）异步接受数据的标签渲染完成情况。其只关注第一次写在vm页面上的标签，且只在页面首次加载时执行。
		 * //js
		 * NetilerUI.ready(function(){
		 *  var tag=document.getElementsByTagName("ui:blocks")[0];
		 *  var targetDOM=tag.querySelector(".js_foo");//js_foo为标签内部元素
		 * })
		 */
		ready : function(fun) {
			this.readies.push(fun);
		},
		genId : function() {
			this.time++;
			return "nui_" + this.time;
		},
		fire : function(tag, eventName) {
			var id = tag.getAttribute('eventTarget');
			if (!id) {
				alert('undefiend eventTarget in Element');
				return;
			}
			var args = [];
			args.push(id);
			for (var i = 1; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			this.$fire.apply(NetilerUI, args);
		},
		$fire : function(id, eventName) {
			var target = document.getElementById(id);
			if (!target && window.parent != window && window.parent.NetilerUI) {
				var fire = window.parent.NetilerUI.$fire;
				return fire.apply(window.parent.NetilerUI, arguments);
			}
			if (!target) {
				alert(' eventTarget ' + id + ' not found in page.');
				return;
			}

			var fun = target[eventName];
			if (!fun) {
				alert(' event ' + eventName + ' undefiend in Element with tag ' + id);
				return;
			}
			var args = [];
			for (var i = 2; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			fun.apply(target, args);
		},
		/**
		 * @description 使事件处理程序转向标签的方法。封装标签时在onclick等事件处理程序中调用。与eventTarget配合使用。
		 * @param {} tag 事件触发的标签，通常为this
		 * @param {} eventName 标签暴露出的方法名。<b>注意有一些原生js不能重写的方法名是不允许的，比如onchange,onclick</b>
		 * @param {*} * 标签可以支持传入更多参数，从第三个参数开始往后都会做为eventName方法体内的实参。
		 *            @example
		 *            //jtemplate
		 * #template("ui:test",$attrs,$tag)
		 *  &lt;div onclick="NetilerUI.event(this,'test',event)" eventTarget="$tag.id"&gt;&lt;/div&gt;
		 * #end
		 * //javascript
		 * NetilerUI.element("ui:test",{
		 *  begin:function(){},
		 *  end:function(){},
		 *  test:function(){}
		 * })
		 */
		event : function(tag, eventName) {
			var id = tag.getAttribute('eventTarget');
			if (!id) {
				alert('undefiend eventTarget in Element');
				return;
			}
			var target = this.$id(id);
			if (!target) {
				alert(' eventTarget ' + id + ' not found in page.');
				return;
			}
			var fun = target[eventName];
			if (!fun) {
				alert(' event ' + eventName + ' undefiend in Element with tag ' + id);
				return;
			}
			var args = [];
			for (var i = 2; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			fun.apply(target, args);
		},
		rending : false,/* asyn过程中是否有正在渲染的组件 */
		opacity2hide : function(tag) {
			tag.style.opacity -= 0.1;
			if (tag.style.opacity > 0.6) {
				setTimeout(function() {
							NetilerUI.opacity2hide(tag);
						}, 150);
			} else {
				tag.style.display = 'none';
			}

		},
		/**
		 * @description 判断UI标签收集池中是否有未渲染的组件，并对其进行渲染
		 * @ignore
		 */
		asyn : function() {
			if (this.rending) {
				return;
			}
			if (this.timehandler) {
				clearTimeout(this.timehandler);
			}
			if (this.count <= 0) {
				this.rending = true;
				var pools = this.pools;
				var item = pools.pop();
				while (item) {
					this.renderUI(item);
					if (this.count > 0) {
						this.rending = false;
						this.timehandler = setTimeout(function() {
									NetilerUI.asyn()
								}, 50);
						return;
					}
					item = pools.pop();
				}
				var readies = this.readies;
				var item = readies.pop();
				while (item) {
					item();
					if (this.count > 0) {
						this.rending = false;
						this.timehandler = setTimeout(function() {
									NetilerUI.asyn()
								}, 50);
						return;
					}
					item = readies.pop();
				}
				if (pools.length > 0 || this.count > 0) {
					this.rending = false;
					this.timehandler = setTimeout(function() {
								NetilerUI.asyn()
							}, 50);
					return;
				}
				var loading = NetilerUI.$id('loading');
				if (loading) {
					loading.style.opacity = 1;
					setTimeout(function() {
								NetilerUI.opacity2hide(loading);
							}, 500);
				} else {
					NetilerUI.show();
				}
				if (typeof chrome != 'undefined' && chrome.window == window && typeof chrome.setBgColor != 'undefined') {
					chrome.setBgColor('transparent');
					document.body.style.backgroundColor = 'transparent';
				}
				this.rending = false;
			} else {
				this.timehandler = setTimeout(function() {
							NetilerUI.asyn()
						}, 50);
			}
		},
		doRender : function(tag) {
			if (tag.getAttribute('_dorendered')) {
				return;
			}
			tag.setAttribute('_dorendered', true);
			tag.id = tag.id || this.genId();
			/*
			 * @author jonsun.huang 2017-06-19 提供id2var 属性，将id转化为window对象属性
			 */
			if (tag.getAttribute('id2var') == 'true') {
				window[tag.id] = tag;
			}
			var tagName = tag.tagName;
			var ui = this.uis[tagName];
			if (ui) {
				var parentNode = tag.parentNode;
				if (parentNode) {
					if (this.uis[parentNode.tagName]) {
						tag.setAttribute("parentUId", parentNode.id);
					} else {
						var pid = parentNode.getAttribute("bodyParentUID");
						pid && tag.setAttribute("parentUId", pid);
					}
				}
				this.addJservice(tag)
				this.initUI(ui);
				this.pools.push(tag);
				this.asyn();
			} else {
				console.log("uiTag not found: " + tagName);
			}

		},
		/**
		 * @description 找到标签的属性名对应的对象。
		 * @deprecated 因为会导致全局变量过多，现在将所有的events统一成一个全局变量。
		 * @param {} name
		 * @return {}
		 * @ignore
		 */
		eval : function(name) {
			var invoke = function(event) {
				var tag = this;
				var attr = this.attr(name);
				if (attr) {
					eval('(' + attr + ')');
				}
			}
			invoke.override = true;
			return invoke;
		},
		invoke : function(name) {
			var invoke = function() {
				var el = NetilerUI.elements[this.tagName], fun/* 执行的目标方法 */;
				if (el) {
					/* 2017-2-25 modified by yeshiqing 虽然不便于阅读，但便于调试 */
					return (fun = el[name]) ? fun.apply(this, arguments) : ((fun = this[name + '$'])
							? fun.apply(this, arguments)
							: void 0);
				} else {
					fun = this[name + '$'];
					if (fun) {
						return fun.apply(this, arguments);
					}
				}
			}
			invoke.override = true;
			return invoke;
		},
		/**
		 * @description 封装标签时，根据组件名绑定方法体及属性
		 * @param {} tagName 标签名
		 * @param {Object} funs 方法体集合，key-value数据格式
		 *            @example
		 *            //jtemplate
		 * #template("ui:test",$attrs,$tag)
		 *  &lt;div onclick="NetilerUI.event(this,'test',event)" eventTarget="$tag.id"&gt;&lt;/div&gt;
		 * #end
		 * //javascript
		 * NetilerUI.element("ui:test",{
		 *  begin:function(){},
		 *  end:function(){},
		 *  test:function(){}
		 * })
		 */
		element : function(tagName, funs) {
			var ui = this.uis[tagName.toUpperCase()];
			if (!ui) {
				console.log('uiTag not found: ' + tagName);
				return;
			}
			var elm = Element.prototype;
			if (ui.events) {
				for (var i = 0; i < ui.events.length; i++) {
					var key = ui.events[i];
					elm[key] = NetilerUI.eval(key);
				}
			}
			funs.__prop = Object.create(null);// 将所有属性统一放到这里，标签内部可以用`this.propName`的方式直接调用
			const reg_funcIgnores = this.func_ignores;
			for (var key in funs) {
				if (reg_funcIgnores.test(key)) {
					continue;
				}
				NetilerUI.bindElements(key);
				try {
					var originMethod = elm[key];
					if (typeof funs[key] != "function") {
						if (key === "__prop") {
							continue;
						}
						funs.__prop[key] = funs[key];
						delete funs[key];
						continue;
					}
					if (originMethod) {
						if (!originMethod.override) {
							elm[key + '$'] = originMethod;
							elm[key] = NetilerUI.invoke(key);// 返回一个方法
						}
					} else {
						elm[key] = NetilerUI.invoke(key);
					}
				} catch (e) {
				}
			}

			var _tagNameUpperCase = tagName.toUpperCase();
			if (typeof this.elements[_tagNameUpperCase] === "undefined") {
				this.elements[_tagNameUpperCase] = funs;
			} else {
				NetilerUI.extend(true, this.elements[_tagNameUpperCase].__prop, funs.__prop);
				delete(funs.__prop)
				NetilerUI.extend(this.elements[_tagNameUpperCase], funs);
			}
		},
		/**
		 * 获取本地服务端口
		 */
		_getLocalServerPort : function() {
			var port = "2267";
			if (typeof chrome != "undefined") {
				var pt = chrome.getAttribute("localServerPort");
				if (probot.isValid(pt)) {
					port = pt;
				}
			}
			return port;
		},
		/**
		 * 获取本地websocket服务地址
		 */
		getLocalWsURL : function() {
			return "ws://127.0.0.1:" + NetilerUI._getLocalServerPort() + "/";
		},
		/**
		 * 获取本地http服务地址
		 */
		getLocalHttpURL : function() {
			return "http://127.0.0.1:" + NetilerUI._getLocalServerPort() + "/";
		},
		/**
		 * 获取本地https服务地址
		 */
		getLocalHttpsURL : function() {
			return "https://127.0.0.1:" + NetilerUI._getLocalServerPort() + "/";
		},
		/**
		 * 根据basePath属性，适配不同根路径
		 */
		resetURL : function(url) {
			if (!probot.isValid(url)) {
				return;
			}
			if (url.indexOf('http') == 0) {
				return url;
			}
			if (!this.doinited_) {
				this.doinited_ = true;
				if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/KHTML/i)/* 应对safari */) {
					NetilerUI.cssOnloadAllow = false;
				}
				if (document.body) {
					this.basePath = document.body.getAttribute("basePath");
				}
				/* 2017-3-31 modified by yeshiqing 应对ereneben js脚本加载时body尚未加载的问题 */
				/* 按照框架目前的机制，如果basePath赋值错误，会导致样式（脚本）地址错误，进而导致NetilerUI.count一直不能为0，async方法循环进行无法停止，页面无法正常渲染 */
				var meta_basePath = document.head.querySelector("meta[name='basepath']");
				if (meta_basePath) {
					this.basePath = meta_basePath.getAttribute("content");
				}
			}
			if (this.basePath) {
				if (url.indexOf('/') != 0 || url.indexOf(this.basePath + "/") == 0) {
					return url;
				}

				var windmill, jservice, jtemplate, index, logs;

				windmill = url.indexOf('/windmill/');
				if (windmill == 0) {
					return this.basePath + url;
				}
                logs = url.indexOf('/logs/');
                if (logs == 0) {
                    return this.basePath + url;
                }
				index = url.indexOf("/com.leadal");
				//过滤jservice
				jservice = url.indexOf('/jservice/');
				if (jservice != -1 && jservice != 0 && index != 0) {
					return url;
				}

				//过滤jtemplate
				jtemplate = url.indexOf('/jtemplate/');
				if (jtemplate != -1 && jtemplate != 0 && index != 0) {
					return url;
				}
				if (index != -1 && index != 0 && jservice != 0 && jtemplate != 0) {
					return url;
				}
				//				//过滤/*.*/
//				index = url.search(/(\/)([0-9]|[a-z]|[A-Z])*\.([0-9]|[a-z]|[A-Z])*(\/)/gi);
//				if (index != -1 && index != 0) {
//					return url;
//				}
				//				//过滤/*/
//				index = url.search(/(\/)([0-9]|[a-z]|[A-Z])*(\/)/gi);
//				if (index != -1 && index == 0 && jtemplate != 0 && jservice != 0) {
//					return url;
//				}
				return this.basePath + url;
			} else {
				return url;
			}
		},
		addScript : function(url) {
			url = this.resetURL(url);
			var flag = false;
			if (!this.scripts[url]) {
				this.scripts[url] = true;
				NetilerUI.count++;
				var head = document.getElementsByTagName("head")[0];
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = url;
				script.onload = script.onreadystatechange = NetilerUI.rsonload;
				script.onerror=function(){
					setTimeout(function(){
						NetilerUI.count--;
					},0)
				}
				head.appendChild(script);
				flag = true;
			}
			return flag;
		},
		addStyle : function(url) {
			url = this.resetURL(url);
			if (!this.styles[url]) {
				this.styles[url] = true;
				if (NetilerUI.cssOnloadAllow) {
					NetilerUI.count++;
				}
				var head = document.getElementsByTagName("head")[0];
				var style = document.createElement('link');
				style.rel = "stylesheet";
				style.type = "text/css";
				style.href = url;
				if (NetilerUI.cssOnloadAllow) {
					style.onload = style.onreadystatechange = NetilerUI.rsonload;
				}
				head.appendChild(style);
			}
		},
		addJservice : function(tag) {
			if (tag.getAttribute('_rendered')) {
				return false;
			}
			var jservice = tag.getAttribute("jservice");
			if (jservice) {
				var isLocalService = tag.getAttribute("isLocalService");
				if (isLocalService == 'true') {
					var port = 2267;
					if (typeof chrome != 'undefined') {
						var _p = chrome.getAttribute('localServerPort');
						if (_p) {
							port = _p;
						}
					}
					return this.addScript("http://127.0.0.1:" + port + "/jservice/" + jservice + ".js");
				}
				//提供远程jservice调用
				var jremote = tag.getAttribute("jremote");
				if (probot.isValid(jremote) && jremote != "/") {
					return this.addScript(jremote + "/jservice/" + jservice + ".js?" + jremote);
				} else {
					return this.addScript("/jservice/" + jservice + ".js");
				}
			}
			return false;
		},
		/**
		 * vm页面的UI标签渲染时，将其子元素塞入UI标签内部指定位置（含有bodytag="foo:bar"属性的目标元素内）
		 * 
		 * @ignore
		 */
		_render_bodytag : function(tag, child, bodytag) {
			child = NetilerUI.extend(true, [], child);/* 深拷贝，不影响child原数据 */
			var el = this.elements[tag.tagName];
			if ("*" in bodytag) {
				var body = bodytag["*"];
				var item = child.pop();
				while (item) {
					if (item.nodeType == 1) {
						item.setAttribute("parentUId", tag.id);
					}
					body.appendChild(item);
					if (el && el.onAppendChild) {
						el.onAppendChild(tag, item);
					}
					item = child.pop();
				}
				body.removeAttribute("bodyParentUID");
			} else {
				var item = child.pop();
				while (item) {
					if (item.tagName) {
						var parent = bodytag[item.tagName];
						if (parent) {
							if (item.nodeType == 1) {
								item.setAttribute("parentUId", tag.id);
							}
							parent.appendChild(item);
							if (el && el.onAppendChild) {
								el.onAppendChild(tag, item);
							}

						}
					}
					item = child.pop();
				}
			}
		},
		/**
		 * 用于1.页面初始化渲染。2.渲染UI组件中的bodytag部分
		 * 
		 * @param {DOMElement||uiTag} tag 渲染范围
		 * @param {Array} child vm页面上的子节点
		 * @ignore
		 */
		render : function(tag, child) {
			if (!tag) {
				tag = document;
			}
			/** 渲染范围内的所有UI标签信息,[Object]，用于initUI */
			var uis = [];
			/** 渲染范围中的所有UI标签元素，[DOMElement]，用于最终渲染 */
			var items = [];
			/** UI标签子元素。键值对对象，key为子元素类别，value为DOM父容器} */
			var bodytag = {};

			/** 根据角色标识名称，判定ui标签是否可用 */
			var role = typeof $role != 'undefined' ? $role : null;
			var tags = [].slice.call(tag.getElementsByTagName('*'));//避免getElementsByTagName返回值HTMLCollection为一个动态集合。

			//初始化uis,bodytag,items
			var btag = null;//bodytag的属性值
			for (var i = 0, l = tags.length; i < l; i++) {
				var item = tags[i];
				if (typeof item === "undefined") {//应对console的bug by liwei
					continue;
				}
				if (Object.prototype.toString.call(item) === "[object HTMLEmbedElement]") {//某些插件的tagName是一个方法，故不能通过tagName来处理
					continue;
				}
				if (item.tagName == 'OBJECT') {
					continue;
				}
				if (typeof item.getAttribute !== "function") {
					continue;
				}
				btag = item.getAttribute('bodytag');
				if (btag) {
					item.setAttribute("bodyParentUID", tag.id);//此时tag为所在UI标签
					if ('*' == btag) {
						bodytag["*"] = item;
					} else {
						bodytag[btag.toUpperCase()] = item;
					}
				}
				var ui = this.uis[item.tagName];
				if (ui) {
					uis.push(ui);
					if (!item.id) {
						item.id = this.genId();
					}
					if (ui.def) {
						for (var key in ui.def) {
							if (!item.getAttribute(key)) {
								var v = ui.def[key];
								if (v) {
									item.setAttribute(key, v);
								}
							}
						}
					}
					this.addJservice(item);
					items.push(item);
				}
			}

			for (var i = 0; i < uis.length; i++) {
				this.initUI(uis[i]);
			}

			if ($check.isArray(child) && child.length > 0) {
				this._render_bodytag(tag, child, bodytag);
			}

			//将可用组件塞入池子并开始渲染
			for (var i = items.length - 1; i >= 0; i--) {
				var item = items[i];
				if (NetilerUI.local) {
					var online = item.getAttribute("online");
					if ("true" == online) {
						item.remove();
						continue;
					}
				}
				if (role) {
					var key = item.getAttribute("role");
					if (key && !role[key]) {
						item.remove();
						continue;
					}
				}
				this.pools.push(item);
			}
			this.asyn();
		},
		/**
		 * 2016-12-26 对标签渲染的html和标签上的attr继续加工
		 */
		_handleHtmlAttr4tag : function(tag, html) {
			html = html || "";
			if (!tag) {
				return html;
			}

			/* 过滤注释的attr */
			const commAttrs = ["jservice", "jmethod", "jparams", "loadData"];
			const defaultUIAttrs = NetilerUI.uis[tag.tagName].attrs || [];
			defaultUIAttrs.concat(commAttrs).forEach(function(attr, i) {
						var filterAttr = "_" + attr;
						tag.removeAttribute(filterAttr);
					});

			/*
			 * 处理html 使得在JTemplate中，通过<template></template>标签将元素属性可以直接写到标签上，而不必写在第一个子元素上。
			 * 目的：①使得研发人员在调试过程中只聚焦标签元素本身，而无需关注其第一个子元素。②简化js中大量this.children[0]的写法 具体使用方法可见jtemplate中的ui:workspace相关组件
			 */
			var reg = /^<template(.*?)>(.*)<\/template>$/ig;
			if (reg.test(html)) {
				html = RegExp.$2;
				var dataAttrs = RegExp.$1.trim();//过滤多余空格，得到属性如：'data-mode="test" data-color="foo"'
				dataAttrs = dataAttrs.replace(/\s*=\s*/ig, "=");//清除等于号两边的空格
				dataAttrs = dataAttrs.replace(/(["'])\s*(\S*)\s*\1/ig, "$1$2$1");//清除引号内侧两头空格
				dataAttrs && dataAttrs.match(/[$-_a-zA-Z0-9]*=(["'])[$-_a-zA-Z0-9 ]*\1/g).forEach(function(attr_obj, i) {
							var tempArr = attr_obj.split("=");
							var attrValue = tempArr[1].replace(/['"]/ig, "")
							var attrName = tempArr[0];
							if (attrValue) {
								if (attrName === "class") {
									var orginClass = tag.className;
									tag.setAttribute(attrName, (orginClass + " " + attrValue).trim());
								} else if (attrName === "style") {
									/* 如果标签使用者写了style与内置style冲突,以外面写的style为主 */
									var originStyle = {};
									[].forEach.call(tag.style, function(name, i) {
												originStyle[name] = tag.style[name];
											});
									tag.setAttribute(attrName, attrValue);
									Object.keys(originStyle).forEach(function(name, i) {
												tag.style[name] = originStyle[name];
											});
								} else {
									tag.setAttribute(attrName, attrValue);
								}
							}
						});
			} else {
				var reg_templateTag = /<template.*<\/template>/ig
				if (reg_templateTag.test(html)) {
					throw new Error("JTemplate模板中的<template>标签只允许作为顶级元素出现，并且前后不允许存在空格");
				}
			}

			return html;
		},
		/**
		 * 自动补全eventTarget="$tag.id",使得开发人员在编码时不必手写eventTarget=$tag.id 如果写了eventTarget以写的为主，如果没写以$tag.id为主
		 */
		_autoEventTarget : function(html, tagId) {
			html = html || "";
			tagId = tagId || "";
			var reg = /<\w+\s+.*?NetilerUI.event\s*?\(.*?>/ig;
			var reg_eventTarget = /eventTarget=(["']).*?\1/i;//不能出现g,否则循环中会因匹配位置变更致错。
			html = html.replace(reg, function(match/* html */, i, str) {
						if (reg_eventTarget.test(match)) {
							return match;
						} else {
							return match.replace(/>$/, " eventTarget=" + tagId + ">");
						}
					});

			return html;
		},
		/**
		 * 解析jtemplate模板中的前端指令
		 */
		_resolveDirectives : function(html, tagId) {
			html = html || "";
			tagId = tagId || "";
			//j-id指令
			/* 兼容input单闭合标签，div型双闭合标签，ui:duty-input型自定义标签 */
			var reg = /<\s*([\w:-]+)\s*[^>]*(j-id\s*=\s*["']([^>]*?)["'])[^>]*\/?>(.*?)(<\/\s*\1\s*>)*/ig;
			html = html.replace(reg, function(matchStr, p1, p2, p3, p4, p5, offset, allStr) {
						var reg_jId = /j-id\s*=\s*["']([^>]*?)["']/i;
						var idStr = 'id="' + matchStr.match(reg_jId)[1] + '_' + tagId + '"';
						return matchStr.replace(p2, idStr);
					});

			return html;
		},
		/**
		 * 从project.xml上获取预先注册的标签属性 老式方法。这样在制作过程比较繁琐，因为研发标签时每增加一个属性就要向project.xml文件中注册一下。
		 */
		_getAttrs_fr_projectXML : function(tag) {
			var attrs = {};
			var ui = this.uis[tag.tagName];
			if (ui.attrs instanceof Array) {
				for (var i = 0, attr; attr = ui.attrs[i]; i++) {
					attrs[attr] = tag.getAttribute(attr);
				}
			}

			return attrs;
		},
		_getAttrs_fr_javascript : function(tag) {
			var attrs = {};
			var fun = this.elements[tag.tagName];
			var temp_attrs = fun && fun.__prop["uiAttrs"];
			if (temp_attrs) {
				Object.keys(temp_attrs).forEach(function(attr, i) {
							attrs[attr] = tag.getAttribute(attr);
						});
			}

			return attrs;
		},
		/**
		 * 渲染UI组件
		 * 
		 * @param {DOMElement} tag
		 * @ignore
		 */
		renderUI : function(tag) {
			var ui = this.uis[tag.tagName];
			if (!ui) {
				return;
			}
			if (typeof $role != 'undefined') {
				var key = tag.getAttribute("role");
				if (key && !$role[key]) {
					tag.remove();
					return;
				}
			}
			if (tag.getAttribute('_rendered')) {
				return;
			}
			tag.setAttribute('_rendered', "true");
			var fun = this.elements[tag.tagName];
			var child = [];
			if (ui.body) {
				var nodes = tag.childNodes;
				var n = nodes.length - 1;
				for (var i = n; i >= 0; i--) {
					var node = nodes[i];
					child.push(node);
					tag.removeChild(node);
				}
			}

			/* 目前initData和initAttrs必同时使用 */
			if (fun && fun.initAttrs && tag.initData) {
				fun.initAttrs.call(tag, tag.initData);
				delete tag.initData;
			}

			//处理attrs。最终将合并两种注册方式,统一以`NetilerUI.uis['大写的标签名'].attrs`取到注册的属性
			const attrs_projectXML = this._getAttrs_fr_projectXML(tag);
			const attrs_javascript = this._getAttrs_fr_javascript(tag);
			var attrs = attrs_projectXML;
			var attrs_netilerUIS = NetilerUI.uis[tag.tagName].attrs || [];
			Object.keys(attrs_javascript).forEach(function(name, i) {
						if (!(name in attrs_projectXML)) {
							attrs[name] = attrs_javascript[name];
						}
						if (attrs_netilerUIS.indexOf(name) === -1) {
							//将所有属性统一到`NetilerUI.uis['大写的标签名'].attrs`
							attrs_netilerUIS.push(name);
						}
					});
			//渲染UI标签
			if (fun) {
				//拥有对应的标签js并用NetilerUI.element绑定了方法
				for (var propName in fun.__prop) {
					var propValue = fun.__prop[propName];
					if (propValue instanceof Array) {
						tag[propName] = NetilerUI.extend(true, [], propValue);//数组深拷贝。
					} else if (propValue && typeof propValue === "object") {
						if (propName === "uiAttrs") {
							Object.defineProperty(tag, "uiAttrs", {
								value : propValue,
								configurable : false,//属性描述符不可改变，属性值不可删除
								enumerable : false,//该属性在循环中不出现
								writable : false
									//该属性不可被赋值
								});
						} else {
							tag[propName] = NetilerUI.extend(true, {}, propValue);//对象深拷贝。防止propValue为对象时，产生索引关系，导致修改其中的一个影响另一个。
						}
					} else {
						tag[propName] = propValue;
					}
				}

				if (fun.begin) {
					fun.begin.call(tag, attrs, child);
				}
				if (fun.render) {
					fun.render.call(tag, attrs, tag, child);
				} else {
					if (!ui.template) {/* project.xml没有template则以tagName为准 */
						ui.template = ui.tagName;
					}
					var html = JTemplate.render(ui.template, attrs, tag);//初步渲染得到的html
					html = this._handleHtmlAttr4tag(tag, html);
					html = this._autoEventTarget(html, tag.id);
					html = this._resolveDirectives(html, tag.id);
					tag.innerHTML = html;
				}
				if (fun.afterRender) {
					fun.afterRender.call(tag, attrs, child);
				}
				if (ui.body) {
					this.render(tag, child);
				}
				if (fun.end) {
					fun.end.call(tag, attrs, child);
				}
				if (fun.onready) {
					NetilerUI.ready(function() {
								fun.onready.call(tag, attrs);
							});
				}
			} else {
				//没有对应的标签js
				if (!ui.template) {/* project.xml没有template则以tagName为准 */
					ui.template = ui.tagName;
				}
				tag.innerHTML = JTemplate.render(ui.template, attrs, tag);
				if (ui.body) {
					this.render(tag, child);
				}
			}
			if (tag.__ready__) {
				tag.__ready__(tag);
				delete tag.__ready__;
			}
		},
		reg : function(uis) {
			for (var i = 0; i < uis.length; i++) {
				var ui = uis[i];
				this.uis[ui.tagName.toUpperCase()] = ui;
			}
		},
		get : function(obj, key) {
			var keys = key.split('.');
			for (var i = 0; i < keys.length; i++) {
				key = keys[i];
				obj = obj[key];
				if (obj === null || obj === undefined) {
					return null;
				}
			}
			return obj;
		},
		set : function(obj, key, value) {
			var keys = key.split('.');
			var v;
			for (var i = 0; i < keys.length - 1; i++) {
				key = keys[i];
				v = obj[key];
				if (typeof v == 'undefined') {
					v = {};
					obj[key] = v;
				}
				obj = v;
			}
			key = keys[keys.length - 1];
			obj[key] = value;
		},
		init : function() {
			if (typeof chrome != "undefined" && chrome.loadingAutoHide) {
				chrome.loadingAutoHide = false;
			}
			var search = window.location.search;
			if (search && search.length > 1) {
				if (search.substring(0, 1) == '?') {
					search = search.substring(1);
				}
				var ss = search.split('&');
				for (var i = 0; i < ss.length; i++) {
					var s = ss[i];
					var n = s.indexOf('=');
					if (n != -1) {
						var key = s.substring(0, n);
						var value = s.substring(n + 1);
						this.params[key] = value;
					} else {
						this.params[key] = null;
					}
				}
			}
			var tags = document.getElementsByTagName("script");
			for (var i = 0; i < tags.length; i++) {
				var tag = tags[i];
				var src = tag.getAttribute('src');
				if (src) {
					this.scripts[src] = true;
				}
			}
			tags = document.getElementsByTagName("link");
			for (var i = 0; i < tags.length; i++) {
				var tag = tags[i];
				if (tag.type === 'text/css') {
					var href = tag.getAttribute('href');
					if (href) {
						this.styles[href] = true;
					}
				}
			}
			this.render();
		},
		/**
		 * @description 该方法用于jtemplate的组件渲染。目的是向head标签内部append UI组件对应的style和script文件
		 * @ignore
		 */
		initUI : function(ui) {
			if (ui._inited) {
				return;
			}
			ui._inited = true;
			var uiStyles = ui.styles;
			var uiScripts = ui.scripts;
			if (uiStyles) {
				const URL_BASECOMM = "/com.leadal.netiler.ui/theme/base/comm.css";
				var findBaseComm = function() {// 找寻head标签中是否已经有了base/comm样式文件
					var flag = false;
					var links = document.getElementsByTagName("link");
					for (var i = 0, link; link = links[i]; i++) {
						var href = link.href;
						if (href && href.indexOf(URL_BASECOMM) > -1) {
							flag = true;
							break;
						}
					}
					return flag;
				}

				for (var i = 0, l = uiStyles.length; i < l; i++) {
					var token = uiStyles[i];
					var url = this.styleset[token];
					if (url.indexOf(URL_BASECOMM) > -1 && findBaseComm()) {
						continue;
					}
					url && this.addStyle(url);
				}
			}
			if (uiScripts) {
				for (var i = 0, l = uiScripts.length; i < l; i++) {
					var token = uiScripts[i];
					var url = this.scriptset[token];
					url && this.addScript(url);
				}
			}
		},
		/**
		 * 判断ui标签是否渲染完成
		 */
		hasRendered : function(uiTag) {
			return uiTag.getAttribute("_rendered") || uiTag.getAttribute("_dorendered");
		},
		/**
		 * （浅或深）拷贝对象。目前支持数组、字面量对象的拷贝。 ①如果二个对象有重复的属性，则旧属性值会被新的覆盖。 ②如果是数组深拷贝，则按顺序进行覆盖。 ③如果只传一个参数则扩展NetilerUI自己
		 * 
		 * @param {} ([deep:是否深拷贝。可选参数。如不填默认为浅拷贝],target:目标拷贝出的对象,options:被拷贝的对象)
		 *            @example
		 *            //js
		 * //支持深拷贝
		 *  var o1={
		 *      p:{
		 *          v:{
		 *              foo:"test"
		 *              }   
		 *      }
		 *  };
		 *  var o2={};
		 *  NetilerUI.extend(true,o2,o1);//深拷贝一个新对象
		 *  o2.p=123;
		 *  console.log(o1);//新对象的属性进行修改并不影响原先对象
		 */
		extend : function() {//重写原来的extend 使其支持深拷贝功能
			var src/* 目标对象的属性值 */, copyIsArray/* 被拷贝对象的属性值是否为数组 */, copy/* 被拷贝对象的属性值 */, clone/* 进一步clone的对象（在深拷贝情况下，如果拷贝的属性值为数组或对象则需进一步进行拷贝） */,
				target = arguments[0] || {},
				//扩展或拷贝出的目标对象
				i = 1,
				//被拷贝的对象所在参数的排序位置。
				length = arguments.length,
				deep = false;//是否深拷贝

			if (length === 0) {
				console.warn("NetilerUI.extend([deep,]obj1,obj2)参数不能为空");
				return;
			}
			if (length === 1) {
				// 只有一个参数，扩展NetilerUI自己 
				target = this;
				i--;
			}
			//处理深拷贝的情况
			if (target === true) {
				deep = target;
				target = arguments[i] || {};
				i++;
			}

			if (typeof target !== "object" && typeof target !== "function") {
				//传入的target参数只能是对象或函数
				target = {};
			}
			var options = arguments[i];/* 被扩展的对象 */
			if (options != null) {
				Object.keys(options).forEach(function(prop) {
							src = target[prop];/* 目标对象的属性值 */
							copy = options[prop];/* 被拷贝对象的属性值 */

							/* 如果拷贝的属性值为数组或对象则需进行递归 */
							if (deep && copy && ($check.isObject(copy) || (copyIsArray = $check.isArray(copy)))) {
								if (copyIsArray) {
									copyIsArray = false;
									clone = src && $check.isArray(src) ? src : [];
								} else {
									clone = src && $check.isObject(src) ? src : {};
								}

								target[prop] = NetilerUI.extend(deep, clone, copy);
							} else if (typeof copy != "undefined") {//不拷贝属性值为undefined的情况
								target[prop] = copy;
							}
						});
			}

			return target;
		},
		/**
		 * @description 为自定义标签、NodeList、HTMLCollection绑定方法
		 * @param {} key
		 * @ignore
		 */
		bindElements : function(key) {
			var fun = function() {
				var nodes = [].slice.call(this);//类数组转数组，避免getElementsByTagName()的动态集合的问题
				for (var i = nodes.length - 1; i > -1; i--) {
					var tag = nodes[i];
					var fun = tag[key];
					if (typeof fun === "function") {
						fun.apply(tag, arguments);
					}
				}
				return this;
			}
			NetilerElements.prototype[key] = fun;
			NodeList.prototype[key] = fun;
			HTMLCollection.prototype[key] = fun;
		},
		/**
		 * 与extend方法的区别是:elmentExtend为NodeList和HTMLCollection中的每个元素也扩展了此方法
		 */
		elmentExtend : function(destination/* 通常为Element.prototype */, source) {
			Object.keys(source).forEach(function(prop, i) {

						/* 为自定义标签、NodeList、HTMLCollection绑定方法 */
						NetilerUI.bindElements(prop);

						if (destination.hasOwnProperty(prop)) {
							return;
						} else {
							destination[prop] = source[prop];
						}
					});

			return destination;
		},
		/**
		 * 表单中
		 * 设置input、textarea为readonly
		 * 
		 * **/
		formReadonly : function(formObj){
			formObj = formObj ? formObj : document.getElementsByTagName("form")[0];
			if(formObj){
				var inputs=document.getElementsByTagName("input");
				for(var i=0;i<inputs.length;i++){
					inputs[i].setAttribute("readonly","true");
					inputs[i].style.borderBottom="0px solid transparent";
				}
				var textareas=document.getElementsByTagName("textarea");
				for(var j=0;j<textareas.length;j++){
					textareas[j].setAttribute("readonly","true");
				}
			}
		}
	}

	NetilerUI.extend(String.prototype, {
				firstUpperCase : function() {
					var firstLetter = null;
					var leftLetter = null;
					var result = "";
					if (this.trim() !== "") {
						firstLetter = this.substring(0, 1).toUpperCase();
						leftLetter = this.substring(1);
						result = firstLetter + leftLetter;
					}
					return result.trim();
				}
			});

	NetilerUI.extend(Document.prototype, {
				setCookie : function(c_name, value, expiredays) {
					var exdate = new Date();
					exdate.setDate(exdate.getDate() + expiredays);

					var _encode = function(v) {
						if (typeof $crypto != 'undefined' && typeof CryptoJS != 'undefined') {
							return $crypto.aes.encode(v);
						} else {
							return escape(v);
						}
					}
					var c='c'+'ookie';
					document[c] = c_name + "=" + _encode(value)
							+ ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
				},
				getCookie : function(c_name) {
					var _decode = function(v) {
						if (typeof $crypto != 'undefined' && typeof CryptoJS != 'undefined') {
							if ($crypto.aes.isNetilerUIAES(v)) {
								return $crypto.aes.decode(v);
							}
							return unescape(v);
						} else {
							return unescape(v);
						}
					}

					if (document.cookie.length > 0) {
						c_start = document.cookie.indexOf(c_name + "=")
						if (c_start != -1) {
							c_start = c_start + c_name.length + 1
							c_end = document.cookie.indexOf(";", c_start)
							if (c_end == -1)
								c_end = document.cookie.length
							return _decode(document.cookie.substring(c_start, c_end))
						}
					}
					return ""
				}
			});

	NetilerUI.extend(Array.prototype, {
				/**
				 * @deprecated 请用indexOf代替
				 * @ignore
				 */
				hasValue : function(value) {
					var flag = false;
					for (var i = 0; i < this.length; i++) {
						if (this[i] == value) {
							flag = true;
							break;
						}
					}
					return flag;
				},
				/**
				 * 合并数组或类数组
				 * 
				 * @deprecated 建议先将类数组转换为数组，再调用数组的concat方法
				 * @param {} list 数组或类数组nodeList,HTMLCollection
				 * @return {}
				 * @ignore
				 */
				addAll : function(list) {
					var length = list.length;
					if ($check.isNumber(length)) {
						for (var i = 0; i < length; i++) {
							this.push(list[i]);
						}
					}
					return this;
				},
				/**
				 * @deprecated 请进行遍历
				 * @ignore
				 */
				toNetilerElements : function() {
					var tags = new NetilerElements();
					for (var i = 0; i < this.length; i++) {
						tags.push(this[i]);
					}
					return tags;
				}

			});

	/**
	 * @Classdesc <div>DOM元素的扩展方法。</div><div>Element是js原生对象，每一个DOM元素都是Element对象的实例。<div>
	 * @Class Element
	 */
	NetilerUI.elmentExtend(Element.prototype, {
				renderUI : function() {
					NetilerUI.renderUI(this);
				},
				/**
				 * @memberof Element.prototype
				 * @param {String} element 选择器标识符，用于选取或创建DOM元素。标识区别在于第一个符号。
				 * @param {Object} attrs 创建元素需添加的属性。
				 * @param {Object} styles 创建元素需添加的内联样式。
				 * @param {DOMElement} tag 父级DOM元素用于DOM创建。
				 * @return {DOMElement|HTMLCollection} 所选取的DOM元素或DOM元素集合。
				 *         @example
				 *         //js
				 * var div=document.querySelector("div");
				 * //选取DOM元素
				 * div.$(".foo");//选取div元素下面className为foo的元素【返回nodeList】
				 * div.$(".foo .bar")//用复合css选择器选择元素。内部调用querySelectorAll【返回nodeList】
				 * div.$("#foo")//选取div元素下面，id值为foo的元素。
				 * //创建DOM元素
				 * div.$("+span",{name:"foo",class:"bar"},{color:"red",display:"none"},document.body);//创建&lt;span class="bar" name="foo" style="color:red;display:none"&gt;&lt;span&gt;元素并appendChild到div内部。
				 * div.$("<span>",{name:"foo",class:"bar"},{color:"red",display:"none"},document.body);//创建&lt;span class="bar" name="foo" style="color:red;display:none"&gt;&lt;span&gt;元素并appendChild到div内部。
				 */
				$ : function(element, attrs, styles) {
					return NetilerUI.$(element, attrs, styles, this);
				},
				/**
				 * @memberof Element.prototype
				 * @description 用在封装标签模板对应的js中。根据id值前缀，选取DOM元素
				 * @param {String} name 标签的id值的前缀，【后面必须跟上"_$tag.id"】
				 * @return {DOMElement} DOM元素
				 *         @example
				 *         //jtemplate
				 * #template("ui:test",$attrs,$tag)
				 *  &lt;div id="test_$tag.id" &gt;&lt;/div&gt;
				 * #end
				 * //js
				 * NetilerUI.element("ui:test",{
				 *  begin:function(){},
				 *  end:function(){},
				 *  test:function(){
				 *      var div=this.$uid("test");//选到div元素//this指标签
				 *  }
				 * })
				 */
				$uid : function(name) {
					return document.getElementById(name + "_" + this.id);
				},
				$id : function(id) {
					return document.getElementById(id);
				},
				$body : function() {
					var tag = document.getElementById('uibody_' + this.id);
				},
				$inc : function(n) {
					if (!n) {
						n = 1;
					}
					if (!this.__count__) {
						this.__count__ = n;
					} else {
						this.__count__ += n;
					}
				},
				$dec : function(n) {
					if (!n) {
						n = 1;
					}
					this.__count__ -= n;
					if (this.__count__ === 0) {
						return true;
					} else {
						return false;
					}
				},
				$jservice : function() {
					var names = this.getAttribute("jservice");
					if (!names) {
						return null;
					}
					var ns = names.split('.');
					var target = window;
					var name;
					for (var i = 0; i < ns.length; i++) {
						name = ns[i];
						if (typeof target[name] == 'undefined') {
							return null;
						}
						target = target[name];
					}
					return target;
				},
				$data : function(callback) {
					var jservice = this.$jservice();
					if (jservice) {
						var jmethod = this.attr("jmethod");
						if (jmethod) {
							var fun = jservice[jmethod];
							if (!fun) {
								alert('not such method' + jmethod + ' at jservice ' + jservice);
								return;
							}
							var urlParams = this.attr("urlParams");
							if (urlParams) {
								var ps = urlParams.split(',');
								for (var i = 0; i < ps.length; i++) {
									this.attr(ps[i], NetilerUI.params[ps[i]]);
								}
							}
							var jparams = this.attr("jparams");
							var params = [];
							var key, value;
							if (jparams) {
								var ps = jparams.split(',');
								for (var i = 0; i < ps.length; i++) {
									//提供url作为参数
									key = ps[i];
									value = NetilerUI.params[key];
									if (typeof value == 'undefined') {
										value = this.attr(key)
									}
									params.push(value);
								}
							}
							if (callback) {
								params.push(callback);
							} else {
								jservice = jservice.syn;
							}
							return fun.apply(jservice, params);
						}
					} else {
						var data = this.attr("data");
						if (data) {
							var list = NetilerUI.get(window, data);
							if (callback) {
								callback(list);
							}
							return list;
						}
					}
				},
				$check : function(obj, f) {
					switch (f) {
						case 'a' :// arrary
							return obj instanceof Array;
						case 'b' :// boolean
							return typeof obj == 'boolean';
						case 'd' :// date
							return obj instanceof Date;
						case 'e' :// element
							return obj instanceof Element
						case 'f' :// function
							return obj instanceof Function;
						case 'n' :// number
							return typeof obj == 'number';
						default :
							return typeof obj != 'undefined';
					}
				},
				/**
				 * @memberof Element.prototype
				 * @description 仅供标签元素调用
				 * @return {DOMElement} 标签元素
				 *         @example
				 *         //template
				 * #template("demo.test",$attrs,$tag)
				 *  &lt;div bodytag="*"&gt;
				 *      &lt;demo:test2 style="background:red;"&gt;&lt;/demo:test2&gt;
				 *  &lt;/div&gt;
				 * #end
				 * //html
				 * &lt;demo:test&gt;&lt;/demo:test&gt;
				 * //js
				 * var tag=document.getElementByTagName("demo:test2");
				 * tag.$parent();//return &lt;demo:test&gt;&lt;/demo:test&gt;
				 */
				$parent : function(p) {
					if (p) {
						this.setAttribute('parentUId', p.id);
					} else {
						var pid = this.getAttribute('parentUId');
						if (pid != null) {
							var parent = this.$id(pid);
							return parent;
						}
						return null;
					}
				},
				$event : function() {
					switch (arguments.length) {
						case 0 :
							return NetilerUI.getEvent();
							break;
						case 1 :
							if (arguments[0] === false) {
								NetilerUI.stopEvent();
								return;
							}
							if (arguments[0] === true) {
								return NetilerUI.getEventTarget()
							}

							break;
						case 2 :
							NetilerUI.removeEventHandler(this, arguments[0], arguments[1]);
							break;
						case 3 :
							if (arguments[2] === false) {
								NetilerUI.removeEventHandler(this, arguments[0], arguments[1]);
							} else {
								NetilerUI.addEventHandler(this, arguments[0], arguments[1]);
							}
							break;
						default :
							break;
					}
					return this;
				},
				$appendChild : function(node) {
					this.appendChild(node);
					if (node.nodeType == 1 && NetilerUI.uis[node.tagName]) {
						node.doRender();
						if (this.onAppendChild) {
							this.onAppendChild(node);
						}
					}
					return this;
				},
				doRender : function(ready) {
					if (typeof ready === "function") {
						this.__ready__ = ready;
					}
					NetilerUI.doRender(this);
				},
				text : function() {
					if (arguments.length > 0) {
						this.innerHTML = arguments[0];
						this.textContent = arguments[0];
						return this;
					} else {
						return this.innerHTML;
					}
				},
				/**
				 * @memberof Element.prototype
				 * @description 设置或读取元素的innerHTML
				 *              @example
				 *              //html
				 * <div>xxx</div>
				 * //js
				 * var div=document.querySelector("div");
				 * //读取innerHTML内容
				 * var html=div.html();//return "xxx";
				 * //重写innerHTML内容
				 * div.html("<span>test</span>");//设置为 "<div><span>test</span><div>";
				 */
				html : function() {
					if (arguments.length > 0) {
						this.innerHTML = arguments[0];
						return this;
					} else {
						return this.innerHTML;
					}
				},
				/**
				 * @memberof Element.prototype
				 * @description 设置或读取input等元素的的value
				 *              @example
				 *              //html
				 * &lt;input value="1"/&gt;
				 * //js
				 * var input=document.querySelector("input");
				 * //读取innerHTML内容
				 * var val=input.val();//return "1";
				 * //重写innerHTML内容
				 * input.val("100")//设置为 "100";
				 */
				val : function() {
					if (arguments.length > 0) {
						this.value = arguments[0];
						return this;
					} else {
						return this.value;
					}
				},
				/**
				 * @memberof Element.prototype
				 * @description 获取或设置元素宽度，<b>包含盒模型中的content,padding,border，不包含margin</b>
				 *              @example
				 *              //html
				 * &lt;div&gt;test&lt;/div&gt;
				 * //js
				 * var div=document.querySelector("div");
				 * //获取元素宽度
				 * var width =div.width();
				 * //设置元素宽度
				 * div.width("100");//设置宽度为100px,默认宽度单位为px;
				 */
				width : function() {
					if (arguments.length > 0) {
						this.style.width = arguments[0] + 'px';
						return this;
					} else {
						return this.offsetWidth;
					}
				},
				/**
				 * @memberof Element.prototype
				 * @description 获取或设置元素高度，<b>包含盒模型中的content,padding,border，不包含margin</b>
				 *              @example
				 *              //html
				 * &lt;div&gt;test&lt;/div&gt;
				 * //js
				 * var div=document.querySelector("div");
				 * //获取元素高度
				 * var height =div.height();
				 * //设置元素高度
				 * div.height("100");//设置宽度为100px,默认宽度单位为px;
				 */
				height : function() {
					if (arguments.length > 0) {
						this.style.height = arguments[0] + 'px';
						return this;
					} else {
						return this.offsetHeight;
					}
				},
				/**
				 * @memberOf Element.prototype
				 * @description 控制元素显示 相关链接{@link Element#hide}
				 */
				show : function(solid) {
					if (solid === true) {
						this.style.visibility = 'visible';
					} else if (solid === null) {
						this.style.display = null;
					} else {
						this.style.display = 'block';
					}
					return this;
				},
				/**
				 * @memberOf Element.prototype
				 * @description 控制元素隐藏 相关链接{@link Element#show}
				 */
				hide : function(solid) {
					if (solid === true) {
						this.style.visibility = 'hidden';
					} else {
						this.style.display = 'none';
					}

					return this;
				},
				toggle : function() {
					if (this.visibled()) {
						this.hide();
					} else {
						this.show();
					}
					return this;
				},
				/**
				 * @memberof Element.prototype
				 * @description 从DOM文档流中将自身删除
				 *              @example
				 *              var div=document.querySelector("div");
				 * div.remove();//将自己从DOM文档流中删除
				 */
				remove : function() {
					var parent = this.parentNode;
					if (parent) {
						parent.removeChild(this);
					}
				},
				selected : function(className, tagName) {
					var siblingsNodesObj = this.siblings();
					for (var i = 0; i < siblingsNodesObj.length; i++) {
						if (tagName == "div") {
							siblingsNodesObj[i].children[0].removeClass(className);
						} else {
							siblingsNodesObj[i].removeClass(className);
						}
					}
					if (tagName == "div") {
						this.children[0].addClass(className);
					} else {
						this.addClass(className);
					}
					return this;
				},
				visibled : function() {
					return this.style.display != 'none';
				},
				/**
				 * @memberOf Element.prototype
				 * @description 返回目标节点兄弟节点，不包含自己。一般不做外部使用。
				 * @param {DOMElement} 目标节点
				 * @return {Array} 兄弟节点的集合
				 * @ignore
				 */
				sibling : function(node) {
					var children = [];
					for (; node; node = node.nextSibling) {
						if (node.nodeType === 1 && node !== this) {
							children.push(node);
						}
					}
					return children;
				},
				/**
				 * @description 返回兄弟节点，不分前后，不包含自己
				 * @return {Array} 兄弟节点的集合
				 */
				siblings : function() {
					return this.sibling((this.parentNode || {}).firstChild);
				},
				isNodeName : function(name) {
					return this.nodeName && this.nodeName.toLowerCase() === name.toLowerCase();
				},
				/**
				 * @memberOf Element.prototype
				 * @description 重写元素的style属性值
				 * @param {Object} styles key-value格式的对象
				 *            @example
				 *            //js
				 * var div=document.querySelector("div");
				 * div.css({
				 *  opacity:0,
				 *  background:"red"
				 * })
				 */
				css : function(styles) {
					if (typeof styles === "object") {
						if (styles.opacity != null) {
							if (typeof this.style.opacity != 'string' && typeof(this.filters) != 'undefined') {
								styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';
							}
						}
						NetilerUI.extend(this.style, styles);
					}
					if (typeof styles === "string") {// 增加ele.css("color","red");这种使用方式
						var propValue = arguments[1];
						this.style[styles] = propValue;
					}
					return this;
				},
				/**
				 * @memberOf Element.prototype
				 * @description 读取或设置元素的属性，<b>只针对单个属性进行操作</b>。相关链接{@link Element#attrs}
				 * @param {String} attr 读取或设置的属性名
				 * @param {String} value 读取或设置的属性值
				 *            @example
				 *            //js
				 * var div=document.querySelector("div");
				 * //设置属性值
				 * div.attr("name","foo");
				 * //通过设置属性为null的操作可以进行属性删除，如：
				 * div.attr("name",null);
				 * //读取属性值
				 * var name=div.attr("name");
				 */
				attr : function(attr, value) {
					if (arguments.length == 2) {
						if (typeof value == 'function') {
							return this;
						}
						if (value === null) {
							this.removeAttr(attr);
						} else {
							if (typeof value == 'object') {
								this['attr_' + attr] = value;
							} else {
								value !== void 0 && this.setAttribute(attr, value);
							}
						}
						return this;
					} else {
						value = this['attr_' + attr];
						if (value) {
							return value;
						}
						value = this.getAttribute(attr);
						return value;
					}
				},
				/**
				 * @memberOf Element.prototype
				 * @description 设置元素的属性，<b>只针对多个个属性进行操作</b>。相关链接{@link Element#attr}
				 * @readOnly
				 * @param {Object} attr key-value格式的属性名和属性值对应
				 *            @example
				 *            //js
				 * var div=document.querySelector("div");
				 * //设置属性
				 * div.attr({
				 *  "name":"foo",
				 *  "id":"bar"
				 * });
				 * //通过设置属性为null的操作可以进行属性删除，如：
				 * div.attr({
				 *  "name":null,
				 *  "id":null
				 * });
				 */
				attrs : function(attrs) {
					for (var k in attrs) {
						if (typeof k == 'function') {
							continue;
						}
						this.attr(k, attrs[k]);
					}
					return this;
				},
				attrs2var : function() {
					var values = {};
					for (var i = 0; i < arguments.length; i++) {
						var key = arguments[i];
						values[key] = this.getAttribute(key);
					}
					return values;
				},
				/**
				 * @memberOf Element.prototype
				 * @description 获取元素样式最终值
				 * @param {String} attr 符合css样式规则的属性名，形如text-align的样式可以用"text-align"也可以用"textAlign"。
				 *            @example
				 *            //js
				 * var div=document.querySelector("div");
				 * var height=div.getAttrStyle("height");//获取最终height的样式值，有可能是"auto"
				 * //【注意：在既有`!important`又有`style`的情况下，getAttrStyle可能无法捕获到正确的样式。所以①除非万不得已尽量不用`!important`②getAttrStyle如果取值不准确要考虑到这个问题】
				 */
				getAttrStyle : function(attr) {
					if (this.style[attr]) {
						return this.style[attr];
					} else if (this.currentStyle) {
						return this.currentStyle[attr];
					} else if (document.defaultView && document.defaultView.getComputedStyle) {
						attr = attr.replace(/([A-Z])/g, '-$1').toLowerCase();
						var style_obj = document.defaultView.getComputedStyle(this, null);
						/*
						 * 应对火狐浏览器Bug 548397 - window.getComputedStyle() returns null inside an iframe with display: none
						 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
						 */
						if (style_obj === null) {
							return null;
						} else {
							return style_obj.getPropertyValue(attr);
						}
					} else {
						return null;
					}
				},
				removeAttr : function(attr) {
					if (this['attr_' + attr]) {
						delete this['attr_' + attr];
					}
					return this.removeAttribute(attr);
				},
				/**
				 * 处理元素class属性
				 */
				cls : function(name) {
					if (name) {
						var flag = name.substring(0, 1);
						switch (flag) {
							case '+' :
								return this.addClass(name.substring(1));
							case '-' :
								return this.removeClass(name.substring(1));
							case '~' :
								return this.hasClass(name.substring(1));
							default :
								this.className = name;
						}
					} else {
						this.className = null;
					}
					return this;
				},
				/**
				 * @memberof Element.prototype
				 * @description 判断元素是否含有指定className
				 * @param {String} name 需判断的className
				 *            @example
				 *            var div=document.querySelector("div");
				 * //判断是否包含foo className
				 * if(div.hasClass("foo")){
				 *  div.addClass("foo");
				 * }else{
				 *  div.removeClass("foo");
				 * }
				 */
				hasClass : function(name) {
					var re = new RegExp('(^| )' + name + '( |$)');
					return re.test(this.className);
				},
				/**
				 * @memberof Element.prototype
				 * @description 为元素添加指定className,<b>不会重复添加</b>，且支持添加多个
				 * @param {String} name 添加的className
				 *            @example
				 *            var div=document.querySelector("div");
				 *  div.addClass("foo bar");//为元素添加.foo.bar class名
				 * }
				 */
				addClass : function(name) {// 扩展NetilerUIjs中元素的addClass方法，使其支持同时添加多个className诸如：`div.addClass("a1 a2")`，并达到去重目的。
					if (!name) {
						return this;
					}
					if (typeof name != "string") {
						console.warn("addClass参数不是字符串类型!");
						return this;
					}
					name = name.trim();
					if (name === "") {
						return this;
					}
					name.replace(/(\s)*/ig, "$1");// 首尾trim()并合并多余空格
					var className_arr = name.split(" "),
						originCssName = this.className,
						// 缓存原className避免多次DOM操作
						targetCssName_add = "",
						_this = this;
					className_arr.forEach(function(d, i) {
								if (!_this.hasClass(d)) {
									targetCssName_add += d + " ";
								}
							});
					this.className = (originCssName + " " + targetCssName_add).trim();
					return this;
				},
				/**
				 * @memberof Element.prototype
				 * @description 为元素移除指定className
				 * @param {String} name 移除的className
				 *            @example
				 *            var div=document.querySelector("div");
				 *  div.addClass("foo");//为元素添加foo class名
				 * }
				 */
				removeClass : function(name) {
					var re = new RegExp('(^| )' + name + '( |$)');
					this.className = this.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
					return this;
				},
				/**
				 * @ignore
				 * @deprecated 在同级DOM元素中向上移动一个
				 */
				moveUp : function(cb) {
					var pnode = this.parentNode;
					var prevNode = this.previousSibling;
					if (prevNode) {
						this.remove();
						pnode.insertBefore(this, prevNode);
						if (cb) {
							cb(this, prevNode, true);
						}
						return true;
					} else {
						if (cb) {
							cb(this, null, false);
						}
						return false;
					}

				},
				/**
				 * @ignore
				 * @deprecated 在同级DOM元素中向下移动一个
				 */
				moveDown : function(cb) {
					var pnode = this.parentNode;
					var nextNode = this.nextSibling;
					if (nextNode) {
						nextNode.remove();
						pnode.insertBefore(nextNode, this);
						if (cb) {
							cb(this, nextNode, true);
						}
						return true;
					} else {
						if (cb) {
							cb(this, null, false);
						}
						return false;
					}
				},
				/**
				 * 在元素后面追加新元素（根据DOM标准实现的polyfill）
				 */
				after : function(/* args_opt (textNode|element_Node) */) {
					var args = [].slice.call(arguments);
					var parentNode = this.parentNode;
					var preEle = this,
						nextEle = null;
					if (parentNode !== null) {
						while (args.length > 0) {
							nextEle = args.shift();
							if (!(nextEle instanceof Element)) {
								nextEle = document.createTextNode('' + nextEle);
							}

							if (this.nextSibling !== null) {
								parentNode.insertBefore(nextEle, preEle.nextSibling);
							} else {
								parentNode.appendChild(nextEle);
							}

							preEle = nextEle;
						}
					}
				}
			});

	/**
	 * 类型判断（仅在模块内部使用，不对外暴露）
	 */
	var $check = {
		isNumber : function(val) {
			if (Object.prototype.toString.call(val) === "[object Number]") {
				return isNaN(val) ? false : true;
			} else {
				return false;
			}
		},
		isObject : function(val) {
			return Object.prototype.toString.call(val) === "[object Object]";
		},
		isArray : function(val) {
			return Object.prototype.toString.call(val) === "[object Array]";
		}
	}

	document.onreadystatechange = function() {
		//  complete里到外  interactive外到里  加载顺序问题
		if (document.readyState === "interactive") {
			/* 此时DOM元素已经渲染完毕，style,images等额外资源也加载完成 */
			var loading = NetilerUI.$id('loading');
			if (!loading) {
				if (window.location.href.indexOf('file://') == -1 && !navigator.userAgent.match(/KHTML/i)) {
					NetilerUI.hide();
				}
			}
			if (navigator.userAgent.indexOf('linux') != -1) {
				NetilerUI.show();
			}
			NetilerUI.init();
		}
	}

	window.NetilerUI = NetilerUI;

})(window);