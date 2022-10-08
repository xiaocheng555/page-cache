import { ref, watch, onBeforeMount, Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export interface Option {
  history: Ref, // URL上的记录
  dialogVisible: Ref<boolean>, // 控制弹窗显示
  auto?: boolean, // 初次渲染，如果url上存在记录则自动打开
  onAutoOpen?: Function, // 自动打开回调
  onAutoClose?: Function, // 自动关闭回调
}

export default (option: Option) => {
  const router = useRouter()
  const route = useRoute()
  const firstOpen = ref(false) // 是否首次打开弹窗
  const { dialogVisible } = option
  
  let hasOpenRecord = false // 是否有打开弹窗的记录
  let autoTriggleClose = false // 是否自动关闭弹窗

  // 初次渲染时，检测是否需要打开弹窗，url存在history参数则打开
  function checkAutoOpen () {
    if (option.auto && hasHistoryInQuery()) {
      dialogVisible.value = true
      firstOpen.value = true
    }
  }
  
  // 弹窗打开
  function handleOpen () {
    addHistory()
  } 

  // 弹窗关闭
  function handleClose () {    
    // 如果是用户手动关闭弹窗，而且url上存在history参数，则需清除掉
    if (!autoTriggleClose && hasHistoryInQuery()) {
      // 两种清除url上history方法：
      // （1）如果有返回记录，则go(-1)后退清除history；
      // （2）如果没有则必须通过removeHistory来手动清除history（router.replace重置query上的history参数）
      if (hasBackRecord()) {
        router.go(-1)
      } else {
        removeHistory()
      }
      console.log('手动关闭弹窗')
    }
    // 重置数据
    firstOpen.value = false
    autoTriggleClose = false
    hasOpenRecord = false
  }
  
  // 是否正确的返回路径（该方法只支持vue-router@4）
  // 当前路由的query和返回路由的query参数相减，刚好是history数据，说明是正确的返回路径，则可以通过router.go(-1)返回上一页来消除query上的history数据
  function hasBackRecord () {
    // vue-router@4 通过window.history.state 能获取路由的记录信息
    const state = window.history?.state
    if (state) {
      if (!state.back) return false
      
      const backRoute = router.resolve(state.back || '') // 解析出返回路由
      if (backRoute.path === route.path) {
        const backQuery = backRoute.query 
        const curQuery = {...route.query}
        
        /* 当前路由的query和返回路由的query参数相减，刚好是history数据 */
        for (let key in backQuery) {
          if (!curQuery[key]) return false
          delete curQuery[key]
        }
        for (let key in option.history.value) {
          if (!curQuery[key]) return false
          delete curQuery[key]
        }
        return Object.keys(curQuery).length === 0
      }
      return false
    } else {
      // 非vue-router@4是没有back的，则通过hasOpenRecord来判断
      return hasOpenRecord
    }
  }
  
  // 路由query上有history数据
  function hasHistoryInQuery () {
    if (!option.history.value) return false

    const { query } = route
    return Object.keys(option.history.value).some(key => {
      return !!query[key]
    })
  }

  // 在url上添加History参数
  function addHistory () {
    // 如果query上不存在history参数，则添加history参数
    if (!hasHistoryInQuery()) {
      router.push({
        query: {
          ...route.query,
          ...option.history.value
        }
      })
      hasOpenRecord = true
      console.log('手动打开弹窗')
    }
  }

  // 在url上移除History参数
  function removeHistory () {
    if (!option.history.value) return

    // 清除query上history的值
    const resetHistory: any = {}
    Object.keys(option.history.value).forEach(key => {
      resetHistory[key] = undefined
    })
    router.replace({
      query: {
        ...route.query,
        ...resetHistory
      }
    })
  }

  onBeforeMount(() => {
    if (dialogVisible.value) {
      handleOpen()
    } else {
      checkAutoOpen()
    }
  })

  watch(() => route.query, () => {
    if (!option.history.value) return

    const hasHistory = hasHistoryInQuery()
    // 自动关闭弹窗(浏览器后退自动触发关闭)
    if (!hasHistory && dialogVisible.value) {
      dialogVisible.value = false
      autoTriggleClose = true
      option?.onAutoClose?.()
      console.log('自动关闭弹窗')
      return
    }
    // 自动打开弹窗(浏览器前进自动触发打开)
    if (hasHistory && !dialogVisible.value) {
      dialogVisible.value = true
      hasOpenRecord = true
      option?.onAutoOpen?.()
      console.log('自动打开弹窗')
    }
  })
  
  watch(() => dialogVisible.value, (val) => {
    val ? handleOpen() : handleClose()
  })
  
  return {
    firstOpen
  }
}