auto.waitFor(); // 等待获取无障碍权限
// // 唤醒设备，如果需要的话
// device.wakeUpIfNeeded()

// 回到桌面
home();

sleep(2000);
// 测试开始提示
toast('即将开始测试懒猫云App');

sleep(1000);

// 启动懒猫云App
launch("cloud.lazycat.client");
waitForPackage("cloud.lazycat.client")
sleep(2000);
text("我的").findOne().click();
sleep(2000);
text("社区").findOne().click();
sleep(2000);
text("启动器").findOne().click();
sleep(2000);
text("商店").findOne().click();


sleep(2000);
text("发现").findOne().click();
sleep(2000);
text("关注").findOne().click();
sleep(2000);
text("懒猫微服").findOne().click();

// // 获取当前界面所有可点击的按钮
// var buttons = className("android.widget.Button").clickable(true).find();

// // 依次点击按钮并打印文字内容
// for (var i = 0; i < buttons.length; i++) {
//   var button = buttons[i];
//   var buttonText = button.text(); // 获取按钮的文字内容
//   console.log("按钮文字：" + buttonText); // 打印按钮的文字内容
//   // button.click();
//   sleep(1000); // 可选：等待一段时间，以便查看操作效果
// }

// // // 选择图标按钮
// // var iconButton = className("android.widget.ImageView").findOne();

// // // 点击图标按钮
// // if (iconButton) {
// //   iconButton.click();
// //   sleep(1000); // 可选：等待一段时间，以便查看操作效果
// // } else {
// //   console.log("未找到图标按钮");
// // }