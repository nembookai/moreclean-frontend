<template>
  <div>
    <LayoutComponents-Title :title="`Kunde ${customer?.name || '---'}`" />

    <ModalShow :condition="openEditCustomer">
      <Customer-Create @close="openEditCustomer = false" :lastCustomerNumber="company.lastCustomerNumber" :prefill="customer" @updated="updateCustomer" />
    </ModalShow>

    <ModalShow :condition="openDeleteSure">
      <DeletePrompt :msg="`Er du sikker på du vil slette ${customer.name}?`" @delete="deleteCustomer" @close="openDeleteSure = false" />
    </ModalShow>

    <ModalShow :condition="openServiceAgreement">
      <ServiceAgreement-Create @close="openServiceAgreement = false" :products="company.products" :customer="customer" @saved="saveServiceAgreement" @deleted="deleteServiceAgreement" />
    </ModalShow>

    <div class="grid grid-cols-12 mt-5" v-if="!loading.loading">
      <div class="col-span-10">
        <div class="box p-6">
          <div class="grid grid-cols-3 gap-6">
            <div>
              <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhUser :size="22" weight="regular" /> Om kunden</div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Navn</div>
                <div class="font-light text-gray-700">{{ customer.name || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Kundenr.</div>
                <div class="font-light text-gray-700">{{ customer.number || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Kundetype</div>
                <div class="font-light text-gray-700">{{ customer.type === 'company' ? 'Virksomhed' : 'Privatperson' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">CVR</div>
                <div class="font-light text-gray-700">{{ customer.cvr || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Debitor nr</div>
                <div class="font-light text-gray-700">{{ customer.debit_number || '---' }}</div>
              </div>
            </div>
            <div>
              <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhAlignLeftSimple :size="22" weight="regular" /> Kontaktoplysninger</div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Email</div>
                <div class="font-light text-gray-700">{{ customer.email || '---' }}</div>
              </div>
              <div class="mb-4" v-if="customer.type === 'company'">
                <div class="text-sm text-gray-600 font-light">Fakturerings e-mail</div>
                <div class="font-light text-gray-700">{{ customer.invoice_email || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Telefon</div>
                <div class="font-light text-gray-700">{{ customer.phone || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Kontaktperson</div>
                <div class="font-light text-gray-700">{{ customer.contact_person_name || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Kontaktperson Telefon</div>
                <div class="font-light text-gray-700">{{ customer.contact_person_phone || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Kontaktperson Email</div>
                <div class="font-light text-gray-700">{{ customer.contact_person_email || '---' }}</div>
              </div>
            </div>
            <div>
              <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhMapPin :size="22" weight="regular" /> Kundeadresse</div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Adresse:</div>
                <div class="font-light text-gray-700">{{ customer.address || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Postnr. / By:</div>
                <div class="font-light text-gray-700">
                  <span v-if="customer.zip">{{ customer.zip }}</span>
                  <span v-if="customer.zip && customer.city">, </span>
                  <span v-if="customer.city">{{ customer.city }}</span>
                  <span v-if="!customer.zip && !customer.city">---</span>
                </div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Oprettet:</div>
                <div class="font-light text-gray-700">{{ moment(customer.created_at).format('DD/MM/YYYY') }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Sidst opdateret:</div>
                <div class="font-light text-gray-700">{{ moment(customer.updated_at).format('DD/MM/YYYY') }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Farve:</div>
                <span class="inline-block w-10 h-4 rounded-full align-middle" :style="{ backgroundColor: customer.color }"></span>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">E-conomic:</div>
                <div class="font-light text-gray-700">
                  <PhCheck v-if="customer.economic_id" :size="20" class="text-green-600" weight="bold" />
                  <PhX v-else :size="20" class="text-red-600" weight="bold" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-x-4 mt-4 mb-10">
          <div class="box p-6 col-span-6 h-[300px] overflow-y-auto">
            <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhList :size="22" weight="regular" /> Opgavehistorik (dette år)</div>
            <div class="flex flex-col gap-y-2" v-if="tasks.length">
              <div v-for="task in tasks" :key="task.id">
                <Calendar-Task :showDate="true" class="h-[40px]" :task="task" lineClampOverride="line-clamp-1" />
              </div>
            </div>
            <div v-else>
              <div class="text-gray-500 text-sm font-light text-center py-10">Ingen opgaver fundet</div>
            </div>
          </div>
          <div class="box p-6 col-span-6 h-[300px] flex justify-between flex-col">
            <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhMoney :size="22" weight="regular" /> Økonomi (dette år)</div>
            <div class="flex-1 items-center w-full flex">
              <div class="grid grid-cols-2 w-full gap-y-10">
                <div>
                  <div class="font-light text-gray-700 text-center text-[30px] leading-[30px]">{{ stats.tasks }}</div>
                  <div class="text-sm text-gray-600 font-light text-center">Antal opgaver</div>
                </div>
                <div>
                  <div class="font-light text-center text-[30px] leading-[30px] text-green-600">{{ formatPrice(stats.earned) }} kr.</div>
                  <div class="text-sm text-gray-600 font-light text-center">Indtjening</div>
                </div>
                <div>
                  <div class="font-light text-center text-[30px] leading-[30px] text-red-600">{{ formatPrice(stats.costs) }} kr.</div>
                  <div class="text-sm text-gray-600 font-light text-center">Udgifter</div>
                </div>
                <div>
                  <div class="font-light text-center text-[30px] leading-[30px]" :class="stats.result > 0 ? 'text-green-600' : ( stats.result < 0 ? 'text-red-600' : 'text-gray-600')">{{ formatPrice(stats.result) }} kr.</div>
                  <div class="text-sm text-gray-600 font-light text-center">Resultat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-2 pl-[30px] flex flex-col gap-y-2">
        <button class="btn btn__lightgray w-full" @click="openEditCustomer = true"><PhPen :size="16" weight="regular" /> Rediger kunde</button>
        <button class="btn w-full" @click="openServiceAgreement = true"><PhCalendar :size="16" weight="regular" /> Serviceaftale</button>
        <button class="btn btn__red w-full" @click="openDeleteSure = true"><PhTrash :size="16" weight="regular" /> Slet kunde</button>
      </div>
    </div>
  </div>
</template>
<script setup>
/*******************************
* Imports & props
******************************/
import { ref, onBeforeMount, inject } from 'vue';
import { axiosClient } from '@/lib/axiosClient'
import { useRoute, useRouter } from 'vue-router';
import { Company } from '@/store/company';
import { formatPrice } from '@/composables/Price';
import { PhPen, PhCalendar, PhTrash, PhList, PhUser, PhAlignLeftSimple, PhMapPin, PhMoney, PhCheck, PhX } from '@phosphor-icons/vue';
import moment from 'moment';

/*******************************
* Refs & variables
******************************/
const route = useRoute();
const router = useRouter();
const loading = inject('loading');
const customer = ref({});
const tasks = ref([]);
const company = Company();
const stats = ref({});

const openEditCustomer = ref(false);
const openServiceAgreement = ref(false);
const openDeleteSure = ref(false);

/*******************************
* Lifecycle hooks
******************************/
onBeforeMount(async () => {
  loading.load('Henter data');

  await axiosClient.get(`/customers/${route.params.id}`).then(response => {
    customer.value = response.customer;
    tasks.value = response.tasks;
    stats.value.tasks = response.tasks?.length || 0;

    stats.value.earned = tasks.value.reduce((acc, task) => {
      const economy = task.economy;
      const fixedPrice = economy?.fixed_price || 0;
      const hourlyPrice = economy?.hourly_price || 0;
      const invoiceHours = (economy?.invoice_hours_customer / 100) || 0;

      return acc + (invoiceHours * hourlyPrice + fixedPrice);
    }, 0);

    stats.value.costs = tasks.value.reduce((acc, task) => {
      let totalCosts = 0;
      const hours = (task?.economy?.invoice_hours_employee / 100) || 0;
      
      task.employees.forEach(employee => {
        totalCosts += (hours * employee.payout_amount);
      });

      return acc + totalCosts;
    }, 0);

    stats.value.result = stats.value.earned - stats.value.costs;

  }).catch((e) => { });

  loading.reset();
});

/*******************************
* Methods and functions
******************************/
const updateCustomer = (c) => {
  customer.value = c;
  openEditCustomer.value = false;
}

const saveServiceAgreement = (sa) => {
  customer.value.service_agreement = sa;
  openServiceAgreement.value = false;
}

const deleteServiceAgreement = () => {
  customer.value.service_agreement = null;
  openServiceAgreement.value = false;
}

const deleteCustomer = () => {
  axiosClient.delete(`/customers/${customer.value.id}`).then(() => {
    router.push({ name: 'customers.index' });
  }).catch((e) => { });
}
</script>