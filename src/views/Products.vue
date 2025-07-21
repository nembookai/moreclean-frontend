<template>
  <LayoutComponents-Title title="Produkter" />

  <ModalShow :condition="openCreateProduct">
    <Product-Create @close="openCreateProduct = false" :prefill="activeProduct" @updated="updateProduct" @created="createProduct" />
  </ModalShow>

  <ModalShow :condition="deleteSure">
    <DeletePrompt :msg="`Er du sikker på du vil slette ${activeProduct.name}?`" @delete="deleteProduct" @close="deleteSure = null" />
  </ModalShow>

  <div class="mt-5 box" v-if="!loading.loading">
    <TableComponent emptyMessage="Ingen produkter fundet" :lastRight="true" :headers="headers" :data="productData">
      <template #extra>
        <div class="flex w-full justify-end items-center gap-x-2">
          <button class="btn btn__green" @click="openCreateProduct = true"><PhPlus :size="16" weight="bold" /> Opret ny produkt</button>
        </div>
      </template>
      <template #body="{ item: product }">
        <td>{{ product.name }}</td>
        <td>{{ formatPrice(product.hours) || '--' }} <span v-if="product.hours">timer</span></td>
        <td>{{ formatPrice(product.price) }} {{ product.pricing_type === 'hourly' ? 'kr. pr. time' : 'kr. pr. opgave' }}</td>
        <td>
          <div class="flex justify-end items-center relative">
            <div @click="setActiveProduct(product)" class="flex items-center gap-x-0.5 cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" :class="activeProduct?.id === product.id ? 'text-primary-700' : ''">
              Mere <PhCaretDown size="16" class="hover-transition" :class="activeProduct?.id === product.id ? 'rotate-180' : ''" />
            </div>
            <transition name="dropdown">
              <LayoutComponents-HoverDropdown :freeSlot="true" class="absolute top-[30px] z-[99] right-0" @close="activeProduct = null" v-click-outside="() => activeProduct = null" v-if="activeProduct?.id === product.id" extraclass="w-[250px] max-h-[300px]">
              <template #free>
                <div class="hover_dropdown hover_dropdown__small" @click="openCreateProduct = true;">
                  <div><PhPen :size="16" weight="fill" /></div>
                  Rediger produkt
                </div>
                <div class="hover_dropdown hover_dropdown__small hover_dropdown__red" @click="deleteSure = product.id">
                  <div><PhBackspace :size="16" weight="fill" /></div>
                  Slet produkt
                </div>
              </template>
              </LayoutComponents-HoverDropdown>
            </transition>
          </div>
        </td>
      </template>
    </TableComponent>
  </div>
</template>
<script setup>
/*******************************
* Imports & props
******************************/
import { ref, onBeforeMount, inject } from 'vue';
import { axiosClient } from '@/lib/axiosClient'
import { PhCaretDown, PhPen, PhBackspace, PhPlus } from '@phosphor-icons/vue';
import { formatPrice } from '@/composables/Price';

/*******************************
* Refs & variables
******************************/
const message = inject('message');
const loading = inject('loading');
const productData = ref([]);
const headers = [
  {
    name: 'Navn',
    sortable: 'name'
  },
  {
    name: 'Antal timer',
    sortable: 'hours'
  },
  {
    name: 'Pris',
    sortable: 'price'
  },
  {
    name: ''
  }
];
const activeProduct = ref(null);
const openCreateProduct = ref(false);
const deleteSure = ref(null);

/*******************************
* Lifecycle hooks
******************************/
onBeforeMount(async () => {
  loading.load();

  await axiosClient.get('/products').then((response) => {
    productData.value = response.pageData;
  }).catch((e) => { });

  loading.reset();
});

/*******************************
* Methods
******************************/
const setActiveProduct = (product) => {
  if (activeProduct.value === product) {
    activeProduct.value = null;
  } else {
    activeProduct.value = product;
  }
};

const updateProduct = (product) => {
  const index = productData.value?.data?.findIndex(c => c.id === product.id);
  productData.value.data[index] = product;
  openCreateProduct.value = false;
};

const createProduct = (product) => {
  productData.value.data.unshift(product);
  openCreateProduct.value = false;
};

const deleteProduct = async () => {
  await axiosClient.delete(`/products/${deleteSure.value}`).then((response) => {
    const index = productData.value.data.findIndex(p => p.id === deleteSure.value);
    if (index !== -1) {
      productData.value.data.splice(index, 1);
    }
    deleteSure.value = null;
    message.showComplete('Produktet er blevet slettet');
  }).catch((e) => { });
};
</script>