import { defineStore } from 'pinia';
import { axiosClient } from "@/lib/axiosClient";

export const Auth = defineStore('auth', {
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    user: JSON.parse(localStorage.getItem('user')),
    token: localStorage.getItem('token'),
    userRole: null,
  }),
  actions: {
    login(token, user) {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(user));
      this.token = token;
      this.user = user;

      if (user.role === 'employee') {
        return window.location.href = '/employee/dashboard';
      }

      window.location.href = '/dashboard';
    },
    logout() {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
      this.token = null;
      this.user = null;
      this.userRole = null;
      window.location.href = '/login';
    },
    async getUserRole() {
      await axiosClient.get('user/role').then((response) => {
        if (response.role) {
          this.userRole = response.role;
        }
      }).catch((e) => { });
    },
    check() {
      return !!this.token;
    },
    async getUser() {
      await axiosClient.get('user').then((response) => {
        this.user = response.user;
        window.localStorage.setItem('user', JSON.stringify(this.user));
      }).catch((e) => { });
    },
    setNewToken(token) {
      this.token = token;
      window.localStorage.setItem('token', token);
    }
  }
});