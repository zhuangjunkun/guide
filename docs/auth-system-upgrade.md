# 认证系统升级指南

## 概述

本系统已从混合认证模式升级为统一的Supabase Auth认证系统，提供了更安全、更标准的认证解决方案。

## 主要变更

### 1. 认证架构重构

**之前**: 混合认证（本地数据库密码验证 + Supabase Auth）
**现在**: 统一的Supabase Auth认证

### 2. 安全改进

- 移除SHA-256密码哈希，使用Supabase内置的bcrypt加密
- 添加完整的行级安全（RLS）策略
- 统一的错误处理和会话管理

### 3. API认证中间件

所有管理API现在都包含认证中间件，确保只有认证的管理员可以执行写操作：

```javascript
// 示例：认证中间件
async requireAuth() {
    const { session } = await this.supabase.auth.getSession();
    if (!session) throw new Error('未登录');
    
    // 验证管理员权限
    const adminUser = await this.validateAdminUser(session.user.id);
    if (!adminUser) throw new Error('无管理员权限');
    
    return { session, adminUser };
}
```

## 数据库设置

### 1. 执行RLS策略脚本

在Supabase SQL编辑器中执行：

```sql
\i database/setup-rls-policies.sql
```

### 2. 创建管理员账户

系统会自动创建默认管理员账户：
- 邮箱: admin@example.com
- 密码: admin123
- 角色: super_admin

## 登录流程变更

### 之前
- 使用用户名和密码
- 本地数据库验证
- SHA-256密码哈希

### 现在
- 使用邮箱和密码  
- Supabase Auth验证
- bcrypt密码加密
- JWT会话管理

## API认证要求

### 需要认证的操作

| 操作类型 | API方法 | 权限要求 |
|---------|---------|----------|
| 创建 | create() | 管理员 |
| 更新 | update() | 管理员 |
| 删除 | delete() | 管理员 |
| 管理 | 所有管理操作 | 管理员 |

### 公开读取的操作

| 操作类型 | API方法 | 权限要求 |
|---------|---------|----------|
| 查询 | getAll() | 公开 |
| 获取详情 | getById() | 公开 |
| 搜索 | search() | 公开 |

## 错误代码处理

系统现在提供更详细的错误信息：

| 错误代码 | 含义 | 处理建议 |
|---------|------|----------|
| PGRST301 | 认证失败 | 重新登录 |
| 42501 | 权限不足 | 检查用户角色 |
| PGRST116 | 数据不存在 | 检查数据ID |
| 23505 | 数据已存在 | 检查重复项 |

## 迁移步骤

### 1. 更新数据库

执行RLS策略脚本：
```bash
psql -h your-supabase-url -U postgres -d your-database -f database/setup-rls-policies.sql
```

### 2. 更新管理员密码

现有管理员需要重置密码以使用Supabase Auth：

```javascript
// 在登录页面使用重置功能
await authService.resetAdminPassword('admin@example.com', 'newpassword');
```

### 3. 测试认证

验证登录功能：
1. 访问 `/admin/login.html`
2. 使用邮箱登录
3. 验证权限控制

## 故障排除

### 常见问题

1. **登录失败**
   - 检查Supabase项目配置
   - 验证RLS策略是否启用

2. **权限错误**
   - 确认用户有管理员角色
   - 检查admin_users表中的is_active状态

3. **会话过期**
   - 检查Supabase Auth配置
   - 验证JWT有效期设置

### 技术支持

如果遇到问题，请检查：
- Supabase控制台日志
- 浏览器开发者工具中的网络请求
- 应用程序控制台错误信息

## 安全最佳实践

1. **定期更换密码**
2. **使用强密码策略**
3. **启用双因素认证**
4. **定期审计用户权限**
5. **监控登录活动**

## 版本兼容性

此升级与现有数据兼容，但需要：
- 执行数据库迁移脚本
- 更新管理员认证方式
- 重新配置客户端应用

---

**升级完成时间**: 2025-09-13
**系统版本**: v2.0.0
**认证提供商**: Supabase Auth