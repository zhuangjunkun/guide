// Supabase配置文件 - 兼容现有项目
// 使用现有的配置变量
const supabaseUrl = 'https://xaoxaodcqcqjhydkrnfd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhb3hhb2RjcWNxamh5ZGtybmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTAxNjksImV4cCI6MjA3MjI2NjE2OX0.t01Dyealn85iCLvv26iAm-G3UJbqj8v5WWrG1sUVmMY'

// 创建Supabase客户端实例
function initSupabaseClient() {
  try {
    // 检查是否已经初始化
    if (window.supabaseClient) {
      console.log('Supabase客户端已初始化');
      return window.supabaseClient;
    }
    
    // 检查Supabase库是否加载
    if (typeof window.supabase !== 'undefined') {
      // 使用window.supabase
      console.log('使用window.supabase初始化客户端');
      window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } else if (typeof window.supabaseJs !== 'undefined') {
      // 使用window.supabaseJs
      console.log('使用window.supabaseJs初始化客户端');
      window.supabaseClient = window.supabaseJs.createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    } else {
      // 尝试直接从@supabase/supabase-js库创建
      console.log('尝试从全局变量创建Supabase客户端');
      // 检查是否有createClient方法可用
      const createClientFn = window.createClient || window.supabase?.createClient;
      
      if (createClientFn) {
        window.supabaseClient = createClientFn(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        });
      } else {
        console.error('无法找到Supabase客户端创建方法，请确保已加载@supabase/supabase-js库');
      }
    }
    
    return window.supabaseClient;
  } catch (error) {
    console.error('初始化Supabase客户端失败:', error);
    return null;
  }
}

// 在页面加载完成后初始化Supabase客户端
if (typeof window !== 'undefined') {
  initSupabaseClient()
  // if (document.readyState === 'complete' || document.readyState === 'interactive') {
  //   setTimeout(initSupabaseClient, 100);
  // } else {
  //   document.addEventListener('DOMContentLoaded', () => {
  //     setTimeout(initSupabaseClient, 100);
  //   });
  // }
}

// 数据库表名常量
const TABLES = {
  CATEGORIES: 'categories',
  ATTRACTIONS: 'attractions', 
  ROUTES: 'routes',
  ARTICLES: 'articles',
  ADMIN_USERS: 'admin_users',
  USERS: 'users'
}

// 存储桶名称常量
const STORAGE_BUCKETS = {
  IMAGES: 'images',
  DOCUMENTS: 'documents'
}

// 认证相关配置
const AUTH_CONFIG = {
  redirectTo: window.location.origin + '/admin/',
  providers: ['email']
}

// 实时订阅配置
const REALTIME_CONFIG = {
  broadcast: { self: true },
  presence: { key: 'user_id' }
}

// 工具函数：检查用户是否已登录
const isAuthenticated = async () => {
  const client = window.supabaseClient || window.supabase?.createClient(supabaseUrl, supabaseAnonKey)
  if (!client) return false
  
  const { data: { user } } = await client.auth.getUser()
  return !!user
}

// 工具函数：获取当前用户
const getCurrentUser = async () => {
  const client = window.supabaseClient || window.supabase?.createClient(supabaseUrl, supabaseAnonKey)
  if (!client) return null
  
  const { data: { user } } = await client.auth.getUser()
  return user
}

// 工具函数：登出
const signOut = async () => {
  const client = window.supabaseClient || window.supabase?.createClient(supabaseUrl, supabaseAnonKey)
  if (!client) return
  
  const { error } = await client.auth.signOut()
  if (error) {
    console.error('登出失败:', error)
    throw error
  }
  // 重定向到登录页面
  window.location.href = '/admin/login.html'
}

// 工具函数：处理Supabase错误
const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase错误 ${context}:`, error)
  
  // 根据错误类型返回用户友好的消息
  if (error.code === 'PGRST116') {
    return '数据不存在或已被删除'
  } else if (error.code === '23505') {
    return '数据已存在，请检查重复项'
  } else if (error.code === '42501') {
    return '权限不足，无法执行此操作'
  } else if (error.message.includes('JWT')) {
    return '登录已过期，请重新登录'
  } else {
    return error.message || '操作失败，请重试'
  }
}

// 工具函数：格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 工具函数：生成UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 导出到全局对象（兼容现有代码）
if (typeof window !== 'undefined') {
  window.SupabaseConfig = {
    supabaseUrl,
    supabaseAnonKey,
    TABLES,
    STORAGE_BUCKETS,
    AUTH_CONFIG,
    REALTIME_CONFIG,
    isAuthenticated,
    getCurrentUser,
    signOut,
    handleSupabaseError,
    formatDate,
    generateUUID
  }
}