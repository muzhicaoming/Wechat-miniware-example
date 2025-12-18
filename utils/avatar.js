// utils/avatar.js
// 头像下载和缓存工具

const storage = require('./storage.js')

const AVATAR_CACHE_KEY = 'avatarCache'
const AVATAR_CACHE_PREFIX = 'avatar_'

/**
 * 下载并缓存头像
 * @param {string} avatarUrl - 微信头像URL
 * @returns {Promise<string>} 本地文件路径
 */
function downloadAndCacheAvatar(avatarUrl) {
  return new Promise((resolve, reject) => {
    if (!avatarUrl) {
      reject(new Error('头像URL为空'))
      return
    }

    // 检查是否已有缓存
    const cacheKey = AVATAR_CACHE_PREFIX + avatarUrl
    const cachedPath = storage.get(cacheKey, null)
    
    if (cachedPath) {
      // 检查文件是否还存在
      wx.getFileInfo({
        filePath: cachedPath,
        success: () => {
          resolve(cachedPath)
        },
        fail: () => {
          // 缓存文件不存在，重新下载
          downloadAvatar(avatarUrl, resolve, reject)
        }
      })
      return
    }

    // 没有缓存，下载头像
    downloadAvatar(avatarUrl, resolve, reject)
  })
}

/**
 * 下载头像
 * @param {string} avatarUrl - 头像URL
 * @param {Function} resolve - 成功回调
 * @param {Function} reject - 失败回调
 */
function downloadAvatar(avatarUrl, resolve, reject) {
  console.log('开始下载头像:', avatarUrl)
  
  wx.showLoading({
    title: '下载头像中...',
    mask: true
  })

  wx.downloadFile({
    url: avatarUrl,
    success: (res) => {
      console.log('下载文件响应:', res)
      
      if (res.statusCode === 200 && res.tempFilePath) {
        const filePath = res.tempFilePath
        console.log('下载成功，临时文件路径:', filePath)
        
        // 保存到本地文件系统（永久存储）
        wx.saveFile({
          tempFilePath: filePath,
          success: (saveRes) => {
            wx.hideLoading()
            const savedFilePath = saveRes.savedFilePath
            console.log('保存成功，本地文件路径:', savedFilePath)
            
            // 缓存文件路径
            const cacheKey = AVATAR_CACHE_PREFIX + avatarUrl
            storage.set(cacheKey, savedFilePath)
            
            // 更新缓存映射
            const cacheMap = storage.get(AVATAR_CACHE_KEY, {})
            cacheMap[avatarUrl] = savedFilePath
            storage.set(AVATAR_CACHE_KEY, cacheMap)
            
            resolve(savedFilePath)
          },
          fail: (err) => {
            wx.hideLoading()
            console.error('保存头像文件失败:', err)
            // 即使保存失败，也返回临时文件路径（至少可以显示）
            console.log('使用临时文件路径:', filePath)
            resolve(filePath)
          }
        })
      } else {
        wx.hideLoading()
        const errorMsg = `下载头像失败，状态码: ${res.statusCode || 'unknown'}`
        console.error(errorMsg)
        reject(new Error(errorMsg))
      }
    },
    fail: (err) => {
      wx.hideLoading()
      console.error('下载头像失败:', err)
      const errorMsg = err.errMsg || '下载失败'
      console.error('错误详情:', errorMsg)
      reject(new Error(errorMsg))
    }
  })
}

/**
 * 获取缓存的头像路径
 * @param {string} avatarUrl - 微信头像URL
 * @returns {string|null} 本地文件路径，如果没有缓存则返回null
 */
function getCachedAvatarPath(avatarUrl) {
  if (!avatarUrl) {
    return null
  }
  
  const cacheKey = AVATAR_CACHE_PREFIX + avatarUrl
  return storage.get(cacheKey, null)
}

/**
 * 清除头像缓存
 * @param {string} avatarUrl - 要清除的头像URL（可选，不传则清除所有）
 */
function clearAvatarCache(avatarUrl) {
  if (avatarUrl) {
    const cacheKey = AVATAR_CACHE_PREFIX + avatarUrl
    const cachedPath = storage.get(cacheKey, null)
    
    if (cachedPath) {
      // 删除文件
      wx.removeSavedFile({
        filePath: cachedPath,
        success: () => {
          storage.remove(cacheKey)
        },
        fail: (err) => {
          console.error('删除头像文件失败:', err)
        }
      })
    }
    
    // 从缓存映射中移除
    const cacheMap = storage.get(AVATAR_CACHE_KEY, {})
    delete cacheMap[avatarUrl]
    storage.set(AVATAR_CACHE_KEY, cacheMap)
  } else {
    // 清除所有缓存
    const cacheMap = storage.get(AVATAR_CACHE_KEY, {})
    Object.values(cacheMap).forEach(filePath => {
      wx.removeSavedFile({
        filePath: filePath,
        fail: () => {}
      })
    })
    storage.remove(AVATAR_CACHE_KEY)
  }
}

module.exports = {
  downloadAndCacheAvatar,
  getCachedAvatarPath,
  clearAvatarCache
}
