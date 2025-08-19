<template>
  <LayoutComponents-Title title="Indstillinger" />

  <div class="mt-5 box" v-if="!loading.loading">
    <div class="font-medium mb-5">E-conomic indstillinger</div>
    <div class="flex flex-col gap-y-5 w-[500px]">
      <div class="flex items-center justify-between">
        <div class="text-gray-800 text-[14px] font-medium text-nowrap">Standard kunde gruppe</div>
        <DropdownWrite v-if="!economicLoading.customerGroups" fillPlaceholder="Vælg kunde gruppe" :values="economicData.customerGroups" :chosenValue="settings.find(s => s.key === 'customer_group')?.value" @selectValue="(v) => selectSettings(v, 'customer_group', 'customerGroupNumber')" display="name" dropdownWidth="w-[250px]" class="!w-[250px]" :filterable="['number', 'name']" />
        <div class="input input__disabled !w-[250px] flex items-center gap-x-2" v-else><PhSpinner class="animate-spin" :size="15" />Indlæser kunde grupper...</div>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-gray-800 text-[14px] font-medium text-nowrap">Standard momszone</div>
        <DropdownWrite v-if="!economicLoading.vatZones" fillPlaceholder="Vælg momszone" :values="economicData.vatZones" :chosenValue="settings.find(s => s.key === 'vat_zone')?.value" @selectValue="(v) => selectSettings(v, 'vat_zone', 'vatZoneNumber')" display="name" dropdownWidth="w-[250px]" class="!w-[250px]" :filterable="['number', 'name']" />
        <div class="input input__disabled !w-[250px] flex items-center gap-x-2" v-else><PhSpinner class="animate-spin" :size="15" />Indlæser momszone...</div>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-gray-800 text-[14px] font-medium text-nowrap">Standard betalingsbetingelser</div>
        <DropdownWrite v-if="!economicLoading.paymentTerms" fillPlaceholder="Vælg betalingsbetingelser" :values="economicData.paymentTerms" :chosenValue="settings.find(s => s.key === 'payment_term')?.value" @selectValue="(v) => selectSettings(v, 'payment_term', 'paymentTermsNumber')" display="name" dropdownWidth="w-[250px]" class="!w-[250px]" :filterable="['number', 'name']" />
        <div class="input input__disabled !w-[250px] flex items-center gap-x-2" v-else><PhSpinner class="animate-spin" :size="15" />Indlæser betalingsbetingelser...</div>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-gray-800 text-[14px] font-medium text-nowrap">Standard produkt gruppe</div>
        <DropdownWrite v-if="!economicLoading.productGroups" fillPlaceholder="Vælg produkt gruppe" :values="economicData.productGroups" :chosenValue="settings.find(s => s.key === 'product_group')?.value" @selectValue="(v) => selectSettings(v, 'product_group', 'productGroupNumber')" display="name" dropdownWidth="w-[250px]" class="!w-[250px]" :filterable="['number', 'name']" />
        <div class="input input__disabled !w-[250px] flex items-center gap-x-2" v-else><PhSpinner class="animate-spin" :size="15" />Indlæser produkt gruppe...</div>
      </div>
      <div class="flex items-center justify-between">
        <div class="text-gray-800 text-[14px] font-medium text-nowrap">Standard faktura layout</div>
        <DropdownWrite v-if="!economicLoading.layouts" fillPlaceholder="Vælg faktura layout" :values="economicData.layouts" :chosenValue="settings.find(s => s.key === 'layout')?.value" @selectValue="(v) => selectSettings(v, 'layout', 'layoutNumber')" display="name" dropdownWidth="w-[250px]" class="!w-[250px]" :filterable="['number', 'name']" />
        <div class="input input__disabled !w-[250px] flex items-center gap-x-2" v-else><PhSpinner class="animate-spin" :size="15" />Indlæser faktura layout...</div>
      </div>
    </div>
    <div class="mt-5">
      <button class="btn btn__primary" @click="saveEconomicSettings">Gem indstillinger</button>
    </div>
  </div>
</template>
<script setup>
/*******************************
* Imports & props
******************************/
import { ref, onBeforeMount, inject } from 'vue';
import { axiosClient } from '@/lib/axiosClient'
import { PhSpinner } from '@phosphor-icons/vue';

/*******************************
* Refs & variables
******************************/
const message = inject('message');
const loading = inject('loading');
const settings = ref([]);
const economicLoading = ref({});
const economicData = ref({});

