<template>
  <div class="flex justify-center items-center mt-5 text-gray-700">
    <nav class="justify-center items-center -mt-px inline-flex px-10 pb-3">
      <div class="flex mr-4">
        <div @click="previousPage" :class="{ '!cursor-not-allowed': currentPage === 1, 'active:text-primary-900 hover:border-primary-500 hover:text-primary-700': currentPage !== 1 }" class="inline-flex select-none cursor-pointer items-center border-t-2 border-transparent pr-1 pt-2 text-sm font-medium">
          <PhArrowLeft class="mr-3 size-5" aria-hidden="true" />
          Forrige
        </div>
      </div>
      <div class="flex items-center gap-x-2">
        <div v-for="page in getActivePages" :key="page" @click="toPage(page)" :class="{ '!border-primary-500 !text-primary-700 !font-bold': currentPage === page }" class="inline-flex items-center border-t-2 border-transparent px-4 pt-2 text-sm font-medium active:text-primary-900 cursor-pointer select-none hover:border-primary-500 hover:text-primary-700">{{ page }}</div>
      </div>
      <div class="flex ml-4">
        <div @click="nextPage" :class="{ '!cursor-not-allowed': currentPage === totalPages, 'active:text-primary-900 hover:border-primary-500 hover:text-primary-700': currentPage !== totalPages }" class="inline-flex select-none cursor-pointer items-center border-t-2 border-transparent pl-1 pt-2 text-sm font-medium">
          Næste
          <PhArrowRight class="ml-3 size-5" aria-hidden="true" />
        </div>
      </div>
    </nav>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, computed } from 'vue';
import { PhArrowLeft, PhArrowRight } from '@phosphor-icons/vue';
const props = defineProps(['itemPerPage', 'totalPages', 'currentPage']);

/*******************************
 * Refs & consts
******************************/
const currentPage = ref(props.currentPage);
const emit = defineEmits(['currentPage']);

/*******************************
 * Methods and computed
******************************/
const getActivePages = computed(() => {
  const activePages = [];
  const total = props.totalPages;
  const current = props.currentPage;

  let start = Math.max(1, current - 1);
  let end = Math.min(total, current + 2);

  while (end - start + 1 < 4 && start > 1) {
    start--;
  }

  while (end - start + 1 < 4 && end < total) {
    end++;
  }

  for (let i = start; i <= end; i++) {
    activePages.push(i);
  }

  return activePages;
});

const toPage = (page) => {
  currentPage.value = page;
  emit('currentPage', currentPage.value);
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    emit('currentPage', currentPage.value);
  }
}

const nextPage = () => {
  if (currentPage.value < props.totalPages) {
    currentPage.value++;
    emit('currentPage', currentPage.value);
  }
}

function resetCurrentPage() {
  currentPage.value = 1;
  emit('currentPage', currentPage.value);
}

/*******************************
 * Define expose
 ******************************/
defineExpose({
  resetCurrentPage
});
</script>