// pages/about/about.js
Page({
  data: {
    appInfo: {
      name: '小程序示例',
      version: '1.0.0',
      description: '这是一个纯前端微信小程序示例项目，展示了9个常用功能模块。',
      features: [
        '用户登录（本地存储）',
        '用户信息浏览',
        '待办事项管理',
        '备忘录功能',
        '计算器工具',
        '天气查询（模拟）',
        '应用设置',
        '关于页面',
        '帮助文档'
      ]
    }
  },

  onLoad() {
    console.log('关于页面加载')
  }
})
