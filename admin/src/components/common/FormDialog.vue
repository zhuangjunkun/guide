<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    v-bind="$attrs"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      v-bind="formProps"
    >
      <slot :form-data="formData" :form-ref="formRef"></slot>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <slot name="footer" :loading="loading" :on-confirm="handleConfirm" :on-cancel="handleCancel">
          <el-button @click="handleCancel">{{ cancelText }}</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirm" 
            :loading="loading"
          >
            {{ confirmText }}
          </el-button>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export default defineComponent({
  name: 'FormDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '表单'
    },
    width: {
      type: String,
      default: '500px'
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    formRules: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    labelWidth: {
      type: String,
      default: '100px'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    formProps: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['update:modelValue', 'confirm', 'cancel', 'close'],
  
  setup(props, { emit }) {
    const formRef = ref()
    const visible = ref(false)
    
    // 监听modelValue变化
    watch(() => props.modelValue, (val) => {
      visible.value = val
    })
    
    // 关闭对话框
    const handleClose = (done) => {
      emit('close')
      emit('update:modelValue', false)
      done()
    }
    
    // 确认操作
    const handleConfirm = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (valid) {
          emit('confirm', props.formData)
        }
      })
    }
    
    // 取消操作
    const handleCancel = () => {
      emit('cancel')
      emit('update:modelValue', false)
    }
    
    return {
      formRef,
      visible,
      handleClose,
      handleConfirm,
      handleCancel
    }
  }
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>