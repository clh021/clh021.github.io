/*******************************************************************************
 * @fileOverview predator.js 捕食者 依赖于NetilerUI.js
 * 
 * @author :fqhunter
 * 
 * @created :2014-09-26
 ******************************************************************************/

(function(){
// 捕食者
var predator = {
	// 导弹(一种可重复使用的导弹)
	missile : function() {
		this.task = [];// 任务
		this.nest = null;// 恐怖分子老巢
		this.laden = null;// 恐怖分子
		this.lock = false;
		this.taskId = putil.id('task');

	},
	eventNames : ['click', 'mousedown', 'mouseover', 'mouseup', 'dblclick',
			'focus', 'blur', 'change', 'keydown', 'keyup', 'keypress',
			'submit', 'select', 'checked'],
	// 弹库
	projectile : [],
	// 弹库容量
	volume : 10,
	/**
	 * 导弹工厂
	 */
	factory : function() {
		var m = new this.missile();
		this.volume++;
		return m;
	},
	/**
	 * 发射导弹
	 */
	launch : function() {
		var missile = $o(this.projectile).synPop();
		if (!missile) {
			missile = this.factory();
		} else {
			missile.nest = null;
			missile.laden = null;
			missile.lock = false;
		}
		return missile;
	},
	/**
	 * 导弹回收
	 * 
	 * @param {}
	 *            missile 导弹
	 */
	recycle : function(missile) {
		// 只有在弹库未满时才能回收导弹
		if (this.projectile.length < this.volume && !missile.lock) {
			missile.lock = true;
			missile.nest = null;
			missile.laden = null;
			this.projectile.push(missile);
		}
	},

	math : {
		/**
		 * 保留小数点后几位
		 * 
		 * @param {}
		 *            v
		 * @param {}
		 *            count 保留小数点后几位
		 */
		fixed : function(v, count) {
			var flag = 1;
			while (count-- > 0) {
				flag *= 10;
			}
			return Math.round(v * flag) / flag;
		},
		/**
		 * 除法（v1/v2）
		 * 
		 * @param {}
		 *            v1
		 * @param {}
		 *            v2
		 * @param {}
		 *            count保留小数点后几位
		 */
		quotient : function(v1, v2, count) {
			return this.fixed(v1 / v2, count);
		},
		/**
		 * 取最小值
		 * 
		 * @param {}
		 *            nums
		 */
		min : function(nums) {
			var min = nums[0];
			for (var i = 1; i < nums.length; i++) {
				min = min > nums[i] ? nums[i] : min;
			}
			return min;
		},
		/**
		 * 取最大值
		 * 
		 * @param {}
		 *            nums
		 */
		max : function(nums) {
			var max = nums[0];
			for (var i = 1; i < nums.length; i++) {
				max = max < nums[i] ? nums[i] : max;
			}
			return max;
		}

	},
	/**
	 * 类型识别机器人
	 * 
	 * @type
	 */
	robot : {
		/**
		 * 判断是否为有效事件名
		 */
		isValidEvent : function(evtName) {
			return $o(predator.eventNames).indexOf(evtName) != -1;
		},
		/**
		 * 判断是否为窗口对象
		 */
		isWindow : function(val) {
			return Object.prototype.toString.call(val) === "[object Window]";
		},
		/**
		 * 判断是否为Event对象
		 */
		isEvt : function(val){
			var reg = /^\[object \w*Event\]$/i;
			return reg.test(Object.prototype.toString.call(val));
		},
		/**
		 * 判断是否为HTML元素
		 * 
		 * @param {}
		 *            val
		 * @return {}
		 */
		isEle : function(val) {
			var reg=/^\[object \w+?Element\]$/i;
			return reg.test(Object.prototype.toString.call(val));
		},
		/**
		 * 判断是否为文本节点
		 * 
		 * @param {}
		 *            val
		 * @return {}
		 */
		isTextEle : function(val) {
			return Object.prototype.toString.call(val) === "[object Text]";
		},
		/**
		 * 判断是否为表单元素
		 * 
		 * @param {}
		 *            val
		 * @param {}
		 *            type
		 * @return {}
		 */
		isFormEle : function(val, type) {
			if (this.isEle(val)) {
				var tagName = (val.tagName || val.nodeName).toLowerCase();
				return (tagName === 'select' || tagName === 'input'
						|| tagName === 'textarea' || tagName === 'option')
						&& (this.isInvalid(type) || val.type == type || tagName == type);
			} else {
				return false;
			}
		},
		/**
		 * 是否为undefined或null
		 */
		isUndef : function(val) {
			return val == null;
		},
		/**
		 * 除null,undefined以外的值
		 */
		isDef : function(val) {
			return !this.isUndef(val);
		},
		/**
		 * 过滤null、undefined、"null"、"undefined"、/\s{0,}/ig(空字符串等)、NaN。框架中非常常用的方法。
		 */
		isValid : function(val) {
			if(this.isString(val)){
				return this.isStr(val);
			}else if(val === false || val === 0){
				return true;
			}
			
			return val ? true : false;//过滤null、undefined、NaN
		},
		isInvalid : function(val) {
			return !this.isValid(val);
		},
		/**
		 * 布尔类型
		 */
		isBol : function(val) {
			return Object.prototype.toString.call(val) === "[object Boolean]";
		},
		/**
		 * 2017-1-24 新增方法 判断是否为字符串类型
		 */
		isString: function(val){
			return Object.prototype.toString.call(val) === "[object String]";
		},
		/**
		 * 字符串类型且不包含"null"、"undefined"、/\s{0,}/ig(空字符串等)，大量被应用在项目中
		 */
		isStr : function(val) {
			if(this.isString(val)){
				val = val.trim();
				return (val==="null" || val==="undefined" || val==="") ? false : true;
			}else{
				return false;
			}
		},
		/**
		 * 数字类型且不为NaN
		 */
		isNum : function(val) {
			if(Object.prototype.toString.call(val) === "[object Number]"){
				return isNaN(val) ? false : true;
			}else{
				return false;
			}
		},
		isFun : function(val) {
			return Object.prototype.toString.call(val) === "[object Function]";
		},
		isArr : function(val) {
			return Object.prototype.toString.call(val) === "[object Array]";
		},
		isValidArr : function(val) {
			return this.isArr(val) && val.length > 0;
		},
		isObj : function(val) {
			return Object.prototype.toString.call(val) === "[object Object]";
		},
		/**
		 * 是否为FormData对象的实例，目前仅在框架内部使用 
		 */
		isFormData : function(val){
			return Object.prototype.toString.call(val) === "[object FormData]";
		},
		isTrue : function(val) {
			return val === 'true' || val === true;
		},
		isFalse : function(val) {
			return val === 'false' || val === false;
		},
		isTrueFalse : function(val){
			return this.isTrue(val) || this.isFalse(val);
		},
		isReg : function(val) {
			return Object.prototype.toString.call(val) === "[object RegExp]";
		},
		/**
		 * 是否是客户端浏览器
		 */
		isNetilerBrowser : function(){
			return !!(typeof chrome != 'undefined' && chrome.window);/*南部35firefox浏览器存在chrome对象，但其不存在window属性*/
		},
		or : function() {
			var yes = false;
			$o($o(arguments).toArray()).each(function(i, v) {
						yes = probot.isValid(v);
						if (yes) {
							return false;
						}
					});
			return yes;
		},
		and : function() {
			var yes = true;
			$o($o(arguments).toArray()).each(function(i, v) {
						yes = probot.isValid(v);
						if (!yes) {
							return false;
						}
					});
			return yes;
		}
	},
	/**
	 * USB连线。不仅可以用于扩展function还可以扩展各种数据类型的属性。
	 * 
	 * @param {}
	 *            vector 载体
	 * @param {}
	 *            features 功能
	 */
	usb : function(vector, features) {
		
		Object.keys(features).forEach(function(key, i){
			vector[key] = features[key];
		});
	},
	/**
	 * 为p对象的nest网中的每个元素扩展新的方法。与usb方法区别在于：①只能绑定function。②是个库内部使用方法，只针对p对象的nest网中的每个元素扩展新方法。
	 * 
	 * @param {}
	 *            vector
	 * @param {}
	 *            features
	 */
	multiUSB : function(vector, features) {
		Object.keys(features).forEach(function(key, i){
			var fn = features[key];
			vector[key] = function() {
					var args = [].slice.call(arguments);
					var oself = this;
					var laden = this.laden;
					var ret;
					$o(this.nest).each(function(index, ele) {
								oself.laden = this;
								if (key === "css") {
									args.push(index);// 为兼容css方法中index参数
									ret = fn.apply(oself, args);// 如果有返回值并且其eachBreak属性为true，则提前结束回调函数
									args.pop();// 为兼容css方法中index参数
								} else {
									ret = fn.apply(oself, args);// 如果有返回值并且其eachBreak属性为true，则提前结束回调函数
								}
								if (probot.isObj(ret) && ret.eachBreak == true) {
									ret = undefined;
									return false;
								}
							});
					this.laden = laden;
					return ret === undefined ? this : ret;
				};
		});
	},
	/**
	 * 
	 * @param {}
	 *            vector
	 * @param {}
	 *            features
	 */
	evtUSB : function(vector, features) {
		Object.keys(features).forEach(function(evtName, i){
			vector[evtName] = function() {
					var args = arguments;
					var oself = this;
					this.nest.forEach(function(ele,i){
						if (args.length > 0 && probot.isFun(args[0])) {
							oself.$(ele).attachEvent(evtName, args[0]).$$();
						} else {
							if (oself.document().all) {
								ele[evtName].call(ele);
							} else {
								var evt = oself.document().createEvent("MouseEvents");
								evt.initEvent(evtName, true, true);
								ele.dispatchEvent(evt);
							}
						}
					});
					return this;
				};
		});
	},
	/**
	 * 工具包
	 * 
	 * @type
	 */
	util : {
		idIndex : 0,
		id : function(prefix) {
			prefix = prefix ? prefix : 'p';
			return prefix + '_' + putil.idIndex++;
		},
		
		/**
		 * 根据传入的缩放比例进行页面缩放定位已达到自适应分辨率的问题
		 * params (scale, panelWrap, screenWidth, screenHeight)
		 * 父容器和屏幕宽度和高度可不设置
		 */
		zoomScreen : function(){
			var scale = arguments[0];
			var panelWrap = arguments[1];
			var screenWidth = arguments[2] ? arguments[2] : document.body.clientWidth;
			var screenHeight = arguments[3] ? arguments[3] : document.body.clientHeight;
			var obj = {
				width : screenWidth/scale+"px",
				height : screenHeight/scale+"px",
				left : -(screenWidth/scale - screenWidth)/2 +"px" ,
				top : -(screenHeight/scale - screenHeight)/2+"px" 
			}
			if(panelWrap!=undefined){
				panelWrap.css({
		        	"position": "absolute",
		        	"transform": "scale("+scale+")",
		        	"-moz-transform": "scale("+scale+")",
		        	"-o-transform": "scale("+scale+")",
		        	"-webkit-transform": "scale("+scale+")",
		            "left": obj.left,
		            "top":  obj.top,
		            "width": obj.width,
		            "height": obj.height
		        })
			}
			return obj;
		},
		/**
		 * container 容器 对下拉框，找出合适的位置 pos 是数组 上左 上右 下右 下左 共四个点 width 下拉菜单的宽度
		 * height 下拉菜单的高度
		 */
		fitPosition : function(pos, width, height, container) {
			container = container ? container : document.body;
			var p = container.$p();
			var is = p.innerSize();
			var h = is.height;
			var w = is.width;
			var scroll = p.getScroll();
			p.$$end();
			var st = scroll.y;
			var sl = scroll.x;
			var p = {};
			if (probot.isArr(pos)) {// 多点
				var p1 = pos[0], p2 = pos[1], p3 = pos[2], p4 = pos[3];
				if (p4.y + height <= h + st) {
					if (p4.x + width <= w + sl) {
						p = p4;
					} else {
						p = {
							x : p3.x - width,
							y : p3.y
						};
					}
				} else {
					if (p1.x + width <= w + sl) {
						p = {
							x : p1.x,
							y : p1.y - height
						}
					} else {

						p = {
							x : p2.x - width,
							y : p2.y - height
						}
					}

				}
			} else {// 单点
				p.x = pos.x + width - sl > w ? (w + sl) - width : pos.x;
				p.y = pos.y + height - st > h ? (h + st) - height : pos.y;
			}
			p.x = p.x < 0 ? 0 : p.x;
			p.y = p.y < 0 ? 0 : p.y;
			return p;

		},
		/**
		 * 
		 * @param {}
		 *            url iframe打开的url地址
		 * @param {}
		 *            win
		 * @param {}
		 *            target iframe的name属性值
		 */
		open : function(url, win, target, params,hasResetURL) {
			win = probot.isValid(win) ? win : window;
			url = putil.setUrlVal(url, params);
			// add NetilerUI.resetURL
			//
			if(probot.isTrue(hasResetURL)){
				//判断是否已经resetURL
			}else{
				url = NetilerUI.resetURL(url);
			}
			if (probot.isNetilerBrowser()) {
				chrome.setAttribute('__opener__',win);
			}
			return win.open(url, target);
		},
		/**
		 * 判断是否以及加载过该JS
		 * 
		 * @param {}
		 *            url JS路径
		 * @param {}
		 *            createAble
		 */
		findElementByUrl : function(url, isScript) {
			var eles = document.getElementsByTagName(isScript
					? "script"
					: "link");
			for (var i = 0; i < eles.length; i++) {
				var ele = eles[i];
				var src = isScript ? ele.getAttribute('src') : ele
						.getAttribute('href');
				if (src == url) {
					return ele;
				}
			}
			return undefined;
		},
		/**
		 * 添加脚本或样式
		 * 
		 * @param {}
		 *            urls
		 * @param {}
		 *            ready
		 * @param {}
		 *            win
		 */
		addScriptOrStyle : function(urls, ready, win, config) {
			config = probot.isObj(config) ? config : {};
			config = {
				isScript : config.isScript || false
			}
			win = win ? win : window;
			urls = probot.isArr(urls) ? urls : [urls];
			var head = win.document.getElementsByTagName("head")[0];
			var count = 0;
			var ele = null;
			for (var i = 0; i < urls.length; i++) {
				var url = urls[i];
				var isScript = config.isScript || $o(url).endWith('.js');/*请求js文件（尤其某些外部框架中）不一定是以*.js结尾*/
				if (probot.isInvalid(this.findElementByUrl(url, isScript))) {
					count++;
					if (isScript) {
						ele = win.document.createElement('script');
						ele.type = "text/javascript";
						ele.src = url;
					} else {
						ele = win.document.createElement('link');
						ele.rel = "stylesheet";
						ele.type = "text/css";
						ele.href = url;
					}
					ele.loaded = false;
					ele.onload = ele.onreadystatechange = function() {
						var readyState = this.readyState;
						if (typeof readyState == 'undefined'
								|| readyState == 'loaded'
								|| readyState == 'complete') {
							if (--count == 0) {
								probot.isFun(ready) && ready.call(win, ele);
							}
						}
						$p(ele).ready().$$end();
						ele.loaded = true;
					}
					head.appendChild(ele);
				}
			}
			if (count == 0) {
				probot.isFun(ready) && ready.call(win, ele);
			}
		},
		/**
		 * 创建脚本
		 * 
		 * @param {String|Array}
		 *            urls
		 * @param {Function}
		 *            ready
		 * @param {WindowObject}
		 *            win
		 * @param {Boolean}
		 *            sequence 是否需要按顺序加载
		 */
		addScript : function(urls, ready, win, sequence) {
			if (sequence) {
				var r = urls.length > 1 ? function() {
					putil.addScript(urls, ready, win, sequence);
				} : ready;
				this.addScriptOrStyle([urls.shift()], r, win);/*之前老的用法中在这些urls中可能混杂着*.css,*.js文件*/
			} else {
				var config = {
					isScript : true/*请求js文件（尤其某些外部框架中）不一定是以*.js结尾，明确告诉addScriptOrStyle方法我要插入的是script元素*/
				}
				this.addScriptOrStyle(urls, ready, win, config);
			}

		},
		/**
		 * 创建样式
		 * 
		 * @param {}
		 *            urls
		 * @param {}
		 *            ready
		 */
		addStyle : function(urls, ready, win) {
			this.addScriptOrStyle(urls, ready, win);
		},
		/**
		 * 获得
		 * 
		 * @param {}
		 *            url
		 * @param {}
		 *            key
		 * @return {}
		 * 
		 */
		getUrlVal : function(url, key, decode) {
			var value;
			if (probot.isStr(url) && url.indexOf('?') != -1) {
				var temp = url.substring(url.indexOf('?') + 1);
				var items = temp.split('&');
				if (key) {
					$o(items).each(function(n, v) {
								if ($o(v).startWith(key)) {
									value = v.replace(key + '=', '');
									value = decode
											? putil.decode(value)
											: value;
									return false;
								}
							});
				} else {
					value = {};
					$o(items).each(function(n, v) {
						var vi = v.split('=');
						if (vi.length == 2) {
							value[vi[0]] = decode ? putil.decode(vi[1]) : vi[1];
						} else if (vi.length == 1) {
							value[vi[0]] = undefined;
						}

					});
				}
			} else {
				if (!key) {
					value = {};
				}
			}
			return value;
		},
		encode : function(val) {
			return probot.isValid(val) ? encodeURIComponent(val) : val;
		},
		decode : function(val) {
			return probot.isValid(val) ? decodeURIComponent(val) : val;
		},
		/**
		 * 将字符串转化为对象，代替eval(提升性能) 
		 * @param field: 必填，查询的字符串 
		 * @param obj: 必填，在什么对象范围内查找，通常是window
		 * @param isFormat:选填，布尔值，是否格式化常量
		 * @example
		 * //用法一
		 * var test={name:"leadal"}
		 * var obj = putil.fieldValue("test.name",window);//"leadal"
		 * //用法二
		 * var test={nums:[1,2,3,4]}
		 * var obj = putil.fieldValue("test.nums[2]", window);//3  
		 */
		fieldValue : function(field, obj, isFormat/*opt*/) {
			if (probot.isStr(field)) {
				field = field.trim();
			}else{
				return field;
			}
			
			obj = obj || window;
			var v = obj;// 目标value
			var keyStr_reg = /^([a-zA-Z$_0-9]*)\[(\d+)\]$/i; 
			$o(field.split('.')).each(function(i, key) {
				if(keyStr_reg.test(key)){
					v = v[RegExp.$1][RegExp.$2];
				}else{
					v = v[key];
				}
				if (v === void 0) {
					return false;// 提前结束循环
				}
			});
			if (v !== undefined) {
				return isFormat == true ? putil.formatValue(v) : v;
			}
			return undefined;
		},
		/**
		 * 清空表单
		 * 
		 * @param {}
		 *            form
		 * @param {}
		 *            defaultValues 默认值
		 * @param {}
		 *            prefix 前缀
		 */
		clearForm : function(form, defaultValues, prefix) {
			var els = probot.isEle(form) ? form.elements : form;
			for (var i = 0; i < els.length; i++) {
				var etype = els[i].type ? els[i].type.toLowerCase() : undefined;
				var tagName = els[i].tagName.toLowerCase();
				var name = els[i].getAttribute('name');
				if (etype != 'button' && etype != 'submit' && name) {
					name = prefix ? (prefix + '.' + name) : name;
					if (etype == 'radio') {
						if (els[i].checked) {
							els[i].checked = false;
						}
					} else if (etype == 'checkbox') {
						if (els[i].checked) {
							els[i].checked = false;
						}
					} else if (tagName == 'select') {

					} else {
						els[i].value = '';
					}
				}
			}
			if (probot.isValid(defaultValues)) {
				this.json2form(defaultValues, form, prefix);
			}
		},
		/**
		 * 把表单数据转换成JSON数据
		 * 
		 * @param {}
		 *            form
		 * @param {}
		 *            prefix
		 * @return {}
		 */
		form2json : function(form, prefix, isTranformArray) {
			isTranformArray = probot.isBol(isTranformArray) ? isTranformArray : false;
			var els = probot.isEle(form) ? form.elements : form;
			var checkboxs = {};
			var result = {};
			
			for (var i = 0; i < els.length; i++) {
				var etype = els[i].type ? els[i].type.toLowerCase() : undefined;
				var tagName = els[i].tagName.toLowerCase();
				var name = els[i].getAttribute('name');
				if (etype != 'button' && etype != 'submit' && name) {
					name = prefix ? (prefix + '.' + name) : name;
					if (etype == 'radio') {
						if (els[i].checked)
							result[name] = els[i].value;
					} else if (etype == 'checkbox') {
						if (els[i].checked) {
							if (probot.isArr(result[name])) {
								result[name].push(els[i].value);
							} else {
								result[name] = [els[i].value];
							}
						}
					} else if (tagName == 'select') {
						var os = els[i].options;
						var valueField = els[i].getAttribute('valueField');
						var v = [];
						for (var k = 0; k < os.length; k++) {
							var o = os[k];
							if (o.selected
									|| (probot.isStr(valueField) && valueField == 'all')) {
								v.push(o.value);
							}
						}
						if (v.length > 0)
							result[name] = v.join(',');
					} else {
						if (probot.isArr(result[name])) {
							result[name].push(els[i].value);
						} else {
							result[name] = [els[i].value];
						}
					}
				}
			}
			$o(result).each(function(k, v) {
						if (probot.isArr(v) && isTranformArray != true) {
							result[k] = v.join(',');
						}
					});
					
			return result;
		},
		/**
		 * 把JSON数据设置到表单里
		 * 
		 * @param {}
		 *            json
		 * @param {}
		 *            form
		 * @param {}
		 *            prefix
		 * @param {}
		 *            clear 是否清空表单
		 */
		json2form : function(json, form, prefix, clear) {// 把json数据存放到form里
			if (probot.isBol(prefix)) {
				clear = prefix;
				prefix = undefined;
			}
			if (clear == true) {
				this.clearForm(form);
			}
			$o(json).each(function(n, v) {
						n = prefix ? (prefix + '.' + n) : n;
						var field = form[n];
						if (probot.isValid(field)) {
							v = probot.isValid(v) ? v : '';
							v = probot.isBol(v) ? (v ? 'true' : 'false') : v;
							if (field.type == 'radio'
									|| field.type == 'checkbox') {
								field = [field];
							}
							if (field.length) {
								if (field.length > 0) {
									var type = field[0].type;
									if (probot.isInvalid(type)) {
										field.value = v;
									} else if (type.toLowerCase() == 'radio') {
										for (var i = 0; i < field.length; i++) {
											if (field[i].value == v)
												field[i].checked = true;
										}
									} else if (type.toLowerCase() == 'checkbox') {
										for (var i = 0; i < field.length; i++) {
											if (('' + v)
													.indexOf(field[i].value) != -1)
												field[i].checked = true;
											else
												field[i].checked = false;
										}
									}
								}
							} else {
								field.value = v;
							}
						}
					});
		},
		/**
		 * 格式化常量值
		 * 
		 * @param {}
		 *            value
		 * @return {Boolean}
		 */
		formatValue : function(value) {
			if (value !== undefined) {
				if (value == 'false') {
					return false;
				} else if (value == 'undefined') {
					return undefined;
				} else if (value == 'null') {
					return null;
				} else {
					if (value == 'true') {
						return true;
					} else {
						if (typeof value === 'string') {
							if (value.match('^(0|[1-9][0-9]*)$')) {
								return parseInt(value);
							}
							if (value.length > 0) {
								var v = value.substring(0, 1);
								if (v == "'" || v == '"') {
									return value.substring(1, value.length - 1);
								}
							}
						} else if (probot.isFun(value)) {
							value = value.tobody();
						}
						return value;
					}
				}
			}
			return undefined;
		},
		formatUrl : function(url, params, encode) {
			return this.setUrlVal(url, params, encode, undefined, true);
		},
		/**
		 * 提交附件
		 * 
		 * @param {}
		 *            form 表单
		 * @param {}
		 *            callback
		 * @param {}
		 *            url action 地址
		 */
		upload : function(form, callback, url) {
			var win = window, targetWin = win.frames['px_upfile'], stateTimer = function(
					iframe) {// 状态定时查看器
				try {
					var doc = iframe.contentWindow.document;
					var state = doc.readyState;
					if (state == "complete") {
						iframeReady(iframe);
					} else if (iframe.loaded != true) {
						window.setTimeout(function() {
									stateTimer(iframe)
								}, 200);
					}
				} catch (e) {

				}
			}, iframeReady = function(iframe) {
				if (iframe.loaded == true) {
					return;
				} else {
					iframe.loaded = true;
				}
				var text;
				var body = iframe.contentWindow.document.body
						.getElementsByTagName('pre');
				if (body && body.length == 1) {
					text = body[0].innerHTML;
				} else {
					text = iframe.contentWindow.document.body.innerHTML;
				}
				var json;
				try {
					json = eval('(' + text + ')');
				} catch (e) {

				}
				if (probot.isFun(iframe.callback)) {
					iframe.callback.call(null, text, json);
				}
				if (probot.isValid(oldUrl)) {
					form.setAttribute('action', oldUrl);
				}
				win.document.body.removeChild(iframe);
				delete win.frames['px_upfile'];
			}
			form.setAttribute('target', 'px_upfile');
			form.setAttribute('method', 'post');
			var oldUrl = form.getAttribute('action');
			if (probot.isValid(url)) {
				form.setAttribute('action', url);
			}
			if (targetWin == undefined) {
				var iframe = undefined;
				try {
					iframe = win.document
							.createElement('<iframe name="px_upfile" />');
				} catch (e) {
					iframe = win.document.createElement('iframe');
					iframe.setAttribute('name', "px_upfile");
				}
				iframe.style['display'] = 'none';
				$p(iframe).attachEvent('load', function() {
							iframeReady(iframe);
						}).$$end();
				win.document.body.appendChild(iframe);
				targetWin = win.frames['px_upfile'];
			}
			var iframe = win.document.getElementsByName('px_upfile')[0];
			iframe.callback = callback;
			iframe.loaded = false;
			form.submit();
			window.setTimeout(function() {
						stateTimer(iframe);
					}, 200);
		},
		/**
		 * 
		 * @param {String}
		 *            url
		 * @param {Object}
		 *            params
		 * @param {Boolean}
		 *            encode 是否调用encodeURIComponent 对URI组件进行编码
		 * @param {String}
		 *            prefix
		 * @param {Boolean}
		 *            all 是否加入params里包含的所有数据
		 * @return {String}
		 */
		setUrlVal : function(url, params, encode, prefix, all) {
			if (probot.isUndef(url) || probot.isInvalid(params)) {
				return url;
			}
			var urlVals = putil.getUrlVal(url);
			var index = url.indexOf('?');
			url = index != -1 ? url.substring(0, index) : url;
			var values = {}, exist/*无用，仅作暂时存留*/ = [];
			$o(urlVals).each(function(k, v) {
						if (probot.isStr(v)) {
							v = v.trim();
							/*支持url中传入`$foo`这种变量方式，如`*.nsp?name=$name`,$name会匹配params中的键值*/
							if (v.indexOf('$') === 0) {
								var key = v.substring(1);
								var val = params[key];
								if (probot.isValid(val)) {
									v = val;
									exist.push(k);
								} else {
									v = '';
								}
							}
						}
						values[k] = v;
					});
			if (all === true) {
				$o(params).each(function(k, v) {
							var temp = values[k];
							if (probot.isInvalid(temp) && probot.isValid(v)) {
								values[k] = v;
							}
						});
			}
			var href = [];
			$o(values).each(function(k, v) {
				k = probot.isValid(prefix) ? prefix + '.' + k : k;
				if (probot.isArr(v)) {
					$o(v).each(function() {
								var val = this;
								if (probot.isValid(val)) {
									val = encode == true
											? putil.encode(val)
											: val;
									href.push(k + '=' + val);
								} else {
									href.push(k);
								}
							});
				} else {
					if (probot.isValid(v)) {
						v = encode === true ? putil.encode(v) : v;
						href.push(k + '=' + v);
					} else {
						href.push(k);
					}
				}
			});
			href = href.join('&');
			if (href.trim().length > 0) {
				if (!probot.isStr(url)) {
					return href;
				} else if (url.indexOf('?') != -1) {
					return url += '&' + href;
				} else {
					return url += '?' + href;
				}
			}
			return url;
		},
		/**
		 * 把方法转换为取数据的方法
		 * 
		 * @param {}
		 *            fn 比如标签上loadData属性上对应的方法
		 * @param {}
		 *            callback
		 * @param {}
		 *            args fn对应的参数
		 */
		fn2loadData : function(fn, callback, args) {
			fn.apply({
						jservice : function(jservice, med, params) {
							preq.jservice(jservice, med, params, callback);
						},
						data : function(data) {
							callback(data);
						},
						ajax : function(url, params, callback) {
							preq.post(url, params, callback);
						},
						websocket : function(hostIP, service, method, params) {
							preq.websocket(hostIP, service, method, params,
									callback);
						}
					}, args);
		},
		/**
		 * 获得滚动条的宽度
		 */
		scrollbarWidth : function() {
			if (!this.pscrollbarWidth) {
				var p = document.body.$p();
				var width = 50;
				p.$('+div').style({
							'position' : 'absolute',
							'top' : '-500px',
							'left' : '0px',
							'width' : width + 'px',
							'height' : '50px',
							'overflow' : 'scroll'
						});
				var temp = p.ele();
				p.$('+div').style({
							'width' : 'auto',
							'height' : '100%'
						});
				this.pscrollbarWidth = width - p.width();
				p.$$(2).remove(temp);
				p.$$end();
			}
			return this.pscrollbarWidth;

		},
		/**
		 * 获得标签属性
		 * 
		 * @param {}
		 *            tagName 标签名
		 * @return {}
		 */
		uiAttrs : function(tagName) {
			return NetilerUI.uis[tagName.toUpperCase()].attrs;
		},
		/**
		 * UI注册池是否存在该元素UI对象
		 */
		existUI : function(tagName) {
			return probot.isObj(NetilerUI.uis[tagName.toUpperCase()]);
		},
		loading : {
			/**
			 * 显示进度条
			 */
			show : function() {
				var html=
				'<div id="p_ui_loading_id" style="position:absolute;left:0px;top:0px;width:100%;height:100%;background:#fff;z-index:10">\
					<div style="position:relative;left:50%;top:50%;width:30px;height:30px;margin:-15px 0px 0px -15px;background-repeat:no-repeat;background-position:center;background-image:url(/com.leadal.netiler.ui/theme/base/images/loading.gif);background-size:90% 90%;"></div>\
				</div>';
				
				document.write(html);
			},
			/**
			 * 隐藏进度条
			 */
			hide : function() {
				var loading = document.getElementById('p_ui_loading_id');
				if (loading) {
					document.body.removeChild(loading);
				}
			}
		},
		/**
		 * 前端生成UUID 模拟后端数据库id，常用于模拟后端数据
		 * 2017-5-11 yeshiqing added 算法基于RFC4122 version1
		 * 
		 * 【备注：如果需要后台预生成随机的UUID，可调用该方法`preq.jservice("com.leadal.netiler.ui.service.UISupportService","newUUID",[],function(UUID){console.log(UUID)});`】
		 */
		uuid : function (){
		    var d = new Date().getTime();
		    /*和公司的uuid进行兼容，原格式为`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`*/
		    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		        var r = (d + Math.random()*16)%16 | 0;
		        d = Math.floor(d/16);
		        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
		    });
		    
		    return uuid;
		},
		/**
		 * 对图片处理
		 * 
		 * @type
		 */
		img : {
			/**
			 * 图片大小根据容器大小自适应（避免图片拉伸造成图片模糊）
			 * 
			 * @param {}
			 *            cw 容器宽度
			 * @param {}
			 *            ch 容器高度
			 * @param {}
			 *            sw 图片宽度
			 * @param {}
			 *            sh 图片高度
			 */
			adaptive : function(cw, ch, sw, sh) {
				if (probot.isStr(sw)) {
					var image = this.size(sw);
					sw = image.width;
					sh = image.height;
				}
				var _w, _h;
				if (cw >= sw && ch >= sh) {
					_w = sw;
					_h = sh;
				} else {
					var cr = (1.0 * cw) / ch;
					var sr = (1.0 * sw) / sh;
					if (cr < sr) {
						_w = cw;
						_h = _w / sr;
					} else {
						_h = ch
						_w = _h * sr;
					}
				}
				return {
					w : Math.floor(_w),
					h : Math.floor(_h)
				};
			},
			/**
			 * 获得图片大小
			 * 
			 * @param: url图片地址
			 * @param: callback，图片大小作为参数在回调中获得
			 */
			getSize : function(url, callback) {
				var img = document.createElement("img");
				img.src = url;
				var timeOutFn = function() {
					if (img.width > 0 || img.height > 0) {
						var imageSize = {
							width : img.width,
							height : img.height
						}
						if (callback) {
							callback.call(window, imageSize);
						}
						return;
					}
					setTimeout(function() {
								timeOutFn();
							}, 40);
				}
				setTimeout(function() {
							timeOutFn();
						}, 40);
			},
			/**
			 * 获取文件的base64格式（通常用在图片处理上）
			 * 
			 * @param: file:Blob对象实例，通常由<input type="file">中获取
			 * @param: callback:base64的结果在回调中作为参数返回
			 */
			getBase64 : function(file, callback) {
				var reader = new FileReader();
				var timeOutFn = function() {
					if (reader.result) {
						if (callback) {
							callback.call(window, reader.result);
						}
						return;
					}
					setTimeout(function() {
								timeOutFn();
							}, 40);
				}
				reader.readAsDataURL(file);
				setTimeout(function() {
							timeOutFn();
						}, 40);
			}
		},
		/**
		 * 事件处理器
		 * 
		 * @type
		 */
		evt : {
			/**
			 * 按键值
			 * 
			 * @param {}
			 *            event
			 * @return {}
			 */
			isKeyCode : function(event, keycode) {
				return event.keyCode == keycode;
			},
			ctrl : function(event, keycode) {
				if (event.ctrlKey == 1) {
					return event.keyCode == keycode;
				}
				return false;
			},
			/**
			 * 获得事件的起源位置
			 * 
			 * @param {}
			 *            event 事件对象
			 * @param {}
			 *            targetCss 事件固定为某个CSS
			 * @return {}
			 */
			target : function(event, targetCss) {
				event = probot.isEvt(event) ? event : window.event;
				if(!event){
					return null;
				}
				var tag = event.srcElement || event.target;
				if (probot.isStr(targetCss)) {
					var find = false;
					while (probot.isEle(tag)) {
						var clazz = tag.className || "";
						var reg = new RegExp('(^| )' + targetCss + '( |$)');
						if (reg.test(clazz) || tag.getAttribute('name') === targetCss) {
							find = true;
							break;
						}
						tag = tag.parentNode;
					}
					if (!find) {
						tag = null;
					}
				}
				
				return tag;
			},
			/**
			 * 获得事件位置
			 * 
			 * @param {}
			 *            event
			 * @param {}
			 *            container
			 * @param {}
			 *            win
			 * @return {}
			 */
			page : function(event, container, win) {
				win = win ? win : window;
				event = event ? event : win.event;
				event = event || win.event;
				var sx = 0, sy = 0;
				var dom = win.document;
				if (container && container.nodeType == 1
						&& container != dom.body) {
					var model = $p(container);
					var offset = model.getOffsets();
					model.$$();
					sx = container.scrollLeft - offset.x;
					sy = container.scrollTop - offset.y;
				}
				return {
					x : ((event.pageX || event.clientX + dom.body.scrollLeft) + sx),
					y : ((event.pageY || event.clientY + dom.body.scrollTop) + sy)
				}
			},
			/**
			 * 获得事件所触发对象的偏移量
			 * 
			 * @param {}
			 *            event
			 * @param {}
			 *            name
			 * @return {}
			 */
			offset : function(event, name) {
				event = event ? event : window.event;
				var offset = {
					x : 0,
					y : 0
				};
				if (event.offsetX != undefined && event.offsetY != undefined) {
					offset = {
						x : event.offsetX,
						y : event.offsetY
					}
				} else {
					var target = event.target;
					if (target.offsetLeft == undefined) {
						target = target.parentNode;
					}
					var temp = target;
					var scroll = {
						h : 0,
						w : 0
					};
					while (temp && temp.tagName) {
						scroll.h += temp.scrollTop;
						scroll.w += temp.scrollLeft;
						temp = temp.parentNode;
					}
					var coord = {
						x : 0,
						y : 0
					};

					while (target) {
						coord.x += target.offsetLeft;
						coord.y += target.offsetTop;
						target = target.offsetParent;
					}

					var eventCoord = {
						x : window.pageXOffset + event.clientX,
						y : window.pageYOffset + event.clientY
					};
					offset = {
						x : eventCoord.x - (coord.x - scroll.w),
						y : eventCoord.y - (coord.y - scroll.h)
					};
				}
				
				return name ? offset[name] : offset;

			},
			/**
			 * 取消事件冒泡
			 */
			cancelBubble : function(evt) {
				evt = evt ? evt : window.event;
				if (window.event) {
					evt.cancelBubble = true; // ie下阻止冒泡
				} else {
					evt.stopPropagation(); // 其它浏览器下阻止冒泡
				}
			},
			/**
			 * 阻止默认事件
			 * 
			 * @param {}
			 *            evt 事件对象
			 */
			stopDefault : function(evt) {
				if (evt && evt.preventDefault) {// 如果是FF下执行这个
					evt.preventDefault();
				} else {
					window.event.returnValue = false;// 如果是IE下执行这个
				}
			}
		},
		/**
		 * 
		 * @param {}
		 *            variable 对应的表达式 btns.save.call(this,event,oself)
		 * @param {}
		 *            win
		 * @param {}
		 *            owner
		 * @param {}
		 *            args 方法参数值应的值
		 * @param {}
		 *            argNames 方法对应的参数名 例如 argNames = 'event,oself'
		 * @return {}
		 */
		eval : function(variable, win, owner, args, argNames) {// 为了能够兼容IE
			win = win != undefined ? win : window;
			var ownerkey = this.id('eval_arg_');
			var argskey = this.id('eval_arg_');
			win[ownerkey] = owner ? owner : win;
			win[argskey] = args ? (probot.isArr(args) ? args : [args]) : [];
			argNames = argNames ? argNames : '';
			if (variable != null
					&& $o(variable).trim().indexOf('function') == 0) {
				try {
					return win.eval('(' + variable + ').apply(' + ownerkey
							+ ',' + argskey + ');');
				} catch (e) {
				}
			} else {
				return win.eval('(function(' + argNames + '){return '
						+ variable + ';}).apply(' + ownerkey + ',' + argskey
						+ ');');
			}
		}
	},
	/**
	 * 
	 * @param {}
	 *            url
	 * @param {}
	 *            params
	 * @param {}
	 *            method
	 * @param {}
	 *            async
	 * @param {}
	 *            username
	 * @param {}
	 *            password
	 */
	request : function(url, params, method, async, username, password) {
		this.url = url;
		if (probot.isObj(params)) {
			this.params = putil.setUrlVal('', params, true/*encode*/, undefined, true/*如果冲突，全部以params参数为主，不以queryString为主*/);
		} else {
			this.params = params;
		}
		this.method = method || 'POST';
		this.async = (async != void 0) ? async : true;
		this.username = username;
		this.password = password;
	},
	bind : function(scope, funct) {
		return function() {
			return funct.apply(scope, arguments);
		};
	},
	// 时间
	date : function(pattern, formatSymbols) {
		if (pattern == null || pattern == undefined) {
			pattern = "yyyy-MM-dd HH:mm:ss SSS";
		}

		if (formatSymbols == null || formatSymbols == undefined) {
			formatSymbols = "yMdHmsS";
		}

		this.pattern = pattern;
		this.formatSymbols = formatSymbols;
	}
}

