import { defineStore } from 'pinia';
import { ref } from "vue";

export const Mail = defineStore('mail', () => {
  const activeMail = ref({});
  const showActiveMail = ref(false);

  const setActiveMail = (mail) => {
    activeMail.value = mail;
    showActiveMail.value = true;
  }

  const closeActiveMail = () => {
    showActiveMail.value = false;
    activeMail.value = {};
  }

  return { activeMail, showActiveMail, setActiveMail, closeActiveMail }
});