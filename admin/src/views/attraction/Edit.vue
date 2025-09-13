<template>
  <div class="attraction-edit">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>编辑景点</span>
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
        class="attraction-form"
        v-loading="loading"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="景点ID">
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
            <el-form-item label="景点名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入景点名称"
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
        
        <el-form-item label="详细地址" prop="address">
          <el-input 
            v-model="form.address" 
            placeholder="请输入详细地址"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入联系电话"
            maxlength="50"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开放时间" prop="opening_hours">
              <el-input 
                v-model="form.opening_hours" 
                placeholder="请输入开放时间"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="门票价格" prop="ticket_price">
              <el-input 
                v-model="form.ticket_price" 
                placeholder="请输入门票价格"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="景点描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入景点描述"
            maxlength="500"
            show-word-limit
          />
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
        
        <el-form-item label="坐标信息" prop="location">
          <div class="location-input">
            <el-input 
              v-model="form.location.x" 
              placeholder="X坐标(%)"
              style="width: 120px"
            />
            <span class="coordinate-separator">,</span>
            <el-input 
              v-model="form.location.y" 
              placeholder="Y坐标(%)"
              style="width: 120px"
            />
            <el-button type="primary" @click="selectOnMap" style="margin-left: 10px">
              在地图上选择
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            active-text="启用"
            inactive-text="禁用"
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
  name: 'AttractionEdit',
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
      name: '',
      category_id: '',
      address: '',
      phone: '',
      opening_hours: '',
      ticket_price: '',
      description: '',
      images: [],
      location: {
        x: '',
        y: ''
      },
      status: true,
      created_at: ''
    })
    
    // 表单验证规则
    const rules = {
      name: [
        { required: true, message: '请输入景点名称', trigger: 'blur' },
        { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
      ],
      category_id: [
        { required: true, message: '请选择分类', trigger: 'change' }
      ],
      address: [
        { required: true, message: '请输入详细地址', trigger: 'blur' },
        { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
      ],
      description: [
        { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }
      ]
    }
    
    // 获取景点详情
    const fetchAttraction = async () => {
      loading.value = true
      
      try {
        // 模拟获取数据
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟数据
        Object.assign(form, {
          id: props.id,
          name: '西湖',
          category_id: '1',
          address: '杭州市西湖区',
          phone: '0571-12345678',
          opening_hours: '08:00-18:00',
          ticket_price: '免费',
          description: '西湖，位于浙江省杭州市西湖区龙井路1号，杭州市区西部，景区总面积49平方千米，汇水面积21.22平方千米，湖面面积6.38平方千米。',
          images: [
            { name: 'image1.jpg', url: 'https://picsum.photos/300/200?random=1' },
            { name: 'image2.jpg', url: 'https://picsum.photos/300/200?random=2' }
          ],
          location: {
            x: '25',
            y: '30'
          },
          status: true,
          created_at: '2024-01-01 12:00:00'
        })
      } catch (error) {
        ElMessage.error('获取景点信息失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    // 在地图上选择坐标
    const selectOnMap = () => {
      ElMessage.info('跳转到地图选择页面')
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
            router.push('/attractions')
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
      fetchAttraction()
    }
    
    onMounted(() => {
      fetchAttraction()
    })
    
    return {
      formRef,
      loading,
      submitLoading,
      form,
      rules,
      selectOnMap,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.attraction-edit {
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

.attraction-form {
  max-width: 800px;
  margin: 0 auto;
}

.location-input {
  display: flex;
  align-items: center;
}

.coordinate-separator {
  margin: 0 10px;
  font-weight: bold;
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