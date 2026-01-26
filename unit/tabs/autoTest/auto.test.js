class AutoTest {
    constructor(logElementSelector = '#testOutput') {
        this.outputEleSelector = logElementSelector;
    }

    static async waitTime (time) {
        await new Promise(r => setTimeout(r, time));
    }

    async test (testFunc, title = "无标题测试") {
        $(".modal-title").html(title)
        $(this.outputEleSelector).append(`<h2>${title}</h2><pre class="system-test-report"></pre>`).show();
        if (window.lnks) {
            await testFunc();
        } else {
            $(this.outputEleSelector).append(`<br />测试程序无法在当前环境运行`).show();
        }
    }

    static async getTestState (shouldFmtVal, val, tag) {
        await AutoTest.waitTime(1000);
        let fmtVal = JSON.stringify(val);
        if (shouldFmtVal !== fmtVal) {
            AutoTest.report(`[* ]: ${tag} | ${shouldFmtVal} => ${fmtVal}`);
        } else {
            AutoTest.report(`[OK]: ${tag} | ${shouldFmtVal} => ${fmtVal}`);
        }
    }

    static report (str) {
        let res = $(".system-test-report");
        var pobj = document.createElement('system-test-p');
        var textobj = document.createTextNode(str + "\r\n");
        if (res[res.length - 1]) {
            (res[res.length - 1]).appendChild(pobj.appendChild(textobj));
            res.parent().animate({ scrollTop: 9999 });
        }
    }
}
window.waitFunc = AutoTest.waitTime;
window.getTestStateFunc = AutoTest.getTestState;

function nowTime () {
    return (new Date).toLocaleTimeString()
}

// 关闭测试面板
function autoTestPanelClose () {
    $(".testModal").hide()
}