var pobject = {
	objects : {},// 缓存池。用于针对不同的数据类型给pobject.object的原型链绑定不同的方法。
	object : function(value) {
		this.value = value;
	},
	forName : function(value) {// 获得实体类型
		var robot = predator.robot;
		if(robot.isString(value)){
			return 'string';
		}else if(robot.isObj(value)){
			return 'object';
		}else if(robot.isArr(value)){
			return 'array';
		}else if(probot.isEle(value)){
			return 'element';
		}else if(probot.isTextEle(value)){
			return 'text';
		}
	},
	/**
	 * 库内部使用方法。$o(x)中，针对参数x不同的数据类型，在pobject.object的原型链上绑定不同的方法。
	 * 
	 * @param {String}
	 *            type $o(x)中参数x的数据类型
	 *            目前支持['object'|'string'|'array'|'element'|'text']
	 * @param {Object}
	 *            methods key-value结构对象，绑定用于扩展多个的方法
	 */
	prototype : function(type, methods) {
		var oprototype = this.object.prototype;
		this.objects[type] = methods;
		var oself = this;
		Object.keys(methods).forEach(function(name,i){
			oprototype[name] = function() {
					var value = this.value; // this指$o(x)，即`new pobject.object()`
					if (value != undefined) {
						/*
						 * @date 2016-11-17 将原先的try catch调整为显示报错模式,使得Netiler客户端也能捕捉到错误。
						 * 建议：能显式报错不要用try catch,方便客户端捕捉报错。
						 */
						var type = oself.forName(value);
						if(type === void 0){//应对未拓展的数据类型，如Number和Boolean类型
							return value;
						}
						
						var extendObj = oself.objects[type];
						var fn = extendObj[name]; // 之所以不用methods[name]，是为了避免原型链上同名方法被复写，比如each方法在array,object类型中都会出现。所以统一存在缓存池中。
						if (fn === void 0) {
							console.error("$o(" + value.toSource() + ")没有" + name + "方法"); // 应对$o([1,{foo:"bar"}]).hasProp();
							return value;
						} else if (typeof fn === "function") {
							return fn.apply(value, arguments);
						}
					} else {
						console.warn("$o方法中的参数不能为null或undefined");
						return value;
					}
				}
		});
	},
	each : function(obj, callback) {// 为了兼容以前的方法
		var i = 0;
		if (!callback) {
			return;
		}
		if (typeof callback != 'function') {
			return;
		}
		for (var key in obj) {
			if (!obj.hasOwnProperty(key)) {
				continue;
			} else if (callback.call(obj[key], key, obj[key], i++, obj) == false) {
				break;
			}
		}
	}
};

