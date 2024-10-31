<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="3">
        <v-card>
          <v-card-title class="headline">Login</v-card-title>
          <v-spacer></v-spacer>
          <v-card-text>
            <v-form>
              <v-text-field
                label="Email"
                v-model="email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                label="Password"
                v-model="password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="plain" @click="signUp">Sign Up</v-btn>
            <v-btn variant="elevated" color="primary" @click="login">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { errorMessages } from 'vue/compiler-sfc';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    login() {

    },
    signUp() {

    }
  }
};
</script>

<style scoped>

.v-container {
  margin-top: 10vh;
}

.v-card {
  padding: 3%;
}

</style>