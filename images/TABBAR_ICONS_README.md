# TabBar 图标说明

## 当前状态

TabBar 配置已暂时移除，因为图标文件缺失。

## 如何添加 TabBar

如果需要添加底部导航栏，请按以下步骤操作：

### 1. 准备图标文件

需要准备以下图标文件（建议尺寸：81px × 81px）：

- `images/home.png` - 首页图标（未选中状态）
- `images/home-active.png` - 首页图标（选中状态）
- `images/user.png` - 用户图标（未选中状态）
- `images/user-active.png` - 用户图标（选中状态）

### 2. 图标要求

- **尺寸**: 建议 81px × 81px（小程序会自动缩放）
- **格式**: PNG 格式，支持透明背景
- **颜色**: 未选中状态建议使用灰色，选中状态使用主题色
- **样式**: 简洁明了，符合小程序设计规范

### 3. 恢复 TabBar 配置

在 `app.json` 中添加以下配置：

```json
{
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#4A90E2",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/profile/profile",
        "iconPath": "images/user.png",
        "selectedIconPath": "images/user-active.png",
        "text": "我的"
      }
    ]
  }
}
```

### 4. 图标资源获取

你可以：
- 使用图标库（如 iconfont、Font Awesome）
- 使用设计工具（如 Figma、Sketch）创建
- 使用在线图标生成器
- 从微信小程序官方示例中获取

### 5. 临时方案

如果暂时不需要 TabBar，可以：
- 通过九宫格首页访问所有功能
- 在页面中添加返回首页的按钮
- 使用导航栏返回功能

---

**注意**: 当前项目已移除 TabBar 配置，所有功能都可以通过九宫格首页访问。
