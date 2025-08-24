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

# 清理图标文件
for size in 16 24 32 48 64 96 128 256 512; do
    icon_file="${ICON_DIR}/${size}x${size}/apps/my-awesome-app.png"
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