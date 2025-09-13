// 路线服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

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

  // 创建路线
  static async create(routeData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROUTES)
        .insert([{
          ...routeData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '路线创建成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '创建路线') 
      }
    }
  }

  // 更新路线
  static async update(id, routeData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROUTES)
        .update({
          ...routeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '路线更新成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '更新路线') 
      }
    }
  }

  // 删除路线
  static async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.ROUTES)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true, message: '路线删除成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '删除路线') 
      }
    }
  }
}