<?php
//使用本示例:
// 启动：本文件所在目录执行 php -S "0.0.0.0:8000"
// 访问：http://localhost:8000

define("COOKIE_NAME", "testCookie");
define("COOKIE_VALUE", "abcdefghijklmnopqrstuvwxyz1234567890");

function cookie_set() {
  setcookie(COOKIE_NAME, COOKIE_VALUE);
}
function checkCookie() {
  return isset($_COOKIE[COOKIE_NAME]) ? ($_COOKIE[COOKIE_NAME] == COOKIE_VALUE) : "NOSET";
}
function showCheck() {
  header('Content-Type:application/json; charset=utf-8');
  die(json_encode(checkCookie()));
}
function index() {
  ?><!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cookie密集测试</title>
    <style>
      #result div{
        height: 20px;
        float: left;
        margin-left: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    Cookie 密集测试：后台设置cookie，前台获取时，几十个请求会有几个获取不到，只有 setTimeOut 或 alert 时是好的。
    <div id="btns">
      <button onclick="showAllCookie()">showAllCookie</button>
      <button onclick="clearAllCookie()">clearAllCookie</button>
      <button onclick="setCookieFromServer()">setCookieFromServer</button>
      <button onclick="testCookieByServer()">testCookieByServer 100次</button>
      <button onclick="testCookieByJS()">testCookieByJS 100次</button>
      <br>
      <button onclick="testCookieByServer2()">testCookieByServer withPromise 100次</button>
      <button onclick="testCookieByJS2()">testCookieByJS withPromise 100次</button>
    </div>
    <div id="result"></div>
    <script>
      let cookieName = "<?php echo COOKIE_NAME;?>";
      let resultEle = document.querySelector('#result');
      function getResultEleWithJson(json) {
        rDiv = document.createElement('div');
        rDiv.innerText = JSON.stringify(json);
        return rDiv;
      }
      function getCookie(name){
        let cookieArr = document.cookie.split("; ");
        for ( let i = 0; i < cookieArr.length; i++) {
            let arr = cookieArr[i].trim().split("=");
            if (arr[0] == name){
                return arr[1];
            }
        }
        return "";
      }
      function showAllCookie() {
        resultEle.innerText='';
        resultEle.innerText = document.cookie;
      }
      function clearAllCookie() {
				let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
				if(keys) {
					for(let i = keys.length; i--;)
						document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
				}
			}
      function testCookieByJS() {
        testCookie100Cnt(showCookieByJS);
      }
      function testCookieByJS2() {
        testCookie100Cnt2(showCookieByJS);
      }
      function showCookieByJS() {
        let cookieVal = getCookie(cookieName);
        resultEle.append(getResultEleWithJson(cookieVal));
			}
      function testCookie100Cnt(funcCallBack) {
        resultEle.innerText='';
        setCookieFromServer();
        // alert("a");
        // setTimeout(() => {
          for (let cnt = 0; cnt < 100; cnt++) {
            let s = 3.1415926 * 60 * 60 * 24 * 365 * cnt;
            console.log(cnt, s);
            funcCallBack();
          }
        // }, 500);
      }
      function testCookie100Cnt2(funcCallBack) {
        resultEle.innerText='';
        setCookieFromServer().then(r => {
          for (let cnt = 0; cnt < 100; cnt++) {
            let s = 3.1415926 * 60 * 60 * 24 * 365 * cnt;
            console.log(cnt, s);
            funcCallBack();
          }
        })
      }
      function testCookieByServer() {
        testCookie100Cnt(showCookieByServer);
      }
      function testCookieByServer2() {
        testCookie100Cnt2(showCookieByServer);
      }
      function showCookieByServer() {
        fetch('/?r=cookie_show')
          .then(res => res.json())
          .then(json => {
            console.log(json);
            resultEle.append(getResultEleWithJson(json));
          });
      }
      function setCookieFromServer() {
        return fetch('/?r=cookie_set');
      }
    </script>
  </body>
  </html>
  <?php
}

function main() {
  $route = isset($_GET["r"]) ? $_GET["r"] : "";
  $route = empty($route) ? "index" : $route;
  switch ($route) {
    case 'cookie_set':
      cookie_set();
      break;
    case 'cookie_show':
      showCheck();
      break;
    case 'index':
    default:
      index();
      break;
  }
}

main();