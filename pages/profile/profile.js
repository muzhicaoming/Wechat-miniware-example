// pages/profile/profile.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    isLoggedIn: false
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const isLoggedIn = auth.isLoggedIn()
    const userInfo = auth.getUserInfo()
    
    let loginTime = '未知'
    if (userInfo && userInfo.loginTime) {
      try {
        const date = new Date(userInfo.loginTime)
        if (!isNaN(date.getTime())) {
          loginTime = date.toLocaleString('zh-CN')
        }
      } catch (e) {
        console.error('登录时间格式化失败:', e)
      }
    }
    
    this.setData({
      isLoggedIn,
      userInfo: userInfo || {
        nickName: '未登录',
        avatarUrl: ''
      },
      loginTime
    })
  },

  /**
   * 编辑用户信息（微信登录后，昵称等信息由微信提供，暂不支持编辑）
   */
  handleEdit() {
    wx.showToast({
      title: '微信登录信息由微信提供，暂不支持编辑',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 跳转到登录页
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})
