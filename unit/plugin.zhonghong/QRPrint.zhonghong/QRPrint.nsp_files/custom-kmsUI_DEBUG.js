/*******************************************************************************
 * name :KMSUI.js
 * 
 * desc ：用于KMS工程里每个界面需要加载的脚本。依赖于Netiler.js模块
 * 
 * author :fqhunter
 * 
 * created :2014-07-17
 ******************************************************************************/

var KMSUI = {
	/**
	 * 初始化
	 */
	init : function() {
		//this.font.loadCss();
	},
	jservice : {
		/**
		 * this 为 节点对象 Element
		 */
		post : function(callback, params) {
			var jservice = this.$jservice();
			var med = this.attr('jmethod');
			var data = this.attr('data');
			if (jservice && med) {
				jservice[med].apply(jservice, KMSUI.jservice.jparams.call(this, function(data) {
									if (data && typeof callback === "function") {
										callback(data);
									}
								}, params));
			} else if (data) {
				try {
					data = eval(data);
					if (data && typeof callback === "function") {
						callback(data);
					}
				} catch (e) {
					alert(e);
				}
			}

		},
		/**
		 * 获得方法对应的参数值
		 * 
		 * @param {}
		 *            jparams
		 */
		jparams : function(callback, params) {
			var data = [];
			params = params ? params : {};
			var jparams = this.attr('jparams');
			if (jparams) {
				var keys = jparams.split(',');
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					var value = params[key] || this.attr(key);
					data.push(value);
				}
			}
			if (typeof callback === "function") {
				data.push(callback);
			}
			return data;

		}
	},
	/**
	 * 获得top窗口对象，客户外壳是TOP层，所以不是我们所需要的TOP窗口对象 这边做一下兼容
	 */
	top : function() {
		try {
			var kmsFontSize = top.kmsFontSize;
			return top;
		} catch (e) {
			var win = window;
			do {
				if (win.name == 'netilerWindow') {
					return win;
				} else {
					win = win.parent;
				}
			} while (win);
		}

	},
	UserSettingService : {
		_service : '/jservice/com.leadal.kms.acl.service.UserSettingService.js',
		syn : {
			async : false
		},
		loadByTypeAndUserId : function() {
			return netiler.remote.execute(this, 'loadByTypeAndUserId',
					arguments, 2, 0);
		},
		userFontSize : function() {
			return netiler.remote
					.execute(this, 'userFontSize', arguments, 0, 0);
		},
		save : function() {
			return netiler.remote.execute(this, 'save', arguments, 1, 0);
		}
	},
	/**
	 * 获得子窗口
	 * 
	 * @param {}
	 *            win
	 * @return {}
	 */
	subWindow : function(win) {
		win = win ? win : window;
		var subs = [];
		try {
			if (win.document) {
				subs.push(win);
			}
		} catch (e) {

		}
		var frames = win.frames;
		for (var i = 0; i < frames.length; i++) {
			subs = subs.concat(KMSUI.subWindow(frames[i]));
		}
		return subs;
	},
	/**
	 * 加载样式文件
	 * 
	 * @param {}
	 *            styles 文件列表
	 */
	addtag : function() {
		var tag = document.createElement('kms:font');
		document.body.appendChild(tag);
		tag.doRender();
	},
	font : {
		/**
		 * 重新加载样式
		 * 
		 * @param {}
		 *            fontSize
		 */
		reloadCss : function(fontSize) {
			var subWindows = KMSUI.subWindow(KMSUI.top());
			for (var i = 0; i < subWindows.length; i++) {
				var win = subWindows[i];
				var link = win.document.getElementById('kmsFontSizeLink');
				if (link) {
					var href = link.getAttribute('href');
					link.setAttribute('href', this.cssPath(fontSize));
				}
			}
		},
		/**
		 * 样式路径
		 * 
		 * @param {}
		 *            fontSize 字体大小
		 * @return {}
		 */
		cssPath : function(fontSize) {
			return '/com.leadal.kms.ui/theme/font' + fontSize + '/style.css';
		},
		/**
		 * 保存字体
		 * 
		 * @param {}
		 *            userId
		 * @param {}
		 *            userName
		 * @param {}
		 *            fontSize
		 */
		
		save : function(userId, userName, fontSize) {
			var userSetting = {
				id : null,
				username : userName,
				userId : userId,
				type : "fontSize",
				value : fontSize
			};
			KMSUI.font.setFontSize2Top(fontSize);
			this.reloadCss(fontSize);
			KMSUI.UserSettingService.save(userSetting);
		},
		/**
		 * 加载
		 */
		loadCss : function() {
			var fontSize = this.getFontSizeFromTop();
			if (fontSize) {
				KMSUI.loadCSS(this.cssPath(fontSize));
			} else {
//				KMSUI.UserSettingService.userFontSize(function(data) {
//							fontSize = data ? data.value : 14;
//							KMSUI.font.setFontSize2Top(fontSize);
//							KMSUI.loadCSS(KMSUI.font.cssPath(fontSize));
//						});
			}
		},
		/**
		 * 把字体大小存储到TOP窗口对象
		 */
		setFontSize2Top : function(fontSize) {
			var win = KMSUI.top();
			if (win) {
				win.kmsFontSize = fontSize;
			}
		},
		/**
		 * 获得字体大小来自TOP窗口对象
		 */
		getFontSizeFromTop : function() {
			var win = KMSUI.top();
			if (win) {
				return win.kmsFontSize;
			}
		}

	},
	/**
	 * 加载样式
	 * 
	 * @param {}
	 *            path 样式路径
	 */
	loadCSS : function(path) {
		var heads = document.getElementsByTagName('head');
		if (heads && heads.length > 0) {
			var link = document.createElement('link');
			link.setAttribute('id', 'kmsFontSizeLink');
			link.href = path;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			heads[0].appendChild(link);
		}
	}
}

KMSUI.util = {
	/*
	 * 遍历对象 @param {} obj @param {} callback
	 */
	each : function(obj, callback) {
		var i = 0;
		for (var key in obj) {
			if (!obj.hasOwnProperty(key)) {
				continue;
			} else if (callback.call(obj[key], key, obj[key], i++, obj) == false) {
				break;
			}
		}
	},
	/**
	 * 上传附件
	 * 
	 * @param {}
	 *            form
	 * @param {}
	 *            iframe
	 */
	upload : function(form, callback) {
		var target = 'form_target';
		form.setAttribute('target', target);
		try {
			iframe = window.document.createElement('<iframe name="' + target
					+ '" />');
		} catch (e) {
			iframe = window.document.createElement('iframe');
			iframe.setAttribute('name', target);
		}
		iframe.callback = callback;
		NetilerUI.addEventHandler(iframe, 'load', function() {
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
					if (typeof callback === "function") {
						callback.call(json, text);
					}
				});
		window.document.body.appendChild(iframe);
		form.submit();
	}
}

KMSUI.init();