// -------------------------------------------------------------------------------------------
// 测试用例
// 函数 标题测试
let funcSetTitleTest = async (win) => {
    for (let index = 0; index < 3; index++) {
        await waitFunc(1500);
        let title = "自动标题" + nowTime()
        win.setTitle(title)
        // TODO: 如果可以读取窗口标题则可自动提交检测报告
        AutoTest.report("[? ]: 设置了标题(setTitle)： " + title);
    }
    for (let index = 0; index < 3; index++) {
        await waitFunc(1500);
        let title = "自动标题" + nowTime()
        win.set_title(title)
        // TODO: 如果可以读取窗口标题则可自动提交检测报告
        AutoTest.report("[? ]: 设置了标题(set_title)： " + title);
    }
}
let funcSetIconTest = async (win) => {
    // 能打开 baidu.com 的图标
    // 能使用默认图标 没有图标网页时 // TODO
    // 能使用传递的图标参数 jsapi // TODO
    let icons = [
        "./icon/tree.ico", "./icon/nazha.ico", "./icon/lnks.ico", "./icon/weibo.ico",
        // "", //  默认图标
        // "file:///home/pathToIcon/icon/lnks.ico", //窗口将应用本地文件作为图标
        // "http(s)://urlToIcon/icon/lnks.ico", //窗口将应用URL文件作为图标
        // "icon/lnks.ico" //窗口将应用当前域名解析出的URL文件作为图标
    ];
    for (const ico of icons) {
        await waitFunc(1500);
        // if (window.apiTag == 'old') {
        //     window.win.set_icon(ico);
        // } else {
        win.setIcon(ico);
        // }
        AutoTest.report("[? ]: 设置了图标： " + ico);
    }
}
let funcSetPositionTest = async (win) => {
    let positions = [
        { x: 10, y: 20 },
        { x: 60, y: 90 },
        { x: 100, y: 50 },
    ];
    let _ = window.win.position;
    for (const p of positions) {
        await waitFunc(1500);
        win.setPosition(p.x, p.y);
        await getTestStateFunc(JSON.stringify(p), win.position, `设置了位置：${JSON.stringify(p)}`);
    }
    win.setPosition(_.x, _.y); // 恢复之前的位置
}
let funcSetSizeTest = async (win) => {
    let sizes = [
        { width: parseInt(screen.availWidth / 3), height: parseInt(screen.availHeight / 3) },
        { width: parseInt(screen.availWidth / 2.5), height: parseInt(screen.availHeight / 2.5) },
        { width: parseInt(screen.availWidth / 2), height: parseInt(screen.availHeight / 2) },
        { width: parseInt(screen.availWidth / 1.5), height: parseInt(screen.availHeight / 1.5) },
    ];
    let _ = win.size;
    for (const s of sizes) {
        await waitFunc(1500);
        console.log("getSize:", JSON.stringify(win.size));
        console.log("setSize:", JSON.stringify(s));
        win.setSize(s.width, s.height);
        await getTestStateFunc(JSON.stringify(s), win.size, `设置的了窗口尺寸：${JSON.stringify(s)}`);
    }
    win.setSize(_.width, _.height); // 恢复之前的尺寸
}
let funcGetSizeTest = async (win) => {
    let sizes = [
        { width: parseInt(screen.availWidth / 3), height: parseInt(screen.availHeight / 3) },
        { width: parseInt(screen.availWidth / 2.5), height: parseInt(screen.availHeight / 2.5) },
        { width: parseInt(screen.availWidth / 2), height: parseInt(screen.availHeight / 2) },
        { width: parseInt(screen.availWidth / 1.5), height: parseInt(screen.availHeight / 1.5) },
    ];
    let _ = win.size;
    for (const s of sizes) {
        await waitFunc(1500);
        console.log("getSize:", win.size);
    }
}
let funcSetVisibilityTest = async (win) => {
    let _ = win.position;
    await waitFunc(1500);
    win.visibility = false;
    AutoTest.report("[? ]: 设置了 可见度为 false");
    await waitFunc(1500);
    // TODO: 可见性切换后，位置信息会丢失的问题
    win.setPosition(_.x, _.y); // 恢复之前的位置
    win.visibility = true;
    AutoTest.report("[? ]: 设置了 可见度为 true");
}
let funcSkipBarTest = async (win) => {
    await waitFunc(1500);
    win.skipBar(true);
    AutoTest.report("[? ]: 设置了 跳过任务栏(skipBar)");
    await waitFunc(1500);
    win.skipBar(false);
    AutoTest.report("[? ]: 设置了 取消跳过任务栏(skipBar)");

    await waitFunc(1500);
    win.skip_bar(true);
    AutoTest.report("[? ]: 设置了 跳过任务栏(skip_bar)");
    await waitFunc(1500);
    win.skip_bar(false);
    AutoTest.report("[? ]: 设置了 取消跳过任务栏(skip_bar)");
}
let funcIdleTimeTest = async (win) => {
    // 得到 当前计算机闲置时间
    AutoTest.report(`[? ]: 得到当前计算机闲置(用户离开)时间: ${lnks.getIdleTime()}`);
    await waitFunc(3000);
    AutoTest.report(`[? ]: 得到3秒后计算机闲置(用户离开)时间: ${lnks.getIdleTime()}`);
    await window.lnks.openWindow2({
        "url": `./tabs/autoTest/auto.showIdleTime.html?time=18&msg=${encodeURIComponent("请操作鼠标，键盘并留意时间变化")}`,
        "icon": "./icon/lnks.ico",
        "title": "标题1",
    });
    await waitFunc(7000);
}
// TODO: 优化本测试用例
let funcKeepAboveTest = async (mainWin) => {
    // 准备新窗口用于验证置顶
    let newWinTitle = "置顶窗口" + nowTime();
    window.lnks.openWindow2({
        "url": `./tabs/autoTest/auto.close.html?time=16&msg=${encodeURIComponent("请留意窗口尺寸、位置、状态及聚焦变化")}`,
        "icon": "./icon/lnks.ico",
        "title": newWinTitle,
    });
    await waitFunc(1000); // gecko 打开页面有些慢
    let testWin = getLnksWin({title:newWinTitle}, true);
    console.log("testWin:", testWin);
    // 先设置非置顶状态
    testWin.keep_above(false);
    AutoTest.report("[? ]: 设置了 非置顶状态(keep_above)");
    testWin.keepAbove(false);
    AutoTest.report("[? ]: 设置了 非置顶状态(keepAbove)");
    await waitFunc(1500);

    // 设置主窗口置顶 keepAbove
    mainWin.keepAbove();
    AutoTest.report("[? ]: 设置了 主窗口的置顶状态(keepAbove())");
    await waitFunc(1500);
    // 聚焦测试窗口
    WinMoveRandomPositionFunc(testWin);
    WinMoveRandomPositionFunc(testWin);

    // 设置主窗口取消置顶 keepAbove
    mainWin.keepAbove(false);
    AutoTest.report("[? ]: 设置了 主窗口取消置顶(keepAbove(false))");
    await waitFunc(1500);
    // 聚焦测试窗口
    WinMoveRandomPositionFunc(testWin);
    WinMoveRandomPositionFunc(testWin);

    // 设置主窗口置顶 keep_above
    mainWin.keep_above();
    AutoTest.report("[? ]: 设置了 主窗口的置顶状态(keep_above())");
    await waitFunc(1500);
    // 聚焦测试窗口
    WinMoveRandomPositionFunc(testWin);
    WinMoveRandomPositionFunc(testWin);

    // 设置主窗口置顶 keep_above
    mainWin.keep_above(false);
    AutoTest.report("[? ]: 设置了 主窗口取消置顶(keep_above(false))");
    await waitFunc(1500);
    // 聚焦测试窗口
    WinMoveRandomPositionFunc(testWin);
    WinMoveRandomPositionFunc(testWin);
}


// -------------------------------------------------------------------------------------------
// JS函数测试
let JSFuncTest = async () => {
    window.testWin = window.win;
    await funcSetTitleTest(window.testWin); // 测试标题设置
    await funcSetIconTest(window.testWin); // 测试图标设置
    await funcSetPositionTest(window.testWin); // 测试位置设置
    await funcSetSizeTest(window.testWin); // 测试尺寸设置
    await funcSetVisibilityTest(window.testWin); // 测试可见性设置
    await funcSkipBarTest(window.testWin); // 测试跳过任务栏
    await funcIdleTimeTest(window.testWin); // 测试计算机闲置时间
    await funcKeepAboveTest(window.testWin); // 测试置顶状态切换
}

