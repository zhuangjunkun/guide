// Supabase配置和初始化
import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xaoxaodcqcqjhydkrnfd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhb3hhb2RjcWNxamh5ZGtybmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTAxNjksImV4cCI6MjA3MjI2NjE2OX0.t01Dyealn85iCLvv26iAm-G3UJbqj8v5WWrG1sUVmMY'

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
})

// 数据库表名常量
export const TABLES = {
  CATEGORIES: 'categories',
  ATTRACTIONS: 'attractions', 
  ROUTES: 'routes',
  ARTICLES: 'articles',
  ADMIN_USERS: 'admin_users',
  USERS: 'users'
}

// 存储桶名称常量
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  DOCUMENTS: 'documents'
}

// 认证相关配置
export const AUTH_CONFIG = {
  redirectTo: window.location.origin + '/admin/',
  providers: ['email']
}

// 实时订阅配置
export const REALTIME_CONFIG = {
  broadcast: { self: true },
  presence: { key: 'user_id' }
}

// 工具函数：检查用户是否已登录
export const isAuthenticated = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

// 工具函数：获取当前用户
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// 工具函数：登出
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('登出失败:', error)
    throw error
  }
  // 重定向到登录页面
  window.location.href = '/admin/login.html'
}

// 工具函数：处理Supabase错误
export const handleSupabaseError = (error, context = '') => {
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
export const formatDate = (dateString) => {
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
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}