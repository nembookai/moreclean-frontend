<template>
  <Modal @close="$emit('close')" modalWidth="w-[700px]">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900" v-if="!product.id">Opret ny produkt</div>
      <div class="text-[19px] font-normal text-primary-900" v-else>Rediger produkt</div>
    </template>
    <template #content>
      <div class="grid grid-cols-6 gap-x-5 gap-y-3">
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 rounded text-[18px]">Om produktet</div>
        <div class="col-span-6">
          <label class="text-gray-600 text-[13px]">Navn <span class="text-red-500">*</span></label>
          <input type="text" id="name" v-model="product.name" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj navn" />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Pris <span class="text-red-500">*</span></label>
          <CurrencyInput value-scaling="precision" class="input !mt-0" name="product_price" v-model="product.price" required />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Pris type <span class="text-red-500">*</span></label>
          <select id="price_type" v-model="product.pricing_type" class="input !mt-0">
            <option value="hourly">Timepris</option>
            <option value="fixed">Fast pris</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Antal timer <span class="text-red-500">*</span></label>
          <CurrencyInput value-scaling="precision" class="input !mt-0" name="product_price" v-model="product.hours" required />
        </div>
        <div class="col-span-6">
          <label class="text-gray-600 text-[13px]">Produkt beskrivelse</label>
          <textarea ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="product.description" class="input !mt-0" placeholder="Note" />
        </div>
        <div class="col-span-full">
          <div class="flex justify-end">
            <button class="btn btn__green !px-10" :disabled="message.loading" @click="saveProduct">
              <span v-if="message.loading">Gemmer...</span>
              <span v-else>Gem produkt</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script setup>
/*******************************
 * Imports & props
 ******************************/
import { ref, onBeforeMount, inject } from 'vue';
import { axiosClient } from '@/lib/axiosClient';

const props = defineProps(['prefill']);

/*******************************
 * Refs & variables
 ******************************/
const emit = defineEmits(['close', 'updated', 'created']);
const product = ref({ ...props.prefill });
const message = inject('message');

/*******************************
 * Lifecycle hooks
 ******************************/
onBeforeMount(() => {
  if (!product.value.id) {
    product.value.pricing_type = 'hourly';
  }
});

/*******************************
 * Methods
 ******************************/
const saveProduct = async () => {
  if (!product.value.name || !product.value.pricing_type) {
    message.showError('Du skal udfylde alle felter');
    return;
  }

  message.loading = true;

  const url = product.value.id ? `/products/${product.value.id}` : '/products';

  await axiosClient.post(url, product.value).then((response) => {
    message.showComplete('Produktet oprettet');

    if (product.value.id) {
      emit('updated', response.product);
    } else {
      emit('created', response.product);
    }
  }).catch((e) => { });

  message.loading = false;
};
</script>