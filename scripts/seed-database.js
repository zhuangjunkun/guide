// 数据库种子脚本
const { createClient } = require('@supabase/supabase-js');

// Supabase配置 - 需要替换为实际的URL和密钥
const SUPABASE_URL = 'https://xaoxaodcqcqjhydkrnfd.supabase.co';
// 注意：这里需要使用服务角色密钥而不是匿名密钥来插入数据
const SUPABASE_SERVICE_KEY = 'YOUR_SUPABASE_SERVICE_KEY_HERE';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 默认分类数据
const defaultCategories = [
  {
    name: '自然景观',
    description: '自然形成的景观，如山川、湖泊、森林等'
  },
  {
    name: '历史古迹',
    description: '具有历史价值的古建筑、遗址等'
  },
  {
    name: '文化场馆',
    description: '博物馆、美术馆、图书馆等文化场所'
  },
  {
    name: '主题公园',
    description: '娱乐性主题公园和游乐园'
  },
  {
    name: '美食街区',
    description: '特色美食和餐饮街区'
  }
];

// 默认景点数据
const defaultAttractions = [
  {
    name: '西湖',
    description: '西湖，位于浙江省杭州市西湖区龙井路1号，杭州市区西部，景区总面积49平方千米，汇水面积21.22平方千米，湖面面积6.38平方千米。',
    image: 'https://picsum.photos/300/150?random=11',
    latitude: 30.2741,
    longitude: 120.1551,
    map_x: 25.00,
    map_y: 30.00,
    opening_hours: '全天开放',
    ticket_price: '免费',
    address: '浙江省杭州市西湖区龙井路1号',
    is_active: true,
    sort_order: 1
  },
  {
    name: '灵隐寺',
    description: '灵隐寺，又名云林寺，位于浙江省杭州市，背靠北高峰，面朝飞来峰，始建于东晋咸和元年（326年），占地面积约87000平方米。',
    image: 'https://picsum.photos/300/150?random=12',
    latitude: 30.2408,
    longitude: 120.1014,
    map_x: 45.00,
    map_y: 25.00,
    opening_hours: '06:00-18:00',
    ticket_price: '30元',
    address: '浙江省杭州市西湖区法云弄1号',
    is_active: true,
    sort_order: 2
  },
  {
    name: '宋城',
    description: '杭州宋城景区是中国大陆人气最旺的主题公园，年游客逾700万人次。秉承"建筑为形，文化为魂"的经营理念。',
    image: 'https://picsum.photos/300/150?random=13',
    latitude: 30.1957,
    longitude: 120.0778,
    map_x: 60.00,
    map_y: 45.00,
    opening_hours: '09:00-21:00',
    ticket_price: '300元',
    address: '浙江省杭州市西湖区之江路148号',
    is_active: true,
    sort_order: 3
  },
  {
    name: '河坊街',
    description: '河坊街位于吴山脚下，是清河坊的一部分，属于杭州老城区，旧时，与中山中路相交得"清河坊四拐角"，自民国以来，分别为孔凤春香粉店、宓大昌旱烟、万隆火腿店、张允升帽庄四家各踞一角，成为当时远近闻名得区片。',
    image: 'https://picsum.photos/300/150?random=14',
    latitude: 30.2467,
    longitude: 120.1707,
    map_x: 35.00,
    map_y: 60.00,
    opening_hours: '全天开放',
    ticket_price: '免费',
    address: '浙江省杭州市上城区河坊街',
    is_active: true,
    sort_order: 4
  }
];

// 默认攻略数据
const defaultArticles = [
  {
    title: '杭州三日游攻略',
    content: '杭州三日游详细攻略，包含西湖、灵隐寺、宋城等热门景点的游览路线和注意事项。',
    image: 'https://picsum.photos/400/200?random=21',
    author: '旅游达人',
    views: 1250,
    is_published: true,
    sort_order: 1
  },
  {
    title: '西湖十景游览指南',
    content: '详细介绍西湖十景的历史背景、最佳游览时间和摄影技巧，帮助您更好地欣赏西湖美景。',
    image: 'https://picsum.photos/400/200?random=22',
    author: '摄影爱好者',
    views: 890,
    is_published: true,
    sort_order: 2
  },
  {
    title: '杭州美食地图',
    content: '杭州特色美食推荐，包括西湖醋鱼、龙井虾仁、东坡肉等传统名菜，以及河坊街美食街区的特色小吃。',
    image: 'https://picsum.photos/400/200?random=23',
    author: '美食家',
    views: 2100,
    is_published: true,
    sort_order: 3
  }
];

// 插入默认数据的函数
async function seedDatabase() {
  console.log('开始填充数据库...');
  
  try {
    // 插入分类数据
    console.log('正在插入分类数据...');
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .insert(defaultCategories)
      .select();
    
    if (categoryError) {
      console.error('插入分类数据失败:', categoryError);
      return;
    }
    console.log(`成功插入 ${categories.length} 个分类`);
    
    // 获取插入的分类ID，用于景点数据
    const categoryIds = categories.map(cat => cat.id);
    
    // 更新景点数据，添加category_id
    const attractionsWithCategory = defaultAttractions.map((attraction, index) => ({
      ...attraction,
      category_id: categoryIds[index % categoryIds.length] // 循环分配分类
    }));
    
    // 插入景点数据
    console.log('正在插入景点数据...');
    const { data: attractions, error: attractionError } = await supabase
      .from('attractions')
      .insert(attractionsWithCategory)
      .select();
    
    if (attractionError) {
      console.error('插入景点数据失败:', attractionError);
      return;
    }
    console.log(`成功插入 ${attractions.length} 个景点`);
    
    // 更新攻略数据，添加category_id
    const articlesWithCategory = defaultArticles.map((article, index) => ({
      ...article,
      category_id: categoryIds[index % categoryIds.length] // 循环分配分类
    }));
    
    // 插入攻略数据
    console.log('正在插入攻略数据...');
    const { data: articles, error: articleError } = await supabase
      .from('articles')
      .insert(articlesWithCategory)
      .select();
    
    if (articleError) {
      console.error('插入攻略数据失败:', articleError);
      return;
    }
    console.log(`成功插入 ${articles.length} 篇攻略`);
    
    console.log('数据库填充完成！');
  } catch (error) {
    console.error('数据库填充失败:', error);
  }
}

// 执行填充
seedDatabase();