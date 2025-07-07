<template>
  <div>
    <div class="flex items-center gap-x-2 text-[14px] mb-3">
      <Table-Search v-if="search" @search="search" @resetSearch="resetSearch" />
      <slot name="extra"></slot>
    </div>
    <template v-if="!pageLoading">
      <table class="table-auto border-collapse border-spacing-y-[0px] drop-shadow-sm w-full" ref="table">
        <thead class="bg-gray-100">
          <tr>
            <th class="first:pl-4 text-left border-b last:pr-4 px-2 border-[1px] border-[#eceff0] py-[8px] text-[13.5px] font-medium  text-slate-600" :class="{ 'last:text-right': lastRight }" v-for="header in headers" :key="header.name">
              <div @click="sort(header)" :class="{ 'flex items-center justify-between cursor-pointer hover:text-black active:font-medium active:drop-shadow-md select-none': header.sortable }">
                <span>{{ header?.name }}</span>
                <span v-if="header.sortable">
                  <PhSplitVertical :size="16" class="text-gray-400" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-if="list?.length">
          <tr class="table-component bg-white text-[13px] border-b-[1px] border-[#eceff0]" v-for="item in list" :key="item.id">
            <slot name="body" :item="item"></slot>
          </tr>
        </tbody>
      </table>
      <LayoutComponents-Pagination v-if="itemPerPage && totalPages > 1" ref="childComponentRef" :itemPerPage="itemPerPage" @currentPage="(cp) => { goToPage(cp) }" :totalPages="totalPages" :currentPage="currentPage" />
      <Empty v-if="!list?.length" :message="emptyMessage" class="py-14 mt-10 flex flex-col justify-center items-center" />
    </template>
    <div class="gap-4 grid mt-5" v-else :class="getLoadingSkeleton()">
      <div v-for="i in headers?.length * 4" :key="i" class="bg-gray-100 h-[20px] rounded-md w-full animate-pulse"></div>
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, computed } from 'vue'
import { PhSplitVertical } from '@phosphor-icons/vue'
import { axiosClient } from '@/lib/axiosClient'

const props = defineProps({
  headers: {},
  data: {},
  emptyMessage: {},
  lastRight: { default: false },
  search: { default: true },
});

/*******************************
 * Refs & consts
 ******************************/
const pageLoading = ref(false);
const pageData = ref({...props.data});
const list = computed(() => pageData.value?.data || []);
const table = ref();
const itemPerPage = computed(() => pageData.value?.per_page);
const currentPage = computed(() => pageData.value?.current_page);
const totalPages = computed(() => pageData.value?.last_page);
const childComponentRef = ref();
const searchWord = ref(null);

/*******************************
 * Methods and computed
******************************/
const resetSearch = () => {
  searchWord.value = null;
  goToPage(1);
}

const search = (s) => {
  searchWord.value = s;
  goToPage(1, searchWord.value);
}

const sort = (sortType) => {
  if (!sortType.sortable) {
    return;
  }

  if (!sortType.sortType) {
    sortType.sortType = 'asc';
  } else if (sortType.sortType === 'asc') {
    sortType.sortType = 'desc';
  } else {
    sortType.sortType = 'asc';
  }

  list.value.sort((a, b) => {
    const sortableA = getNestedProperty(a, sortType.sortable);
    const sortableB = getNestedProperty(b, sortType.sortable);

    if (sortType.sortType === 'asc') {
      if (sortableA < sortableB) {
        return -1;
      }
      if (sortableA > sortableB) {
        return 1;
      }
      return 0;
    } else {
      if (sortableA > sortableB) {
        return -1;
      }
      if (sortableA < sortableB) {
        return 1;
      }
      return 0;
    }
  });
}

const scrollToTop = () => {
  if (table.value) {
    table.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const getNestedProperty = (obj, property, defaultValue = null) => {
  const properties = property.split('.');
  return properties.reduce((acc, prop) => (acc && acc[prop] !== undefined && acc[prop] !== null && acc['prop'] !== '') ? acc[prop] : defaultValue, obj);
}

const goToPage = async (page, searchWord = '') => {
  pageLoading.value = true;

  let url = pageData.value.path?.replace(import.meta.env.VITE_API_URL, '');

  const params = new URLSearchParams({
    page: page,
    q: searchWord
  });

  await axiosClient.get(url + '?' + params.toString()).then((response) => {
    pageData.value = response.pageData;
    scrollToTop();
  });

  pageLoading.value = false;
}

const getLoadingSkeleton = () => {
  if (props.headers?.length) {
    if (props.headers.length === 1) {
      return 'grid-cols-1';
    } else if (props.headers.length === 2) {
      return 'grid-cols-2';
    } else if (props.headers.length === 3) {
      return 'grid-cols-3';
    } else if (props.headers.length === 4) {
      return 'grid-cols-4';
    } else if (props.headers.length === 5) {
      return 'grid-cols-5';
    } else if (props.headers.length === 6) {
      return 'grid-cols-6';
    } else {
      return 'grid-cols-8';
    }
  }
}
</script>
