// 文件上传服务
import { supabase, STORAGE_BUCKETS, handleSupabaseError } from '@/utils/supabase'

export class UploadService {
  // 上传图片到 Supabase Storage
  static async uploadImage(file, folder = 'general') {
    try {
      if (!file) {
        throw new Error('请选择要上传的文件')
      }

      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('只支持 JPG、PNG、GIF、WebP 格式的图片')
      }

      // 检查文件大小 (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('图片大小不能超过 5MB')
      }

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // 上传文件到 Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.IMAGES)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 获取公共 URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.IMAGES)
        .getPublicUrl(fileName)

      return {
        success: true,
        data: {
          path: data.path,
          url: publicUrl,
          fileName: fileName
        },
        message: '图片上传成功'
      }
    } catch (error) {
      return {
        success: false,
        message: handleSupabaseError(error, '上传图片')
      }
    }
  }

  // 删除图片
  static async deleteImage(filePath) {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.IMAGES)
        .remove([filePath])

      if (error) throw error

      return {
        success: true,
        message: '图片删除成功'
      }
    } catch (error) {
      return {
        success: false,
        message: handleSupabaseError(error, '删除图片')
      }
    }
  }

  // 批量上传图片
  static async uploadMultipleImages(files, folder = 'general') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder))
      const results = await Promise.all(uploadPromises)

      const successResults = results.filter(result => result.success)
      const failedResults = results.filter(result => !result.success)

      return {
        success: failedResults.length === 0,
        data: {
          uploaded: successResults.map(result => result.data),
          failed: failedResults.length
        },
        message: `成功上传 ${successResults.length} 张图片${failedResults.length > 0 ? `，失败 ${failedResults.length} 张` : ''}`
      }
    } catch (error) {
      return {
        success: false,
        message: handleSupabaseError(error, '批量上传图片')
      }
    }
  }

  // 获取存储桶中的文件列表
  static async getImageList(folder = '', limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.IMAGES)
        .list(folder, {
          limit,
          offset,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      // 为每个文件生成公共 URL
      const filesWithUrls = data.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKETS.IMAGES)
          .getPublicUrl(`${folder}${folder ? '/' : ''}${file.name}`)

        return {
          ...file,
          url: publicUrl,
          path: `${folder}${folder ? '/' : ''}${file.name}`
        }
      })

      return {
        success: true,
        data: filesWithUrls
      }
    } catch (error) {
      return {
        success: false,
        message: handleSupabaseError(error, '获取图片列表')
      }
    }
  }

  // 上传文档文件
  static async uploadDocument(file, folder = 'documents') {
    try {
      if (!file) {
        throw new Error('请选择要上传的文件')
      }

      // 检查文件类型
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('只支持 PDF、DOC、DOCX、TXT 格式的文档')
      }

      // 检查文件大小 (10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('文档大小不能超过 10MB')
      }

      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // 上传文件到 Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // 获取公共 URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .getPublicUrl(fileName)

      return {
        success: true,
        data: {
          path: data.path,
          url: publicUrl,
          fileName: fileName,
          originalName: file.name
        },
        message: '文档上传成功'
      }
    } catch (error) {
      return {
        success: false,
        message: handleSupabaseError(error, '上传文档')
      }
    }
  }
}