pobject.prototype('object', {
	toJSON : function() {
		if (this.window != undefined && this.window === this.window.window
				|| probot.isNum(this.nodeType)) {
			return 'null';
		}
		if (probot.isObj(this)) {
			var txt = [];
			for (var key in this) {
				if (typeof this.hasOwnProperty === "function" && !this.hasOwnProperty(key)) {
					continue;
				}
				if (probot.isValid(this[key])
						&& probot.isFun($o(this[key]).toJSON)
						|| probot.isStr(this[key])) {
					txt
							.push('"' + key + '"' + ':'
									+ $o(this[key]).toJSON());
				} else if (v != undefined) {
					var v = this[key] == '' ? '\"\"' : this[key];
					txt.push('"' + key + '"' + ':' + v);
				}
			}
			return '{' + txt.join(',') + '}';
		} else {
			return this;
		}
	},
	/**
	 * 是否已经有该属性
	 * 
	 * @param {}
	 *            prop
	 * @return {}
	 */
	hasProp : function(prop) {
		return typeof this.hasOwnProperty === "function" ? this.hasOwnProperty.call(this, prop) : false;
	},
	each : function(callback) {
		var i = 0;
		if (!callback) {
			return;
		}
		if (typeof callback != 'function') {
			return;
		}
		for (var key in this) {
			if (typeof this.hasOwnProperty === "function" && !this.hasOwnProperty(key)) {
				continue;
			} else if (callback.call(this[key], key, this[key], i++, this) == false) {
				break;
			}
		}
	},
	/**
	 * 获得对象所有的KEY
	 */
	keys : function() {
		var keys = [];
		$o(this).each(function(key) {
					keys.push(key);
				});
		return keys;
	},
	add : function(k, v) {
		this[k] = v;
		return this;
	},
	/**
	 * 把一个JSON数据加入到一个JSON里
	 * 
	 * @param {}
	 *            values {name:'test'}
	 * @param {}
	 *            prefix 前缀 默认为空
	 * @return {}
	 */
	concat : function(values, prefix) {
		if (values === void 0) {
			return this;
		}
		prefix = prefix !== void 0 ? prefix : '';
		var oself = this;
		$o(values).each(function(k, v) {
					k = prefix + k;
					oself[k] = v;
				});
		return this;
	},
	get : function(key) {
		if (probot.isNum(key)) {
			var v = this[key];
			if (probot.isInvalid(v)) {
				var i = 0;
				for (var k in this) {
					if (typeof this.hasOwnProperty(k) === "function" && !this.hasOwnProperty(k)) {
						continue;
					}
					if (i++ == key) {
						return this[k];
					}
				}
			}
			return v;
		} else if (probot.isArr(key)) {
			var attrs = {};
			var oself = this;
			$o(key).each(function(i, v) {
						attrs[v] = oself[v];
					});
			return attrs;
		} else {
			return this[key];
		}
	},
	toArray : function(isKey) {
		var list = [];
		$o(this).each(function(key, value) {
					if (probot.isBol(isKey) && probot.isTrue(isKey)) {
						list.push(key);
					} else {
						list.push(value);
					}
				});
		return list;
	},
	/**
	 * 判断是否为空
	 */
	empty : function() {
		var isEmpty = true;
		$o(this).each(function() {
					isEmpty = false;
					return false;
				});
		return isEmpty;
	},
	clone : function() {
		if (probot.isObj(this)) {
			var temp = {};
			for (var key in this) {
				if (typeof this.hasOwnProperty(k) === "function" && !this.hasOwnProperty(key)) {
					continue;
				}
				if (probot.isValid(this[key])
						&& probot.isFun(this[key].clone)) {
					temp[key] = this[key].clone();
				} else {
					temp[key] = this[key];
				}
			}
			return temp;
		} else {
			return this;
		}
	}
});

