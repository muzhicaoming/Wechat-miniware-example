/**
 * pages/memo/memo.js
 * 备忘录页面
 * 实现备忘录的创建、编辑、删除、查看等功能
 */

const storage = require('../../utils/storage.js')

// 本地存储的键名
const MEMO_KEY = 'memoList'

Page({
  /**
   * 页面数据
   */
  data: {
    memoList: [],          // 备忘录列表
    inputTitle: '',        // 输入框：标题
    inputContent: '',       // 输入框：内容
    showEditor: false,     // 是否显示编辑器
    editingMemo: null      // 当前正在编辑的备忘录（null表示新建）
  },

  onLoad() {
    this.loadMemoList()
  },

  /**
   * 从本地存储加载备忘录列表
   * 格式化时间显示，并按创建时间倒序排列（最新的在前）
   */
  loadMemoList() {
    const memoList = storage.get(MEMO_KEY, [])
    
    // 格式化时间显示，添加错误处理
    const formattedList = memoList.map(memo => {
      let createTimeStr = '未知时间'
      if (memo.createTime) {
        try {
          const date = new Date(memo.createTime)
          if (!isNaN(date.getTime())) {
            // 格式化为中文本地时间字符串
            createTimeStr = date.toLocaleString('zh-CN')
          }
        } catch (e) {
          console.error('时间格式化失败:', e)
        }
      }
      return {
        ...memo,
        createTimeStr  // 格式化后的时间字符串，用于显示
      }
    })
    
    // 按创建时间倒序排列（最新的在前）
    this.setData({
      memoList: formattedList.sort((a, b) => {
        const timeA = a.createTime || 0
        const timeB = b.createTime || 0
        return timeB - timeA  // 倒序：时间大的在前
      })
    })
  },

  /**
   * 显示编辑器（新建备忘录）
   * 清空输入框，准备创建新备忘录
   */
  showEditor() {
    this.setData({
      showEditor: true,
      editingMemo: null,    // null表示新建模式
      inputTitle: '',
      inputContent: ''
    })
  },

  /**
   * 隐藏编辑器
   * 关闭编辑器，清空编辑状态
   */
  hideEditor() {
    this.setData({
      showEditor: false,
      editingMemo: null,
      inputTitle: '',
      inputContent: ''
    })
  },

  /**
   * 标题输入框内容变化
   * @param {Object} e - 事件对象
   * @param {String} e.detail.value - 输入的值
   */
  onTitleInput(e) {
    this.setData({
      inputTitle: e.detail.value
    })
  },

  /**
   * 内容输入框内容变化
   * @param {Object} e - 事件对象
   * @param {String} e.detail.value - 输入的值
   */
  onContentInput(e) {
    this.setData({
      inputContent: e.detail.value
    })
  },

  /**
   * 保存备忘录（新建或更新）
   * 验证输入内容，保存到本地存储
   */
  saveMemo() {
    const { inputTitle, inputContent, memoList, editingMemo } = this.data
    
    // 验证标题和内容不能为空
    if (!inputTitle.trim() || !inputContent.trim()) {
      wx.showToast({
        title: '请输入标题和内容',
        icon: 'none'
      })
      return
    }

    let updatedList
    
    if (editingMemo) {
      // 编辑模式：更新现有备忘录
      updatedList = memoList.map(memo => 
        memo.id === editingMemo.id 
          ? { 
              ...memo, 
              title: inputTitle.trim(), 
              content: inputContent.trim(), 
              updateTime: Date.now()  // 更新修改时间
            }
          : memo
      )
    } else {
      // 新建模式：创建新备忘录
      const newMemo = {
        id: Date.now(),                    // 使用时间戳作为唯一ID
        title: inputTitle.trim(),          // 标题（去除首尾空格）
        content: inputContent.trim(),      // 内容（去除首尾空格）
        createTime: Date.now(),           // 创建时间
        updateTime: Date.now()            // 更新时间
      }
      updatedList = [...memoList, newMemo]
    }
    
    // 保存到本地存储
    storage.set(MEMO_KEY, updatedList)
    // 重新加载列表（会重新格式化时间）
    this.loadMemoList()
    // 关闭编辑器
    this.hideEditor()
    
    wx.showToast({
      title: editingMemo ? '更新成功' : '保存成功',
      icon: 'success'
    })
  },

  /**
   * 编辑备忘录
   * @param {Object} e - 事件对象
   * @param {Number} e.currentTarget.dataset.id - 备忘录的ID
   */
  editMemo(e) {
    const { id } = e.currentTarget.dataset
    const memo = this.data.memoList.find(m => m.id === id)
    
    if (memo) {
      // 打开编辑器，填充当前备忘录的内容
      this.setData({
        showEditor: true,
        editingMemo: memo,           // 设置编辑模式
        inputTitle: memo.title,      // 填充标题
        inputContent: memo.content   // 填充内容
      })
    }
  },

  /**
   * 删除备忘录
   * @param {Object} e - 事件对象
   * @param {Number} e.currentTarget.dataset.id - 备忘录的ID
   */
  deleteMemo(e) {
    const { id } = e.currentTarget.dataset
    const { memoList } = this.data
    
    // 显示确认对话框，防止误删
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条备忘录吗？',
      success: (res) => {
        if (res.confirm) {
          // 过滤掉指定ID的备忘录
          const updatedList = memoList.filter(memo => memo.id !== id)
          storage.set(MEMO_KEY, updatedList)
          this.setData({
            memoList: updatedList
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
   * 查看备忘录详情
   * @param {Object} e - 事件对象
   * @param {Number} e.currentTarget.dataset.id - 备忘录的ID
   */
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    const memo = this.data.memoList.find(m => m.id === id)
    
    if (memo) {
      // 使用模态框显示备忘录的标题和内容
      wx.showModal({
        title: memo.title,
        content: memo.content,
        showCancel: false  // 只显示确定按钮
      })
    }
  }
})
