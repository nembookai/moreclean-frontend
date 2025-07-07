<template>
  <div class="relative">
    <img :class="imageSize" src="img/no-results.png" class="opacity-90 mb-3" />
    <div :class="textClass" v-if="message">{{ message }}</div>
  </div>
</template>
<script setup>
const props = defineProps({
  message: {
    type: String,
    default: 'Ingen resultater fundet',
  },
  imageSize: {
    type: String,
    default: 'w-[150px]',
  },
  textClass: {
    type: String,
    default: 'text-primary-800 font-semibold',
  },
});
</script>