pobject.prototype('string', {
	startWith : function(str) {
		return this.indexOf(str) === 0;
	},
	endWith : function(str) {
		return this.lastIndexOf(str) === this.length - str.length;
	},
	/**
	 * 从样式字符串里获得某个样式的值
	 */
	substyle : function(key) {
		var fragments = this.split(';');
		var value;
		$o(fragments).each(function() {
					if ($o($o(this).trim()).startWith(key)) {
						var s = this.split(':');
						if (s.length >= 1) {
							value = s[1].trim();
						}
						return false;
					}
				});
		return value;

	},
	/**
	 * split 分割符
	 */
	contains : function(str, split) {
		if (probot.isStr(split, true)) {
			if (probot.isStr(str, true)) {
				var s1 = split + this + split;
				var s2 = split + str + split;
				return s1.indexOf(s2) != -1;
			} else {
				return false;
			}
		} else {
			return this.indexOf(str) != -1;
		}
	},

	trim : function() {
		return this.replace(/^[\s\u3000]*/g, '').replace(/[\s\u3000]*$/g,
				'');
	},
	replaceAll : function(s1, s2) {
		return this.replace(new RegExp(s1, "gm"), s2);
	},
	test : function(regu) {
		var re = new RegExp(regu);
		return re.test(this);
	},
	toInt : function() {
		try {
			var v = this;
			while ($o(v).startWith('0') && v.length > 1) {
				v = v.substring(1);
			}
			return probot.isInvalid(parseInt(v)) ? 0 : parseInt(v);
		} catch (e) {
			return 0;
		}
	},
	txt2htm : function() {
		return $o(this).unhtml();
	},
	escapeHTML : function() {
		return this.replace(/&/g, "&#38;").replace(/"/g, "&#34;").replace(
				/'/g, "&#39;").replace(/</g, "&#60;").replace(/>/g, "&#62");
	},
	unhtml : function(reg) {
		return this ? this.replace(reg
						|| /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g,
				function(a, b) {
					if (b) {
						return a
					} else {
						return {
							"<" : "&lt;",
							"&" : "&amp;",
							'"' : "&quot;",
							">" : "&gt;",
							"'" : "&#39;"
						}[a]
					}
				}) : ""
	},
	html : function() {
		return this ? this.replace(/&((g|l|quo)t|amp|#39|nbsp);/g,
				function(m) {
					return {
						"&lt;" : "<",
						"&amp;" : "&",
						"&quot;" : '"',
						"&gt;" : ">",
						"&#39;" : "'",
						"&nbsp;" : " "
					}[m]
				}) : ""
	},
	toJSON : function() {
		return '"'
				+ this.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g,	function(raw) {
							return raw == '\n' ? '\\n' 
											   : (raw == '\r' ? '\\r' 
											   				  : (raw == '\t' ? '\\t' : ''))
						}) + '"'
	},
	/**
	 * 最后一个有效字符，不包括空格、换行
	 */
	lastValidChar : function() {
		var i = this.length;
		var lastChar = undefined;
		while (i >= 0) {
			var c = this.substring(i - 1, i);
			if (c != '\t' && c != '\n' && c != ' ') {
				lastChar = c;
				break;
			}
			i--;
		}
		return lastChar;

	},
	/**
	 * 从样式附件取出的样式内容里的图片路径，用绝对路径
	 * 
	 * @param {}
	 *            root 相对样式路径
	 * @return {}
	 */
	fCssImageUrl : function(root) {
		var patt = /url\s*\(\s*\"?\'?\s*([^\)\"]*)\s*\"?\'?\s*\)/ig;
		return this.replace(patt, function(sMatch, url) {
					if ($o(url).trim().length > 0
							&& url.indexOf("https:") != 0
							|| url.indexOf("http:") != 0
							&& url.indexOf("/") != 0) {
						return sMatch.replace(url, root + '/' + url);
					} else {
						return sMatch;
					}

				});
	}
});

pobject.prototype('array', {
			/**
			 * 将会依次执行传入的回调函数，若其中某个回调return false则提前退出循环
			 */
			each : function(callback) {
				var length = this.length;
				if (typeof callback != "function") {
					throw new Error("each方法中的参数必填且为function类型！");
				}
				for (var i = 0; i < this.length; i++) {
					if (callback.call(
							this[i] == null ? undefined : this[i],
							i,
							this[i],
							length == i + 1) == false) {
						break;
					}
				}
			},
			add : function(list) {
				if (probot.isValid(list) && probot.isArr(list)) {
					for (var i = 0; i < list.length; i++) {
						this.push(list[i]);
					}
				} else if (probot.isValid(list)) {
					this.push(list);
				}
				return this;
			},
			/**
			 * 用法一：将数组所有value值删掉  用法二：将数组中所有key值为value的对象删掉
			 * @param{} value 所删除的值
			 * @param{} key （数组中包含的是对象的条件下）key为对象中的属性名
			 * @example
			 * $o([1,2,3,1,1,1,1]).remove(1);//将把所有1都删除
			 */
			remove : function(value, key/*opt*/) {
				var n = $o(this).indexOf(value, key);
				if (n != -1) {
					this.splice(n, 1);
					$o(this).remove(value, key);
				}
				return n != -1;
			},
			del : function(value) {
				var arr = [];
				while (this.length > 0) {
					var temp = this.pop();
					if (temp !== value) {
						arr.push(temp);
					}
				}
				while (arr.length) {
					this.push(arr.pop());
				}
				return this;
			},
			indexOf : function(value, key) {
				for (var i = 0; i < this.length; i++) {
					var temp = key != undefined ? this[i][key] : this[i];
					if (probot.isStr(temp) && probot.isStr(value)) {
						temp += '';
						value += '';
					}
					if (temp == value) {
						return i;
					}
				}
				return -1;
			},
			contains : function(value, key/*opt*/) {
				if(arguments.length===2){
					return $o(this).indexOf(value, key) > -1
				}else if(arguments.length===1){
					return $o(this).indexOf(value) > -1;
				}else{
					throw new Error("第一个参数value是必须给的");
				}
			},
			toJSON : function() {
				var txt = [];
				$o(this).each(function(n, v) {
							if (probot.isValid(v)) {
								txt.push($o(v).toJSON());
							} else {
								txt.push("null");
							}
						});
				return '[' + txt.join(',') + ']';
			},
			/**
			 * 同步
			 */
			synPop : function() {
				while (this.lock) {
				}
				this.lock = true;
				var v = this.pop();
				this.lock = false;
				return v;
			},
			clone : function() {
				var temp = [];
				$o(this).each(function(i, v) {
							temp.push($o(v).clone());
						});
				return temp;
			}
		});

pobject.prototype('element', {
			toJSON : function() {
				return this.tagName || this.nodeName;;
			}
		});

pobject.prototype('text', {
			toJSON : function() {
				return 'Text';
			}
		});

predator.date.prototype = {
	format : function(date, _pattern) {
		var time = this.getTime(date);
		// 标记存入数组
		var cs = this.formatSymbols.split("");

		// 格式存入数组
		var fs = (_pattern || this.pattern).split("");

		// 构造数组
		var ds = time.split("");
		// 标志年月日的结束下标
		var y = 3;
		var M = 6;
		var d = 9;
		var H = 12;
		var m = 15;
		var s = 18;
		var S = 22;
		// 逐位替换年月日时分秒和毫秒
		for (var i = fs.length - 1; i > -1; i--) {
			switch (fs[i]) {
				case cs[0] : {
					fs[i] = ds[y--];
					break;
				}
				case cs[1] : {
					fs[i] = ds[M--];
					break;
				}
				case cs[2] : {
					fs[i] = ds[d--];
					break;
				}
				case cs[3] : {
					fs[i] = ds[H--];
					break;
				}
				case cs[4] : {
					fs[i] = ds[m--];
					break;
				}
				case cs[5] : {
					fs[i] = ds[s--];
					break;
				}
				case cs[6] : {
					fs[i] = ds[S--];
					break;
				}
			}
		}
		return fs.join("");
	},
	parse : function(date) {
		if (date == null) {// undefined&&null
			return null;
		}
		var y = "";
		var M = "";
		var d = "";
		var H = "";
		var m = "";
		var s = "";
		var S = "";

		// 标记存入数组
		var cs = this.formatSymbols.split("");

		// 格式存入数组
		var ds = this.pattern.split("");
		var size = Math.min(ds.length, date.length);
		for (var i = 0; i < size; i++) {
			switch (ds[i]) {
				case cs[0] : {
					y += date.charAt(i);
					break;
				}
				case cs[1] : {
					M += date.charAt(i);
					break;
				}
				case cs[2] : {
					d += date.charAt(i);
					break;
				}
				case cs[3] : {
					H += date.charAt(i);
					break;
				}
				case cs[4] : {
					m += date.charAt(i);
					break;
				}
				case cs[5] : {
					s += date.charAt(i);
					break;
				}
				case cs[6] : {
					S += date.charAt(i);
					break;
				}
			}
		}
		if (y.length < 1)
			y = 0;
		else
			y = probot.isStr(y) ? $o(y).toInt() : y;
		if (M.length < 1)
			M = 0;
		else
			M = probot.isStr(M) ? $o(M).toInt() : M;
		if (d.length < 1)
			d = 0;
		else
			d = probot.isStr(d) ? $o(d).toInt() : d;
		if (H.length < 1)
			H = 0;
		else
			H = probot.isStr(H) ? $o(H).toInt() : H;
		if (m.length < 1)
			m = 0;
		else
			m = probot.isStr(m) ? $o(m).toInt() : m;
		if (s.length < 1)
			s = 0;
		else
			s = probot.isStr(s) ? $o(s).toInt() : s;
		if (S.length < 1)
			S = 0;
		else
			S = probot.isStr(S) ? $o(S).toInt() : S;
		var d = new Date(y, M - 1, d, H, m, s, S);
		return d;
	},
	/**
	 * 将Date对象统一转换成转换成为"yyyy-MM-dd HH:mm:ss SSS"时间字符串
	 */
	getTime : function(date) {
		if (!date) {
			date = new Date();
		}
		if (date.toString() === "Invalid Date") {
			console.warn("请输入有效的Date对象")
			return "";
		}
		var y = date.getFullYear();
		var M = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var m = date.getMinutes();
		var s = date.getSeconds();
		var S = date.getTime() % 1000;
		var html = y + "-";

		if (M < 10) {
			html += "0";
		}
		html += M + "-";

		if (d < 10) {
			html += "0";
		}
		html += d + " ";

		if (h < 10) {
			html += "0";
		}
		html += h + ":";

		if (m < 10) {
			html += "0";
		}
		html += m + ":";

		if (s < 10) {
			html += "0";
		}
		html += s;

		html += " ";

		if (S < 100) {
			html += "0"
		}

		if (S < 10) {
			html += "0";
		}
		html += S;
		return html;
	}
}

// 扩展request功能
predator.request.prototype = {
	getText : function(config) {
		config = config || {};
		var responseText = this.request.responseText;
		if(config.isJSON === true){
			return JSON.minify(responseText);	
		}
		
		return responseText;
	},
	json : function() {
		try {
			var data = eval('(' + this.request.responseText + ')');
			if (probot.isStr(data)) {
				data = eval('(' + data + ')') || data;
			}
			return probot.isBol(data) ? {} : data;
		} catch (e) {
			return {};
		}
	},
	message : function() {
		return this.json()['message'] || this.request.responseText;
	},
	get : function(key) {
		return this.json()[key];

	},
	isBinary : function() {
		return this.binary;
	},
	/**
	 * 判断请求的MIMI类型是否为JSON（仅在框架内部调用）
	 */
	isJSON : function(){
		var headers = this.headers();
		if(headers && headers["accept"].indexOf("application/json") > -1){
			return true;
		}else{
			return false;
		}
	},
	isReady : function() {
		return this.request.readyState == 4;
	},
	binary : false,
	setBinary : function(value) {
		this.binary = value;
	},
	send : function(callback,config) {
		this.request = this.request || this.create();
		if (this.url.indexOf('://') != -1) {
			this.request.withCredentials = true;
		}
		var resTextConfig = {
			isJSON : this.isJSON()
		}
		
		if (this.request != null) {
			var _this=this;
			if(config && config.timeout){
				this.request.onAbort = predator.bind(this,function() {
					this.request.abort();
				});
				setTimeout(function(){
					_this.request.abort();
				},config.timeout);
			}
			if (callback != null) {
				this.request.onreadystatechange = predator.bind(this,
						function() {
							if (this.isReady()) {
								callback.call(this, this.getText(resTextConfig));
								var type = typeof this.request.onreadystatechange;
								if (type != 'undefined' && type != 'unknown') {
									this.request.onreadystatechange = null;
								}
								if (typeof this.request.abort !== 'undefined') {
									this.request.abort();
								}
							}
						});
			}
			this.request.open(this.method, this.url, this.async, this.username, this.password);
			this.setRequestHeaders(this.request, this.params);
			if (this.async) {
				setTimeout(predator.bind(this,function(){
					this.request.send(this.params);
		        }), 3);
			} else {
				this.request.send(this.params);
			}
		}
		
		return this;
	},
	create : (function() {
		if (window.XMLHttpRequest) {
			return function() {
				var req = new XMLHttpRequest();
				if(req.overrideMimeType){
					if (this.isBinary()) {
						req.overrideMimeType('text/plain; charset=x-user-defined');
					}
					if (this.isJSON()) {
						req.overrideMimeType('text/json; charset=utf-8');
					}
				}
				return req;
			};
		} else if (typeof(ActiveXObject) != "undefined") {
			return function() {
				return new ActiveXObject("Microsoft.XMLHTTP");
			};
		}
	})(),
	/**
	 * 设置请求头信息(为内部使用方法)
	 */
	setRequestHeaders : function(request/*XMLHttpRequest*/, params) {
		if (params != void 0) {
			if(probot.isFormData(params)){
				/*FormData对象的实例，不必设置Content-Type的请求头*/
			}else{
				request.setRequestHeader('Content-Type',
						'application/x-www-form-urlencoded;charset=UTF-8');
			}
		}
		this.header = this.header || {};
		$o(this.header).each(function(k, v){
			request.setRequestHeader(k, v);
		});
	},
	/**
	 * 设置/获取 请求头信息(为外部使用方法)
	 */
	headers: function(o_header){
		if(arguments.length===0){
			return this.header;
		}else{
			if(probot.isObj(o_header)){
				this.header = o_header;
			}else{
				throw new Error("the argument must be plain Object");
			}
		}
		
		return this;
	},
	simulate : function(doc, target) {
		doc = doc || document;
		var old = null;
		if (doc == document) {
			old = window.onbeforeunload;
			window.onbeforeunload = null;
		}
		var form = doc.createElement('form');
		form.setAttribute('method', this.method);
		form.setAttribute('action', this.url);
		if (target != null) {
			form.setAttribute('target', target);
		}
		form.style.display = 'none';
		form.style.visibility = 'hidden';
		var pars = (this.params.indexOf('&') > 0)
				? this.params.split('&')
				: this.params.split();
		for (var i = 0, l = pars.length; i < l; i++) {
			var pos = pars[i].indexOf('=');
			if (pos > 0) {
				var name = pars[i].substring(0, pos);
				var value = pars[i].substring(pos + 1);
				var textarea = doc.createElement('textarea');
				textarea.setAttribute('name', name);
				value = value.replace(/\n/g, '&#xa;');
				var content = doc.createTextNode(value);
				textarea.appendChild(content);
				form.appendChild(textarea);
			}
		}
		doc.body.appendChild(form);
		form.submit();
		doc.body.removeChild(form);
		if (old != null) {
			window.onbeforeunload = old;
		}
	}
}

// p对象的基础方法
var Qaida = predator.missile.prototype = {
	/**
	 * @description 锁定目标。设定$p对象中的nest和laden值。
	 * 
	 * @param {Array}
	 *            aim 目标 在自己的nest网中，找到符合目标的DOM元素
	 * @param {String|Function}
	 *            key 回调函数或者字符串。用以进一步筛选DOM元素
	 * @param {*}
	 *            value
	 */
	targeted : function(aim, key/*Str|Fn*/, value) {
		aim = probot.isArr(aim) ? aim : [aim];
		if (this.nest != null) {
			this.task.push(this.nest);
		}
		this.nest = aim;
		if (probot.isValid(key)) {
			var nest = [];
			$o(this.nest).each(function(index, item, isLast) {
				if ((probot.isFun(key) && key.call(this, index, isLast) === true)
						|| (probot.isStr(key) && this.model && this.model[key] === value)) {
					nest.push(this);
				}
			});
			this.laden = nest.pop();
			if (this.laden != undefined) {
				nest.push(this.laden);
			}
			this.nest = nest;
		} else {
			this.laden = aim.length >= 1 ? aim[aim.length - 1] : null;
		}
	},
	/**
	 * 扫描
	 * 
	 * @param {Array}
	 *            board 扫描区
	 * @param {String}
	 *            tagName `*`表示任意
	 * @param {String}
	 *            css 目标元素所具有的class
	 * @return {Array}
	 */
	scan : function(board, tagName, css) {
		var nest = [];
		$o(board).each(function(n, area/*DOMElement*/) {
			var ladens = area.getElementsByTagName(tagName);
			for(var i = 0, laden; laden = ladens[i]; i++){
				if (probot.isValid(css)) {
					var reg = new RegExp("( |^)" + css + "( |$)"); 
					if (reg.test(laden.className)) {
						nest.push(laden);
					}
				} else {
					nest.push(laden);
				}
			}
		});
		
		return nest;
	},
	/**
	 * 多弹头分导
	 * 
	 * @param {}
	 *            board 区域
	 * @param {}
	 *            name
	 * @return {} p.nest
	 */
	mirv : function(board, name) {
		var dirs = name.split('>');
		var nest;
		$o(dirs).each(function(i, dir) {
			nest = [];
			$o(board).each(function(index, area) {
                        if(area != null){
    						var el = area;
    						var body = area.ownerDocument.body;
    						var document = area.ownerDocument;
    						switch (dir) {
    							case 'child' :
    								var ns = el.children || el.childNodes;
    								if (ns)
    									for (var i = 0, n;n=ns[i];i++) {
    										if (n.nodeType == 1) {
    											nest.push(n);
    										}
    									}
    								el = undefined;
    								break;
    							case 'parent' :
    								el = el.parentNode;
    								break;
    							case 'next' :
    								el = el.nextSibling;
    								while (probot.isValid(el) && el.nodeType == 3) {
    									el = el.nextSibling;
    								}
    								break;
    							case 'pre' :
    								el = el.previousSibling;
    								while (probot.isValid(el) && el.nodeType == 3) {
    									el = el.previousSibling;
    								}
    								break;
    							case 'first' :
    								var ns = el.children || el.childNodes;
    								el = ns[0];
    								break;
    							case 'last' :
    								var ns = el.children || el.childNodes;
    								el = ns[ns.length - 1];
    								break;
    							case 'body' :
    								el = body;
    								break;
    							case 'document' :
    								el = document;
    								break;
    							case 'parentbody' :
    								el = el.ownerDocument.window.parent.domcument.body;
    								break;
    							default :
    								break;
    						}
    						if (probot.isValid(el) && nest.length == 0) {
    							nest.push(el);
    						}
                        }
					});
			board = nest;
		});
		return nest;
	},
	/**
	 * 创建新目标
	 * 
	 * @param {}
	 *            board 区域
	 * @param {}
	 *            tagName
	 * @return {}
	 */
	creator : function(board, tagName, where/*opt*/, refNode/*opt*/) {
		var nest = [];
		var oself = this;
		$o(board).each(function(n, area/*DOMElement*/) {
					if (area) {
						var doc = area.ownerDocument;
						var laden = doc.createElement(tagName);
						if (probot.isEle(refNode)) {
							oself.$(area).insert(laden, where, refNode).$$();
						} else {
							area.appendChild(laden);
						}
						nest.push(laden);
					}
				});
		return nest;
	},
	/**
	 * 将元素节点添加到指定位置
	 * 
	 * @param {DOMElement}
	 *            ele
	 * @param {String}
	 *            where 插入位置的标志位（暂时不提供）。请参考Qaida对象的insert方法
	 * @param {DOMElement}refNode
	 *            相关节点（暂时不提供）
	 * @ignore
	 */
	_$appendElement : function(ele, where/*opt*//*, refNode*/) {
		if (this.laden == null) {
			this.laden = null;
			this.targeted(null);
		} else {
			if (where === void 0) {
				this.laden.appendChild(ele);
				this.targeted(ele)
			}
		}
		return this;
	},
	/**
	 * 添加节点。将节点添加到指定位置
	 * 
	 * @param {String|DOMElement}
	 *            tagName
	 * @param {String}
	 *            where
	 * @param {DOMElement}
	 *            refNode
	 */
	$append : function(tagName, where/*opt*/, refNode/*opt*/) {
		if (tagName instanceof Element) {
			return this._$appendElement(tagName, where, refNode);
		}
		var nest = this.creator(this.nest, tagName, where, refNode);
		this.targeted(nest);
		return this;
	},
	/**
	 * 用于新增子元素、获取某DOM元素
	 * @param {DOMElement|Number|String}
	 *            aim
	 * @param {}
	 *            key
	 * @param {}
	 *            value
	 * @param {Array|DOMElement}
	 *            board 扫描区域 默认为nest网
	 * @return {}
	 */
	$ : function(aim, key/*opt*/, value/*opt*/, board/*opt*/, where/*opt*/, refNode/*opt*/) {
		board = probot.isValid(board) ? [board] : this.nest;
		if (probot.isValid(aim)) {
			if (probot.isEle(aim)) {
				this.targeted(aim);
			} else if (probot.isNum(aim)) {
				this.targeted(this.nest[aim]);
			} else if (probot.isStr(aim)) {
				var flag = aim.substring(0, 1);
				var nest;
				switch (flag) {
					case '+' :
						nest = this.creator(board, aim.substring(1), where, refNode);
						key = undefined;
						break;
					case '.' :
						nest = this.scan(board, '*', aim.substring(1));
						break;
					case '*' :
						nest = this.scan(board, aim.substring(1));
						break;
					case '#' :
						nest = this.document().getElementById(aim.substring(1));
						break;
					case '>' :
						nest = this.mirv(board, aim.substring(1));
						break;

				}
				this.targeted(nest, key, value);
			} else {
				this.targeted(aim);
			}
		} else {
			this.targeted(aim);
		}
		return this;
	},
	/**
	 * 通过索引号获得子元素
	 * 
	 * @param {}
	 *            index
	 */
	$child : function(index) {
		this.$('>child', function(i) {
					if (index == i) {
						return true;
					} else {
						return false;
					}
				});
		return this;
	},
	/**
	 * 恐怖分子的上级
	 * 
	 * @param {}
	 *            name
	 * @return {}
	 */
	$parent : function(name/*opt*/) {
		if (probot.isStr(name)) {
			var find = true;
			var superior = this.laden.parentNode;
			if (name.indexOf("<") == 0) {
				while (superior
						&& superior.nodeType == 1
						&& ("<" + superior.tagName + ">" !== name.toUpperCase())) {
					if (this.isBody(superior.parentNode)) {
						find = false;
						break;
					}
					superior = superior.parentNode;
				}
			} else {
				while (superior
						&& superior.nodeType == 1
						&& ((superior.getAttribute('name') !== name) && ((' '
								+ superior.className + ' ').indexOf(' ' + name
								+ ' ') == -1))) {
					if (this.isBody(superior.parentNode)) {
						find = false;
						break;
					}
					superior = superior.parentNode;
				}
			}
			if (find) {
				this.targeted(superior);
				return this;
			} else {
				this.targeted(undefined);
				return this;
			}
		} else if (probot.isInvalid(name)) {
			var superior = this.laden.parentNode;
			this.targeted(superior);
			return this;
		}
		console.error("参数name只支持字符串格式！");
		return null;
	},
	/**
	 * 导弹回收
	 * @param {Number} n
	 * @return {}
	 */
	$$ : function(num) {
		num = probot.isNum(num) ? num : 1;
		while (num-- > 0) {
			if (this.task.length == 0) {/*当任务执行完后，就可以回收导弹。*/
				predator.recycle(this);
			} else {
				this.nest = this.task.pop();
				this.laden = probot.isValid(this.nest)
						? this.nest[this.nest.length - 1]
						: null;
			}
		}
		if (num === -2) {/* 当首次传入参数为-1时会进入这个分支，比如在p对象的child方法中有使用到。目的在于提供返回值*/
			var ladens = this.nest;
			this.$$();
			return ladens;
		}
		return this;
	},
	/**
	 * 任务结束
	 */
	end : function() {
		if (this.lock != true) {
			alert('任务未完成，不能结束任务！');
		}
	},
	$$end : function() {
		var count = this.task.length + 1;
		this.$$(count).end();
	}

};

// 扩展p对象的方法，针对p对象的nest数组中每个DOM元素
predator.multiUSB(Qaida, {
	clear : function() {
		return this.html('');
	},
	callback : function(fn) {
		return fn.call(this, this.laden);
	},
	width : function(value) {
		if (value != undefined) {
			this.style('width', value, 'offsetWidth', 'width');
			return this;
		} else {
			return this.laden==null ? null : this.style('width', value, 'offsetWidth', 'width');
		}
	},
	height : function(value) {
		if (value != undefined) {
			this.style('height', value, 'offsetHeight', 'height');
			return this;
		} else {
			return this.laden==null ? null : this.style('height', value, 'offsetHeight', 'height');
		}
	},
	// 元素内壁尺寸
	innerSize : function(positionAble) {
		this.$("+div");
		if (positionAble == false) {
			this.style({
						width : '100%',
						height : '100%'
					});
		} else {
			this.style({
						position : 'absolute',
						width : '100%',
						height : '100%',
						left : '-1000px',
						top : '-1000px'
					});
		}

		var temp = this.laden;
		var h = this.height();
		var w = this.width();
		this.$$().remove(temp);
		return {
			width : w,
			height : h
		};
	},

	/**
	 * 
	 * @param {}
	 *            solid 是否占用空间
	 * @return {}
	 */
	show : function(solid) {
		if (probot.isTrue(solid)) {
			this.style('visibility', 'visible');
		} else if (solid === null) {
			this.style('display', null);
		} else {
			this.style('display', 'block');
		}
		return this;
	},
	hide : function(solid) {
		if (probot.isTrue(solid)) {
			this.style('visibility', 'hidden');
		} else {
			this.style('display', 'none');
		}
		return this;
	},
	/**
	 * 
	 * @param {}
	 *            registerAble 是否注册
	 * @return {}
	 */
	render : function(registerAble) {
		/**
		 * 是否进行register注册
		 * 目前都是显式地调用register然后在for循环外部进行统一渲染
		 * @example
		 * for循环内部:_p.register(parentPanel);
		 * for循环外部:_p.(">child").render();
		 * @deprecated
		 */
		if (probot.isTrue(registerAble)) {
			this.register();/*不传参数，则注册的面板为`this.cfg('panel')`*/
		}
		if (probot.isFun(this.laden.doRender)) {
			this.laden.doRender();
		}
		return this;
	},
	/**
	 * 渲染
	 * @param {String} tagName 只对具有该标签名的子标签进行渲染
	 * @param {Boolean} isIncludeSelf 是否包含自己
	 */
	renderChilds : function(tagName,isIncludeSelf) {
		var args = arguments;
		this.$('>child').callback(function() {
					if (probot.isValid(tagName)) {
						if (this.tagName(tagName)) {
							this.render();
						}
					} else {
						this.render();
					}
				}).$$().callback(function(){
					if((args.length===2 && isIncludeSelf===true) || (args.length===1 && tagName===true)){
						this.ele().doRender();
					}
				}).$$end();
	},
	/**
	 * 类反射 this.ref('setAttribute','name','test')
	 * 
	 * @return {}
	 */
	ref : function() {
		var ret, fnName = arguments[0],
			laden = this.laden;
		if (arguments.length > 0 && probot.isFun(laden[fnName])) {
			var args = [].slice.call(arguments, 1); 
			ret = laden[fnName].apply(laden, args);
		}
		
		return ret ? ret : this;
	},
	/**
	 * 
	 * @param {}
	 *            callback
	 */
	hover : function(callback) {
		var dom = this.laden;
		var isOver = false;
		var over = function(event) {
			if (!isOver) {
				var toElement = event.toElement;
				$p(dom).attachEvent('mouseout', out).$$();
				callback.call(dom, event, true);
				isOver = true;
			}
		}
		var out = function(event) {
			var sender = $p(dom);
			var toElement = event.toElement;
			if (probot.isTrue(event) || !sender.contains(toElement, true)) {
				sender.detachEvent('mouseout', out);
				callback.call(dom, event, false);
				isOver = false;
			}
			this._hout = out;
			sender.$$();
		}
		this.attachEvent('mouseover', over);
	},
	/**
	 * 
	 * @param {}
	 *            callback
	 */
	hout : function(callback, clear) {
		var dom = this.laden;
		var out = function(event) {
			var sender = $p(dom);
			var toElement = event.toElement;
			if (!sender.contains(toElement, true)) {
				if (clear != false) {
					dom.attachmout = false;
					sender.detachEvent('mouseout', out);
				}
				callback.call(dom, event, false);
			}
			sender.$$();
		}
		if (dom.attachmout != true) {
			this.$(dom).attachEvent('mouseout', out).$$();
			dom.attachmout = true;
		}
	},
	/**
	 * 设置或获取元素标签上的属性。可读可写方法。
	 */
	attrs : function(names, value) {
		var laden = this.laden, attrs = {};
		if (arguments.length === 2) {
			if (probot.isValid(value)) {
				if (probot.isStr(names)) {
					laden.attr(names, value);
				} else if (probot.isUndef(names)) {
					console.warn("attrs第一个参数不能为undefined或null!");
				}
				return this;
			} else if (probot.isUndef(value)) {
				/*
				 * @date 2016-11-16此处重构代码与原始代码有出入
				 * 原始代码将获取`names`属性对应的属性值,重构代码目前不做任何处理直接return this; 如有问题请反馈@叶世清
				 */
				return this;
			}
		} else if (arguments.length === 1) {
			if (probot.isObj(names)) {
				$o(names).each(function(k, v) {
							probot.isValid(v) && laden.attr(k, v);
						});
				return this;
			} else if (probot.isStr(names)) {
				return laden.attr(names);
			} else if (probot.isUndef(names)) {
				return this;
			} else if (probot.isArr(names)) {
				$o(names).each(function(i, name) {
							attrs[name] = putil.formatValue(laden
									.getAttribute(name));
						});
				return attrs;
			}
		} else if (arguments.length === 0) {
			var map = laden.attributes;
			const noContains = ['style', 'class'];
			for (var i = 0; i < map.length; i++) {
				var v = map[i];
				var name = v.name;
				if (!$o(noContains).contains(name)) {
					attrs[name] = putil.formatValue(v.value);
				}
			}
			return attrs;
		}
	},
	css : function css(value, mode, laden, callback) {
		var index = [].splice.call(arguments, -1, 1);/* 处于this.nest中第几个元素,multiUSB时自动传入*/
		/**
		 * 根据arguments重新给参数赋值
		 */
		value = arguments[0];
		mode = arguments[1];
		laden = arguments[2];
		callback = arguments[3];

		if (value === undefined) {
			return this.laden.className;
		}
		laden = probot.isValid(laden) ? laden : this.laden;
		if (value === -1) {
			laden.className = '';
			return this;
		}
		if (probot.isValid(mode)) {
			if (probot.isNum(mode)) {
				var oself = this;
				if (mode < 0) {
					if (css.apply(this, [value, true, laden])
							&& (!probot.isFun(callback) || callback.call(laden,
									index, laden.className))) {
						var cs = laden.className.split(' ');
						$o(cs).remove(value);
						laden.className = cs.join(' ');
					}
				} else if (mode > 0) {
					if (css.apply(this, [value, false, laden])
							&& (!probot.isFun(callback) || callback.call(laden,
									index, laden.className))) {
						if (laden.className) {
							laden.className += ' ' + value;
						} else {
							laden.className = value;
						}
					}
				} else {
					laden.className = '';
				}

				return this;
			} else if (probot.isBol(mode)) {
				var bool = false;
				if (laden.className) {
					$o(laden.className.split(' ')).each(function(i, v) {
								if (v == value) {
									bool = true;
									return false;
								}
							});
				}
				return bool === mode;
			} else if (probot.isStr(mode)) {
				if (mode == '+') {
					return this.css(value, 1);
				}
				if (mode == '-') {
					return this.css(value, -1)
				}
			} else if(probot.isFun(mode)){
				var newMode = mode.call(this, this.laden);
				css.apply(this, [value, newMode, index]);
			}
		} else {
			this.laden.className = value;
		}
	},
	setFloat : function(value) {
		var style = this.laden.style;
		if ('cssFloat' in style) {
			this.laden.style.cssFloat = value;
		} else if ('styleFloat' in style) {
			this.laden.style.styleFloat = value;
		} else {
			throw 'set float style:' + style + 'error.';
		}
	},
	getFloat : function(){
		var style = this.laden.style;
		if ('cssFloat' in style) {
			return this.laden.style.cssFloat;
		} else if ('styleFloat' in style) {
			return this.laden.style.styleFloat;
		}else{
			return this.laden.style['float'];
		}
	},
	style : function(style, value, attr, attr2) {
		var laden = this.laden;
		var oself = this;
		if (probot.isObj(style)) {
			$o(style).each(function(k, v) {
						if (k == 'float') {
							oself.setFloat(v);
						} else {
							oself.setStyle(k, v);
						}
					});
			return this;
		}

		if (value === undefined) {
			if (attr) {
				var v = laden[attr];
				if (v === undefined && attr2) {
					v = laden.getAttribute(attr2);
				}
				if (v !== undefined) {
					if (probot.isStr(v)) {
						return $o(v).toInt();
					}
				}
				return v;
			}
			var v;
			if(style=='float'){
				v = this.getFloat();
			}else{
				v = laden.style[style];
			}
			if (probot.isStr(v) && $o(v).endWith('px')) {
				return $o(v.substring(0, v.length - 2)).toInt();
			} else if (probot.isStr(v) && $o(v).endWith('pt')) {
				var t = $o(v.substring(0, v.length - 2)).toInt();
				return Math.floor(t / 3 * 4);
			}
			return v;
		}
		if (probot.isStr(value)) {
			if (attr2 && laden[attr] == undefined) {
				laden.setAttribute(attr2, value);
			} else {
				if (style == 'float') {
					oself.setFloat(value);
				} else {
					laden.style[style] = value;
				}
			}
		}
		if (probot.isNum(value)) {
			if (attr2 && laden[attr] == undefined) {
				laden.setAttribute(attr2, value);
			} else {
				oself.setStyle(style, value);
			}
		}
		if (value == null) {
			laden.style[style] = "";
		}
		return this;

	},
	/**
	 * 获得样式，包括CLASS 引入的样式；
	 * 
	 * @param {}
	 *            name
	 * @return {}
	 */
	linkStyle : function(name) {
		if (this.laden.currentStyle) { // IE
			return this.laden.currentStyle[name];
		} else if (window.getComputedStyle) { // 非IE
			name = name.replace(/([A-Z])/g, "-$1").toLowerCase();
			return this.document().defaultView.getComputedStyle(this.laden, null).getPropertyValue(name);
		}
		
		return null;
	},
	/**
	 * 
	 * @param {}
	 *            name
	 * @param {}
	 *            value
	 * @param {}
	 *            sumAble 之和
	 */
	setStyle : function(name, value, sumAble) {
		var _value;
		if (probot.isFun(value)) {
			_value = value.call(this);
		} else {
			_value = value;
		}
		if (probot.isTrue(sumAble)) {
			if (name == 'width') {
				this.width(this.width() + _value);
			} else if (name == 'height') {
				this.height(this.height() + _value);
			} else {
				this.laden.style[name] = ($o(this.laden.style[name]).toInt() + _value)
						+ 'px';
			}
		} else {
			var vector = ['height', 'width', 'top', 'left', 'bottom', 'right',
					'paddingtop', 'paddingbottom'];
			if (probot.isNum(_value) && $o(vector).contains(name.toLowerCase())) {
				_value += 'px';
			}
			this.laden.style[name] = _value;
		}
		return this;
	},
	/**
	 * 获得样式
	 * 
	 * @param {}
	 *            style
	 * @return {}
	 */
	styleText : function(style) {
		if (probot.isValid(style)) {
			this.laden.style.cssText += ';' + style;
		} else {
			return this.laden.style.cssText;
		}
	},
	/**
	 * 对应style元素进行操作
	 * 
	 * @param {}
	 *            selectorText 选择器[.test]
	 * @param {}
	 *            cssText 样式内容 [width:100%]
	 * @param {}
	 *            position 位置
	 */
	sheet : function(selectorText, cssText, position) {
		var sheet = this.laden.sheet || this.laden.styleSheet
		if (sheet.insertRule) {
			sheet.insertRule(selectorText + "{" + cssText + "}", position);
		} else if (sheet.addRule) {
			sheet.addRule(selectorText, cssText, position);
		}
	},
	/**
	 * 
	 * 替换样式
	 * 
	 * @param {}
	 *            s1
	 * @param {}
	 *            s2
	 * @return {}
	 */
	replaceCss : function(s1, s2) {
		if (this.exist()) {
			if (probot.isArr(s1)) {
				var oself = this;
				$o(s1).each(function(i, v) {
							oself.replaceCss(v, s2);
						});
			} else {
				if (this.css(s1, true)) {
					this.css(s1, -1).css(s2, +1);
				}
			}
		}
		return this;
	},
	/**
	 * 设置或获取元素的innerHTML。可读可写方法。
	 */
	html : function(html) {
		if(arguments.length === 0){
			return this.laden ? this.laden.innerHTML : "";
		}else{
			this.laden && (this.laden.innerHTML = '' + html);
			return this;
		}
	},
	/**
	 * 绑定事件处理程序（绑定成功后，元素可借助attachEvents属性和事件标识key，找到之前绑定的事件以便于移除事件监听程序
	 * @param {String} evtName 浏览器支持的事件名
	 * @param {Function} fn 事件处理程序
	 * @param {String} key 事件标识用于后续解绑事件
	 */
	attachEvent : function(evtName, fn, key) {
		var ele = this.laden;
		if (ele.addEventListener) {
			ele.addEventListener(evtName, fn, false);
		} else {
			var twin = top;
			if (probot.isNetilerBrowser()) {
				twin = chrome.window;
			}
			twin.fqfns = twin.fqfns || [];
			twin.fqfns[fn] = function() {
				fn.call(ele);
			}
			ele.attachEvent('on' + evtName, twin.fqfns[fn]);
		}
		if (probot.isValid(key)) {// 事件KEY，用于存事件以便删除事件时使用；
			ele.attachEvents = probot.isObj(ele.attachEvents) ? ele.attachEvents : {};
			ele.attachEvents[key] = {
				name : evtName,
				fn : fn
			}
		}
		return this;
	},
	/**
	 * 解绑事件处理程序
	 * 
	 * @param {} evtName 浏览器支持的事件名
	 * @param {} fn 之前绑定的事件处理程序
	 */
	detachEvent : function(evtName, fn) {
		var ele = this.laden;
		if (fn == undefined && ele.attachEvents && ele.attachEvents[evtName]) {
			var evt = ele.attachEvents[evtName];
			evtName = evt.name;
			fn = evt.fn ? evt.fn : function() {};
			return this.detachEvent(evt.name, evt.fn);
		} else {
			if (ele.removeEventListener) {
				ele.removeEventListener(evtName, fn, false);
			} else {
				var twin = top;
				if (probot.iisNetilerBrowser()) {
					twin = chrome.window;
				}
				ele.detachEvent('on' + evtName, twin.fqfns[fn]);
			}
		}
		return this;
	},
	/**
	 * 绑定外部元素事件（一般用于menu）
	 * 
	 * @param {}
	 *            callback
	 * @param {}
	 *            tags
	 * @param {}
	 *            evtName
	 */
	outerEvt : function(callback, tags, evtName) {
		tags = probot.isArr(tags) ? tags : [{
					tag : tags,
					evtName : evtName
				}];
		var ele = this.ele();
		var fn = function(event) {
			var target = event == true ? true : putil.evt.target(event);
			var _p = $p(ele);
			if (target == true || !probot.isEle(target)
					|| !_p.contains(target, true)) {
				var rtn = callback.call(_p.ele());
				if (rtn == true) {
					$o(tags).each(function() {
								_p.$(this.tag).detachEvent(this.evtName, fn)
										.$$();
							});
				}
			}
			_p.$$end();
		}
		var oself = this;
		$o(tags).each(function() {
					oself.$(this.tag).attachEvent(this.evtName, fn).$$();
				});
		return fn;
	}

});

// 扩展p对象的方法，针对p对象的laden
predator.usb(Qaida, {
	/**
	 * 获得元素所有的属性
	 */
	attrs2string : function() {
		var as = this.laden.attributes;
		var text = [];
		for (var i = 0; i < as.length; i++) {
			var a = as[i], n = a.name, v = a.value;
			text.push(n + (probot.isValid(v) ? '="' + v + '"' : ''));
		}
		return text.join(' ');

	},
	/**
	 * 设置CSS3 transform属性
	 * 
	 * @param {}
	 *            key 例如scale 如果key=transform表示设置整个值，如scale(1.2,4.5)
	 * @param {}
	 *            value 2,12 translate(21,32)
	 */
	transform : function(key, value) {
		if (probot.isInvalid(key)) {
			return this.style('transform') || this.style('WebkitTransform')
					|| this.style('MozTransform') || this.style('OTransform')
					|| this.style('msTransform');
		} else {
			if (probot.isInvalid(value) && probot.isStr(key)) {
				var transform = this.transform();
				if (probot.isStr(transform)) {
					var s = transform.toLowerCase().indexOf(key.toLowerCase()
							+ '(');
					if (s > 0) {
						var e = transform.indexOf(')', s);
						return transform.substring(s + key.length + 1, e);
					} else {
						return undefined;
					}

				}
			} else if (key == 'transform') {// 设置整个值
				this.style({
							'transform' : value,
							'WebkitTransform' : value,
							'MozTransform' : value,
							'OTransform' : value,
							'msTransform' : value
						});
				return this;
			} else {// 设置值
				if (probot.isStr(key)) {
					var transform = this.transform();
					transform = probot.isStr(transform) ? transform : '';
					var s = transform.toLowerCase().indexOf(key.toLowerCase()
							+ '(');
					if (s >= 0) {
						var e = transform.indexOf(')', s);
						transform = transform.substring(0, s) + key + '('
								+ value + ')' + transform.substring(e + 1);
					} else {
						transform += ' ' + key + '(' + value + ')';
					}
					this.transform('transform', transform);
				} else {
					var me = this;
					$o(key).each(function(key, value) {
								me.transform(key, value);
							});
				}
				return this;
			}
		}
	},
	/**
	 * 加载操作
	 */
	onload : function(callback) {
		var dom = this.laden;
		dom.onload = dom.onreadystatechange = function() {
			var readyState = this.readyState;
			if (typeof readyState == 'undefined' || readyState == 'loaded'
					|| readyState == 'complete') {
				if (probot.isFun(callback)) {
					callback.call(dom);
				}
			}
		};
		return this;
	},
	/**
	 * 相对INPUT 里的checkbox、radio
	 * 
	 * @param {}
	 *            checked
	 */
	checked : function(checked) {
		if (probot.isValid(checked)) {
			this.laden.checked = checked;
			return this;
		} else {
			return this.laden.checked;
		}
	},
	menu : function(fn, event, arg, container) {
		var _createMenu = function(data) {
			if (data.length > 0) {
				var p = (container || document.body).$p();
				p.$('+ui:menu').attrs({
							theme : 'black'
						}).model({
							'data' : data
						}).cfg({
							event : event
						}).render().$$();
				p.$$end();
			}
		}
		if (probot.isArr(fn)) {
			_createMenu(data);
		} else {
			putil.fn2loadData(fn, function(data) {
						_createMenu(data);
					}, arg);
		}
		return this;
	},
	/**
	 * 配置信息
	 */
	config : function(key, callback) {
		var config = this.attrs('config');
		var _config = {};
		if (probot.isStr(config)) {
			_config = putil.fieldValue(config, window);
		}
		_config = _config ? _config : {};
		if (probot.isFun(callback)) {
			callback.call(this.laden, _config[key]);
		} else {
			return _config[key];
		}
	},
	// 绑定右键菜单
	bindContextmenu : function(fn, arg, container) {
		this.attachEvent('contextmenu', function(event) {
					var p = this.$p();
					p.menu(fn, event, arg, container);
					p.$$end();
					putil.evt.stopDefault(event);

				});
	},
	/**
	 * 复制元素上的事件
	 * 
	 * @param {}
	 *            toElement 需要复制方法的元素
	 * @param {}
	 *            evtName 事件名称
	 */
	copyEvent : function(evtName, toElement) {
		var evtNames = evtName ? [evtName] : ['click', 'blur', 'dblclick',
				'focus', 'change', 'mousedown', 'mouseover', 'mouseover',
				'keyup', 'keydown'];
		var events = {};
		for (var i = 0; i < evtNames.length; i++) {
			var evtName = evtNames[i];
			(function(variable) {
				if (variable != null && variable) {
					events[evtName] = function(event) {
						var ele = this.nodeType == 1 ? this : event.srcElement;
						putil.eval(variable, window, ele, [event, ele],
								'event,oself');
					}
				}
			}(this.attr(evtName)));
		}
		if (probot.isEle(toElement)) {
			this.$(toElement);
			for (var key in events) {
				this.attachEvent(key, events[key]);
			}
			this.$$();
			return this;
		} else {
			return events;
		}

	},
	// 给p对象中的元素绑定ui:think元素进行联想提示。具体使用可见ui:select的_bindThink方法内
	bindThink : function(params) {
		params = params || {};
		var top = params.top;
		var left = params.left;
		var panel = params.panel || this.laden;
		var think = putil
				.fieldValue(params.think || this.attr('think'), window);
		var container = params.container || document.body;
		this.$(container);
		this.$('+ui:think').cfg({
					'panel' : panel,
					'think' : think,
					'top' : top,
					'left' : left
				}).render();
		this.$$(2);
	},
	// 设置值
	value : function(v, mode, flag) {
		if (probot.isValid(v)) {
			if (mode == 1 && probot.isValid(this.laden.value)) {
				this.laden.value += flag + v;
			} else {
				this.laden.value = v;
			}
			return this;
		} else {
			return this.laden.value;
		}
	},
	left : function(value, mode) {
		if (value != undefined) {
			switch (mode) {
				case -1 :
					value = this.left() - value;
					break;
				case +1 :
					value = this.left() + value;
					break;
				default :
			}
			this.style('left', value);
			return this;
		} else {
			return this.style('left');
		}
	},
	top : function(value, mode) {
		if (value != undefined) {
			switch (mode) {
				case -1 :
					value = this.top() - value;
					break;
				case +1 :
					value = this.top() + value;
					break;
				default :
			}
			this.style('top', value);
			return this;
		} else {
			return this.style('top');
		}
	},
	bottom : function(value, mode) {
		if (value != undefined) {
			switch (mode) {
				case -1 :
					value = this.bottom() - value;
					break;
				case +1 :
					value = this.bottom() + value;
					break;
				default :
			}
			this.style('bottom', value);
			return this;
		} else {
			return this.style('bottom');
		}
	},
	/**
	 * 注册解析：在所有子元素渲染完成后执行父元素的ready方法
	 * 【注意】如果在for循环中使用register方法，需保证子元素的render方法在for循环之后调用，否则register机制可能不生效。
	 * 
	 * @param {DOMElement|uiTag}
	 *            panel 注册的父元素。全部子标签渲染完之后会调用父元素的pready方法。
	 * @param {Function}
	 *            callback 自定义ready方法。针对某些特殊情况做处理。
	 */
	register : function(panel, callback) {
		var ele = this.laden || null;
		panel = panel ? panel : this.cfg('panel');
		this.ready(function() {
					if (--panel.childUICount == 0) {
						if (typeof callback === "function") {
							callback(ele);
						} else {
							panel.pready();
						}
					}
				});
		panel.childUICount = (panel.childUICount || 0) + 1;
		
		return this;
	},
	// 关闭按钮
	close : function(callback, tags, evt/*opt*/) {
		tags = probot.isArr(tags) ? tags : [{
					tag : tags,
					evt : evt
				}];
		var oself = this.laden;/*null or DOMElement*/
		var close = function(event/*boolean|event*/) {
			var target = event == true ? true : putil.evt.target(event);
			if (target == true || !probot.isEle(target) || oself == null || !oself.pcontains(target)/*原设计思路是配置条件中的tag必须是事件触发源，可考虑增加配置参数允许事件冒泡*/) {
				$o(tags).each(function() {
							var detachCondition = this.detachCondition;/*解绑事件触发条件*/
							if(probot.isFun(detachCondition)){
								if(detachCondition()===true){
									$p(this.tag).detachEvent(this.evt, close).$$end();
								}
							}else{
								$p(this.tag).detachEvent(this.evt, close).$$end();
							}
						});
				oself && (oself._close = null);
				callback.call(oself, event);
			}
		}
		oself && (oself._close = close);//为元素绑定一个_close方法，以便主动触发。例如：ele._close(true/*必填*/);
		$o(tags).each(function() {
					$p(this.tag).attachEvent(this.evt, close).$$end();
				});

		return this;
	},
	bodyHeight : function() {
		return this.document().body.clientHeight;
	},
	bodyWidth : function() {
		return this.document().body.clientWidth;
	},
	scrollWidth : function() {
		return this.laden.scrollWidth;
	},
	scrollHeight : function() {
		return this.laden.scrollHeight;
	},
	isScrollHeight : function(offset) {// 判断是否存在上下滚动
		offset = offset ? offset : 0;
		return this.scrollHeight() > this.height() + offset;
	},
	isScrollWidth : function() {// 判断是否存在左右滚动
		return this.scrollWidth() > this.width();
	},
	// 获得位置
	getPositions : function(relative, width, height) {
		var w = width ? width : this.width();
		var h = height ? height : this.height();
		var p1 = this.getPosition(relative);
		var p2 = {
			x : p1.x + w,
			y : p1.y
		};
		var p3 = {
			x : p2.x,
			y : p1.y + h
		};
		var p4 = {
			x : p1.x,
			y : p3.y
		};
		return [p1, p2, p3, p4];
	},
	/**
	 * 获得相对位置
	 * 
	 * @param {}
	 *            relative
	 * @return {}
	 */
	getPosition : function(relative, offsetAble) {
		relative = relative || this.document().body;
		if (this.isBody())
			return {
				x : 0,
				y : 0
			};
		var existPosition = true;
		if (relative.nodeType == 1 && relative != this.document().body) {
			existPosition = probot.isValid(relative.style['position'])
					? true
					: (function() {
						relative.style['position'] = 'relative';
						return false;
					})();
		}
		var offset = this.getOffsets(relative);
		if (!existPosition) {
			try {
				relative.style['position'] = null;
			} catch (e) {
				relative.style['position'] = 'static';
			}
		}
		var scroll = {
			x : 0,
			y : 0
		};
		var position = {
			x : offset.x - scroll.x,
			y : offset.y - scroll.y
		};
		if (offset.ele) {
			scroll = this.$(offset.ele).getScroll();
			position.scrollY = scroll.y;
			position.scrollX = scroll.x;
			position.h = this.height();
			this.$$();
		}
		if (offsetAble == true) {
			position.y += 12;
		}
		return position;
	},
	/**
	 * 获得相对
	 * 
	 * @param {}
	 *            relative
	 * @return {}
	 */
	getOffsets : function(relative) {
		var offset = {
			x : 0,
			y : 0
		};
		var el = this.laden;
		const POSITION = {'relative':true,'absolute':true}
		while (el && !this.isBody(el)) {
			offset.ele = el;
			if (relative == el) {
				break;
			} else if (relative == true && POSITION[el.style['position']]) {
				break;
			}
			var v = el.offsetLeft;
			v = v || el.getAttribute('x');
			offset.x += v;
			
			v = (el.pOffsetTop || el.offsetTop);
			v = v || el.getAttribute('y');
			offset.y += v;
			
			el = el.offsetParent;
		}
		return offset;
	},
	getScroll : function() {
		if (this.isBody())
			return {
				x : document.documentElement.scrollLeft,
				y : document.documentElement.scrollTop
			};
		return {
			x : this.laden.scrollLeft,
			y : this.laden.scrollTop
		};
	},
	/**
	 * 相对某一个元素滚动的大小 laden 对 relative 之间元素的滚动距离
	 * 
	 * @param {}
	 *            relative
	 */
	relativeScroll : function(relative) {
		relative = relative ? relative : document.body;
		var ele = this.laden;
		var scroll = {
			x : 0,
			y : 0
		};
		this.$(relative);
		if (this.contains(ele)) {
			var i = 1;
			this.$(ele);
			while (this.laden != relative) {
				var _s = this.getScroll();
				scroll.x += _s.x;
				scroll.y += _s.y;
				this.$parent();
				i++;
			}
			this.$$(i);
		}
		this.$$();
		return scroll;
	},
	/**
	 * 顺次执行readylist中的方法，并将readylist中需清除的ready方法清除
	 */
	_callReadylist : function(readylist, panel) {
		var clearReadyList = [];
		for (var i = readylist.length - 1; i >= 0; i--) {
			try {
				var fn = readylist[i];
				var clearFlag = fn.call(panel);
				if (clearFlag == true) {
					clearReadyList.push(fn);
				}
			} catch (e) {
				console.error(e);// 这些是错误，应该得到解决。除非是第三方库中改不动的问题不影响项目大局，可暂时过滤。
			}
		}
		$o(clearReadyList).each(function() {
					$o(readylist).remove(this);
				});

	},
	// p对象的ready方法
	ready : function(callback, clear) {
		if(this.laden == void 0){
			return this;
		}
		
		if (probot.isTrue(clear) && probot.isArr(this.laden.readylist)) {
			this.laden.readylist = [];
		}
		if (probot.isFun(callback)) {
			if (!probot.isArr(this.laden.readylist)) {
				this.laden.readylist = [];
			}
			this.laden.readylist.push(callback);
		} else {
			if(this.laden.readylist === void 0){
				this.laden.readylist=[];
			}
			var readylist = this.laden.readylist;
			var _ready = this.attr('ready');
			if (probot.isValid(_ready)) {
				var _fn = putil.fieldValue(_ready, window);
				probot.isFun(_fn) && readylist.push(_fn);
			}
			var panel = this.laden;
			this._callReadylist(readylist, panel);
		}
		
		return this;
	},
	/**
	 * 显示/隐藏 隔层
	 */
	layer : function(isShow, win) {
		win = this.cfg('layerwin') || (win ? win : window);
		var body = win.document.body;
		if (isShow) {
			this.$(body);
			 //解决海泰浏览器插件层级太高问题
	        if(navigator.userAgent.indexOf("netiler")==-1){
				this.$('+div').css('ld-layer ld-layer-shen', +1).css('js_layer_container', +1);
	        }else{
				this.$('+div').css('ld-layer', +1).css('js_layer_container', +1);
	        }
			this.html('<iframe style="width:100%;height:100%;position:absolute;left:0;top:0;background-color:transparent;opacity:0;" scrolling="no" frameborder="0" src="about:blank"  marginheight="0" marginwidth="0" allowtransparency="true" ></iframe><div style="width:100%;height:100%;position:absolute;left:0;top:0;"></div>');
			this.$$(2);
		} else {
			this.$(body);
			var layers = this.$('.js_layer_container').list();
			this.$$().remove(layers[layers.length - 1]);
			this.$$();
		}
		
		return this;
	},
	/**
	 * 
	 */
	wait : function(callback) {
		while (callback.call()) {
		}
		return true;
	},
	scrollHeight : function() {
		return this.laden.scrollHeight;

	},
	scrollWidth : function() {
		return this.laden.scrollWidth;

	},
	scrollTop : function(val) {
		if (val !== undefined) {
			this.laden.scrollTop = val;
			return this;
		}
		return this.laden.scrollTop;
	},
	scrollLeft : function(val) {
		if (val !== undefined) {
			this.laden.scrollLeft = val;
			return this;
		}
		return this.laden.scrollLeft;
	},
	/**
	 * 存储标签的events对象。与getEvent结合使用，完成读取events
	 * 用法一：从标签属性上取到events属性字符串，并把属性字符串转换成对象。
	 * 用法二：已知events对象直接存储。该用法与_p.cfg("events",events)类似都是存储events对象,但存储位置不同。
	 * @see getEvent
	 * @deprecated
	 */
	toEvents : function(events) {
		if (probot.isValid(events)) {
			this.set('events', events);
		} else {
			var evts = this.attrs('events');
			if (probot.isValid(evts)) {
				try {
					this.set('events', putil.fieldValue(evts, window))
				} catch (e) {
					throw e;
				}
			}
		}
		return this;
	},
	/**
	 * 获得事件
	 * 
	 * @param {}
	 *            key
	 * @return {}
	 * @deprecated
	 */
	getEvent : function(key) {
		return (this.get('events') ? this.get('events')[key] : undefined)
				|| (this.tagEvents()[key]);
	},
	/**
	 * 调用事件
	 * 
	 * @param {}
	 *            key
	 * @param {}
	 *            owner
	 * @param {}
	 *            params
	 * @deprecated
	 */
	callEvent : function(key, args, owner) {
		var event = this.getEvent(key);
		var result;
		if (probot.isFun(event)) {
			result = event.apply(owner || this.laden, args);
		}
		return probot.isValid(result) ? result : this;
	},
	/**
	 * 绑定事件
	 * 
	 * @param {}
	 *            events {click:function(model){}}
	 */
	bindEvents : function(events) {
		var me = this;
		var model = this.model();
		$o(events).each(function(key, fn) {
					if (probot.isValidEvent(key)) {
						me.attachEvent(key, function() {
									fn.call(this, model);
								});
					}
				});
	},
	bodyHeight : function() {
		return this.document().body.clientHeight;
	},
	bodyWidth : function() {
		return this.document().body.clientWidth;
	},
	/**
	 * 设置元素位置
	 * 
	 * @param {}
	 *            alignFlag 0、1、2、3、4、5、6、7、8
	 */
	setPosition : function(alignFlag, left, top) {
		var h = this.height();
		var w = this.width();
		var bh = this.bodyHeight() - 20;
		var bw = this.bodyWidth() - 20;
		var t, l;
		switch (alignFlag) {
			case 0 :
				t = 0;
				l = 0;
				break;
			case 1 :
				t = 0;
				l = (bw - w) / 2;
				break;
			case 2 :
				t = 0;
				l = bw - w;
				break;
			case 3 :
				t = (bh - h) / 2;
				l = bw - w;
				break;
			case 4 :
				t = bh - h;
				l = bw - w;
				break;
			case 5 :
				t = bh - h;
				l = (bw - w) / 2;
				break;
			case 6 :
				t = bh - h;
				l = 0;
				break;
			case 7 :
				t = (bh - h) / 2;
				l = 0;
				break;
			case 8 :
				t = (bh - h) / 2;
				l = (bw - w) / 2;
				break;
			default :
				t = bh - h;
				l = bw - w;
				break;
		}
		this.style({
					'top' : (probot.isValid(top) ? top : t),
					'left' : (probot.isValid(left) ? left : l)
				});
		return this;
	},
	render2model : function() {
		var _render = this.attrs('render');
		if (probot.isValid(_render)) {
			try {
				_render = putil.fieldValue(_render, window);
				this.set('render', _render);
			} catch (e) {
				throw (e);
			}

		}
		return this;
	},
	/**
	 * 获得标签Render方法
	 * 
	 * @param {Function}
	 *            render
	 */
	tagRender : function(render) {
		if (probot.isFun(render)) {
			this.cfg('render', render);
			return this;
		} else {
			var _render = this.attrs('render');
			if (probot.isValid(_render)) {
				try {
					_render = putil.fieldValue(_render, window);
					this.cfg('render', _render);
				} catch (e) {
					throw (e);
				}
			}
		}
		return probot.isFun(this.cfg('render'))
				? this.cfg('render')
				: function() {
				};
	},
	/**
	 * 获取或注册标签外抛事件
	 * 
	 * @param {} events
	 */
	tagEvents : function(events/*opt*/) {
		if (probot.isObj(events)) {
			this.cfg('events', events);
		} else {
			if (!this.cfg('events')) {
				var evts = this.attrs('events');
				if (probot.isValid(evts)) {
					this.cfg('events', putil.fieldValue(evts, window))
				}
			}
			return this.cfg('events') ? this.cfg('events') : {};
		}
		return this;
	},
	/**
	 * 把子元素转换为数据
	 * 
	 * @param {}
	 *            keys
	 * @param {}
	 *            childkey
	 * @param {}
	 *            textkey
	 * @param {}
	 *            callback
	 * @param {}
	 *            laden
	 */
	child2data : function(keys, childkey, textkey, callback, laden) {
		if (probot.isInvalid(this.get('data'))) {
			var data = this.child2json(keys, textkey, callback, laden);
			this.set('data', data);
		}

		return this;
	},
	/**
	 * 把子节点HTML数据转换成JSON格式数据
	 * 
	 * @param {}
	 *            keys
	 * @param {}
	 *            childkey
	 * @param {}
	 *            textkey
	 * @param {}
	 *            callback
	 * @param {}
	 *            laden
	 * 
	 * @return {}   2018.02.09 调整为支持多级嵌套子节点数据获取，子节点默认属性为childs
	 */
	child2json : function(keys, childkey/*Function|String*/, textkey, callback, laden, tagNames) {
		laden = probot.isValid(laden) ? laden : this.laden;
		var ischild = laden != this.laden;
		var data = [];
		var childs = this.cfg('childNodes') || laden.children || laden.childNodes;
		var _this = this;
		var renderChilds = function(_childs, d){
			var subChilds = _childs;
			for (var i = 0; i < subChilds.length; i++) {
				var child = subChilds[i];
				var role = child.attr('role');
				//if (role && $role && !$role[role]) 原先的判断
				if (role && typeof $role !== 'undefined' && typeof $role[role] == 'undefined') {
					continue;
				}
				if (NetilerUI.local) {
					if (child.attr('online')) {
						continue;
					}
				}
				_this.$(child);
				if (probot.isInvalid(tagNames)
						|| (probot.isValid(tagNames) && _this.tagName(tagNames))) {
					var jparams = child.attr('jparams');
					if (jparams) {
						var keysJparams_arr = jparams.split(",");
						keysJparams_arr.forEach(function(key, index) {
									if (keys instanceof Array) {
										keys.push(key);
									}
								})
					}
					var jsonObj = _this.toJSON(keys, childkey, textkey, callback, laden);
					var cds = child.children;
					if(cds.length > 0) {
						jsonObj.childs = [];//默认添加子集属性为childs
						renderChilds(cds, jsonObj.childs);	
					}
					d.push(jsonObj);
				}
				_this.$$();
				
			}
		}
		renderChilds(childs, data);
		
//		if (childs) {
//			for (var i = 0; i < childs.length; i++) {
//				var child = childs[i];
//				var role = child.attr('role');
//				//if (role && $role && !$role[role]) 原先的判断
//				if (role && typeof $role !== 'undefined' && typeof $role[role] == 'undefined') {
//					continue;
//				}
//				if (NetilerUI.local) {
//					if (child.attr('online')) {
//						continue;
//					}
//				}
//				this.$(child);
//				if (probot.isInvalid(tagNames)
//						|| (probot.isValid(tagNames) && this.tagName(tagNames))) {
//					var jparams = child.attr('jparams');
//					if (jparams) {
//						var keysJparams_arr = jparams.split(",");
//						keysJparams_arr.forEach(function(key, index) {
//									if (keys instanceof Array) {
//										keys.push(key);
//									}
//								})
//					}
//					var jsonObj = this.toJSON(keys, childkey, textkey, callback, laden);
//					jsonObj.childs = [];
//					renderChilds(child, jsonObj.childs);
//					data.push(jsonObj);
//				}
//				this.$$();
//			}
//		}
		return data;
	},
	/**
	 * 
	 * @param {}
	 *            keys
	 * @param {}
	 *            childkey
	 * @param {}
	 *            textkey
	 * @param {}
	 *            callback
	 */
	toJSON : function(keys, childkey/*Function|String*/, textkey, callback) {
		var json = {};
		var laden = this.laden;
		if (laden.nodeType == 1) {
			if (probot.isInvalid(keys)) {
				var noContains = ['style', 'class'];
				var attrs = laden.attributes;
				for (var i = 0; i < attrs.length; i++) {
					var attr = attrs[i];
					if (!$o(noContains).contains(name)) {
						json[attr.name] = attr.value;
					}
				}
			} else {
				$o(keys).each(function(i, key) {
							var v = putil.formatValue(laden.getAttribute(key));
							if (probot.isValid(v)) {
								json[key] = v;
							}
						});

			}

			if (probot.isValid(childkey)) {
				if (probot.isFun(childkey)) {
					childkey.call(this, json);
				} else {
					var childData = this.child2json(keys, childkey, textkey, callback, laden);
					if (childData.length > 0) {
						json[childkey] = childData;
					}

				}

			}
		} else if (laden.nodeType == 3 && probot.isValid(textkey)) {
			json[textkey] = laden.nodeValue;
		}
		if (probot.isInvalid(childkey) && probot.isValid(textkey)) {
			json[textkey] = laden.innerHTML;
		}
		if (probot.isFun(callback)) {
			json = callback.call(json);
		}
		return json;

	},
	/**
	 * 获得数据格式化方法 或 设置p对象的dformat属性
	 * 
	 * @param {}
	 *            format
	 * @return {p对象|Function}
	 */
	dformat : function(format) {
		if (probot.isFun(format)) {
			this.cfg('format', format);
			return this;
		} else {
			if (probot.isFun(this.cfg('format'))) {
				return this.cfg('format');
			} else {
				var _format = this.attr('dformat');
				if (probot.isValid(_format)) {
					_format = putil.fieldValue(_format, window);
				}
				if (probot.isFun(_format)) {
					return _format;
				} else {
					return function(item) {
						return item;
					};
				}
			}
		}

	},
	/**
	 * 获得数据
	 * @param  {Function} callback (callback中的this是对应的DOM对象)
	 * @param  {Object}   params   
	 * @param  {Boolean|Function}   srcHtml  
	 * @return {p对象}            
	 */
	data : function(callback, params, srcHtml) {
		var dformat = this.dformat();
		var data = this.attr('data');
		var me = this;
		var laden = this.laden;
		var _params = this.attr('params');// 属性带上的params
		if (probot.isValid(_params)) {
			try {
				_params = eval('(' + _params + ')');
				if (probot.isInvalid(params)) {
					params = _params;
				} else {
					pobject.each(_params, function(key, value) {
								if (probot.isValid(value)
										&& probot.isInvalid(params[key])) {
									params[key] = value;
								}
							});
				}
			} catch (e) {
			}
		}
		var loadData = this.attr('loadData');
		if (probot.isValid(loadData)) {
			var oself = this;
			var load = putil.fieldValue(loadData, window);
			if (probot.isFun(load)) {
				putil.fn2loadData(load, function(data) {
							callback.call(laden, data, dformat);
						}, [params || {}, laden]);
			}
		} else if (this.jservice(callback, params, dformat)) {
		} else if (this.ajax(callback, params, dformat)) {
		} else if (probot.isStr(data)) {
			try {
				data = putil.fieldValue(data, window);
				if (data && probot.isFun(callback)) {
					if (probot.isFun(data)) {
						data = data.call(laden, params);
					}
					callback.call(laden, data, dformat);
				}
			} catch (e) {
				throw new Error(e);
			}
		} else if (srcHtml) {
			if (srcHtml == true) {
				callback.call(laden, this.child2json(), dformat);
			} else if (probot.isFun(srcHtml)) {
				callback.call(laden, srcHtml.call({
									data : function(keys, childkey, textkey, callback, laden) {
										return me.child2json.apply(me, arguments);
									}
								}), dformat);
			}

		} else if (this.get('data')) {
			var data = this.get('data');
			if (probot.isFun(data)) {
				putil.fn2loadData(data, function(data) {
							callback.call(laden, data, dformat);
						}, [params || {}, laden]);
			} else {
				callback.call(laden, data, dformat);
			}
		}
		return this;
	},
	/**
	 * 
	 * @param {}
	 *            callback
	 * @param {}
	 *            params
	 * @return {Boolean}
	 */
	ajax : function(callback, params, dformat) {
		var ajax = this.attr('ajax');
		var laden = this.laden;
		if (probot.isStr(ajax)) {
			preq.post(ajax, params, function() {
						callback.call(laden, this.json(), dformat);
					});
			return true;
		} else {
			return false;
		}
	},
	/**
	 * 
	 * @param {}
	 *            method
	 * @param {}
	 *            callback
	 * @param {}
	 *            params
	 * @param {}
	 *            args
	 */
	refMethod : function(method, callback, params, args) {
		var jservice = this.laden.$jservice();
		var laden = this.laden;
		jservice[method].apply(jservice, this.jparams.call(this,
						function(data) {
							if (probot.isFun(callback)) {
								callback.call(laden, data);
							}
						}, params, args));
	},
	/**
	 * 执行JSERVICE
	 * 
	 * @param {}
	 *            callback
	 * @param {}
	 *            params
	 * @return {Boolean}
	 */
	jservice : function(callback, params, dformat) {
		var jservice = this.laden.$jservice();
		var med = this.laden.attr('jmethod');
		var urlParams = this.laden.attr('urlParams');
		if (urlParams && NetilerUI) {
			var keys = urlParams.split(',');
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i]
				var value = NetilerUI.params[key];
				this.laden.attr(key, value);
			}
		}
		var laden = this.laden;
		if (jservice && med) {
			if (typeof jservice[med] == 'undefined') {
				alert(jservice._service + "." + med + '方法不存在');
				return false;
			}
			var jparams = this.jparams.call(
							this,
							function(data) {
								if (typeof data != 'undefined' && probot.isFun(callback)) {
									callback.call(laden, data, dformat);
								}
							},
							params
							);
			var jproxy = this.laden.attr('jproxy');	
			if(jproxy && jproxy!=''){
				jservice._proxy = jproxy;
			}
			jservice[med].apply(jservice, jparams);
			if(jproxy && jproxy!=''){
				jservice._proxy = null;
			}
			return true;
		} else {
			return false;
		}
	},
	/**
	 * 获得方法对应的参数值
	 * 
	 * @param {}
	 *            jparams
	 */
	jparams : function(callback, params, jparams) {
		var data = [];
		params = params ? params : {};
		if (params.id) {
			params._id = params.id;
		}
		jparams = jparams || this.attr('jparams');
		if (jparams) {
			var keys = probot.isArr(jparams) ? jparams : jparams.split(',');
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var value = params[key] ||this.get(key) || this.attr(key)||NetilerUI.params[key];//增加NetilerUI.params的支持
				if (key == 'id' && probot.isStr(value)
						&& value.indexOf('nui_') == 0) {
					value = undefined;
				}
				data.push(value);
			}
		}
		if (probot.isFun(callback)) {
			data.push(callback);
		}
		return data;

	},
	/**
	 * 通过属性名获得model
	 * @deprecated 请用model方法代替
	 */
	get : function(key/*Str*/) {
		if (this.laden && probot.isObj(this.laden.model)) {
			return this.laden.model['' + key];
		} else {
			return null;
		}
	},
	/**
	 * 设置model
	 * @deprecated 请用model方法代替
	 */
	set : function(key/*Str|Obj*/, value) {
		var laden = this.laden; 
		if (laden && !(laden.model)) {
			laden.model = {};
		}
		
		if (probot.isObj(key)) {
			if(laden){
				Object.keys(key).forEach(function(prop, i){
					laden.model[prop] = key[prop];
				});
			}
		} else {
			laden && (laden.model['' + key] = value);
		}
		
		return this;
	},
	/**
	 * 设置或获取model。可读可写方法。
	 */
	model : function(model/*Str|Obj*/, value/*opt*/) {
		if (this.laden && !(this.laden.model)) {
			this.laden.model = {};
		}
		
		if(arguments.length === 0){
			if(this.laden == void 0){
				return null;
			}else if (probot.isInvalid(this.laden.model)) {
				return {};
			}else {
				return $o({}).concat(this.laden.model);/*注意p.model()返回值为一个clone对象，这么做是为了防止外部的修改对内部的影响*/
			}
		}else if(arguments.length === 1){
			if (probot.isObj(model)) {
				if(this.laden == void 0){
				}else{
					$o(this.laden.model).concat(model);
				}
				return this;
			}else if(probot.isArr(model)){
//				console.error("实际上model方法对数组参数的支持存在问题!慎用！");//已经在netilerui.widget中被大量使用
				this.laden.model = model;				
				return this;
			}else {
				if(this.laden == void 0){
					return null;
				}else{
					return this.laden.model['' + model];
				}
			}
		}else if(arguments.length === 2){
			this.laden.model['' + model] = value;
			return this;
		}
	},
	clearModel : function() {
		this.laden.model = undefined;
	},
	// 配置信息
	cfg : function(key, value) {
		if(this.laden && !(this.laden.cfg)){
			this.laden.cfg = {};
		}
		
		if(arguments.length === 0){
			if(this.laden){
				return this.laden.cfg;
			}else{
				return null;
			}
		}else if(arguments.length === 1){
			if(probot.isStr(key)){
				if(this.laden){
					return this.laden.cfg[key];
				}else{
					return null;
				}
			}else if(probot.isObj(key)){
				this.laden && $o(this.laden.cfg).concat(key);
			}
		}else if(arguments.length === 2){
			if(this.laden && probot.isValid(value) && probot.isStr(key)){
				this.laden.cfg[key] = value;
			}
		}
		
		return this;
	},
	attr : function(name, value) {
		if (value === null) {
			this.laden.attr(name, null);
			return this;
		} else if (probot.isValid(value)) {
			this.laden.attr(name, value);
			return this;
		} else if (probot.isObj(name)) {
			var oself = this;
			$o(name).each(function(k, v) {
						oself.laden.attr(k, v);
					});
			return this;
		} else {
			return this.laden.attr(name);
		}
	},
	/**
	 * 统计有几个子节点
	 */
	childCount : function() {
		return (this.laden.children || this.laden.childNodes).length;
	},
	/*
	 * 删除子元素
	 */
	removeChild : function(index) {
		this.remove(this.child(index));
		return this;
	},
	/**
	 * 获取全部子元素
	 * @return {Array}
	 */
	childs : function() {
		this.$('>child');
		var childs = this.list();
		this.$$();
		return childs;
	},
	/**
	 * 获得子元素
	 * 
	 * @param {}
	 *            index
	 */
	child : function(index) {
		var currentEle = this.ele();
		if (probot.isNum(index)) {
			var count = this.childCount();
			if (index < count) {
				this.$child(index);
				currentEle = this.ele();
				this.$$();
				return currentEle;
			}
		} else if (probot.isFun(index)) {
			this.$('>child', index);
			currentEle = this.ele();
			this.$$();
			return currentEle;
		} else {
			return this.$('>child').$$(-1);
		}
	},
	/**
	 * 获得该节点所属兄弟节点中排行
	 */
	index : function(list) {
		var laden = this.laden;
		var childs;
		if (probot.isArr(list)) {
			childs = list;
		} else {
			this.$('>parent').$('>child');
			childs = this.list();
			this.$$(2);
		}
		var index = -1;
		$o(childs).each(function(i) {
					if (laden == this) {
						index = i;
						return false;
					}
				});

		return index;
	},
	remove : function(node) {
		if (node == undefined) {
			var dom = this.laden;
			var pdom = this.laden.parentNode;
			if (probot.isEle(pdom)) {
				this.$(pdom).remove(dom).$$();
			}
		} else {
			if (probot.isEle(node.transp)) {// 判断元素是否有附带的透明隔层
				this.removeTransp(node.transp);
			}
			if (node.parentNode == this.laden) {
				this.laden.removeChild(node);
			}
		}

		return this;
	},
	/**
	 * 移开该节点内部的所有节点
	 * 
	 * @param {}
	 *            nodeType
	 * @return {}
	 */
	removeBody : function(nodeType) {
		if (!this.laden) {
			console.warn("调用该方法的$p对象找不到，报错的ui标签位置如下：");
			console.warn((this.task)[0][0]);
			return;
		}
		var ns = this.laden.childNodes;
		var nodes = [];
		for (var i = 0; i < ns.length; i++) {
			if (nodeType != undefined && ns[i].nodeType == nodeType)
				nodes.push(ns[i]);
			else if (nodeType == undefined)
				nodes.push(ns[i]);
		}
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			this.laden.removeChild(node);

		}
		return nodes;
	},
	/**
	 * 插入HTML
	 * 
	 * @param {}
	 *            html
	 * @param {}
	 *            where
	 * @param {}
	 *            ele
	 */
	insertHTML : function(html, where) {
		html = probot.isArr(html) ? html.join('') : html;
		var body = this.$('+span').html(html).removeBody();
		var temp = this.fq();
		this.$$().insertList(body, where ? where : -1).remove(temp);
		return this;
	},
	/**
	 * 插入节点
	 * 
	 * @param {String|Object}
	 *            el
	 * @param {}
	 *            where 部分情况依赖ele
	 * @param {DOMElement}
	 *            ele 当且仅当where生效时，ele生效
	 * @return {}
	 */
	insert : function(el, where/*opt*/, ele/*opt*/) {
		if (probot.isStr(el)) {
			var tag = this.laden.ownerDocument.createElement('span');
			tag.innerHTML = el;
			el = tag;
		}
		where = where===void 0 ? 'bottom' : where;
		if (probot.isStr(where)) {
			switch (where) {
				case 'bottom' :
					this.laden.appendChild(el);
					break;
				case 'top' :
					this.laden.insertBefore(el, 
									ele ? ele : this.laden.firstChild);
					break;
				case 'before' :
					this.laden.insertBefore(el, ele);
					break;
				case 'after' :
					var next = ele.nextSibling;
					if (next) {
						this.laden.insertBefore(el, next);
					} else {
						this.laden.appendChild(el);
					}
					break;
			}

		} else if (probot.isNum(where)) {
			if (where >= 0 && this.laden.childNodes.length > where) {
				var node = this.child(where);
				this.laden.insertBefore(el, node);
			} else if (where === -1 || this.laden.childNodes.length === 0) {
				this.laden.appendChild(el);
			}
		} else if (where.nodeType == 1) {
			this.laden.insertBefore(el, where);
		}
		return this;
	},
	insertBody : function(list, where, nodeType) {
		where = probot.isValid(where) ? where : 0;
		if (probot.isInvalid(list)) {
			return this;
		}
		if (probot.isNum(nodeType)) {
			var temp = [];
			$o(list).each(function() {
						if (this.nodeType == nodeType) {
							temp.push(this);
						}
					});
			list = temp;
		}
		switch (where) {
			case 0 :
				while (list.length > 0) {
					var node = list.pop();
					if (node) {
						this.insert(node, 0);
					}
				}
				break;
			case -1 :
				var el = this;
				$o(list).each(function() {
							el.append(this);
						});
				break;

		}
		if (where.nodeType == 1) {
			while (list.length > 0) {
				var node = list.pop();
				if (node) {
					this.insert(node, where);
				}
			}
		}
		return this;
	},
	document : function() {
		return this.laden.ownerDocument;
	},
	window : function() {
		return this.laden.ownerDocument.window || window;
	},
	/**
	 * 是否包含
	 * 
	 * @param {DOMElement}
	 *            laden
	 * @param {Boolean}
	 *            oself 是否是本身
	 * @return {Boolean}
	 */
	contains : function(laden, oself/*opt*/) {
		if (laden == undefined)
			return false;
		if (oself && laden == this.laden) {
			return true;
		}
		return (this.laden.contains) ? (this.laden != laden && this.laden
				.contains(laden)) : !!(this.laden
				.compareDocumentPosition(laden) & 16);
	},
	/**
	 * 
	 * @param {}
	 *            laden
	 * @return {}
	 */
	isBody : function(laden) {
		laden = laden ? laden : this.laden;
		return (/^(?:body|html)$/i).test(laden.tagName);
	},
	/**
	 * 
	 * @return {}
	 */
	tagName : function(tagName) {
		if (probot.isStr(tagName)) {
			return this.tagName().toUpperCase() == tagName.toUpperCase();
		} else if (probot.isArr(tagName)) {
			for (var i = 0; i < tagName.length; i++) {
				if (this.tagName(tagName[i])) {
					return true;
				}
			}
		} else {
			return this.laden.tagName || this.laden.nodeName;
		}
	},
	/**
	 * 获得当前元素
	 * 
	 * @param {}
	 *            index
	 * @return {}
	 */
	ele : function(index) {
		if (probot.isNum(index)) {
			return this.nest[index] || null;
		} else {
			return this.laden;
		}
	},
	/**
	 * 获得所有元素
	 * 
	 * @return {}
	 */
	list : function() {
		return this.nest;
	},
	/**
	 * 
	 * @return {}
	 */
	count : function() {
		return this.nest.length;
	},

	exist : function() {
		// return this.laden !== undefined;
		// 可能存在null的情况。建议置空最好还是用null，null才是真正的释放内存。但目前predator.js中存在很多undefined的情况，后面可以考虑统一修改。
		return this.laden != undefined;
	}
});

