/**
 * app.js
 * 小程序全局应用逻辑
 * 负责应用初始化、全局数据管理
 */

App({
  /**
   * 小程序启动时触发
   * 只触发一次，用于初始化应用
   */
  onLaunch() {
    console.log('小程序启动')
    
    // 从本地存储恢复登录状态
    const storage = require('./utils/storage.js')
    const userInfo = storage.get('userInfo')
    if (userInfo) {
      // 恢复用户信息和登录状态到全局数据
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },
  
  /**
   * 全局数据对象
   * 可以在所有页面通过 getApp().globalData 访问
   */
  globalData: {
    userInfo: null,      // 当前登录用户信息
    isLoggedIn: false   // 是否已登录
  }
})
