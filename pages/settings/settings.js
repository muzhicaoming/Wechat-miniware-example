// pages/settings/settings.js
const storage = require('../../utils/storage.js')

const SETTINGS_KEY = 'appSettings'

Page({
  data: {
    settings: {
      theme: 'light',
      notifications: true,
      autoSave: true
    }
  },

  onLoad() {
    this.loadSettings()
  },

  /**
   * 加载设置
   */
  loadSettings() {
    const settings = storage.get(SETTINGS_KEY, this.data.settings)
    this.setData({
      settings
    })
  },

  /**
   * 切换主题
   */
  toggleTheme() {
    const { settings } = this.data
    settings.theme = settings.theme === 'light' ? 'dark' : 'light'
    this.saveSettings()
    
    wx.showToast({
      title: `已切换至${settings.theme === 'light' ? '浅色' : '深色'}主题`,
      icon: 'success'
    })
  },

  /**
   * 切换通知
   */
  toggleNotifications() {
    const { settings } = this.data
    settings.notifications = !settings.notifications
    this.saveSettings()
  },

  /**
   * 切换自动保存
   */
  toggleAutoSave() {
    const { settings } = this.data
    settings.autoSave = !settings.autoSave
    this.saveSettings()
  },

  /**
   * 保存设置
   */
  saveSettings() {
    storage.set(SETTINGS_KEY, this.data.settings)
    this.setData({
      settings: this.data.settings
    })
  },

  /**
   * 清除所有数据
   */
  clearAllData() {
    wx.showModal({
      title: '确认清除',
      content: '此操作将清除所有本地数据，包括登录信息、待办事项、备忘录等，且无法恢复。确定要继续吗？',
      success: (res) => {
        if (res.confirm) {
          storage.clear()
          
          // 重置设置
          this.setData({
            settings: {
              theme: 'light',
              notifications: true,
              autoSave: true
            }
          })
          
          wx.showToast({
            title: '已清除所有数据',
            icon: 'success',
            duration: 2000
          })
          
          // 延迟跳转到首页，确保数据清除完成
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index',
              success: () => {
                wx.showToast({
                  title: '请刷新页面查看',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          }, 2000)
        }
      }
    })
  }
})
