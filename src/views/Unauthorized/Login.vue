<template>
  <div>
    <div class="flex items-center justify-center min-h-screen">
      <div class="w-10/12 md:w-[1000px] p-5 sm:p-10 md:p-2 bg-white from-gray-700/50 via-transparent rounded-lg mt-2 shadow-2xl shadow-gray-500/20 md:grid grid-cols-2">
        <div class="md:block hidden">
          <div class="bg-primary-500 from-primary-600 bg-gradient-to-t flex flex-col items-center justify-center w-full h-[550px] rounded-lg">
            <img src="img/cleaning_login.svg" class="w-[400px] opacity-75 block" />
          </div>
        </div>
        <div class="md:px-[50px] h-full flex flex-col justify-center">
          <img src="img/brand/nembookingai_logo.png" class="w-[200px] mb-5" />
          <div class="text-[20px] font-semibold text-gray-700 mb-1">Log ind</div>
          <form @submit.prevent="login">
            <div class="text-gray-700 text-[14.5px]">E-mail adresse</div>
            <input type="text" autocomplete="none" class="input input__primary mt-[2px]" :class="{ 'input__error': error.email }" v-model="email" />
            <div class="text-gray-700 text-[14.5px] mt-3">Adgangskode</div>
            <input type="password" autocomplete="none" class="input input__primary mt-[2px]" :class="{ 'input__error': error.password }" v-model="password" />
            <div class="flex items-center justify-center mt-5">
              <button :disabled="loading" class="bg-primary-500 w-full py-2.5 group flex items-center justify-center gap-x-2 font-medium hover-transition hover:bg-primary-600 active:bg-primary-700 rounded-md text-white" @click="login">
                <template v-if="!loading">
                  <PhLock :size="25" class="group-hover:hidden" />
                  <PhLockOpen :size="25" class="group-hover:block hidden" />
                  Log på
                </template>
                <template v-else>
                  Logger ind...
                </template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref } from 'vue';
import { PhLock, PhLockOpen } from "@phosphor-icons/vue";
import { axiosClient } from '@/lib/axiosClient';
import { Auth } from "@/store/auth";

/******************************
 * Refs & consts
******************************/
const email = ref(null);
const password = ref(null);
const error = ref({});
const loading = ref(false);
const auth = Auth();

/******************************
 * Methods
******************************/
const login = async () => {
  error.value = {};
  loading.value = true;

  if (!password.value) {
    error.value.password = true;
    loading.value = false;
    return;
  }

  if (!email.value) {
    error.value.email = true;
    loading.value = false;
    return;
  }

  await axiosClient.post('login', {
    email: email.value,
    password: password.value,
  }).then((response) => {
    if (response.response_status?.code === 200) {        
      auth.login(response?.token?.access_token, response?.user);
    }
  }).catch((e) => { 
    error.value.email = true;
    error.value.password = true;
  });

  loading.value = false;
}
</script>