// 扩展p对象的事件方法
predator.evtUSB(Qaida, {
			click : function() {},
			dblclick : function() {},
			blur : function() {},
			focus : function() {},
			mouseenter: function(){},
			change : function() {},
			touchend : function() {},
			touchstart : function() {},
			touchmove : function() {}
		});

// 扩展原生Date对象
predator.usb(Date.prototype, {
	getWeekNumber : function() {
		Date.SECOND = 1000 /* milliseconds */;
		Date.MINUTE = 60 * Date.SECOND;
		Date.HOUR = 60 * Date.MINUTE;
		Date.DAY = 24 * Date.HOUR;
		Date.WEEK = 7 * Date.DAY;
		var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(),
				0, 0, 0);
		var then = new Date(this.getFullYear(), 0, 1, 0, 0, 0);
		var time = now - then;
		var day = then.getDay();
		(day > 3) && (day -= 4) || (day += 3)
		return Math.round(((time / Date.DAY) + day) / 7);
	},
	/**
	 * 本月的最后一天
	 * 
	 * @return {}
	 */
	getMonthLastDay : function() {
		var year = this.getFullYear();
		var MonthNextFirstDay = new Date(year, this.getMonth() + 1, 1);
		var MonthLastDay = new Date(MonthNextFirstDay - 86400000);
		return MonthLastDay;
	},
	/**
	 * 本月的第一天
	 * 
	 * @return {}
	 */
	getMonthFirshDay : function() {
		var year = this.getFullYear();
		var MonthFirstDay = new Date(year, this.getMonth(), 1);
		return MonthFirstDay;
	},
	/**
	 * 上个月
	 * 
	 * @return {}
	 */
	getPreMonth : function(date) {
		var year = this.getFullYear();
		var preMonth = new Date(year, this.getMonth() - 1, probot.isValid(date)
						? date
						: 1, this.getHours(), this.getMinutes());
		return preMonth;
	},
	getNextMonth : function(date) {
		var year = this.getFullYear();
		var nextMonth = new Date(year, this.getMonth() + 1, probot
						.isValid(date) ? date : 1, this.getHours(), this
						.getMinutes());
		return nextMonth;
	},
	/**
	 * 上个月的最后一天
	 * 
	 * @return {}
	 */
	preMonthLastDate : function() {
		return this.getPreMonth().getMonthLastDay().getDate();
	},
	/**
	 * 本月的所有天数
	 * 
	 * @currentDate 当天
	 */
	monthDays : function() {
		var days = [];
		var dateTime = 86400000;
		var monthFirshDay = this.getMonthFirshDay();
		var firshDate = monthFirshDay.getDate();
		var firstDay = monthFirshDay.getDay();
		var firstTime = monthFirshDay.getTime() - firstDay * dateTime;
		var lastDate = this.getMonthLastDay().getDate();
		var preMonthLastDate = this.preMonthLastDate();
		var count = 0;
		/**
		 * 上一月
		 */
		for (var i = preMonthLastDate - firstDay + 1; i <= preMonthLastDate; i++) {
			days.push({
						type : 'p',
						time : firstTime + count * dateTime,
						day : count % 7,
						date : i
					});

			count++;
		}
		/**
		 * 本月
		 */
		for (var i = 1; i <= lastDate; i++) {
			days.push({
						type : 'c',
						day : count % 7,
						time : firstTime + count * dateTime,
						date : i
					});
			count++;
		}
		for (var i = 1; count < 42; i++) {
			days.push({
						type : 'n',
						day : count % 7,
						time : firstTime + count * dateTime,
						date : i
					});
			count++;
		}
		return days;
	}
});

