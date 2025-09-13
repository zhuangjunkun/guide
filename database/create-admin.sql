-- 创建测试管理员账户的SQL脚本
-- 注意：这个脚本需要在Supabase控制台的SQL编辑器中执行

-- 1. 首先创建认证用户（如果不存在）
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- 检查用户是否已存在
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'admin@example.com';
    
    -- 如果用户不存在，则创建
    IF user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@example.com',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO user_id;
        
        RAISE NOTICE '管理员用户创建成功，ID: %', user_id;
    ELSE
        RAISE NOTICE '管理员用户已存在，ID: %', user_id;
    END IF;
    
    -- 2. 在admin_users表中创建管理员记录（如果不存在）
    INSERT INTO admin_users (id, username, role, is_active, created_at, updated_at)
    VALUES (user_id, 'admin', 'super_admin', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();
    
    RAISE NOTICE '管理员记录创建/更新成功';
    
END $$;

-- 3. 插入一些测试分类数据
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('历史文化', '历史文化类景点，包括古建筑、博物馆等', NOW(), NOW()),
('自然风光', '自然风景类景点，包括山川、湖泊、公园等', NOW(), NOW()),
('现代娱乐', '现代娱乐设施，包括游乐园、购物中心等', NOW(), NOW()),
('美食餐饮', '特色美食和餐饮场所', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. 插入一些测试景点数据
INSERT INTO attractions (name, description, address, latitude, longitude, category_id, opening_hours, ticket_price, contact_phone, website, images, is_active, created_at, updated_at)
SELECT 
    '故宫博物院',
    '中国明清两代的皇家宫殿，世界文化遗产',
    '北京市东城区景山前街4号',
    39.9163,
    116.3972,
    c.id,
    '08:30-17:00',
    60.00,
    '010-85007421',
    'https://www.dpm.org.cn',
    '[]'::jsonb,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.name = '历史文化'
ON CONFLICT (name) DO NOTHING;

INSERT INTO attractions (name, description, address, latitude, longitude, category_id, opening_hours, ticket_price, contact_phone, website, images, is_active, created_at, updated_at)
SELECT 
    '天安门广场',
    '世界上最大的城市广场之一，中华人民共和国的象征',
    '北京市东城区东长安街',
    39.9042,
    116.3974,
    c.id,
    '全天开放',
    0.00,
    '',
    '',
    '[]'::jsonb,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.name = '历史文化'
ON CONFLICT (name) DO NOTHING;

INSERT INTO attractions (name, description, address, latitude, longitude, category_id, opening_hours, ticket_price, contact_phone, website, images, is_active, created_at, updated_at)
SELECT 
    '颐和园',
    '中国古典园林之首，世界文化遗产',
    '北京市海淀区新建宫门路19号',
    39.9998,
    116.2755,
    c.id,
    '06:30-18:00',
    30.00,
    '010-62881144',
    'http://www.summerpalace-china.com',
    '[]'::jsonb,
    true,
    NOW(),
    NOW()
FROM categories c WHERE c.name = '自然风光'
ON CONFLICT (name) DO NOTHING;

-- 5. 插入系统设置
INSERT INTO system_settings (key, value, description, created_at, updated_at) VALUES
('site_name', '旅游导览系统', '网站名称', NOW(), NOW()),
('site_description', '专业的旅游景点导览和推荐平台', '网站描述', NOW(), NOW()),
('admin_email', 'admin@example.com', '管理员邮箱', NOW(), NOW()),
('max_upload_size', '10485760', '最大上传文件大小（字节）', NOW(), NOW()),
('enable_registration', 'true', '是否允许用户注册', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- 显示创建结果
SELECT 
    'admin@example.com' as 管理员邮箱,
    'admin123' as 管理员密码,
    '请使用以上账户登录管理后台' as 说明;

SELECT 
    COUNT(*) as 分类数量
FROM categories;

SELECT 
    COUNT(*) as 景点数量
FROM attractions;

SELECT 
    COUNT(*) as 管理员数量
FROM admin_users;