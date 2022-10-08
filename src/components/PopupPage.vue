<template>
  <div class="popup-page" :class="[!dialogVisible && 'hidden']">
    <slot v-if="dialogVisible"></slot>
  </div>
</template>

<script setup lang="ts">
import { useLockscreen } from 'element-plus'
import { computed, defineProps, defineEmits } from 'vue'
import useHistoryPopup from './useHistoryPopup'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 路由记录
  history: {
    type: Object
  },
  // 配置了history后，初次渲染时，如果有url上有history参数，则自动打开弹窗
  auto: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: '50%'
  },
  full: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(
  ['update:modelValue', 'autoOpen', 'autoClose']
)

const dialogVisible = computed<boolean>({ // 控制弹窗显示
  get () {
    return props.modelValue
  },
  set (val) {
    emit('update:modelValue', val)
  }
})

useLockscreen(dialogVisible)

useHistoryPopup({
  history: computed(() => props.history),
  auto: props.auto,
  dialogVisible: dialogVisible,
  onAutoOpen: () => emit('autoOpen'),
  onAutoClose: () => emit('autoClose')
})
</script>

<style lang='less'>
.popup-page {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  overflow: auto;
  padding: 10px;
  background: #fff;
  
  &.hidden {
    display: none;
  }
}
</style>