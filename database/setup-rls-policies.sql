-- Supabase RLS策略设置脚本
-- 在Supabase SQL编辑器中执行此脚本以启用完整的行级安全

-- 启用所有表的行级安全
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "分类公开读取" ON categories;
DROP POLICY IF EXISTS "管理员可管理分类" ON categories;
DROP POLICY IF EXISTS "公开读取活跃景点" ON attractions;
DROP POLICY IF EXISTS "管理员可管理景点" ON attractions;
DROP POLICY IF EXISTS "公开读取活跃路线" ON routes;
DROP POLICY IF EXISTS "管理员可管理路线" ON routes;
DROP POLICY IF EXISTS "公开读取已发布文章" ON articles;
DROP POLICY IF EXISTS "管理员可管理文章" ON articles;
DROP POLICY IF EXISTS "用户可查看所有资料" ON user_profiles;
DROP POLICY IF EXISTS "用户可管理自己的资料" ON user_profiles;
DROP POLICY IF EXISTS "管理员可查看管理员信息" ON admin_users;
DROP POLICY IF EXISTS "超级管理员可管理管理员" ON admin_users;
DROP POLICY IF EXISTS "用户可管理自己的收藏" ON user_favorites;
DROP POLICY IF EXISTS "公开读取已审核评论" ON reviews;
DROP POLICY IF EXISTS "用户可管理自己的评论" ON reviews;
DROP POLICY IF EXISTS "管理员可管理所有评论" ON reviews;
DROP POLICY IF EXISTS "公开读取系统设置" ON system_settings;
DROP POLICY IF EXISTS "管理员可管理系统设置" ON system_settings;

-- 创建新的RLS策略

-- 分类表策略
CREATE POLICY "分类公开读取" ON categories FOR SELECT USING (true);
CREATE POLICY "管理员可管理分类" ON categories FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
));

-- 景点表策略
CREATE POLICY "公开读取活跃景点" ON attractions FOR SELECT USING (is_active = true);
CREATE POLICY "管理员可管理景点" ON attractions FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
));

-- 路线表策略
CREATE POLICY "公开读取活跃路线" ON routes FOR SELECT USING (is_active = true);
CREATE POLICY "管理员可管理路线" ON routes FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
));

-- 文章表策略
CREATE POLICY "公开读取已发布文章" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "管理员可管理文章" ON articles FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
));

-- 用户资料表策略
CREATE POLICY "用户可查看所有资料" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "用户可管理自己的资料" ON user_profiles FOR ALL USING (auth.uid() = id);

-- 管理员表策略
CREATE POLICY "管理员可查看管理员信息" ON admin_users FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
));
CREATE POLICY "超级管理员可管理管理员" ON admin_users FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.role = 'super_admin'
    AND admin_users.is_active = true
));

-- 收藏表策略
CREATE POLICY "用户可管理自己的收藏" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- 评论表策略
CREATE POLICY "公开读取已审核评论" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "用户可管理自己的评论" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "管理员可管理所有评论" ON reviews FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
));

-- 系统设置表策略
CREATE POLICY "公开读取系统设置" ON system_settings FOR SELECT USING (true);
CREATE POLICY "管理员可管理系统设置" ON system_settings FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid() 
    AND admin_users.is_active = true
));

-- 创建管理员用户函数（用于初始化）
CREATE OR REPLACE FUNCTION create_admin_user(
    p_email TEXT,
    p_password TEXT,
    p_username TEXT,
    p_full_name TEXT,
    p_role TEXT DEFAULT 'admin'
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 在auth.users中创建用户
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        p_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false
    ) RETURNING id INTO v_user_id;

    -- 在admin_users中创建记录
    INSERT INTO admin_users (
        id,
        username,
        email,
        full_name,
        role,
        is_active
    ) VALUES (
        v_user_id,
        p_username,
        p_email,
        p_full_name,
        p_role,
        true
    );

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建默认管理员账户（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin') THEN
        PERFORM create_admin_user(
            'admin@example.com',
            'admin123',
            'admin',
            '系统管理员',
            'super_admin'
        );
        RAISE NOTICE '默认管理员账户已创建';
    ELSE
        RAISE NOTICE '管理员账户已存在';
    END IF;
END $$;

-- 完成消息
SELECT 'RLS策略设置完成' as message;