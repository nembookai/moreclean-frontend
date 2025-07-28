<template>
  <div>
    <Modal @close="$emit('close')">
    <template #header>
      <div class="text-[19px] font-normal text-primary-900">{{ title }}</div>
    </template>
    <template #content>
      <div>
        <div class="mb-4" v-if="showSubject">
          <label class="text-gray-600 text-[14px]">Emne på mail</label>
          <input type="text" v-model="mail.subject" class="input !mt-0" />
        </div>
        <div class="mb-4">
          <label class="text-gray-600 text-[14px]">Mail til</label>
          <MailInput @mails="(mails) => mail.recipients = mails" :prefill="mail.recipients" />
        </div>
        <div class="mb-4">
          <label class="text-gray-600 text-[14px]">Besked</label>
          <QuillEditor theme="snow" contentType="html" v-model:content="mail.body" />
        </div>
        <div class="flex justify-end">
          <button class="btn btn__green" @click="sendMail" :disabled="loading">
            <PhSpinner class="animate-spin" v-if="loading" />
            <span v-if="!loading">Send e-mail</span>
            <span v-else>Sender e-mail...</span>
            <PhArrowRight v-if="!loading" />
          </button>
        </div>
      </div>
    </template>
  </Modal>
  </div>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref, inject } from 'vue';
import { PhArrowRight, PhSpinner } from '@phosphor-icons/vue';
import { axiosClient } from '@/lib/axiosClient';

const props = defineProps({
  title: {
    type: String,
    default: 'Send mail'
  },
  showSubject: {
    type: Boolean,
    default: true
  },
  allRecipients: {
    type: Array,
    default: []
  },
  subject: {
    type: String,
    default: ''
  },
  body: {
    type: String,
    default: ''
  },
  template: {
    type: String,
    default: null
  }
});

/******************************
 * Refs & conts
******************************/
const message = inject('message');
const mail = ref({
  recipients: props.allRecipients,
  subject: props.subject,
  body: props.body
});
const loading = ref(false);
const emit = defineEmits(['close']);

/******************************
 * Methods
******************************/
const sendMail = async () => {
  if (mail.value.recipients.length === 0) {
    message.showError('Du skal vælge mindst én modtager');
    return;
  }

  if (!mail.value.subject) {
    message.showError('Du skal skrive et emne');
    return;
  }

  if (!mail.value.body) {
    message.showError('Du skal skrive en besked');
    return;
  }

  loading.value = true;

  await axiosClient.post('mail', {
    subject: mail.value.subject,
    body: mail.value.body,
    recipients: mail.value.recipients,
    template: props.template
  }).then((response) => {
    message.showComplete('Mail sendt');
    emit('close');
  }).catch((e) => { });

  loading.value = false;
};
</script>
<style scoped>
:deep(.ql-editor) {
  @apply bg-white h-[200px];
}
</style>