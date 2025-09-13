# Supabase Auth 迁移指南

## 问题诊断

当前系统遇到认证失败问题，具体表现为：
- `POST https://xaoxaodcqcqjhydkrnfd.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)`
- `AuthApiError: Invalid login credentials`

## 根本原因分析

1. **用户数据未迁移**: 现有管理员用户数据在 `admin_users` 表中，但未同步到 Supabase Auth 的 `auth.users` 表
2. **密码哈希不匹配**: 现有系统使用 SHA-256 哈希，而 Supabase Auth 使用 bcrypt
3. **RLS策略限制**: 数据库行级安全策略可能阻止访问

## 解决方案

### 方案一：立即修复（推荐）

使用临时回退认证方案，允许现有用户继续登录：

1. **加载回退脚本**：在登录页面添加临时认证回退
2. **启用回退模式**：系统会自动检测 Supabase Auth 状态并启用回退
3. **用户迁移**：逐步将用户迁移到 Supabase Auth

### 方案二：完整迁移

执行完整的用户数据迁移：

1. **执行迁移脚本**：运行 `database/migrate-users-to-supabase.sql`
2. **重置密码**：为迁移的用户设置新密码
3. **测试认证**：验证 Supabase Auth 正常工作

## 实施步骤

### 步骤1：启用临时回退认证

在登录页面添加回退脚本：

```html
<!-- 在 login.html 中添加 -->
<script src="js/temp-auth-fallback.js"></script>
```

### 步骤2：执行用户数据迁移

在 Supabase SQL 编辑器中执行：

```sql
-- 方法1：执行完整迁移脚本
\i database/migrate-users-to-supabase.sql

-- 方法2：手动检查用户数据
SELECT * FROM admin_users WHERE is_active = true;
SELECT * FROM auth.users;
```

### 步骤3：设置用户密码

为迁移的用户设置密码：

1. 访问 Supabase 控制台 → Authentication → Users
2. 为每个用户设置新密码
3. 或使用密码重置功能

### 步骤4：测试认证

测试登录功能：

1. 访问 `/admin/login.html`
2. 使用现有凭据登录
3. 验证权限控制

## 故障排除

### 常见问题及解决方案

#### 问题1：Invalid login credentials
**原因**: 用户不存在于 auth.users 表或密码不匹配
**解决**: 
- 执行用户迁移脚本
- 重置用户密码

#### 问题2：JWT cryptographic operation failed
**原因**: API 密钥或认证配置错误
**解决**: 
- 检查 `config/supabase.js` 中的配置
- 验证 Supabase 项目设置

#### 问题3：Permission denied
**原因**: RLS 策略阻止访问
**解决**: 
- 执行 RLS 策略设置脚本
- 检查用户权限

#### 问题4：User not found
**原因**: 用户未迁移或未激活
**解决**: 
- 检查 `admin_users` 表中的用户状态
- 确保 `is_active = true`

## 回退认证说明

### 工作原理

1. **自动检测**: 系统检测 Supabase Auth 状态
2. **回退启用**: 如果 Auth 失败但本地用户存在，启用回退
3. **SHA-256 验证**: 使用现有密码哈希验证
4. **模拟会话**: 创建兼容的认证会话

### 回退模式特性

- ✅ 支持现有用户登录
- ✅ 保持权限验证
- ✅ 兼容现有 API
- ✅ 自动日志记录
- ✅ 平滑过渡到 Supabase Auth

### 禁用回退

当 Supabase Auth 完全配置后，可禁用回退：

```javascript
// 禁用回退模式
if (window.tempAuthFallback) {
    window.tempAuthFallback.disableFallbackMode();
}
```

## 数据迁移详细说明

### 迁移内容

| 字段 | 源表 (admin_users) | 目标表 (auth.users) |
|------|-------------------|---------------------|
| 用户ID | id | id |
| 邮箱 | email | email |
| 用户名 | username | raw_user_meta_data->username |
| 姓名 | full_name | raw_user_meta_data->full_name |
| 角色 | role | raw_user_meta_data->role |
| 状态 | is_active | 通过 confirmed_at 控制 |

### 密码处理

- **现有系统**: SHA-256 哈希
- **Supabase Auth**: bcrypt 哈希
- **迁移策略**: 需要重置密码

### RLS 策略要求

确保以下策略已启用：

```sql
-- 管理员可管理用户
CREATE POLICY "管理员可管理用户" ON admin_users FOR ALL USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE is_active = true)
);
```

## 验证检查清单

### 迁移前验证
- [ ] 备份数据库
- [ ] 检查现有用户数据
- [ ] 验证 Supabase 项目配置

### 迁移中验证  
- [ ] 用户数据迁移成功
- [ ] 密码重置完成
- [ ] RLS 策略生效

### 迁移后验证
- [ ] 用户可正常登录
- [ ] 权限控制正常工作
- [ ] API 认证通过
- [ ] 回退模式可禁用

## 支持与帮助

### 紧急支持
如果遇到紧急问题，可临时启用完全回退模式：

```javascript
// 强制启用回退模式
window.tempAuthFallback.isFallbackMode = true;
```

### 技术咨询
联系技术支持时请提供：
1. 浏览器控制台错误信息
2. Supabase 项目 ID
3. 用户邮箱（脱敏）

### 文档参考
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [迁移最佳实践](https://supabase.com/docs/guides/migrations)

---

**最后更新**: 2025-09-13  
**系统版本**: v2.0.1  
**认证状态**: 🔄 迁移进行中