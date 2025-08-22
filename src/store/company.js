import { defineStore } from 'pinia';
import { ref } from "vue";
import { axiosClient } from '@/lib/axiosClient';

export const Company = defineStore('company', () => {
  const customers = ref([]);
  const lastCustomerNumber = ref(0);
  const employees = ref([]);
  const products = ref([]);
  const areas = ref([]);
  const companies = ref([]);
  const activeCompany = ref({});
  const loading = ref({
    customers: true,
    employees: true,
    products: true,
    companies: true,
    areas: true
  });

  async function getCompanies() {
    await axiosClient.get('company').then((response) => {
      if (response?.companies) {
        companies.value = response.companies;
      }

      if (response?.owner && response?.companies?.length > 0) {
        companies.value.unshift({ id: response.owner.id, name: response.owner.name, cvr: response.owner.cvr });
      }

      if (response?.active) {
        activeCompany.value = response.active;
      }
    }).catch((e) => { });

    loading.value.companies = false;
  }

  async function getCustomers() {
    await axiosClient.get('customers?per_page=100000').then((response) => {
      lastCustomerNumber.value = response.lastCustomerNumber
      customers.value = response.pageData?.data || [];
    }).catch((e) => { });
  
    loading.value.customers = false;
  }

  async function getEmployees() {
    await axiosClient.get('employees?per_page=100000').then((response) => {
      employees.value = response.pageData?.data || [];
    }).catch((e) => { });

    loading.value.employees = false;
  }

  async function getProducts() {
    await axiosClient.get('products?per_page=100000').then((response) => {
      products.value = response.pageData?.data || [];
    }).catch((e) => { });

    loading.value.products = false;
  }

  async function getAreas() {
    await axiosClient.get('settings?type=areas').then((response) => {
      areas.value = response.settings.find(s => s.key === 'areas')?.value || [];
    }).catch((e) => { });

    loading.value.areas = false;
  }

  async function init() {
    await getCompanies();
    await getCustomers();
    await getEmployees();
    await getProducts();
    await getAreas();
  }

  function addToLastCustomerNumber() {
    lastCustomerNumber.value += 1;
  }

  return { customers, lastCustomerNumber, employees, products, areas, loading, init, addToLastCustomerNumber, getCustomers, getEmployees, getProducts, getAreas, companies, activeCompany }
});