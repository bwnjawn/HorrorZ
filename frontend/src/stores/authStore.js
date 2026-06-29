import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    async login(username, password) {
      try {
        this.error = null;
        // Hacemos la petición a la ruta que creaste en authRoutes.js
        const response = await api.post('/auth/login', { username, password });

        // Guardamos el usuario en el estado global
        this.user = response.data.user;

        return true; // Login exitoso
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al iniciar sesión';

        return false; // Login fallido
      }
    },

    async register(username, password) {
      try {
        this.error = null;
        const response = await api.post('/auth/register', { username, password });

        this.user = response.data.user;

        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al registrarse';

        return false;
      }
    },

    logout() {
      this.user = null;
      this.error = null;
      // Opcional: Aquí podrías hacer una petición al backend para destruir la cookie
    },
  },
});
