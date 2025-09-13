<template>
  <div class="category-edit">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>编辑分类</span>
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
        class="category-form"
        v-loading="loading"
      >
        <el-form-item label="分类ID">
          <el-input v-model="form.id" disabled />
        </el-form-item>
        
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="分类描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分类描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="创建时间">
          <el-input v-model="form.created_at" disabled />
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

export default {
  name: 'CategoryEdit',
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
      name: '',
      description: '',
      status: true,
      created_at: ''
    })
    
    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      description: [
        { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
      ]
    }
    
    // 获取分类详情
    const fetchCategory = async () => {
      loading.value = true
      
      try {
        // 模拟获取数据
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟数据
        Object.assign(form, {
          id: props.id,
          name: '景点',
          description: '旅游景点分类',
          status: true,
          created_at: '2024-01-01 12:00:00'
        })
      } catch (error) {
        ElMessage.error('获取分类信息失败: ' + error.message)
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
            router.push('/categories')
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
      fetchCategory()
    }
    
    onMounted(() => {
      fetchCategory()
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
.category-edit {
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

.category-form {
  max-width: 600px;
  margin: 0 auto;
}
</style>