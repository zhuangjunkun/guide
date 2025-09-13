-- 修复管理员认证问题的SQL脚本
-- 在Supabase SQL编辑器中执行

-- 1. 首先检查现有用户状态
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    aud,
    role
FROM auth.users 
WHERE email = 'admin@example.com';

-- 2. 删除现有的管理员用户（如果存在问题）
DELETE FROM admin_users WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

DELETE FROM auth.users WHERE email = 'admin@example.com';

-- 3. 重新创建管理员用户（使用正确的方法）
-- 注意：这里使用Supabase推荐的方式创建用户
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
    hashed_password text;
BEGIN
    -- 生成正确的密码哈希
    hashed_password := crypt('admin123', gen_salt('bf'));
    
    -- 插入到auth.users表
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
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'admin@example.com',
        hashed_password,
        NOW(), -- 确认邮箱
        NOW(),
        '',
        NOW(),
        '',
        NOW(),
        '',
        '',
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"username": "admin"}',
        false,
        NOW(),
        NOW(),
        null,
        null,
        '',
        '',
        NOW(),
        '',
        0,
        NOW(),
        '',
        NOW()
    );
    
    -- 插入到admin_users表
    INSERT INTO admin_users (
        id,
        username,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'admin',
        'super_admin',
        true,
        NOW(),
        NOW()
    );
    
    -- 插入到identities表（重要：这是Supabase认证必需的）
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
        new_user_id,
        format('{"sub":"%s","email":"%s"}', new_user_id::text, 'admin@example.com')::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '管理员用户创建成功，ID: %', new_user_id;
END $$;

-- 4. 验证创建结果
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.role,
    au.username,
    au.role as admin_role,
    au.is_active
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.id
WHERE u.email = 'admin@example.com';

-- 5. 检查identities表
SELECT 
    i.id,
    i.user_id,
    i.provider,
    i.identity_data,
    i.created_at
FROM auth.identities i
JOIN auth.users u ON i.user_id = u.id
WHERE u.email = 'admin@example.com';

-- 6. 显示登录信息
SELECT 
    'admin@example.com' as 邮箱,
    'admin123' as 密码,
    '用户已重新创建，请尝试登录' as 状态;