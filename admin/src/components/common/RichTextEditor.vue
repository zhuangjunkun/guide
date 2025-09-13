<template>
  <div class="rich-text-editor">
    <div ref="editorRef" class="editor-container"></div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue'

export default defineComponent({
  name: 'RichTextEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    height: {
      type: [String, Number],
      default: 300
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    toolbar: {
      type: Array,
      default: () => [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean']
      ]
    }
  },
  
  emits: ['update:modelValue'],
  
  setup(props, { emit }) {
    const editorRef = ref()
    let quill = null
    
    // 初始化编辑器
    const initEditor = () => {
      // 这里应该引入Quill或其他富文本编辑器库
      // 由于是示例，我们使用简单的textarea替代
      const textarea = document.createElement('textarea')
      textarea.style.width = '100%'
      textarea.style.height = typeof props.height === 'number' ? props.height + 'px' : props.height
      textarea.style.padding = '10px'
      textarea.style.border = '1px solid #dcdfe6'
      textarea.style.borderRadius = '4px'
      textarea.style.resize = 'vertical'
      textarea.placeholder = props.placeholder
      textarea.value = props.modelValue
      
      // 监听输入事件
      textarea.addEventListener('input', (e) => {
        emit('update:modelValue', e.target.value)
      })
      
      editorRef.value.appendChild(textarea)
    }
    
    // 监听modelValue变化
    watch(() => props.modelValue, (val) => {
      if (editorRef.value && editorRef.value.querySelector('textarea')) {
        editorRef.value.querySelector('textarea').value = val
      }
    })
    
    onMounted(() => {
      initEditor()
    })
    
    onBeforeUnmount(() => {
      // 销毁编辑器实例
      if (quill) {
        quill = null
      }
    })
    
    return {
      editorRef
    }
  }
})
</script>

<style scoped>
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}
</style>