// 地图服务
import { supabase, TABLES, STORAGE_BUCKETS, handleSupabaseError } from '@/utils/supabase'

export class MapService {
  // 获取地图配置
  static async getMapConfig() {
    try {
      // 获取地图背景图片URL
      const { data: backgroundImage } = await supabase
        .storage
        .from(STORAGE_BUCKETS.IMAGES)
        .getPublicUrl('map-background.jpg')
      
      return {
        success: true,
        data: {
          background_image: backgroundImage.publicUrl,
          background_color: '#f0f0f0'
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取地图配置') 
      }
    }
  }

  // 更新地图背景
  static async updateBackground(imageFile) {
    try {
      // 上传新图片
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKETS.IMAGES)
        .upload('map-background.jpg', imageFile, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) throw error
      
      // 获取新图片URL
      const { data: publicUrl } = supabase
        .storage
        .from(STORAGE_BUCKETS.IMAGES)
        .getPublicUrl('map-background.jpg')
      
      return { 
        success: true, 
        data: { url: publicUrl.publicUrl },
        message: '背景图片更新成功' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '更新地图背景') 
      }
    }
  }

  // 获取所有标记
  static async getMarkers() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .select('id, name, location')
        .not('location', 'is', null)
      
      if (error) throw error
      
      // 转换数据格式
      const markers = data.map(item => ({
        id: item.id,
        name: item.name,
        x: item.location.x,
        y: item.location.y
      }))
      
      return { success: true, data: markers }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '获取标记列表') 
      }
    }
  }

  // 添加标记
  static async addMarker(markerData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .update({
          location: {
            x: markerData.x,
            y: markerData.y
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', markerData.attraction_id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '标记添加成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '添加标记') 
      }
    }
  }

  // 更新标记
  static async updateMarker(id, markerData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .update({
          location: {
            x: markerData.x,
            y: markerData.y
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, message: '标记更新成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '更新标记') 
      }
    }
  }

  // 删除标记
  static async deleteMarker(id) {
    try {
      const { error } = await supabase
        .from(TABLES.ATTRACTIONS)
        .update({
          location: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      return { success: true, message: '标记删除成功' }
    } catch (error) {
      return { 
        success: false, 
        message: handleSupabaseError(error, '删除标记') 
      }
    }
  }
}