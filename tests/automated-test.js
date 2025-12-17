// tests/automated-test.js
// 自动化测试脚本 - 用于微信开发者工具控制台执行

/**
 * 自动化测试工具
 * 使用方法：在微信开发者工具的控制台中执行此脚本
 */

class MiniProgramTester {
  constructor() {
    this.results = []
    this.currentPage = null
  }

  /**
   * 记录测试结果
   */
  logResult(testName, passed, message = '') {
    const result = {
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    }
    this.results.push(result)
    const icon = passed ? '✅' : '❌'
    console.log(`${icon} ${testName}: ${passed ? 'PASS' : 'FAIL'} ${message}`)
    return result
  }

  /**
   * 等待函数
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 导航到指定页面
   */
  async navigateToPage(path) {
    try {
      wx.navigateTo({ url: path })
      await this.wait(500)
      this.logResult(`导航到 ${path}`, true)
      return true
    } catch (error) {
      this.logResult(`导航到 ${path}`, false, error.message)
      return false
    }
  }

  /**
   * 返回上一页
   */
  async navigateBack() {
    try {
      wx.navigateBack()
      await this.wait(500)
      return true
    } catch (error) {
      console.error('返回失败:', error)
      return false
    }
  }

  /**
   * 测试首页
   */
  async testIndexPage() {
    console.log('\n=== 测试首页 ===')
    
    // 检查页面元素
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    if (currentPage && currentPage.route === 'pages/index/index') {
      this.logResult('首页加载', true)
      
      // 检查九宫格数据
      const functions = currentPage.data.functions
      if (functions && functions.length === 9) {
        this.logResult('九宫格功能数量', true, `共${functions.length}个功能`)
      } else {
        this.logResult('九宫格功能数量', false, `期望9个，实际${functions ? functions.length : 0}个`)
      }
    } else {
      this.logResult('首页加载', false, '页面路由不正确')
    }
  }

  /**
   * 测试登录页面
   */
  async testLoginPage() {
    console.log('\n=== 测试登录页面 ===')
    
    await this.navigateToPage('/pages/login/login')
    await this.wait(1000)
    
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    if (currentPage && currentPage.route === 'pages/login/login') {
      this.logResult('登录页面加载', true)
      
      // 检查数据字段
      const hasUsername = 'username' in currentPage.data
      const hasPassword = 'password' in currentPage.data
      const hasNickname = 'nickname' in currentPage.data
      
      this.logResult('登录页面数据字段', hasUsername && hasPassword && hasNickname, 
        hasUsername && hasPassword && hasNickname ? '所有字段存在' : '缺少字段')
    }
    
    await this.navigateBack()
  }

  /**
   * 测试待办事项页面
   */
  async testTodoPage() {
    console.log('\n=== 测试待办事项页面 ===')
    
    await this.navigateToPage('/pages/todo/todo')
    await this.wait(1000)
    
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    if (currentPage && currentPage.route === 'pages/todo/todo') {
      this.logResult('待办事项页面加载', true)
      
      // 检查数据字段
      const hasTodoList = 'todoList' in currentPage.data
      const hasInputValue = 'inputValue' in currentPage.data
      
      this.logResult('待办事项页面数据字段', hasTodoList && hasInputValue)
    }
    
    await this.navigateBack()
  }

  /**
   * 测试计算器页面
   */
  async testCalculatorPage() {
    console.log('\n=== 测试计算器页面 ===')
    
    await this.navigateToPage('/pages/calculator/calculator')
    await this.wait(1000)
    
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    
    if (currentPage && currentPage.route === 'pages/calculator/calculator') {
      this.logResult('计算器页面加载', true)
      
      // 检查数据字段
      const hasDisplay = 'display' in currentPage.data
      this.logResult('计算器页面数据字段', hasDisplay)
      
      // 测试基本运算
      if (currentPage.inputNumber) {
        // 模拟输入 2+3
        currentPage.inputNumber({ currentTarget: { dataset: { num: '2' } } })
        await this.wait(100)
        currentPage.performOperation({ currentTarget: { dataset: { op: '+' } } })
        await this.wait(100)
        currentPage.inputNumber({ currentTarget: { dataset: { num: '3' } } })
        await this.wait(100)
        currentPage.calculateResult()
        await this.wait(100)
        
        const result = currentPage.data.display
        this.logResult('计算器运算测试', result === '5', `2+3=${result}`)
      }
    }
    
    await this.navigateBack()
  }

