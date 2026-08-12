;(function() {
	
	/**
	 * 模板编译器
	 */
	var _compiler = {
		dispatch : function(fun, args) {
			var html = "";
			if ($check.isFunc(fun)) {
				html = this._backEnd(fun, args)
			} else if ($check.isStr(fun)) {
				html = fun;
				var data = args;
				html = this.frontEnd(html, data);
				html = html.replace(/[\r\n\t]/ig, "");//对html进行优化
				html = mvvmJTemplate.resolveDirectives(html, data);
			}

			return html;
		},
		/**
		 * 根据jtemplate模板名，从后端进行模板引擎渲染
		 * 
		 * @param {String} template jtemplate模板名称,如"test.hello"
		 * @param {LikeArray} args
		 * @return {String} 由模板引擎渲染出的html
		 *         
		 * @example
		 *  var tag=document.getElementById('foo');
		 *  tag.innerHTML=JTemplate.render('test.hello',{
		 *      test:123,
		 *      name:function(){
		 *          if(this.test===123){
		 *              return "成功";
		 *          }else if(this.test===222){
		 *              return "失败";
		 *          }
		 *      }
		 *   },tag);
		 */
		_backEnd : function(fun, args) {
			args = [].slice.call(args);
			var arg_Data = [];
			for (var i = 1, arg; arg = args[i]; i++) {
				/**
				 * 2016-12-7 为模板引擎的渲染数据，提供逻辑控制的功能。 可以通过传function，function内部通过if else进行逻辑控制，进而控制所传入的值 i=1时为arg为渲染数据
				 */
				if (i === 1) {
					Object.keys(arg).forEach(function(prop, i) {//不能遍历原型链，否则会导致原型链上的方法也混淆进来，比如KMSUI.js中拓展数组的addAll方法
								if (typeof arg[prop] === "function" && !$check.isNative(arg[prop])) {
									var ret = arg[prop]();
									if (ret) {
										arg[prop] = ret;
									} else {
										arg[prop] = "";
									}
								}
							});
				}
				arg_Data.push(arg);
			}

			html = fun.apply(JTemplate, arg_Data);
			html = html.replace(/[\r\n\t]/ig, "");//对html进行优化，避免由于属性中引入#case#end换行导致出现多个空格的情况

			return html;
		},
		/**
		 * 纯前端的模板渲染
		 */
		frontEnd : function(html, data) {
			/* 指令处理 */
			html = html.trim();
			html = mvvmJTemplate.resolveDirectives(html, data);
			
			/* 变量赋值 */
			var reg = /{{([a-zA-Z$_][a-zA-Z$_0-9\.]*)}}/ig; //满足变量风格的模板正则
			html = html.replace(reg, function(raw, p1, offset, string) {
						var paths = p1.split(".");
						var lookup = data;
						while (paths.length > 0) {
							lookup = lookup[paths.shift()];
							if (lookup === "") {
								return lookup;
							}
							if (lookup == null) {
								break;
							}
						}
						return lookup || raw;
					});
			
			return html;
		}
	}

	/**
	 * mvvm设计模式的模板解析器
	 */
	var mvvmJTemplate = {
		/**
		 * 以MVVM设计模式渲染模板(提供数据双向绑定功能)
		 * @deprecated 被virtual-template库替代
		 */
		render : function(ele, data) {
			var config = {};

			//将模板缓存起来
			var template = ele.innerHTML;
			Object.defineProperty(config, "template", {
						value : template
					});

			ele.innerHTML = _compiler.dispatch(template, data);

			Object.keys(data).forEach(function(propName, index) {
						Object.defineProperty(config, propName, {
									set : function(name) {
										data[propName] = name;
										ele.innerHTML = _compiler.dispatch(template, data);
									},
									get : function() {
										return data[propName];
									}
								});
					});

			return config;
		},
		/**
		 * TODO 前端渲染模式下，解析指令
		 */
		resolveDirectives : function(html, data) {
			//j-for循环指令
			/*适应input单闭合标签,div型双闭合标签，ui:workspace-duty型标签*/
			var reg = /<\s*([\w:-]*)[^>]+(j-for\s*=\s*["'][^>]+["'])[^>]*\/*>([\s\S]*)(<\/\s*\1\s*>)*/im;
			html = html.replace(reg, function(match, p1/*标签名称*/, p2/*j-for指令*/, p3/*innerHTMl*/, p4, offset, allStr) {
						var reg_directives = /j-for\s*=\s*["']\s*([a-zA-Z$_][a-zA-Z$_0-9]*)\s+in\s+([a-zA-Z$_][a-zA-Z$_0-9]*)["']$/i;
						var itemName = p2.match(reg_directives)[1];
						var itemsName = p2.match(reg_directives)[2];
						var enum_data = data[itemsName];
						var HTML_arr = [];
						[].forEach.call(enum_data, function(data, i) {
									var viewData = {};
									viewData[itemName] = data;
									var content = _compiler.frontEnd(p3, viewData);
									HTML_arr.push(match.replace(p2, "").replace(p3, content));
								});

						return HTML_arr.join("");
					});
			return html;
		}
	}

	/**
	 * 类型校验工具
	 */
	var $check = {
		isNative : function(fn) {
			return (/\{\s*\[native code\]\s*\}/i).test(fn.toString());
		},
		isStr : function(str) {
			return Object.prototype.toString.call(str) === '[object String]';
		},
		isFunc : function(fn) {
			return Object.prototype.toString.call(fn) === '[object Function]';
		},
		isDOMEle : function(ele) {
			var reg = /^\[object HTML\w+Element\]$/i;
			return reg.test(Object.prototype.toString.call(ele));
		}
	}
	
	/**
	 * 对外暴露API
	 */
	var JTemplate = {
		templates : {},
		reg : function(template, fun) {
			this.templates[template] = fun;

		},
		/**
		 * 获取Jtemplate模板中的`$attrs.xxx`,`$tag.id`等等对应的值
		 * 
		 * @param value 顶级命名空间，如`$attrs`
		 * @param key 命名空间内部的key，如模板中`$attrs.panel.icon`的key为字符串`panel.icon`
		 * @param def 默认值，在解析`#case()`指令中def会自动赋值为false
		 */
		value : function(value, key, def) {
			try {
				def = def || '';
				if (typeof value != 'undefined') {
					if (key) {
						var keys = key.split('.');
						for (var i = 0; i < keys.length; i++) {
							key = keys[i];
							value = value[key];
							if (typeof value == 'undefined') {
								return def;
							}
						}
					}
					return value;
				} else {
					return def;
				}
			} catch (e) {
				return def;
			}
		},
		set : function(tag, html) {
			var type = typeof tag;
			if (type == 'string') {
				if (tag.substring(0, 1) == '#') {
					tag = document.getElementById(tag.substring(1));
				}
			}
			if (tag.tagName) {
				var tagName = tag.tagName.toUpperCase();
				switch (tagName) {
					case "INPUT" :
						tag.value = html;
						break;
					case "TEXTAREA" :
						tag.value = html;
						break;
					default :
						tag.innerHTML = html;
						break;
				}
			}
			return tag;
		},
		field : function(tag, target, fields) {
			var fieldSet = {};
			for (var i = 0; i < fields.length; i++) {
				var value = fields[i];
				fieldSet[value] = value;
			}
			var tags = tag.getElementsByTagName('*');
			for (var i = 0; i < tags.length; i++) {
				var item = tags[i];
				var field = item.getAttribute('jfield');
				if (field && fieldSet[field]) {
					target[field] = item;
				}
			}
		},
		/**
		 * 渲染模板引擎
		 * 
		 * @param {} template 模板名称，如"test.hello"
		 * @param {} viewData 渲染所用数据。
		 * @param {} opt_args 可选参数，通常为绑定为本身DOM元素或者相关联的DOM元素。支持继续添加新参数
		 * @return {String} 模板渲染出的html
		 */
		render : function(template, viewData, opt_args/* more args */) {
			var ret = "";
			if ($check.isStr(template)) {
				var fun = JTemplate.templates[template];
				if (!fun) {
					console.log('template not found: ' + template);
					return ret;
				} else {
					ret = _compiler.dispatch(fun, arguments);
				}
			} else if ($check.isDOMEle(template)) {
				/* improved 2017-05-10 yeshiqing 利用virtual DOM技术提升性能解决之前含有iframe则数据变更iframe会被牵连刷新的问题 */
				// return mvvmJTemplate.render(template, viewData);
				var wrapEle = template;
				var source = wrapEle.innerHTML;
				var compiler = JTemplate.compile(source);
				var app = vTemplate(compiler, viewData);
				wrapEle.innerHTML = "";
				wrapEle.appendChild(app.dom);
				
				return app;
			}

			return ret;
		},
		/**
		 * @return 前端模板编译器
		 */
		compile : function(html) {
			return function(data) {
				return _compiler.frontEnd(html, data);
			}
		},
		bind : function(config) {
			var type = typeof config;
			if (type == 'string') {
				return this.call(config, arguments);
			} else {
				if (!config.template) {
					alert('undefined template attribute in config arguments!');
					return;
				}
				var html = this.call(config.template, arguments);
				if (config.tag) {
					config.tag = this.set(config.tag, html);
				}
				if (config.target && config.fields) {
					this.field(config.tag, config.target, config.fields);
				}
				return html;
			}

		}
	}
	
	/**
	 * Template engine using virtual-dom
	 * github homepage:`https://github.com/livoras/virtual-template`
	 */
	;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){var process=module.exports={};var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){draining=false;if(currentQueue.length){queue=currentQueue.concat(queue)}else{queueIndex=-1}if(queue.length){drainQueue()}}function drainQueue(){if(draining){return}var timeout=setTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run()}}queueIndex=-1;len=queue.length}currentQueue=null;draining=false;clearTimeout(timeout)}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i]}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){setTimeout(drainQueue,0)}};function Item(fun,array){this.fun=fun;this.array=array}Item.prototype.run=function(){this.fun.apply(null,this.array)};process.title="browser";process.browser=true;process.env={};process.argv=[];process.version="";process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error("process.binding is not supported")};process.cwd=function(){return"/"};process.chdir=function(dir){throw new Error("process.chdir is not supported")};process.umask=function(){return 0}},{}],2:[function(require,module,exports){window.vTemplate=require("./lib/virtual-template")},{"./lib/virtual-template":5}],3:[function(require,module,exports){(function(process){var svd=require("simple-virtual-dom");var el=svd.el;function h2v(html){var root=document.createElement("div");root.innerHTML=html;root=root.childNodes.length===1?root.childNodes[0]:root;return{vdom:toVirtualDOM(root),dom:root}}function toVirtualDOM(dom){var tagName=dom.tagName.toLowerCase();var props=attrsToObj(dom);var children=[];for(var i=0,len=dom.childNodes.length;i<len;i++){var node=dom.childNodes[i];if(node.nodeType===3){if(node.nodeValue){children.push(node.nodeValue)}else{children.push(node.textContent)}}else{children.push(toVirtualDOM(node))}}return el(tagName,props,children)}function attrsToObj(dom){var attrs=dom.attributes;var props={};for(var i=0,len=attrs.length;i<len;i++){var name=attrs[i].name;var value=attrs[i].value;if(value&&value!=="null"){props[name]=value}}if(dom.style.cssText){props.style=dom.style.cssText}return props}if(process.env.NODE_ENV){h2v.toVirtualDOM=toVirtualDOM}module.exports=h2v}).call(this,require("_process"))},{_process:1,"simple-virtual-dom":6}],4:[function(require,module,exports){(function(process){var _={};_.extend=function(dest,src){for(var key in src){if(src.hasOwnProperty(key)){dest[key]=src[key]}}return dest};if(process.env.NODE_ENV){_.nextTick=process.nextTick}else{var nextTick=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame;if(nextTick){_.nextTick=function(){nextTick.apply(window,arguments)}}else{_.nextTick=function(func){setTimeout(func)}}}module.exports=_}).call(this,require("_process"))},{_process:1}],5:[function(require,module,exports){var _=require("./utils");var h2v=require("./h2v");var svd=require("simple-virtual-dom");var diff=svd.diff;var patch=svd.patch;function makeTemplateClass(compileFn){function VirtualTemplate(data){this.data=data;var domAndVdom=this.makeVirtualDOM();this.vdom=domAndVdom.vdom;this.dom=domAndVdom.dom;this.isDirty=false;this.flushCallbacks=[]}_.extend(VirtualTemplate.prototype,{compileFn:compileFn,setData:setData,makeVirtualDOM:makeVirtualDOM,flush:flush});return VirtualTemplate}function setData(data,isSync){_.extend(this.data,data);if(typeof isSync==="boolean"&&isSync){this.flush()}else if(!this.isDirty){this.isDirty=true;var self=this;_.nextTick(function(){self.flush()})}if(typeof isSync==="function"){var callback=isSync;this.flushCallbacks.push(callback)}}function flush(){var newVdom=this.makeVirtualDOM().vdom;var patches=diff(this.vdom,newVdom);patch(this.dom,patches);this.vdom=newVdom;this.isDirty=false;var callbacks=this.flushCallbacks;for(var i=0,len=callbacks.length;i<len;i++){if(callbacks[i]){callbacks[i]()}}this.flushCallbacks=[]}function makeVirtualDOM(){var html=this.compileFn(this.data);return h2v(html)}module.exports=function(compileFn,data){var VirtualTemplate=makeTemplateClass(compileFn);return data?new VirtualTemplate(data):VirtualTemplate}},{"./h2v":3,"./utils":4,"simple-virtual-dom":6}],6:[function(require,module,exports){exports.el=require("./lib/element");exports.diff=require("./lib/diff");exports.patch=require("./lib/patch")},{"./lib/diff":7,"./lib/element":8,"./lib/patch":9}],7:[function(require,module,exports){var _=require("./util");var patch=require("./patch");var listDiff=require("list-diff2");function diff(oldTree,newTree){var index=0;var patches={};dfsWalk(oldTree,newTree,index,patches);return patches}function dfsWalk(oldNode,newNode,index,patches){var currentPatch=[];if(newNode===null){}else if(_.isString(oldNode)&&_.isString(newNode)){if(newNode!==oldNode){currentPatch.push({type:patch.TEXT,content:newNode})}}else if(oldNode.tagName===newNode.tagName&&oldNode.key===newNode.key){var propsPatches=diffProps(oldNode,newNode);if(propsPatches){currentPatch.push({type:patch.PROPS,props:propsPatches})}if(!isIgnoreChildren(newNode)){diffChildren(oldNode.children,newNode.children,index,patches,currentPatch)}}else{currentPatch.push({type:patch.REPLACE,node:newNode})}if(currentPatch.length){patches[index]=currentPatch}}function diffChildren(oldChildren,newChildren,index,patches,currentPatch){var diffs=listDiff(oldChildren,newChildren,"key");newChildren=diffs.children;if(diffs.moves.length){var reorderPatch={type:patch.REORDER,moves:diffs.moves};currentPatch.push(reorderPatch)}var leftNode=null;var currentNodeIndex=index;_.each(oldChildren,function(child,i){var newChild=newChildren[i];currentNodeIndex=leftNode&&leftNode.count?currentNodeIndex+leftNode.count+1:currentNodeIndex+1;dfsWalk(child,newChild,currentNodeIndex,patches);leftNode=child})}function diffProps(oldNode,newNode){var count=0;var oldProps=oldNode.props;var newProps=newNode.props;var key,value;var propsPatches={};for(key in oldProps){value=oldProps[key];if(newProps[key]!==value){count++;propsPatches[key]=newProps[key]}}for(key in newProps){value=newProps[key];if(!oldProps.hasOwnProperty(key)){count++;propsPatches[key]=newProps[key]}}if(count===0){return null}return propsPatches}function isIgnoreChildren(node){return node.props&&node.props.hasOwnProperty("ignore")}module.exports=diff},{"./patch":9,"./util":10,"list-diff2":11}],8:[function(require,module,exports){var _=require("./util");function Element(tagName,props,children){if(!(this instanceof Element)){return new Element(tagName,props,children)}if(_.isArray(props)){children=props;props={}}this.tagName=tagName;this.props=props||{};this.children=children||[];this.key=props?props.key:void 666;var count=0;_.each(this.children,function(child,i){if(child instanceof Element){count+=child.count}else{children[i]=""+child}count++});this.count=count}Element.prototype.render=function(){var el=document.createElement(this.tagName);var props=this.props;for(var propName in props){var propValue=props[propName];_.setAttr(el,propName,propValue)}_.each(this.children,function(child){var childEl=child instanceof Element?child.render():document.createTextNode(child);el.appendChild(childEl)});return el};module.exports=Element},{"./util":10}],9:[function(require,module,exports){var _=require("./util");var REPLACE=0;var REORDER=1;var PROPS=2;var TEXT=3;function patch(node,patches){var walker={index:0};dfsWalk(node,walker,patches)}function dfsWalk(node,walker,patches){var currentPatches=patches[walker.index];var len=node.childNodes?node.childNodes.length:0;for(var i=0;i<len;i++){var child=node.childNodes[i];walker.index++;dfsWalk(child,walker,patches)}if(currentPatches){applyPatches(node,currentPatches)}}function applyPatches(node,currentPatches){_.each(currentPatches,function(currentPatch){switch(currentPatch.type){case REPLACE:var newNode=typeof currentPatch.node==="string"?document.createTextNode(currentPatch.node):currentPatch.node.render();node.parentNode.replaceChild(newNode,node);break;case REORDER:reorderChildren(node,currentPatch.moves);break;case PROPS:setProps(node,currentPatch.props);break;case TEXT:if(node.textContent){node.textContent=currentPatch.content}else{node.nodeValue=currentPatch.content}break;default:throw new Error("Unknown patch type "+currentPatch.type)}})}function setProps(node,props){for(var key in props){if(props[key]===void 666){node.removeAttribute(key)}else{var value=props[key];_.setAttr(node,key,value)}}}function reorderChildren(node,moves){var staticNodeList=_.toArray(node.childNodes);var maps={};_.each(staticNodeList,function(node){if(node.nodeType===1){var key=node.getAttribute("key");if(key){maps[key]=node}}});_.each(moves,function(move){var index=move.index;if(move.type===0){if(staticNodeList[index]===node.childNodes[index]){node.removeChild(node.childNodes[index])}staticNodeList.splice(index,1)}else if(move.type===1){var insertNode=maps[move.item.key]?maps[move.item.key]:typeof move.item==="object"?move.item.render():document.createTextNode(move.item);staticNodeList.splice(index,0,insertNode);node.insertBefore(insertNode,node.childNodes[index]||null)}})}patch.REPLACE=REPLACE;patch.REORDER=REORDER;patch.PROPS=PROPS;patch.TEXT=TEXT;module.exports=patch},{"./util":10}],10:[function(require,module,exports){var _=exports;_.type=function(obj){return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g,"")};_.isArray=function isArray(list){return _.type(list)==="Array"};_.isString=function isString(list){return _.type(list)==="String"};_.each=function each(array,fn){for(var i=0,len=array.length;i<len;i++){fn(array[i],i)}};_.toArray=function toArray(listLike){if(!listLike){return[]}var list=[];for(var i=0,len=listLike.length;i<len;i++){list.push(listLike[i])}return list};_.setAttr=function setAttr(node,key,value){switch(key){case"style":node.style.cssText=value;break;case"value":var tagName=node.tagName||"";tagName=tagName.toLowerCase();if(tagName==="input"||tagName==="textarea"){node.value=value}else{node.setAttribute(key,value)}break;default:node.setAttribute(key,value);break}}},{}],11:[function(require,module,exports){module.exports=require("./lib/diff").diff},{"./lib/diff":12}],12:[function(require,module,exports){function diff(oldList,newList,key){var oldMap=makeKeyIndexAndFree(oldList,key);var newMap=makeKeyIndexAndFree(newList,key);var newFree=newMap.free;var oldKeyIndex=oldMap.keyIndex;var newKeyIndex=newMap.keyIndex;var moves=[];var children=[];var i=0;var item;var itemKey;var freeIndex=0;while(i<oldList.length){item=oldList[i];itemKey=getItemKey(item,key);if(itemKey){if(!newKeyIndex.hasOwnProperty(itemKey)){children.push(null)}else{var newItemIndex=newKeyIndex[itemKey];children.push(newList[newItemIndex])}}else{var freeItem=newFree[freeIndex++];children.push(freeItem||null)}i++}var simulateList=children.slice(0);i=0;while(i<simulateList.length){if(simulateList[i]===null){remove(i);removeSimulate(i)}else{i++}}var j=i=0;while(i<newList.length){item=newList[i];itemKey=getItemKey(item,key);var simulateItem=simulateList[j];var simulateItemKey=getItemKey(simulateItem,key);if(simulateItem){if(itemKey===simulateItemKey){j++}else{if(!oldKeyIndex.hasOwnProperty(itemKey)){insert(i,item)}else{var nextItemKey=getItemKey(simulateList[j+1],key);if(nextItemKey===itemKey){remove(i);removeSimulate(j);j++}else{insert(i,item)}}}}else{insert(i,item)}i++}function remove(index){var move={index:index,type:0};moves.push(move)}function insert(index,item){var move={index:index,item:item,type:1};moves.push(move)}function removeSimulate(index){simulateList.splice(index,1)}return{moves:moves,children:children}}function makeKeyIndexAndFree(list,key){var keyIndex={};var free=[];for(var i=0,len=list.length;i<len;i++){var item=list[i];var itemKey=getItemKey(item,key);if(itemKey){keyIndex[itemKey]=i}else{free.push(item)}}return{keyIndex:keyIndex,free:free}}function getItemKey(item,key){if(!item||!key)return void 666;return typeof key==="string"?item[key]:key(item)}exports.makeKeyIndexAndFree=makeKeyIndexAndFree;exports.diff=diff},{}]},{},[2]);

	window.JTemplate = JTemplate;
})();
