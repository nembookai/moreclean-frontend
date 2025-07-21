<template>
  <div>
    <ModalShow :condition="deleteTask">
      <DeletePrompt :msg="deleteTextSure" @delete="tasks.deleteTask(tasks.activeTask, deleteMethod)" @close="deleteTask = false" />
    </ModalShow>

    <div class="bg-[#f8f8f8] rounded-[8px] my-[48px] drop-shadow z-[210] w-[600px] relative" ref="modal">
      <div class="py-3 px-5 border-b flex items-center justify-between gap-x-2 rounded-t-[8px]" :class="textColorWhiteOrBlack(tasks.activeTask.color)" :style="{ backgroundColor: tasks.activeTask.color }">
        <div class="flex-1 text-[22.5px] font-normal">{{ tasks.activeTask.title }}</div>
        <PhX :size="30" weight="bold" class="p-1 w-[30px] hover:opacity-80 cursor-pointer hover-transition" @click.stop="closeModal" />
      </div>
      <template v-if="!showEditTask">
        <div class="p-5 flex flex-col gap-y-[20px]">
          <div class="flex gap-x-3">
            <div>
              <PhUser :size="24" weight="regular" class="text-gray-500" />
            </div>
            <div>
              <div class="text-gray-700 text-[15px] font-semibold leading-[15px]">Kunde</div>
              <div class="text-gray-800 text-[14px] font-light flex items-center gap-x-1 mt-1"><span>({{ tasks.activeTask.customer?.number }})</span>{{ tasks.activeTask.customer?.name }}</div>
              <div v-if="tasks.activeTask.service_agreement" class="bg-primary-500 text-white text-[12px] font-normal px-2 py-[3px] leading-none rounded-full mt-1">Serviceaftale: {{ tasks.activeTask.service_agreement?.name }}</div>
            </div>
          </div>
          <div class="flex gap-x-3">
            <div>
              <PhIdentificationBadge :size="24" weight="regular" class="text-gray-500" />
            </div>
            <div>
              <div class="text-gray-700 text-[15px] font-semibold leading-[15px]">Medarbejdere</div>
              <div class="text-gray-800 text-[14px] font-light mt-1">
                <div v-for="employee in tasks.activeTask.employees" :key="employee.id">
                  <span>{{ employee.name }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-x-3">
            <div>
              <PhPackage :size="24" weight="regular" class="text-gray-500" />
            </div>
            <div>
              <div class="text-gray-700 text-[15px] font-semibold leading-[15px]">Produkter</div>
              <div class="text-gray-800 text-[14px] font-light mt-1">
                <div v-for="product in tasks.activeTask.products" :key="product.id">
                  <div class="flex items-center gap-x-1">
                    <span>{{ product.name }}</span>
                    <span class="text-gray-500 text-[12px] font-light mt-[1.5px]">({{ formatPrice(product.hours) }} timer)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-x-3">
            <div>
              <PhClock :size="24" weight="regular" class="text-gray-500" />
            </div>
            <div>
              <div class="text-gray-700 text-[15px] font-semibold leading-[15px]">Dato & tidspunkt</div>
              <div class="text-gray-800 text-[14px] font-light flex items-center gap-x-1 mt-1">
                <div>{{ moment(tasks.activeTask.date).format('dddd, DD. MMM' + (moment(tasks.activeTask.date).year() !== moment().year() ? ' YYYY' : '')) }}</div>
                <div class="text-gray-500 text-[14px] mx-1">&bull; {{ tasks.activeTask.start_time }} - {{ tasks.activeTask.end_time }}</div>
              </div>
              <div class="text-gray-800 font-light text-[14px]" v-if="tasks.activeTask?.recurring?.enabled">{{ tasks.activeTask.recurring.danish_text }}</div>
            </div>
          </div>
          <div class="flex gap-x-3">
            <div>
              <PhMapPin :size="24" weight="regular" class="text-gray-500" />
            </div>
            <div>
              <div class="text-gray-800 text-[15px] font-semibold leading-[15px]">Lokation</div>
              <div class="text-gray-800 text-[14px] font-light mt-1">{{ tasks.activeTask.location || 'Ingen lokation tilføjet' }}</div>
            </div>
          </div>
          <div class="flex gap-x-3 mb-1 w-full" :class="{ 'items-center !mb-2': !showEconomy }" v-if="!tasks.activeTask.service_agreement">
            <div>
              <PhCoins :size="24" weight="regular" class="text-gray-500" />
            </div>
            <div class="w-[400px]">
              <div class="flex items-center gap-x-1 cursor-pointer hover:bg-gray-200 rounded-[4px] p-1 hover-transition active:bg-gray-300 active:translate-y-[-1.5px]" @click="showEconomy = !showEconomy">
                <div class="text-gray-800 text-[15px] font-semibold leading-[15px]">Økonomi</div>
                <PhCaretDown :size="16" weight="bold" class="text-gray-800 hover-transition" :class="{ 'rotate-180': showEconomy }" />
              </div>
              <div class="text-gray-600 text-[14px] font-light mt-1 flex flex-col gap-y-1 w-full" v-if="showEconomy">
                <div class="flex justify-between">
                  <span class="font-normal">Faktureringstimer (Kunde)</span> 
                  <span>{{ formatPrice(tasks.activeTask.economy?.invoice_hours_customer) }} timer</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-normal">Faktureringstimer (Medarbejder)</span> 
                  <span>{{ formatPrice(tasks.activeTask.economy?.invoice_hours_employee) }} timer</span>
                </div>
                <div class="flex justify-between mt-3">
                  <span class="font-normal">Timepris</span> 
                  <span>{{ formatPrice(tasks.activeTask.economy?.hourly_price) }} kr.</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-normal">Fastpris</span> 
                  <span>{{ formatPrice(tasks.activeTask.economy?.fixed_price) }} kr.</span>
                </div>
                <div class="flex justify-between mt-3">
                  <span class="font-normal">Lønninger</span> 
                  <span class="text-red-500">{{ formatPrice(expenses * -1) }} kr.</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-normal">Indtjening</span> 
                  <span>{{ formatPrice(earnings) }} kr.</span>
                </div>
                <div class="flex justify-between" :class="[earnings - expenses > 0 ? 'text-green-600' : 'text-red-600']">
                  <span class="font-normal">Resultat</span> 
                  <span>{{ formatPrice(earnings - expenses) }} kr.</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-x-3 bg-gray-200 -m-2 p-2 rounded-[8px]">
            <div>
              <PhChatText :size="24" weight="regular" class="text-gray-500" />
            </div>
            <div>
              <div class="text-gray-700 text-[15px] font-semibold leading-[15px] mb-1.5">Beskrivelse</div>
              <div v-html="tasks.activeTask.description" class="description" v-if="tasks.activeTask.description"></div>
              <div v-else class="text-gray-500 text-[13px] font-light">Ingen beskrivelse</div>
            </div>
          </div>
          <div class="flex items-center justify-end gap-x-5">
            <div v-if="!tasks.activeTask.recurring?.enabled" class="text-red-500 underline text-[13px] font-light underline-offset-2 leading-[15px] select-none cursor-pointer hover-transition hover:opacity-80 active:opacity-100 active:translate-y-[-1.5px]" @click.stop="deleteFromMethod(1)">Slet opgaven</div>
            <div class="relative">
              <div v-if="tasks.activeTask.recurring?.enabled" class="text-red-600 underline flex items-center gap-x-1 text-[13px] font-light underline-offset-2 leading-[15px] select-none cursor-pointer hover-transition hover:opacity-80 active:opacity-100 active:translate-y-[-1.5px]" @click.stop="showDeleteRecurring = !showDeleteRecurring">
                Sletning mulighed <PhCaretDown :size="16" weight="bold" class="hover-transition" :class="{ 'rotate-180': showDeleteRecurring }" />
              </div>
              <transition name="dropdown">
                <LayoutComponents-HoverDropdown :freeSlot="true" class="absolute top-[30px] z-[99] right-0" @close="showDeleteRecurring = false" v-click-outside="() => showDeleteRecurring = false" v-if="showDeleteRecurring" extraclass="w-[250px] max-h-[300px]">
                <template #free>
                  <div class="hover_dropdown hover_dropdown__small hover_dropdown__red" @click="deleteFromMethod(2)">
                    <div><PhBackspace :size="16" weight="fill" /></div>
                    Slet kun denne opgave
                  </div>
                  <div class="hover_dropdown hover_dropdown__small hover_dropdown__red" @click="deleteFromMethod(3)">
                    <div><PhBackspace :size="16" weight="fill" /></div>
                    Slet denne & følgende opgaver
                  </div>
                  <div class="hover_dropdown hover_dropdown__small hover_dropdown__red" @click="deleteFromMethod(4)">
                    <div><PhBackspace :size="16" weight="fill" /></div>
                    Slet alle opgaver
                  </div>
                </template>
                </LayoutComponents-HoverDropdown>
              </transition>
            </div>
            <button @click="showEditTask = true" class="flex items-center justify-center select-none gap-x-1.5 px-[15px] py-[8px] rounded-[4px] text-[13.5px] hover-transition hover:opacity-80 active:opacity-100 active:translate-y-[-1.5px]" :style="{ backgroundColor: tasks.activeTask.color }" :class="textColorWhiteOrBlack(tasks.activeTask.color)">
              <PhPencilSimple :size="14" weight="fill" />
              Rediger opgave
            </button>
          </div>
        </div>
      </template>
      <Task-Edit class="p-5" v-else :task="tasks.activeTask" @close="showEditTask = false" @updated="tasks.updateTask" />
    </div>
  </div>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { textColorWhiteOrBlack } from '@/composables/globalHelper'
import { PhChatText, PhClock, PhPencilSimple, PhMapPin, PhX, PhUser, PhIdentificationBadge, PhPackage, PhCoins, PhCaretDown, PhBackspace } from '@phosphor-icons/vue';
import moment from 'moment';
import { formatPrice } from '@/composables/Price';
import { Tasks } from '@/store/tasks';

/******************************
 * Refs & consts
******************************/
const tasks = Tasks();
const emit = defineEmits(['close']);
const modal = ref();
const deleteTask = ref(false);
const showEditTask = ref(false);
const showEconomy = ref(false);
const showDeleteRecurring = ref(false);
const deleteMethod = ref(1);
const deleteTextSure = ref('');

/******************************
 * Methods & computed
******************************/
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

function closeModal() {
  if (showEditTask.value) {
    showEditTask.value = false;
  } else {
    emit('close');
  }
}

const deleteFromMethod = (method) => {
  if (method === 1 || method === 2) {
    deleteTextSure.value = `Er du sikker på du vil slette opgaven ${tasks.activeTask.title}?`;
  } else if (method === 3) {
    deleteTextSure.value = `Er du sikker på du vil slette alle fremtidige opgaver for ${tasks.activeTask.title}?`;
  } else if (method === 4) {
    deleteTextSure.value = `Er du sikker på du vil slette alle opgaver for ${tasks.activeTask.title}?`;
  }

  showDeleteRecurring.value = false;
  deleteMethod.value = method;
  deleteTask.value = true;
};

const earnings = computed(() => {
  return (((tasks.activeTask.economy.invoice_hours_customer / 100) * tasks.activeTask.economy.hourly_price) + tasks.activeTask.economy.fixed_price);
});

const expenses = computed(() => {
  let total = 0;

  if (tasks.activeTask.employees.length) {
    tasks.activeTask.employees.forEach((employee) => {
      if (employee.payout_type === 'hourly') {
        total += employee.payout_amount * (tasks.activeTask.economy.invoice_hours_employee / 100);
      }
    });
  }

  return total;
});

/******************************
 * Lifecycle hooks
******************************/
onMounted(() => {
  document.addEventListener('keydown', handleEscape);
  document.body.style.overflowY = 'hidden';
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflowY = '';
});
</script>
<style lang="scss" scoped>
:deep(.description) {
  p {
    @apply text-gray-700 text-[14px] font-light;
    strong {
      @apply font-bold;
    }
  }

  ol, ul {
    @apply list-decimal list-inside text-gray-700 text-[14px] ml-3 font-light;
  }

  li {
    @apply mb-1;
  }

  h1 {
    @apply text-2xl font-bold text-gray-700 mb-1;
  }

  h2 {
    @apply text-xl font-semibold text-gray-700 mb-1;
  }

  h3 {
    @apply text-lg font-semibold text-gray-700 mb-1;
  }

  a {
    @apply text-blue-600 underline hover:text-blue-700;
  }
}
</style>