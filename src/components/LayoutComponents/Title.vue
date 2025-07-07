<template>
  <div class="text-[25px] flex items-center gap-x-2 text-primary-900 my-4 pb-1" :class="{ 'border-b border-slate-200': !noBorder }">
    <div>{{ props.title }}</div>
  </div>
</template>
<script setup>
const props = defineProps(['title', 'noBorder']);
</script>