# Vue3 除了keep-alive，还有哪些页面缓存的实现方案

## 引言

有这么一个需求：列表页进入详情页后，切换回列表页，需要对列表页进行缓存，如果从首页进入列表页，就要重新加载列表页。

对于这个需求，我的第一个想法就是使用keep-alive来缓存列表页，列表和详情页切换时，列表页会被缓存；从首页进入列表页时，就重置列表页数据并重新获取新数据来达到列表页重新加载的效果。

但是，这个方案有个很不好的地方就是：如果列表页足够复杂，有下拉刷新、下拉加载、有弹窗、有轮播等，在清除缓存时，就需要重置很多数据和状态，而且还可能要手动去销毁和重新加载某些组件，这样做既增加了复杂度，也容易出bug。

接下来说说我的想到的新实现方案（代码基于Vue3）。

## 省流

demo: https://xiaocheng555.github.io/page-cache/#/

代码: https://github.com/xiaocheng555/page-cache

## keep-alive 缓存和清除

> keep-alive 缓存原理：进入页面时，页面组件渲染完成，keep-alive 会缓存页面组件的实例；离开页面后，组件实例由于已经缓存就不会进行销毁；当再次进入页面时，就会将缓存的组件实例拿出来渲染，因为组件实例保存着原来页面的数据和Dom的状态，那么直接渲染组件实例就能得到原来的页面。

keep-alive 最大的难题就是缓存的清理，如果能有简单的缓存清理方法，那么keep-alive 组件用起来就很爽。

但是，keep-alive 组件没有提供清除缓存的API，那有没有其他清除缓存的办法呢？答案是有的。我们先看看 keep-alive 组件的props：

``` 
include - string | RegExp | Array。只有名称匹配的组件会被缓存。
exclude - string | RegExp | Array。任何名称匹配的组件都不会被缓存。
max - number | string。最多可以缓存多少组件实例。
```

从include描述来看，我发现include是可以用来清除缓存，做法是：将组件名称添加到include里，组件会被缓存；移除组件名称，组件缓存会被清除。根据这个原理，用hook简单封装一下代码：

``` ts
import { ref, nextTick } from 'vue'

const caches = ref<string[]>([])

export default function useRouteCache () {
  // 添加缓存的路由组件
  function addCache (componentName: string | string []) {
    if (Array.isArray(componentName)) {
      componentName.forEach(addCache)
      return
    }
    
    if (!componentName || caches.value.includes(componentName)) return

    caches.value.push(componentName)
  }

  // 移除缓存的路由组件
  function removeCache (componentName: string) {
    const index = caches.value.indexOf(componentName)
    if (index > -1) {
      return caches.value.splice(index, 1)
    }
  }
  
  // 移除缓存的路由组件的实例
  async function removeCacheEntry (componentName: string) {    
    if (removeCache(componentName)) {
      await nextTick()
      addCache(componentName)
    }
  }
  
  return {
    caches,
    addCache,
    removeCache,
    removeCacheEntry
  }
}
```

hook的用法如下：

``` vue
<router-view v-slot="{ Component }">
  <keep-alive :include="caches">
    <component :is="Component" />
  </keep-alive>
</router-view>

<script setup lang="ts">
import useRouteCache from './hooks/useRouteCache'
const { caches, addCache } = useRouteCache()

<!-- 将列表页组件名称添加到需要缓存名单中 -->
addCache(['List'])
</script>
```

清除列表页缓存如下：

``` ts
import useRouteCache from '@/hooks/useRouteCache'

const { removeCacheEntry } = useRouteCache()
removeCacheEntry('List')
```

> 此处removeCacheEntry方法清除的是列表组件的实例，'List' 值仍然在 <keep-alive> 组件的include里，下次重新进入列表页会重新加载列表组件，并且之后会继续列表组件进行缓存。

### 列表页清除缓存的时机

#### 进入列表页后清除缓存

在列表页路由组件的beforeRouteEnter勾子中判断是否是从其他页面（Home）进入的，是则清除缓存，不是则使用缓存。

``` ts
defineOptions({
  name: 'List1',
  beforeRouteEnter (to: RouteRecordNormalized, from: RouteRecordNormalized) {
    if (from.name === 'Home') {
      const { removeCacheEntry } = useRouteCache()
      removeCacheEntry('List1')
    }
  }
})
```

这种缓存方式有个不太友好的地方：当从首页进入列表页，列表页和详情页来回切换，列表页是缓存的；但是在首页和列表页间用浏览器的前进后退来切换时，我们更多的是希望列表页能保留缓存，就像在多页面中浏览器前进后退会缓存原页面一样的效果。但实际上，列表页重新刷新了，这就需要使用另一种解决办法，<b>点击链接时清除缓存清除缓存</b>。

#### 点击链接跳转前清除缓存

在首页点击跳转列表页前，在点击事件的时候去清除列表页缓存，这样的话在首页和列表页用浏览器的前进后退来回切换，列表页都是缓存状态，只要当重新点击跳转链接的时候，才重新加载列表页，满足预期。