// 窗口拖拽测试
let dragTest = async () => {
    // TODO: TypeError: nwin.beginWindowMove is not a function
    // let element = document.getElementsByClassName("system-title")[0];
    // const mouseDownEvent = new MouseEvent('mousedown', {
    //     clientX: element.getBoundingClientRect().left,
    //     clientY: element.getBoundingClientRect().top,
    //     bubbles: true,
    //     cancelable: true
    // });

    // const mouseMoveEvent = new MouseEvent('mousemove', {
    //     clientX: element.getBoundingClientRect().left + 3,
    //     clientY: element.getBoundingClientRect().top,
    //     bubbles: true,
    //     cancelable: true
    // });

    // const mouseUpEvent = new MouseEvent('mouseup', {
    //     bubbles: true,
    //     cancelable: true
    // });
    // element.dispatchEvent(mouseDownEvent);
    let mouseEvent = (el, event = "mousedown", x, y) => {
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent(event, true, true, window, 0,
            x, y, x, y, false, false, false, false, 0, null);
        el.dispatchEvent(e);
        return e;
    }
    var btn = document.getElementsByClassName("system-title")[0];
    var rect = btn.getBoundingClientRect();
    var x = rect.x;
    var y = rect.y;
    // 按住选区
    btn.dispatchEvent(mouseEvent(btn, "mousedown", x, y));

    var dx = 0;
    var dy = 0;
    // 开始拖拽
    var interval = setInterval(function () {
        var _x = x + dx;
        var _y = y + dy;
        // 拖拽
        btn.dispatchEvent(mouseEvent(btn, "mousemove", _x, _y));
        if (_x - x >= 300) {
            clearInterval(interval);
            // 放开
            btn.dispatchEvent(mouseEvent(btn, "mouseup", _x, _y));
        } else {
            dx += Math.ceil(Math.random() * 30);
            console.log(dx);
        }
    }, 20);
}
// 命令行 API参数 有效性测试
let CmdAPITestOld = async () => {
    await waitFunc(1000);
    // 滚动条设置(双引擎暂不考虑这个问题)
    // await openLnksWinByCmd({ scrollbar: `${lithium}/lithium-frontend/tests/public/unit/apps/scrollbar.html`}); // 此项必须传递当前滚动条配置文件路径才可测试
    // 默认标题设置
    await openLnksWinByCmd(getAutoTestWinArg({
        url: `${location.protocol}//${location.host}/tabs/autoTest/auto.close.notitle.html`,
        "default-title": "默认标题测试" // 第二次启动的默认标题，只能使用第一个引擎实例获取到的默认标题值
    }, 2, `设置了标题为"默认标题测试"`))
    // 加载动画设置
    // await openLnksWinByCmd(getAutoTestWinArg({ preload: true }, 3, `设置了加载动画`)) // TODO
    // // appId 设置
    // await openLnksWinByCmd(getAutoTestWinArg({appId: "12as8.ji_a.com"}, 3, `设置了 appId:12as8.ji_a.com，稍后会聚焦此窗口`))
    // window.win.setFocus(); // 先把主窗口拉到最上层
    // await openLnksWinByCmd(getAutoTestWinArg({ appId: "12as8.ji_a.com" }, 3, `设置了 appId:12as8.ji_a.com`)) // 第二次打开同 appId 会聚焦
    // // 图标设置
    // await openLnksWinByCmd(getAutoTestWinArg({ icon: `${location.protocol}//${location.host}/icon/tree.ico` }, 3, `图标设置 "./icon/tree.ico"`)) // 指定全地址图标(PASS)
    // // 模式设置
    // await openLnksWinByCmd(getAutoTestWinArg({ mode: "topBar" }, 3, `设置了topBar模式`)) // TODO
    // // 样式设置
    // await openLnksWinByCmd(getAutoTestWinArg({ style: "background:rgba(0,0,0,0); -moz-appearance: none;" }, 3, `设置了样式透明`)) //TODO 背景色和透明需要拆分为两个选项
    // // 跳过任务栏设置
    // await openLnksWinByCmd(getAutoTestWinArg({ skip_bar: true }, 3, `设置了跳过任务栏 "skip_bar"`))

    // // 用户参数设置
    // let userArg = { user_args: ('{"fdsa":"f","jgk":33, "topBar":111}') };
    // await openLnksWinByCmd(getAutoTestWinArg({}, 3, `设置了"${JSON.stringify(userArg)}"`),userArg)
    // // 大小尺寸设置
    // let size = { width: 900, height: 800 };
    // await openLnksWinByCmd(getAutoTestWinArg(size, 3, `大小尺寸"${JSON.stringify(size)}"`))
    // // 窗口位置设置
    // let p = { positionX: 200, positionY: 100 };
    // await openLnksWinByCmd(getAutoTestWinArg(Object.assign(p, size), 3, `窗口位置设置"${JSON.stringify(p)}"`))
    // // 窗口状态设置
    // let wMode = "maximize";
    // await openLnksWinByCmd(getAutoTestWinArg(Object.assign(size, { winMode: wMode }), 3, `窗口状态设置"${wMode}"`))
    // // 窗口状态设置
    // wMode = "normal";
    // await openLnksWinByCmd(getAutoTestWinArg(Object.assign(size, { winMode: wMode }), 3, `窗口状态设置"${wMode}"`))
    // // 窗口状态设置
    // wMode = "minimize";
    // await openLnksWinByCmd(getAutoTestWinArg(Object.assign(size, { winMode: wMode }), 3, `窗口状态设置"${wMode}"`))
    // // 窗口状态设置
    // wMode = "fullscreen";
    // await openLnksWinByCmd(getAutoTestWinArg(Object.assign(size, { winMode: wMode }), 3, `窗口状态设置"${wMode}"`))

    // // 隐藏系统边框
    // await openLnksWinByCmd(getAutoTestWinArg({ hideChrome: true }, 3, `设置了隐藏系统边框`))
    // 命令行三方控制接口
    // await openLnksWinByCmd({cmd: ""})
    // 命令行参数集合
    // await openLnksWinByCmd({
    //     scrollbar: "",
    //     title: "",
    //     preload: true,
    //     appId: "",
    //     icon: "",
    //     mode: "",
    //     style: "",
    //     skip_bar: "",
    //     user_args: "",
    //     debug: "",
    //     width: "",
    //     height: "",
    //     positionX: "",
    //     positionY: "",
    //     winMode: "",
    //     hideChrome: "",
    //     cmd: "",
    // })
}
// JS API参数 有效性测试
let JSAPITest = async () => {
    // 预备值
    // let U_ = 'http://127.0.0.1:8000/tabs/autoTest/auto.close.html?time=2&msg=';
    let U_ = './tabs/autoTest/auto.close.html?time=2&msg=';
    let wlo2 = async (msg, win_arg) => {
        await waitFunc(2000);
        if (typeof win_arg.url == "undefined") {
            win_arg.url = `${U_}${encodeURIComponent(msg)}`;
        }
        if ("function" != typeof win.isGecko) {
          win.isGecko = function () {
              return false;
          }
        }
        win_arg.useGecko = win.isGecko();
        console.log("win_arg:", JSON.stringify(win_arg));
        window.lnks.openWindow2(win_arg, {}); // TODO: 第二个参数默认可以不传，为空
        await waitFunc(2000);
    }

    // 加载动画 TODO:
    AutoTest.report("[? ]: 将打开 一个 有加载动画 的页面");
    // 需要一个服务端响应比较慢的访问地址
    await wlo2('加载动画', {
        // url: `http://127.0.0.1:8000//apps/wait.php?l=1`,
        url: `http://baidu.com`,
        preload: true,
        mode: "topBar",
        width: 800,
        height: 600
    });
    // 标题参数
    let title = "测试标题" + nowTime()
    AutoTest.report(`[? ]: 将打开 一个 标题参数 页面, 标题: "${title}"`);
    await wlo2(`请注意本窗口标题应为 "${title}"`, { title: title });

    // 图标参数
    let icon = './icon/tree.ico'
    AutoTest.report(`[? ]: 将打开 一个 图标参数 页面，图标: "${icon}"`);
    await wlo2(`请注意本窗口图标应为 "${icon}"`, { icon: icon })

    // 窗口模式参数
    AutoTest.report(`[? ]: 将打开 一个 窗口模式参数 页面，模式: "topBar"`);
    await wlo2(`请注意本窗口打开时应有 topBar `, { mode: "topBar" })
    AutoTest.report(`[? ]: 将打开 一个 窗口模式参数 页面，模式: "default"`);
    await wlo2(`请注意本窗口打开时应 没有 topBar`, { mode: "default" })

    let winMode = "normal";
    // 窗口尺寸参数
    let size = { width: 800, height: 600 }
    AutoTest.report(`[? ]: 将打开 一个 窗口尺寸参数 页面，尺寸: "${JSON.stringify(size)}"`);
    await wlo2(`请注意本窗口打开时的 尺寸应是 ${JSON.stringify(size)}`, { winMode: winMode, width: size.width, height: size.height })
    size = { width: 1000, height: 800 }
    AutoTest.report(`[? ]: 将打开 一个 窗口尺寸参数 页面，尺寸: "${JSON.stringify(size)}"`);
    await wlo2(`请注意本窗口打开时的 尺寸应是 ${JSON.stringify(size)}`, { winMode: winMode, width: size.width, height: size.height })

    // 窗口位置参数
    // 设置宽高避免屏幕宽高
    let p = { x: 200, y: 100 };
    AutoTest.report(`[? ]: 将打开 一个 窗口位置参数 页面，位置: "${JSON.stringify(p)}"`);
    await wlo2(`请注意本窗口打开时的 位置应是 ${JSON.stringify(p)}`, { winMode: winMode, positionX: p.x, positionY: p.y, width: 800, height: 600 })
    p = { x: 500, y: 300 };
    AutoTest.report(`[? ]: 将打开 一个 窗口位置参数 页面，位置: "${JSON.stringify(p)}"`);
    await wlo2(`请注意本窗口打开时的 位置应是 ${JSON.stringify(p)}`, { winMode: winMode, positionX: p.x, positionY: p.y, width: 800, height: 600 })

    // 窗口状态参数
    AutoTest.report(`[? ]: 将打开 一个 窗口状态参数 页面，状态: "${winMode}"`);
    await wlo2(`请注意本窗口打开时窗口状态应是 普通状态(非最大化)`, { winMode: winMode })//, width: 800, height: 600
    // 设置宽高避免屏幕宽高
    winMode = "maximize";
    AutoTest.report(`[? ]: 将打开 一个 窗口状态参数 页面，状态: "${winMode}"`);
    await wlo2(`请注意本窗口打开时窗口状态应是 最大化`, { winMode: winMode });//, width: 800, height: 600

    // 窗口样式参数
    let style = 'background:rgba(0,0,0,0); -moz-appearance: none;'
    AutoTest.report(`[? ]: 将打开 一个 窗口样式参数 页面，样式: "${style}"`);
    await wlo2(`请注意本窗口打开时 应是 ${style}`, { style: style, width: 800, height: 600 })
    style = 'background:rgba(100,250,0,0.5); -moz-appearance: none;'
    AutoTest.report(`[? ]: 将打开 一个 窗口样式参数 页面，样式: "${style}"`);
    await wlo2(`请注意本窗口打开时 应是 ${style}`, { style: style, width: 800, height: 600 })
    style = 'background:rgba(100,250,0,1); -moz-appearance: none;'
    AutoTest.report(`[? ]: 将打开 一个 窗口样式参数 页面，样式: "${style}"`);
    await wlo2(`请注意本窗口打开时 应是 ${style}`, { style: style, width: 800, height: 600 })


    // 跳过任务栏参数
    AutoTest.report(`[? ]: 将打开 一个 跳过任务栏参数 页面`);
    await wlo2(`请注意本窗口打开时应 跳过了任务栏`, { skipBar: true, width: 800, height: 600 })


    // 去系统边框参数
    AutoTest.report(`[? ]: 将打开 一个 去系统边框参数 页面`);
    await wlo2(`请注意本窗口打开时应 没有系统边框`, { hideChrome: true, width: 800, height: 600 })

    // 窗口状态参数
    winMode = "maximize";
    AutoTest.report(`[? ]: 将打开 一个 去系统边框的最大化 页面，状态: "${winMode}"`);
    await wlo2(`请注意本窗口打开时应 最大化且没有系统边框`, { hideChrome: true, winMode: winMode, width: 800, height: 600 });
    winMode = "normal";
    AutoTest.report(`[? ]: 将打开 一个 去系统边框的普通状态 页面，状态: "${winMode}"`);
    await wlo2(`请注意本窗口打开时应 普通状态且没有系统边框`, { hideChrome: true, winMode: winMode, width: 800, height: 600 })

    // 窗口隐藏参数
    AutoTest.report(`[? ]: 将打开 一个 窗口隐藏参数 页面`);
    await wlo2(`请注意本窗口打开时应有加载动画`, { hidden: true })

    // 用户参数接收到达测试
    let user_args = { "arg1": '参数一', "arg2": { 'arg2.2': 2.2 } };
    // 被打开页面需要能够显示出参数
    AutoTest.report("[? ]: 将打开 一个传递了用户参数的页面，应显示的是：" + JSON.stringify(user_args));
    await waitFunc(3000);
    let msg = `请注意本窗口显示的用户参数(蓝色): ${JSON.stringify(user_args)}`;
    window.lnks.openWindow2({ "url": `${U_}${encodeURIComponent(msg)}` }, user_args);
}
// 原生 windowOpen 测试
let winOpenTest = async () => {
    let URL_PRE = './tabs/autoTest/auto.close.html?time=1&msg=';
    window.open(`${URL_PRE}请注意本窗口应会自动关闭`, 'child', 'width=400,height=300,left=200,top=200') // 客户场景并未要求 寬高位置生效
    AutoTest.report("[? ]: 打开了 一个会自动关闭的子页面");
    await waitFunc(3000);
    window.open(`${URL_PRE}请注意 无论主窗口是否带有系统边框 本窗口应 全屏且带系统边框`, 'child')
    AutoTest.report("[? ]: 打开了 一个会自动全屏带系统边框的子页面");
    await waitFunc(3000);
    // TODO: 添加 LITHIUM_ENABLE_XPC_URLS 特权验证测试
    // 即使使用 window.open 打开新页面，也应应用 特权校验规则
}
// 404 页面测试
let _404ErrorTest = async () => {
    // JSAPI 测试 404 界面
    AutoTest.report("[? ]: 即将打开 一个不存在的地址 以测试 404页面 需要手动关闭");
    await waitFunc(3000);
    let URL = `http://127.0.0.1:5017`
    window.lnks.openWindow2({
        "url": `${URL}`,
    }, "") // TODO: user_args 参数可选
    // CmdAPI 测试 404 界面
    AutoTest.report("[? ]: 即将打开 一个不存在的地址 以测试 404页面 需要手动关闭");
    let lithium = envGetAndReport("LITHIUM_PATH", "命令行 API 对 404错误页面")
    await waitFunc(3000);
    window.lnks.$(`${lithium}/lithium ${URL}`);
}
// 证书错误页面测试
// 客户那里一般通过 命令行打开首个页面时遇到证书问题
let SSLErrorTest = async () => {
    // JSAPI 测试 证书错误 界面
    let URL = `https://training.linakesi.com`
    window.lnks.openWindow2({
        "url": `${URL}`,
        "icon": "./icon/lnks.ico",
        "title": "证书错误页面",
    }, "")
    // CmdAPI 测试 证书错误 界面
    AutoTest.report("[? ]: 即将打开 一个证书错误的地址 以测试 证书错误页面 需要手动关闭");
    let lithium = envGetAndReport("LITHIUM_PATH", "命令行 API 对 404错误页面")
    await waitFunc(3000);
    AutoTest.report(`${lithium}/lithium ${URL}`);
    // window.lnks.$(`${lithium}/lithium ${URL}`);
}


