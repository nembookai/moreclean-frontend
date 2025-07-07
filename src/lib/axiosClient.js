import axios from 'axios';
import { Message } from '../store/message';
import { Loading } from '../store/loading';
import { Auth } from '../store/auth';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

axiosClient.error = null;
axiosClient.success = null;
let message = null;
let auth = null;
let loading = null;

axiosClient.interceptors.request.use(
  (config) => {
    auth = Auth();

    if (auth?.token) {
      config.headers['Authorization'] = `Bearer ${auth.token}`;
    }

    return config;
  },
);

axiosClient.interceptors.response.use(
  function (response) {
    auth = Auth();

    if (response.headers.getAuthorization()) {
      auth.setNewToken(response.headers.getAuthorization());
    }
    
    axiosClient.success = response?.data?.response_status?.message;
    return response?.data;
  }, 
  function (error) {
    message = Message();
    loading = Loading();
    auth = Auth();
    axiosClient.error = error?.response?.data?.response_status?.message;

    if (error?.response?.data?.force_logout && error?.status === 401) {
      auth.logout();
    }

    if (error?.response?.data?.force_dashboard && error?.status === 401) {
      window.location.href = '/not-found';
    }

    if (error.status === 429) {
      auth.logout();
    }

    if (error.status !== 401 && error.status !== 429) {
      message.showError(axiosClient.error || 'Der opstod en fejl, kontakt venligst support!');
      loading.reset();
      loading.fail(axiosClient.error || 'Der opstod en fejl, kontakt venligst support!');
    }
    
    return Promise.reject(error?.response?.data);
  }
);

export { axiosClient };