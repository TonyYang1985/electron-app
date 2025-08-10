# GitHub Secrets设置指南

## 必需的Secrets（已自动提供）

### GITHUB_TOKEN
- **说明**: GitHub自动提供，无需手动设置
- **权限**: 已在工作流中设置为 `contents: write`
- **用途**: 用于发布到GitHub Releases

## 可选的Secrets（如果需要代码签名）

### Windows代码签名（可选）
```
CSC_LINK - Windows代码签名证书文件（.p12）的base64编码
CSC_KEY_PASSWORD - 证书密码
```

### macOS代码签名（可选）  
```
CSC_LINK - macOS开发者证书文件的base64编码
CSC_KEY_PASSWORD - 证书密码
APPLE_ID - Apple ID邮箱
APPLE_ID_PASSWORD - Apple ID专用密码
```

## 设置Secrets的步骤

1. **打开GitHub仓库**
2. **点击Settings标签**
3. **左侧菜单选择"Secrets and variables" → "Actions"**
4. **点击"New repository secret"**
5. **输入Name和Value**
6. **点击"Add secret"**

## 当前配置（无需代码签名）

你的当前配置已经设置为跳过代码签名：
- ✅ Windows: `CSC_IDENTITY_AUTO_DISCOVERY=false`
- ✅ macOS: 未配置代码签名
- ✅ Linux: 不需要代码签名

这意味着：
- ✅ 完全免费构建
- ✅ 无需购买证书
- ⚠️ Windows用户需要点击"更多信息"→"仍要运行"
- ⚠️ macOS用户需要右键"打开"或在安全设置中允许

## 检查Actions权限

确保仓库的Actions权限正确设置：

1. **Settings** → **Actions** → **General**
2. **Workflow permissions** 选择：
   - ✅ "Read and write permissions"
   - ✅ "Allow GitHub Actions to create and approve pull requests"

这样工作流就能正常发布到Releases了。