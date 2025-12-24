/**
 * pages/login/login.js
 * 登录页面
 * 
 * 功能：
 * 1. 微信一键登录（使用 wx.getUserProfile）
 * 2. 自动下载并缓存用户头像
 * 3. 显示登录状态和用户信息
 * 4. 支持登出功能
 * 5. 头像加载失败时的容错处理
 */

const auth = require('../../utils/auth.js')
const avatar = require('../../utils/avatar.js')

Page({
  /**
   * 页面数据
   */
  data: {
    userInfo: null,              // 当前登录用户信息
    isLoggedIn: false,           // 是否已登录
    currentUserAvatar: '',       // 当前显示的用户头像（优先本地缓存，其次网络URL）
    bgAnimationData: {},         // 背景动画数据
    logoAnimationData: {}        // Logo点击动画数据
  },

  /**
   * 页面加载时触发（只触发一次）
   */
  onLoad() {
    // 创建背景动画
    this.createBgAnimation()
    // 检查登录状态
    this.checkLoginStatus()
  },

  /**
   * 页面显示时触发（每次显示都会触发）
   */
  onShow() {
    // 每次显示页面时检查登录状态，确保显示最新状态
    this.checkLoginStatus()
  },

  /**
   * 页面初次渲染完成时触发
   */
  onReady() {
    // 页面渲染完成后，播放背景动画
    this.playBgAnimation()
  },

  /**
   * 头像加载成功
   */
  avatarLoad(e) {
    console.log('头像加载成功:', e)
  },

  /**
   * 头像加载失败
   */
  avatarError(e) {
    console.error('头像加载失败:', e.detail)
    // 如果本地头像加载失败，回退到网络头像
    if (this.data.userInfo && this.data.userInfo.localAvatarPath) {
      console.log('本地头像加载失败，尝试使用网络头像')
      auth.updateUserInfo({
        localAvatarPath: null
      })
      // 更新界面显示
      this.checkLoginStatus()
    }
  },

  /**
   * 显示头像调试信息（带图片预览）
   */
  showAvatarDebug() {
    const userInfo = auth.getUserInfo()
    if (userInfo) {
      // 创建当前显示的头像预览
      const avatarToShow = userInfo.localAvatarPath || userInfo.avatarUrl

      // 使用图片预览方式显示完整的调试信息
      this.showAvatarPreviewModal(userInfo, avatarToShow)
    } else {
      wx.showModal({
        title: '头像调试信息',
        content: '当前未登录，无法获取头像信息',
        showCancel: false
      })
    }
  },

  /**
   * 显示带图片的头像调试模态框
   */
  showAvatarPreviewModal(userInfo, avatarImage) {
    // 显示头像加载成功的是本地还是网络
    const displayMode = userInfo.localAvatarPath ? '本地文件' : '网络头像'

    // 准备用于预览的图片列表
    const urls = []
    if (userInfo.localAvatarPath && userInfo.avatarUrl) {
      // 如果有本地头像，先显示本地，再显示网络
      urls.push(userInfo.localAvatarPath)
      urls.push(userInfo.avatarUrl)
    } else if (userInfo.avatarUrl) {
      // 只有网络头像
      urls.push(userInfo.avatarUrl)
    } else if (userInfo.localAvatarPath) {
      // 只有本地头像
      urls.push(userInfo.localAvatarPath)
    }

    if (urls.length > 0) {
      // 使用微信的图片预览功能来展示头像
      wx.previewImage({
        urls: urls,
        current: avatarImage,
        success: () => {
          wx.showToast({
            title: `当前${displayMode}`,
            icon: 'none',
            duration: 2000
          })
        },
        fail: () => {
          // 如果预览失败，显示选项菜单
        this.showAvatarRefreshOptions(userInfo)
        }
      })
    } else {
      wx.showModal({
        title: '头像调试信息',
        content: '没有找到头像URL\n\n请检查是否已授权头像权限',
        showCancel: false
      })
    }
  },

  /**
   * 刷新头像状态（在预览失败后调用）
   */
  async refreshAvatarStatus() {
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.avatarUrl) {
      // 先尝试清空空头像缓存
      avatar.clearAvatarCache(userInfo.avatarUrl)

      try {
        const localPath = await avatar.downloadAndCacheAvatar(userInfo.avatarUrl)
        auth.updateUserInfo({
          localAvatarPath: localPath
        })
        this.checkLoginStatus()

        wx.showToast({
          title: '头像缓存已更新',
          icon: 'success'
        })
      } catch (error) {
        console.error('刷新头像失败:', error)
        this.showAvatarRefreshOptions(userInfo)
      }
    } else {
      // 如果没有头像URL，提示用户获取新头像
      this.showAvatarRefreshOptions(userInfo)
    }
  },

  /**
   * 显示头像调试信息
   */
  showAvatarDebug() {
    const userInfo = auth.getUserInfo()
    if (userInfo) {
      wx.showModal({
        title: '头像调试信息',
        content: `头像URL: ${userInfo.avatarUrl || '无'}
本地路径: ${userInfo.localAvatarPath || '无'}

如果头像未显示，请检查：
1. 是否已授权头像权限
2. 头像URL是否有效
3. 本地文件是否存在`,
        showCancel: false
      })
    }
  },

  /**
   * 显示头像刷新选项菜单
   */
  showAvatarRefreshOptions(userInfo) {
    const options = [
      '清空头像缓存',
      '重新获取头像（获取新URL）',
      '刷新当前头像URL',
      '查看头像路径',
      '关闭'
    ]

    wx.showActionSheet({
      itemList: options,
      success: (event) => {
        const index = event.tapIndex
        const action = options[index]

        switch (action) {
          case '清空头像缓存':
            this.clearAllAvatarCaches()
            break
          case '重新获取头像（获取新URL）':
            this.resetAvatarAndGetNewOne()
            break
          case '刷新当前头像URL':
            this.refreshAvatarStatus()
            break
          case '查看头像路径':
            this.showCurrentAvatarPaths()
            break
          default:
            break
        }
      },
      fail: (e) => {
        // 用户点击了背景区域
      }
    })
  },

  /**
   * 显示当前头像路径详情
   */
  showCurrentAvatarPaths() {
    const userInfo = auth.getUserInfo()
    if (!userInfo) return

    const isLocal = !!userInfo.localAvatarPath
    const currentAvatar = userInfo.localAvatarPath || userInfo.avatarUrl
    const statusEmoji = isLocal ? '✅ 本地头像' : '🌐 网络头像'

    wx.showModal({
      title: '当前头像',
      content: '状态: ' + statusEmoji + '\n\n' +
               (isLocal ? '本地' : '网络') + '路径:\n' +
               currentAvatar + '\n\n' +
               '如需查看最新头像，请点击调试  > 重新获取头像。',
      showCancel: false
    })
  },

  /**
   * 清空头像缓存（包括所有的缓存）
   */
  clearAllAvatarCaches() {
    // 获取当前用户信息
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.avatarUrl) {
      // 只清除当前用户的头像缓存
      avatar.clearAvatarCache(userInfo.avatarUrl)
    }

    // 清除存储中的缓存映射
    const storage = require('../../utils/storage.js')
    storage.remove('avatarCache')

    // 更新用户信息，清除本地路径
    if (userInfo) {
      auth.updateUserInfo({
        localAvatarPath: null
      })

      this.checkLoginStatus()

      wx.showToast({
        title: '缓存已清空',
        icon: 'success'
      })
    }
  },

  /**
   * 预览本地头像（点击图片放大查看，显示详细信息）
   */
  previewLocalAvatar() {
    const userInfo = auth.getUserInfo()
    if (userInfo && userInfo.localAvatarPath) {
      wx.previewImage({
        urls: [userInfo.localAvatarPath],
        current: userInfo.localAvatarPath
      })
    }
  },

  /**
   * 预览头像加载错误处理
   */
  previewAvatarError(e) {
    console.error('预览头像加载失败:', e.detail)
    wx.showToast({
      title: '头像加载失败',
      icon: 'none'
    })
  },

  /**
   * 预览头像加载成功
   */
  previewAvatarLoad(e) {
    console.log('预览头像加载成功:', e)
    wx.showToast({
      title: '本地头像预览成功',
      icon: 'success',
      duration: 1000
    })
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const isLoggedIn = auth.isLoggedIn()
    const userInfo = auth.getUserInfo()

    console.log('检查登录状态:', {
      isLoggedIn,
      userInfo: userInfo ? {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        localAvatarPath: userInfo.localAvatarPath,
        hasLocalPath: !!userInfo.localAvatarPath,
        hasNetworkUrl: !!userInfo.avatarUrl
      } : null
    })

    // 尝试加载本地头像
    if (userInfo && userInfo.localAvatarPath) {
      wx.getFileInfo({
        filePath: userInfo.localAvatarPath,
        success: (fileInfo) => {
          console.log('本地头像文件存在:', fileInfo)
        },
        fail: (error) => {
          console.error('本地头像文件不存在:', error)
          // 文件不存在，更新用户数据，回退到网络地址
          auth.updateUserInfo({
            localAvatarPath: null
          })
        }
      })
    }

    // 更新头像显示（优先使用本地，其次是网络地址）
    const currentUserAvatar = userInfo ? (userInfo.localAvatarPath || userInfo.avatarUrl) : ''

    this.setData({
      isLoggedIn,
      userInfo: userInfo || null,
      currentUserAvatar
    })
  },

  /**
   * 创建背景动画（半透明 logo 浮动）
   */
  createBgAnimation() {
    this.bgAnimation = wx.createAnimation({
      delay: 0,
      duration: 4000,
      timingFunction: 'ease-in-out',
      repeatMode: 'loop'
    })
  },

  /**
   * 播放背景动画
   */
  playBgAnimation() {
    // 播放浮动动画效果
    this.bgAnimation.scale(1).rotate(0).step()
    this.bgAnimation.scale(1.05).rotate(5).translateY(-20).step({ duration: 2000 })
    this.bgAnimation.scale(1).rotate(0).translateY(0).step({ duration: 2000 })
    this.setData({
      bgAnimationData: this.bgAnimation.export()
    })
  },

  /**
   * Logo 点击反馈动画
   */
  handleLogoTap() {
    // Logo 点击反馈动画
    const logoAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-in-out'
    })
    // 缩放效果
    logoAnimation.scale(0.9).step({ duration: 100 })
    logoAnimation.scale(1.1).step({ duration: 100 })
    logoAnimation.scale(1).step({ duration: 100 })
    this.setData({
      logoAnimationData: logoAnimation.export()
    })

    // 震动反馈
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: 'light' })
    }
  },

  /**
   * 验证头像URL有效性（添加时间戳防止缓存）
   */
  validateAndFixAvatarUrl(avatarUrl) {
    if (!avatarUrl) {
      console.warn('头像URL为空')
      return null
    }

    // 完整的调试信息
    console.log('原始头像URL:', avatarUrl)
    console.log('URL长度:', avatarUrl.length)
    console.log('URL包含头像关键词:', avatarUrl.includes('avatar'))

    // 检查是否是默认头像
    const isDefaultAvatar = avatarUrl.includes('mmopen/vi_32/') ||
                           avatarUrl.includes('132132') ||
                          avatarUrl.includes('xxx') ||
                           avatarUrl.length < 50

    if (isDefaultAvatar) {
      console.warn('检测到默认头像:', avatarUrl)
      // 提示用户头像可能是默认的
      wx.showModal({
        title: '提示',
        content: '获取到的可能是默认头像，需要重新授权获取头像吗？',
        success: (res) => {
          if (res.confirm) {
            // 用户同意重新授权
            this.reAuthForAvatar()
          }
        }
      })
    }

    // 添加时间戳参数防止缓存
    const timestamp = Date.now()
    const separator = avatarUrl.includes('?') ? '&' : '?'
    const fixedUrl = avatarUrl + separator + 't=' + timestamp

    console.log('修复后的头像URL:', fixedUrl)
    return fixedUrl
  },

  /**
   * 重新授权获取头像信息
   */
  reAuthForAvatar() {
    // 重新调用微信头像授权
    wx.getUserProfile({
      desc: '获取真实头像信息',
      success: (res) => {
        const newUserInfo = res.userInfo
        console.log('重新获取的用户信息:', newUserInfo)

        // 保存新的头像URL
        if (auth.isLoggedIn()) {
          auth.updateUserInfo({
            avatarUrl: newUserInfo.avatarUrl,
            localAvatarPath: null // 清除本地缓存
          })

          // 清除老的头像缓存
          avatar.clearAvatarCache(this.data.userInfo?.avatarUrl)

          // 重新下载头像
          avatar.downloadAndCacheAvatar(newUserInfo.avatarUrl)
            .then(localPath => {
              auth.updateUserInfo({
                localAvatarPath: localPath
              })
              this.checkLoginStatus()
              wx.showToast({
                title: '头像更新成功',
                icon: 'success'
              })
            })
            .catch(err => {
              console.error('头像缓存失败:', err)
              this.checkLoginStatus()
            })
        }
      },
      fail: (err) => {
        console.error('重新授权失败:', err)
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        })
      }
    })
  },
  handleWechatLogin() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res

        // 验证头像URL
        const originalAvatarUrl = userInfo.avatarUrl || ''
        const isValidAvatar = originalAvatarUrl && (
          originalAvatarUrl.includes('.jpg') ||
          originalAvatarUrl.includes('.png') ||
          originalAvatarUrl.includes('.jpeg') ||
          originalAvatarUrl.includes('qlogo.cn') ||
          originalAvatarUrl.includes('mmopen')
        )

        if (!isValidAvatar) {
          console.warn('获取到的头像URL可能无效:', originalAvatarUrl)
          wx.showModal({
            title: '提示',
            content: '获取头像失败，将使用默认头像。是否重新尝试获取？',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 用户选择重试
                return
              }
              // 继续流程，但使用空头像
              this.continueLoginFlow(userInfo, '')
            }
          })
          return
        }

        // 继续正常登录流程
        this.continueLoginFlow(userInfo, originalAvatarUrl)
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
   * 继续登录流程
   */
  continueLoginFlow(userInfo, originalAvatarUrl) {
    // 修复头像URL并验证
    const fixedAvatarUrl = this.validateAndFixAvatarUrl(originalAvatarUrl)

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

        if (fixedAvatarUrl) {
          // 下载并缓存头像
          avatar.downloadAndCacheAvatar(fixedAvatarUrl)
            .then((localAvatarPath) => {
              console.log('头像下载成功，本地路径:', localAvatarPath)
              // 如果返回空字符串，表示下载失败但可以使用网络头像
              if (localAvatarPath === '') {
                // 仅保存用户信息，不设置本地路径
                this.saveUserInfo(userInfo, loginRes.code, fixedAvatarUrl, null)
              } else {
                // 头像下载成功，保存用户信息（包含本地头像路径）
                this.saveUserInfo(userInfo, loginRes.code, fixedAvatarUrl, localAvatarPath)
              }
            })
            .catch((err) => {
              console.error('下载头像失败:', err)
              wx.showToast({
                title: '头像下载失败，使用网络头像',
                icon: 'none',
                duration: 2000
              })
              // 即使头像下载失败，也保存用户信息（使用原始URL）
              this.saveUserInfo(userInfo, loginRes.code, fixedAvatarUrl, null)
            })
        } else {
          console.warn('没有获取到头像URL')
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
    
    console.log('保存用户信息:', {
      nickName: userData.nickName,
      avatarUrl: userData.avatarUrl,
      localAvatarPath: userData.localAvatarPath
    })
    
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
      
      console.log('用户信息已保存，当前头像路径:', userData.localAvatarPath || userData.avatarUrl)
      
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
