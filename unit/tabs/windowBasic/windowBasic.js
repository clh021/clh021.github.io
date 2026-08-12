
function testTmp() {
    // let args = { url: 'https://lianghong.top', icon: "./icon/nazha.ico" };
    // lnks.openWindow2(args,{});
    // let args = { url: 'https://lianghong.top', icon: "https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico" };
    // lnks.openWindow2(args,{});
    // let w = new lnks.MainWindow(window);
    // w.setIcon("http://127.0.0.1:8000/icon/tree.ico");
}

function openNoTitlePage() {
    // TODO: 测试默认标题的应用场景
    // gecko 打开无标题页面,有特权
    lnks.openWindow2({url: './tabs/autoTest/auto.close.notitle.html', useGecko: true}, {});
    // chrome 打开无标题页面,有特权
    lnks.openWindow2({url: './tabs/autoTest/auto.close.notitle.html', useGecko: false}, {});
    // window.open 打开无标题页面,有特权
    window.open('./tabs/autoTest/auto.close.notitle.html');
    // gecko 打开无标题页面,无特权
    lnks.openWindow2({url: 'http://127.0.0.1:8000/unit/tabs/autoTest/auto.close.notitle.html', useGecko: true}, {});
    // chrome 打开无标题页面,无特权
    lnks.openWindow2({url: 'http://127.0.0.1:8000/unit/tabs/autoTest/auto.close.notitle.html', useGecko: false}, {});
    // window.open 打开无标题页面,无特权
    window.open('http://127.0.0.1:8000/unit/tabs/autoTest/auto.close.notitle.html');
}
function getPopupWin() {
    let wins = lnks.MainWindow.all();
    window.trayWin = null;
    for (const w of wins) {
        console.log("w.url:", w.url);
        if (w.url.endsWith("/apps/popup.html")) {
            window.trayWin = w;
            break;
        }
    }
}
function addTray() {
    if ("function" != typeof win.isGecko) {
      win.isGecko = function () {
          return false;
      }
    }
    // TODO: 托盘菜单和托盘图标必须同一个引擎负责吗？
    // this.trayIcon = new lnks.TrayIcon(window, "./icon/tree.ico");
    window.trayIcon = new lnks.TrayIcon(window, "./icon/nazha.ico");// chromium has no remote ico feat
    let g = window.trayIcon.geometry;
    let width = 100;
    let height = 210;
    console.log("g:", g)
    console.log('p:', g.x - (100 / 2), g.y - height);
    let winArg = {
        "url": "./apps/popup.html",
        "appId": "trayWin",
        "skipBar": true,
        "width": width,
        "height": height,
        // "positionX": 0 - width,
        // "positionY": 0 - height,
        "hideChrome": true,
        "winMode": "normal",
        "hidden": true,
        "useGecko": win.isGecko(),
    };
    lnks.openWindow2(winArg, {});
    console.log(`lnks.openWindow2(${JSON.stringify(winArg)}, {});`);
    trayIcon.onActivate = () => {
        console.log("activate");
        window.win.visibility = !window.win.visibility;
    };
    trayIcon.onMenuPopup = () => {
      if (!window.trayWin) {
        window.trayWin = getLnksWin({appId: "trayWin"}, true);
	    }
      let height=200
      console.log("size1:", JSON.stringify(trayWin.size));
      console.log("tray.visibily:", JSON.stringify(trayWin.visibily));
      if (trayWin.visibility) {
        //trayWin.setSize(1,1)//UOS设置无效
        trayWin.visibility = false;
        console.log("size2:", JSON.stringify(trayWin.size));
      } else {
        // UOS 系统没有显示时不能改位置，显示时可以改位置但是不能超出屏幕
        let g = this.trayIcon.geometry;
        console.log("g:", JSON.stringify(g));
        let px = parseInt((g.x - 100/2)/devicePixelRatio);
        let py = parseInt((g.y - height)/devicePixelRatio);
        console.log("p:", px, py);
        trayWin.setSize(1,1);
        trayWin.visibility = true;
        trayWin.setPosition(px, py);
        trayWin.setSize(100,200)
      }
    };
}

function getTrayGeometry() {
    let g = window.trayIcon.geometry;
    // alert(JSON.stringify(g));
    console.info("g",g);
    friendlyNotice(g);
}

function delTray() {
    if (window.trayIcon) {
        window.trayIcon.destroy();
    } else {
        alert("TrayIcon not created");
    }
}

function setTitle() {
    win.set_title("新标题" + (new Date).toLocaleTimeString()); // linux OK, windows OK
    // window.title = "这是设置的新标题2"; // 无效的操作
    document.getElementById("system-title").innerHTML = "这是设置的新标题3"
}
