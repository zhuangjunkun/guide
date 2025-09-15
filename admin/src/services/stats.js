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

      // 获取更详细的统计信息
      const [activeAttractions, publishedArticles, activeRoutes] = await Promise.all([
        supabase.from(TABLES.ATTRACTIONS).select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from(TABLES.ARTICLES).select('id', { count: 'exact' }).eq('is_published', true),
        supabase.from(TABLES.ROUTES).select('id', { count: 'exact' }).eq('status', 1)
      ])

      return {
        success: true,
        data: {
          categories: categoriesResult.count || 0,
          attractions: attractionsResult.count || 0,
          routes: routesResult.count || 0,
          articles: articlesResult.count || 0,
          activeAttractions: activeAttractions.count || 0,
          publishedArticles: publishedArticles.count || 0,
          activeRoutes: activeRoutes.count || 0
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
          .select('id, name, created_at, is_active')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from(TABLES.ATTRACTIONS)
          .select('id, name, created_at, is_active, image')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from(TABLES.ARTICLES)
          .select('id, title, created_at, is_published, cover_image, author')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from(TABLES.ROUTES)
          .select('id, name, created_at, status, difficulty')
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

  // 获取内容统计分析
  static async getContentAnalytics() {
    try {
      // 获取文章浏览量统计
      const { data: articleViews } = await supabase
        .from(TABLES.ARTICLES)
        .select('views, likes, created_at')
        .eq('is_published', true)
        .order('views', { ascending: false })
        .limit(10)

      // 获取分类下的内容数量
      const { data: categoryStats } = await supabase
        .from(TABLES.CATEGORIES)
        .select(`
          id, name,
          articles:articles(count),
          attractions:attractions(count)
        `)

      // 获取月度新增统计
      const currentDate = new Date()
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      
      const [monthlyArticles, monthlyAttractions] = await Promise.all([
        supabase
          .from(TABLES.ARTICLES)
          .select('id', { count: 'exact' })
          .gte('created_at', lastMonth.toISOString()),
        supabase
          .from(TABLES.ATTRACTIONS)
          .select('id', { count: 'exact' })
          .gte('created_at', lastMonth.toISOString())
      ])

      return {
        success: true,
        data: {
          topArticles: articleViews || [],
          categoryStats: categoryStats || [],
          monthlyStats: {
            articles: monthlyArticles.count || 0,
            attractions: monthlyAttractions.count || 0
          }
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取内容分析') 
      }
    }
  }
}