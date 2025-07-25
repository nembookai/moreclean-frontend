<template>
  <div>
    <LayoutComponents-Title :title="`Medarbejder ${employee?.name || '---'}`" />

    <ModalShow :condition="openEditEmployee">
      <Employee-Create @close="openEditEmployee = false" :prefill="employee" @updated="updateEmployee" />
    </ModalShow>

    <ModalShow :condition="openDeleteSure">
      <DeletePrompt :msg="`Er du sikker på du vil slette ${employee.name}?`" @delete="deleteEmployee" @close="openDeleteSure = false" />
    </ModalShow>

    <div class="grid grid-cols-12 mt-5" v-if="!loading.loading">
      <div class="col-span-10">
        <div class="box p-6">
          <div class="grid grid-cols-3 gap-6">
            <div>
              <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhUser :size="22" weight="regular" /> Om medarbejderen</div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Navn</div>
                <div class="font-light text-gray-700">{{ employee.name || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Type</div>
                <div class="font-light text-gray-700">{{ employee.type === 'subcontractor' ? 'Underleverandør' : 'Ansat' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light"><span v-if="employee.type === 'subcontractor'">Cvr nummer</span><span v-else>Cpr. nummer</span></div>
                <div class="font-light text-gray-700">{{ employee.cvr || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Email</div>
                <div class="font-light text-gray-700">{{ employee.email || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Telefon</div>
                <div class="font-light text-gray-700">{{ employee.phone || '---' }}</div>
              </div>
            </div>
            <div>
              <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhMapPin :size="22" weight="regular" /> Adresse</div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Adresse</div>
                <div class="font-light text-gray-700">{{ employee.address || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Postnr.</div>
                <div class="font-light text-gray-700">{{ employee.zip || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">By</div>
                <div class="font-light text-gray-700">{{ employee.city || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Land</div>
                <div class="font-light text-gray-700">{{ employee.country || '---' }}</div>
              </div>
            </div>
            <div>
              <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2"><PhMoney :size="22" weight="regular" /> Løn</div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Løn kr. i timen</div>
                <div class="font-light text-gray-700">kr. {{ formatPrice(employee.payout_amount) || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Løn type</div>
                <div class="font-light text-gray-700">{{ employee.payout_type === 'hourly' ? 'Timelønnet' : 'Månedslønnet' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Reg. nr.</div>
                <div class="font-light text-gray-700">{{ employee.registration_number || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Konto nr.</div>
                <div class="font-light text-gray-700">{{ employee.account_number || '---' }}</div>
              </div>
              <div class="mb-4">
                <div class="text-sm text-gray-600 font-light">Ansat siden</div>
                <div class="font-light text-gray-700">{{ employee.hired_at ? moment(employee.hired_at).format('DD/MM/YYYY') : '---' }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="box relative p-6 mt-5 mb-10 min-h-[550px] max-h-[900px] overflow-y-auto">
          <div class="text-xl text-gray-700 font-light mb-2 flex items-center gap-x-2">
            <PhClock :size="22" weight="regular" /> 
            Timehistorik
            <DatePicker :prefilledDate="activeDate" @resetSearch="resetDateSearch" @dateSearch="dateSearch" class="!text-[13px] ml-2 mt-0.5 !leading-none" />
          </div>
          <div v-if="tasks.length" class="flex flex-col gap-y-2 mt-4">
            <div class="grid grid-cols-12 gap-x-10 border-b border-gray-200 pb-2">
              <div class="col-span-4">Opgave</div>
              <div class="col-span-7 flex justify-between items-center">
                <div>Produkt</div>
                <div>Timer</div>
              </div>
            </div>
            <div class="pb-10">
              <div v-for="(task, index) in tasks" :key="task.id">
                <div class="grid grid-cols-12 gap-x-10 border-b border-gray-200 pb-2" :class="{ 'border-b-0': index === tasks.length - 1 }">
                  <div class="col-span-4">
                    <Calendar-Task :showDate="true" class="!h-[40px]" :task="task" :reloadOnUpdate="true" lineClampOverride="line-clamp-2" />
                  </div>
                  <div class="col-span-7">
                    <div v-for="product in task.products" :key="product.id">
                      <div class="text-sm text-gray-700 flex justify-between mt-1">
                        <div class="font-light">{{ product.name }}</div>
                        <div class="font-light">{{ formatPrice(product.hours) }} timer</div>
                      </div>
                    </div>
                    <div class="text-sm text-gray-700 flex justify-between mt-4">
                      <div class="font-medium">Ialt</div>
                      <div class="font-medium">{{ formatPrice((task.duration * 100) / 60) }} timer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sticky bottom-[20px] py-5 bg-primary-50 rounded-md grid grid-cols-3">
              <div>
                <div class="font-light text-gray-700 text-center text-[30px] leading-[30px]">{{ tasks.length }}</div>
                <div class="text-sm text-gray-600 font-light text-center">Antal opgaver</div>
              </div>
              <div>
                <div class="font-light text-gray-700 text-center text-[30px] leading-[30px]">{{ formatPrice(tasks.reduce((acc, task) => acc + (task.duration * 100) / 60, 0)) }}</div>
                <div class="text-sm text-gray-600 font-light text-center">Antal timer</div>
              </div>
              <div>
                <div class="font-light text-gray-700 text-center text-[30px] leading-[30px]">kr. {{ formatPrice((tasks.reduce((acc, task) => acc + (task.duration * 100) / 60, 0) / 100) * employee.payout_amount) }}</div>
                <div class="text-sm text-gray-600 font-light text-center">Løn</div>
              </div>
            </div>
          </div>
          <div class="py-[150px] text-center text-gray-500" v-if="!tasks.length">Ingen timer fundet</div>
        </div>
      </div>
      <div class="col-span-2 pl-[30px] flex flex-col gap-y-2">
        <button class="btn btn__lightgray w-full" @click="openEditEmployee = true"><PhPen :size="16" weight="regular" /> Rediger</button>
        <button class="btn btn__red w-full" @click="openDeleteSure = true"><PhTrash :size="16" weight="regular" /> Slet medarbejder</button>
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
import { PhUser, PhPen, PhTrash, PhMapPin, PhMoney, PhClock } from '@phosphor-icons/vue';
import { useRoute, useRouter } from 'vue-router';
import { formatPrice } from '@/composables/Price';
import moment from 'moment';

/*******************************
* Refs & variables
******************************/
const route = useRoute();
const router = useRouter();
const loading = inject('loading');
const employee = ref({});
const tasks = ref([]);
const activeDate = ref({
  start: moment().startOf('month').format('YYYY-MM-DD'),
  end: moment().endOf('month').format('YYYY-MM-DD')
})
const openEditEmployee = ref(false);
const openDeleteSure = ref(false);

/*******************************
* Lifecycle hooks
******************************/
onBeforeMount(async () => {
  await getApi();
});

/*******************************
* Methods and functions
******************************/
async function getApi() {
  loading.load('Henter data');

  await axiosClient.get(`/employees/${route.params.id}?startdate=${activeDate.value.start}&enddate=${activeDate.value.end}`).then(response => {
    employee.value = response.employee;
    tasks.value = response.tasks;
  }).catch((e) => { });

  loading.reset();
}

const updateEmployee = (e) => {
  employee.value = e;
  openEditEmployee.value = false;
}

const deleteEmployee = () => {
  axiosClient.delete(`/employees/${employee.value.id}`).then(() => {
    router.push({ name: 'employees.index' });
  }).catch((e) => { });
}

const dateSearch = (date) => {
  activeDate.value = date;
  getApi();
}

const resetDateSearch = () => {
  activeDate.value = {
    start: moment().startOf('month').format('YYYY-MM-DD'),
    end: moment().endOf('month').format('YYYY-MM-DD')
  };
  getApi();
}
</script>