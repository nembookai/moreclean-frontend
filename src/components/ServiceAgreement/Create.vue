<template>
  <Modal @close="$emit('close')" modalWidth="w-[700px]">
    <template #header>
      <div>Serviceaftale for {{ customer.name }}</div>
    </template>
    <template #content>
      <div>
        <div class="grid grid-cols-6 gap-x-5 gap-y-3">
          <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 rounded text-[18px]">Om serviceaftalen</div>
          <div class="col-span-full">
            <label class="text-gray-600 text-[13px]">Kunde <span class="text-red-500">*</span></label>
            <div class="bg-gray-100 w-full h-[35px] flex items-center justify-start pl-2.5 text-[13.5px] cursor-not-allowed rounded-[7px] border border-gray-300">{{ customer.name }}</div>
          </div>
          <div class="col-span-4">
            <label class="text-gray-600 text-[13px]">Navn på aftale <span class="text-red-500">*</span></label>
            <input type="text" id="name" v-model="serviceAgreement.name" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj navn" />
          </div>
          <div class="col-span-2">
            <label class="text-gray-600 text-[13px]">Normtid pr uge <span>(Antal timer)</span></label>
            <input type="input" id="norm_hours" v-model="serviceAgreement.weekly_hours" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj normtid" />
          </div>
          <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 mt-3 rounded text-[18px]">Faktura oplysninger</div>
          <div class="col-span-4">
            <label class="text-gray-600 text-[13px]">Faktura reference</label>
            <input type="text" id="name" v-model="serviceAgreement.invoice_reference" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj reference" />
          </div>
          <div class="col-span-2">
            <label class="text-gray-600 text-[13px]">Faktura overskrift</label>
            <input type="text" id="name" v-model="serviceAgreement.invoice_title" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj overskrift" />
          </div>
          <div class="col-span-full">
            <label class="text-gray-600 text-[13px]">Faktura beskrivelse</label>
            <textarea id="name" v-model="serviceAgreement.invoice_description" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj beskrivelse" />
          </div>
          <div class="col-span-full bg-primary-600 text-white w-fit px-2 mt-3 rounded text-[18px]">Faktura linjer</div>
          <div class="col-span-full grid grid-cols-12 gap-x-2 !-mb-3">
            <div class="col-span-2 !text-[11px]">Produkt</div>
            <div class="col-span-4 !text-[11px]">Navn</div>
            <div class="col-span-2 !text-[11px]">Pris (pr måned)</div>
            <div class="col-span-2 !text-[11px]">Rabat (%)</div>
            <div class="col-span-2 !text-[11px] text-right">Total</div>
          </div>
          <div class="col-span-full grid grid-cols-12 gap-x-2" v-for="(line, index) in serviceAgreement.invoice_lines" :key="index">
            <div class="col-span-2 relative">
              <PhTrash :size="16" weight="regular" class="text-red-500 absolute left-[-17.5px] top-[10px] cursor-pointer hover-transition hover:text-red-600 active:text-red-700 select-none" @click="removeLine(index)" />
              <DropdownWrite fillPlaceholder="Vælg produkt" :allowNull="true" overwriteInput="!text-[12px] !h-[35px]" class="!mt-0" :showArrowDropdown="false" :values="products" :chosenValue="line.product" @selectValue="(p) => line.product = p" display="name" dropdownWidth="w-[300px]" :filterable="['name']" />
            </div>
            <div class="col-span-4">
              <input type="text" id="name" v-model="line.name" class="input !mt-0 !text-[12px] !h-[35px]" autocomplete="new-password" placeholder="Tilføj navn" />
            </div>
            <div class="col-span-2">
              <CurrencyInput value-scaling="precision" class="input !mt-0 !h-[35px] !text-[12px]" name="product_price" v-model="line.price" required />
            </div>
            <div class="col-span-2">
              <input type="number" id="name" v-model="line.discount" class="input !mt-0 !h-[35px] !text-[12px]" autocomplete="new-password" placeholder="Tilføj rabat" />
            </div>
            <div class="col-span-2 gap-x-1 flex justify-end items-center">
              <div class="text-[13px] text-right">{{ formatPrice(line.price * (1 - line.discount / 100)) }} kr.</div>
            </div>
          </div>
          <div class="col-span-full flex justify-start">
            <div class="text-[13px] text-primary-600 underline cursor-pointer hover-transition hover:text-primary-700 active:text-primary-800 select-none" @click="addLine">Tilføj ny linje</div>
          </div>
        </div>
        <div class="flex justify-end items-center gap-x-5 mt-10">
          <div v-if="serviceAgreement.id" class="text-[13px] text-red-500 underline cursor-pointer hover-transition hover:text-red-600 active:text-red-700 select-none" @click="deleteServiceAgreement">Slet serviceaftale</div>
          <button class="btn btn__green" @click="save" :disabled="message.loading">
            <span v-if="message.loading">Gemmer...</span>
            <span v-else>Gem serviceaftale</span>
          </button>
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
import { PhTrash } from "@phosphor-icons/vue";
import { formatPrice } from '@/composables/Price';
import { axiosClient } from '@/lib/axiosClient';
const props = defineProps(['customer', 'products']);

/*******************************
 * Refs & variables
 ******************************/
const serviceAgreement = ref(props.customer.service_agreement || {
  invoice_lines: [],
})
const defaultLine = {
  product: null,
  name: '',
  price: 0,
  discount: 0,
}
const message = inject('message');
const emit = defineEmits(['close', 'saved', 'deleted']);

/*******************************
 * Lifecycle
 ******************************/
onBeforeMount(() => {
  if (!serviceAgreement.value.invoice_lines.length) {
    addLine();
  }
})

/*******************************
 * Methods
 ******************************/
function addLine() {
  serviceAgreement.value.invoice_lines.push({...defaultLine})
}

function removeLine(index) {
  serviceAgreement.value.invoice_lines.splice(index, 1);

  if (!serviceAgreement.value.invoice_lines.length) {
    serviceAgreement.value.invoice_lines.push({...defaultLine})
  }
}

async function save() {
  if (!serviceAgreement.value.name) {
    message.showError('Du skal angive et navn på serviceaftalen');
    return;
  }

  if (!serviceAgreement.value.invoice_lines.every(line => line.product && line.name && line.price)) {
    message.showError('Du skal udfylde alle felter på alle linjer');
    return;
  }

  message.loading = true;

  const url = serviceAgreement.value.id ? `/service-agreements/${serviceAgreement.value.id}` : '/service-agreements';

  await axiosClient.post(url, {...serviceAgreement.value, customer_id: props.customer.id}).then((response) => {
    message.showComplete('Serviceaftalen blev gemt');
    emit('saved', response.service_agreement);
  }).catch((e) => { });

  message.loading = false;
}

async function deleteServiceAgreement() {
  await axiosClient.delete(`/service-agreements/${serviceAgreement.value.id}`).then((response) => {
    message.showComplete('Serviceaftalen blev slettet');
    emit('deleted');
  }).catch((e) => { });
}
</script>