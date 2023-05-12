<script setup>
import { RouterLink, RouterView } from "vue-router";
import AppNavbar from "./components/AppNavbar.vue";
</script>

<template>
  <header>
    <div class="wrapper">
      <AppNavbar />
    </div>
  </header>

  <RouterView />
</template>
