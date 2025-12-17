// utils/storage.js
// 本地存储工具类（纯前端存储方案）

/**
 * 存储数据到本地
 * @param {string} key - 存储的键
 * @param {any} value - 存储的值
 */
function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    console.error('存储数据失败:', e)
    return false
  }
}

/**
 * 从本地获取数据
 * @param {string} key - 存储的键
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储的值
 */
function get(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (e) {
    console.error('获取数据失败:', e)
    return defaultValue
  }
}

/**
 * 删除指定的本地数据
 * @param {string} key - 存储的键
 */
function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除数据失败:', e)
    return false
  }
}

/**
 * 清空所有本地数据
 */
function clear() {
  try {
    wx.clearStorageSync()
    return true
  } catch (e) {
    console.error('清空数据失败:', e)
    return false
  }
}

/**
 * 检查是否存在指定的键
 * @param {string} key - 存储的键
 * @returns {boolean}
 */
function has(key) {
  try {
    const value = wx.getStorageSync(key)
    return value !== ''
  } catch (e) {
    return false
  }
}

module.exports = {
  set,
  get,
  remove,
  clear,
  has
}
