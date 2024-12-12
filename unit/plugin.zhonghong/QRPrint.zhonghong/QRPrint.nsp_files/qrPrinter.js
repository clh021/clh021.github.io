/**
 * 二维码打印
 * 1、com.leadal.top.docsupport.service.QRCodePrintService	
 */
var  QRPrinter = {
	currPrint : null,
	getTarget : function(){
		var qrObj = document.getElementById('qrObj');
		return qrObj;
	},
	initPrints : function(){
		var isLinux = false;
		var platform = navigator.platform.toLowerCase();
		isLinux = platform.indexOf("linux") != -1;
		var prints = QRPrinter.getTarget().GetPrinterList();
		prints = eval('('+prints+')');
		for(var i=0;i<prints.length;i++){
			var print = (isLinux)?prints[i].name:prints[i];
			if(print.toLowerCase().indexOf('tsc') != -1 || print.toLowerCase().indexOf('postek')!=-1){
				QRPrinter.currPrint = print;
				break;
			}
		}
	},
	pluginWork : function(list){
		var sendData = function(qrCode,qrCodeId){
			//1.条码数据内容,2.条码打印机名称(目前只支持TSC),3.条码格式(1-PDF417,2-QRCODE),4.条码宽度,5.标签纸宽度,6.标签纸高度,7.条码下显示条码的序列号(可选)
			QRPrinter.getTarget().PrintBarcode(qrCode,QRPrinter.currPrint,1,50,60,25,3,qrCodeId,"黑体",26,1);
		}
		
		for(var i=0;i<list.length;i++){
			var qrCodeView = list[i];
			var qrCode = qrCodeView.qrCode;
			var qrCodeId = qrCodeView.qrCodeId;
			sendData(qrCode,qrCodeId);
		}
	},
	print : function(list){
		if(list.length==0){
			return ;
		}
		QRPrinter.initPrints();
		QRPrinter.pluginWork(list);
	}
}