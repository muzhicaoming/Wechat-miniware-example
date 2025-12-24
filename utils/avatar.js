/**
 * utils/avatar.js
 * 头像下载和缓存工具
 * 
 * 功能：
 * 1. 下载微信头像到本地永久存储
 * 2. 缓存头像路径，避免重复下载
 * 3. 验证缓存文件是否存在
 * 4. 清除头像缓存
 */

const storage = require('./storage.js')

// 缓存映射的存储键名（存储所有头像URL到本地路径的映射）
const AVATAR_CACHE_KEY = 'avatarCache'
// 单个头像缓存的键名前缀（用于存储每个头像的本地路径）
const AVATAR_CACHE_PREFIX = 'avatar_'

/**
 * 下载并缓存头像
 * @param {string} avatarUrl - 微信头像URL
 * @returns {Promise<string>} 本地文件路径
 */
function downloadAndCacheAvatar(avatarUrl) {
  return new Promise((resolve, reject) => {
    console.log('=== 开始下载并缓存头像 ===')
    console.log('头像URL:', avatarUrl)

    if (!avatarUrl) {
      console.error('错误：头像URL为空')
      reject(new Error('头像URL为空'))
      return
    }

    // 检查是否已有缓存
    const cacheKey = AVATAR_CACHE_PREFIX + avatarUrl
    const cachedPath = storage.get(cacheKey, null)
    console.log('缓存key:', cacheKey)
    console.log('已缓存路径:', cachedPath)

    if (cachedPath) {
      console.log('发现已有缓存，验证文件是否存在...')
      // 检查文件是否还存在
      wx.getFileInfo({
        filePath: cachedPath,
        success: (fileInfo) => {
          console.log('缓存文件存在:', fileInfo)
          resolve(cachedPath)
        },
        fail: (err) => {
          console.log('缓存文件不存在，重新下载:', err)
          // 缓存文件不存在，重新下载
          downloadAvatar(avatarUrl, resolve, reject)
        }
      })
      return
    }

    console.log('没有缓存，开始下载头像...')
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

  // 添加请求头，确保能正确处理微信头像
  const requestHeaders = {
    'User-Agent': 'MicroMessenger/6.5.4',
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  }

  wx.downloadFile({
    url: avatarUrl,
    header: requestHeaders,
    timeout: 10000, // 设置10秒超时
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

      // 针对真机可能出现的特定错误进行处理
      const errorMsg = err.errMsg || '下载失败'
      console.error('错误详情:', errorMsg)

      // 如果下载失败，返回原始URL让组件显示网络头像
      if (errorMsg.includes('downloadFile:fail') || errorMsg.includes('Failed to fetch')) {
        console.log('下载失败，将使用网络头像:', avatarUrl)
        // 返回空字符串，让调用方知道应该使用原始URL
        wx.showToast({
          title: '头像缓存失败，使用网络头像',
          icon: 'none',
          duration: 2000
        })
        resolve('') // 返回空字符串表示使用网络头像
      } else {
        reject(new Error(errorMsg))
      }
    }
  })
}

/**
 * 获取缓存的头像路径（带验证）
 * @param {string} avatarUrl - 微信头像URL
 * @returns {string|null} 本地文件路径，如果没有缓存则返回null
 */
function getCachedAvatarPath(avatarUrl) {
  console.log('=== 检查头像缓存 ===')
  if (!avatarUrl) {
    console.warn('警告：头像URL为空')
    return null
  }

  const cacheKey = AVATAR_CACHE_PREFIX + avatarUrl
  const cachedPath = storage.get(cacheKey, null)

  console.log('缓存key:', cacheKey)
  console.log('缓存路径:', cachedPath)

  if (!cachedPath) {
    console.log('没有缓存')
    return null
  }

  // 验证文件是否存在
  wx.getFileInfo({
    filePath: cachedPath,
    success: (res) => {
      console.log('缓存文件验证成功:', res)
    },
    fail: (err) => {
      console.warn('缓存文件不存在，清理缓存:', err)
      // 清理不存在的缓存
      storage.remove(cacheKey)
      const cacheMap = storage.get(AVATAR_CACHE_KEY, {})
      delete cacheMap[avatarUrl]
      storage.set(AVATAR_CACHE_KEY, cacheMap)
    }
  })

  return cachedPath
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
