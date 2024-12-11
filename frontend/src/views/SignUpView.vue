<template>
  <v-container>
    <v-row justify="center">
      <v-col lg="6">
        <v-card variant="text">
          <v-card-title class="headline">{{ title }}</v-card-title>
          <v-spacer></v-spacer>
          <v-card-text>
            <v-form v-model="valid">
              <v-text-field
                label="Name *"
                v-model="name"
                prepend-icon="mdi-account"
                :rules="nameRules"
                required
              ></v-text-field>
              <br>
              <v-text-field
                label="Surname *"
                v-model="surname"
                prepend-icon="mdi-transparent"
                :rules="surnameRules"
                required
              ></v-text-field>
              <br>
              <v-text-field
                label="Username *"
                v-model="username"
                prepend-icon="mdi-transparent"
                :rules="usernameRules"
                required
              ></v-text-field>
              <br>
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
              <br>
              <v-text-field
                label="Confirm password *"
                v-model="confirmPassword"
                prepend-icon="mdi-transparent"
                type="password"
                :rules="confirmPasswordRules"
                required
              ></v-text-field>
              <br>
              <v-btn prepend-icon="mdi-home" @click="openMapDialog">Select address from Map</v-btn>
              <AddressDialog ref="AddressDialog" @address-selected="updateAddress"/>
              <v-text-field
                v-model="address"
                :rules="addressRules"
                style="display: none;"
              ></v-text-field>
              <br>
              <v-alert v-if="errorMessage" type="error">{{ errorMessage }}</v-alert>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="elevated" color="primary" size="large" @click="signUp" :disabled="!valid">Sign Up</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
		<v-snackbar v-model="snackbar" :timeout="snackbarTimeout" color="success">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from '@/utils/axiosInstance';
import { store } from '@/utils/store';
import AddressDialog from '@/components/AddressDialog.vue';

export default {
  components: {
    AddressDialog
  },
  computed: {
    store() {
      return store;
    }
  },
  data() {
    return {
      title: 'OnlyBuns account sign up 🐰',
      valid: false,
			snackbar: false,
			snackbarMessage: '',
			snackbarTimeout: 2500,
      name: '',
      nameRules: [
        v => !!v || 'Name is required',
      ],
      surname: '',
      surnameRules: [
        v => !!v || 'Surname is required',
      ],
      username: '',
      usernameRules: [
        v => !!v || 'Username is required',
        v => v.length >= 6 || 'Username must be at least 6 characters',
      ],
      email: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
      password: '',
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 6 || 'Password must be at least 6 characters',
      ],
      confirmPassword: '',
      confirmPasswordRules: [
        v => !!v || 'Confirm password is required',
        v => v === this.password || 'Passwords must match',
      ],
      address: null,
      addressRules: [
        v => !!v || 'Address is required',
      ],
      errorMessage: ''
    };
  },
  mounted() {
    if (store.role === 'admin') {
      this.title = 'Admin registration';
    }
  },
  methods: {
    signUp() {
      let endpoint = '/user/register';
      if(store.role === 'admin') {
        endpoint = '/user/register/admin';
      }

      axios.post(endpoint, {
        name: this.name,
        surname: this.surname,
        username: this.username,
        email: this.email,
        password: this.password,
        address: this.address
      })
      .then(response => {
				this.snackbarMessage = 'Account successfully created! Confirmation email sent.';
				this.snackbar = true;
				this.resetForm();
        setTimeout(() => {
					this.$router.push("/login");
				}, this.snackbarTimeout);
      })
      .catch(error => {
        this.errorMessage = error.response.data.errors[0].message;
      });
    },
		resetForm() {
      this.name = '';
      this.surname = '';
			this.username = '';
			this.email = '';
			this.password = '';
			this.confirmPassword = '';
			this.address = '';
			this.errorMessage = '';
			this.valid = false;
		},
    openMapDialog() {
      this.$refs.AddressDialog.dialog = true;
    },
    updateAddress(address) {
      this.address = address;
    }
  }
};
</script>

<style scoped>
.v-container {
  margin-top: 2vh;
}

.v-card {
  padding: 3%;
}
</style>