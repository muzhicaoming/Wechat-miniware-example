/**
 * pages/index/index.js
 * 九宫格主页面
 * 展示所有功能入口，用户点击后跳转到对应页面
 */

Page({
  /**
   * 页面数据
   */
  data: {
    /**
     * 九宫格功能列表
     * 每个功能项包含：id、名称、图标、跳转路径、主题色
     */
    functions: [
      {
        id: 1,
        name: '微信登录',
        icon: '💬',
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

  /**
   * 页面加载时触发（只触发一次）
   */
  onLoad() {
    console.log('首页加载')
  },

  /**
   * 页面显示时触发（每次显示都会触发）
   * 用于刷新登录状态，确保显示最新的登录信息
   */
  onShow() {
    // 每次显示页面时刷新登录状态
    const auth = require('../../utils/auth.js')
    const isLoggedIn = auth.isLoggedIn()
    this.setData({
      isLoggedIn
    })
  },

  /**
   * 点击功能项，跳转到对应页面
   * @param {Object} e - 事件对象
   * @param {Object} e.currentTarget.dataset - 数据集合
   * @param {String} e.currentTarget.dataset.path - 目标页面路径
   */
  onFunctionTap(e) {
    const { path } = e.currentTarget.dataset
    if (path) {
      // 使用 navigateTo 跳转，保留当前页面在页面栈中
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
