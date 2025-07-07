<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="[{ 'bg-gray-200 !py-3 !cursor-auto active:!bg-gray-200': isOpen }, { '!items-start': (products?.length >= 1 || isOpen) }]" @click="openProduct">
    <PhPackage :size="27" weight="regular" class="text-gray-600" />
    <div class="flex-1">
      <div class="text-gray-700 text-[13px] leading-[15px]" v-if="!isOpen">
        <div v-if="!products?.length">
          <div>Ingen produkter valgt</div>
          <div class="text-gray-500 text-[12px] font-light">Vælg produkter for opgaven</div>
        </div>
        <div v-if="products?.length">
          <div class="text-gray-500 font-light text-[13px]" v-if="products.length > 1">{{ products.length }} produkter</div>
          <div class="flex flex-col gap-1.5" :class="{ 'mt-1': products.length > 1 }">
            <div class="text-gray-700 text-[14px] leading-[15px]" v-for="(p, index) in products" :key="p.id">{{ p.name }}</div>
          </div>
          <div class="text-gray-500 text-[12px] font-light" v-if="products.length === 1">Produkt valgt</div>
        </div>
      </div>
      <div class="text-gray-700 text-[13px] leading-[15px] w-full relative" v-if="isOpen">
        <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
        <div class="text-gray-700 text-[13px] font-medium leading-[15px]">Tilføj produkter</div>
        <DropdownWrite fillPlaceholder="Vælg produkt" :multiple="true" :values="allProducts" :chosenValue="products" @selectValue="(e) => products = e" display="name" dropdownWidth="w-[500px]" :filterable="['name']" />
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref } from 'vue';
import { PhPackage, PhCaretUp } from '@phosphor-icons/vue';
const props = defineProps(['allProducts']);

/******************************
 * Refs & const
******************************/
const products = defineModel('products');
const isOpen = ref(false);

/******************************
 * Methods
******************************/
const openProduct = async () => {
  if (!isOpen.value) {
    isOpen.value = true;
  }
}
</script>