// 扩展原生Event对象
(function(Event) {
	if (Event) {
		if(!("fromElement" in Event.prototype)){
			Object.defineProperty(Event.prototype, "fromElement", {
				get: function(){
					var node;
					if (this.type == "mouseover")
						node = this.relatedTarget;
					else if (this.type == "mouseout")
						node = this.target;
					if (!node) return null;
					while (node.nodeType != 1)
						node = node.parentNode;
					return node;
				}
			});
		}
		if(!("toElement" in Event.prototype)){
			Object.defineProperty(Event.prototype, "toElement", {
				get: function(){
					var node;
					if (this.type == "mouseout")
						node = this.relatedTarget;
					else if (this.type == "mouseover")
						node = this.target;
					if (!node) return null;
					while (node.nodeType != 1)
						node = node.parentNode;
					return node;
				}
			});
		}
	};
})(typeof Event === "undefined" ? null : Event);

// request 功能扩展
var preq = {
	load : function(url) {
		return this.get(url, null, false);
	},
	getJSON : function(url, callback, async){
		async = probot.isTrueFalse(async) ? async : true;
		var reg = /([^&?]*=)\?/i;
		if(url.match(reg)){
			/* JSONP技术处理ajax跨域请求，和第三方服务交互时遇到跨域问题
			 * url中包含`&jsonp=?`时触发
			 */
			var globalVariable = "";
			url = url.replace(reg, function(raw, p1, offset, allStr){
				globalVariableName = "predator"  + Math.floor(Math.random() * 100000) + "_" + Date.now();
				return p1 + globalVariableName;
			});
			window[globalVariableName] = callback;
			
			;(function(globalVariableName){/*连续getJSON时，回调中产生闭包问题*/
				putil.addScript(url, function(scriptEle){
					var pNode = scriptEle.parentNode; 
					pNode && pNode.removeChild(scriptEle);
					delete window[globalVariableName];
				});
			})(globalVariableName);
		}else{
			return new predator.request(url, null, 'GET', async)
					.headers({
						accept:"application/json;chartset=utf-8"
					}).send(callback);
		}
	},
	get : function(url, callback, async, username, password) {
		return new predator.request(url, null, 'GET', async, username, password)
				.send(callback);
	},
	post : function(url, params, callback, async, username, password) {
		new predator.request(url, params, 'POST', async, username, password)
				.send(callback);
	},
	postSetTime : function(url, params, callback, async, username, password,config) {
		new predator.request(url, params, 'POST', async, username, password)
				.send(callback,config);
	},
	formSave : function(form, callback, prefix) {
		var result = $fUtil.form2json(form, prefix, true);
		var temp = function(text) {
			if (probot.isEle(form['entity.id'])
					&& probot.isValid(this.get('id'))) {
				form['entity.id'].value = this.get('id');
			}
			callback.call(this, text);
		}
		this.post(form.action, result, temp)
	},
	// 执行JSERVICE
	jservice : function(service, med, params, callback, loadingConfig, async) {
		async = async == false ? false : true;
		var maxTime = 0, minTime = 0, sustainTime = 0, msg = "";
		if (probot.isObj(loadingConfig)) {
			maxTime = probot.isValid(loadingConfig.maxTime)
					? loadingConfig.maxTime
					: 0;
			minTime = probot.isValid(loadingConfig.minTime)
					? loadingConfig.minTime
					: 0;
			if (maxTime < minTime) {
				$window.alert("最小等待时间不能超过最大等待时间！");
				return;
			}
			if (maxTime > 0 && maxTime < 500) {
				maxTime = 500;
			}
			if (minTime > 0 && minTime < 500) {
				minTime = 500;
			}
			msg = probot.isValid(loadingConfig.msg) ? loadingConfig.msg : "";
		}
		var win = top;
		if (probot.isNetilerBrowser()) {
			win = chrome.window;
		}
		var container;
		try {
			container = win.document.body;
		} catch (e) {//跨域问题
			container = window.document.body;
		}
		var _p = $p(container);
		var loadingObj = null;
		if (!(loadingConfig && probot.isTrue(loadingConfig.disable))) {
			loadingObj = _p.$("+ui:loading").ele();
			_p.attr({
						msg : msg
					});
			_p.render();
			_p.$$();
		}
		_p.$$();
		var timeHandle = setInterval(function() {
					sustainTime += 10;
					if (maxTime <= sustainTime && maxTime != 0) {
						if (loadingObj) {
							container.removeChild(loadingObj);
						}
						clearInterval(timeHandle);
					}
				}, 10);
		params = probot.isArr(params) ? params : [params];
		params.push(function(data) {
					if (minTime == 0 || minTime < sustainTime) {
						if (loadingObj && loadingObj.parentNode) {
							container.removeChild(loadingObj);
						}
						clearInterval(timeHandle);
						if (typeof callback === "function") {
							callback(data);
						}
					} else if (minTime > sustainTime) {
						var clearTimeHandle = setTimeout(function() {
									if (loadingObj) {
										container.removeChild(loadingObj);
									}
									clearTimeout(clearTimeHandle);
									clearInterval(timeHandle);
									callback(data);
								}, minTime);
					}
				});
		if (typeof service == "object") {
			if (probot.isValid(async)) {
				service.async = async;
			}
			service[med].apply(service, params);
		} else {
			var url = "/jservice/" + service + ".js";
			//  添加url修改默认的路径NetilerUI.resetURL(service)
			url =  NetilerUI.resetURL(url);
			var jele = putil.findElementByUrl(url, true);
			var fn = function() {
				var jservice = putil.fieldValue(service, window);
				if (probot.isValid(async)) {
					jservice.async = async;
				}
                if(jservice && probot.isValid(jservice[med])) {
    				jservice[med].apply(jservice, params);
                }
			}
			if (probot.isEle(jele)) {// 解决同时调用同一个JSERVICE出现jservice对象找不到的问题
				if (jele.loaded == false) {
					$p(jele).ready(fn).$$end();
				} else {
					fn();
				}
			} else {
				putil.addScript(url, fn);
			}

		}
	},
	/**
	 * 支持webSocket访问
	 * 
	 * @param {}
	 *            hostIP 主机IP地址
	 * @param {}
	 *            service service
	 * @param {}
	 *            method 方法
	 * @param {}
	 *            params
	 */
	websocket : function(hostIP, service, method, params, callback) {
		var WS = function(type, events) {
			if (!events) {
				events = {};
			}
			var WebSocket = window.WebSocket || window.MozWebSocket;
			var ws = new WebSocket("ws://" + location.host + "/" + type + ".ws");
			ws.events = events;
			ws.tasks = [];
			ws.isopen = false;
			ws.emit = function() {
				var act = arguments[0];
				var args = [];
				for (var i = 1; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				var txt = JSON.stringify(args);
				ws.send(act + "::" + txt);
			}

			ws.$ = function(act, args) {
				var fn = function() {
					var txt = JSON.stringify(args);
					ws.send(act + "::" + txt);
				}
				if (this.isopen) {
					fn();
				} else {
					this.tasks.push(fn);
				}
			}

			ws.onopen = function(e) {
				this.isopen = true;
				if (this.events && this.events.onopen) {
					this.events.onopen(e);
				}
				var task = this.tasks.pop();
				while (task) {
					task();
					task = this.tasks.pop();
				}
			}
			ws.onmessage = function(e) {
				var data = e.data;
				var n = data.indexOf('::');
				if (n != -1) {
					var eventName = data.substring(0, n);
					if (eventName.substring(0, 1) == "$") {
						eventName = eventName.substring(1);
					}
					var value = JSON.parse(data.substring(n + 2));
					var event = this.events[eventName];
					if (event) {
						event(JSON.parse(value[0]));
					}
				}
			};
			ws.onclose = function(e) {
				if (this.events && this.events.onclose) {
					this.events.onclose(e);
				}
			}
			ws.onerror = function(e) {
				if (this.events && this.events.onerror) {
					this.events.onerror(e);
				}
			}
			return ws;
		}
		if (probot.isInvalid(this.ws)) {
			this.ws = new WS('com.leadal.nest.core.http.WebSocketEvent');
		}
		var me = (function(type, ws) {
			return {
				$ : function() {
					var act = arguments[0];
					if (type) {
						act += "@" + type;
					}
					var args = [];
					for (var i = 1; i < arguments.length - 1; i++) {
						args.push(arguments[i]);
					}
					var cb = arguments[arguments.length - 1];
					if (typeof cb != 'function') {
						args.push(arguments[arguments.length - 1]);
						cb = null;
					}
					ws.events[act] = cb;
					ws.$(act, args);
				}
			};
		})(service, this.ws);
		var args = [method, hostIP];
		if (probot.isFun(params)) {
			callback = params;
			params = undefined;
		} else {
			$o(args).add(params);
		}
		$o(args).add(callback);
		me.$.apply(null, args);
	}
}

var exports={
	predator : predator,
	probot : predator.robot,
	putil : predator.util,
	pmath : predator.math,
	pobject : pobject,
	pdateUtil : new predator.date(),
	preq : preq,
	$p : function(aim, key, value) {
		aim === aim || document;
		return predator.launch().$(aim, key, value, this.document.body);
	},
	$o : function(value){
		return new pobject.object(value);
	}
}
Object.keys(exports).forEach(function(key, i){
	window[key] = exports[key];
});

})();

