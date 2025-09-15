// Supabase配置文件
const SUPABASE_URL = 'https://xaoxaodcqcqjhydkrnfd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhb3hhb2RjcWNxamh5ZGtybmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTAxNjksImV4cCI6MjA3MjI2NjE2OX0.t01Dyealn85iCLvv26iAm-G3UJbqj8v5WWrG1sUVmMY';

// 创建Supabase客户端
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 数据库表名常量
const TABLES = {
  CATEGORIES: 'categories',
  ATTRACTIONS: 'attractions',
  ARTICLES: 'articles'
};

// 工具函数：处理Supabase错误
const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase错误 ${context}:`, error);
  
  // 根据错误类型返回用户友好的消息
  if (error.code === 'PGRST116') {
    return '数据不存在或已被删除';
  } else if (error.code === '23505') {
    return '数据已存在，请检查重复项';
  } else if (error.code === '42501') {
    return '权限不足，无法执行此操作';
  } else if (error.message.includes('JWT')) {
    return '登录已过期，请重新登录';
  } else {
    return error.message || '操作失败，请重试';
  }
};

// 导出
window.supabase = supabase;
window.TABLES = TABLES;
window.handleSupabaseError = handleSupabaseError;