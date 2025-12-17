// pages/index/index.js
// 九宫格主页面

Page({
  data: {
    // 九宫格功能列表
    functions: [
      {
        id: 1,
        name: '用户登录',
        icon: '👤',
        path: '/pages/login/login',
        color: '#4A90E2'
      },
      {
        id: 2,
        name: '用户信息',
        icon: '📋',
        path: '/pages/profile/profile',
        color: '#50C878'
      },
      {
        id: 3,
        name: '待办事项',
        icon: '✅',
        path: '/pages/todo/todo',
        color: '#FF6B6B'
      },
      {
        id: 4,
        name: '备忘录',
        icon: '📝',
        path: '/pages/memo/memo',
        color: '#FFD93D'
      },
      {
        id: 5,
        name: '计算器',
        icon: '🔢',
        path: '/pages/calculator/calculator',
        color: '#9B59B6'
      },
      {
        id: 6,
        name: '天气查询',
        icon: '🌤️',
        path: '/pages/weather/weather',
        color: '#3498DB'
      },
      {
        id: 7,
        name: '设置',
        icon: '⚙️',
        path: '/pages/settings/settings',
        color: '#95A5A6'
      },
      {
        id: 8,
        name: '关于',
        icon: 'ℹ️',
        path: '/pages/about/about',
        color: '#E67E22'
      },
      {
        id: 9,
        name: '帮助',
        icon: '❓',
        path: '/pages/help/help',
        color: '#1ABC9C'
      }
    ]
  },

  onLoad() {
    console.log('首页加载')
  },

  onShow() {
    // 每次显示页面时刷新登录状态
    const auth = require('../../utils/auth.js')
    const isLoggedIn = auth.isLoggedIn()
    this.setData({
      isLoggedIn
    })
  },

  /**
   * 点击功能项
   */
  onFunctionTap(e) {
    const { path } = e.currentTarget.dataset
    if (path) {
      wx.navigateTo({
        url: path,
        fail: (err) => {
          console.error('导航失败:', err)
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    }
  }
})
