/**
 * pages/calculator/calculator.js
 * 计算器页面逻辑
 * 实现基本的四则运算、百分比、正负号切换等功能
 */

Page({
  /**
   * 页面数据
   */
  data: {
    display: '0',              // 当前显示的数字
    previousValue: null,        // 上一个操作数
    operator: null,            // 当前运算符（+、-、*、/）
    waitingForOperand: false   // 是否等待输入新的操作数
  },

  /**
   * 输入数字
   * @param {Object} e - 事件对象
   * @param {String} e.currentTarget.dataset.num - 点击的数字（0-9）
   */
  inputNumber(e) {
    const { num } = e.currentTarget.dataset
    const { display, waitingForOperand } = this.data
    
    if (waitingForOperand) {
      // 如果刚执行完运算，输入新数字时替换显示
      this.setData({
        display: String(num),
        waitingForOperand: false
      })
    } else {
      // 正常输入：如果当前是0则替换，否则追加
      this.setData({
        display: display === '0' ? String(num) : display + num
      })
    }
  },

  /**
   * 输入小数点
   * 如果当前数字已包含小数点，则不重复添加
   */
  inputDot() {
    const { display, waitingForOperand } = this.data
    
    if (waitingForOperand) {
      // 刚执行完运算，输入小数点时从0.开始
      this.setData({
        display: '0.',
        waitingForOperand: false
      })
    } else if (display.indexOf('.') === -1) {
      // 当前数字没有小数点，添加小数点
      this.setData({
        display: display + '.'
      })
    }
    // 如果已有小数点，不做任何操作
  },

  /**
   * 清除所有数据（AC - All Clear）
   * 重置计算器到初始状态
   */
  clear() {
    this.setData({
      display: '0',
      previousValue: null,      // 清空上一个操作数
      operator: null,          // 清空运算符
      waitingForOperand: false // 重置等待状态
    })
  },

  /**
   * 切换正负号（±按钮）
   * 将当前显示的数字取反
   */
  toggleSign() {
    const { display } = this.data
    const value = parseFloat(display)
    this.setData({
      display: String(-value)
    })
  },

  /**
   * 百分比计算（%按钮）
   * 将当前数字除以100，例如：50 → 0.5
   */
  percent() {
    const { display } = this.data
    const value = parseFloat(display)
    this.setData({
      display: String(value / 100)
    })
  },

  /**
   * 切换正负号（+/-按钮，与toggleSign功能相同）
   * 将当前显示的数字取反，0保持不变
   */
  togglePosNeg() {
    const { display } = this.data
    const value = parseFloat(display)

    if (!isNaN(value)) {
      // 如果是0，保持原样；否则取反
      this.setData({
        display: value === 0 ? display : String(-value)
      })
    }
  },

  /**
   * 执行运算（点击运算符按钮时触发）
   * @param {Object} e - 事件对象
   * @param {String} e.currentTarget.dataset.op - 运算符（+、-、*、/）
   */
  performOperation(e) {
    const { op } = e.currentTarget.dataset
    const { display, previousValue, operator } = this.data
    const inputValue = parseFloat(display)
    
    if (previousValue === null) {
      // 第一次输入运算符，保存当前值作为第一个操作数
      this.setData({
        previousValue: inputValue
      })
    } else if (operator) {
      // 已有运算符，先执行上一次运算，再保存新的运算符
      const currentValue = previousValue || 0
      const newValue = this.calculate(currentValue, inputValue, operator)
      
      this.setData({
        display: String(newValue),
        previousValue: newValue  // 运算结果作为新的第一个操作数
      })
    }
    
    // 保存新的运算符，标记等待输入新的操作数
    this.setData({
      waitingForOperand: true,
      operator: op
    })
  },

  /**
   * 执行具体的数学运算
   * @param {Number} prev - 第一个操作数
   * @param {Number} next - 第二个操作数
   * @param {String} op - 运算符（+、-、*、/、=）
   * @returns {Number} 运算结果
   */
  calculate(prev, next, op) {
    switch (op) {
      case '+':
        return prev + next
      case '-':
        return prev - next
      case '*':
        return prev * next
      case '/':
        // 除法需要检查除数是否为0
        if (next === 0) {
          wx.showToast({
            title: '不能除以零',
            icon: 'none',
            duration: 2000
          })
          // 除零时返回被除数，保持原值不变
          return prev
        }
        return prev / next
      case '=':
        // 等号运算符直接返回第二个操作数
        return next
      default:
        // 未知运算符，返回第二个操作数
        return next
    }
  },

  /**
   * 计算最终结果（点击等号按钮时触发）
   * 执行当前保存的运算，并清空运算符状态
   */
  calculateResult() {
    const { display, previousValue, operator } = this.data
    const inputValue = parseFloat(display)
    
    // 只有在有上一个操作数和运算符时才执行计算
    if (previousValue !== null && operator) {
      const newValue = this.calculate(previousValue, inputValue, operator)
      
      // 显示计算结果，并重置状态
      this.setData({
        display: String(newValue),
        previousValue: null,      // 清空操作数
        operator: null,           // 清空运算符
        waitingForOperand: true   // 标记等待新的输入
      })
    }
  }
})
