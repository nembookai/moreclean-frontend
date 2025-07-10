<template>
  <ModalShow :condition="openCreateCustomer">
    <Customer-Create @close="openCreateCustomer = false" :lastCustomerNumber="lastCustomerNumber" @created="createCustomer" />
  </ModalShow>

  <div class="options-class !items-start" v-click-outside="() => isOpen = false" :class="[{ 'bg-gray-200 !py-3 !cursor-auto active:!bg-gray-200': isOpen }, { '!cursor-not-allowed active:!bg-gray-200': loading }]" @click="openCustomer">
    <PhUser :size="27" weight="regular" class="text-gray-600" />
    <div class="text-gray-700 text-[13px] leading-[15px]" v-show="!isOpen">
      <div v-if="!customer && !loading">Ingen kunde valgt</div>
      <div v-if="customer && !loading" class="text-gray-700 text-[14px] mb-[2px]">({{ customer.number }}) {{ customer?.name }}</div>
      <div v-if="!customer && loading" class="flex items-center gap-x-1 select-none"><PhSpinner :size="16" weight="bold" class="animate-spin" /> Indlæser kunder...</div>
      <div class="text-gray-500 text-[12px] font-light select-none" v-if="!customer">Vælg kunde for opgaven</div>
      <div class="text-gray-500 text-[12px] font-light" v-else>
        <span v-if="customer.type === 'company' && customer.cvr">Cvr. {{ customer.cvr }}</span>
        <span v-if="customer.type === 'person' && customer.cvr">Cpr. {{ customer.cvr }}</span>
      </div>
      <div class="text-[12px] text-gray-500 font-light">Serviceaftale: <span class="font-normal" v-if="serviceAgreement">{{ serviceAgreement.name }}</span><span class="font-normal" v-else>Ingen</span></div>
    </div>
    <div class="text-gray-700 text-[13px] leading-[15px] w-full relative" v-show="isOpen">
      <PhCaretUp :size="16" weight="bold" class="absolute right-[10px] top-[-3px] cursor-pointer hover-transition hover:text-primary-600 active:text-primary-800 select-none" @click.stop="isOpen = false" />
      <div class="text-gray-700 text-[13px] font-medium leading-[15px]">Tilføj kunde</div>
      <DropdownWrite fillPlaceholder="Vælg kunde" :values="allCustomers" :chosenValue="customer" @selectValue="selectCustomer" display="name" dropdownWidth="w-[500px]" :filterable="['number', 'name']">
        <template #extra>
          <div class="w-full bg-gray-100 border-t border-gray-200 select-none rounded-b-[2px] py-3 cursor-pointer hover-transition hover:bg-gray-200 active:bg-gray-300" @click="openCreateCustomer = true">
            <div class="text-gray-700 text-[13px] font-medium flex justify-center items-center gap-x-1 leading-[15px]">
              <PhPlus :size="16" weight="bold" class="text-green-500 hover-transition hover:text-green-600 active:text-green-700" />
              Opret ny kunde
            </div>
          </div>
        </template>
      </DropdownWrite>
      <div class="flex mt-2 items-center gap-x-1">
        <PhX :size="16" weight="regular" class="text-red-600 cursor-pointer hover-transition hover:text-red-700 active:text-red-800 select-none" v-if="serviceAgreement" @click="removeServiceAgreement" />
        <div class="font-medium">Serviceaftale:</div>
        <div v-if="serviceAgreement">{{ serviceAgreement.name }}</div>
        <div v-else>Ingen</div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports
******************************/
import { ref } from 'vue';
import { PhUser, PhCaretUp, PhSpinner, PhX, PhPlus } from '@phosphor-icons/vue';
const props = defineProps(['prefillServiceAgreement', 'allCustomers', 'loading', 'lastCustomerNumber']);
const emit = defineEmits(['updateFromCustomer', 'removeServiceAgreement']);

/******************************
 * Refs & const
******************************/
const customer = defineModel('customer');
const isOpen = ref(false);
const serviceAgreement = ref(props.prefillServiceAgreement || null);
const openCreateCustomer = ref(false);

/******************************
 * Methods
******************************/
const selectCustomer = (c) => {
  customer.value = c;
  serviceAgreement.value = c.service_agreement;
  emit('updateFromCustomer', c);

  if (!serviceAgreement.value) {
    isOpen.value = false;
  }
}

const openCustomer = async () => {
  if (!isOpen.value && !props.loading) {
    isOpen.value = true;
  }
}

const removeServiceAgreement = () => {
  serviceAgreement.value = null;
  emit('removeServiceAgreement');
}

const createCustomer = (customer) => {
  openCreateCustomer.value = false;
  selectCustomer(customer);
  props.allCustomers.push(customer);
}
</script>