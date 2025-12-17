// utils/storage.test.js
// 存储工具类单元测试

const storage = require('./storage.js')

// 模拟微信API
global.wx = {
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn((key) => {
    return storage._mockStorage[key] || ''
  }),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn()
}

// 模拟存储对象
storage._mockStorage = {}

describe('Storage工具类测试', () => {
  beforeEach(() => {
    storage._mockStorage = {}
    jest.clearAllMocks()
  })

  test('set - 应该成功存储数据', () => {
    const result = storage.set('testKey', 'testValue')
    expect(result).toBe(true)
    expect(wx.setStorageSync).toHaveBeenCalledWith('testKey', 'testValue')
  })

  test('get - 应该成功获取数据', () => {
    storage._mockStorage['testKey'] = 'testValue'
    wx.getStorageSync.mockReturnValue('testValue')
    
    const result = storage.get('testKey')
    expect(result).toBe('testValue')
  })

  test('get - 应该返回默认值当键不存在时', () => {
    wx.getStorageSync.mockReturnValue('')
    
    const result = storage.get('nonExistentKey', 'defaultValue')
    expect(result).toBe('defaultValue')
  })

  test('remove - 应该成功删除数据', () => {
    const result = storage.remove('testKey')
    expect(result).toBe(true)
    expect(wx.removeStorageSync).toHaveBeenCalledWith('testKey')
  })

  test('clear - 应该成功清空所有数据', () => {
    const result = storage.clear()
    expect(result).toBe(true)
    expect(wx.clearStorageSync).toHaveBeenCalled()
  })

  test('has - 应该正确检查键是否存在', () => {
    wx.getStorageSync.mockReturnValueOnce('value').mockReturnValueOnce('')
    
    expect(storage.has('existingKey')).toBe(true)
    expect(storage.has('nonExistentKey')).toBe(false)
  })
})
