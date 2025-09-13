-- 简化的管理员账户修复脚本
-- 请在Supabase SQL编辑器中执行

-- 1. 临时禁用RLS以确保操作成功
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- 2. 清理现有的管理员数据
DELETE FROM admin_users WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- 3. 删除现有用户（如果存在）
DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
DELETE FROM auth.users WHERE email = 'admin@example.com';

-- 4. 使用Supabase推荐的方式创建用户
-- 注意：这个方法会创建一个已验证的用户
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    '',
    now(),
    '',
    now(),
    '',
    '',
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "admin"}',
    false,
    now(),
    now()
);

-- 5. 获取刚创建的用户ID并创建管理员记录
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- 获取用户ID
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@example.com';
    
    -- 创建identities记录（这是关键！）
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        user_id,
        format('{"sub":"%s","email":"%s"}', user_id::text, 'admin@example.com')::jsonb,
        'email',
        now(),
        now(),
        now()
    );
    
    -- 创建管理员记录
    INSERT INTO admin_users (
        id,
        username,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'admin',
        'super_admin',
        true,
        now(),
        now()
    );
    
    RAISE NOTICE '管理员账户创建成功，用户ID: %', user_id;
END $$;

-- 6. 重新启用RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 7. 验证创建结果
SELECT 
    'admin@example.com' as 邮箱,
    'admin123' as 密码,
    '账户已重新创建' as 状态;

-- 8. 检查用户状态
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as 邮箱已确认,
    u.role,
    au.username,
    au.role as 管理员角色,
    au.is_active as 是否激活
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.id
WHERE u.email = 'admin@example.com';

-- 9. 检查identities表
SELECT 
    '身份验证记录' as 类型,
    COUNT(*) as 数量
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
WHERE u.email = 'admin@example.com';