``` vue
// 首页 Home.vue

<li>
  <router-link to="/list" @click="removeCacheBeforeEnter">列表页</router-link>
</li>


<script setup lang="ts">
import useRouteCache from '@/hooks/useRouteCache'

defineOptions({
  name: 'Home'
})

const { removeCacheEntry } = useRouteCache()

// 进入页面前，先清除缓存实例
function removeCacheBeforeEnter () {
  removeCacheEntry('List')
}
</script>
```

## 状态管理实现缓存

通过状态管理库存储页面的状态和数据也能实现页面缓存。此处状态管理使用的是pinia。

首先使用pinia创建列表页store：

``` ts
import { defineStore } from 'pinia'

interface Item {
  id?: number,
  content?: string
}

const useListStore = defineStore('list', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => {
    return {
      isRefresh: true,
      pageSize: 30,
      currentPage: 1,
      list: [] as Item[],
      curRow: null as Item | null
    }
  },
  actions: {
    setList (data: Item []) {
      this.list = data
    },
    setCurRow (data: Item) {
      this.curRow = data
    },
    setIsRefresh (data: boolean) {
      this.isRefresh = data
    }
  }
})

export default useListStore
```

然后在列表页中使用store：

```vue
<div>
  <el-page-header @back="goBack">
    <template #content>状态管理实现列表页缓存</template>
  </el-page-header>
  <el-table v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 30px;">
    <el-table-column prop="id" label="id" />
    <el-table-column prop="content" label="内容"/>
    <el-table-column label="操作">
      <template v-slot="{ row }">
        <el-link type="primary" @click="gotoDetail(row)">进入详情</el-link>
        <el-tag type="success" v-if="row.id === listStore.curRow?.id">刚点击</el-tag>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    v-model:currentPage="listStore.currentPage"
    :page-size="listStore.pageSize"
    layout="total, prev, pager, next"
    :total="listStore.list.length"
  />
</div>
  
<script setup lang="ts">
import useListStore from '@/store/listStore'
const listStore = useListStore()

...
</script>
```

通过beforeRouteEnter钩子判断是否从首页进来，是则通过 `listStore.$reset()` 来重置数据，否则使用缓存的数据状态；之后根据 `listStore.isRefresh` 标示判断是否重新获取列表数据。

``` ts
defineOptions({
  beforeRouteEnter (to: RouteLocationNormalized, from: RouteLocationNormalized) {
    if (from.name === 'Home') {
      const listStore = useListStore()
      listStore.$reset()
    }
  }
})

onBeforeMount(() => {
  if (!listStore.useCache) {
    loading.value = true
    setTimeout(() => {
      listStore.setList(getData())
      loading.value = false
    }, 1000)
    listStore.useCache = true
  }
})
```

### 缺点

通过状态管理去做缓存的话，需要将状态数据都存在stroe里，状态多起来的话，会有点繁琐，而且状态写在store里肯定没有写在列表组件里来的直观；状态管理由于只做列表页数据的缓存，对于一些非受控组件来说，组件内部状态改变是缓存不了的，这就导致页面渲染后跟原来有差别，需要额外代码操作。


## 页面弹窗实现缓存

将详情页做成全屏弹窗，那么从列表页进入详情页，就只是简单地打开详情页弹窗，将列表页覆盖，从而达到列表页 “缓存”的效果，而非真正的缓存。

这里还有一个问题，打开详情页之后，如果点后退，会返回到首页，实际上我们希望是返回列表页，这就需要给详情弹窗加个历史记录，如列表页地址为 '/list'，打开详情页变为 '/list?id=1'。

弹窗组件实现：

``` vue
// PopupPage.vue

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
```

弹窗组件调用：

``` vue
<popup-page 
  v-model="visible" 
  full
  :history="{ id: id }">
  <Detail></Detail>
</popup-page>
```

> hook：useHistoryPopup 参考文章：https://juejin.cn/post/7139941749174042660

## 父子路由实现缓存

该方案原理其实就是页面弹窗，列表页为父路由，详情页为子路由，从列表页跳转到详情页时，显示详情页字路由，且详情页全屏显示，覆盖住列表页。

声明父子路由：

``` ts
{
  path: '/list',
  name: 'list',
  component: () => import('./views/List.vue'),
  children: [
    {
      path: '/detail',
      name: 'detail',
      component: () => import('./views/Detail.vue'),
    }
  ]
}
```

列表页代码：

``` 
// 列表页
<template>
  <el-table v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 30px;">
    <el-table-column prop="id" label="id" />
    <el-table-column prop="content" label="内容"/>
    <el-table-column label="操作">
      <template v-slot="{ row }">
        <el-link type="primary" @click="gotoDetail(row)">进入详情</el-link>
        <el-tag type="success" v-if="row.id === curRow?.id">刚点击</el-tag>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    v-model:currentPage="currentPage"
    :page-size="pageSize"
    layout="total, prev, pager, next"
    :total="list.length"
  />
  
  <!-- 详情页 -->
  <router-view class="popyp-page"></router-view>
</template>

<style lang='less' scoped>
.popyp-page {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  overflow: auto;
}
</style>
```

## 结尾

地址：

demo: https://xiaocheng555.github.io/page-cache/#/

代码: https://github.com/xiaocheng555/page-cache