/**  
 *  JSON.minify() pollyfill 针对JSON的注释（单行、多行）进行清除，因为JSON是不支持注释的。JSON.parse(有注释的JSON)操作会报错
 *	v0.1 (c) Kyle Simpson
 *	MIT License
 */
;(function(global){
	if (typeof global.JSON == "undefined" || !global.JSON) {
		global.JSON = {};
	}

	global.JSON.minify = function(json) {

		var tokenizer = /"|(\/\*)|(\*\/)|(\/\/)|\n|\r/g,
			in_string = false,
			in_multiline_comment = false,
			in_singleline_comment = false,
			tmp, tmp2, new_str = [], ns = 0, from = 0, lc, rc
		;

		tokenizer.lastIndex = 0;

		while (tmp = tokenizer.exec(json)) {
			lc = RegExp.leftContext;
			rc = RegExp.rightContext;
			if (!in_multiline_comment && !in_singleline_comment) {
				tmp2 = lc.substring(from);
				if (!in_string) {
					tmp2 = tmp2.replace(/(\n|\r|\s)*/g,"");
				}
				new_str[ns++] = tmp2;
			}
			from = tokenizer.lastIndex;

			if (tmp[0] == "\"" && !in_multiline_comment && !in_singleline_comment) {
				tmp2 = lc.match(/(\\)*$/);
				if (!in_string || !tmp2 || (tmp2[0].length % 2) == 0) {	// start of string with ", or unescaped " character found to end string
					in_string = !in_string;
				}
				from--; // include " character in next catch
				rc = json.substring(from);
			}
			else if (tmp[0] == "/*" && !in_string && !in_multiline_comment && !in_singleline_comment) {
				in_multiline_comment = true;
			}
			else if (tmp[0] == "*/" && !in_string && in_multiline_comment && !in_singleline_comment) {
				in_multiline_comment = false;
			}
			else if (tmp[0] == "//" && !in_string && !in_multiline_comment && !in_singleline_comment) {
				in_singleline_comment = true;
			}
			else if ((tmp[0] == "\n" || tmp[0] == "\r") && !in_string && !in_multiline_comment && in_singleline_comment) {
				in_singleline_comment = false;
			}
			else if (!in_multiline_comment && !in_singleline_comment && !(/\n|\r|\s/.test(tmp[0]))) {
				new_str[ns++] = tmp[0];
			}
		}
		new_str[ns++] = rc;
		return new_str.join("");
	};
})(this);