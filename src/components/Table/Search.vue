<template>
  <div>
    <template v-if="!finalSearch">
      <div v-if="!isSearchingOpen" class="flex relative items-center rounded-[5px] select-none gap-x-2 px-3.5 py-2.5 bg-gray-200/75 border-gray-300/75 text-nowrap text-gray-700 hover:bg-gray-300 active:bg-gray-400 cursor-pointer hover-transition" @click="openSearch">
        <PhMagnifyingGlass weight="bold" :size="16" />
        <div>Søg efter</div>
      </div>
      <div v-else class="relative">
        <PhMagnifyingGlass weight="bold" class="absolute left-[14px] top-[12px] text-gray-700" :size="16" />
        <input v-if="isSearchingOpen" v-click-outside="() => { isSearchingOpen = false; searchWord = '' }" @keydown.enter="search" type="text" v-model="searchWord" class="input !h-[41px] !w-[250px] !rounded-[5px] !mt-0 !pl-[37.5px]" ref="searchInput" placeholder="Søg efter" />
      </div>
    </template>
    <div class="flex items-center text-nowrap gap-x-2 h-[41px]" v-else>
      <div class="flex relative items-center gap-x-2 px-1 py-1 bg-red-500 border-gray-300/75 text-red-100 rounded-sm hover:bg-red-600 active:bg-red-700 cursor-pointer hover-transition" @click="resetSearch">
        <PhX weight="bold" :size="16" />
      </div>
      <div class="text-[15px] font-medium text-gray-700">{{ finalSearch }}</div>
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, nextTick } from 'vue'
import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue'

/*******************************
 * Refs & consts
******************************/
const emit = defineEmits(['search', 'resetSearch'])
const isSearchingOpen = ref(false)
const searchWord = ref('')
const searchInput = ref(null);
const finalSearch = ref(null);

/*******************************
 * Methods and computed
******************************/
const openSearch = async () => {
  isSearchingOpen.value = true
  await nextTick()
  if (searchInput.value) {
    searchInput.value.focus()
  }
}

const search = () => {
  finalSearch.value = searchWord.value;
  isSearchingOpen.value = false;
  searchWord.value = '';
  emit('search', finalSearch.value);
}

const resetSearch = () => {
  finalSearch.value = null;
  emit('resetSearch');
}
</script>

