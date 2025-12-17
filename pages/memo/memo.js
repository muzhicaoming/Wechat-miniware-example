// pages/memo/memo.js
const storage = require('../../utils/storage.js')

const MEMO_KEY = 'memoList'

Page({
  data: {
    memoList: [],
    inputTitle: '',
    inputContent: '',
    showEditor: false,
    editingMemo: null
  },

  onLoad() {
    this.loadMemoList()
  },

  /**
   * 加载备忘录列表
   */
  loadMemoList() {
    const memoList = storage.get(MEMO_KEY, [])
    // 格式化时间显示
    const formattedList = memoList.map(memo => ({
      ...memo,
      createTimeStr: new Date(memo.createTime).toLocaleString('zh-CN')
    }))
    this.setData({
      memoList: formattedList.sort((a, b) => b.createTime - a.createTime)
    })
  },

  /**
   * 显示编辑器
   */
  showEditor() {
    this.setData({
      showEditor: true,
      editingMemo: null,
      inputTitle: '',
      inputContent: ''
    })
  },

  /**
   * 隐藏编辑器
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
   * 输入标题
   */
  onTitleInput(e) {
    this.setData({
      inputTitle: e.detail.value
    })
  },

  /**
   * 输入内容
   */
  onContentInput(e) {
    this.setData({
      inputContent: e.detail.value
    })
  },

  /**
   * 保存备忘录
   */
  saveMemo() {
    const { inputTitle, inputContent, memoList, editingMemo } = this.data
    
    if (!inputTitle.trim() || !inputContent.trim()) {
      wx.showToast({
        title: '请输入标题和内容',
        icon: 'none'
      })
      return
    }

    let updatedList
    
    if (editingMemo) {
      // 编辑模式
      updatedList = memoList.map(memo => 
        memo.id === editingMemo.id 
          ? { ...memo, title: inputTitle.trim(), content: inputContent.trim(), updateTime: Date.now() }
          : memo
      )
    } else {
      // 新建模式
      const newMemo = {
        id: Date.now(),
        title: inputTitle.trim(),
        content: inputContent.trim(),
        createTime: Date.now(),
        updateTime: Date.now()
      }
      updatedList = [...memoList, newMemo]
    }
    
    storage.set(MEMO_KEY, updatedList)
    this.loadMemoList()
    this.hideEditor()
    
    wx.showToast({
      title: editingMemo ? '更新成功' : '保存成功',
      icon: 'success'
    })
  },

  /**
   * 编辑备忘录
   */
  editMemo(e) {
    const { id } = e.currentTarget.dataset
    const memo = this.data.memoList.find(m => m.id === id)
    
    if (memo) {
      this.setData({
        showEditor: true,
        editingMemo: memo,
        inputTitle: memo.title,
        inputContent: memo.content
      })
    }
  },

  /**
   * 删除备忘录
   */
  deleteMemo(e) {
    const { id } = e.currentTarget.dataset
    const { memoList } = this.data
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条备忘录吗？',
      success: (res) => {
        if (res.confirm) {
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
   * 查看详情
   */
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    const memo = this.data.memoList.find(m => m.id === id)
    
    if (memo) {
      wx.showModal({
        title: memo.title,
        content: memo.content,
        showCancel: false
      })
    }
  }
})
