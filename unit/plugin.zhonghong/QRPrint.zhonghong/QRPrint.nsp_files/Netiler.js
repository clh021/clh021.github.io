/**
 * @fileOverview Netiler.js前端框架
 * @author leadal
 */

var netiler = {
	version : '3.0',
	local : false,
	jserviceProxy:null,
	_proxy_ : {},
	namespace : function(names) {
		var ns = names.split('.');
		var target = window;
		var name;
		for (var i = 0; i < ns.length; i++) {
			name = ns[i];
			if (typeof target[name] == 'undefined') {
				target[name] = {};
			}
			target = target[name];
		}
	},
	proxy : function(alias, jservice) {
		var key = jservice._service + "@" + alias;
		var p = netiler._proxy_[key];
		if (!p) {
			p = {
				_proxy : alias
			};
			netiler.system.clone(jservice, p);
			netiler._proxy_[key] = p;
		}
		return p;
	},
	extend : function(pro, src) {
		for (var k in src) {
			pro[k] = src[k];
		}
	},
	object : function(names) {
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
	browser : {
		isIE5 : function() {
			if (!netiler.browser.__ie5) {
				if (window.ActiveXObject) {
					var ua = navigator.userAgent.toUpperCase();
					if (ua.indexOf('MSIE 5') > 0) {
						netiler.browser.__ie5 = {
							value : true
						};
						return true;
					}
				}
				netiler.browser.__ie5 = {
					value : false
				};
				return false;
			}
			return netiler.browser.__ie5.value;
		}
	},
	system : {
		each : function(list, fn) {
			for (var i = 0; i < list.length; i++) {
				var item = list[i];
				if (fn(item, i, list) === false) {
					break;
				}
			}
		},
		clone : function(src, desc) {
			for (var k in src) {
				desc[k] = src[k];
			}
		}
	},
	types : {
		natives : {
			'string' : true,
			'number' : true,
			'boolean' : true
		},
		/**
		 * 是否为null或undefined
		 */
		isNull : function(val) {
			return val == null ? true : false;
		},
		/**
		 * 是否为String,Number,Boolean类型
		 */
		isNative : function(val) {
			return netiler.types.natives[typeof val];
		},
		isString : function(val){
			return Object.prototype.toString.call(val) === "[object String]";
		},
		isNumber : function(val) {
			if(Object.prototype.toString.call(val) === "[object Number]"){
				return isNaN(val) ? false : true;
			}else{
				return false;
			}
		},
		isFunction : function(val) {
			return Object.prototype.toString.call(val) === "[object Function]";
		},
		isArray : function(val) {
			return Object.prototype.toString.call(val) === "[object Array]";
		},
		isDate : function(val) {
			return Object.prototype.toString.call(val) === "[object Date]";
		},
		isObject : function(val) {
			return Object.prototype.toString.call(val) === "[object Object]";
		},
		/**
		 * 是否有效值
		 * 过滤null、undefined、/\s{0,}/ig(空字符串等)、NaN
		 */
		isValid : function(val) {
			if(this.isString(val)){
				return val.trim() !== "" && val !== "null" && val !== "undefined";
			}else if(val === false || val === 0){
				return true;
			}
			
			return val ? true : false;//过滤null、undefined、NaN
		}
	},
	/**
	 * 选取DOM元素
	 * 
	 * @param {String}
	 *            key 必填参数，可以是目标元素的标签名、id、className(用于js一般要加js_前缀)
	 * @param {Object}
	 *            tag [tag=document]-已知目标元素是某个DOM元素的子孙元素，进而缩小目标元素的搜索范围，提高性能
	 * @return {Object} [所选取到的DOM元素]
	 *         @example
	 *         //找到第一个就返回的情况
	 * netiler.$("ui:text")//获取所有标签名为ui:text的元素【与NetilerUI.$有区别】
	 * netiler.$("#foo");//获取id值为foo的元素【与NetilerUI.$相同】
	 * netiler.$(".foo");//获取className名为foo的元素,取到符合要求的第一个即返回。用于js的class名一般要加js_前缀【与NetilerUI.$不同】
	 * netiler.$(".foo .bar");//.foo元素下的.bar元素。【与NetilerUI.$不同】
	 * netiler.$(".foo:nth-child(2)");//排在第二个的子元素且为.foo的元素。【与NetilerUI.$不同】
	 * netiler.$(".foo:nth-of-type(2)");//className包含.foo，且在全部同类型的同级标签中排位第二个的元素。【与NetilerUI.$不同】
	 * netiler.$(".foo:first-child");//className包含.foo的第一个子元素。【与NetilerUI.$不同】
	 * netiler.$(".foo:last-child");//className包含.foo的最后一个子元素。【与NetilerUI.$不同】
	 * //找到所有符合要求的元素
	 * netiler.$("ui:button");页面中所有ui:button标签元素。返回数组。
	 */
	$ : function(key, tag) {
		if (key.tagName) {
			return key;
		}
		var keys = key.split('>');
		if (!tag) {
			tag = document;
		}
		for (var i = 0; i < keys.length; i++) {
			tag = netiler.document.$(keys[i], tag);
			if (!tag) {
				return null;
			}
		}
		return tag;
	},
	/**
	 * 选取DOM元素
	 * 
	 * @param {String}
	 *            key 必填参数，可以是目标元素的标签名、id、className(用于js一般要加js_前缀)
	 * @param {Object}
	 *            tag [tag=document]-已知目标元素是某个DOM元素的子孙元素，进而缩小目标元素的搜索范围，提高性能
	 * @return {Object} [所选取到的DOM元素]
	 *         @example
	 *         //找到所有满足要求的DOM元素
	 * netiler.$s(".foo .bar");//所有.foo元素下的所有.bar元素。找到全部，返回数组。
	 */
	$s : function(key, tag) {
		var keys = key.split('>');
		if (!tag) {
			tag = document;
		}
		var tags = [tag];
		for (var i = 0; i < keys.length; i++) {
			var ntags = [];
			for (var j = 0; j < tags.length; j++) {
				var nodes = netiler.document.$s(keys[i], tags[j]);
				netiler.system.each(nodes, function(node) {
							ntags.push(node);
						});
			}
			if (ntags.length == 0) {
				return [];
			}
			tags = ntags;
		}
		return tags;
	},
	$$ : function(id, values) {
		var tags = netiler.$s(id);
		netiler.system.each(tags, function(tag) {
					netiler.template.render(tag, values);
				});
	},
	reseURL : function(url) {
		if ("chrome:" == location.protocol) {
			var server = chrome.getPref("netiler." + location.host + ".server");
			if (!server) {
				server = chrome.getPref("netiler.home.url");
				var n = server.indexOf('/', 10);
				if (n != -1) {
					server = server.substring(0, n);
				}
			}
			return server + url;
		}
		if (typeof MobileWindow != 'undefined') {
			return MobileWindow.getServerUrl() + url;
		}
		if (typeof require != 'undefined' && typeof process != 'undefined') {
			if (!netiler.baseURL) {
				var path = require('path');
				var nwpath = path.dirname(process.execPath);
				var fs = require("fs");
				var filepath = nwpath + "/con"+"fig."+"ini";
				var data = fs.readFileSync(filepath, "utf-8");
				var config = eval('(' + data + ')');
				netiler.baseURL = config.url;
			}
			return netiler.baseURL + url;
		}
		return url;
	},
	document : {
		$ : function(key, tag) {
			return netiler.document.$q(key, tag, true);
		},
		$s : function(key, tag) {
			return netiler.document.$q(key, tag, false);
		},
		$q : function(key, tag, first) {
			key = netiler.string.trim(key);
			var k = key.substring(0, 1);
			var v = key.substring(1);
			var filter = null;
			var n = v.indexOf('[');
			if (n != -1) {
				var m = v.indexOf(']');
				filter = v.substring(n + 1, m);
				v = v.substring(0, n);
			}
			if (filter && filter.length > 0) {
				filter = netiler.document.$f(filter);
			}
			switch (k) {
				case '#' :
					return netiler.document.$id(v, tag, filter, first);
				case '&' :
					return netiler.document.$name(v, tag, filter, first);
				case '.' :
					return netiler.document.$class(v, tag, filter, first);
				case '?' :
					return netiler.document.$form(v, tag, filter, first);
				case '@' :
					return netiler.document.$string(v, tag, filter, first);
				default :
					return netiler.document.$tag(k + v, tag, filter, first);
			}
		},
		$f : function(fkey, parentFilter) {
			fkey = netiler.string.trim(fkey);
			var filters = [];
			var fs = fkey.split(',');
			var f, n, v;
			for (var i = 0; i < fs.length; i++) {
				f = fs[i];
				n = f.indexOf('=');
				if (n != -1) {
					v = netiler.string.trim(f.substring(n + 1));
					f = netiler.string.trim(f.substring(0, n));
				} else {
					v = '*';
				}
				filters.push({
							atb : f,
							matches : new RegExp('(^|\\s)' + v + '(\\s|$)')
						});
			}
			return function(tag) {
				if (!tag) {
					return false;
				}
				if (parentFilter) {
					if (!parentFilter(tag)) {
						return false;
					}
				}
				var filter, value;
				for (var j = 0; j < filters.length; j++) {
					var filter = filters[j];
					if (filter.atb == 'class') {
						value = tag.className;
					} else {
						value = tag.getAttribute(filter.atb);
					}
					if (!value) {
						return false;
					}
					if (!filter.matches.test(value)) {
						return false;
					}
				}
				return true;
			};

		},
		$string : function(value, tag, filter, first) {
			tag = {
				tagName : 'STRING',
				getAttribute : function() {
					return null;
				},
				value : value
			}
			if (first) {
				return tag;
			} else {
				return [tag];
			}
		},
		$filter : function(tags, filter, first) {
			var list = [];
			var tag;
			for (var i = 0; i < tags.length; i++) {
				tag = tags[i];
				if (filter) {
					if (filter(tag)) {
						if (first) {
							return tag;
						}
						list.push(tag);
					}
				} else {
					list.push(tag);
				}
			}
			return list;
		},
		$list : function(tags, filter) {
			return netiler.document.$filter(tags, filter);
		},
		$id : function(id, tag, filter, first, tagName) {
			var node = document.getElementById(id);
			if (filter && !filter(node)) {
				node = null;
			}
			if (first) {
				return node;
			}
			if (node) {
				return [node];
			}
			return [];
		},
		/**
		 * @description 选取某元素里面的所有目标子元素
		 * @param {String}
		 *            tagName 目标元素的tagName
		 * @param {DOMElement|Array}
		 *            tag 元素搜索范围，默认为document
		 * @param {Function}
		 *            filter 元素的属性过滤器
		 * @param {Boolean}
		 *            first 是否搜到第一个即停止
		 * @return {Array} 包含所有满足要求的元素，未匹配任何元素则返回空数组。
		 * @ignore
		 */
		$tag : function(tagName, tag, filter, first) {
			if (!tag) {
				tag = document;
			}
			if (!tagName) {
				tagName = '*';
			}
			var tags = null;
			if (tagName == '*' && netiler.browser.isIE5()) {
				tags = tag.all;
			} else {
				tags = tag.getElementsByTagName(tagName);
			}
			return netiler.document.$filter(tags, filter, first);
		},
		$attr : function(atb, value, tag, filter, first, tagName) {
			filter = netiler.document.$f(atb + '=' + value, filter);
			return netiler.document.$tag(tagName, tag, filter, first);
		},
		$name : function(name, tag, filter, first, tagName) {
			if (tag == document) {
				var tags = tag.getElementsByName(name);
				netiler.document.$filter(tags, filter, first);
			} else {
				return netiler.document.$attr('name', name, tag, filter, first,
						tagName);
			}
		},
		$form : function(formName, tag, filter, first) {
			tag = document.forms[formName];
			if (tag) {
				var tags = tag.elements;
				if (filter) {
					var list = [];
					netiler.system.each(tags, function(node) {
								if (filter(node)) {
									list.push(node);
								}
							});
					tags = list;
				}
				var form = {
					tagName : 'FORM',
					elements : tags,
					getAttribute : function(name) {
						if (name == 'useSimpleName') {
							return 'true';
						}
						return tag.getAttribute(name);
					},
					toJson : function(){
						return netiler.json.form2Json(this);
					}
				}
				if (first) {
					return form;
				} else {
					return [form];
				}
			}
			return null;
		},
		/**
		 * @description $class的老式代码
		 * @deprecated
		 * @ignore
		 */
		_$classOld:function(className, tag, filter, first, tagName){
			var exp = new RegExp("(^|\\s)" + className + "(\\s|$)");
			var classFilter = function(node) {
				if (!node.className) {
					return false;
				}
				if (exp.test(node.className)) {
					if (filter) {
						return filter(node);
					}
					return true;
				}
				return false;
			}
			return netiler.document.$tag(tagName, tag, classFilter, first);
		},
		/**
		 * @description 根据className匹配DOM元素。【注意:netiler.$(".foo")，当.foo元素不存在时返回空数组，而非null,在判断时需要注意。这是框架最初设计的遗留问题。】
		 * @param {String}
		 *            className 目标匹配的className
		 * @param {DOMElement}
		 *            tag 搜索范围，默认是document
		 * @param {Function}
		 *            filter 属性过滤器
		 * @param {Boolean}
		 *            first 是否找到第一个元素即返回，还是找出所有满足要求的元素。
		 * @param {undefined}
		 *            tagName 目前该参数无用
		 * @return {DOMElement|Array}
		 *         @example
		 *         //找到所有满足要求的值
		 * netiler.$s(".foo .bar");//所有.foo元素下的所有.bar元素。找到全部，返回数组。
		 * netiler.$s(".foo.bar");//所有的.foo.bar元素。找到全部，返回数组。
		 * //找到第一个就返回的情况
		 * netiler.$(".foo .bar");//.foo元素下的.bar元素。
		 * netiler.$(".foo:nth-child(2)");//排在第二个的子元素且为.foo的元素。
		 * netiler.$(".foo:nth-of-type(2)");//className包含.foo，且在全部同类型的同级标签中排位第二个的元素。
		 * netiler.$(".foo:first-child");//className包含.foo的第一个子元素。
		 * netiler.$(".foo:last-child");//className包含.foo的最后一个子元素。
		 * //目前不支持netiler.$(".foo>.bar")这种写法
		 * @ignore
		 */
		$class : function(className, tag, filter, first, tagName) {
			if (typeof document.querySelector === "function") {
				var target = null;
				if (first) {
					target = document.querySelector("." + className);
					if(target===null){
						return this._$classOld.apply(this,arguments);
					}
				} else {
					target = [].slice.call(document.querySelectorAll("."
							+ className));
					//兼容老式代码 netiler.$s(".foo selected")的用法。新式写法：netiler.$s(".foo.selected");
					if(target.length===0){
						return this._$classOld.apply(this,arguments);
					}
				}
				return target;
			} else {
				return this._$classOld.apply(this,arguments);
			}
		}
	},
	string : {
		escapeHTML : function(str) {
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(
					/>/g, '&gt;').replace(/\n/g, '<br/>').replace(/ /g,
					'&nbsp;');
		},
		unescapeHTML : function(str) {
			return this.stripTags(str).replace(/&lt;/g, '<').replace(/&gt;/g,
					'>').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
		},
		stripTags : function(str) {
			return str.replace(/<br>/ig, '\n').replace(
					/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
		},
		trim : function(str) {
			return str.replace(/^\s+/g, "").replace(/\s+$/g, "");
		}
	},
	validate : {
		extend : function(obj) {
			for (var k in obj) {
				netiler.validate[k] = obj[k];
			}
		},
		email : function(value, tag) {
			var patterns = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
			var mailArray = value.split(',');
			for (var i = 0; i < mailArray.length; i++) {
				var e = mailArray[i];
				if (!patterns.test(e)) {
					return false;
				}
			}
			return true;
		},
		date : function(value, tag) {
			var format = tag.getAttribute('format');
			if (!format) {
				format = "yyyy-MM-dd";
			}
			return netiler.date.check(value, format);
		},
		timestamp : function(value, tag) {
			var format = tag.getAttribute('format');
			if (!format) {
				format = "yyyy-MM-dd hh:mm:ss";
			}
			return netiler.date.check(value, format);
		},
		number : function(value, tag) {
			return (/^[\+|-]?\d{1,}[.]?\d{0,}$/.test(value));
		}
	},
	date : {
		rules : [/[^y|Y]/g, /[^M]/g, /[^d]/g, /[^h]/g, /[^m]/g, /[^s]/g],
		format : function(date, formatter) {
			if (!formatter || formatter == "") {
				formatter = "yyyy-MM-dd";
			}
			var year = date.getFullYear().toString();
			var times = [year];
			times.push((date.getMonth() + 1).toString());
			times.push(date.getDate().toString());
			times.push(date.getHours().toString());
			times.push(date.getMinutes().toString());
			times.push(date.getSeconds.toString());
			var markers = [];
			var i, marker, time, rules;
			var rules = netiler.date.rules;
			for (i = 0; i < rules.length; i++) {
				markers.push(formatter.replace(rules[i], ''));
			}
			var yearMarker = markers[0];
			if (yearMarker.length == 2) {
				year = year.substring(2, 4);
			}
			formatter = formatter.replace(yearMarker, year);
			for (i = 1; i < markers.length; i++) {
				marker = markers[i];
				time = times[i];
				if (marker.length > 1) {
					if (time.length == 1) {
						time = "0" + time;
					}
					formatter = formatter.replace(marker, time);
				}
			}

			return formatter;
		},
		check : function(value, formatter) {
			var markers = [];
			var i, marker, n, rules, pos;
			var rules = netiler.date.rules;
			for (i = 0; i < rules.length; i++) {
				markers.push(formatter.replace(rules[i], ''));
			}
			for (i = 0; i < markers.length; i++) {
				marker = markers[i];
				pos = formatter.indexOf(marker);
				if (marker.length > 1) {
					n = pos + marker.length;
					if (value.substring(n, n + 1) != formatter.substring(n, n
									+ 1)) {
						return false;
					}
				}
			}
			return true;
		},
		parse : function(dateString, formatter) {
			var today = new Date();
			if (!dateString || dateString == "") {
				return today;
			}
			if (!formatter || formatter == "") {
				formatter = "yyyy-MM-dd hh:mm:ss";
			}
			var markers = [];
			var i, marker, time, rules, pos;
			var times = [];
			var rules = netiler.date.rules;
			for (i = 0; i < rules.length; i++) {
				markers.push(formatter.replace(rules[i], ''));
			}
			marker = markers[0];
			pos = formatter.indexOf(marker);
			var year = dateString.substring(pos, pos + marker.length) * 1;
			if (marker.length == 2) {
				if (year < 50) {
					year += 2000;
				} else {
					year += 1900;
				}
			}
			times.push(year);
			for (i = 1; i < markers.length; i++) {
				marker = markers[i];
				pos = formatter.indexOf(marker);
				time = pos != -1 ? dateString.substring(pos, pos
								+ marker.length)
						* 1 - 1 : 0;
				times.push(time);
			}
			return new Date(times[0], times[1], times[2], times[3], times[4],
					times[5]);
		}
	},
	template : {
		namesake : {
			checked : function(tagvalue, value, ns) {
				if (ns) {
					ns = netiler.template.namesake[ns];
				}
				if (ns) {
					return ns(tagvalue, value);
				} else {
					return this.join(tagvalue, value);
				}
			},
			bitand : function(tagvalue, value) {
				var andvalue = parseInt(tagvalue);
				return (andvalue & parseInt(value)) == andvalue;
			},
			join : function(tagvalue, value) {
				if (typeof value == 'boolean') {
					if (value) {
						value = 'true';
					} else {
						value = 'false';
					}
				}
				value = ',' + value + ',';
				return value.indexOf(',' + tagvalue + ',') != -1
			},
			array : function(tagvalue, value) {
				if (netiler.types.isArray(value)) {
					var v;
					for (var i = 0; i < value.length; i++) {
						v = value[i];
						if (v == tagvalue) {
							return true;
						}
					}
					return false;
				} else {
					return netiler.template.namesake.simple(tagvalue, value);
				}
			}
		},
		types : {
			extend : function(obj) {
				for (var k in obj) {
					netiler.template.types[k] = obj[k];
				}
			},
			text : function(value, values, tag, tagName, type) {
				tag.innerHTML = '';
				if (!tagName) {
					tagName = 'input';
				}
				var input = document.createElement(tagName);
				if (type) {
					input.type = type;
				}
				var name = tag.getAttribute('name');
				if (name) {
					input.name = name;
				}
				input.value = value;
				tag.appendChild(input);
			},
			checkbox : function(value, values, tag) {
				var type = tag.getAttribute('type');
				var v = tag.getAttribute('value');
				var ns = tag.getAttribute('namesake');
				var name = tag.getAttribute('name');
				var checked = netiler.template.namesake.checked(v, value, ns);
				var label = tag.getAttribute('label');
				if (!label) {
					label = ' ';
				} else {
					label = ' ' + netiler.template.str(values, label);
				}
				tag.innerHTML = '<input ' + (name ? 'name="' + name + '"' : '')
						+ 'type="' + type + '" value="' + v + '"'
						+ (checked ? ' checked="checked"' : '') + '>' + label;

			},
			radio : function(value, values, tag) {
				netiler.template.types.checkbox(value, values, tag);
			},
			password : function(value, values, tag) {
				netiler.template.types.text(value, values, tag, 'input',
						'password');
			},
			textarea : function(value, values, tag) {
				netiler.template.types.text(value, values, tag, 'textarea');
			},
			link : function(value, values, tag) {
				var href = tag.getAttribute('href');
				var label = tag.getAttribute('label');
				var onclick = tag.getAttribute('onclick');
				if (!label) {
					label = value;
				} else {
					label = netiler.template.str(values, label);
				}
				tag.innerHTML = '<a href="'
						+ netiler.template.str(values, href) + '" onclick="'
						+ netiler.template.str(values, onclick) + '">' + label
						+ '</a>';
			},
			number : function(value, values, tag) {
				var format = tag.getAttribute('format');
				if (format) {
					value = netiler.template.str(values, format);
				}
				tag.innerHTML = value;
			},
			date : function(value, values, tag) {
				var format = tag.getAttribute('format');
				if (format) {
					var date = netiler.date.parse(value);
					value = netiler.date.format(date, format);
				}
				tag.innerHTML = value;
			},
			datebox : function(value, values, tag) {
				var format = tag.getAttribute('format');
				if (format) {
					var date = netiler.date.parse(value);
					value = netiler.date.format(date, format);
				}
				netiler.template.types
						.text(value, values, tag, 'input', 'text');
			},
			bool : function(value, values, tag) {
				var label = tag.getAttribute('label');
				if (label) {
					var ls = label.split('|');
					if (value === true) {
						tag.innerHTML = ls[0];
					} else {
						tag.innerHTML = ls[1];
					}
				} else {
					tag.innerHTML = value;
				}
			},
			img : function(value, values, tag) {
				var src = tag.getAttribute('src');
				var label = tag.getAttribute('label');
				if (!label) {
					label = value;
				}
				tag.innerHTML = '<img src="'
						+ netiler.template.str(values, src) + '" alt="' + label
						+ '"/>';
			},
			a : function(value, values, tag) {
				return netiler.template.types.link(value, values, tag);
			},
			span : function(value, values, tag) {
				var html = tag.getAttribute('escapeHtml');
				if (html != 'false') {
					value = netiler.string.escapeHTML(value);
				}
				tag.innerHTML = value;
			},
			sub : function(value, values, tag) {
				var inc = tag.getAttribute('include');
				if (inc != null) {
					var node = netiler.$(inc);
					if (node) {
						node = node.cloneNode(true);
						node.id = '';
						tag.appendChild(node);
						value.$parent = values;
						netiler.template.render(tag, value);
						delete value.$parent;
					}
				}
			}
		},
		str : function(values, rule) {
			if (!rule) {
				return '';
			}
			var text = [];
			var key, value;
			var n = rule.indexOf('{');
			while (n != -1) {
				text.push(rule.substring(0, n));
				rule = rule.substring(n + 1);
				n = rule.indexOf('}');
				if (n != -1) {
					key = rule.substring(0, n);
					rule = rule.substring(n + 1);
					value = values[key];
					if (typeof value != 'undefined') {
						text.push(value);
					}
					n = rule.indexOf('{');
				} else {
					text.push('{');
				}
			}
			text.push(rule);
			return text.join('');
		},
		render : function(tag, values) {
			if (tag.tagName == 'FORM') {
				netiler.template.form(tag, values);
			} else if (tag.getAttribute('each')) {
				netiler.template.list(tag, values);
			} else {
				netiler.template.view(tag, values);
			}
		},
		view : function(tag, values) {
			if (!tag) {
				return;
			}
			if (tag.tagName == 'SPAN' && tag.getAttribute('key')) {
				this.span(tag, values);
			} else {
				var tags = netiler.$s('span', tag);
				for (var i = 0; i < tags.length; i++) {
					this.span(tags[i], values);
				}
			}
		},
		span : function(item, values) {
			var key, type, fun;
			key = item.getAttribute('key');
			if (key) {
				var value = values[key];
				if (key == 'this') {
					value = values;
				}
				if (typeof value == 'undefined') {
					value = '';
				}
				type = item.getAttribute('type');
				if (!type) {
					type = 'span';
				}
				if (type.substring(0, 1) == '@') {
					fun = netiler.object(type.substring(1));
				} else {
					fun = this.types[type];
				}
				if (fun) {
					fun(value, values, item);
				}
			}
		},
		clean : function(pnode, tnode) {
			var nodes = pnode.childNodes;
			var tags = [];
			for (var i = 0; i < nodes; i++) {
				tags[i] = nodes[i];
			}
			var tag;
			for (var i = 0; i < tags.length; i++) {
				tag = tags[i];
				if (tag.getAttribute('_tid') == tnode.id) {
					pnode.removeChild(tag);
				}
			}
		},
		list : function(tag, values, pnode) {
			if (!tag) {
				return;
			}
			var tid = tag.getAttribute('each');
			if (tid) {
				var append = false;
				if (tag.getAttribute("append") == 'true') {
					append = true;
				}
				var key = tag.getAttribute('key');
				if (key && key != 'this') {
					values = values[key];
				}
				var tnode = netiler.$(tid, tag);
				if (!tnode || !tnode.tagName) {
					alert('unmatches element by ' + tid);
					return;
				}
				if (!pnode) {
					pnode = tnode.parentNode;
				}

				tnode.style.display = 'none';
				if (!append) {
					this.clean(pnode, tnode);
				}
				for (var i = 0; i < values.length; i++) {
					var node = tnode.cloneNode(true);
					node.id = '';
					node.setAttribute('_tid', tnode.id);
					node.style.display = '';
					netiler.template.view(node, values[i]);
					pnode.appendChild(node);
				}
			}
		},
		form : function(tag, values) {
			var els = netiler.document.$list(tag.elements);
			var usn = tag.getAttribute('useSimpleName') == 'true';
			var value, name;
			var radio = {};
			var item, ns;
			for (var i = 0; i < els.length; i++) {
				item = els[i];
				name = item.name;
				if (!name || name.length == 0) {
					continue;
				}
				if (usn) {
					name = name.substring(name.lastIndexOf('.') + 1);
				}
				value = values[name];
				if (typeof value == 'undefined') {
					continue;
				}
				switch (item.tagName) {
					case 'SELECT' :
						var ops = item.options;
						var op;
						ns = item.getAttribute('namesake');
						for (var j = 0; j < ops.length; j++) {
							op = ops[j];
							op.selected = netiler.template.namesake.checked(
									op.value, value, ns);
						}
						break;
					case 'INPUT' :
						if (item.type == 'radio' || item.type == 'checkbox') {
							ns = item.getAttribute('namesake');
							item.checked = netiler.template.namesake.checked(
									item.value, value, ns);
						} else {
							item.value = value;
						}
						break;
					default :
						item.value = value;
						break;

				}
			}
		}
	},
	json : {
		namesake : {
			bitand : function(value, data, name) {
				var ovalue = data[name];
				value = parseInt(value);
				if (typeof ovalue == 'undefined') {
					data[name] = value;
				} else {
					data[name] = value | ovalue;
				}
			},
			join : function(value, data, name) {
				var ovalue = data[name];
				if (typeof ovalue == 'undefined') {
					data[name] = value;
				} else {
					data[name] = ovalue + "," + value;
				}
			},
			array : function(value, data, name) {
				var ovalue = data[name];
				if (typeof ovalue == 'undefined') {
					data[name] = [value];
				} else {
					ovalue.push(value);
				}
			}
		},
		toJson : function(value) {
			if (netiler.types.isNull(value)) {
				return 'null';
			}
			var type = typeof value;
			var fun = this[type];
			if (fun) {
				return fun.call(this, value);
			} else {
				return 'null';
			}
		},
		/**
		 * 在`netiler.$("?copyForm[name=entity.*]");`这种用法中会将表单项的`<input name="entity.heading" value="标题"/>`上的name,value转换成不含entity的json字段
		 */
		form2Json : function(tag) {
			var els = tag.elements;
			var usn = tag.getAttribute('useSimpleName') == 'true';
			var data = {};
			var item;
			var fn;
			var value, ovalue, name, required, validate, msg, regexp, msgtag, focus;
			var error = [];
			for (var i = 0; i < els.length; i++) {
				item = els[i];
				if (item.disabled) {
					continue;
				}
				name = item.name;
				if (!name || name.length == 0) {
					continue;
				}
				fn = this.formTag[item.tagName];
				if (fn) {
					if (usn) {
						name = name.substring(name.lastIndexOf('.') + 1);
					}
					value = fn(item);
					if (typeof value == 'undefined') {
						continue;
					}
					msg = item.getAttribute('msg');
					if (msg) {
						msg = netiler.$(msg);
					}
					if (value == '') {
						required = item.getAttribute('required');
						if (required) {
							error.push(item.name);
							if (msg && msg.style) {
								msg.style.display = '';
							} else {
								if (!focus && msg) {
									alert(msg.value);
								}
							}
							if (!focus) {
								focus = item;
							}
						}
					} else {
						validate = item.getAttribute('validate');
						if (validate) {
							validate = netiler.validate[validate];
							if (validate) {
								validate = validate(value, item);
							} else {
								regexp = new RegExp(validate);
								validate = regexp.test(value);
							}
							if (!validate) {
								if (msg && msg.style) {
									msg.style.display = '';
								} else {
									if (!focus && msg) {
										alert(msg.value);
									}
								}
								if (!focus) {
									focus = item;
								}
								error.push(item.name);
							} else {
								if (msg && msg.style) {
									msg.style.display = 'none';
								}
							}
						}
					}
					var ns = item.getAttribute('namesake');
					if (ns) {
						ns = netiler.json.namesake[ns];
					}
					if (ns) {
						ns(value, data, name);
					} else {
						netiler.json.namesake.join(value, data, name);
					}

				}
			}
			if (error.length > 0) {
				focus.focus();
				throw error;
			}
			return data;
		},
		'string' : function(value) {
			value = value.replace(/"/g, '\\"');
			value = value.replace(/\n/g, '\\n');
			value = value.replace(/\r/g, '\\r');
			value = value.replace(/\t/g, '\\t');
			return '"' + value + '"';
		},
		'number' : function(value) {
			return value + '';
		},
		'boolean' : function(value) {
			return value + '';
		},
		'object' : function(value) {
			if (value instanceof Date) {
				return this.date(value);
			} else if (value instanceof Array) {
				return this.array(value);
			} else if (value.tagName) {
				return this.element(value);
			} else {
				return this.map(value);
			}

		},
		meta : {
			'\b' : '\\b',
			'\t' : '\\t',
			'\n' : '\\n',
			'\f' : '\\f',
			'\r' : '\\r',
			'"' : '\\"',
			'\\' : '\\\\'
		},
		formTag : {
			STRING : function(tag) {
				return tag.value;
			},
			FORM : function(tag) {
				return netiler.json.form2Json(tag);
			},
			TEXTAREA : function(tag) {
				return tag.value;
			},
			INPUT : function(tag) {
				if (tag.type == 'radio' || tag.type == 'checkbox') {
					if (tag.checked) {
						return tag.value;
					}
				} else {
					return tag.value;
				}
			},
			SELECT : function(tag) {
				return tag.value;
			}

		},
		map : function(value) {
			var json = [];
			json.push('{');
			var i = 0;
			var item;
			for (var key in value) {
				item = value[key];
				if (typeof item != 'function') {
					if (i > 0) {
						json.push(',');
					}
					json.push('"');
					json.push(key);
					json.push('":');
					json.push(this.toJson(item));
					i++;
				}
			}
			json.push('}');
			return json.join('');
		},
		//TODO element
		element : function(value) {
			var fn = this.formTag[value.tagName];
			if (fn) {
				return this.toJson(fn(value));
			}
			return this.toJson(netiler.string.unescapeHTML(value.innerHTML));
		},
		array : function(value) {
			var json = [];
			json.push('[');
			for (var i = 0; i < value.length; i++) {
				if (i > 0) {
					json.push(',');
				}
				json.push(this.toJson(value[i]));
			}
			json.push(']');
			return json.join('');

		},
		date : function(value) {
			return value.getTime() + '';
		},
		fn : function(n) {
			return n < 10 ? '0' + n : n;
		},
		datetime : function(value) {
			return value.getFullYear() + '-' + this.fn(value.getMonth()) + '-'
					+ this.fn(value.getDay()) + ' ' + this.fn(value.getHours())
					+ ':' + this.fn(value.getMinutes()) + ':'
					+ this.fn(value.getSeconds()) + '.'
					+ this.fn(value.getMilliseconds());
		}
	},

	time : new Date().getTime(),
	activex : {
		XMLHTTP : ["Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0",
				"Msxml2.XMLHTTP.4.0", "MSXML2.XMLHTTP.3.0", "MSXML2.XMLHTTP",
				"Microsoft.XMLHTTP"],
		XMLHttpRequest : function() {
			return this.create(this.XMLHTTP);
		},
		create : function(names) {
			var returnValue;
			for (var i = 0; i < names.length; i++) {
				try {
					returnValue = new ActiveXObject(names[i]);
					break;
				} catch (ex) {
					/* ignore */
				}
			}
			return returnValue;
		}
	},
	xhr : {
		iframe : function() {
			this.open = function(method, url, async) {
				this.action = url;
				this.method = method;
				this.async = async;
			};
			this.getResponseHeader = function() {
				return null;
			};
		},
		create : function(multipart) {
			if (multipart) {
				return new this.iframe();
			}
			if (window.XMLHttpRequest) {
				return new XMLHttpRequest();
			} else if (window.ActiveXObject) {
				return netiler.activex.XMLHttpRequest();
			}
			return null;
		},
		toPostData : function(param) {
			if (param.postJson) {
				return netiler.json.toJson(param.data);
			}
			return this.toHttpData(param.data, "");
		},
		ajaxPost : function(req, param) {
			for (var prop in param.headers) {
				var value = param.headers[prop];
				if (typeof value == "string") {
					req.setRequestHeader(prop, value);
				}
			}
			if (!param.headers["Content-Type"]) {
				req.setRequestHeader("Content-Type", "text/plain");
			}
			if (param.data) {
				try {
					req.send(netiler.xhr.toPostData(param));
				} catch (e) {

				}
			} else {
				req.send("");
			}
		},
		iframePost : function(req, param) {
			var data = param.data;
			var span = document.createElement("span");
			span.style.display = 'none';
			document.body.appendChild(span);
			var iframename = "iframe_" + netiler.time;
			netiler.time++;
			var iframe;
			try {
				iframe = document.createElement('<iframe name="' + iframename
						+ '">');
			} catch (ex) {
				iframe = document.createElement('iframe');
			}
			iframe.name = iframename;
			iframe.src = 'about:blank';
			span.appendChild(iframe);
			var sended = false;
			var listen = {};
			var statechange = function() {
				var rs = '';
				if (typeof iframe.readyState == 'undefined') {
					rs = iframe.contentDocument.readyState;
				} else {
					rs = iframe.readyState;
				}
				if (rs == "complete") {
					req.readyState = 4;
					req.status = 200;
					var doc;
					if (iframe.contentDocument) {
						doc = iframe.contentDocument;
					} else {
						doc = iframe.Document;
					}
					var pre = doc.getElementsByTagName('pre');
					if (pre.length > 0) {
						req.responseText = pre[0].innerHTML;
					} else {
						req.responseText = doc.body.innerHTML;
					}
					// alert(req.responseText);
					if (req.responseText.length > 0) {
						listen.ok = true;
						if (req.onreadystatechange) {
							req.onreadystatechange();
						}
						setTimeout(function() {
									document.body.removeChild(span);
								}, 2000);
					}
				}
			};
			if (typeof(iframe.onreadystatechange) != "undefined") {
				iframe.onreadystatechange = statechange;
			} else {
				iframe.onload = statechange;
			}
			var form = document.createElement("form");
			form.target = iframe.name;
			form.method = "POST";
			span.appendChild(form);
			var action = form.action = req.action;
			var n = action.indexOf('?');
			var method = action.substring(n + 1);
			action = action.substring(0, n);
			var input = document.createElement("input");
			input.type = "hidden";
			input.name = "method";
			input.value = method;
			form.appendChild(input);
			var upload = false;
			try {
				for (var i = 0; i < data.length; i++) {
					var value = data[i];
					if (typeof value !== 'undefined') {
						if (value && value.tagName == 'INPUT'
								&& value.type == 'file') {
							input = value.cloneNode(true);
							input.id = value.id + '__';
							input.name = "jservice-arg" + i;
							upload = true;
							form.appendChild(input);
						} else {
							input = document.createElement("input");
							input.name = "jservice-arg" + i;
							input.type = "hidden";
							input.value = netiler.json.toJson(value);
							form.appendChild(input);
						}
					}
				}
			} catch (e) {
				setTimeout(function() {
							document.body.removeChild(span);
						}, 2000);
				return;
			}
			if (upload) {
				form.enctype = "multipart/form-data";
			}
			form.action = action + "?" + method;
			form.submit();
			sended = true;
			if (param.multipart == 2) {
				setTimeout(function() {
							document.body.removeChild(span);
						}, 5000);
			}
		},
		toHttpData : function(data, base) {
			if (!base) {
				base = "";
			}
			var body = [];
			var value;
			var type;
			for (var key in data) {
				value = data[key];
				type = typeof value;
			}
			return body.join("&");
		},
		evalResult : function(text) {
			if (text && text.length > 0) {
				return eval("(" + text + ")");
			}
			return null;
		},
		getResult : function(req, param) {
			if (param.evalResult) {
				return this.evalResult(req.responseText);
			} else if (param.autoResult) {
				var type = req.getResponseHeader("Content-Type");
				if (!type) {
					type = "text/x-json";
				}
				var n = type.indexOf(';');
				if (n != -1) {
					type = type.substring(0, n);
				}
				switch (type) {
					case 'text/html' :
						return req.responseText;
					case 'text/xml' :
						return req.responseXML;
					default :
						return this.evalResult(req.responseText);
				}
			}
			return req.responseText;
		},
		/**
		 * url: method: data: headers: callback: error: async: evalresult:
		 * 
		 * @param {}
		 *            params
		 * @ignore
		 */
		send : function(param) {
			if (!param) {
				return;
			}
			if (!param.method) {
				param.method = "POST";
			}
			var req = this.create(param.multipart);
			var url = netiler.reseURL(param.url);
			req.open(param.method, url, param.async);
			if (url.indexOf('://') != -1) {
				req.withCredentials = true;
			}
			var success = function() {
				if (param.success) {
					return param.success(req,
							netiler.xhr.getResult(req, param), param);
				}
			}
			if (param.async) {
				req.onreadystatechange = function() {
					if (req.readyState == 4) {
						if (req.status == 200) {
							success();
						}
						if (req.status == 0 || req.status == 500){
							if(param.errorCb){
								param.errorCb(req.status);
							}
						}
					}
				}
			}
			if (param.multipart) {
				this.iframePost(req, param);
			} else {
				this.ajaxPost(req, param);
			}
			if (!param.async) {
				success();
				var result = this.getResult(req, param);
				if (result) {
					if (result.success) {
						return result.value;
					} else {
						if (typeof result.value == 'string') {
							alert(result.value);
						}
					}
				}
				return null;
			}
		}
	},
	service : {
		$ : function() {
			var args = [];
			var arg;
			for (var i = 0; i < arguments.length; i++) {
				arg = arguments[i]
				if (typeof arg == 'string') {
					if (arg.substring(0, 1) == '@') {
						args.push(arg.substring(1));
					} else {
						args.push(netiler.$(arg));
					}
				} else {
					args.push(arg);
				}
			}
			this.__arguments = args;
			return this;
		},
		$$ : function(id) {
			this.__callback = function(data) {
				netiler.$$(id, data);
			};
			return this;
		}
	},
	remote : {
		local : function(target, funName, data, callback, async) {
			if (target.local) {
				var fun = target.local[funName];
				if (!fun) {
					return;
				}
				data = eval('(' + netiler.json.toJson(data) + ')');
				if (async) {
					setTimeout(function() {
								var ret = fun.apply(target.local, data);
								if (callback) {
									callback(ret);
								}
							}, 10);
				} else {
					return fun.apply(target.local, data);
				}
			}
		},
		execute : function(target, funName, funArgs, funLen, multipart, async) {
			var callback = null;
			var errorCb = null;
			if (target.__callback) {
				callback = target.__callback;
				delete target.__callback;
			} else {
				if (target.callback) {
					callback = target.callback[funName];
				}
			}
			if (target.__arguments) {
				funArgs = target.__arguments;
				delete target.__arguments;
			}
			var callbackParam = null;
			if (funArgs.length == funLen + 1) {
				callbackParam = funArgs[funArgs.length - 1];
				if (netiler.types.isFunction(callbackParam)) {
					callback = callbackParam;
				} else if (netiler.types.isObject(callbackParam)
						&& callbackParam.callback) {
					callback = callbackParam.callback;
				}
			}else if(funArgs.length == funLen + 2){
				callbackParam = funArgs[funArgs.length - 2];
				if (netiler.types.isFunction(callbackParam)) {
					callback = callbackParam;
				} else if (netiler.types.isObject(callbackParam)
						&& callbackParam.callback) {
					callback = callbackParam.callback;
				}
				var errorParam = funArgs[funArgs.length - 1];
				if(netiler.types.isFunction(errorParam)){
					errorCb = errorParam;
				}
			}

			var data = [];
			for (var i = 0; i < funLen; i++) {
				data[i] = funArgs[i];
			}
			if (netiler.types.isNull(multipart)) {
				multipart = false;
			}
			if (netiler.types.isNull(async)) {
				async = target.async === false ? false : true;
			}
			if (multipart) {
				async = true;
			}
			if (netiler.local) {
				return netiler.remote.local(target, funName, data, callback,
						async);
			}
			var cb = function(req, result, param) {
				if (callback) {
					if (result && result.success === false && result.failAlert) {
						if (typeof Alert != 'undefined') {
							Alert(result.value);
						} else {
							alert(result.value);
						}
					} else {
						if (result) {
							callback(result.value, result.success,
									callbackParam, req);
						} else {
							callback(result, result, callbackParam, req);
						}
					}
				} else {
					var sc = req.getResponseHeader('success-callback');
					if (sc) {
						sc = eval('(' + sc + ')');
						sc(req, result.value, result.success, param);
					}
				}
			}

			var xhr_param = {
				url : target._service + '?' + funName,
				method : 'POST',
				async : async,
				success : cb,
				errorCb : errorCb,
				headers : {
					'jservice-remote' : 'true',
					//为5A防护特制，获取客户端mac地址，通过全局变量写入
					'remoteMac' : (typeof window.remoteMac=="undefined")?"":window.remoteMac
				},
				data : data,
				multipart : multipart,
				postJson : true,
				autoResult : true
			};
			if(netiler.jserviceProxy){
				target._proxy=netiler.jserviceProxy;
			}
			if (target._proxy) {
				xhr_param.headers['jservice-proxy'] = target._proxy;
				xhr_param.headers['jservice-proxy-from'] = location.host;
			}
			return netiler.xhr.send(xhr_param);
		}
	},
	addScript2Header : function(src){
	  	var uiTagScript = document.createElement("script");
	  	uiTagScript.type="text/javascript";
		uiTagScript.src = src;
		document.head && document.head.appendChild(uiTagScript);
    },
    addStyle2Header : function(href){
	  	var linkEl = document.createElement('link');
		linkEl.href = href;
		linkEl.rel = 'stylesheet';
		linkEl.type = 'text/css';
		document.head.appendChild(linkEl);
    }
}