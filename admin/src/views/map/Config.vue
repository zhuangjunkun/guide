<template>
  <div class="map-config">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>地图配置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 地图背景配置 -->
        <el-tab-pane label="地图背景" name="background">
          <el-form
            ref="backgroundFormRef"
            :model="backgroundForm"
            label-width="120px"
            class="config-form"
          >
            <el-form-item label="背景图片">
              <el-upload
                v-model:file-list="backgroundForm.image"
                class="upload-demo"
                action="/api/upload"
                :limit="1"
                list-type="picture-card"
                :on-preview="handlePictureCardPreview"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">
                请上传手绘地图背景图片，建议尺寸2048x1536像素，支持JPG、PNG格式
              </div>
            </el-form-item>
            
            <el-form-item label="背景颜色">
              <el-color-picker v-model="backgroundForm.color" />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="saveBackgroundConfig"
                :loading="backgroundLoading"
              >
                保存背景配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 景点标记配置 -->
        <el-tab-pane label="景点标记" name="markers">
          <div class="markers-container">
            <div class="markers-header">
              <el-button 
                type="primary" 
                @click="showMarkerDialog()"
              >
                <el-icon><Plus /></el-icon>
                添加标记
              </el-button>
            </div>
            
            <!-- 标记列表 -->
            <el-table 
              :data="markers" 
              v-loading="markersLoading"
              stripe 
              style="width: 100%"
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="标记名称" />
              <el-table-column prop="x" label="X坐标(%)" width="100" />
              <el-table-column prop="y" label="Y坐标(%)" width="100" />
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    @click="showMarkerDialog(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="deleteMarker(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible">
      <img w-full :src="previewImageUrl" alt="Preview Image" />
    </el-dialog>
    
    <!-- 标记编辑对话框 -->
    <el-dialog 
      v-model="markerDialogVisible" 
      :title="editingMarker ? '编辑标记' : '添加标记'"
      width="500px"
    >
      <el-form
        ref="markerFormRef"
        :model="markerForm"
        :rules="markerRules"
        label-width="100px"
      >
        <el-form-item label="标记名称" prop="name">
          <el-input 
            v-model="markerForm.name" 
            placeholder="请输入标记名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="坐标位置">
          <div class="coordinate-input">
            <el-input 
              v-model="markerForm.x" 
              placeholder="X坐标(%)"
              style="width: 100px"
            />
            <span class="separator">,</span>
            <el-input 
              v-model="markerForm.y" 
              placeholder="Y坐标(%)"
              style="width: 100px"
            />
            <el-button type="primary" @click="selectOnMap" style="margin-left: 10px">
              在地图上选择
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="markerDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="saveMarker"
          :loading="markerSaving"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'MapConfig',
  components: {
    Plus
  },
  
  setup() {
    const activeTab = ref('background')
    const previewVisible = ref(false)
    const previewImageUrl = ref('')
    
    // 背景配置
    const backgroundFormRef = ref()
    const backgroundLoading = ref(false)
    const backgroundForm = reactive({
      image: [],
      color: '#f0f0f0'
    })
    
    // 标记配置
    const markersLoading = ref(false)
    const markerDialogVisible = ref(false)
    const markerFormRef = ref()
    const markerSaving = ref(false)
    const editingMarker = ref(null)
    
    const markerForm = reactive({
      name: '',
      x: '',
      y: ''
    })
    
    const markerRules = {
      name: [
        { required: true, message: '请输入标记名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ]
    }
    
    // 标记数据
    const markers = ref([
      { id: 1, name: '西湖', x: 25, y: 30 },
      { id: 2, name: '灵隐寺', x: 45, y: 25 },
      { id: 3, name: '宋城', x: 60, y: 45 },
      { id: 4, name: '河坊街', x: 35, y: 60 }
    ])
    
    // 图片预览
    const handlePictureCardPreview = (file) => {
      previewImageUrl.value = file.url
      previewVisible.value = true
    }
    
    // 保存背景配置
    const saveBackgroundConfig = async () => {
      backgroundLoading.value = true
      
      try {
        // 模拟保存操作
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('背景配置保存成功')
      } catch (error) {
        ElMessage.error('保存失败: ' + error.message)
      } finally {
        backgroundLoading.value = false
      }
    }
    
    // 显示标记对话框
    const showMarkerDialog = (marker = null) => {
      editingMarker.value = marker
      if (marker) {
        markerForm.name = marker.name
        markerForm.x = marker.x
        markerForm.y = marker.y
      } else {
        markerForm.name = ''
        markerForm.x = ''
        markerForm.y = ''
      }
      markerDialogVisible.value = true
    }
    
    // 在地图上选择坐标
    const selectOnMap = () => {
      ElMessage.info('跳转到地图选择页面')
    }
    
    // 保存标记
    const saveMarker = async () => {
      if (!markerFormRef.value) return
      
      await markerFormRef.value.validate(async (valid) => {
        if (valid) {
          markerSaving.value = true
          
          try {
            if (editingMarker.value) {
              // 编辑标记
              const index = markers.value.findIndex(m => m.id === editingMarker.value.id)
              if (index !== -1) {
                markers.value[index] = {
                  ...markers.value[index],
                  name: markerForm.name,
                  x: markerForm.x,
                  y: markerForm.y
                }
              }
              ElMessage.success('标记更新成功')
            } else {
              // 添加标记
              markers.value.push({
                id: Date.now(),
                name: markerForm.name,
                x: markerForm.x,
                y: markerForm.y
              })
              ElMessage.success('标记添加成功')
            }
            
            markerDialogVisible.value = false
          } catch (error) {
            ElMessage.error('操作失败: ' + error.message)
          } finally {
            markerSaving.value = false
          }
        }
      })
    }
    
    // 删除标记
    const deleteMarker = (marker) => {
      ElMessageBox.confirm(
        `确定要删除标记 "${marker.name}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const index = markers.value.findIndex(m => m.id === marker.id)
        if (index !== -1) {
          markers.value.splice(index, 1)
          ElMessage.success('删除成功')
        }
      }).catch(() => {
        // 用户取消删除
      })
    }
    
    return {
      activeTab,
      previewVisible,
      previewImageUrl,
      backgroundFormRef,
      backgroundLoading,
      backgroundForm,
      markersLoading,
      markerDialogVisible,
      markerFormRef,
      markerSaving,
      editingMarker,
      markerForm,
      markerRules,
      markers,
      handlePictureCardPreview,
      saveBackgroundConfig,
      showMarkerDialog,
      selectOnMap,
      saveMarker,
      deleteMarker
    }
  }
}
</script>

<style scoped>
.map-config {
  padding: 20px;
}

.config-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-form {
  max-width: 600px;
}

.upload-demo {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.markers-container {
  padding: 20px 0;
}

.markers-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.coordinate-input {
  display: flex;
  align-items: center;
}

.separator {
  margin: 0 10px;
  font-weight: bold;
}
</style>