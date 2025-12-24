/**
 * pages/weather/weather.js
 * 天气查询页面
 * 注意：当前为模拟数据（纯前端），不调用真实API
 * 如需接入真实天气API，可替换 queryWeather 方法中的逻辑
 */

/**
 * 模拟天气数据
 * 格式：{ 城市名: { 温度, 天气状况, 湿度, 风力 } }
 */
const weatherData = {
  '北京': { temp: 22, condition: '晴', humidity: 45, wind: '3级' },
  '上海': { temp: 25, condition: '多云', humidity: 60, wind: '2级' },
  '广州': { temp: 28, condition: '晴', humidity: 70, wind: '1级' },
  '深圳': { temp: 29, condition: '晴', humidity: 68, wind: '2级' },
  '杭州': { temp: 24, condition: '小雨', humidity: 75, wind: '3级' }
}

Page({
  /**
   * 页面数据
   */
  data: {
    city: '北京',                              // 当前选中的城市
    cityList: ['北京', '上海', '广州', '深圳', '杭州'],  // 预设城市列表
    weather: null,                             // 当前城市的天气信息
    inputCity: ''                              // 输入框中的城市名称
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    this.loadWeather()
  },

  /**
   * 加载当前城市的天气信息
   * 如果城市不在预设数据中，默认显示北京的天气
   */
  loadWeather() {
    const weather = weatherData[this.data.city] || weatherData['北京']
    this.setData({
      weather
    })
  },

  /**
   * 从预设城市列表中选择城市
   * @param {Object} e - 事件对象
   * @param {String} e.currentTarget.dataset.city - 选中的城市名称
   */
  selectCity(e) {
    const city = e.currentTarget.dataset.city
    this.setData({
      city
    })
    // 切换城市后重新加载天气
    this.loadWeather()
  },

  /**
   * 城市输入框内容变化
   * @param {Object} e - 事件对象
   * @param {String} e.detail.value - 输入的城市名称
   */
  onCityInput(e) {
    this.setData({
      inputCity: e.detail.value
    })
  },

  /**
   * 查询指定城市的天气
   * 如果城市在预设数据中，使用预设数据；否则生成随机模拟数据
   * 注意：这是模拟实现，实际应用中应调用真实天气API
   */
  queryWeather() {
    const { inputCity } = this.data
    
    // 验证输入不能为空
    if (!inputCity || !inputCity.trim()) {
      wx.showToast({
        title: '请输入城市名称',
        icon: 'none'
      })
      return
    }

    // 显示加载状态，提升用户体验
    wx.showLoading({
      title: '查询中...',
      mask: true  // 显示遮罩，防止用户操作
    })

    // 模拟查询延迟（实际应用中这里应该调用天气API）
    setTimeout(() => {
      // 优先使用预设数据，如果没有则生成随机模拟数据
      const weather = weatherData[inputCity] || {
        temp: Math.floor(Math.random() * 15) + 20,  // 温度：20-35度
        condition: ['晴', '多云', '小雨'][Math.floor(Math.random() * 3)],  // 随机天气状况
        humidity: Math.floor(Math.random() * 30) + 50,  // 湿度：50-80%
        wind: Math.floor(Math.random() * 3) + 1 + '级'   // 风力：1-3级
      }

      // 更新页面数据
      this.setData({
        city: inputCity,
        weather,
        inputCity: ''  // 清空输入框
      })

      // 隐藏加载状态
      wx.hideLoading()

      wx.showToast({
        title: '查询成功',
        icon: 'success'
      })
    }, 500) // 模拟500ms的网络延迟
  }
})
