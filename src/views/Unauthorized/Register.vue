<template>
  <div>
    <div class="relative sm:flex sm:justify-center sm:items-center min-h-screen">
      <div class="w-10/12 sm:w-[450px]">
        <div class="mt-10 sm:mt-0 flex items-end justify-between">
          <img class="w-[120px]" src="img/brand/moreclean_logo.png" alt="logo" />
          <div class="text-[25px] font-semibold text-gray-700">Tilmeld dig</div>
        </div>
        <div class="px-6 py-4 bg-white from-gray-700/50 via-transparent rounded-lg mt-2 shadow-2xl shadow-gray-500/20">
          <div class="bg-red-400 text-white p-2 text-sm font-medium mb-5 rounded-md" v-if="error.message">{{ error.message }}</div>
          <form @submit.prevent="login">
            <div class="text-gray-700 text-[14.5px]">Fuldenavn</div>
            <input type="text" autocomplete="one-time-code" placeholder="Fuldenavn" class="input input__primary mt-[2px]" :class="{ 'input__error': error.name }" v-model="newUser.name" />
            <div class="text-gray-700 text-[14.5px] mt-3">E-mail adresse</div>
            <input type="text" autocomplete="one-time-code" placeholder="E-mail adresse" class="input input__primary mt-[2px]" :class="{ 'input__error': error.email }" v-model="newUser.email" />
            <div class="text-gray-700 text-[14.5px] mt-3">Telefon nummer</div>
            <input type="text" autocomplete="one-time-code" placeholder="Telefon nummer" class="input input__primary mt-[2px]" :class="{ 'input__error': error.phone }" v-model="newUser.phone" />
            <div class="text-gray-700 text-[14.5px] mt-3">Firma navn</div>
            <input type="text" autocomplete="one-time-code" placeholder="Firma navn" class="input input__primary mt-[2px]" :class="{ 'input__error': error.company }" v-model="newUser.company" />
            <div class="grid grid-cols-2 gap-x-3 mt-4">
              <div>
                <div class="text-gray-700 text-[14.5px]">Adgangskode</div>
                <input type="password" autocomplete="one-time-code" placeholder="Adgangskode" class="input input__primary mt-[2px]" :class="{ 'input__error': error.password }" v-model="newUser.password" />
              </div>
              <div>
                <div class="text-gray-700 text-[14.5px]">Gentag adgangskode</div>
                <input type="password" autocomplete="one-time-code" placeholder="Gentag adgangskode" class="input input__primary mt-[2px]" :class="{ 'input__error': error.password_confirmation }" v-model="newUser.password_confirmation" />
              </div>
            </div>
            <div class="flex items-center justify-center mt-10">
              <button :disabled="loading" class="bg-primary-500 w-full py-2.5 group flex items-center justify-center gap-x-2 font-medium hover-transition hover:bg-primary-600 active:bg-primary-700 rounded-md text-white" @click="login">
                <template v-if="!loading">
                  <PhUserPlus :size="25" />
                  Opret konto
                </template>
                <template v-else>
                  Opretter konto...
                </template>
              </button>
            </div>
          </form>
          <div class="flex items-center justify-center">
            <RouterLink to="/login" class="text-primary-500 inline-block mx-center hover:text-primary-600 hover:underline text-[15px] underline text-center mt-5 cursor-pointer">Allerede bruger? Log ind</RouterLink>
          </div>
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
import { PhUserPlus } from "@phosphor-icons/vue";
import { axiosClient } from '@/lib/axiosClient';
import { Auth } from "@/store/auth";

/******************************
 * Refs & consts
******************************/
const newUser = ref({});
const error = ref({});
const loading = ref(false);
const auth = Auth();

/******************************
 * Methods
******************************/
const login = async () => {
  error.value = {};
  loading.value = true;

  if (!newUser.value.name) {
    error.value.name = true;
    loading.value = false;
    return;
  }

  if (!newUser.value.email) {
    error.value.email = true;
    loading.value = false;
    return;
  }

  if (!newUser.value.phone) {
    error.value.phone = true;
    loading.value = false;
    return;
  }

  if (!newUser.value.company) {
    error.value.company = true;
    loading.value = false;
    return;
  }

  if (!newUser.value.password) {
    error.value.password = true;
    loading.value = false;
    return;
  }

  if (newUser.value.password !== newUser.value.password_confirmation) {
    error.value.password = true;
    error.value.password_confirmation = true;
    loading.value = false;
    error.value.message = 'Adgangskoderne er ikke ens';
    return;
  }

  await axiosClient.post('register', {
    name: newUser.value.name,
    email: newUser.value.email,
    phone: newUser.value.phone,
    password: newUser.value.password,
    password_confirmation: newUser.value.password_confirmation,
    company: newUser.value.company,
  }).then((response) => {
    auth.login(response?.access_token, response?.user);
  }).catch((e) => { });

  loading.value = false;
}
</script>