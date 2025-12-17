// pages/weather/weather.js
// 模拟天气数据（纯前端，不调用真实API）

const weatherData = {
  '北京': { temp: 22, condition: '晴', humidity: 45, wind: '3级' },
  '上海': { temp: 25, condition: '多云', humidity: 60, wind: '2级' },
  '广州': { temp: 28, condition: '晴', humidity: 70, wind: '1级' },
  '深圳': { temp: 29, condition: '晴', humidity: 68, wind: '2级' },
  '杭州': { temp: 24, condition: '小雨', humidity: 75, wind: '3级' }
}

Page({
  data: {
    city: '北京',
    cityList: ['北京', '上海', '广州', '深圳', '杭州'],
    weather: null,
    inputCity: ''
  },

  onLoad() {
    this.loadWeather()
  },

  /**
   * 加载天气信息
   */
  loadWeather() {
    const weather = weatherData[this.data.city] || weatherData['北京']
    this.setData({
      weather
    })
  },

  /**
   * 选择城市
   */
  selectCity(e) {
    const city = e.currentTarget.dataset.city
    this.setData({
      city
    })
    this.loadWeather()
  },

  /**
   * 输入城市
   */
  onCityInput(e) {
    this.setData({
      inputCity: e.detail.value
    })
  },

  /**
   * 查询天气
   */
  queryWeather() {
    const { inputCity } = this.data
    
    if (!inputCity || !inputCity.trim()) {
      wx.showToast({
        title: '请输入城市名称',
        icon: 'none'
      })
      return
    }

    // 显示加载状态
    wx.showLoading({
      title: '查询中...',
      mask: true
    })

    // 模拟查询延迟（纯前端）
    setTimeout(() => {
      const weather = weatherData[inputCity] || {
        temp: Math.floor(Math.random() * 15) + 20,
        condition: ['晴', '多云', '小雨'][Math.floor(Math.random() * 3)],
        humidity: Math.floor(Math.random() * 30) + 50,
        wind: Math.floor(Math.random() * 3) + 1 + '级'
      }

      this.setData({
        city: inputCity,
        weather,
        inputCity: ''
      })

      // 隐藏加载状态
      wx.hideLoading()

      wx.showToast({
        title: '查询成功',
        icon: 'success'
      })
    }, 500) // 模拟网络延迟
  }
})
