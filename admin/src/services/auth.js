// 认证服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

export class AuthService {
  // 管理员登录
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // 检查用户是否是管理员
      const { data: adminUser } = await supabase
        .from(TABLES.ADMIN_USERS)
        .select('*')
        .eq('user_id', data.user.id)
        .single()
      
      if (!adminUser) {
        await supabase.auth.signOut()
        throw new Error('您没有管理员权限')
      }
      
      return { 
        success: true, 
        data: { user: data.user, admin: adminUser },
        message: '登录成功' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '登录') 
      }
    }
  }

  // 检查管理员权限
  static async checkAdminPermission() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, message: '未登录' }
      }
      
      const { data: adminUser } = await supabase
        .from(TABLES.ADMIN_USERS)
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (!adminUser) {
        return { success: false, message: '无管理员权限' }
      }
      
      return { success: true, data: { user, admin: adminUser } }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '权限检查') 
      }
    }
  }

  // 登出
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // 清除本地存储
      localStorage.removeItem('admin_token')
      
      return { success: true, message: '登出成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '登出') 
      }
    }
  }

  // 获取当前用户信息
  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, message: '未登录' }
      }
      
      // 获取管理员信息
      const { data: adminUser } = await supabase
        .from(TABLES.ADMIN_USERS)
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (!adminUser) {
        return { success: false, message: '无管理员权限' }
      }
      
      return { 
        success: true, 
        data: { 
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          admin: {
            id: adminUser.id,
            name: adminUser.name,
            role: adminUser.role,
            created_at: adminUser.created_at
          }
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取用户信息') 
      }
    }
  }
  
  // 创建管理员用户并关联到Supabase Auth
  static async createAdminUser(email, password, adminUserData) {
    try {
      // 首先在Supabase Auth中创建用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: adminUserData.name || '管理员',
            role: adminUserData.role || 'admin'
          }
        }
      })
      
      if (authError) throw authError
      
      // 将用户信息保存到admin_users表
      const { data: adminUser, error: adminError } = await supabase
        .from(TABLES.ADMIN_USERS)
        .insert([{
          user_id: authData.user.id,
          email: email,
          name: adminUserData.name || '管理员',
          role: adminUserData.role || 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (adminError) throw adminError
      
      return { 
        success: true, 
        data: { user: authData.user, admin: adminUser },
        message: '管理员用户创建成功' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '创建管理员用户') 
      }
    }
  }
}