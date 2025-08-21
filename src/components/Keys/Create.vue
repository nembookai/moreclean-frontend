<template>
  <Modal @close="$emit('close')" modalWidth="w-[700px]">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900" v-if="!keyItem.id">Opret nøgle</div>
      <div class="text-[19px] font-normal text-primary-900" v-else>Rediger nøgle</div>
    </template>
    <template #content>
      <div class="grid grid-cols-6 gap-x-5 gap-y-3">
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 rounded text-[18px]">Om nøglen</div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Navn <span class="text-red-500">*</span></label>
          <input type="text" v-model="keyItem.name" class="input !mt-0" placeholder="Tilføj navn" />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Kunde</label>
          <DropdownWrite :values="company.customers" :chosenValue="keyItem.customer" @selectValue="(e) => keyItem.customer = e" display="name" dropdownWidth="w-[300px]" :filterable="['name']" />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Nøglering</label>
          <input type="text" v-model="keyItem.keychain" class="input !mt-0" placeholder="Tilføj nøglering" />
        </div>

        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Medarbejder</label>
          <DropdownWrite :values="company.employees" :chosenValue="keyItem.employee" @selectValue="(e) => keyItem.employee = e" display="name" dropdownWidth="w-[300px]" :filterable="['name']" />
        </div>

        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Modtagelsesdato</label>
          <VueDatePicker locale="da" text-input v-model="keyItem.obtaining_date" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd. MMM yyyy"></VueDatePicker>
        </div>

        <div class="col-span-full mt-5">
          <div class="flex justify-end">
            <button class="btn btn__green !px-10" :disabled="message.loading" @click="saveKey">
              <span v-if="message.loading">Gemmer...</span>
              <span v-else>Gem nøgle</span>
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
import { Company } from '@/store/company';

const props = defineProps(['prefill']);

/*******************************
 * Refs & variables
 ******************************/
const emit = defineEmits(['close', 'updated', 'created']);
const keyItem = ref({ ...props.prefill });
const message = inject('message');
const company = Company();

/*******************************
 * Lifecycle hooks
 ******************************/
onBeforeMount(() => {
  if (!keyItem.value.id) {
    keyItem.value.obtaining_date = null;
  }
});

/*******************************
 * Methods
 ******************************/
const saveKey = async () => {
  if (!keyItem.value.name) {
    message.showError('Du skal udfylde navn');
    return;
  }

  message.loading = true;

  const payload = {
    name: keyItem.value.name,
    keychain: keyItem.value.keychain,
    customer_id: keyItem.value.customer?.id || null,
    employee_id: keyItem.value.employee?.id || null,
    obtaining_date: keyItem.value.obtaining_date,
  };

  const url = keyItem.value.id ? `/keys/${keyItem.value.id}` : '/keys';

  await axiosClient.post(url, payload).then((response) => {
    message.showComplete('Nøglen er gemt');
    if (keyItem.value.id) {
      emit('updated', response.key);
    } else {
      emit('created', response.key);
    }
  }).catch((e) => { });

  message.loading = false;
};
</script>

