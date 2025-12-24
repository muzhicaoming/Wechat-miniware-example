# 微信小程序运行指南

## ⚠️ 重要提醒

**这不是 Node.js 项目！** 这是一个微信小程序项目，必须使用微信开发者工具运行。

## 正确的运行方式

### 第一步：下载并安装微信开发者工具
访问官网下载：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 第二步：导入项目
1. 打开微信开发者工具
2. 点击"导入项目"
3. 选择项目文件夹：`/Users/qitmac001395/workspace/QAL/wechat-miniware-example`
4. 输入 AppID：`wxa510a56a488e9c1b`（已在 project.config.json 中配置）
5. 点击"导入"

### 第三步：运行项目
1. 点击工具栏上的"编译"按钮
2. 左侧模拟器中会显示小程序界面

## ❌ 错误的运行方式

不要尝试以下操作：
- ❌ `node app.js`
- ❌ 在浏览器中打开 HTML 文件
- ❌ 使用 VS Code 或其他编辑器的运行按钮
- ❌ 直接双击任何 .js 文件

## 常见错误解释

### ReferenceError: App is not defined
这意味着代码没有在小程序环境中运行。`App()` 是微信小程序框架提供的全局函数，只在微信环境中可用。

### ReferenceError: Page is not defined
同样，这意味着代码在非小程序环境中运行。`Page()` 也是微信小程序框架提供的全局函数。

## 项目结构说明

```
wechat-miniware-example/
├── app.js              # 小程序应用实例（不能在 Node.js 中运行）
├── app.json            # 全局配置
├── app.wxss            # 全局样式
├── pages/              # 页面目录
│   ├── index/         # 首页
│   ├── login/         # 登录页
│   └── ...            # 其他页面
├── project.config.json # 项目配置
└── utils/             # 工具模块
```

## 辅助检查脚本

项目根目录提供了 `run-dev.js` 检查脚本（需要安装 chalk 依赖）：

```bash
npm install chalk
node run-dev.js
```

这个脚本会检查运行环境并给出提示。

## 技术支持

如果仍然遇到问题：
1. 确保微信开发者工具是最新版本
2. 检查基础库版本（建议使用 2.19.4 或更高）
3. 清除开发者工具缓存：`工具` > `清除缓存` > `全部清除`