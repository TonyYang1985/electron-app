#!/bin/bash

# My Awesome App - Linux 安装后脚本（简化版）
set -e

APP_NAME="My Awesome App"
INSTALL_DIR="/opt/${APP_NAME}"

echo "正在配置 ${APP_NAME}..."

# 创建符号链接到 /usr/local/bin
ln -sf "${INSTALL_DIR}/my-awesome-app" "/usr/local/bin/my-awesome-app" || true

# 设置可执行权限
chmod +x "${INSTALL_DIR}/my-awesome-app" || true

# 设置 Chrome 沙盒权限
if [ -f "${INSTALL_DIR}/chrome-sandbox" ]; then
    chmod 4755 "${INSTALL_DIR}/chrome-sandbox" || true
fi

# 更新系统缓存
update-desktop-database /usr/share/applications 2>/dev/null || true
gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true

echo "✅ ${APP_NAME} 安装完成"

---

#!/bin/bash

# My Awesome App - Linux 卸载后脚本（简化版）
set -e

APP_NAME="My Awesome App"

echo "正在清理 ${APP_NAME}..."

# 移除符号链接
rm -f "/usr/local/bin/my-awesome-app" || true

# 更新系统缓存
update-desktop-database /usr/share/applications 2>/dev/null || true
gtk-update-icon-cache -f -t /usr/share/icons/hicolor 2>/dev/null || true

echo "✅ ${APP_NAME} 卸载清理完成"