<template>
  <div class="bg-[#f8f8f8] rounded-[8px] my-[48px] drop-shadow z-[210] relative" ref="modal" :class="modalWidth">
    <div class="text-primary-900 py-4 px-5 border-b flex items-center justify-between gap-x-2">
      <div class="w-10/12 text-[22.5px] font-normal">
        <slot name="header"></slot>
      </div>
      <PhX :size="30" weight="bold" class="p-1 w-[30px] text-primary-800 hover:text-primary-950 cursor-pointer hover-transition" @click="$emit('close')" />
    </div>
    <div :class="[{ 'px-6 pb-6 pt-3': withPadding }]">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { PhX } from '@phosphor-icons/vue';
const props = defineProps({
  withPadding: { default: true },
  modalWidth: { default: 'w-[600px]' },
  hideBodyOverflow: { default: true }
})

/******************************
 * Refs & consts
******************************/
const emit = defineEmits(['close']);
const modal = ref();

/******************************
 * Methods & computed
******************************/
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

/******************************
 * Lifecycle hooks
******************************/
onMounted(() => {
  document.addEventListener('keydown', handleEscape);

  if (props.hideBodyOverflow) {
    document.body.style.overflowY = 'hidden';
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);

  if (props.hideBodyOverflow) {
    document.body.style.overflowY = '';
  }
});
</script>