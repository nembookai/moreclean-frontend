<template>
  <div>
    <div class="fixed z-[1001] w-full flex justify-start pl-5 items-center bottom-[20px] hover-transition pointer-events-none">
      <div class="bg-white py-4 px-5 min-w-[400px] rounded-2x border-t-[4px] border-red-400 max-w-[500px] flex items-start relative shadow-md flash-vibrate pointer-events-auto" v-if="error">
        <div class="text-red-500 pr-2">
          <img src="img/error.png" alt="error" class="w-8">
        </div>
        <div class="pr-20">
          <div class="text-[17px] text-gray-800 font-semibold">Vi beklager!</div>
          <div class="text-[15px] text-gray-700 leading-[18px]">{{ error }}</div>
        </div>
        <div class="bg-red-400 text-white rounded-full text-[14px] p-[4px] flex items-center justify-center absolute right-[10px] top-[10px] cursor-pointer hover-transition hover:bg-red-600" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-[15px]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <div class="bg-white py-4 px-5 min-w-[400px] rounded-2xl border-t-[4px] border-green-600 max-w-[500px] flex items-start relative shadow-md flash-vibrate pointer-events-auto" v-if="complete">
        <div class="text-red-500 pr-2">
          <img src="img/success.png" alt="error" class="w-8">
        </div>
        <div class="pr-20">
          <div class="text-[17px] text-gray-800 font-semibold">Gennemført!</div>
          <div class="text-[15px] text-gray-700 leading-[18px]">{{ complete }}</div>
        </div>
        <div class="bg-green-600 text-white rounded-full text-[14px] p-[4px] flex items-center justify-center absolute right-[10px] top-[10px] cursor-pointer hover-transition hover:bg-green-700" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-[15px]">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { onMounted } from 'vue';
import { Message } from '@/store/message';

const props = defineProps({
  complete: null,
  error: null,
});

/******************************
 * Refs & consts
******************************/
const message = Message();
const emit = defineEmits(['close']);

/******************************
 * Lifecycle hooks
******************************/
onMounted(() => {
  message.loading = false;
})
</script>
<style>
  @keyframes vibrate_all {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(-10%); }
    100% { transform: translateX(0); }
  }

  .flash-vibrate {
    animation: vibrate_all 0.4s ease-out;
  }
</style>