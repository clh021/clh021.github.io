/**
 * @fileOverview Netiler前端动画库
 * @author liwei
 */
;(function(){
	
var Animate = {
	animateObjContext : {},
	/**
	 * 临时动画池
	 * 
	 * @type
	 */
	tempAnContext : {},
	/**
	 * 动画事件池
	 * 
	 * @type
	 */
	context : {},
	/**
	 * transition 复合样式过滤
	 * 
	 * @type
	 */
	filterStyle : ["font", "padding", "background", "margin", "border",
			"transform"],
	easing : ["linear", "ease", "ease-in", "ease-out", "ease-in-out"],
	an : ["bounce", "fade", "flip", "lightSpeed", "rotate", "slide", "roll",
			"zoom"],
	/**
	 * 内置进入动画
	 * 
	 * @type
	 */
	inAn : ["bounceIn", "bounceInDown", "bounceInLeft", "bounceInRight",
			"bounceInUp", "fadeIn", "fadeInDown", "fadeInDownBig",
			"fadeInLeft", "fadeInLeftBig", "fadeInRight", "fadeInRightBig",
			"fadeInUp", "fadeInUpBig", "flipInX", "lightSpeedIn", "rotateIn",
			"rotateInDownLeft", "rotateInDownRight", "rotateInUpLeft",
			"rotateInUpRight", "slideInDown", "slideInLeft", "slideInRight",
			"slideInUp", "rollIn", "zoomIn", "zoomInDown", "zoomInLeft",
			"zoomInRight", "zoomInUp"],
	/**
	 * 内置移出动画
	 * 
	 * @type
	 */
	outAn : ["bounceOut", "bounceOutDown", "bounceOutLeft", "bounceOutRight",
			"bounceOutUp", "fadeOut", "fadeOutDown", "fadeOutDownBig",
			"fadeOutLeft", "fadeOutLeftBig", "fadeOutRight", "fadeOutRightBig",
			"fadeOutUp", "fadeOutUpBig", "flipOutX", "lightSpeedOut",
			"rotateOut", "rotateOutDownLeft", "rotateOutDownRight",
			"rotateOutUpLeft", "rotateOutUpRight", "slideOutDown",
			"slideOutLeft", "slideOutRight", "slideOutUp", "rollOut",
			"zoomOut", "zoomOutDown", "zoomOutLeft", "zoomOutRight",
			"zoomOutUp"],
	/**
	 * 内置强调注意动画
	 * 
	 * @type
	 */
	AttentionAn : ["bounce", "flash", "pulse", "rubberBand", "shake", "swing",
			"tada", "wobble", "hinge"],
	/**
	 * 注册动画
	 * 
	 * @param {}
	 *            key
	 * @param {}
	 *            showAnFun
	 * @param {}
	 *            hideAnFun
	 */
	reg : function(key, value) {
		if (probot.isObj(value)) {
			this.context[key] = value;
		}
	},
	/**
	 * 获取默认执行动画方法
	 * 
	 * @return {}
	 */
	getDefaultFun : function() {
		return function(inAnName, speed, cb) {
			this.animate(inAnName, speed, cb);
		}
	},
	/**
	 * 获取内置动画进入方法
	 * 
	 * @return {}
	 */
	_getInFun : function() {
		return function(inAnName, speed, cb) {
			var _this = this;
			this.animate(inAnName, speed, cb);
			var curDisplayValue = _this.getAttrStyle("display");
			var curVisibilityValue = _this.getAttrStyle("visibility");
			setTimeout(function() {
						if (curDisplayValue == "none") {
							_this.css({
										display : probot
												.isValid(_this.curDisplayValue)
												? _this.curDisplayValue
												: "block"
									});
						}
						if (curVisibilityValue == "hidden") {
							_this.css({
										visibility : "visible"
									});
						}
					});
		}
	},
	/**
	 * 获取内置动画移出方法
	 * 
	 * @return {}
	 */
	_getOutFun : function() {
		return function(outAnName, speed, isSpace, cb) {
			var _this = this;
			var speed = eval('(' + speed + ')');
			var spd = (probot.isValid(speed) && !probot.isFun(speed))
					? speed
					: 1000;
			if (probot.isFun(eval('(' + isSpace + ')'))) {
				cb = eval('(' + isSpace + ')');
			}
			this.animate(outAnName, speed, cb);
			setTimeout(function() {
						if (probot.isTrue(isSpace)) {
							_this.css({
										visibility : "hidden"
									});
						} else {
							var curDisplayValue = _this.getAttrStyle("display");
							if (curDisplayValue != "none") {
								_this.curDisplayValue = curDisplayValue;
							}
							_this.css({
										display : "none"
									});
						}
					}, spd - 100);
		}
	},
	/**
	 * 创建临时动画样式
	 * 
	 * @param {}
	 *            args
	 * @return {}
	 */
	_createTempAnimate : function(args, speed) {
		var time = (probot.isValid(speed) && !probot.isFun(speed)) ? speed
				/ 1000 : 1;
		var tempAnName = "tempAn_" + Math.random().toString().substring(2);
		var styleObj = document.createElement("style");
		styleObj.attr("type", "text/css");
		var type = "animate";
		var css = "";
		for (var k in args) {
			/*2017-07-05 changed yeshiqing 应对`left:0`这种纯数字使用情况报错*/
			if (probot.isValid(args[k]) && (""+args[k]).indexOf(":") < 0) {
				type = "css";
				break;
			}
		}
		var filterCss = function(key) {
			var val = key;
			for (var i = 0; i < Animate.filterStyle.length; i++) {
				if (key.indexOf(Animate.filterStyle[i]) >= 0) {
					val = Animate.filterStyle[i];
					break;
				} else {
					continue;
				}
			}
			return val;
		}
		if (type == "css") {
			var keys = [];
			css += "." + tempAnName + "{";
			for (var key in args) {
				// css += key + ":" + args[key] + ";";
				keys.push(key);
			}
			css += "transition:";
			var split = ",";
			for (var i = 0; i < keys.length; i++) {
				if (i == keys.length - 1) {
					split = ";"
				}
				css += filterCss(keys[i]) + " " + time + "s" + split;
			}
			css += "}"
		} else {
			css = "@keyframes " + tempAnName + "{ ";
			for (var i in args) {
				if (probot.isValid(args[i].toString())) {
					css += i + " {" + args[i].toString() + "}";
				}
			}
			css += " } ." + tempAnName + " {animation-name: " + tempAnName
					+ "}";
		}
		styleObj.text(css);
		document.body.appendChild(styleObj);
		this.tempAnContext[tempAnName] = styleObj;
		return {
			name : tempAnName,
			styleObj : styleObj,
			type : type,
			css : args
		};
	},
	/**
	 * 注册内置动画
	 */
	regAn : function() {
		for (var i = 0; i < this.an.length; i++) {
			var key = this.an[i];
			this.reg(key, {
						show : this._getInFun(),
						hide : this._getOutFun()
					});
		}

		for (var i = 0; i < this.inAn.length; i++) {
			var key = this.inAn[i];
			this.reg(key, {
						show : this._getInFun(),
						hide : this._getOutFun()
					});
		}

		for (var i = 0; i < this.outAn.length; i++) {
			var key = this.outAn[i];
			this.reg(key, {
						show : this._getInFun(),
						hide : this._getOutFun()
					});
		}

		for (var i = 0; i < this.AttentionAn.length; i++) {
			var key = this.AttentionAn[i];
			this.reg(key, {
						show : this._getInFun(),
						hide : this._getOutFun()
					});
		}
	},
	/**
	 * 解析标签属性animate
	 * 
	 * @param {}
	 *            target
	 * @param {}
	 *            animat
	 * @return {}
	 */
	analysisAnimate : function(target, animat) {
		var animate = target.attr("animate");
		if (probot.isValid(animat) && probot.isStr(animat)) {
			animate = animat;
		}
		var eventContext = {};
		if (probot.isValid(animate)) {
			var eventArray = animate.split(";");
			for (var i = 0; i < eventArray.length; i++) {
				var evt = eventArray[i];
				var splitPos = evt.indexOf(":");
				if (splitPos != -1) {
					var eventNames = evt.substring(0, splitPos);

					var eventNameArray = eventNames.split("|");

					var eventValue = null;
					if (eventNameArray.length > 0) {
						eventValue = evt.substring(splitPos + 1, evt.length);
						for (var j = 0; j < eventNameArray.length; j++) {
							eventContext[eventNameArray[j]] = eventValue;
						}
					}
				} else if (i == 0) {
					eventContext = evt;
				}
			}
			return eventContext;
		} else {
			return false;
		}
	},
	/**
	 * 触发动画入口
	 * 
	 * @param {}
	 *            target 对象
	 * @param {}
	 *            eventName 事件方法名称
	 * @param {}
	 *            animat 动画规则字符串
	 * @param {}
	 *            cb 回调函数
	 * @return {Boolean}
	 */
	fireAnimate : function(target, eventName, animat, cb) {
		var flag = true;
		var animate = this.analysisAnimate(target, animat);
		if (!animate) {
			return false;
		}
		var splitType = null;
		if (eventName == "show") {
			splitType = "In";
		} else if (eventName == "hide") {
			splitType = "Out";
		}
		var fire = function(anName) {
			var fg = true;
			var an = anName.substring(0, anName.indexOf("(") != -1 ? anName
							.indexOf("(") : anName.length);
			var args = anName.substring(anName.indexOf("(") + 1,
					anName.lastIndexOf(")")).split(",");
			if (typeof parseInt(args[0], 10) && !isNaN(parseInt(args[0], 10))) {
				args[1] = parseInt(args[0], 10);
				args[0] = "";
			}
			args[0] = an + splitType + args[0].firstUpperCase();
			var isHas = Animate.inAn.hasValue(args[0])
					|| Animate.outAn.hasValue(args[0]);
			if (!isHas) {
				args[0] = an;
			}
			if (typeof animat == "function") {
				cb = animat;
			}
			if (cb) {
				args.push(cb);
			}
			if (Animate.context.hasOwnProperty(an)) {
				var anFun = Animate.context[an][eventName];
				if (probot.isValid(anFun)) {
					if (probot.isFun(anFun)) {
						// anFun.apply(target, args);
						var argus = new Array();
						argus.push(anFun);
						argus.push(args);
						Animate.getDefaultFun().apply(target, argus);
					} else {
						args[0] = anFun;
						Animate.getDefaultFun().apply(target, args);
					}
				} else {
					fg = false;
				}
			} else {
				fg = false;
			}
			return fg;
		}

		var beforeFire = function(anNames) {
			var nameArray = anNames.split(">");
			var flag = false;
			for (var i = 0; i < nameArray.length; i++) {
				flag = fire(nameArray[i]);
			}
			return flag;
		}
		if (probot.isValid(animate)) {
			if (probot.isObj(animate)) {
				if (animate[eventName]) {
					// flag = fire(animate[eventName]);
					flag = beforeFire(animate[eventName]);
				} else {
					flag = false;
				}
			} else if (probot.isStr(animate)) {
				flag = beforeFire(animate);
			}
		}
		return flag;
	}
}

var $a = function(obj) {
	this.target = obj;
	this.animateQueue = new Array();
	this.isStart = false;
}

$a.prototype = {
	animate : function(params, time, easing, cb) {
		this.animateQueue.push(arguments);
		if (!this.isStart) {
			this.start();
		}
		return this;
	},
	/**
	 * 开始执行链表中动画
	 */
	start : function() {
		if (this.animateQueue.length > 0) {
			this.target.isAnimate = true;
			this.isStart = true;
			var args = this.animateQueue.shift();
			var time = 1000;
			if ((typeof args[1] != "undefined")
					&& probot.isNum(parseInt(args[1], 10))) {
				time = args[1];
			}
			var _this = this;
			this.applyAnimate.apply(this, args);
			if (probot.isFun(args[0])) {
				time = 0;
			}
			setTimeout(function() {
						_this.start();
					}, time);
		} else {
			this.target.isAnimate = false;
			this.isStart = false;
			delete Animate.animateObjContext[this.target.tempRandom];
			delete this;
		}
	},
	/**
	 * 应用动画
	 * 
	 * @param {}
	 *            params
	 * @param {}
	 *            time
	 * @param {}
	 *            cb
	 */
	applyAnimate : function(params, time, easing, cb) {
		var _this = this.target;
		var speed = 1000;
		var ease = "ease";
		if (!probot.isFun(params)) {
			speed = eval('(' + time + ')');
		}
		var tm = (probot.isValid(speed) && !probot.isFun(speed)) ? speed : 1000;
		if (probot.isFun(speed)) {
			cb = speed;
		} else if (probot.isFun(easing)) {
			cb = easing;
		} else if (probot.isStr(easing) && Animate.easing.hasValue(easing)) {
			ease = easing;
		}
		if (probot.isStr(params)) {
			_this.css({
						'animation-duration' : tm / 1000 + "s",
						'-moz-animation-duration' : tm / 1000 + "s",
						'-webkit-animation-duration' : tm / 1000 + "s",
						'-o-animation-duration' : tm / 1000 + "s",
						'animation-timing-function' : ease,
						'transition-timing-function' : ease
					});
			_this.addClass("animated infinite " + params);
			setTimeout(function() {
						_this.removeClass("animated infinite " + params);
						if (Animate.tempAnContext[params]) {
							document.body
									.removeChild(Animate.tempAnContext[params]);
							delete Animate.tempAnContext[params];
						}
						if (probot.isFun(cb)) {
							cb.call(_this);
						}
					}, tm);
		} else if (probot.isObj(params)) {
			var tempAnimate = Animate._createTempAnimate(params, tm);
			this.applyAnimate.call(this, tempAnimate.name, time, easing, cb);
			if (tempAnimate.type == "css") {
				this.target.css(tempAnimate.css);
			}
		} else if (probot.isFun(params)) {
			params.apply(this.target, time);
		}
	}
}

var elmPrototype = {
	animate : function(params, time, easing, cb) {
		var key = "";
		if (this.tempRandom) {
			key = this.tempRandom;
		} else {
			key = this.tempRandom = Math.random();
		}
		var _a = Animate.animateObjContext[key];
		if (!_a) {
			_a = new $a(this);
			Animate.animateObjContext[key] = _a;
		}
		_a.animate(params, time, easing, cb);
		return this;// _a;
	},
	/**
	 * 元素显示
	 * 
	 * @param {}
	 *            anName 动画名称
	 * @param {}
	 *            speed 动画执行速度
	 * @param {}
	 *            cb 执行完回调函数
	 * @return {}
	 */
	show : function(anName, speed, cb) {
		var _this = this;
		var defaultFun = function() {
			if (_this.isAnimate == true) {
				setTimeout(function() {
							defaultFun();
						}, 0);
				return;
			};
			if (_this.getAttrStyle("visibility") == "hidden") {
				_this.css({
							'visibility' : 'visible'
						});
			}
			if (_this.getAttrStyle("display") == "none") {
				_this.css({
							'display' : _this.curDisValue
									? _this.curDisValue
									: "block"
						});
			}
		}
		if (probot.isValid(anName)) {
			if (probot.isStr(anName)) {
				var flag = Animate.fireAnimate(this, "show", anName
								+ "(null," + speed + ")", cb);
				if (!flag) {
					defaultFun();
				}
			} else if (probot.isObj(anName)) {
				var tempAnimate = Animate._createTempAnimate(anName,
						speed);
				var anFun = Animate._getInFun();
				anFun.call(this, tempAnimate.name, speed, cb);
				this.css(tempAnimate.css);
			} else {
				defaultFun();
			}
		} else {
			var flag = Animate.fireAnimate(this, "show");
			if (!flag) {
				defaultFun();
			}
		}
		return this;
	},
	/**
	 * 隐藏元素
	 * 
	 * @param {}
	 *            anName 动画名称
	 * @param {}
	 *            speed 动画执行速度
	 * @param {}
	 *            isSpace 是否占位隐藏
	 * @param {}
	 *            cb 执行完回调函数
	 * @return {}
	 */
	hide : function(anName, speed, isSpace, cb) {
		var _this = this;
		var defaultFun = function(isSpac) {
			if (_this.isAnimate == true) {
				setTimeout(function() {
							defaultFun(isSpac);
						}, 0);
				return;
			};
			var disValue = _this.getAttrStyle("display");
			// _this.curDisValue = (disValue === "none")
			// ? "block"
			// : disValue;
			if (probot.isValid(disValue) && disValue != "none") {
				_this.curDisValue = disValue;
			}
			if (probot.isTrue(isSpac)) {
				_this.css({
							'visibility' : 'hidden'
						});
			} else {
				_this.css({
							'display' : 'none'
						});
			}
		}
		if (probot.isValid(anName)) {
			if (probot.isStr(anName)) {
				var flag = Animate.fireAnimate(this, "hide", anName
								+ "(null," + speed + "," + isSpace
								+ ")", cb);
				if (!flag) {
					defaultFun();
				}
			} else if (probot.isObj(anName)) {
				var tempAnimate = Animate._createTempAnimate(anName,
						speed);
				var anFun = Animate._getOutFun();
				anFun.call(this, tempAnimate.name, speed, isSpace, cb);
				this.css(tempAnimate.css);
			} else if (probot.isBol(anName)) {
				defaultFun(anName);
			}
		} else {
			var flag = Animate.fireAnimate(this, "hide");
			if (!flag) {
				defaultFun();
			}
		}
		return this;
	},
	attention : function() {
		var flag = Animate.fireAnimate(this, "attention");
		if (!flag) {
			alert("attention");
		}
	}
}

NetilerUI.extend(Element.prototype, elmPrototype);

NetilerUI.ready(function() {
			Animate.regAn();
		});

})();
