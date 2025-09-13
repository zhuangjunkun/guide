<template>
  <div class="article-create">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>新建攻略</span>
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
      >
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
            :loading="loading"
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'ArticleCreate',
  components: {
    Plus
  },
  
  setup() {
    const router = useRouter()
    const formRef = ref()
    const loading = ref(false)
    
    // 表单数据
    const form = reactive({
      title: '',
      category_id: '',
      summary: '',
      content: '',
      images: [],
      status: true
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
    
    // 提交表单
    const submitForm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          
          try {
            // 模拟提交数据
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            ElMessage.success('创建成功')
            router.push('/articles')
          } catch (error) {
            ElMessage.error('创建失败: ' + error.message)
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    // 重置表单
    const resetForm = () => {
      form.title = ''
      form.category_id = ''
      form.summary = ''
      form.content = ''
      form.images = []
      form.status = true
    }
    
    return {
      formRef,
      loading,
      form,
      rules,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.article-create {
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