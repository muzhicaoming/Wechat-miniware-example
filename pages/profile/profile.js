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
    
    let loginTime = ''
    if (userInfo && userInfo.loginTime) {
      loginTime = new Date(userInfo.loginTime).toLocaleString('zh-CN')
    }
    
    this.setData({
      isLoggedIn,
      userInfo: userInfo || {
        username: '未登录',
        nickname: '游客',
        avatar: ''
      },
      loginTime
    })
  },

  /**
   * 编辑用户信息
   */
  handleEdit() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    wx.showModal({
      title: '编辑昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          const updated = auth.updateUserInfo({
            nickname: res.content
          })
          
          if (updated) {
            wx.showToast({
              title: '更新成功',
              icon: 'success'
            })
            this.loadUserInfo()
          } else {
            wx.showToast({
              title: '更新失败',
              icon: 'none'
            })
          }
        }
      }
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
