#!/bin/bash

# My Awesome App - Linux 安装后脚本
# 用于 deb 和 rpm 包的安装后处理

set -e

APP_NAME="My Awesome App"
INSTALL_DIR="/opt/${APP_NAME}"
DESKTOP_FILE="/usr/share/applications/my-awesome-app.desktop"
ICON_DIR="/usr/share/icons/hicolor"

echo "正在配置 ${APP_NAME}..."

# 创建符号链接到 /usr/local/bin
if [ ! -L "/usr/local/bin/my-awesome-app" ]; then
    ln -sf "${INSTALL_DIR}/my-awesome-app" "/usr/local/bin/my-awesome-app" || true
fi

# 设置可执行权限
if [ -f "${INSTALL_DIR}/my-awesome-app" ]; then
    chmod +x "${INSTALL_DIR}/my-awesome-app" || true
fi

# 设置 Chrome 沙盒权限（Electron 需要）
if [ -f "${INSTALL_DIR}/chrome-sandbox" ]; then
    chmod 4755 "${INSTALL_DIR}/chrome-sandbox" || true
fi

# 复制图标到系统图标目录 - 修复变量名冲突
if [ -d "${INSTALL_DIR}/resources/app/assets" ]; then
    # 使用不同的变量名避免与 electron-builder 宏冲突
    for icon_size in 16 24 32 48 64 96 128 256 512; do
        icon_dir="${ICON_DIR}/${icon_size}x${icon_size}/apps"
        mkdir -p "$icon_dir" || true
        if [ -f "${INSTALL_DIR}/resources/app/assets/icon.png" ]; then
            cp "${INSTALL_DIR}/resources/app/assets/icon.png" "${icon_dir}/my-awesome-app.png" || true
        fi
    done
fi

# 更新桌面数据库
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

# 更新 MIME 数据库
if command -v update-mime-database >/dev/null 2>&1; then
    update-mime-database /usr/share/mime 2>/dev/null || true
fi

# 更新图标缓存
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t "${ICON_DIR}" 2>/dev/null || true
fi

# 更新字体缓存（如果应用包含自定义字体）
if command -v fc-cache >/dev/null 2>&1; then
    fc-cache -f 2>/dev/null || true
fi

# 注册 URL scheme handler
if command -v xdg-mime >/dev/null 2>&1; then
    xdg-mime default my-awesome-app.desktop x-scheme-handler/myawesomeapp 2>/dev/null || true
fi

echo "✅ ${APP_NAME} 安装完成"
echo "💡 您可以通过以下方式启动应用："
echo "   - 在应用菜单中查找 '${APP_NAME}'"
echo "   - 在终端中运行: my-awesome-app"
echo "   - 使用桌面快捷方式"

---

#!/bin/bash

# My Awesome App - Linux 卸载后脚本
# 用于 deb 和 rpm 包的卸载后清理

set -e

APP_NAME="My Awesome App"
ICON_DIR="/usr/share/icons/hicolor"

echo "正在清理 ${APP_NAME}..."

# 移除符号链接
if [ -L "/usr/local/bin/my-awesome-app" ]; then
    rm -f "/usr/local/bin/my-awesome-app" || true
fi

# 清理图标文件 - 修复变量名冲突
for icon_size in 16 24 32 48 64 96 128 256 512; do
    icon_file="${ICON_DIR}/${icon_size}x${icon_size}/apps/my-awesome-app.png"
    if [ -f "$icon_file" ]; then
        rm -f "$icon_file" || true
    fi
done

# 取消注册 URL scheme handler
if command -v xdg-mime >/dev/null 2>&1; then
    # 尝试移除 MIME 关联
    for user_home in /home/*; do
        if [ -d "$user_home" ]; then
            user_name=$(basename "$user_home")
            sudo -u "$user_name" xdg-mime uninstall /usr/share/applications/my-awesome-app.desktop 2>/dev/null || true
        fi
    done
fi

# 更新桌面数据库
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications 2>/dev/null || true
fi

# 更新 MIME 数据库
if command -v update-mime-database >/dev/null 2>&1; then
    update-mime-database /usr/share/mime 2>/dev/null || true
fi

# 更新图标缓存
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t "${ICON_DIR}" 2>/dev/null || true
fi

# 清理用户配置（可选 - 询问用户）
echo ""
echo "📁 用户数据位置："
echo "   ~/.config/My Awesome App/"
echo "   ~/.local/share/My Awesome App/"
echo ""
echo "💡 如需完全移除用户数据，请手动删除上述目录"

echo "✅ ${APP_NAME} 卸载清理完成"

---
