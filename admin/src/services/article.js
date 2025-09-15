// 文章服务
import { supabase, TABLES, handleSupabaseError } from '@/utils/supabase'

export class ArticleService {
  // 获取所有文章
  static async getAll(filters = {}) {
    try {
      // 先获取文章数据，不包含分类信息以避免RLS策略问题
      let articleQuery = supabase
        .from(TABLES.ARTICLES)
        .select('*')
        .order('created_at', { ascending: false })

      // 应用过滤器
      if (filters.category_id) {
        articleQuery = articleQuery.eq('category_id', filters.category_id)
      }
      
      if (filters.search) {
        articleQuery = articleQuery.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`)
      }
      
      if (filters.is_published !== undefined) {
        articleQuery = articleQuery.eq('is_published', filters.is_published)
      }
      
      if (filters.is_featured !== undefined) {
        articleQuery = articleQuery.eq('is_featured', filters.is_featured)
      }

      const { data: articles, error: articleError } = await articleQuery
      
      if (articleError) throw articleError
      
      // 如果有文章且需要分类信息，则单独获取分类信息
      if (articles && articles.length > 0) {
        // 获取所有分类信息
        const { data: categories, error: categoryError } = await supabase
          .from(TABLES.CATEGORIES)
          .select('id, name')
        
        // 如果分类查询成功，则将分类信息附加到文章数据中
        if (!categoryError && categories) {
          const categoryMap = categories.reduce((map, category) => {
            map[category.id] = category;
            return map;
          }, {});
          
          // 为每篇文章附加分类信息
          articles.forEach(article => {
            if (article.category_id && categoryMap[article.category_id]) {
              article.category_name = categoryMap[article.category_id].name;
            }
          });
        }
      }
      
      return { success: true, data: articles || [] }
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
      // 先获取文章数据，不包含分类信息以避免RLS策略问题
      const { data: article, error: articleError } = await supabase
        .from(TABLES.ARTICLES)
        .select('*')
        .eq('id', id)
        .single()
      
      if (articleError) throw articleError
      
      // 如果有文章且有分类ID，则单独获取分类信息
      if (article && article.category_id) {
        const { data: category, error: categoryError } = await supabase
          .from(TABLES.CATEGORIES)
          .select('id, name')
          .eq('id', article.category_id)
          .single()
        
        // 如果分类查询成功，则将分类信息附加到文章数据中
        if (!categoryError && category) {
          article.category_name = category.name;
        }
      }
      
      return { success: true, data: article }
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
      // 生成 slug
      const slug = articleData.slug || articleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      
      const insertData = {
        title: articleData.title,
        slug: slug,
        summary: articleData.summary || '',
        content: articleData.content || '',
        cover_image: articleData.cover_image || null,
        category_id: articleData.category_id || null,
        author: articleData.author || '管理员',
        views: 0,
        likes: 0,
        is_published: articleData.is_published !== undefined ? articleData.is_published : false,
        is_featured: articleData.is_featured !== undefined ? articleData.is_featured : false,
        published_at: articleData.is_published ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from(TABLES.ARTICLES)
        .insert([insertData])
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
      const updateData = {
        title: articleData.title,
        summary: articleData.summary || '',
        content: articleData.content || '',
        cover_image: articleData.cover_image || null,
        category_id: articleData.category_id || null,
        author: articleData.author || '管理员',
        is_published: articleData.is_published,
        is_featured: articleData.is_featured,
        updated_at: new Date().toISOString()
      }
      
      // 生成 slug（如果提供了新的标题）
      if (articleData.slug) {
        updateData.slug = articleData.slug
      } else if (articleData.title) {
        updateData.slug = articleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      }
      
      // 如果发布状态改变，更新发布时间
      if (articleData.is_published && !articleData.published_at) {
        updateData.published_at = new Date().toISOString()
      } else if (!articleData.is_published) {
        updateData.published_at = null
      }

      const { data, error } = await supabase
        .from(TABLES.ARTICLES)
        .update(updateData)
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