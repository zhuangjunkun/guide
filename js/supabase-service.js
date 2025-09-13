// Supabase服务层 - 替代传统后端API
import { supabase, TABLES, handleSupabaseError } from '../config/supabase.js'

// 分类服务
export class CategoryService {
  // 获取所有分类
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取分类列表') 
      }
    }
  }

  // 获取单个分类
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取分类详情') 
      }
    }
  }

  // 创建分类
  static async create(categoryData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert([{
          name: categoryData.name,
          description: categoryData.description || '',
          status: categoryData.status !== undefined ? categoryData.status : true,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '分类创建成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '创建分类') 
      }
    }
  }

  // 更新分类
  static async update(id, categoryData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .update({
          name: categoryData.name,
          description: categoryData.description || '',
          status: categoryData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '分类更新成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '更新分类') 
      }
    }
  }

  // 删除分类
  static async delete(id) {
    try {
      // 检查是否有景点使用此分类
      const { data: attractions } = await supabase
        .from(TABLES.ATTRACTIONS)
        .select('id')
        .eq('category_id', id)
        .limit(1)
      
      if (attractions && attractions.length > 0) {
        return { 
          success: false, 
          message: '该分类下还有景点，无法删除' 
        }
      }

      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true, message: '分类删除成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '删除分类') 
      }
    }
  }
}

// 景点服务
export class AttractionService {
  // 获取所有景点
  static async getAll(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.ATTRACTIONS)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      // 应用过滤器
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取景点列表') 
      }
    }
  }

  // 获取单个景点
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取景点详情') 
      }
    }
  }

  // 创建景点
  static async create(attractionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .insert([{
          ...attractionData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '景点创建成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '创建景点') 
      }
    }
  }

  // 更新景点
  static async update(id, attractionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .update({
          ...attractionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '景点更新成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '更新景点') 
      }
    }
  }

  // 删除景点
  static async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true, message: '景点删除成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '删除景点') 
      }
    }
  }
}

// 路线服务
export class RouteService {
  // 获取所有路线
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROUTES)
        .select(`
          *,
          route_attractions (
            attraction_id,
            order_index,
            attractions (
              id,
              name,
              location
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取路线列表') 
      }
    }
  }

  // 获取单个路线
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROUTES)
        .select(`
          *,
          route_attractions (
            attraction_id,
            order_index,
            attractions (
              id,
              name,
              location,
              images
            )
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取路线详情') 
      }
    }
  }
}

// 文章服务
export class ArticleService {
  // 获取所有文章
  static async getAll(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.ARTICLES)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      // 应用过滤器
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      
      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取文章列表') 
      }
    }
  }

  // 获取单个文章
  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ARTICLES)
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取文章详情') 
      }
    }
  }

  // 创建文章
  static async create(articleData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ARTICLES)
        .insert([{
          ...articleData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '文章创建成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '创建文章') 
      }
    }
  }

  // 更新文章
  static async update(id, articleData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ARTICLES)
        .update({
          ...articleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '文章更新成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '更新文章') 
      }
    }
  }

  // 删除文章
  static async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.ARTICLES)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true, message: '文章删除成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '删除文章') 
      }
    }
  }
}

// 统计服务
export class StatsService {
  // 获取仪表盘统计数据
  static async getDashboardStats() {
    try {
      const [categoriesResult, attractionsResult, routesResult, articlesResult] = await Promise.all([
        supabase.from(TABLES.CATEGORIES).select('id', { count: 'exact' }),
        supabase.from(TABLES.ATTRACTIONS).select('id', { count: 'exact' }),
        supabase.from(TABLES.ROUTES).select('id', { count: 'exact' }),
        supabase.from(TABLES.ARTICLES).select('id', { count: 'exact' })
      ])

      return {
        success: true,
        data: {
          categories: categoriesResult.count || 0,
          attractions: attractionsResult.count || 0,
          routes: routesResult.count || 0,
          articles: articlesResult.count || 0
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取统计数据') 
      }
    }
  }
}

// 认证服务
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
}