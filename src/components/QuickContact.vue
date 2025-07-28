<template>
  <span v-if="type === 'mail' && (customer.contact_person_email || customer.email)"><PhEnvelope :size="20" weight="regular" class="text-gray-500 mt-[2px] bg-gray-200 rounded-full p-0.5 hover:bg-gray-300 hover-transition cursor-pointer" @click="mail.setActiveMail({ recipients: [customer?.contact_person_email || customer?.email] })" /></span>
  <span v-if="type === 'phone' && (customer.contact_person_phone || customer.phone)" class="relative group">
    <PhPhone :size="20" weight="regular" class="text-gray-500 mt-[2px] bg-gray-200 rounded-full p-0.5 hover:bg-gray-300 hover-transition" />
    <div class="absolute bottom-[-15px] text-nowrap left-1/2 -translate-x-1/2 -translate-y-1/2 !text-[10px] py-[1px] px-1.5 rounded-full bg-gray-700 text-white scale-0 hover-transition group-hover:scale-[85%] hover-transition">{{ customer.contact_person_phone || customer.phone }}</div>
  </span>
</template>
<script setup>
/*******************************
 * Imports & props
******************************/
import { PhEnvelope, PhPhone } from '@phosphor-icons/vue';
import { Mail } from '@/store/mail';
const props = defineProps(['type', 'customer']);

/******************************
 * Refs & consts
******************************/
const mail = Mail();
</script>