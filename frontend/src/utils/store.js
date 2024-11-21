import { reactive } from 'vue';

export const store = reactive({

  role: localStorage.getItem('role') || 'guest',
  username: localStorage.getItem('username') || '',

  setUser(newUser) {
    this.username = newUser.username;
    this.role = newUser.role;
    localStorage.setItem('username', newUser.username);
    localStorage.setItem('role', newUser.role);
  },

  clearUser() {
    this.username = '';
    this.role = 'guest';
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }
});