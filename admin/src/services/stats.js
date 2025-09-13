// 统计服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

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

  // 获取最近添加的数据
  static async getRecentData() {
    try {
      const [categories, attractions, articles, routes] = await Promise.all([
        supabase
          .from(TABLES.CATEGORIES)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from(TABLES.ATTRACTIONS)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from(TABLES.ARTICLES)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from(TABLES.ROUTES)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      return {
        success: true,
        data: {
          categories: categories.data || [],
          attractions: attractions.data || [],
          articles: articles.data || [],
          routes: routes.data || []
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取最近数据') 
      }
    }
  }
}