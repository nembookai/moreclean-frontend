<template>
  <Modal @close="emit('close')" modalWidth="w-[95vw] md:w-[700px]">
    <template #header>
      Opgavedetaljer
    </template>
    <template #content>
      <div class="text-sm mb-10">
        <div>
          <div class="text-lg text-gray-700 font-light mb-2 flex items-center gap-x-1">
            <PhInfo :size="18" weight="regular" /> Om opgaven
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="text-sm text-gray-600 font-light">Titel</div>
              <div class="font-light text-gray-700">{{ task?.title || '---' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 font-light flex items-center gap-x-1"><PhCalendar :size="16" /> Dato</div>
              <div class="font-light text-gray-700">{{ task?.date ? moment(task.date).format('DD/MM/YYYY') : '---' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 font-light flex items-center gap-x-1"><PhClock :size="16" /> Tid</div>
              <div class="font-light text-gray-700">{{ task?.start_time && task?.end_time ? `${task.start_time} - ${task.end_time}` : '---' }}</div>
            </div>
            <div class="md:col-span-3">
              <div class="text-sm text-gray-600 font-light flex items-center gap-x-1"><PhMapPin :size="16" /> Lokation</div>
              <div class="font-light text-gray-700">{{ task?.location || '---' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600 font-light flex items-center gap-x-1"><PhListBullets :size="16" /> Produkter</div>
              <div class="font-light text-gray-700">
                <template v-if="task?.products?.length">
                  <div v-for="product in task.products" :key="product.id">{{ product?.name }}</div>
                </template>
                <template v-else>---</template>
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600 font-light flex items-center gap-x-1"><PhUsers :size="16" /> Medarbejdere</div>
              <div class="font-light text-gray-700">
                <template v-if="task?.employees?.length">
                  <div v-for="employee in task.employees" :key="employee.id">{{ employee?.name }}</div>
                </template>
                <template v-else>---</template>
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600 font-light">Varighed</div>
              <div class="font-light text-gray-700">{{ durationText }}</div>
            </div>
            <div class="md:col-span-3">
              <div class="text-sm text-gray-600 font-light">Beskrivelse</div>
              <div class="font-light text-gray-700 whitespace-pre-line">{{ task?.description || '---' }}</div>
            </div>
          </div>
        </div>
        <div class="h-px bg-gray-200 my-4"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-lg text-gray-700 font-light mb-1 flex items-center gap-x-1">
              <PhUser :size="18" weight="regular" /> Om kunden
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Navn</div>
              <div class="font-light text-gray-700">{{ customer?.name || '---' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Kundenr.</div>
              <div class="font-light text-gray-700">{{ customer?.number || '---' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Kundetype</div>
              <div class="font-light text-gray-700">{{ customer?.type === 'company' ? 'Virksomhed' : 'Privatperson' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">CVR</div>
              <div class="font-light text-gray-700">{{ customer?.cvr || '---' }}</div>
            </div>
          </div>
          <div>
            <div class="text-lg text-gray-700 font-light mb-1 flex items-center gap-x-1">
              <PhAlignLeftSimple :size="18" weight="regular" /> Kontaktoplysninger
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Email</div>
              <div class="font-light text-gray-700">{{ customer?.email || '---' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Telefon</div>
              <div class="font-light text-gray-700">{{ customer?.phone || '---' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Kontaktperson</div>
              <div class="font-light text-gray-700">{{ customer?.contact_person_name || '---' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Kontaktperson Telefon</div>
              <div class="font-light text-gray-700">{{ customer?.contact_person_phone || '---' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Kontaktperson Email</div>
              <div class="font-light text-gray-700">{{ customer?.contact_person_email || '---' }}</div>
            </div>
          </div>
          <div>
            <div class="text-lg text-gray-700 font-light mb-1 flex items-center gap-x-1">
              <PhMapPin :size="18" weight="regular" /> Kundeadresse
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Adresse:</div>
              <div class="font-light text-gray-700">{{ customer?.address || '---' }}</div>
            </div>
            <div class="mb-3">
              <div class="text-sm text-gray-600 font-light">Postnr. / By:</div>
              <div class="font-light text-gray-700">
                <span v-if="customer?.zip">{{ customer.zip }}</span>
                <span v-if="customer?.zip && customer?.city">, </span>
                <span v-if="customer?.city">{{ customer.city }}</span>
                <span v-if="!customer?.zip && !customer?.city">---</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script setup>
import moment from 'moment';
import { computed } from 'vue';
import { PhUser, PhAlignLeftSimple, PhMapPin, PhCheck, PhX, PhCalendar, PhClock, PhListBullets, PhUsers, PhInfo } from '@phosphor-icons/vue';

const props = defineProps(['task']);
const emit = defineEmits(['close']);

const customer = computed(() => props.task?.customer || {});

const durationText = computed(() => {
  const start = props.task?.start_time;
  const end = props.task?.end_time;
  if (!start || !end) return '---';
  const startMoment = moment(start, 'HH:mm');
  const endMoment = moment(end, 'HH:mm');
  const minutes = endMoment.diff(startMoment, 'minutes');
  if (!minutes || minutes < 0) return '---';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hrs} t ${mins} min` : `${hrs} t`;
});
</script>
