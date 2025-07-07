<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="{ 'bg-gray-200 !items-start !py-3 !cursor-auto active:!bg-gray-200': isOpen }" @click="openLocation">
    <PhMapPin :size="27" weight="regular" class="text-gray-600" />
    <div class="text-gray-700 text-[13px] leading-[15px]" v-show="!isOpen">
      <div>{{ location || 'Ingen lokation valgt' }}</div>
      <div class="text-gray-500 text-[12px] font-light" v-if="!location">Vælg lokation for opgaven</div>
      <div class="text-gray-500 text-[12px] font-light" v-if="location">Valgte lokation</div>
    </div>
    <div class="text-gray-700 text-[13px] leading-[15px] relative" v-show="isOpen">
      <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
      <div class="text-gray-700 text-[13px] font-medium leading-[15px]">Tilføj lokation</div>
      <div class="relative">
        <input type="text" ref="locationInput" id="adresse" autocomplete="new-password" v-model="location" @keyup.enter="isOpen = false" class="input !text-[13.5px] !h-[37.5px] !w-[500px] !mt-2" placeholder="Tilføj lokation" />
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref, nextTick, onMounted } from 'vue';
import { PhMapPin, PhCaretUp } from '@phosphor-icons/vue';

/******************************
 * Refs & const
******************************/
const location = defineModel('location');
const isOpen = ref(false);
const locationInput = ref(null);

/******************************
 * Lifecycle hooks
******************************/
onMounted(async () => {
  window.dawaAutocomplete.dawaAutocomplete(document.getElementById("adresse"), {
    select: function(selected) {
      location.value = selected.tekst;
    }
  });
});

/******************************
 * Methods
******************************/
const openLocation = async () => {
  isOpen.value = true;

  await nextTick();

  if (locationInput.value) {
    locationInput.value.focus();
  }
}
</script>
<style lang="scss" scoped>
:deep(.autocomplete-container) {
  /* relative position for at de absolut positionerede forslag får korrekt placering.*/
  position: relative;
  width: 100%;
  max-width: 30em;
}
:deep(.autocomplete-container input) {
  /* Både input og forslag får samme bredde som omkringliggende DIV */
  width: 100%;
  box-sizing: border-box;
}
:deep(.dawa-autocomplete-suggestions) {
  margin: 0.3em 0 0 0;
  padding: 0;
  text-align: left;
  border-radius: 0.3125em;
  background: white;
  box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
  position: absolute;
  left: 0;
  right: 0;
  z-index: 9999;
  overflow-y: auto;
  box-sizing: border-box;
  width: 350px;
  max-height: 200px;
}
:deep(.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion) {
  margin: 0;
  list-style: none;
  cursor: pointer;
  padding: 10px 0.6em;
  color: #333;
  border: 0.0625em solid #ddd;
  border-bottom-width: 0;
}
:deep(.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:first-child) {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}
:deep(.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:last-child) {
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
  border-bottom-width: 0.0625em;
}

:deep(.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion.dawa-selected) {
  @apply bg-primary-100 text-primary-700;
}

:deep(.dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:hover) {
  @apply bg-primary-500 text-white transition-all duration-150 ease-in;
}
</style>