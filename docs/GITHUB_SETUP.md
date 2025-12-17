# GitHub 同步指南

## 当前状态

✅ Git仓库已初始化
✅ 所有文件已添加到暂存区
✅ 初始提交已完成

## 推送到GitHub步骤

### 1. 在GitHub上创建新仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `wechat-miniware-example`
   - **Description**: `微信小程序示例项目 - 纯前端架构，包含9个功能模块`
   - **Visibility**: 选择 Public 或 Private（根据你的需求）
   - **不要**勾选 "Initialize this repository with a README"（因为我们已经有了）
4. 点击 "Create repository"

### 2. 添加远程仓库并推送

在项目目录下执行以下命令（将 `YOUR_USERNAME` 替换为你的GitHub用户名）：

```bash
cd /Users/qitmac001395/workspace/QAL/wechat-miniware-example

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/wechat-miniware-example.git

# 或者使用SSH（如果你配置了SSH密钥）
# git remote add origin git@github.com:YOUR_USERNAME/wechat-miniware-example.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

### 3. 验证推送

推送成功后，访问你的GitHub仓库页面，应该能看到所有项目文件。

## 后续更新

当项目有更新时，使用以下命令同步到GitHub：

```bash
# 查看更改
git status

# 添加更改
git add .

# 提交更改
git commit -m "描述你的更改"

# 推送到GitHub
git push
```

## 分支管理建议

### 主分支
- `main` - 主分支，用于生产环境

### 开发分支（可选）
```bash
# 创建开发分支
git checkout -b develop

# 开发完成后合并到主分支
git checkout main
git merge develop
git push
```

## 提交信息规范

建议使用清晰的提交信息：

- `feat: 添加新功能`
- `fix: 修复bug`
- `docs: 更新文档`
- `style: 代码格式调整`
- `refactor: 代码重构`
- `test: 添加测试`
- `chore: 构建过程或辅助工具的变动`

## 注意事项

1. **敏感信息**: 确保 `.gitignore` 已正确配置，不要提交敏感信息
2. **大文件**: 不要提交大文件到Git，考虑使用Git LFS
3. **AppID**: 如果使用正式AppID，建议使用环境变量或配置文件（不提交到Git）

## 当前Git状态

```bash
# 查看当前状态
git status

# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v
```

## 故障排除

### 如果推送失败

1. **检查网络连接**
2. **验证GitHub凭证**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```
3. **检查远程仓库URL**
   ```bash
   git remote -v
   git remote set-url origin <新的URL>
   ```

### 如果需要更新远程仓库URL

```bash
# 查看当前远程仓库
git remote -v

# 更新远程仓库URL
git remote set-url origin <新的URL>

# 验证更新
git remote -v
```

---

**提示**: 如果遇到问题，请查看Git错误信息或参考 [GitHub官方文档](https://docs.github.com/en/get-started/getting-started-with-git)
