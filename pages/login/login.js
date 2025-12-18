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
   * 通过 button 的 open-type="getUserProfile" 获取用户信息
   * 这种方式更可靠，是微信官方推荐的方式
   */
  onGetUserProfile(e) {
    console.log('onGetUserProfile:', e)
    
    if (e.detail.errMsg === 'getUserProfile:ok') {
      const { userInfo } = e.detail
      
      // 获取微信登录凭证
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            // 构建用户信息对象
            const userData = {
              nickName: userInfo.nickName || '微信用户',
              avatarUrl: userInfo.avatarUrl || '',
              gender: userInfo.gender || 0,
              country: userInfo.country || '',
              province: userInfo.province || '',
              city: userInfo.city || '',
              language: userInfo.language || 'zh_CN',
              code: loginRes.code, // 微信登录凭证
              openid: null // 纯前端应用，无法获取openid
            }

            // 保存用户信息
            if (auth.login(userData)) {
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
              })
              
              // 更新全局状态
              const app = getApp()
              if (app) {
                app.globalData.userInfo = userData
                app.globalData.isLoggedIn = true
              }

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
                title: '保存登录信息失败',
                icon: 'none',
                duration: 2000
              })
            }
          } else {
            wx.showToast({
              title: '获取登录凭证失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: (err) => {
          console.error('wx.login 失败:', err)
          wx.showToast({
            title: '获取登录凭证失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    } else {
      // 用户拒绝授权或其他错误
      const errMsg = e.detail.errMsg || '获取用户信息失败'
      console.error('getUserProfile 失败:', errMsg)
      
      if (errMsg.includes('deny') || errMsg.includes('cancel')) {
        wx.showToast({
          title: '需要授权才能登录',
          icon: 'none',
          duration: 2000
        })
      } else {
        // 显示详细错误信息用于调试
        wx.showToast({
          title: errMsg.length > 15 ? '获取用户信息失败' : errMsg,
          icon: 'none',
          duration: 3000
        })
      }
    }
  },

  /**
   * 微信登录（保留作为备用方案）
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
   * 获取用户信息（备用方案）
   */
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res
        
        // 获取微信登录凭证
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              // 构建用户信息对象
              const userData = {
                nickName: userInfo.nickName || '微信用户',
                avatarUrl: userInfo.avatarUrl || '',
                gender: userInfo.gender || 0,
                country: userInfo.country || '',
                province: userInfo.province || '',
                city: userInfo.city || '',
                language: userInfo.language || 'zh_CN',
                code: loginRes.code,
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
                  title: '登录失败',
                  icon: 'none'
                })
              }
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
