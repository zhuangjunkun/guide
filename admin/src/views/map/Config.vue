<template>
  <div class="map-config-page">
    <el-card class="map-card">
      <template #header>
        <div class="card-header">
          <span>可视化地图配置</span>
          <el-tooltip
            class="box-item"
            effect="dark"
            content="在地图上点击可以添加新景点，拖动现有景点可以更新其位置。"
            placement="left"
          >
            <i class="el-icon-question">
              <el-icon><QuestionFilled /></el-icon>
            </i>
          </el-tooltip>
        </div>
      </template>
      <div class="map-container" v-loading="loading">
        <ImageMapEditor
          v-if="mapImageUrl"
          :image-url="mapImageUrl"
          :markers="attractions"
          @map-click="handleMapClick"
          @marker-drag="handleMarkerDrag"
        />
        <el-empty v-else description="地图图片加载失败"></el-empty>
      </div>
    </el-card>

    <FormDialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑景点' : '添加新景点'"
      :form-data="attractionForm"
      @confirm="handleSaveAttraction"
      :loading="saving"
    >
      <template #default="{ formData }">
        <el-form
          :model="formData"
          ref="formRef"
        >
          <el-form-item label="景点名称" prop="name" :rules="{ required: true, message: '请输入景点名称', trigger: 'blur' }">
            <el-input v-model="formData.name" placeholder="请输入景点名称"></el-input>
          </el-form-item>
          <el-form-item label="景点描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              placeholder="请输入景点描述 (可选)"
            ></el-input>
          </el-form-item>
          <el-form-item label="相对坐标">
            <el-input :model-value="formData.longitude ? formData.longitude.toFixed(4) : 'N/A'" disabled style="width: 120px">
              <template #prepend>X</template>
            </el-input>
            <el-input :model-value="formData.latitude ? formData.latitude.toFixed(4) : 'N/A'" disabled style="width: 120px; margin-left: 10px;">
              <template #prepend>Y</template>
            </el-input>
          </el-form-item>
        </el-form>
      </template>
    </FormDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { QuestionFilled } from '@element-plus/icons-vue';
import ImageMapEditor from '@/components/ImageMapEditor.vue';
import FormDialog from '@/components/common/FormDialog.vue';
import { AttractionService } from '@/services/attraction.js';
import mapBackground from '@/assets/map.png';

const loading = ref(true);
const saving = ref(false);
const attractions = ref([]);
const mapImageUrl = ref(mapBackground);

const dialogVisible = ref(false);
const isEditing = ref(false);
const attractionForm = ref({});
const formRef = ref(null);

// --- Data Fetching and Updating ---

async function loadAttractions() {
  loading.value = true;
  const { success, data, message } = await AttractionService.getAll();
  if (success) {
    attractions.value = data;
  } else {
    ElMessage.error(message || '加载景点数据失败');
  }
  loading.value = false;
}

onMounted(() => {
  loadAttractions();
});

// --- Event Handlers ---

function handleMapClick(coords) {
  isEditing.value = false;
  attractionForm.value = {
    name: '',
    description: '',
    map_x: coords.longitude,
    map_y: coords.latitude,
  };
  dialogVisible.value = true;
}

async function handleMarkerDrag(updateInfo) {
  const { id, longitude, latitude } = updateInfo;
  
  const marker = attractions.value.find(a => a.id === id);
  if (!marker) return;

  const originalPosition = { longitude: marker.longitude, latitude: marker.latitude };
  
  marker.longitude = longitude;
  marker.latitude = latitude;

  const { success, message } = await AttractionService.update(id, { longitude, latitude });

  if (success) {
    ElNotification({
      title: '成功',
      message: `景点 "${marker.name}" 位置已更新。`,
      type: 'success',
      duration: 2000,
    });
  } else {
    marker.longitude = originalPosition.longitude;
    marker.latitude = originalPosition.latitude;
    ElMessage.error(message || '更新景点位置失败');
  }
}

async function handleSaveAttraction(formData) {
  saving.value = true;
  let response;
  if (isEditing.value) {
    response = await AttractionService.update(formData.id, formData);
  } else {
    response = await AttractionService.create(formData);
  }

  if (response.success) {
    dialogVisible.value = false;
    ElMessage.success(isEditing.value ? '景点更新成功！' : '新景点添加成功！');
    await loadAttractions();
  } else {
    ElMessage.error(response.message || '操作失败');
  }
  saving.value = false;
}
</script>

<style scoped>
.map-config-page {
  padding: 20px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
}

.map-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
}

.card-header .el-icon-question {
  cursor: pointer;
  color: #909399;
}

:deep(.el-card__body) {
  padding: 1px;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>
