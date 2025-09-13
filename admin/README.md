# 旅游导览系统 - 管理后台

## 系统概述

基于Supabase + 腾讯云服务的旅游导览系统管理后台，提供完整的内容管理和地图编辑功能。

## 功能特性

- 📊 **仪表板** - 系统概览和统计数据
- 📁 **分类管理** - 攻略文章分类管理
- 🏞️ **景点管理** - 景点信息管理
- 📝 **文章管理** - 攻略文章编辑发布
- 🗺️ **地图编辑器** - 可视化地图标记管理
- ⚙️ **系统设置** - 系统配置和参数设置
- 🔐 **权限管理** - 多角色用户权限控制

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **后端**: Supabase (PostgreSQL)
- **存储**: 腾讯云COS对象存储
- **地图**: OpenStreetMap + 自定义标记
- **部署**: 静态文件部署

## 安装部署

### 环境要求

- Node.js 16+ 
- 现代浏览器 (Chrome 80+, Firefox 75+, Safari 13+)
- Supabase 账号
- 腾讯云账号 (可选)

### 1. 克隆项目

```bash
git clone <repository-url>
cd guide
```

### 2. 环境配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置您的Supabase和腾讯云信息：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 腾讯云配置 (可选)
VITE_TENCENT_CLOUD_SECRET_ID=your-secret-id
VITE_TENCENT_CLOUD_SECRET_KEY=your-secret-key
VITE_TENCENT_CLOUD_REGION=ap-beijing
VITE_TENCENT_CLOUD_BUCKET=your-bucket-name
```

### 3. 数据库初始化

执行数据库初始化脚本：

```sql
-- 在 Supabase SQL Editor 中执行 database/init.sql
```

### 4. 启动开发服务器

```bash
# 使用 Live Server 或其他静态文件服务器
npx serve admin
```

或使用Python内置服务器：

```bash
cd admin
python -m http.server 8000
```

访问 http://localhost:8000 查看管理后台。

## 使用说明

### 登录系统

1. 访问管理后台首页
2. 使用默认管理员账号登录：
   - 用户名: admin
   - 密码: admin123

### 功能模块

#### 仪表板
- 查看系统统计数据
- 快速操作入口
- 实时数据刷新

#### 分类管理
- 添加、编辑、删除文章分类
- 设置分类排序和显示状态
- 批量操作支持

#### 景点管理  
- 管理景点基本信息
- 设置坐标位置
- 上传景点图片
- 关联地图标记

#### 文章管理
- 富文本编辑器支持
- 图片上传和管理
- 发布状态控制
- SEO优化设置

#### 地图编辑器
- 可视化地图标记
- 拖拽式标记放置
- 实时预览效果
- 批量导入导出

#### 系统设置
- 基本配置
- 地图参数设置
- 文件上传配置
- 系统维护功能

## 数据库结构

主要数据表：

- `categories` - 文章分类表
- `articles` - 攻略文章表  
- `attractions` - 景点信息表
- `map_markers` - 地图标记表
- `settings` - 系统设置表
- `users` - 用户管理表

## API接口

所有API接口通过Supabase客户端调用：

```javascript
// 示例：获取分类列表
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .order('created_at', { ascending: false });
```

## 部署指南

### 静态文件部署

将 `admin` 目录部署到任何静态文件服务器：

- Nginx
- Apache
- Netlify
- Vercel
- GitHub Pages

### 环境配置

确保生产环境正确配置环境变量：

```bash
# 生产环境示例
VITE_SUPABASE_URL=https://production.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
VITE_DEBUG=false
```

## 故障排除

### 常见问题

1. **登录失败**
   - 检查Supabase配置是否正确
   - 确认数据库用户表已初始化

2. **地图不显示**
   - 检查网络连接
   - 确认地图服务配置

3. **文件上传失败**
   - 检查腾讯云配置
   - 确认存储桶权限

### 获取帮助

- 查看控制台错误信息
- 检查浏览器开发者工具
- 查阅Supabase文档

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础管理功能
- 地图编辑器集成

## 许可证

MIT License

## 支持

如有问题请联系技术支持团队。