<template>
  <Modal @close="$emit('close')" modalWidth="w-[650px]">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900" v-if="!employee.id">Opret medarbejder</div>
      <div class="text-[19px] font-normal text-primary-900" v-else>Rediger medarbejder</div>
    </template>
    <template #content>
      <div class="grid grid-cols-6 gap-x-5 gap-y-3">
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 rounded text-[18px]">Om medarbejderen</div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Type <span class="text-red-500">*</span></label>
          <select id="type" v-model="employee.type" class="input !mt-0">
            <option value="subcontractor">Underleverandør</option>
            <option value="employee">Medarbejder</option>
          </select>
        </div>
        <div class="col-span-4">
          <label class="text-gray-600 text-[13px]">Navn <span class="text-red-500">*</span></label>
          <input type="text" id="name" v-model="employee.name" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj navn" />
        </div>
        <div class="col-span-6">
          <label class="text-gray-600 text-[13px]"><span v-if="employee.type === 'subcontractor'">CVR</span><span v-else>CPR</span> <span class="text-red-500">*</span></label>
          <input type="text" id="number" v-model="employee.cvr" class="input !mt-0" autocomplete="new-password" :placeholder="employee.type === 'subcontractor' ? 'Tilføj CVR' : 'Tilføj CPR'" />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Email</label>
          <input type="email" id="email" v-model="employee.email" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj email" />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Telefon nummer</label>
          <input type="text" id="phone" v-model="employee.phone" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj telefon nummer" />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Ansat siden</label>
          <VueDatePicker locale="da" text-input v-model="employee.hired_at" :enable-time-picker="false" model-type="yyyy-MM-dd" :close-on-auto-apply="true" :auto-apply="true" format="dd. MMM yyyy"></VueDatePicker>
        </div>
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 mt-4 rounded text-[18px]">Medarbejderens adresse</div>
        <div class="col-span-5">
          <label class="text-gray-600 text-[13px]">Adresse</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="employee.address" class="input !mt-0" placeholder="Medarbejderens adresse" />
        </div>
        <div class="col-span-1">
          <label class="text-gray-600 text-[13px]">Post nr.</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="employee.zip" class="input !mt-0" placeholder="Post nr." />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">By</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="employee.city" class="input !mt-0" placeholder="By" />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Land</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" disabled v-model="employee.country" class="input !mt-0 input__disabled" placeholder="Land" />
        </div>
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 mt-4 rounded text-[18px]">Medarbejderens løn</div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Løn <span class="text-gray-500 text-[12px]" v-if="employee.payout_type === 'hourly'">kr. i timen</span><span class="text-gray-500 text-[12px]" v-else>kr. fast pr. måned</span></label>
          <CurrencyInput value-scaling="precision" class="input !mt-0" name="product_price" v-model="employee.payout_amount" required />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Løn type</label>
          <select id="payout_type" v-model="employee.payout_type" class="input !mt-0">
            <option value="hourly">Timelønnet</option>
            <option value="fixed">Månedsløn</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Reg. nr.</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="employee.registration_number" class="input !mt-0" placeholder="Reg. nr." />
        </div>
        <div class="col-span-4">
          <label class="text-gray-600 text-[13px]">Kontonr.</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="employee.account_number" class="input !mt-0" placeholder="Kontonr." />
        </div>
        <div class="col-span-full mt-5">
          <div class="flex justify-end">
            <button class="btn btn__green !px-10" :disabled="message.loading" @click="saveEmployee">
              <span v-if="message.loading">Gemmer...</span>
              <span v-else>Gem medarbejder</span>
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
const employee = ref({ ...props.prefill });
const message = inject('message');

/*******************************
 * Lifecycle hooks
 ******************************/
onBeforeMount(() => {
  if (!employee.value.id) {
    employee.value.type = 'subcontractor';
    employee.value.country = 'Danmark';
    employee.value.payout_type = 'hourly';
  }
});

/*******************************
 * Methods
 ******************************/
const saveEmployee = async () => {
  if (!employee.value.name || !employee.value.cvr || !employee.value.type) {
    message.showError('Du skal udfylde alle felter');
    return;
  }

  message.loading = true;

  const url = employee.value.id ? `/employees/${employee.value.id}` : '/employees';

  await axiosClient.post(url, employee.value).then((response) => {
    message.showComplete('Medarbejderen oprettet');

    if (employee.value.id) {
      emit('updated', response.employee);
    } else {
      emit('created', response.employee);
    }
  }).catch((e) => { });

  message.loading = false;
};
</script>