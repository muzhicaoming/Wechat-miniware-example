// pages/login/login.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    username: '',
    password: '',
    nickname: ''
  },

  onLoad() {
    // 如果已登录，显示用户信息
    if (auth.isLoggedIn()) {
      const userInfo = auth.getUserInfo()
      this.setData({
        username: userInfo.username || '',
        nickname: userInfo.nickname || ''
      })
    }
  },

  /**
   * 输入用户名
   */
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  /**
   * 输入密码
   */
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  /**
   * 输入昵称
   */
  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    })
  },

  /**
   * 登录
   */
  handleLogin() {
    const { username, password, nickname } = this.data

    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      })
      return
    }

    // 模拟登录（纯前端，不调用后端）
    const userInfo = {
      username,
      nickname: nickname || username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    }

    if (auth.login(userInfo)) {
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 更新全局状态
      const app = getApp()
      app.globalData.userInfo = userInfo
      app.globalData.isLoggedIn = true

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  },

  /**
   * 登出
   */
  handleLogout() {
    wx.showModal({
      title: '确认登出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          if (auth.logout()) {
            wx.showToast({
              title: '已登出',
              icon: 'success'
            })
            
            // 更新全局状态
            const app = getApp()
            app.globalData.userInfo = null
            app.globalData.isLoggedIn = false

            this.setData({
              username: '',
              password: '',
              nickname: ''
            })
          }
        }
      }
    })
  }
})