// 测试窗口间接控制API
let windowCtrlTest = async () => {
    // 准备新窗口用于验证间接控制API
    // TODO: 需要继续详细测试，当窗口关闭后的情形，需要讨论下。
    // TODO: 本测试用例还需要理清每个步骤，确认是否可完全重用。
    let childWinTitle = "子窗口" + nowTime();
    window.lnks.openWindow2({
        "url": `./tabs/autoTest/auto.close.html?time=50&msg=${encodeURIComponent("请留意窗口尺寸、位置、状态及聚焦变化")}`,
        "icon": "./icon/lnks.ico",
        "title": childWinTitle,
    });
    await waitFunc(1000); // 等窗口打开好
    window.testWin = getLnksWin({title:childWinTitle}, true)
    console.log("testWin:", window.testWin);
    await funcSetTitleTest(window.testWin); // 测试标题设置
    await funcSetIconTest(window.testWin); // 测试图标设置
    await funcSetPositionTest(window.testWin); // 测试位置设置
    await funcSetSizeTest(window.testWin); // 测试尺寸设置
    await funcSetVisibilityTest(window.testWin); // 测试可见性设置
    await funcSkipBarTest(window.testWin); // 测试跳过任务栏
    await funcIdleTimeTest(window.testWin); // 测试计算机闲置时间
    await funcKeepAboveTest(window.testWin); // 测试置顶状态切换
}
// 测试窗口状态
let windowStateTest = async () => {
    let windowStates = [
        { name: 'minimize', check: 'minimized', tag: '最小化测试' },
        { name: 'normal', check: 'normal', tag: '普通模式测试' },
        { name: 'maximize', check: 'maximized', tag: '最大化测试' },
        { name: 'fullscreen', check: 'fullscreen', tag: '全屏测试' },
        { name: 'normal', check: 'normal', tag: '普通模式测试' },
    ];
    for (const w of windowStates) {
        await waitFunc(1500);
        await window["win"][w.name]();
        await getTestStateFunc(`"${w.check}"`, window.win.windowState, `${w.tag}`);
    }
}
// 测试 userAgent 修改 // TODO: 待测试，记录结果
let userAgentTest = async () => {
    AutoTest.report(`[? ]: 当前: ${navigator.userAgent}`);
    await waitFunc(3000);
}
let engineSizeGetTest = async () => {
    let testWinTitle = '引擎间读取尺寸窗口';
    let winArg = {
        "url": `./tabs/autoTest/auto.close.html?time=13&msg=${encodeURIComponent("请留意窗口尺寸变化")}`,
        "title": testWinTitle,
        "width": 800,
        "height": 600,
        "winMode": "normal",
        "useGecko": !win.isGecko(),
    };
    console.log("winArg:", winArg);
    lnks.openWindow2(winArg, {});
    await waitFunc(3000);
    window.testWin = getLnksWin({title:testWinTitle},true);
    await funcGetSizeTest(window.testWin); // 测试尺寸设置
}
let engineSizeSetTest = async () => {
    let testWinTitle = '引擎间设置尺寸窗口';
    let winArg = {
        "url": `./tabs/autoTest/auto.close.html?time=13&msg=${encodeURIComponent("请留意窗口尺寸变化")}`,
        "title": testWinTitle,
        "width": 800,
        "height": 600,
        "winMode": "normal",
        "useGecko": !win.isGecko(),
    };
    console.log("winArg:", winArg);
    lnks.openWindow2(winArg, {});
    await waitFunc(3000);
    window.testWin = getLnksWin({title:testWinTitle},true);
    await funcSetSizeTest(window.testWin); // 测试尺寸设置
}
// 测试 引擎间调度测试，控制另引擎窗口的测试
let engineCtrlTest = async () => {
    let testWinTitle = '引擎间调度测试窗口';
    let winArg = {
        "url": `./tabs/autoTest/auto.close.html?time=50&msg=${encodeURIComponent("请留意标题、图标、位置、状态及聚焦变化")}`,
        "title": testWinTitle,
        "width": 800,
        "height": 600,
        "winMode": "normal",
        "useGecko": !win.isGecko(),
    };
    console.log("winArg:", winArg);
    lnks.openWindow2(winArg, {});
    await waitFunc(3000);
    window.testWin = getLnksWin({title:testWinTitle},true);
    await funcSetTitleTest(window.testWin); // 测试标题设置
    await funcSetIconTest(window.testWin); // 测试图标设置
    await funcSetPositionTest(window.testWin); // 测试位置设置
    // await funcSetSizeTest(window.testWin); // 测试尺寸设置
    await funcSetVisibilityTest(window.testWin); // 测试可见性设置
    await funcSkipBarTest(window.testWin); // 测试跳过任务栏
    await funcIdleTimeTest(window.testWin); // 测试计算机闲置时间
    await funcKeepAboveTest(window.testWin); // 测试置顶状态切换
}
// TODO: 测试 Cookie 同步
let syncCookieTest = async () => {
}
// TODO: 测试 数据同步
let syncStorageTest = async () => {
    // 分别打开好两个引擎界面
    // 两边读出数据
    // 一边写入数据
    // 另一边再次读出数据
    // 关闭其中一个引擎窗口，再打开，读出数据
    // 关闭另一个引擎窗口，再打开，读出数据
    // 关闭所有窗口(退出进程)，再打开，读出数据
}
// protobuf 最大长度测试,64K:瓶颈不在 socket 传输流程中，只在 protobuf.js 解码步骤里。


