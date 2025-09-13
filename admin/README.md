# 旅游导览管理后台

基于Vue3 + Element Plus + Supabase的管理后台系统

## 功能特点

- 🎨 **现代化界面**: 基于Element Plus组件库设计的美观界面
- 📱 **响应式布局**: 适配不同屏幕尺寸的响应式设计
- 🔐 **权限管理**: 基于Supabase Auth的管理员权限控制
- 🗃️ **数据管理**: 完整的分类、景点、文章、路线管理功能
- 🗺️ **地图配置**: 地图背景和标记管理功能
- 📊 **数据统计**: 仪表盘数据统计展示

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **UI框架**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **构建工具**: Vite
- **后端服务**: Supabase
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth

## 项目结构

```
admin/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── assets/             # 静态资源
│   ├── components/         # 组件
│   │   └── common/         # 公共组件
│   ├── router/             # 路由配置
│   ├── services/           # 服务层
│   ├── store/              # 状态管理
│   ├── styles/             # 样式文件
│   ├── utils/              # 工具函数
│   ├── views/              # 页面组件
│   │   ├── category/       # 分类管理
│   │   ├── attraction/     # 景点管理
│   │   ├── article/        # 文章管理
│   │   ├── route/          # 路线管理
│   │   ├── map/            # 地图管理
│   │   ├── Login.vue       # 登录页面
│   │   ├── Layout.vue      # 主布局
│   │   └── Dashboard.vue   # 仪表盘
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── .env                    # 环境变量配置
├── .env.example            # 环境变量示例
├── index.html              # 入口HTML
├── package.json            # 项目配置
├── README.md               # 项目说明
└── vite.config.js          # Vite配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 [.env.example](file:///d%3A/%E9%A1%B9%E7%9B%AE/guide/admin/.env.example) 文件并重命名为 [.env](file:///d%3A/%E9%A1%B9%E7%9B%AE/guide/admin/.env)，然后根据需要修改配置：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run dev
```

默认访问地址: http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产版本

```bash
npm run preview
```

## 功能模块

### 1. 仪表盘
- 数据统计展示
- 快捷操作入口

### 2. 分类管理
- 分类列表展示
- 添加/编辑/删除分类

### 3. 景点管理
- 景点列表展示
- 添加/编辑/删除景点
- 图片上传
- 坐标标记

### 4. 文章管理
- 文章列表展示
- 添加/编辑/删除文章
- 富文本编辑
- 图片上传

### 5. 路线管理
- 路线列表展示
- 添加/编辑/删除路线
- 景点选择

### 6. 地图管理
- 地图背景配置
- 景点标记管理

## 开发规范

### 代码风格
- 遵循Vue 3 Composition API规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化

### 组件开发
- 组件命名使用PascalCase
- 组件文件使用PascalCase.vue命名
- 组件内部使用kebab-case属性名

### 样式规范
- 使用SCSS预处理器
- 遵循BEM命名规范
- 全局样式放在styles目录下

## 部署说明

### 静态部署
构建后的文件可以部署到任何静态网站托管服务：

```bash
npm run build
```

### 环境变量
确保在生产环境中正确配置环境变量。

## 常见问题

### 1. 登录失败
- 检查Supabase配置是否正确
- 确认管理员账户是否存在

### 2. 数据加载失败
- 检查网络连接
- 确认Supabase服务是否正常

### 3. 图片上传失败
- 检查存储桶权限配置
- 确认文件大小是否超出限制

## 许可证

MIT License