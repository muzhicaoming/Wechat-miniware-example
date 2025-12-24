/**
 * pages/profile/profile.js
 * 用户信息页面
 * 
 * 功能：
 * 1. 显示当前登录用户的详细信息
 * 2. 优先使用本地缓存的头像，失败时回退到网络头像
 * 3. 显示登录时间、地理位置等信息
 * 4. 支持跳转到登录页面
 */

const auth = require('../../utils/auth.js')
const avatar = require('../../utils/avatar.js')
const storage = require('../../utils/storage.js')

Page({
  /**
   * 页面数据
   */
  data: {
    userInfo: null,          // 当前登录用户信息
    isLoggedIn: false,       // 是否已登录
    currentAvatar: '',       // 当前显示的头像（优先本地缓存，其次网络URL，最后默认头像）
    loginTime: ''            // 登录时间（格式化后的字符串）
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    this.loadUserInfo()
  },

  /**
   * 页面显示时触发（每次显示都会触发）
   * 确保显示最新的用户信息
   */
  onShow() {
    this.loadUserInfo()
  },

  /**
   * 加载用户信息（包含头像缓存检查）
   */
  loadUserInfo() {
    console.log('=== 开始加载用户信息 ===')
    const isLoggedIn = auth.isLoggedIn()
    const userInfo = auth.getUserInfo()

    console.log('登录状态:', isLoggedIn)
    console.log('用户信息:', userInfo)

    if (userInfo) {
      // 检查并处理头像路径
      this.checkAndUpdateAvatarPath(userInfo)
    }

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
   * 检查并更新头像路径（同时清理无效的本地路径）
   * 
   * 优先级：
   * 1. 本地缓存的头像路径（如果文件存在）
   * 2. 网络头像URL
   * 3. 默认头像
   * 
   * @param {Object} userInfo - 用户信息对象
   */
  checkAndUpdateAvatarPath(userInfo) {
    console.log('=== 检查头像路径 ===')

    if (userInfo.localAvatarPath) {
      console.log('检查本地头像文件:', userInfo.localAvatarPath)
      wx.getFileInfo({
        filePath: userInfo.localAvatarPath,
        success: (fileInfo) => {
          console.log('本地头像文件存在:', fileInfo)
          // 本地文件存在，使用本地路径
          const currentAvatar = userInfo.localAvatarPath
          this.setData({
            currentAvatar
          })
          console.log('使用本地头像:', currentAvatar)
        },
        fail: (err) => {
          console.log('本地头像文件不存在，清理:', err)
          // 本地文件不存在，清理存储的本地路径
          auth.updateUserInfo({
            ...userInfo,
            localAvatarPath: null
          })

          // 回退到网络URL
          const currentAvatar = userInfo.avatarUrl || '/images/default-avatar.png'
          this.setData({
            currentAvatar
          })
          console.log('使用网络头像:', currentAvatar)
        }
      })
    } else if (userInfo.avatarUrl) {
      console.log('使用网络头像:', userInfo.avatarUrl)
      const currentAvatar = userInfo.avatarUrl
      this.setData({
        currentAvatar
      })
    } else {
      console.log('使用默认头像')
      const currentAvatar = '/images/default-avatar.png'
      this.setData({
        currentAvatar
      })
    }
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
  },

  /**
   * 头像加载成功
   */
  onAvatarLoad(e) {
    console.log('头像加载成功:', e)
  },

  /**
   * 头像加载失败
   */
  onAvatarError(e) {
    console.error('头像加载失败:', e)
    const { userInfo } = this.data

    if (userInfo) {
      console.log('头像加载失败，回退到默认头像')
      // 加载失败，回退到默认头像
      const currentAvatar = '/images/default-avatar.png'
      this.setData({
        currentAvatar
      })
    }
  },

  /**
   * 点击头像执行的操作
   */
  onTapAvatar() {
    console.log('头像被点击')
  }
})
