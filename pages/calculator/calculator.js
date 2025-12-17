// pages/calculator/calculator.js
Page({
  data: {
    display: '0',
    previousValue: null,
    operator: null,
    waitingForOperand: false
  },

  /**
   * 输入数字
   */
  inputNumber(e) {
    const { num } = e.currentTarget.dataset
    const { display, waitingForOperand } = this.data
    
    if (waitingForOperand) {
      this.setData({
        display: String(num),
        waitingForOperand: false
      })
    } else {
      this.setData({
        display: display === '0' ? String(num) : display + num
      })
    }
  },

  /**
   * 输入小数点
   */
  inputDot() {
    const { display, waitingForOperand } = this.data
    
    if (waitingForOperand) {
      this.setData({
        display: '0.',
        waitingForOperand: false
      })
    } else if (display.indexOf('.') === -1) {
      this.setData({
        display: display + '.'
      })
    }
  },

  /**
   * 清除
   */
  clear() {
    this.setData({
      display: '0',
      previousValue: null,
      operator: null,
      waitingForOperand: false
    })
  },

  /**
   * 执行运算
   */
  performOperation(e) {
    const { op } = e.currentTarget.dataset
    const { display, previousValue, operator } = this.data
    const inputValue = parseFloat(display)
    
    if (previousValue === null) {
      this.setData({
        previousValue: inputValue
      })
    } else if (operator) {
      const currentValue = previousValue || 0
      const newValue = this.calculate(currentValue, inputValue, operator)
      
      this.setData({
        display: String(newValue),
        previousValue: newValue
      })
    }
    
    this.setData({
      waitingForOperand: true,
      operator: op
    })
  },

  /**
   * 计算
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
        return next !== 0 ? prev / next : 0
      case '=':
        return next
      default:
        return next
    }
  },

  /**
   * 等于
   */
  calculateResult() {
    const { display, previousValue, operator } = this.data
    const inputValue = parseFloat(display)
    
    if (previousValue !== null && operator) {
      const newValue = this.calculate(previousValue, inputValue, operator)
      
      this.setData({
        display: String(newValue),
        previousValue: null,
        operator: null,
        waitingForOperand: true
      })
    }
  }
})
