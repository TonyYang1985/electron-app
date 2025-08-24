#!/bin/bash
set -e

# 清理符号链接
if [ -L "/usr/local/bin/myawesomeapp" ]; then
    rm -f "/usr/local/bin/myawesomeapp" || true
fi

# 更新桌面数据库
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database /usr/share/applications || true
fi

# 更新图标缓存
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t /usr/share/icons/hicolor || true
fi

# 清理用户配置（可选，通常不建议）
# rm -rf ~/.config/MyAwesomeApp || true

echo "My Awesome App removal completed successfully"
