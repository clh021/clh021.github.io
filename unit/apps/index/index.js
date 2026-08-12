function output(str, Id) {
    //console.info(str);
    let res = document.getElementById(Id);
    var pobj = document.createElement('p');
    var textobj = document.createTextNode(str + "\r\n");
    res.appendChild(pobj.appendChild(textobj))
}

function setIcon() {
    // this.win.set_icon("https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico") // linux OK , windows Fail
    this.win.setIcon("https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico") // linux OK , windows Fail
}

function setIcon2() {
    // this.win.set_icon("./icon/nazha.ico") // linux OK , windows Fail
    this.win.setIcon("./icon/nazha.ico") // linux OK , windows Fail
}


function getEnv() {
    let envTitle = document.getElementById('envKey').value;
    // alert(envTitle)
    let envValue = `${window.lnks.env.get(envTitle)}`
    alert(envValue);
    commandResultInfoSet(envValue);
}

function commandResultInfoSet(result) {
    document.getElementById('commandResultInfo').value = result;
    console.info("result:", result)
}

function commandResultErrorSet(error) {
    document.getElementById('commandResultError').value = error;
    console.info("error:", error)
}

function getCommandResult() {
    let command = document.getElementById('command').value;
    window.lnks.$(command, commandResultInfoSet, commandResultErrorSet);
}

// var platform = navigator.platform.toLowerCase();
// if (platform.indexOf("linux") != -1){}
function showHelp() {
    document.querySelectorAll("div.hidden").forEach(function (e) {
        var obj_class = ' ' + e.className + ' ';
        obj_class = obj_class.replace(/(\s)/gi, ' '),
            removed = obj_class.replace(' hidden ', ' ');
        removed = removed.replace(/(^\s+)|(\s+$)/g, '');
        e.className = removed;
    });
}

function begin_move(e) {
    //避免titlebar上的按钮点击事件被吃掉
    if (e.currentTarget != e.target) return false;
    // this.win.beginMove(e, this);
    console.log("begin_move:this:", window);
    this.win.begin_move(e, window);
}

function prepareFullScreen() {
    // this.win.setPosition(0,0);
    // this.win.setSize(screen.availWidth, screen.availHeight);
    // let width=800,height=600;
    // this.win.setSize(width, height);
    // this.win.setPosition((screen.availWidth - width) / 2, (screen.availHeight - height) / 2); // 为测试最大化，及托盘菜单界面
    // this.win.skipBar(false); // 保持任务栏，为了配合 preload 跳过任务栏的操作
    // this.win.setFocus(); // 激活(聚焦)本窗口
    // this.win.keepAbove(); //保持置顶
    // this.win.fullscreen(); // 客户需求留出任务栏
    // this.win.maximize(); // TODO: win7 会盖住任务栏
}

function openClock() {
    window.lnks.openWindow2({
        "url": "./apps/clock.html",
        "icon": "./icon/lnks.ico",
        "title": "时钟应用",
        width: 250,
        height: 270,
    }, "")
}

function openChildrenByIframeWindow(params) {
    window.lnks.openIFrameWindow({
        // "url":"./apps/child.html",
        "url": "https://qq.com",
        "icon": "./icon/nazha.ico",
        "title": "Iframe模板应用",
    })
}

function openTopBarWindowWithFirefoxMODE(url, title, icon) {
    window.lnks.openTopBarWindow({
        "url": url,
        "icon": icon,
        "title": title,
    })
}

// function openWindowWith(url, title, icon) {
//     let type = openWindowType.value;
//     console.log(type, 'type');
//     switch (type) {
//         case 'openWindow2':
//             window.lnks.openWindow2({
//                 "url":url,
//                 "icon":icon,
//                 "title":title,
//             // },{
//             //     "HomeWindow": this.win,
//             // }).then((r) => {
//             //     console.info("r", r);
//             //     newWin = new window.lnks.MainWindow(r);
//             //     // 赋值到父窗口后 的 win 对象，可以使父窗口继续控制该 win 对象
//             })
//             break;
//         case 'openTopBar':
//             window.lnks.openTopBarWindow({
//                 "url":url,
//                 "icon":icon,
//                 "title":title,
//                 "width":"100%",
//                 "height":"100%",
//             });
//             break;
//         default:
//             console.log(type, '这是一个暂时还不支持的操作类型。');
//             break;
//     }
// }

function openWindowWith(url, title, icon) {
    window.lnks.openWindow2({
        "url": url,
        "icon": icon,
        "title": title,
        "width": "100%",
        "height": "100%",
    })
}

//
// 设置全屏
// 两次设置是因为计算机资源环境不一样导致的，window初始化消耗时间不一致，为了尽可能优化体验，所做的兼容处理。
// function InitFullScreen() {
// setTimeout(function(){
//         // prepareFullScreen()
//         // setTimeout(prepareFullScreen, 500)
// }, 10)
// }

// 创建顶部操作栏
function InitTopSearch() {
    window.lnks.openWindow2({
        // 经验证，可以不加引号
        "url": "./topsearch.html",
        // "icon":"./icon/lnks.ico",
        // "title":"标题",
        "preload": false,
    }, {
        // 用户参数传递
        "HomeWindow": this.win,
        // "callback": InitFullScreen
    })
}

// 弹出消息框
function openMsgBox() {
    var saveMsgBox = window.lnks.openWindow2({
        "url": "./apps/msgBox.html",
        "skipBar": true,
        "width": 380,
        "height": 280,
        "hideChrome": true,
        "positionX": screen.availWidth - 380,
        "positionY": screen.availHeight - 280
    }, {
        //新增
        "mainWindow": self.win,
        "mainVue": self,
        //
    });
}

function testOnClose(e) {
    console.log("event:",e);
    var r = confirm("确定要关闭吗?");
    if (r) {
        openMsgBox();
    } else {
        e.preventDefault();
    }
};
function initPage() {
    // if (window.navigator.userAgent.indexOf("lithium") != -1) {
    if (window.lnks) {
        this.win = new window.lnks.MainWindow(window);
        // window.addEventListener("unload", openMsgBox); // 对比 onclose 成功了。
        this.win.onclose = () => { // 能在任务栏右键关闭时触发。
            return confirm("确定要关闭吗?");
        };
        let msg = 'engine-tag-unknow';
        if ("function" == typeof win.isGecko) {
            if (win.isGecko()) {
                msg = "engine-tag-gecko";
            } else {
                msg = "engine-tag-chromium";
            }
        } else {
            msg = 'engine-tag-single';
        }
        $('.engine-tag').addClass(msg).show();
        $('.engine-tag').html(`(${navigator.platform})`);
    } else {
        $(".notice").show();
    }
}

function testOnClose() {
    let oClose = () => {
        confirm("ddddd");
        return "真的要关闭吗？"
    }
    // window.addEventListener("unload", oClose);
    // window.onclose = oClose;
    // window.onbeforeunload = oClose;
    window.onbeforeunload = function () {
        return '确定要关闭吗？';
    }
}
function promptTest() {
    var str = prompt("请输入密码", "aa");
    console.log("str:", str);
    alert("您输入的是:" + str);
    // var r=confirm("按下按钮!");
    // console.log("您输入的是：", r);
}

// promptTest();

