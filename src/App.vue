<template>
  <template v-if="!auth.user">
    <router-view :key="$route.fullPath"/>
  </template>
  <template v-else>
    <Layout-Loading v-if="loading.loading"/>
    <Layout-TopBar />
    <ModalShow :condition="tasks.activeTask">
      <Task-Active @close="tasks.activeTask = null" />
    </ModalShow>
    <ModalShow :condition="mail.showActiveMail">
      <MailSender :title="mail.activeMail.subject" :body="mail.activeMail.body" :allRecipients="mail.activeMail.recipients" @close="mail.closeActiveMail()" />
    </ModalShow>
    <Layout-SideNavigation @hide="hide" />
    <div class="hover-transition" :class="menuIsHidden ? 'content' : 'bigger-content'">
      <router-view :key="$route.fullPath" />
    </div>
  </template>
  <transition name="modal-fade">
    <FlashMessage v-if="message.error || message.complete" :error="message.error" :complete="message.complete" @close="message.close()"/>
  </transition>
</template>
<script setup>
/******************************
 * Imports & props
******************************/
import { ref, provide, onMounted, onBeforeUnmount, onBeforeMount } from 'vue';
import { Message } from '@/store/message';
import { Loading } from '@/store/loading';
import { Auth } from '@/store/auth';
import { Mail } from '@/store/mail';
import { Company } from '@/store/company';
import { Tasks } from '@/store/tasks';

/******************************
 * Refs
******************************/
const message = Message();
const loading = Loading();
const mail = Mail();
const company = Company();
const auth = Auth();
const tasks = Tasks();
const urlSavings = ref([]);
const menuIsHidden = ref(localStorage.getItem('hide-menu') === 'true' ? true : false);

/******************************
 * Inject & provides
******************************/
provide('message', message);
provide('loading', loading)
provide('urlSavings', urlSavings.value)

/******************************
 * Lifecycle
******************************/
onBeforeMount(async () => {
  loading.load('Henter data');

  await company.init();
  await tasks.init();
  
  loading.reset();
});

/******************************
 * Methods and functions
******************************/
const reload = () => {
  if (auth.user) {
    auth.getUserRole();
    auth.getUser();
  }
}
reload();

const hide = () => {
  menuIsHidden.value = !menuIsHidden.value;
}
</script>