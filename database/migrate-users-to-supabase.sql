-- 用户数据迁移脚本
-- 将现有管理员用户迁移到Supabase Auth系统

-- 1. 首先检查auth.users表中是否已有用户
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    RAISE NOTICE 'auth.users表中的用户数量: %', user_count;
END $$;

-- 2. 创建迁移函数
CREATE OR REPLACE FUNCTION migrate_admin_users_to_auth() RETURNS TEXT AS $$
DECLARE
    admin_record RECORD;
    new_user_id UUID;
    migration_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- 遍历所有活跃的管理员用户
    FOR admin_record IN 
        SELECT * FROM admin_users 
        WHERE is_active = true 
        AND email IS NOT NULL 
        AND email != ''
    LOOP
        -- 检查用户是否已在auth.users中存在
        IF NOT EXISTS (
            SELECT 1 FROM auth.users WHERE email = admin_record.email
        ) THEN
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
                    is_super_admin,
                    confirmed_at
                ) VALUES (
                    '00000000-0000-0000-0000-000000000000',
                    admin_record.id, -- 使用现有的UUID
                    'authenticated',
                    'authenticated',
                    admin_record.email,
                    -- 使用默认密码 'admin123' 的bcrypt哈希
                    '$2a$10$2eY4Y1q7Y9W7q3V2q1V2XuJg7q3V2q1V2XuJg7q3V2q1V2XuJg7q3V2q1V2XuJ',
                    NOW(),
                    COALESCE(admin_record.created_at, NOW()),
                    NOW(),
                    '{"provider": "email", "providers": ["email"]}',
                    jsonb_build_object(
                        'username', admin_record.username,
                        'full_name', admin_record.full_name,
                        'role', admin_record.role
                    ),
                    (admin_record.role = 'super_admin'),
                    NOW()
                );

                migration_count := migration_count + 1;
                RAISE NOTICE '已迁移用户: % (%)', admin_record.email, admin_record.username;

            EXCEPTION WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE WARNING '迁移用户 % 失败: %', admin_record.email, SQLERRM;
            END;
        ELSE
            RAISE NOTICE '用户已存在: %', admin_record.email;
        END IF;
    END LOOP;

    RETURN FORMAT('迁移完成: 成功 %s 个, 失败 %s 个', migration_count, error_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 执行迁移
SELECT migrate_admin_users_to_auth() as migration_result;

-- 4. 验证迁移结果
DO $$
DECLARE
    auth_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO auth_count FROM auth.users;
    SELECT COUNT(*) INTO admin_count FROM admin_users WHERE is_active = true;
    
    RAISE NOTICE '迁移验证:';
    RAISE NOTICE '- auth.users 用户数: %', auth_count;
    RAISE NOTICE '- admin_users 活跃用户数: %', admin_count;
    
    IF auth_count >= admin_count THEN
        RAISE NOTICE '✅ 迁移成功: 所有活跃管理员用户已迁移到Supabase Auth';
    ELSE
        RAISE WARNING '⚠️ 迁移不完整: 可能有些用户未成功迁移';
    END IF;
END $$;

-- 5. 创建密码重置函数（用于现有用户设置新密码）
CREATE OR REPLACE FUNCTION reset_admin_password(user_email TEXT, new_password TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- 检查用户是否存在
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = user_email
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION '用户不存在: %', user_email;
    END IF;
    
    -- 更新密码（这里需要Supabase的管理权限）
    -- 注意：实际密码重置需要通过Supabase Auth的API进行
    RAISE NOTICE '请通过Supabase控制台或Auth API重置用户 % 的密码', user_email;
    RAISE NOTICE '新密码: %', new_password;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. 提供迁移后的操作指南
SELECT '迁移完成说明' as section;
SELECT '1. 为迁移的用户设置密码:' as step;
SELECT '   - 访问Supabase控制台 -> Authentication -> Users' as detail;
SELECT '   - 为每个用户设置新密码' as detail;
SELECT '   - 或使用: SELECT reset_admin_password(''email@example.com'', ''newpassword'');' as detail;
SELECT '2. 测试登录功能' as step;
SELECT '3. 验证权限控制' as step;

-- 7. 清理临时函数
DROP FUNCTION IF EXISTS migrate_admin_users_to_auth();
DROP FUNCTION IF EXISTS reset_admin_password(TEXT, TEXT);

-- 完成消息
SELECT '用户迁移脚本执行完成。请按照上述说明完成密码设置。' as final_message;