let setTimeoutToDo = (funcHandle, timeoutArr) => {
    for (let index = 0; index < timeoutArr.length; index++) {
        setTimeout(funcHandle, timeoutArr[index]);
    }
}
let messageTest = async () => {
    // /tests/public/unit/apps/lnks.message.html
    let receiveWindowId = "MsgReceive";
    lnks.openWindow2({
        "url": "/apps/lnks.message.receive.html",
        "winMode": "normal",
        "appId": receiveWindowId,
    });
    await waitFunc(2000);
    let msgWin = getLnksWin({appId:receiveWindowId}, true);
    if (msgWin) {
        if (msgWin.sendMessage) {
            setTimeoutToDo(() => {
                let timeStr = getDateString();
                let msg = `我是来自其它页面的消息：${timeStr}`;
                    AutoTest.report(`[? ]: 发送页面消息: ${timeStr}`);
                    msgWin.sendMessage(msg);
            }, [1000,2000,3000,4000,5000,6000,7000]);
            await waitFunc(3000);
            setTimeoutToDo(() => {
                let timeStr = getDateString();
                let msg = `我是来自命令行的消息：${timeStr}`;
                let command = `${lnks.env.get("LITHIUM_PATH")}/lithium --app-id=${receiveWindowId} --send-message="${msg}"`;
                AutoTest.report(`[? ]: 发送命令行消息: ${timeStr}`);
                window.lnks.$(command, console.info, console.error);
            }, [1000,2000,3000,4000,5000,6000,7000]);
            await waitFunc(5000);
            setTimeoutToDo(() => {
                let timeStr = getDateString();
                let msg = `t${JSON.stringify({time:timeStr})}`;
                    AutoTest.report(`[? ]: 发送页面消息: ${JSON.stringify({time:timeStr})}`);
                    msgWin.sendMessage(msg);
            }, [1000,2000,3000,4000,5000,6000,7000]);
            await waitFunc(8000);
        } else {
            AutoTest.report(`[* ]: 发送消息功能函数缺失，请检查浏览器内核及版本(Chrome,>20220401)`);
        }
    } else {
        friendlyNotice('没有找到打开的消息接收界面。请检查。。。');
    }
}

