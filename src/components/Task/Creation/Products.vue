<template>
  <div class="options-class" v-click-outside="() => isOpen = false" :class="[{ 'bg-gray-200 !py-3 !cursor-auto active:!bg-gray-200': isOpen }, { '!items-start': (products?.length >= 1 || isOpen) }, { '!cursor-not-allowed active:!bg-gray-200': loading }]" @click="openProduct">
    <PhPackage :size="27" weight="regular" class="text-gray-600" />
    <div class="flex-1">
      <div class="text-gray-700 text-[13px] leading-[15px]" v-if="!isOpen">
        <div v-if="!products?.length">
          <div v-if="!loading">Ingen produkter valgt</div>
          <div v-if="loading" class="flex items-center gap-x-1 select-none"><PhSpinner :size="16" weight="bold" class="animate-spin" /> Indlæser produkter...</div>
          <div class="text-gray-500 text-[12px] font-light select-none">Vælg produkter for opgaven</div>
        </div>
        <div v-if="products?.length">
          <div class="text-gray-500 font-light text-[13px]" v-if="products.length > 1">{{ products.length }} produkter</div>
          <div class="flex flex-col gap-1.5" :class="{ 'mt-1': products.length > 1 }">
            <div class="text-gray-700 text-[14px] leading-[15px]" v-for="(p, index) in products" :key="p.id">{{ p.name }} <span class="text-gray-500 text-[12px] font-light mt-[1.5px]">({{ formatPrice(p.hours) }} timer)</span></div>
          </div>
          <div class="text-gray-500 text-[12px] font-light" v-if="products.length === 1">Produkt valgt</div>
        </div>
      </div>
      <div class="text-gray-700 text-[13px] leading-[15px] w-full relative" :class="{ 'pt-3': manually_changed }" v-if="isOpen">
        <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
        <div v-if="manually_changed" class="p-1.5 mb-2 bg-yellow-50 rounded-[4px] flex items-center gap-x-1">
          <PhWarning :size="16" weight="regular" class="text-yellow-500" />
          <div class="text-yellow-500 text-[13px] font-light">Du har manuelt ændret prisen under økonomi. Dette vil overskrive priserne.</div>
        </div>
        <div class="text-gray-700 text-[13px] font-medium leading-[15px]">Tilføj produkter</div>
        <DropdownWrite fillPlaceholder="Vælg produkt" :values="productsDropdown" :chosenValue="products" @selectValue="updateProducts" display="name" dropdownWidth="w-[500px]" :filterable="['name']" />
        <div class="mt-2" v-if="products.length">
          <div class="grid grid-cols-12 items-center">
            <div class="text-gray-500 text-[12px] font-light col-span-9">Produkter valgt</div>
            <div class="text-gray-500 text-[12px] font-light col-span-2">Antal timer</div>
            <div class="text-gray-500 text-[12px] font-light col-span-1"></div>
          </div>
          <div class="flex flex-col gap-1.5 mt-1">
            <div class="text-gray-700 text-[14px] leading-[15px] grid grid-cols-12 items-center" v-for="(p, index) in products" :key="p.id">
              <div class="col-span-9 pr-5">
                <div class="flex items-center gap-x-1 input !h-[32.5px] input__disabled !mt-0">{{ p.name }}</div>
              </div>
              <CurrencyInput value-scaling="precision" class="input !mt-0 col-span-2 !h-[32.5px]" name="product_price" v-model="p.hours" />
              <div class="col-span-1 flex items-center justify-end gap-x-1 pr-3" v-if="!p.service_agreement_task">
                <PhX :size="16" weight="regular" class="text-red-500 cursor-pointer hover-transition hover:text-red-700 active:text-red-900" @click.stop="removeProduct(p)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref, computed, watch } from 'vue';
import { PhPackage, PhCaretUp, PhSpinner, PhX, PhWarning } from '@phosphor-icons/vue';
import { formatPrice } from '@/composables/Price';
const props = defineProps(['allProducts', 'loading', 'manually_changed']);

/******************************
 * Refs & const
******************************/
const products = defineModel('products');
const emit = defineEmits(['updateFromProducts']);
const isOpen = ref(false);

/******************************
 * Methods
******************************/
const openProduct = async () => {
  if (!isOpen.value && !props.loading) {
    isOpen.value = true;
  }
}

const updateProducts = (p) => {
  products.value.push(p);
}

const removeProduct = (p) => {
  const index = products.value.findIndex(product => product.id === p.id);
  if (index > -1) {
    products.value.splice(index, 1);
  }
}

const productsDropdown = computed(() => {
  return props.allProducts.filter(product => !products.value.some(p => p.id === product.id));
});

watch(products, (newVal) => {
  emit('updateFromProducts', newVal);
}, { deep: true });
</script>