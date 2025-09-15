# 数据库填充脚本

这个目录包含了用于填充数据库默认数据的脚本。

## 使用方法

1. 首先安装依赖：
   ```
   npm install
   ```

2. 在 `seed-database.js` 中替换 Supabase 配置：
   ```javascript
   const SUPABASE_URL = 'your_supabase_url';
   const SUPABASE_SERVICE_KEY = 'your_supabase_service_key';
   ```

3. 运行填充脚本：
   ```
   npm run seed
   ```

## 注意事项

- 需要使用 Supabase 的服务角色密钥（service role key）而不是匿名密钥来插入数据
- 脚本会插入默认的分类、景点和攻略数据
- 如果表中已有数据，脚本会添加新数据而不是覆盖现有数据