---
layout:     post
title:     使用PHPStorm编辑器
tags: 软件使用
keywords: 软件使用
description: 
---

# 安装

    官方下载安装 phpstorm 编辑器，不需要什么依赖，跨平台支持

# 外观设置

    “File”-“Settings”-“Appearance”
    个人推荐windows简洁明确
    “File”-“Settings”-“Editor”-“Colors & Fonts”
    个人感觉默认就很好

# Z-Coding支持

    输入ul.nav>li*5>a然后按Tab键

# 代码片断

    “File”-“Settings”-“Editor”-“Live Templates”
    如果不想找，直接在上面的配置搜索框输入“live”即可看到
    然后你可以在右边看到很多基于各个语言的代码片段了
    你可以对所有这些片段进行添加编辑删除
    甚至允许你配置多个相同key来指定不同的代码片段，调出时会有选项出现
    你还可以针对不同cms系统来定制代码片段

# 多设备同步

    我建议你可以导出你的配置，以及你的插件目录
    插件地址可以放在同步文件夹中

# 新建远程项目

    “Tools”-“Deployment”-“Brower Remote Host”

# 其他

    “File”-“Add to Favorites” 项目收藏夹
    “File”-“File Encoding” 文件编码
    汉化可以无形中帮你省掉很多事情 看 https://github.com/clh021/PhpStorm-Chinese
    浮动和固定工具窗 pinned and docked mode
    如何浮动工具窗口 左下角状态栏按钮
    显示行号 “File”-“Settings”-“Editor”(编辑器)-(通用)-(外观)-(显示行号 等)
    查找替换 ctrl + r
    使用 Tools -> start ssh session -> 可以很方便的开启远程主机的命令终端
    使用 C:\Program Files (x86)\Git\bin\sh.exe -login -i 即可方便的在phpstorm中使用好用的gitbash终端
    alt+7 可以查看类的函数列表 alt+1 可以查看文件列表
    代码提示   底部面板的信息提示 Disable Power Save Mode 点击即可关闭

# TODO

    如何连接docker并调试
    如何连接远程主机并调试
    
