-- 旅游导览系统数据库初始化脚本
-- 在Supabase SQL编辑器中执行此脚本

-- 1. 创建分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建景点表
CREATE TABLE IF NOT EXISTS attractions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    summary TEXT,
    address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    website VARCHAR(255),
    opening_hours JSONB,
    ticket_price VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    facilities JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建路线表
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    summary TEXT,
    duration VARCHAR(100),
    difficulty VARCHAR(50),
    distance DECIMAL(8, 2),
    attractions JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    tips TEXT,
    best_time VARCHAR(100),
    estimated_cost VARCHAR(100),
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建文章表（攻略文章）
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    summary TEXT,
    content TEXT,
    cover_image VARCHAR(500),
    author VARCHAR(100),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建用户表（扩展Supabase auth.users）
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(255),
    avatar_url VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建管理员表
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 创建收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    attraction_id INTEGER REFERENCES attractions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, attraction_id)
);

-- 8. 创建评论表
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    attraction_id INTEGER REFERENCES attractions(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 创建系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attractions_updated_at BEFORE UPDATE ON attractions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认分类数据
INSERT INTO categories (name, description, icon, sort_order) VALUES
('历史文化', '历史文化类景点，包括古建筑、博物馆、文化遗址等', '🏛️', 1),
('自然风光', '自然风光类景点，包括山川、湖泊、公园等', '🌄', 2),
('现代建筑', '现代建筑类景点，包括摩天大楼、现代艺术建筑等', '🏢', 3),
('休闲娱乐', '休闲娱乐类景点，包括游乐园、购物中心等', '🎡', 4),
('美食文化', '美食文化类景点，包括特色餐厅、美食街等', '🍜', 5)
ON CONFLICT (name) DO NOTHING;

-- 插入默认系统设置
INSERT INTO system_settings (key, value, description) VALUES
('site_name', '"旅游导览系统"', '网站名称'),
('site_description', '"专业的旅游景点导览平台"', '网站描述'),
('contact_email', '"admin@example.com"', '联系邮箱'),
('max_upload_size', '5242880', '最大上传文件大小（字节）'),
('items_per_page', '10', '每页显示项目数')
ON CONFLICT (key) DO NOTHING;

-- 启用行级安全策略 (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略

-- 分类表策略（公开读取，管理员可写）
CREATE POLICY "分类公开读取" ON categories FOR SELECT USING (true);
CREATE POLICY "管理员可管理分类" ON categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.is_active = true
    )
);

-- 景点表策略（公开读取活跃景点，管理员可管理所有）
CREATE POLICY "公开读取活跃景点" ON attractions FOR SELECT USING (is_active = true);
CREATE POLICY "管理员可管理景点" ON attractions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.is_active = true
    )
);

-- 路线表策略（公开读取活跃路线，管理员可管理所有）
CREATE POLICY "公开读取活跃路线" ON routes FOR SELECT USING (is_active = true);
CREATE POLICY "管理员可管理路线" ON routes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.is_active = true
    )
);

-- 文章表策略（公开读取已发布文章，管理员可管理所有）
CREATE POLICY "公开读取已发布文章" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "管理员可管理文章" ON articles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.is_active = true
    )
);

-- 用户资料策略（用户可管理自己的资料）
CREATE POLICY "用户可查看所有资料" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "用户可管理自己的资料" ON user_profiles FOR ALL USING (auth.uid() = id);

-- 管理员表策略（只有管理员可以查看和管理）
CREATE POLICY "管理员可查看管理员信息" ON admin_users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.is_active = true
    )
);
CREATE POLICY "超级管理员可管理管理员" ON admin_users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.role = 'super_admin'
        AND admin_users.is_active = true
    )
);

-- 收藏表策略（用户可管理自己的收藏）
CREATE POLICY "用户可管理自己的收藏" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- 评论表策略（公开读取已审核评论，用户可管理自己的评论）
CREATE POLICY "公开读取已审核评论" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "用户可管理自己的评论" ON reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "管理员可管理所有评论" ON reviews FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.is_active = true
    )
);

-- 系统设置策略（公开读取，管理员可写）
CREATE POLICY "公开读取系统设置" ON system_settings FOR SELECT USING (true);
CREATE POLICY "管理员可管理系统设置" ON system_settings FOR ALL USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.id = auth.uid() 
        AND admin_users.is_active = true
    )
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_attractions_category_id ON attractions(category_id);
CREATE INDEX IF NOT EXISTS idx_attractions_is_active ON attractions(is_active);
CREATE INDEX IF NOT EXISTS idx_attractions_is_featured ON attractions(is_featured);
CREATE INDEX IF NOT EXISTS idx_attractions_rating ON attractions(rating);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_attraction_id ON user_favorites(attraction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_attraction_id ON reviews(attraction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- 创建视图以简化查询
CREATE OR REPLACE VIEW attractions_with_category AS
SELECT 
    a.*,
    c.name as category_name,
    c.icon as category_icon
FROM attractions a
LEFT JOIN categories c ON a.category_id = c.id;

CREATE OR REPLACE VIEW attractions_stats AS
SELECT 
    a.id,
    a.name,
    a.rating,
    a.view_count,
    COUNT(r.id) as review_count,
    AVG(r.rating) as avg_rating
FROM attractions a
LEFT JOIN reviews r ON a.id = r.attraction_id AND r.is_approved = true
GROUP BY a.id, a.name, a.rating, a.view_count;

-- 完成初始化
SELECT 'Database initialization completed successfully!' as message;