// 景点服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

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