import { defineStore } from 'pinia';
import { ref } from "vue";

export const Loading = defineStore('loading', () => {
  const loading = ref(false);
  const title = ref('Henter data');
  const message = ref('Vent venligst');
  const error = ref(null);

  const load = (setTitle = null, setMessage = null) => {
    loading.value = true;
    
    if (setTitle) {
      title.value = setTitle;
    }

    if (setMessage) {
      message.value = setMessage;
    }
  }

  const reset = () => {
    loading.value = false;
    title.value = 'Henter data';
    message.value = 'Vent venligst';
  }

  const fail = (msg) => {
    reset();
    error.value = msg;
  }

  return { loading, title, message, fail, load, reset, error }
});