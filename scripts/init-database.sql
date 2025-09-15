-- 初始化数据库表结构

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建景点表
CREATE TABLE IF NOT EXISTS attractions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  map_x DECIMAL(5, 2),
  map_y DECIMAL(5, 2),
  category_id INTEGER REFERENCES categories(id),
  opening_hours VARCHAR(255),
  ticket_price VARCHAR(100),
  contact_phone VARCHAR(50),
  address VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建攻略表
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image VARCHAR(500),
  category_id INTEGER REFERENCES categories(id),
  author VARCHAR(100),
  views INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_attractions_category ON attractions(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_attractions_active ON attractions(is_active);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);

-- 启用行级安全 (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 为管理员用户表创建策略（仅允许管理员访问）
CREATE POLICY "管理员可以访问分类" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "管理员可以访问景点" ON attractions FOR ALL TO authenticated USING (true);
CREATE POLICY "管理员可以访问攻略" ON articles FOR ALL TO authenticated USING (true);
CREATE POLICY "管理员可以访问用户" ON admin_users FOR ALL TO authenticated USING (true);

-- 为公共访问创建视图和策略
CREATE OR REPLACE VIEW public_attractions AS
  SELECT id, name, description, image, latitude, longitude, map_x, map_y, opening_hours, ticket_price, address, created_at
  FROM attractions
  WHERE is_active = true;

CREATE OR REPLACE VIEW public_articles AS
  SELECT id, title, content, image, author, views, created_at
  FROM articles
  WHERE is_published = true;

-- 允许公共读取视图
CREATE POLICY "允许公共读取景点" ON public_attractions FOR SELECT USING (true);
CREATE POLICY "允许公共读取攻略" ON public_articles FOR SELECT USING (true);