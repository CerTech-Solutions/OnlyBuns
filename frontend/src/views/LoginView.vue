<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="6">
        <v-card variant="text">
          <v-card-title class="headline">Login</v-card-title>
          <v-spacer></v-spacer>
          <v-card-text>
            <v-form v-model="valid">
              <v-text-field
                label="Email *"
                v-model="email"
                prepend-icon="mdi-email"
                type="email"
                :rules="emailRules"
                required
              ></v-text-field>
              <br>
              <v-text-field
                label="Password *"
                v-model="password"
                prepend-icon="mdi-lock"
                type="password"
                :rules="passwordRules"
                required
              ></v-text-field>
              <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" @click="signUp">Sign Up</v-btn>
            <v-btn variant="elevated" color="primary" @click="login" :disabled="!valid">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from '@/utils/axiosInstance';
import { store } from '@/utils/store';

export default {
  data() {
    return {
      valid: false,
      email: '',
      emailRules: [
        v => !!v,
      ],
      password: '',
      passwordRules: [
        v => !!v,
      ],
      errorMessage: ''
    };
  },
  methods: {
    login() {
      if (!this.valid) {
        return;
      }

      axios.post('/user/login', {
        email: this.email,
        password: this.password
      })
      .then(response => {
        store.setUser({
          username: response.data.username,
          role: response.data.role
        });
        this.$router.push("/");
      })
      .catch(error => {
        this.errorMessage = error.response.data.errors[0].message;
      });
    },
    signUp() {
      this.$router.push("/signup");
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