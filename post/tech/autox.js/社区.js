const prepare = (name)  => {
  auto.waitFor(); // 等待获取无障碍权限
  // 唤醒设备，如果需要的话
  device.wakeUpIfNeeded()
  // 回到桌面
  home();
  toast('回到桌面');
  // 启动App
  launch("cloud.lazycat.client");
  toast('启动App');
  sleep(2000);
  waitForPackage("cloud.lazycat.client")
  text(name).findOne().click();
  sleep(1000);
  toast(`已定位到${name}界面`);
}

prepare("社区")