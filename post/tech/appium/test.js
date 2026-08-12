// npm i --save webdriverio
const { remote } = require('webdriverio');
const fs = require('fs');

async function main () {
  const caps = {
    "platformName":"Android",
    "appium:platformVersions":"7.1.2",
    "appium:deviceName":"mi10lite",
    "appium:ensureWebviewsHavePages":true,
    "appium:nativeWebScreenshot":true,
    "appium:newCommandTimeout":3600,
    "appium:connectHardwareKeyboard":true,
    // "appium:appPackage":"cloud.lazycat.client",
    "appium:appActivity":"cloud.lazycat.client"
  }
  const driver = await remote({
    protocol: "http",
    hostname: "127.0.0.1",
    port: 4723,
    path: "/wd/hub",
    capabilities: caps
  });
  await driver.pause(1000);
  await showButtonsText(driver);
  await driver.deleteSession();
}

main().catch(console.log);

async function showButtonsText(client) {
  const buttons = await client.$$('[resource-id*="button"]');
  for (let i = 0; i < buttons.length; i++) {
    try {
      const button = buttons[i];
      const text = await button.getText();
      console.log(`ButtonText${i}:`, text);
      // if (text && text.includes(buttonText)) {
      //   await button.click();
      //   console.log('Button', buttonText, 'clicked successfully');
      //   return;
      // }
    } catch (error) {
      console.error('Error clicking button', buttonText);
      const screenshot = await client.takeScreenshot();
      fs.writeFileSync(`error_screenshot_${buttonText}.png`, screenshot, 'base64');
    }
  }
}

// async function clickBottomButtonByText(client, buttonText) {
//   const buttons = await client.$$('[resource-id*="button"]');
//
//   for (let i = 0; i < buttons.length; i++) {
//     try {
//       const button = buttons[i];
//       const text = await button.getText();
//       if (text && text.includes(buttonText)) {
//         await button.click();
//         console.log('Button', buttonText, 'clicked successfully');
//         return;
//       }
//     } catch (error) {
//       console.error('Error clicking button', buttonText);
//       const screenshot = await client.takeScreenshot();
//       fs.writeFileSync(`error_screenshot_${buttonText}.png`, screenshot, 'base64');
//     }
//   }
// }
//
// (async () => {
//   const client = await remote(opts);
//
//   // 启动应用程序
//   await client.launchApp();
//
//   // 等待应用程序加载
//   await client.pause(3000);
//
//   // 扫描并点击"发现"按钮
//   await clickBottomButtonByText(client, '发现');
//
//   // 扫描并点击"商店"按钮
//   // await clickBottomButtonByText(client, '商店');
//   //
//   // // 扫描并点击"启动器"按钮
//   // await clickBottomButtonByText(client, '启动器');
//   //
//   // // 扫描并点击"社区"按钮
//   // await clickBottomButtonByText(client, '社区');
//   //
//   // // 扫描并点击"个人"按钮
//   // await clickBottomButtonByText(client, '个人');
//
//   // 关闭应用程序
//   await client.closeApp();
//
// })();


