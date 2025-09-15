<template>
  <div class="category-create">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>新建分类</span>
          <div class="header-actions">
            <el-button @click="$router.back()">返回</el-button>
          </div>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称"/>
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入分类描述"/>
        </el-form-item>
        <el-form-item label="父级分类" prop="parent_id">
          <el-select v-model="form.parent_id" placeholder="请选择父级分类" style="width: 100%" clearable :loading="categoriesLoading">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
          </el-select>
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
          <div class="upload-tip">支持JPG、PNG格式，图片不超过2MB</div>
        </el-form-item>
        <el-form-item label="状态" prop="is_active">
          <el-switch v-model="form.is_active" active-text="启用" inactive-text="禁用"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">创建</el-button>
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
import { CategoryService } from '@/services/category'
import { UploadService } from '@/services/upload'

export default {
  name: 'CategoryCreate',
  components: { Plus },
  setup() {
    const router = useRouter()
    const formRef = ref()
    const submitLoading = ref(false)
    const categoriesLoading = ref(false)
    const categories = ref([])

    const initialForm = {
      name: '',
      description: '',
      parent_id: null,
      image: '',
      is_active: true,
    }
    const form = reactive({ ...initialForm })

    const rules = {
      name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
    }

    const fetchCategories = async () => {
      categoriesLoading.value = true
      const result = await CategoryService.getAll({ is_active: true })
      if (result.success) {
        categories.value = result.data.filter(c => !c.parent_id) // 只显示顶级分类
      } else {
        ElMessage.error('获取父级分类列表失败')
      }
      categoriesLoading.value = false
    }

    const beforeUpload = (file) => {
      const isImg = ['image/jpeg', 'image/png'].includes(file.type)
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isImg) ElMessage.error('图片只能是 JPG/PNG 格式!')
      if (!isLt2M) ElMessage.error('图片大小不能超过 2MB!')
      return isImg && isLt2M
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
          const result = await CategoryService.create(form)
          if (result.success) {
            ElMessage.success('创建成功')
            router.push('/categories')
          } else {
            ElMessage.error(result.message || '创建失败')
          }
          submitLoading.value = false
        }
      })
    }

    const resetForm = () => {
      Object.assign(form, initialForm)
      formRef.value.resetFields()
    }

    onMounted(fetchCategories)

    return { formRef, submitLoading, categoriesLoading, categories, form, rules, beforeUpload, handleUpload, submitForm, resetForm }
  }
}
</script>
<style scoped>
.category-create { padding: 20px; }
.form-card { border-radius: 8px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.avatar-uploader .avatar { width: 120px; height: 120px; display: block; object-fit: cover; border-radius: 6px; }
.avatar-uploader .el-upload { border: 1px dashed #d9d9d9; border-radius: 6px; cursor: pointer; }
.el-icon.avatar-uploader-icon { font-size: 28px; color: #8c939d; width: 120px; height: 120px; text-align: center; }
.upload-tip { font-size: 12px; color: #999; margin-top: 5px; }
</style>