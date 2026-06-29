import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Intentamos leer el usuario guardado, si no existe, es null
    user: JSON.parse(localStorage.getItem('horrorz_user')) || null,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(username, password) {
      try {
        this.error = null;
        const response = await api.post('/auth/login', { username, password });

        this.user = response.data.user;
        // Guardar sesión en el navegador
        localStorage.setItem('horrorz_user', JSON.stringify(this.user));

        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al iniciar sesión';

        return false;
      }
    },

    async register(username, password) {
      try {
        this.error = null;
        const response = await api.post('/auth/register', { username, password });

        this.user = response.data.user;
        // Guardar sesión en el navegador
        localStorage.setItem('horrorz_user', JSON.stringify(this.user));

        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al registrarse';

        return false;
      }
    },

    logout() {
      this.user = null;
      this.error = null;
      localStorage.removeItem('horrorz_user');
    },
  },
});
