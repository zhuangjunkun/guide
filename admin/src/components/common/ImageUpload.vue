<template>
  <div class="image-upload">
    <el-upload
      v-model:file-list="fileList"
      :action="action"
      :multiple="multiple"
      :limit="limit"
      :list-type="listType"
      :accept="accept"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      v-bind="$attrs"
    >
      <el-icon v-if="listType === 'picture-card'"><Plus /></el-icon>
      <el-button v-else>
        <el-icon><Upload /></el-icon>
        {{ uploadText }}
      </el-button>
    </el-upload>
    
    <div class="upload-tip" v-if="tipText">
      {{ tipText }}
    </div>
    
    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible">
      <img w-full :src="previewImageUrl" alt="Preview Image" />
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ImageUpload',
  inheritAttrs: false,
  components: {
    Plus,
    Upload
  },
  props: {
    modelValue: {
      type: [Array, String],
      default: () => []
    },
    action: {
      type: String,
      default: '/api/upload'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 1
    },
    listType: {
      type: String,
      default: 'picture-card' // picture-card, text, picture
    },
    accept: {
      type: String,
      default: 'image/*'
    },
    maxSize: {
      type: Number,
      default: 5 // MB
    },
    uploadText: {
      type: String,
      default: '点击上传'
    },
    tipText: {
      type: String,
      default: '支持JPG、PNG格式，每张图片不超过5MB'
    }
  },
  
  emits: ['update:modelValue', 'success', 'error'],
  
  setup(props, { emit }) {
    const fileList = ref([])
    const previewVisible = ref(false)
    const previewImageUrl = ref('')
    
    // 监听modelValue变化
    watch(() => props.modelValue, (val) => {
      if (Array.isArray(val)) {
        fileList.value = val.map(item => ({
          name: item.name || item.url.split('/').pop(),
          url: item.url
        }))
      } else if (val) {
        fileList.value = [{ name: val.split('/').pop(), url: val }]
      } else {
        fileList.value = []
      }
    }, { immediate: true })
    
    // 图片预览
    const handlePreview = (file) => {
      previewImageUrl.value = file.url
      previewVisible.value = true
    }
    
    // 移除文件
    const handleRemove = (file, fileList) => {
      updateModelValue(fileList)
    }
    
    // 上传成功
    const handleSuccess = (response, file, fileList) => {
      updateModelValue(fileList)
      emit('success', response, file, fileList)
    }
    
    // 上传失败
    const handleError = (error, file, fileList) => {
      ElMessage.error('上传失败: ' + error.message)
      emit('error', error, file, fileList)
    }
    
    // 上传前检查
    const beforeUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
      
      if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
      }
      
      if (!isLtMaxSize) {
        ElMessage.error(`图片大小不能超过 ${props.maxSize}MB!`)
        return false
      }
      
      return true
    }
    
    // 更新modelValue
    const updateModelValue = (fileList) => {
      if (props.limit === 1 && fileList.length > 0) {
        // 单文件模式
        const file = fileList[0]
        const value = file.response ? file.response.url : file.url
        emit('update:modelValue', value)
      } else {
        // 多文件模式
        const values = fileList.map(file => ({
          name: file.name,
          url: file.response ? file.response.url : file.url
        }))
        emit('update:modelValue', values)
      }
    }
    
    return {
      fileList,
      previewVisible,
      previewImageUrl,
      handlePreview,
      handleRemove,
      handleSuccess,
      handleError,
      beforeUpload
    }
  }
})
</script>

<style scoped>
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 7px;
}
</style>