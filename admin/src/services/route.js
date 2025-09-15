// 路线服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

export class RouteService {
  // 获取所有路线
  static async getAll(filters = {}) {
    try {
      let routeQuery = supabase
        .from(TABLES.ROUTES)
        .select('*')
        .order('created_at', { ascending: false })

      // 应用过滤器
      if (filters.search) {
        routeQuery = routeQuery.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters.status !== undefined) {
        routeQuery = routeQuery.eq('status', filters.status)
      }
      
      if (filters.difficulty) {
        routeQuery = routeQuery.eq('difficulty', filters.difficulty)
      }

      const { data: routes, error: routeError } = await routeQuery
      
      if (routeError) throw routeError
      
      // 如果有路线且包含景点ID，则获取景点信息
      if (routes && routes.length > 0) {
        // 获取所有景点信息
        const { data: attractions, error: attractionError } = await supabase
          .from(TABLES.ATTRACTIONS)
          .select('id, name, image')
        
        // 如果景点查询成功，则将景点信息附加到路线数据中
        if (!attractionError && attractions) {
          const attractionMap = attractions.reduce((map, attraction) => {
            map[attraction.id] = attraction;
            return map;
          }, {});
          
          // 为每条路线附加景点信息
          routes.forEach(route => {
            if (route.attraction_ids && Array.isArray(route.attraction_ids)) {
              route.attractions = route.attraction_ids.map(id => attractionMap[id]).filter(Boolean);
            } else {
              route.attractions = [];
            }
          });
        }
      }
      
      return { success: true, data: routes || [] }
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
      const { data: route, error: routeError } = await supabase
        .from(TABLES.ROUTES)
        .select('*')
        .eq('id', id)
        .single()
      
      if (routeError) throw routeError
      
      // 如果有路线且包含景点ID，则获取景点信息
      if (route && route.attraction_ids && Array.isArray(route.attraction_ids)) {
        const { data: attractions, error: attractionError } = await supabase
          .from(TABLES.ATTRACTIONS)
          .select('id, name, image, description')
          .in('id', route.attraction_ids)
        
        if (!attractionError && attractions) {
          // 按照 attraction_ids 的顺序排列景点
          route.attractions = route.attraction_ids.map(id => 
            attractions.find(attraction => attraction.id === id)
          ).filter(Boolean);
        } else {
          route.attractions = [];
        }
      } else {
        route.attractions = [];
      }
      
      return { success: true, data: route }
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
      const insertData = {
        name: routeData.name,
        description: routeData.description || '',
        duration: routeData.duration || '',
        difficulty: routeData.difficulty || 'easy',
        highlights: routeData.highlights || [],
        attraction_ids: routeData.attraction_ids || [],
        status: routeData.status !== undefined ? routeData.status : 1,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.ROUTES)
        .insert([insertData])
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
      const updateData = {
        name: routeData.name,
        description: routeData.description || '',
        duration: routeData.duration || '',
        difficulty: routeData.difficulty || 'easy',
        highlights: routeData.highlights || [],
        attraction_ids: routeData.attraction_ids || [],
        status: routeData.status,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.ROUTES)
        .update(updateData)
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

  // 获取路线统计信息
  static async getStats() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROUTES)
        .select('difficulty, status')
      
      if (error) throw error
      
      const stats = {
        total: data.length,
        active: data.filter(route => route.status === 1).length,
        inactive: data.filter(route => route.status === 0).length,
        byDifficulty: {
          easy: data.filter(route => route.difficulty === 'easy').length,
          medium: data.filter(route => route.difficulty === 'medium').length,
          hard: data.filter(route => route.difficulty === 'hard').length
        }
      }
      
      return { success: true, data: stats }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取路线统计') 
      }
    }
  }
}