/*******************************
* Lifecycle hooks
******************************/
onBeforeMount(async () => {
  loading.load();

  await axiosClient.get('/settings').then((response) => {
    settings.value = response.settings;
  }).catch((e) => { });

  loading.reset();

  // Start loading all at once
  economicLoading.value.customerGroups = true;
  economicLoading.value.vatZones = true;
  economicLoading.value.paymentTerms = true;
  economicLoading.value.productGroups = true;
  economicLoading.value.layouts = true;

  const customerGroupsPromise = axiosClient.get('/economic/single/customer-groups')
    .then((response) => {
      economicData.value.customerGroups = response.data;

      const customerGroupSetting = settings.value.find(s => s.key === 'customer_group');
      if (customerGroupSetting) {
        customerGroupSetting.value = economicData.value.customerGroups.find(
          cg => cg.customerGroupNumber === customerGroupSetting.value
        );
        customerGroupSetting.dbValue = customerGroupSetting.value.customerGroupNumber;
      }
    })
    .catch((e) => { })
    .finally(() => {
      economicLoading.value.customerGroups = false;
    });

  const vatZonesPromise = axiosClient.get('/economic/single/vat-zones')
    .then((response) => {
      economicData.value.vatZones = response.data?.filter(vz => vz.enabledForSupplier);

      const vatZoneSetting = settings.value.find(s => s.key === 'vat_zone');
      if (vatZoneSetting) {
        vatZoneSetting.value = economicData.value.vatZones.find(
          vz => vz.vatZoneNumber === vatZoneSetting.value
        );
        vatZoneSetting.dbValue = vatZoneSetting.value.vatZoneNumber;
      }
    })
    .catch((e) => { })
    .finally(() => {
      economicLoading.value.vatZones = false;
    });

  const paymentTermsPromise = axiosClient.get('/economic/single/payment-terms')
    .then((response) => {
      economicData.value.paymentTerms = response.data;

      const paymentTermSetting = settings.value.find(s => s.key === 'payment_term');
      if (paymentTermSetting) {
        paymentTermSetting.value = economicData.value.paymentTerms.find(
          pt => pt.paymentTermsNumber === paymentTermSetting.value
        );
        paymentTermSetting.dbValue = paymentTermSetting.value.paymentTermsNumber;
      }
    })
    .catch((e) => { })
    .finally(() => {
      economicLoading.value.paymentTerms = false;
    });

  const productGroupsPromise = axiosClient.get('/economic/single/product-groups')
    .then((response) => {
      economicData.value.productGroups = response.data;

      const productGroupSetting = settings.value.find(s => s.key === 'product_group');
      if (productGroupSetting) {
        productGroupSetting.value = economicData.value.productGroups.find(
          pg => pg.productGroupNumber === productGroupSetting.value
        );
        productGroupSetting.dbValue = productGroupSetting.value.productGroupNumber;
      }
    })
    .catch((e) => { })
    .finally(() => {
      economicLoading.value.productGroups = false;
    });

  const layoutsPromise = axiosClient.get('/economic/single/layouts')
    .then((response) => {
      economicData.value.layouts = response.data;

      const layoutSetting = settings.value.find(s => s.key === 'layout');
      if (layoutSetting) {
        layoutSetting.value = economicData.value.layouts.find(
          l => l.layoutNumber === layoutSetting.value
        );
        layoutSetting.dbValue = layoutSetting.value.layoutNumber;
      }
    })
    .catch((e) => { })
    .finally(() => {
      economicLoading.value.layouts = false;
    });

  // Wait for all to finish before proceeding if needed
  await Promise.all([
    customerGroupsPromise,
    vatZonesPromise,
    paymentTermsPromise,
    productGroupsPromise,
    layoutsPromise
  ]);
});

/*******************************
* Methods
******************************/
const selectSettings = (value, key, dbValue) => {
  if (settings.value.find(s => s.key === key)) {
    settings.value = settings.value.map(s => s.key === key ? { ...s, value: value, dbValue: value[dbValue] } : s);
  } else {
    settings.value.push({
      key: key,
      value: value,
      dbValue: value[dbValue]
    });
  }
}

const saveEconomicSettings = () => {
  axiosClient.post('/settings', settings.value).then((response) => {
    message.showComplete('Indstillinger gemt');
  }).catch((e) => { });
}
</script>