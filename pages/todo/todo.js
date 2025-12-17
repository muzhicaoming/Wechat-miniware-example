// pages/todo/todo.js
const storage = require('../../utils/storage.js')

const TODO_KEY = 'todoList'

Page({
  data: {
    todoList: [],
    inputValue: ''
  },

  onLoad() {
    this.loadTodoList()
  },

  /**
   * 加载待办列表
   */
  loadTodoList() {
    const todoList = storage.get(TODO_KEY, [])
    this.setData({
      todoList
    })
  },

  /**
   * 输入待办内容
   */
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  /**
   * 添加待办
   */
  addTodo() {
    const { inputValue, todoList } = this.data
    
    if (!inputValue || !inputValue.trim()) {
      wx.showToast({
        title: '请输入有效的待办内容',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const newTodo = {
      id: Date.now(),
      content: inputValue.trim(),
      completed: false,
      createTime: new Date().toLocaleString()
    }

    const updatedList = [...todoList, newTodo]
    storage.set(TODO_KEY, updatedList)
    
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
   * 切换完成状态
   */
  toggleTodo(e) {
    const { id } = e.currentTarget.dataset
    const { todoList } = this.data
    
    const updatedList = todoList.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    
    storage.set(TODO_KEY, updatedList)
    this.setData({
      todoList: updatedList
    })
  },

  /**
   * 删除待办
   */
  deleteTodo(e) {
    const { id } = e.currentTarget.dataset
    const { todoList } = this.data
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条待办吗？',
      success: (res) => {
        if (res.confirm) {
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
   * 清空已完成
   */
  clearCompleted() {
    const { todoList } = this.data
    const activeList = todoList.filter(todo => !todo.completed)
    
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