let logTest = async () => {
    let lnksLogPath = "~/.lnks.com/lithium2/Logs/web.log";
    let lnksLogRead = () => {
        let command = `tail -n 21 ${lnksLogPath}`;
        window.lnks.$(
          command,
          (result) => { AutoTest.report(`[? ]: 读取消息如下 \r\n${result}`) },
          (result) => { AutoTest.report(`[? ]: 读取消息如下 \r\n${result}`) }
        );
    }
    if (lnks.logger && typeof lnks.logger.info == 'function') {
        let strData = {a:'jsjsjs',b:"魑魅魍魉魑魅魍魉魑魅魍魉魑魅魍魉魑魅魍魉",c: () => {console.log("test")}, d: null};
        window.logStartTime = (new Date()).getTime();
        setTimeoutToDo(() => {
            let timeStr = getDateString({"T":" ","Z":""});
            let logStrRepeatCnt = parseInt(((new Date()).getTime() - logStartTime)/1000);
            let logContentLast = `${timeStr} , ${JSON.stringify(strData).repeat(logStrRepeatCnt*3)}`;
            lnks.logger.info(` 这是一个 info 日志：${logContentLast}。`);
            lnks.logger.warn(` 这是一个 warn 日志：${logContentLast}。`);
            lnks.logger.debug(` 这是一个 debug 日志：${logContentLast}。`);
            lnks.logger.trace(` 这是一个 trace 日志：${logContentLast}。`);
            lnks.logger.error(` 这是一个 error 日志：${logContentLast}。`);
            AutoTest.report(`[? ]: ${timeStr} 写入日志。消息体重复 ${logStrRepeatCnt*3} 次。`);
        }, [1000,3000,5000,7000]);
        await waitFunc(10000);
        lnksLogRead()
        await waitFunc(1000);
    } else {
        AutoTest.report(`[* ]: 日志功能函数缺失，请检查浏览器内核及版本(Chrome,>20220401)`);
    }
}

