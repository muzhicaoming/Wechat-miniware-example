// pages/login/login.js
const auth = require('../../utils/auth.js')
const avatar = require('../../utils/avatar.js')

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
   * 微信一键登录：在点击事件中直接调用 wx.getUserProfile（官方推荐用法）
   */
  handleWechatLogin() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res
        
        // 获取微信登录凭证
        wx.login({
          success: (loginRes) => {
            if (!loginRes.code) {
              wx.showToast({
                title: '获取登录凭证失败',
                icon: 'none'
              })
              return
            }
            
            // 先下载并缓存头像
            const originalAvatarUrl = userInfo.avatarUrl || ''
            
            if (originalAvatarUrl) {
              // 下载并缓存头像
              avatar.downloadAndCacheAvatar(originalAvatarUrl)
                .then((localAvatarPath) => {
                  // 头像下载成功，保存用户信息（包含本地头像路径）
                  this.saveUserInfo(userInfo, loginRes.code, originalAvatarUrl, localAvatarPath)
                })
                .catch((err) => {
                  console.error('下载头像失败:', err)
                  // 即使头像下载失败，也保存用户信息（使用原始URL）
                  this.saveUserInfo(userInfo, loginRes.code, originalAvatarUrl, null)
                })
            } else {
              // 没有头像URL，直接保存用户信息
              this.saveUserInfo(userInfo, loginRes.code, '', null)
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
        if (err.errMsg && err.errMsg.includes('deny')) {
          wx.showToast({
            title: '需要授权才能登录',
            icon: 'none'
          })
        } else {
          // 显示详细错误信息
          const errMsg = err.errMsg || '获取用户信息失败'
          wx.showToast({
            title: errMsg.length > 15 ? '获取用户信息失败' : errMsg,
            icon: 'none',
            duration: 3000
          })
        }
      }
    })
  },

  /**
   * 保存用户信息
   * @param {object} userInfo - 微信返回的用户信息
   * @param {string} code - 微信登录凭证
   * @param {string} originalAvatarUrl - 原始头像URL
   * @param {string|null} localAvatarPath - 本地缓存的头像路径
   */
  saveUserInfo(userInfo, code, originalAvatarUrl, localAvatarPath) {
    // 构建用户信息对象
    const userData = {
      nickName: userInfo.nickName || '微信用户',
      avatarUrl: originalAvatarUrl, // 保留原始URL
      localAvatarPath: localAvatarPath || null, // 本地缓存路径
      gender: userInfo.gender || 0,
      country: userInfo.country || '',
      province: userInfo.province || '',
      city: userInfo.city || '',
      language: userInfo.language || 'zh_CN',
      code: code,
      openid: null
    }
    
    // 保存用户信息
    if (auth.login(userData)) {
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      const app = getApp()
      if (app) {
        app.globalData.userInfo = userData
        app.globalData.isLoggedIn = true
      }
      
      this.setData({
        isLoggedIn: true,
        userInfo: userData
      })
      
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      wx.showToast({
        title: '保存登录信息失败',
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
            if (app) {
              app.globalData.userInfo = null
              app.globalData.isLoggedIn = false
            }

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
