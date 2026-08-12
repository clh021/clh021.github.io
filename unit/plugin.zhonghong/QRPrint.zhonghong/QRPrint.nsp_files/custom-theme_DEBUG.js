/**
 * 由于`UITheme.init`过程用到$window对象,故该js依赖于netilerUI.extend.js
 */
var UITheme = {
	/**
	 * 初始化
	 */
	init : function() {
		this.font.loadCss();
	},

	/**
	 * 获得子窗口
	 * 
	 * @param {} win
	 * @return {}
	 */
	subWindow : function(win) {
		win = win ? win : window;
		var subs = [];
		try {
			if (win.document) {
				subs.push(win);
			}
			var frames = win.frames;
			for (var i = 0; i < frames.length; i++) {
				subs = subs.concat(UITheme.subWindow(frames[i]));
			}
		} catch (e) {
			console.warn(e)
		}
		return subs;
	},

	UserSettingService : {
		_service : '/jservice/com.leadal.netiler.ui.service.UserSettingPrefService.js',
		syn : {
			async : false
		},
		getCurUserPref : function() {
			return netiler.remote.execute(this, 'getCurUserPref', arguments, 0, 0);
		},
		save : function() {
			return netiler.remote.execute(this, 'save', arguments, 2, 0);
		}
	},

	font : {
		/**
		 * 重新加载样式
		 * 
		 * @param {} fontSize
		 */
		reloadCss : function(fontSize,fontFamily) {
			var topWin = $window.top();
			var subWindows = UITheme.subWindow(topWin);
			for (var i = 0; i < subWindows.length; i++) {
				try {
					var win = subWindows[i];
					var link = win.document.getElementById('netileruiFontSizeLink');
					if (link) {
						var href = link.getAttribute('href');
						link.setAttribute('href', win.UITheme.font.cssPath(fontSize,fontFamily));
					}
				} catch (e) {
					console.warn(e);
				}
				
			}
		},
		/**
		 * 样式路径
		 * 
		 * @param {} fontSize 字体大小
		 * @return {}
		 */
		cssPath : function(fontSize,fontFamily) {
			if(!fontFamily){
				fontFamily = '微软雅黑';
			}
			var url = '/com.leadal.netiler.ui/theme/font/@fontSize.css?' + fontSize + '&fontFamily='+encodeURIComponent(fontFamily);
			url = NetilerUI.resetURL(url);
			return url;
		},
		/**
		 * 保存字体
		 * 
		 * @param {} userId
		 * @param {} userName
		 * @param {} fontSize
		 */

		save : function(userId, fontSize,fontFamily) {
			var userSetting = {
				'fontSize' : fontSize,
				'fontFamily' : fontFamily
			};
			UITheme.font.setFontSize2Top(fontSize,fontFamily);
			this.reloadCss(fontSize,fontFamily);
			UITheme.UserSettingService.save(userSetting, userId);
		},
		/**
		 * 加载
		 */
		loadCss : function() {
			var font = this.getFontSizeFromTop();
			if (font) {
				UITheme.loadCSS(this.cssPath(font.fontSize,font.fontFamily));
			} else {
				UITheme.loadCSS(this.cssPath(14,'微软雅黑'));
			}
		},
		/**
		 * 把字体大小存储到TOP窗口对象
		 */
		setFontSize2Top : function(fontSize,fontFamily) {
			if(typeof chrome != 'undefined'){
				chrome.setAttribute('fontSize',fontSize);
				chrome.setAttribute('fontFamily',fontFamily);
			}
			var win = $window.top();
			if (win) {
				win.uiFontSize = fontSize;
				win.uiFontFamily = fontFamily;
			}
		},
		/**
		 * 获得字体大小来自TOP窗口对象
		 */
		getFontSizeFromTop : function() {
			/*
			 * 2017-06-15 modified yeshiqing 原先此处有try catch处理，因为$window对象在netilerUI.extend.js，而netilerUI.extend.js可能还未加载。目前leadal-netiler-2.0.0.jar支持前端在`netilerui-custom.properties`中配置脚本加载顺序，故该try catch可以去掉。
			 */
			/**
			 * 判断
			 * navigator.userAgent.indexOf("netiler")
			 * 使用谷歌浏览器，chrome调不到方法报错处理
			 * 
			 * **/
			if(typeof chrome!= 'undefined' && (navigator.userAgent.indexOf("netiler")!=-1)){
				var fontSize = chrome.getAttribute('fontSize');
				if(fontSize){
					var fontFamily = chrome.getAttribute('fontFamily');
					return {
						fontSize : fontSize,
						fontFamily : fontFamily
					}
				}
			}
			var win = $window.top();
			if (win && win.uiFontSize) {
				return {
					fontSize : win.uiFontSize,
					fontFamily : win.uiFontFamily
				}
			}
			return {
				fontSize : 14,
				fontFamily : '微软雅黑'
			}
		}

	},
	/**
	 * 加载样式
	 * 
	 * @param {} path 样式路径
	 */
	loadCSS : function(path) {
		var heads = document.getElementsByTagName('head');
		if (heads && heads.length > 0) {
			var link = document.createElement('link');
			link.setAttribute('id', 'netileruiFontSizeLink');
			link.href = path;
			link.rel = 'stylesheet';
			link.type = 'text/css';
			heads[0].appendChild(link);
		}
	}
}


//theme初始化
UITheme.init();
