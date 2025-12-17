// app.js
App({
  onLaunch() {
    // 初始化应用
    console.log('小程序启动')
    
    // 检查登录状态
    const storage = require('./utils/storage.js')
    const userInfo = storage.get('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },
  
  globalData: {
    userInfo: null,
    isLoggedIn: false
  }
})
