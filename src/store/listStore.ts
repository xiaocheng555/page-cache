import { defineStore } from 'pinia'

interface Item {
  id?: number,
  content?: string
}

const useListStore = defineStore('list', {
  // 推荐使用 完整类型推断的箭头函数
  state: () => {
    return {
      useCache: false,
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
    }
  }
})

export default useListStore