// utils/auth.js
// 登录状态管理工具（纯前端，存储在本地）

const storage = require('./storage.js')

const USER_INFO_KEY = 'userInfo'
const LOGIN_STATUS_KEY = 'isLoggedIn'

/**
 * 用户登录
 * @param {object} userInfo - 用户信息
 * @returns {boolean} 是否登录成功
 */
function login(userInfo) {
  try {
    const loginData = {
      ...userInfo,
      loginTime: new Date().getTime()
    }
    storage.set(USER_INFO_KEY, loginData)
    storage.set(LOGIN_STATUS_KEY, true)
    return true
  } catch (e) {
    console.error('登录失败:', e)
    return false
  }
}

/**
 * 用户登出
 * @returns {boolean} 是否登出成功
 */
function logout() {
  try {
    storage.remove(USER_INFO_KEY)
    storage.set(LOGIN_STATUS_KEY, false)
    return true
  } catch (e) {
    console.error('登出失败:', e)
    return false
  }
}

/**
 * 获取当前登录用户信息
 * @returns {object|null} 用户信息
 */
function getUserInfo() {
  return storage.get(USER_INFO_KEY, null)
}

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
  return storage.get(LOGIN_STATUS_KEY, false) && getUserInfo() !== null
}

/**
 * 更新用户信息
 * @param {object} userInfo - 新的用户信息
 * @returns {boolean} 是否更新成功
 */
function updateUserInfo(userInfo) {
  try {
    const currentUserInfo = getUserInfo()
    if (!currentUserInfo) {
      return false
    }
    const updatedUserInfo = {
      ...currentUserInfo,
      ...userInfo,
      updateTime: new Date().getTime()
    }
    storage.set(USER_INFO_KEY, updatedUserInfo)
    return true
  } catch (e) {
    console.error('更新用户信息失败:', e)
    return false
  }
}

module.exports = {
  login,
  logout,
  getUserInfo,
  isLoggedIn,
  updateUserInfo
}
