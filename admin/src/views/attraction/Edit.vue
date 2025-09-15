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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="景点名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入景点名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%" :loading="categoriesLoading">
                <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="开放时间" prop="opening_hours">
          <el-input v-model="form.opening_hours" placeholder="例如：08:00-18:00"/>
        </el-form-item>
        <el-form-item label="门票价格" prop="ticket_price">
          <el-input v-model="form.ticket_price" placeholder="例如：免费或 100元/人"/>
        </el-form-item>
        <el-form-item label="景点描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入景点描述"/>
        </el-form-item>
        <el-form-item label="景点特色" prop="features">
          <el-input v-model="form.features" type="textarea" :rows="2" placeholder="请输入景点特色，用逗号分隔"/>
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :http-request="handleUpload"
            :before-upload="beforeUpload"
          >
            <img v-if="form.image" :src="form.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持JPG、PNG格式，图片不超过5MB</div>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number v-model="form.latitude" :precision="6" :step="0.000001" style="width: 100%"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number v-model="form.longitude" :precision="6" :step="0.000001" style="width: 100%"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="form.is_active" active-text="启用" inactive-text="禁用"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保存</el-button>
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
import { AttractionService } from '@/services/attraction'
import { CategoryService } from '@/services/category'
import { UploadService } from '@/services/upload'

export default {
  name: 'AttractionEdit',
  components: { Plus },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const formRef = ref()
    const loading = ref(true)
    const submitLoading = ref(false)
    const categoriesLoading = ref(false)
    const categories = ref([])
    const attractionId = computed(() => route.params.id)

    const form = reactive({
      id: '',
      name: '',
      category_id: null,
      address: '',
      phone: '',
      opening_hours: '',
      ticket_price: '',
      description: '',
      features: '',
      image: '',
      latitude: null,
      longitude: null,
      rating: 0,
      recommend_level: 1,
      is_active: true,
      created_at: ''
    })

    const rules = {
      name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
      category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
      address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
    }

    const fetchCategories = async () => {
      categoriesLoading.value = true
      const result = await CategoryService.getAll({ is_active: true })
      if (result.success) {
        categories.value = result.data
      } else {
        ElMessage.error('获取分类列表失败')
      }
      categoriesLoading.value = false
    }

    const fetchAttraction = async () => {
      loading.value = true
      const result = await AttractionService.getById(attractionId.value)
      if (result.success && result.data) {
        Object.assign(form, result.data)
        if (Array.isArray(result.data.features)) {
          form.features = result.data.features.join(', ')
        }
      } else {
        ElMessage.error('获取景点信息失败')
        router.back()
      }
      loading.value = false
    }

    const beforeUpload = (file) => {
      const isImg = ['image/jpeg', 'image/png'].includes(file.type)
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isImg) ElMessage.error('图片只能是 JPG/PNG 格式!')
      if (!isLt5M) ElMessage.error('图片大小不能超过 5MB!')
      return isImg && isLt5M
    }

    const handleUpload = async (options) => {
      const result = await UploadService.uploadImage(options.file)
      if (result.success) {
        form.image = result.data.url
        ElMessage.success('图片上传成功')
      } else {
        ElMessage.error(result.message || '图片上传失败')
      }
    }

    const submitForm = async () => {
      if (!formRef.value) return;
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitLoading.value = true
          const featuresArray = form.features ? form.features.split(',').map(f => f.trim()).filter(f => f) : []
          const { id, created_at, updated_at, ...updateData } = form;
          updateData.features = featuresArray;

          const result = await AttractionService.update(attractionId.value, updateData)
          if (result.success) {
            ElMessage.success('更新成功')
            router.push('/attractions')
          } else {
            ElMessage.error(result.message || '更新失败')
          }
          submitLoading.value = false
        }
      })
    }

    onMounted(() => {
      fetchCategories()
      fetchAttraction()
    })

    return { formRef, loading, submitLoading, categoriesLoading, categories, form, rules, beforeUpload, handleUpload, submitForm }
  }
}
</script>
<style scoped>
.attraction-edit { padding: 20px; }
.form-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.attraction-form { max-width: 800px; margin: 0 auto; }
.avatar-uploader .avatar { width: 178px; height: 178px; display: block; object-fit: cover; border-radius: 6px; }
.avatar-uploader .el-upload { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; }
.el-icon.avatar-uploader-icon { font-size: 28px; color: #8c939d; width: 178px; height: 178px; text-align: center; }
.upload-tip { font-size: 12px; color: #999; margin-top: 5px; }
</style>