  /**
   * 测试所有页面路由
   */
  async testAllPages() {
    console.log('\n=== 测试所有页面路由 ===')
    
    const pages = [
      '/pages/index/index',
      '/pages/login/login',
      '/pages/profile/profile',
      '/pages/todo/todo',
      '/pages/memo/memo',
      '/pages/calculator/calculator',
      '/pages/weather/weather',
      '/pages/settings/settings',
      '/pages/about/about',
      '/pages/help/help'
    ]
    
    for (const pagePath of pages) {
      await this.navigateToPage(pagePath)
      await this.wait(1000)
      
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const route = pagePath.replace(/^\//, '').replace(/\.html$/, '')
      
      if (currentPage && currentPage.route === route) {
        this.logResult(`页面路由 ${pagePath}`, true)
      } else {
        this.logResult(`页面路由 ${pagePath}`, false, 
          `期望: ${route}, 实际: ${currentPage ? currentPage.route : 'null'}`)
      }
      
      // 返回首页
      await this.navigateBack()
      await this.wait(500)
    }
  }

  /**
   * 测试本地存储
   */
  async testStorage() {
    console.log('\n=== 测试本地存储 ===')
    
    try {
      // 测试存储
      wx.setStorageSync('test_key', 'test_value')
      const value = wx.getStorageSync('test_key')
      
      if (value === 'test_value') {
        this.logResult('本地存储写入和读取', true)
      } else {
        this.logResult('本地存储写入和读取', false, `期望: test_value, 实际: ${value}`)
      }
      
      // 清理
      wx.removeStorageSync('test_key')
      this.logResult('本地存储删除', true)
    } catch (error) {
      this.logResult('本地存储测试', false, error.message)
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始自动化测试...\n')
    
    // 确保在首页
    await this.navigateToPage('/pages/index/index')
    await this.wait(1000)
    
    // 执行测试
    await this.testIndexPage()
    await this.testLoginPage()
    await this.testTodoPage()
    await this.testCalculatorPage()
    await this.testAllPages()
    await this.testStorage()
    
    // 生成报告
    this.generateReport()
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(50))
    console.log('📊 测试报告')
    console.log('='.repeat(50))
    
    const total = this.results.length
    const passed = this.results.filter(r => r.passed).length
    const failed = total - passed
    
    console.log(`总测试数: ${total}`)
    console.log(`通过: ${passed} (${(passed/total*100).toFixed(1)}%)`)
    console.log(`失败: ${failed} (${(failed/total*100).toFixed(1)}%)`)
    
    if (failed > 0) {
      console.log('\n❌ 失败的测试:')
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.test}: ${r.message}`)
      })
    }
    
    console.log('\n' + '='.repeat(50))
    
    return {
      total,
      passed,
      failed,
      results: this.results
    }
  }
}

// 导出测试器
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiniProgramTester
}

// 如果在控制台中，创建全局实例
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  const tester = new MiniProgramTester()
  
  // 使用说明
  console.log(`
📝 自动化测试工具使用说明：

1. 运行所有测试：
   tester.runAllTests()

2. 运行单个测试：
   tester.testIndexPage()
   tester.testLoginPage()
   tester.testTodoPage()
   tester.testCalculatorPage()
   tester.testAllPages()
   tester.testStorage()

3. 查看测试报告：
   tester.generateReport()

4. 查看测试结果：
   tester.results
  `)
}
