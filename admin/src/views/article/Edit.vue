<template>
  <div class="article-edit">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>编辑攻略</span>
          <div class="header-actions">
            <el-button @click="$router.back()">返回</el-button>
          </div>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="article-form"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文章ID">
              <el-input v-model="form.id" disabled />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="创建时间">
              <el-input v-model="form.created_at" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文章标题" prop="title">
              <el-input 
                v-model="form.title" 
                placeholder="请输入文章标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select 
                v-model="form.category_id" 
                placeholder="请选择分类"
                style="width: 100%"
                :loading="categoriesLoading"
              >
                <el-option 
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="文章摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="文章内容" prop="content">
          <div class="editor-container">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="10"
              placeholder="请输入文章内容"
            />
          </div>
        </el-form-item>
        
        <el-form-item label="封面图片" prop="cover_image">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :http-request="handleCoverUpload"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="form.cover_image" :src="form.cover_image" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            支持JPG、PNG格式，图片不超过5MB
          </div>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="浏览量">
              <el-input v-model="form.views" disabled />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="点赞数">
              <el-input v-model="form.likes" disabled />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="作者">
              <el-input v-model="form.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布状态" prop="is_published">
              <el-switch
                v-model="form.is_published"
                active-text="已发布"
                inactive-text="草稿"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="推荐文章" prop="is_featured">
              <el-switch
                v-model="form.is_featured"
                active-text="推荐"
                inactive-text="普通"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitForm"
            :loading="submitLoading"
          >
            保存
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ArticleService } from '@/services/article.js'
import { CategoryService } from '@/services/category.js'
import { UploadService } from '@/services/upload.js'

export default {
  name: 'ArticleEdit',
  components: {
    Plus
  },
  
  setup() {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref()
    const loading = ref(false)
    const submitLoading = ref(false)
    const categoriesLoading = ref(false)
    const categories = ref([])
    
    const articleId = computed(() => route.params.id)
    
    const form = reactive({
      id: '',
      title: '',
      slug: '',
      summary: '',
      content: '',
      cover_image: '',
      category_id: null,
      author: '',
      views: 0,
      likes: 0,
      is_published: false,
      is_featured: false,
      published_at: '',
      created_at: '',
      updated_at: ''
    })
    
    const rules = {
      title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      category_id: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
      ]
    }
    
    const fetchCategories = async () => {
      categoriesLoading.value = true
      try {
        const result = await CategoryService.getAll({ is_active: true })
        if (result.success) {
          categories.value = result.data
        } else {
          ElMessage.error('获取分类列表失败: ' + result.message)
        }
      } catch (error) {
        ElMessage.error('获取分类列表失败: ' + error.message)
      } finally {
        categoriesLoading.value = false
      }
    }
    
    const fetchArticle = async () => {
      if (!articleId.value) return
      
      loading.value = true
      try {
        const result = await ArticleService.getById(articleId.value)
        if (result.success) {
          const article = result.data
          Object.assign(form, {
            ...article,
            published_at: article.published_at ? new Date(article.published_at).toLocaleString() : '',
            created_at: article.created_at ? new Date(article.created_at).toLocaleString() : '',
            updated_at: article.updated_at ? new Date(article.updated_at).toLocaleString() : ''
          })
        } else {
          ElMessage.error('获取文章信息失败: ' + result.message)
          router.push('/articles')
        }
      } catch (error) {
        ElMessage.error('获取文章信息失败: ' + error.message)
        router.push('/articles')
      } finally {
        loading.value = false
      }
    }
    
    const handleCoverUpload = async (options) => {
      const file = options.file;
      const result = await UploadService.uploadImage(file);
      if (result.success) {
        form.cover_image = result.data.url;
        ElMessage.success('图片上传成功');
      } else {
        ElMessage.error(`图片上传失败: ${result.message}`);
      }
    };
    
    const beforeCoverUpload = (file) => {
      const isImg = ['image/jpeg', 'image/png'].includes(file.type)
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isImg) {
        ElMessage.error('上传图片只能是 JPG/PNG 格式!')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('上传图片大小不能超过 5MB!')
        return false
      }
      return true
    }
    
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true
          
          try {
            const updateData = {
              title: form.title,
              slug: form.slug,
              summary: form.summary,
              content: form.content,
              cover_image: form.cover_image,
              category_id: form.category_id,
              author: form.author,
              is_published: form.is_published,
              is_featured: form.is_featured
            }
            
            const result = await ArticleService.update(articleId.value, updateData)
            if (result.success) {
              ElMessage.success('更新成功')
              router.push('/articles')
            } else {
              ElMessage.error('更新失败: ' + result.message)
            }
          } catch (error) {
            ElMessage.error('更新失败: ' + error.message)
          } finally {
            submitLoading.value = false
          }
        }
      })
    }
    
    const resetForm = () => {
      fetchArticle()
    }
    
    onMounted(() => {
      fetchCategories()
      fetchArticle()
    })
    
    return {
      formRef,
      loading,
      submitLoading,
      categoriesLoading,
      categories,
      form,
      rules,
      handleCoverUpload,
      beforeCoverUpload,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.article-edit {
  padding: 20px;
}
.form-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.article-form {
  max-width: 800px;
  margin: 0 auto;
}
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}
.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}
.cover-uploader:hover {
  border-color: #409eff;
}
.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}
.cover-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>