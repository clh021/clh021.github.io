if (typeof nindexedDB != 'undefined') {
	if (nindexedDB.isOffline()) {
		netiler.local = true;
		NetilerUI.local = true;
	}
	var NetilerDB = {
		toJson : function(data) {
			if (typeof netiler != 'undefined') {
				return netiler.json.toJson(data);
			} else {
				return JSON.stringify(data);
			}
		},
		save : function(table, data) {
			if (!data.id) {
				alert('data.id undefined');
			}
			var json = NetilerDB.toJson(data);
			nindexedDB.save(table, data.id, json);

		},
		list : function(table) {
			var json = nindexedDB.list(table);
			var result = eval('(' + json + ')');
			return result;
		},
		
		count : function(table){
			return this.list(table).length;
		},
		
		query : function(sql,args){
			var json = nindexedDB.query(sql,args);
			var result = eval('(' + json + ')');
			return result;
		},
		load : function(table, id) {
			var json = nindexedDB.load(table, id);
			var result = eval('(' + json + ')');
			return result;
		},
		remove : function(table, id) {
			nindexedDB.remove(table, id);
			return true;
		},
		moveto : function(srcTable, descTable, id) {
			nindexedDB.moveto(srcTable, descTable, id);
			return true;
		},
		clean : function(table) {
			nindexedDB.truncate(table);
		},
		log : function(jservice, method, data) {
			var json = NetilerDB.toJson(data);
			nindexedDB.log(jservice, method, json);
			return true;
		},
		logs : function() {
			var json = NetilerDB.logs();
			var result = eval('(' + json + ')');
			return result;
		},
		cleanLogs : function() {
			nindexedDB.cleanLogs();
		},
		getFilePath : function(id, extname) {
			return nindexedDB.getFilePath(id, extname);
		},
		cleanFiles : function() {
			return nindexedDB.cleanFiles();
		},
		deleteFile : function(id, extname) {
			return nindexedDB.deleteFile(id, extname);
		},
		changeFiles : function() {
			return nindexedDB.changeFiles();
		},
		changeFile : function(id) {
			return nindexedDB.changeFile(id);
		},
		uploadFile : function(url, id, extname, cookie) {
			nindexedDB.uploadFile(url, id, extname, cookie);
		},
		downloadFile : function(url, id, extname, cookie) {
			nindexedDB.downloadFile(url, id, extname, cookie);
		}
	};
} else {
	if (localStorage) {
//		netiler.local = true;
//		NetilerUI.local = true;
		var NetilerDB = {
			toJson : function(data) {
				if (typeof netiler != 'undefined') {
					return netiler.json.toJson(data);
				} else {
					return JSON.stringify(data);
				}
			},
			save : function(table, data) {
				if (!data.id) {
					alert('data.id undefined');
				}
				var id = data.id;
				var json = localStorage[table + '_' + id];
				if (!json) {
					var json = localStorage[table];
					var ids = null;
					if (!json) {
						ids = [];
					} else {
						ids = eval('(' + json + ')');
					}
					ids.push(id);
					json = NetilerDB.toJson(ids);
					localStorage.setItem(table, json);
				}
				json = NetilerDB.toJson(data);
				localStorage.setItem(table + '_' + id, json);
			},
			load : function(table, id) {
				var json = localStorage[table + '_' + id];
				if (json) {
					var result = eval('(' + json + ')');
					return result;
				}
				return null;
			},
			remove : function(table, id) {
				var json = localStorage[table + '_' + id];
				if (json) {
					var data = eval('(' + json + ')');
					var json = localStorage[table];
					var ids = eval('(' + json + ')');
					var n = -1;
					for ( var i = 0; i < ids.length; i++) {
						if (ids[i] == id) {
							n = i;
							break;
						}
					}
					if (n != -1) {
						var nids = ids.slice(0, n).concat(
								ids.slice(n + 1, ids.length));
						json = NetilerDB.toJson(nids);
						localStorage.setItem(table, json);
					}
					localStorage.removeItem(table + '_' + id);
					return data;
				} else {
					return null;
				}
			},
			list : function(table) {
				var json = localStorage[table];
				var list = [];
				if (json) {
					var ids = eval('(' + json + ')');
					for ( var i = 0; i < ids.length; i++) {
						var id = ids[i];
						json = localStorage[table + '_' + id];
						var data = eval('(' + json + ')');
						list.push(data);
					}
				}
				return list;
				
			},
			
			count : function(table){
				return this.list(table).length;
			},
			
			clean : function(table) {
				var json = localStorage[table];
				if (json) {
					var ids = eval('(' + json + ')');
					for ( var i = 0; i < ids.length; i++) {
						var id = ids[i];
						localStorage.removeItem[table + '_' + id];
					}
					localStorage.setItem[table, "[]"];
				}
				return true;
			},
			moveto : function(srcTable, descTable, id) {
				var data = NetilerDB.remove(srcTable, id);
				NetilerDB.save(descTable, data);
			},
			log : function(jservice, method, data) {
				NetilerDB.save('_log_', {
					jservice : jservice,
					method : jservice,
					data : data
				});
			},
			logs : function() {
				return NetilerDB.list('_log_');
			},
			cleanLogs : function() {
				NetilerDB.clean('_log_');
			},
			getFilePath : function(id, extname) {
				return null;
			},
			cleanFiles : function() {
				return null;
			},
			deleteFile : function(id, extname) {
				return null;
			},
			changeFiles : function() {
				return null;
			},
			changeFile : function(id) {
				return null;
			},
			uploadFile : function(url, id, extname, cookie) {

			},
			downloadFile : function(url, id, extname, cookie) {

			}
		}
	}
}


var OfflinePage = {
		
	getData : function(allData,currentPage,pageSize){
		if(allData.length==0){
			return [];
		}
		return allData.slice((currentPage-1)*pageSize,currentPage*pageSize);
	}	
}