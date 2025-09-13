// 分类服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

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