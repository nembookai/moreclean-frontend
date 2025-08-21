<template>
  <Modal @close="$emit('close')" modalWidth="w-[700px]">
    <template #header>
      <div class="flex items-center gap-x-3" v-if="!customer.id">
        <div class="text-[19px] font-normal text-primary-900">Opret ny kunde</div>
        <Customer-EconomicModule :customer="customer" @update:customer="updateFromEconomicCustomer" @remove:customer="removeActiveEconomicCustomer" />
      </div>
      <div class="text-[19px] font-normal text-primary-900 flex items-center gap-x-3" v-else>
        Rediger kunde
        <Customer-EconomicModule :customer="customer" @update:customer="updateFromEconomicCustomer" @remove:customer="removeActiveEconomicCustomer" />
      </div>
    </template>
    <template #content>
      <div class="grid grid-cols-6 gap-x-5 gap-y-3">
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 rounded text-[18px]">Om kunden</div>
        <div class="col-span-5">
          <label class="text-gray-600 text-[13px]">Navn <span class="text-red-500">*</span></label>
          <input type="text" id="name" v-model="customer.name" class="input !mt-0" autocomplete="new-password" placeholder="Tilføj navn" />
        </div>
        <div class="col-span-1">
          <label class="text-gray-600 text-[13px]">Kundenr. <span class="text-red-500">*</span></label>
          <input type="number" id="number" v-model="customer.customer_number" class="input !mt-0" autocomplete="new-password" placeholder="Kunde nummer" />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Kundetype <span class="text-red-500">*</span></label>
          <select id="type" v-model="customer.type" class="input !mt-0" @change="changeCustomerColorType">
            <option value="person">Privat</option>
            <option value="company">Virksomhed</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]" v-if="customer.type === 'company'">CVR <span class="text-red-500" v-if="customer.type === 'company'">*</span></label>
          <label class="text-gray-600 text-[13px]" v-else>CPR</label>
          <input type="text" id="cvr" v-model="customer.cvr" class="input !mt-0" autocomplete="new-password" :placeholder="customer.type === 'company' ? 'CVR nummer' : 'CPR nummer'" />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Debitor nr.</label>
          <input type="number" id="debit_number" v-model="customer.debit_number" class="input !mt-0" autocomplete="new-password" placeholder="Debitor nummer" />
        </div>
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 mt-4 rounded text-[18px]">Kontaktoplysninger</div>
        <div :class="customer.type === 'company' ? 'col-span-2' : 'col-span-3'">
          <label class="text-gray-600 text-[13px]">E-mail <span class="text-red-500">*</span></label>
          <input type="text" id="email" v-model="customer.email" class="input !mt-0" autocomplete="new-password" placeholder="E-mail" />
        </div>
        <div class="col-span-2" v-if="customer.type === 'company'">
          <label class="text-gray-600 text-[13px]">Fakturerings e-mail</label>
          <input type="text" id="email" v-model="customer.invoice_email" class="input !mt-0" autocomplete="new-password" placeholder="Fakturerings e-mail" />
        </div>
        <div :class="customer.type === 'company' ? 'col-span-2' : 'col-span-3'">
          <label class="text-gray-600 text-[13px]">Telefon <span class="text-red-500">*</span></label>
          <input type="text" id="phone" v-model="customer.phone" class="input !mt-0" autocomplete="new-password" placeholder="Telefon" />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Kontaktperson</label>
          <input type="text" id="contact_person" v-model="customer.contact_person_name" class="input !mt-0" autocomplete="new-password" placeholder="Kontaktperson" />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Kontaktperson telefon</label>
          <input type="text" id="contact_person_phone" v-model="customer.contact_person_phone" class="input !mt-0" autocomplete="new-password" placeholder="Kontaktperson telefon" />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Kontaktperson e-mail</label>
          <input type="text" id="contact_person_email" v-model="customer.contact_person_email" class="input !mt-0" autocomplete="new-password" placeholder="Kontaktperson e-mail" />
        </div>
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 mt-4 rounded text-[18px]">Kunde adresse</div>
        <div class="col-span-5 relative">
          <label class="text-gray-600 text-[13px]">Adresse</label>
          <input type="text" ref="customerAddressInput" id="customer-address" autocomplete="new-password"  v-model="customer.address" class="input !mt-0" placeholder="Kundens adresse" />
        </div>
        <div class="col-span-1">
          <label class="text-gray-600 text-[13px]">Post nr.</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="customer.zip" class="input !mt-0" placeholder="Post nr." />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">By</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="customer.city" class="input !mt-0" placeholder="By" />
        </div>
        <div class="col-span-3">
          <label class="text-gray-600 text-[13px]">Land</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" disabled v-model="customer.country" class="input !mt-0 input__disabled" placeholder="Land" />
        </div>
        <div class="col-span-full -mb-2 bg-primary-600 text-white w-fit px-2 mt-4 rounded text-[18px]">Mere</div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Kundens farve</label>
          <div class="flex items-center gap-x-2">
            <div class="rounded-[8px] w-[26.5px] h-[26.5px] cursor-pointer hover-transition hover:opacity-80" :class="{ 'border-2 border-black': customer.color === colorNew }" :style="{ backgroundColor: colorNew }" v-for="colorNew in taskColors" @click.stop="customer.color = colorNew"></div>
          </div>
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Kundens hjemmeside</label>
          <input type="text" ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="customer.website" class="input !mt-0" placeholder="Hjemmeside" />
        </div>
        <div class="col-span-2">
          <label class="text-gray-600 text-[13px]">Note</label>
          <textarea ref="locationInput" id="adresse" autocomplete="one-time-code" v-model="customer.note" class="input !mt-0" placeholder="Note" />
        </div>
        <div class="col-span-full">
          <div class="flex justify-end">
            <div v-if="!customer.economic_id && !customer.id" class="flex items-center mr-4">
              <input type="checkbox" id="createEconomic" v-model="customer.economic_create" class="mr-2" />
              <label for="createEconomic" class="text-gray-600 text-[13px] cursor-pointer select-none">Opret kunde i economic også</label>
            </div>
            <button class="btn btn__green !px-10" :disabled="message.loading" @click="saveCustomer">
              <span v-if="message.loading">Gemmer...</span>
              <span v-else>Gem kunde</span>
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
import { ref, onBeforeMount, onMounted, inject } from 'vue';
import { axiosClient } from '@/lib/axiosClient';
import { taskColors } from '@/composables/globalHelper';

