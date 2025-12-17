// pages/login/login.js
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    isLoggedIn: false
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus()
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLoggedIn = auth.isLoggedIn()
    const userInfo = auth.getUserInfo()
    
    this.setData({
      isLoggedIn,
      userInfo: userInfo || null
    })
  },

  /**
   * 微信登录
   */
  handleWechatLogin() {
    // 先调用 wx.login 获取 code
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取用户信息需要用户授权
          this.getUserProfile()
        } else {
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('wx.login 失败:', err)
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 获取用户信息
   */
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res
        
        // 获取微信登录凭证
        wx.login({
          success: (loginRes) => {
            // 构建用户信息对象
            const userData = {
              nickName: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl,
              gender: userInfo.gender,
              country: userInfo.country,
              province: userInfo.province,
              city: userInfo.city,
              language: userInfo.language,
              code: loginRes.code, // 微信登录凭证
              openid: null // 纯前端应用，无法获取openid
            }

            // 保存用户信息
            if (auth.login(userData)) {
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })
              
              // 更新全局状态
              const app = getApp()
              app.globalData.userInfo = userData
              app.globalData.isLoggedIn = true

              // 更新页面数据
              this.setData({
                isLoggedIn: true,
                userInfo: userData
              })

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
          fail: (err) => {
            console.error('获取登录凭证失败:', err)
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            })
          }
        })
      },
      fail: (err) => {
        console.error('getUserProfile 失败:', err)
        if (err.errMsg.includes('deny')) {
          wx.showToast({
            title: '需要授权才能登录',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
        }
      }
    })
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

            // 更新页面数据
            this.setData({
              isLoggedIn: false,
              userInfo: null
            })
          }
        }
      }
    })
  }
})
