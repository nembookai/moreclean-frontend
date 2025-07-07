<template>
<div></div>
</template>
<script setup>
import { onMounted } from "vue";
import { axiosClient } from "@/lib/axiosClient";
import { Auth } from "@/store/auth";

const auth = Auth();

onMounted(async () => {
  if(auth.check()) {
    await axiosClient.post("/logout").catch((e) => {
      auth.logout();
    });
    auth.logout();
    window.location.href = "/login";
  } else {
    auth.logout();
    window.location.href = "/login";
  }
});
</script>