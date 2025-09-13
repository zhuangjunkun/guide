// 文章服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

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