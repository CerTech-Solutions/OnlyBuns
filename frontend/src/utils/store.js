import { reactive } from 'vue';

export const store = reactive({
  role: localStorage.getItem('role') || 'guest',
  setRole(newRole) {
    this.role = newRole;
    localStorage.setItem('role', newRole);
  }
});