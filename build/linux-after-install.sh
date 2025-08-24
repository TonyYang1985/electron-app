#!/bin/bash
set -e

# 设置应用图标和桌面文件权限
if [ -f "/usr/share/applications/myawesomeapp.desktop" ]; then
    chmod 644 /usr/share/applications/myawesomeapp.desktop
fi

# 更新桌面数据库
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications || true
fi

# 更新图标缓存
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi

# 创建符号链接到 /usr/local/bin（如果需要）
if [ ! -L "/usr/local/bin/myawesomeapp" ] && [ -f "/opt/MyAwesomeApp/myawesomeapp" ]; then
    ln -sf "/opt/MyAwesomeApp/myawesomeapp" "/usr/local/bin/myawesomeapp" || true
fi

echo "My Awesome App installation completed successfully"