const props = defineProps(['prefill', 'lastCustomerNumber']);

/*******************************
 * Refs & variables
 ******************************/
const emit = defineEmits(['close', 'updated', 'created']);
const customer = ref({ ...props.prefill });
const customerAddressInput = ref(null);
const message = inject('message');

/*******************************
 * Lifecycle hooks
 ******************************/
onBeforeMount(() => {
  if (!customer.value.id) {
    customer.value.customer_number = props.lastCustomerNumber;
    customer.value.type = 'company';
    customer.value.country = 'Danmark';
    customer.value.color = taskColors[5];
    customer.value.economic_create = true;
  } else {
    customer.value.customer_number = customer.value.number;
  }
});

onMounted(() => {
  const el = document.getElementById('customer-address');
  if (!el || !window?.dawaAutocomplete?.dawaAutocomplete) return;

  window.dawaAutocomplete.dawaAutocomplete(el, {
    select: function(selected) {
      customer.value.address = selected.data?.vejnavn;
      customer.value.zip = selected.data?.postnr;
      customer.value.city = selected.data?.postnrnavn;
    }
  });
});

/*******************************
 * Methods
 ******************************/
const saveCustomer = async () => {
  if (!customer.value.name || !customer.value.customer_number || !customer.value.type || !customer.value.phone || !customer.value.email) {
    message.showError('Du skal udfylde alle felter');
    return;
  }

  if (customer.value.type === 'company' && !customer.value.cvr) {
    message.showError('Du skal udfylde CVR nummer');
    return;
  }

  message.loading = true;

  let customerToEmit = null;
  const url = customer.value.id ? `/customers/${customer.value.id}` : '/customers';

  await axiosClient.post(url, customer.value).then(async (response) => {
    message.showComplete('Kunden oprettet');
    customerToEmit = response.customer;

    if (customer.value.id) {
      emit('updated', response.customer);
      return;
    }

    if (customer.value.economic_create) {
      await axiosClient.post('/economic/customers', response.customer).then(async (response) => {
        message.showComplete('Kunden oprettet i e-conomic');
        customer.value.economic_id = response.customer.economic_id;
        customerToEmit = response.customer;
      }).catch((e) => { });
    }

    emit('created', customerToEmit);
    
  }).catch((e) => { });

  message.loading = false;
};

const updateFromEconomicCustomer = (cc) => {
  customer.value.economic_id = cc.customerNumber;
  
  if (!customer.value.id) {
    customer.value.debit_number = cc.customerNumber;
    customer.value.name = cc.name;
    customer.value.email = cc.email;
    customer.value.phone = cc.telephoneAndFaxNumber;
    customer.value.cvr = cc.corporateIdentificationNumber;
    customer.value.city = cc.city;
    customer.value.address = cc.address;
    customer.value.zip = cc.zip;
    customer.value.country = cc.country;
  }
}

const removeActiveEconomicCustomer = () => {
  customer.value.economic_id = null;
}

const changeCustomerColorType = () => {
  if (customer.value.type === 'person') {
    customer.value.color = taskColors[0];
  } else {
    customer.value.color = taskColors[5];
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
  font-size: 12.5px;
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