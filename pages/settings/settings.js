/**
 * pages/settings/settings.js
 * 设置页面
 * 管理应用设置（主题、通知、自动保存等）和数据清理
 */

const storage = require('../../utils/storage.js')

// 本地存储的键名
const SETTINGS_KEY = 'appSettings'

Page({
  /**
   * 页面数据
   */
  data: {
    /**
     * 应用设置对象
     */
    settings: {
      theme: 'light',          // 主题：light（浅色）/ dark（深色）
      notifications: true,     // 是否开启通知
      autoSave: true          // 是否自动保存
    }
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    this.loadSettings()
  },

  /**
   * 从本地存储加载设置
   * 如果本地没有设置，使用默认值
   */
  loadSettings() {
    const settings = storage.get(SETTINGS_KEY, this.data.settings)
    this.setData({
      settings
    })
  },

  /**
   * 切换主题（浅色/深色）
   */
  toggleTheme() {
    const { settings } = this.data
    // 在浅色和深色之间切换
    settings.theme = settings.theme === 'light' ? 'dark' : 'light'
    this.saveSettings()
    
    wx.showToast({
      title: `已切换至${settings.theme === 'light' ? '浅色' : '深色'}主题`,
      icon: 'success'
    })
  },

  /**
   * 切换通知开关
   */
  toggleNotifications() {
    const { settings } = this.data
    settings.notifications = !settings.notifications
    this.saveSettings()
  },

  /**
   * 切换自动保存开关
   */
  toggleAutoSave() {
    const { settings } = this.data
    settings.autoSave = !settings.autoSave
    this.saveSettings()
  },

  /**
   * 保存设置到本地存储
   */
  saveSettings() {
    storage.set(SETTINGS_KEY, this.data.settings)
    this.setData({
      settings: this.data.settings
    })
  },

  /**
   * 清除所有本地数据
   * 包括：登录信息、待办事项、备忘录、设置等
   * 操作不可恢复，需要用户确认
   */
  clearAllData() {
    wx.showModal({
      title: '确认清除',
      content: '此操作将清除所有本地数据，包括登录信息、待办事项、备忘录等，且无法恢复。确定要继续吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空所有本地存储
          storage.clear()
          
          // 重置设置为默认值
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
          // 使用 reLaunch 关闭所有页面，打开首页
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
