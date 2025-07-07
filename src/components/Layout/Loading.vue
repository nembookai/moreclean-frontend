<template>
  <div class="blackBackgroundFixed !justify-center !items-center">
    <div class="bg-white rounded-md p-4 flex items-center justify-center flex-col w-[500px]" v-if="!loading.errorMsg">
      <div class="loader mt-2"></div>
      <div class="text-[25px] text-gray-600 mt-4">{{ loading.title }}</div>
      <div class="text-[15px] font-light text-gray-600">{{ loading.message }}</div>
    </div>
  </div>
</template>
<script setup>
import { Loading } from '@/store/loading';
const loading = Loading();
</script>