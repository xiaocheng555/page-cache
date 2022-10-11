<template>
  <div>
    <el-page-header @back="goBack">
      <template #content>弹窗实现列表页缓存</template>
    </el-page-header>
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
    
    <popup-page 
      v-model="visible" 
      full
      :history="{ data: JSON.stringify(curRow) }">
      <Detail></Detail>
    </popup-page>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import PopupPage from '@/components/PopupPage.vue'
import Detail from './Detail.vue'

interface Item { 
  id?: number, 
  content?: string 
}

const list = ref<Item []>([])
const curRow = ref<Item | null>(null)
const currentPage = ref(1)
const pageSize = ref(30)
const visible = ref(false)
const router = useRouter()
const tableData = computed(() => {
  const start = pageSize.value * (currentPage.value - 1)
  return list.value.slice(start, start + pageSize.value)
})
const loading = ref(false)

function getData (n = 200) {
  function getRandomContent () {
    const content = [
      '这是一条测试数据',
      '君不见黄河之水天上来，奔流到海不复回。',
      '十年生死两茫茫',
      '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。',
      '桃花坞里桃花庵，桃花庵里桃花仙；桃花仙人种桃树，又摘桃花卖酒钱。',
      '明月几时有，把酒问青天。',
      '槛菊愁烟兰泣露，罗幕轻寒，',
      '寒蝉凄切，对长亭晚，骤雨初歇。都门帐饮无绪，留恋处，兰舟催发。执手相看泪眼，竟无语凝噎。念去去，千里烟波，暮霭沉沉楚天阔。多情自古伤离别，更那堪冷落清秋节！今宵酒醒何处？杨柳岸，晓风残月。此去经年，应是良辰好景虚设。便纵有千种风情，更与何人说？',
      '红豆生南国，春来发几枝。',
      '黄鹂'
    ]
    const i = Math.floor(Math.random() * 10)
    return content[i]
  }
  
  const list = []
  for (let i = 0; i < n; i++) {
    list.push({
      id: i,
      content: getRandomContent()
    })
  }
  return list
}

function gotoDetail (row: Item) {
  curRow.value = row
  visible.value = true
}

function goBack () {
  router.back()
}

onBeforeMount(() => {
  loading.value = true
  setTimeout(() => {
    list.value = getData()
    loading.value = false
  }, 1000)
})
</script>

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