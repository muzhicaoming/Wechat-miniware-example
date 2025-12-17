// utils/auth.test.js
// 登录状态管理工具单元测试

const auth = require('./auth.js')
const storage = require('./storage.js')

// Mock storage模块
jest.mock('./storage.js')

describe('Auth工具类测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    storage.get.mockReturnValue(null)
    storage.set.mockReturnValue(true)
    storage.remove.mockReturnValue(true)
  })

  test('login - 应该成功登录', () => {
    const userInfo = {
      username: 'testuser',
      nickname: 'Test User'
    }

    const result = auth.login(userInfo)
    
    expect(result).toBe(true)
    expect(storage.set).toHaveBeenCalledWith('userInfo', expect.objectContaining({
      username: 'testuser',
      nickname: 'Test User',
      loginTime: expect.any(Number)
    }))
    expect(storage.set).toHaveBeenCalledWith('isLoggedIn', true)
  })

  test('logout - 应该成功登出', () => {
    const result = auth.logout()
    
    expect(result).toBe(true)
    expect(storage.remove).toHaveBeenCalledWith('userInfo')
    expect(storage.set).toHaveBeenCalledWith('isLoggedIn', false)
  })

  test('getUserInfo - 应该返回用户信息', () => {
    const mockUserInfo = { username: 'testuser', nickname: 'Test' }
    storage.get.mockReturnValue(mockUserInfo)

    const result = auth.getUserInfo()
    
    expect(result).toEqual(mockUserInfo)
    expect(storage.get).toHaveBeenCalledWith('userInfo', null)
  })

  test('isLoggedIn - 应该正确检查登录状态', () => {
    // 未登录情况
    storage.get.mockReturnValueOnce(false).mockReturnValueOnce(null)
    expect(auth.isLoggedIn()).toBe(false)

    // 已登录情况
    storage.get.mockReturnValueOnce(true).mockReturnValueOnce({ username: 'test' })
    expect(auth.isLoggedIn()).toBe(true)
  })

  test('updateUserInfo - 应该成功更新用户信息', () => {
    const existingUserInfo = {
      username: 'testuser',
      nickname: 'Old Nickname',
      loginTime: 1234567890
    }
    
    storage.get.mockReturnValue(existingUserInfo)

    const result = auth.updateUserInfo({ nickname: 'New Nickname' })
    
    expect(result).toBe(true)
    expect(storage.set).toHaveBeenCalledWith('userInfo', expect.objectContaining({
      username: 'testuser',
      nickname: 'New Nickname',
      updateTime: expect.any(Number)
    }))
  })

  test('updateUserInfo - 应该失败当用户未登录时', () => {
    storage.get.mockReturnValue(null)

    const result = auth.updateUserInfo({ nickname: 'New Nickname' })
    
    expect(result).toBe(false)
  })
})
