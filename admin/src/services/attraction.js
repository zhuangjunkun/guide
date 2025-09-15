// 景点服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

export class AttractionService {
  // 获取所有景点
  static async getAll(filters = {}) {
    try {
      // 先获取景点数据，不包含分类信息以避免RLS策略问题
      let attractionQuery = supabase
        .from(TABLES.ATTRACTIONS)
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      // 应用过滤器
      if (filters.category_id) {
        attractionQuery = attractionQuery.eq('category_id', filters.category_id)
      }
      
      if (filters.search) {
        attractionQuery = attractionQuery.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters.is_active !== undefined) {
        attractionQuery = attractionQuery.eq('is_active', filters.is_active)
      }

      const { data: attractions, error: attractionError } = await attractionQuery
      
      if (attractionError) throw attractionError
      
      // 如果有景点且需要分类信息，则单独获取分类信息
      if (attractions && attractions.length > 0) {
        // 获取所有分类信息
        const { data: categories, error: categoryError } = await supabase
          .from(TABLES.CATEGORIES)
          .select('id, name')
        
        // 如果分类查询成功，则将分类信息附加到景点数据中
        if (!categoryError && categories) {
          const categoryMap = categories.reduce((map, category) => {
            map[category.id] = category;
            return map;
          }, {});
          
          // 为每个景点附加分类信息
          attractions.forEach(attraction => {
            if (attraction.category_id && categoryMap[attraction.category_id]) {
              attraction.category_name = categoryMap[attraction.category_id].name;
            } else if (attraction.category) {
              // 兼容旧的 category 字段
              attraction.category_name = attraction.category;
            }
          });
        }
      }
      
      return { success: true, data: attractions || [] }
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
      // 先获取景点数据，不包含分类信息以避免RLS策略问题
      const { data: attraction, error: attractionError } = await supabase
        .from(TABLES.ATTRACTIONS)
        .select('*')
        .eq('id', id)
        .single()
      
      if (attractionError) throw attractionError
      
      // 如果有景点且有分类ID，则单独获取分类信息
      if (attraction && attraction.category_id) {
        const { data: category, error: categoryError } = await supabase
          .from(TABLES.CATEGORIES)
          .select('id, name')
          .eq('id', attraction.category_id)
          .single()
        
        // 如果分类查询成功，则将分类信息附加到景点数据中
        if (!categoryError && category) {
          attraction.category_name = category.name;
        }
      } else if (attraction && attraction.category) {
        // 兼容旧的 category 字段
        attraction.category_name = attraction.category;
      }
      
      return { success: true, data: attraction }
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
      const insertData = {
        name: attractionData.name,
        description: attractionData.description || '',
        image: attractionData.image || null,
        latitude: attractionData.latitude || null,
        longitude: attractionData.longitude || null,
        map_x: attractionData.map_x || null,
        map_y: attractionData.map_y || null,
        category: attractionData.category || null, // 兼容旧字段
        category_id: attractionData.category_id || null,
        opening_hours: attractionData.opening_hours || null,
        ticket_price: attractionData.ticket_price || null,
        contact_phone: attractionData.contact_phone || null,
        address: attractionData.address || null,
        is_active: attractionData.is_active !== undefined ? attractionData.is_active : true,
        sort_order: attractionData.sort_order || 0,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .insert([insertData])
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
      const updateData = {
        name: attractionData.name,
        description: attractionData.description || '',
        image: attractionData.image || null,
        latitude: attractionData.latitude || null,
        longitude: attractionData.longitude || null,
        map_x: attractionData.map_x || null,
        map_y: attractionData.map_y || null,
        category: attractionData.category || null, // 兼容旧字段
        category_id: attractionData.category_id || null,
        opening_hours: attractionData.opening_hours || null,
        ticket_price: attractionData.ticket_price || null,
        contact_phone: attractionData.contact_phone || null,
        address: attractionData.address || null,
        is_active: attractionData.is_active,
        sort_order: attractionData.sort_order || 0,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .update(updateData)
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