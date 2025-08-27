<template>
  <div class="bg-white flex items-center justify-between border border-gray-100 shadow-sm p-2 rounded-lg">
    <div class="flex items-center">
      <div class="bg-primary-500 rounded-lg p-1.5 w-[40px] md:w-[50px] shadow-sm">
        <img src="@/assets/images/brand/nembookingai_icon_white.png" class="w-full" />
      </div>
    </div>
    <div class="flex items-center gap-x-2">
      <div class="bg-gray-100 px-4 rounded-lg py-1 text-[15px] text-gray-700 font-light flex items-center gap-x-1">
        <PhUser :size="16" weight="regular" class="text-gray-700" />
        {{ auth?.user?.name }}
      </div>
      <RouterLink class="bg-gray-100 px-2 rounded-lg py-[7px] text-red-500 hover:bg-red-500 hover:text-white hover-transition font-light flex items-center gap-x-1 cursor-pointer" :to="{ name: 'logout' }">
        <PhSignOut :size="16" weight="regular" />
      </RouterLink>
    </div>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref } from 'vue';
import { Auth } from '@/store/auth';
import { PhDoor, PhSignOut, PhUser } from '@phosphor-icons/vue';
import { RouterLink } from 'vue-router';

/******************************
 * Refs
******************************/
const auth = Auth();
</script>