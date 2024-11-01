<template>
  <v-app>
    <AppNavbar/>

    <v-main>
      <RouterView :key="$route.fullPath"/>
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script setup>
import { RouterView } from 'vue-router';

</script>
