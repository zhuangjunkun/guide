<template>
  <div class="route-create">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>新建路线</span>
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
        class="route-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路线名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入路线名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="预估时间" prop="estimated_time">
              <el-input 
                v-model="form.estimated_time" 
                placeholder="请输入预估时间"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="难度等级" prop="difficulty">
              <el-select 
                v-model="form.difficulty" 
                placeholder="请选择难度等级"
                style="width: 100%"
              >
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="form.status"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="路线描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入路线描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="景点列表" prop="attractions">
          <el-transfer
            v-model="form.attractions"
            :data="attractionOptions"
            :titles="['可选景点', '已选景点']"
            filterable
            filter-placeholder="请输入景点名称"
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

export default {
  name: 'RouteCreate',
  
  setup() {
    const router = useRouter()
    const formRef = ref()
    const loading = ref(false)
    
    // 表单数据
    const form = reactive({
      name: '',
      estimated_time: '',
      difficulty: '',
      description: '',
      attractions: [],
      status: true
    })
    
    // 景点选项
    const attractionOptions = ref([
      { key: 1, label: '西湖' },
      { key: 2, label: '灵隐寺' },
      { key: 3, label: '宋城' },
      { key: 4, label: '河坊街' },
      { key: 5, label: '雷峰塔' },
      { key: 6, label: '千岛湖' },
      { key: 7, label: '西溪湿地' },
      { key: 8, label: '杭州博物馆' }
    ])
    
    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入路线名称', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      estimated_time: [
        { required: true, message: '请输入预估时间', trigger: 'blur' },
        { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }
      ],
      difficulty: [
        { required: true, message: '请选择难度等级', trigger: 'change' }
      ],
      description: [
        { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
      ],
      attractions: [
        { required: true, message: '请选择景点', trigger: 'change' },
        { type: 'array', min: 1, message: '至少选择一个景点', trigger: 'change' }
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
            router.push('/routes')
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
      form.name = ''
      form.estimated_time = ''
      form.difficulty = ''
      form.description = ''
      form.attractions = []
      form.status = true
    }
    
    return {
      formRef,
      loading,
      form,
      attractionOptions,
      rules,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.route-create {
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

.route-form {
  max-width: 800px;
  margin: 0 auto;
}
</style>