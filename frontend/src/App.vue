<template>
  <v-app>
    <AppNavbar/>

    <v-main>
      <RouterView :key="$route.fullPath"/>
    </v-main>

  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router';

</script>

<style>
html, body {
    overflow-y: auto;
    scrollbar-width: thin;
}

body::-webkit-scrollbar {
    width: 0;
}
</style>
