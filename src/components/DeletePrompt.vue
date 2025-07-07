<template>
  <div class="bg-gray-50 w-[500px] mt-[100px] text-sm rounded-md shadow-md relative">
    <div class="px-4 py-4 flex items-center flex-col">
      <PhXCircle class="text-red-600" weight="thin" :size="100" />

      <div class="text-gray-600 mt-2 text-[30px] font-thin">Er du sikker?</div>
      <div class="text-gray-700 mt-5 font-medium">{{ msg }}</div>
      <div class="flex gap-3 mt-6 items-center">
        <button @click="$emit('close')" class="btn btn__lightgray !px-[50px]">Fortryd</button>
        <button @click="$emit('delete')" class="btn btn__red !px-[60px]">{{ deleteText }}</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { PhXCircle } from '@phosphor-icons/vue';
const props = defineProps({ msg: { default: 'Er du sikker på du vil slette?' }, deleteText: { default: 'Slet' } })
const emit = defineEmits(['delete', 'close']);
</script>