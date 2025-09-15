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
      
      // 检查用户是否是管理员 - 先检查 admin_profiles 表
      let adminUser = null
      
      // 尝试从 admin_profiles 表获取管理员信息
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (adminProfile) {
        adminUser = adminProfile
        // 更新最后登录时间
        await supabase
          .from('admin_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id)
      } else {
        // 如果 admin_profiles 表中没有，检查 admin_users 表
        const { data: legacyAdmin } = await supabase
          .from(TABLES.ADMIN_USERS)
          .select('*')
          .eq('email', email)
          .single()
        
        if (legacyAdmin) {
          adminUser = legacyAdmin
        }
      }
      
      if (!adminUser) {
        await supabase.auth.signOut()
        throw new Error('您没有管理员权限')
      }
      
      // 检查管理员状态
      if (adminUser.status === 0 || adminUser.is_active === false) {
        await supabase.auth.signOut()
        throw new Error('您的账户已被禁用')
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
      
      // 先检查 admin_profiles 表
      let adminUser = null
      
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (adminProfile) {
        adminUser = adminProfile
      } else {
        // 如果 admin_profiles 表中没有，检查 admin_users 表
        const { data: legacyAdmin } = await supabase
          .from(TABLES.ADMIN_USERS)
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (legacyAdmin) {
          adminUser = legacyAdmin
        }
      }
      
      if (!adminUser) {
        return { success: false, message: '无管理员权限' }
      }
      
      // 检查管理员状态
      if (adminUser.status === 0 || adminUser.is_active === false) {
        return { success: false, message: '您的账户已被禁用' }
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
      
      // 先检查 admin_profiles 表
      let adminUser = null
      
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (adminProfile) {
        adminUser = adminProfile
      } else {
        // 如果 admin_profiles 表中没有，检查 admin_users 表
        const { data: legacyAdmin } = await supabase
          .from(TABLES.ADMIN_USERS)
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (legacyAdmin) {
          adminUser = legacyAdmin
        }
      }
      
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
            username: adminUser.username || adminUser.name,
            role: adminUser.role,
            status: adminUser.status,
            created_at: adminUser.created_at,
            last_login_at: adminUser.last_login_at
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
            full_name: adminUserData.username || adminUserData.name || '管理员',
            role: adminUserData.role || 'admin'
          }
        }
      })
      
      if (authError) throw authError
      
      // 将用户信息保存到 admin_profiles 表
      const { data: adminProfile, error: profileError } = await supabase
        .from('admin_profiles')
        .insert([{
          id: authData.user.id,
          username: adminUserData.username || adminUserData.name || '管理员',
          role: adminUserData.role || 'admin',
          status: 1,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (profileError) throw profileError
      
      return { 
        success: true, 
        data: { user: authData.user, admin: adminProfile },
        message: '管理员用户创建成功' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '创建管理员用户') 
      }
    }
  }

  // 更新管理员信息
  static async updateAdminProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .update({
          username: profileData.username,
          role: profileData.role,
          status: profileData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '管理员信息更新成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '更新管理员信息') 
      }
    }
  }

  // 获取所有管理员用户
  static async getAllAdmins() {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取管理员列表') 
      }
    }
  }
}