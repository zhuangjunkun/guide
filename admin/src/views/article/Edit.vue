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
              >
                <el-option label="景点" value="1" />
                <el-option label="美食" value="2" />
                <el-option label="住宿" value="3" />
                <el-option label="购物" value="4" />
                <el-option label="文化" value="5" />
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
        
        <el-form-item label="图片" prop="images">
          <el-upload
            v-model:file-list="form.images"
            class="upload-demo"
            action="/api/upload"
            multiple
            :limit="5"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            最多可上传5张图片，支持JPG、PNG格式，每张图片不超过5MB
          </div>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="浏览量">
              <el-input v-model="form.views" disabled />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="点赞数">
              <el-input v-model="form.likes" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            active-text="发布"
            inactive-text="草稿"
          />
        </el-form-item>
        
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'ArticleEdit',
  components: {
    Plus
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  
  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref()
    const loading = ref(false)
    const submitLoading = ref(false)
    
    // 表单数据
    const form = reactive({
      id: '',
      title: '',
      category_id: '',
      summary: '',
      content: '',
      images: [],
      views: 0,
      likes: 0,
      status: true,
      created_at: ''
    })
    
    // 表单验证规则
    const rules = {
      title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      category_id: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ],
      summary: [
        { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
      ]
    }
    
    // 获取文章详情
    const fetchArticle = async () => {
      loading.value = true
      
      try {
        // 模拟获取数据
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟数据
        Object.assign(form, {
          id: props.id,
          title: '西湖十景完整攻略，带你领略杭州最美风光',
          category_id: '1',
          summary: '西湖作为杭州的标志性景点，拥有着千年的历史文化底蕴。本攻略将带你游遍西湖十景，感受江南水乡的独特魅力...',
          content: '西湖十景完整攻略内容...\n\n西湖作为杭州的标志性景点，拥有着千年的历史文化底蕴。本攻略将带你游遍西湖十景，感受江南水乡的独特魅力。\n\n1. 苏堤春晓\n2. 曲院风荷\n3. 平湖秋月\n4. 断桥残雪\n5. 花港观鱼\n6. 柳浪闻莺\n7. 三潭印月\n8. 双峰插云\n9. 雷峰夕照\n10. 南屏晚钟',
          images: [
            { name: 'image1.jpg', url: 'https://picsum.photos/300/200?random=1' },
            { name: 'image2.jpg', url: 'https://picsum.photos/300/200?random=2' }
          ],
          views: 1250,
          likes: 89,
          status: true,
          created_at: '2024-01-01 12:00:00'
        })
      } catch (error) {
        ElMessage.error('获取文章信息失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true
          
          try {
            // 模拟提交数据
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            ElMessage.success('更新成功')
            router.push('/articles')
          } catch (error) {
            ElMessage.error('更新失败: ' + error.message)
          } finally {
            submitLoading.value = false
          }
        }
      })
    }
    
    // 重置表单
    const resetForm = () => {
      fetchArticle()
    }
    
    onMounted(() => {
      fetchArticle()
    })
    
    return {
      formRef,
      loading,
      submitLoading,
      form,
      rules,
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

.upload-demo {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>