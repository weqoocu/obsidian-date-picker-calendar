# Date Picker Calendar

一个简单易用的 Obsidian 日期选择器插件，当光标悬停在日期表情符号（📅 YYYY-MM-DD）格式上时显示日历选择器。

## 功能特性

- 🗓️ **智能日期检测**：自动识别 `📅 YYYY-MM-DD` 格式的日期
- 📅 **可视化日历**：美观的日历界面，支持月份导航
- ⚡ **快捷选择**：提供今天、明天、2天后等快捷选项
- 🎨 **主题适配**：完美适配 Obsidian 的明暗主题
- 🖱️ **直观操作**：点击日期即可快速替换
- 🗑️ **清除功能**：一键清除日期内容

## 安装方法

### 手动安装

1. 下载最新的 [Release](https://github.com/weqoocu/obsidian-date-picker-calendar/releases)
2. 解压文件到你的 vault 的 `.obsidian/plugins/date-picker-calendar/` 目录
3. 在 Obsidian 设置中启用插件

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/weqoocu/obsidian-date-picker-calendar.git
cd obsidian-date-picker-calendar

# 安装依赖
npm install

# 构建插件
npm run build

# 开发模式
npm run dev
```

## 使用方法

1. 在笔记中输入日期格式：`📅 2024-01-01`
2. 将光标移动到日期上
3. 自动弹出日历选择器
4. 点击日期或使用快捷选项来更新日期
5. 点击"清除"按钮可以删除整个日期内容

## 截图

![日历选择器界面](screenshot.png)

## 开发

### 项目结构

```
├── src/
│   ├── main.ts          # 主插件文件
│   └── types.ts         # 类型定义
├── styles.css           # 样式文件
├── manifest.json        # 插件清单
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── esbuild.config.mjs   # 构建配置
└── README.md           # 说明文档
```

### 开发环境设置

1. 确保安装了 Node.js (推荐 v16+)
2. 克隆项目并安装依赖
3. 运行 `npm run dev` 启动开发模式
4. 修改代码后会自动重新构建

### 构建命令

- `npm run build` - 构建生产版本
- `npm run dev` - 开发模式（监听文件变化）
- `npm run version` - 更新版本号

## 版本历史

### v1.0.3
- 优化日历界面布局
- 改进快捷选择功能
- 修复主题适配问题

### v1.0.2
- 添加清除日期功能
- 优化光标检测逻辑

### v1.0.1
- 修复日期格式识别问题
- 改进用户体验

### v1.0.0
- 初始版本发布
- 基础日期选择功能

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 作者

**酷口**

📧 邮件联系：musicleaf@qq.com  
🌐 个人网站：[酷口家数字花园](https://weqoocu.com)  
💻 GitHub：[weqoocu](https://github.com/weqoocu)

## 致谢

- 感谢 Obsidian 团队提供优秀的插件 API
- 感谢社区的反馈和建议

---

如果这个插件对你有帮助，请给个 ⭐️ 支持一下！