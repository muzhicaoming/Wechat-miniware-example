/**
 * pages/todo/todo.js
 * 待办事项页面
 * 实现待办事项的增删改查、完成状态切换等功能
 */

const storage = require('../../utils/storage.js')

// 本地存储的键名
const TODO_KEY = 'todoList'

Page({
  /**
   * 页面数据
   */
  data: {
    todoList: [],      // 待办事项列表
    inputValue: ''     // 输入框的值
  },

  /**
   * 页面加载时触发
   */
  onLoad() {
    this.loadTodoList()
  },

  /**
   * 从本地存储加载待办列表
   */
  loadTodoList() {
    const todoList = storage.get(TODO_KEY, [])
    this.setData({
      todoList
    })
  },

  /**
   * 输入框内容变化时触发
   * @param {Object} e - 事件对象
   * @param {String} e.detail.value - 输入框的值
   */
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  /**
   * 添加新的待办事项
   * 验证输入内容，创建待办项并保存到本地存储
   */
  addTodo() {
    const { inputValue, todoList } = this.data
    
    // 验证输入内容不能为空
    if (!inputValue || !inputValue.trim()) {
      wx.showToast({
        title: '请输入有效的待办内容',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 创建新的待办项
    const newTodo = {
      id: Date.now(),                              // 使用时间戳作为唯一ID
      content: inputValue.trim(),                  // 去除首尾空格
      completed: false,                            // 初始状态为未完成
      createTime: new Date().toLocaleString()     // 创建时间（格式化显示）
    }

    // 添加到列表并保存
    const updatedList = [...todoList, newTodo]
    storage.set(TODO_KEY, updatedList)
    
    // 更新页面数据并清空输入框
    this.setData({
      todoList: updatedList,
      inputValue: ''
    })

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  /**
   * 切换待办事项的完成状态
   * @param {Object} e - 事件对象
   * @param {Number} e.currentTarget.dataset.id - 待办事项的ID
   */
  toggleTodo(e) {
    const { id } = e.currentTarget.dataset
    const { todoList } = this.data
    
    // 找到对应ID的待办项，切换其完成状态
    const updatedList = todoList.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    
    // 保存到本地存储并更新页面
    storage.set(TODO_KEY, updatedList)
    this.setData({
      todoList: updatedList
    })
  },

  /**
   * 删除待办事项
   * @param {Object} e - 事件对象
   * @param {Number} e.currentTarget.dataset.id - 待办事项的ID
   */
  deleteTodo(e) {
    const { id } = e.currentTarget.dataset
    const { todoList } = this.data
    
    // 显示确认对话框，防止误删
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条待办吗？',
      success: (res) => {
        if (res.confirm) {
          // 过滤掉指定ID的待办项
          const updatedList = todoList.filter(todo => todo.id !== id)
          storage.set(TODO_KEY, updatedList)
          this.setData({
            todoList: updatedList
          })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 清空所有已完成的待办事项
   * 只保留未完成的待办项
   */
  clearCompleted() {
    const { todoList } = this.data
    // 过滤掉所有已完成的待办项
    const activeList = todoList.filter(todo => !todo.completed)
    
    // 保存并更新页面
    storage.set(TODO_KEY, activeList)
    this.setData({
      todoList: activeList
    })
    
    wx.showToast({
      title: '已清空',
      icon: 'success'
    })
  }
})
