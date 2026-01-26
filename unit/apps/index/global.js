// 按过滤条件获取 lnks 窗口
// 此处不必要使用 Promise ，因为窗口创建成功与否并不能保证。
window.getLnksWin = (filterObj, update=false) => {
    if (window.lnks) {
        if (window.lnksWins) {
            for (const lnksWin of lnksWins) {
                console.log(`遍历窗口: title:${lnksWin.title}, appId:${lnksWin.appId}, url:${lnksWin.url}`)
                if (lnksWin.appId == filterObj.appId || lnksWin.url == filterObj.url || lnksWin.title == filterObj.title) {
                    return lnksWin
                }
            }
        }
        if (update) {
            window.lnksWins = lnks.MainWindow.all();
            return window.getLnksWin(filterObj, false);
        }
    }
    return null;
}
// 获取初始化好的 lnks 托盘坐标
window.getTrayGeometryPromise = (trayIcon) => {
    return new Promise(function (resolve, reject) {
        let wait = () => {
            if (trayIcon.geometry.width === 0) {
                console.log("getTrayGeometry Func:", trayIcon.geometry)
                // WARNING: AMD64 KDE can`t get trayIcon.geometry
                setTimeout(wait, 600);
            } else {
                resolve(win);
            }
        };
        wait();
    });
}

window.friendlyNotice = (obj) => {
    $('.notice')
        .removeClass("notice_error")
        .addClass("notice_success")
        .text(JSON.stringify(obj) + (new Date()).toLocaleString('zh-CN'))
        .show();
}

window.getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
}

// -----------------------------------------------------
// 窗口测试公共函数
// -----------------------------------------------------
// 窗口移动测试函数
window.WinMoveRandomPositionFunc = async (win) => {
    win.setPosition(
        getRandomInt(screen.availWidth),
        getRandomInt(screen.availHeight)
    ); // 移动窗口会自动聚焦
    win.setFocus();
    waitFunc(1000);
    //await getTestStateFunc(JSON.stringify(p), win.position, `设置了位置：${JSON.stringify(p)}`);
}
window.getAutoTestWinArg = (win_args, timeToClose, msg) => {
    let defaultUrl = `${location.protocol}//${location.host}/tabs/autoTest/auto.close.html`;
    if (!win_args.url) {
        win_args.url = `${defaultUrl}?time=${timeToClose}&msg=${encodeURIComponent(msg)}`;
    }
    return win_args;
}

// 获取环境变量并尝试报告
window.envGetAndReport = (name, report = "") => {
    // 测试环境变量的获取
    let v = `${window.lnks.env.get("LITHIUM_PATH")}`
    if (typeof AutoTest !== "undefined") {
        AutoTest.report(`[? ]: 尝试获取环境变量 "${name}":  ${v}`);
        if (v.length < 0) {
            AutoTest.report(`[? ]: 由于 获取环境变量失败，无法继续 ${report} 测试`);
        }
    }
    return v
}

window.openLnksWinByCmd = async (win_args, user_args) => {
    // cmd 访问预备设定
    // lithium程序
    let lithium = `${window.lnks.env.get("LITHIUM_PATH")}`
    let cmdArgPrefix = '--' // 双引擎是双横杠
    if (lithium === "") {
        lithium = `${window.lnks.env.get("lithiumPath")}`
        cmdArgPrefix = '-' // 单引擎是单横杠
    }
    // 设置环境变量
    // windows: SET LITHIUM_ENABLE_XPC_URLS = resource://;file://;http://192.168.1.1
    // linux:   export LITHIUM_ENABLE_XPC_URLS='resource://;file://;http://192.168.1.1'
    let lithiumPath = envGetAndReport("LITHIUM_PATH", "命令行 API 有效性测试");
        let winArg = Object.assign({ winMode: "normal" }, win_args);
        let url = "";
        let s = "";
        // await waitFunc(2000);
        for (const [k, v] of Object.entries(winArg)) {
            console.log(`${k}: ${v}`);
            if ("url" == k) {
                url = v;
            } else {
                console.log("typeof", k, v, typeof (v));
                if (typeof v == "boolean") {
                    if (v === false) {

                    } else {
                        s += ` ${cmdArgPrefix}${k}`;
                    }
                } else if (typeof v == "number") {
                    s += ` ${cmdArgPrefix}${k}=${v}`;
                } else {
                    s += ` ${cmdArgPrefix}${k}='${v}'`; // linux
                }
                // s += ` --${k}='${v}'`; // linux
            }
        }
        user_args_str = user_args ? `${cmdArgPrefix}user_args='${JSON.stringify(user_args)}'` : '';
        cmd = `${lithiumPath}/lithium ${s} ${user_args_str}  "${url}"`;
        console.log(cmd);
        if (typeof AutoTest !== "undefined") {
            AutoTest.report("cmd: " + cmd);
        }
        window.lnks.$(cmd);
        await waitFunc(2000);
}
window.getDateString = (replaceArr) => {
    if (!replaceArr) {
        replaceArr = {"-":".","T":"_",":":".","Z":""};
    }
    let date = (new Date).toISOString();
    Object.keys(replaceArr).forEach( k => {
        // date = date.replaceAll(k,replaceArr[k]);
        date = date
            .replace(k,replaceArr[k])
            .replace(k,replaceArr[k])
            .replace(k,replaceArr[k])
            .replace(k,replaceArr[k]);
    });
    return date;
}