let innerPageTest = async () => {
    let openPageConfig = {
        "url": "lnks://inner/innerTestPage.html",
        "winMode": "normal",
    };
    AutoTest.report(`[? ]: 使用 JS接口 打开内部定制资源页面。`);
    Object.assign(openPageConfig,{
        "title": "内部定制资源页面JS",
        "appId": "InnerJSApp",
    });
    lnks.openWindow2(openPageConfig);
    await waitFunc(4000);
    AutoTest.report(`[? ]: 使用 命令行 打开内部定制资源页面。`);
    Object.assign(openPageConfig,{
        "title": "内部定制资源页面CMD",
        "appId": "InnerCmdApp",
    });
    openLnksWinByCmd(openPageConfig);
}
/**
 * 刷新测试
 * 刷新有多个测试函数，所以封装以参数来测试不同函数的效果
 * @param {string} rtype eg: `?rtype=1`
 */
let refeshTestServerRunning = false;
let refeshTestHandle = async(rtype) => {
    AutoTest.report(`[? ]: 打开测试"避免缓存"的预备页面。`);
    let lithiumPath = `${window.lnks.env.get("LITHIUM_PATH")}`;
    let cacheFile = `apps/cacheTest/index.html`;
    let command = `#!/bin/bash
if test -f "${lithiumPath}/tests/unit/${cacheFile}"; then
realpath ${lithiumPath}${cacheFile}
elif test -f "${lithiumPath}/../../../tests/public/unit/${cacheFile}"; then
realpath ${lithiumPath}/../../../tests/public/unit/${cacheFile}
fi`;
    let modifyCachePageAssets = () => {
        let timeStr = getDateString({"T":" ","Z":""});
        let jsContent = `document.getElementById("time").textContent="${timeStr}";`;
        let cssContent = `span.time::after {content: "${timeStr}";}`;
        let jsCmd = `echo '${jsContent}' > ${ignoreTestPath}/index.js`;
        let cssCmd = `echo '${cssContent}' > ${ignoreTestPath}/index.css`;
        let htmlCmd = `sed -i '9s/.*/<div>Html时间<span>${timeStr}<\\/span><\\/div>/' ${ignoreTestPath}/index.html`;
        console.log(jsCmd);
        console.log(cssCmd);
        console.log(htmlCmd);
        window.lnks.$(jsCmd, console.log, console.error);
        window.lnks.$(cssCmd, console.log, console.error);
        window.lnks.$(htmlCmd, console.log, console.error);
    };
    let getFileIgnoreToTestHandle = async (f) => {
        let file = f.replace(`\n`,``);
        window.ignoreTestPath = file.substring(0, file.lastIndexOf('/'));
        console.log(`${JSON.stringify(file)}`);
        console.log(`${JSON.stringify(ignoreTestPath)}`);
        let openPageConfig = {
            "url": `./${cacheFile}${rtype ? "?rtype="+rtype : ""}`,
            "title": `cacheTest${rtype||""}`,
            "winMode": "normal",
            "useGecko": win.isGecko(),
        };
        lnks.openWindow2(openPageConfig);
        await waitFunc(2000);
        if (refeshTestServerRunning === false) {
            setInterval(modifyCachePageAssets, 3000);
            refeshTestServerRunning = true;
        }
    };
    window.lnks.$(command, getFileIgnoreToTestHandle, console.error);
}
let refeshTest = async () => {await refeshTestHandle();}
let refeshTest1 = async () => {await refeshTestHandle(1);}
let refeshTest2 = async () => {await refeshTestHandle(2);}
let refeshTest3 = async () => {await refeshTestHandle(3);}

// 最小测试
let miniTest = async () => {
    AutoTest.report(`本测试仅覆盖办公桌面环境明确使用的功能`);
    await windowCtrlTest(); // 测试标题设置
    // 包含 MainWindow.all().filter
    await JSAPITest(); // 测试JS接口设置

    await windowStateTest(); // 测试窗口状态

    await CmdAPITestOld(); // 测试命令行接口有效性
    // 包含 lnks.$().then().catch()
    // 包含 lnks.$('', res => { })

    AutoTest.report("[? ]: 查看是否为最上层窗口 须手动观测");
    // window.open('./apps/getTopFocus.html');
    // await waitFunc(2000);
    win.setFocus();
    AutoTest.report("[? ]: 托盘暂手动测试");//托盘创建销毁，右键菜单，通信
    // await trayTest(); // 托盘测试
    AutoTest.report("[? ]: 窗口拖放须手动测试");
    AutoTest.report("[? ]: 任务栏右键关闭提示须手动测试");
}
let Test = async () => {
    AutoTest.report(`即将支持该项测试`);
}
