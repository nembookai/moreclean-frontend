<template>
  <Modal @close="$emit('close')" modalWidth="w-[600px]">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900">{{ isEditing ? 'Rediger login for' : 'Opret login til' }} {{ employee.name }}</div>
    </template>
    <template #content>
      <div class="p-2">
        <div>
          <label class="text-gray-600 text-[13px]">E-mail <span class="text-red-500">*</span></label>
          <input type="email" id="email" v-model="email" class="input !mt-0.5" autocomplete="new-password" placeholder="Tilføj e-mail" />
        </div>
        <div class="mt-5">
          <label class="text-gray-600 text-[13px]">Adgangskode <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-x-2">
            <input :type="passwordVisible ? 'text' : 'password'" id="password" v-model="password" class="input !mt-0.5" autocomplete="new-password" placeholder="Tilføj password" />
            <button type="button" class="btn btn__lightgray px-2 py-2 !mt-0.5 !h-[40px] text-xs" @click="generatePassword" title="Generer password">Generer</button>
          </div>
        </div>
        <div class="mt-5" v-if="!isEditing">
          <LayoutComponents-Toggle v-model="sendMail" text="Send e-mail med brugeroplysninger" small />
        </div>
        <div class="mt-10">
          <button class="btn btn__green" @click="saveUserLogin" :disabled="loading">
            <span v-if="loading">{{ isEditing ? 'Opdaterer...' : 'Opretter...' }}</span>
            <span v-else>{{ isEditing ? 'Opdater login' : 'Opret login' }}</span>
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
import { axiosClient } from '@/lib/axiosClient';
import { ref, inject, computed } from 'vue';
const props = defineProps(['employee']);

/*******************************
* Refs & variables
******************************/
const isEditing = computed(() => !!props.employee?.user);
const email = ref(props.employee?.user?.email || props.employee.email);
const password = ref('');
const sendMail = ref(false);
const passwordVisible = ref(false);
const message = inject('message');
const loading = ref(false);
const emit = defineEmits(['addUserLogin', 'close']);

/*******************************
* Lifecycle hooks
******************************/

/*******************************
* Methods & computed
******************************/
function generatePassword() {
  password.value = Math.random().toString(36).substring(2, 12);
  passwordVisible.value = true;
}

async function saveUserLogin() {
  if (!email.value || (!isEditing.value && !password.value)) {
    message.showError('Du skal udfylde alle felter');
    return;
  }

  loading.value = true;

  const payload = {
    email: email.value,
    employee_id: props.employee.id,
    send_mail: sendMail.value,
  };

  if (password.value) {
    payload.password = password.value;
  }

  if (isEditing.value) {
    await axiosClient.put(`employees/user/${props.employee.user.id}`, payload).then((response) => {
      message.showComplete('Login opdateret');
      emit('addUserLogin', response.user);
    }).catch((e) => { });
  } else {
    await axiosClient.post('employees/user', payload).then((response) => {
      message.showComplete('Login oprettet');
      emit('addUserLogin', response.user);
    }).catch((e) => { });
  }

  loading.value = false;
}
</script>