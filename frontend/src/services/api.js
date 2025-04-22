// frontend/src/services/api.js (Ensure getDepartments is defined here)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Base URL for Django backend

// Axios instance for API calls, interceptor adds auth token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // No default Content-Type, let Axios handle it based on data (FormData vs JSON)
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Authentication ---
export const loginUser = async (username, password) => {
  try {
    // Use direct axios call for login if it needs standard JSON Content-Type
    const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, { username, password });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
    if (error.response && error.response.status === 400) { throw new Error('Invalid username or password.'); }
    throw new Error('Login failed. Please try again later.');
  }
};

// --- Employees ---
export const getEmployees = async () => {
  try {
    const response = await apiClient.get('/api/ems/employees/');
    return response.data;
  } catch (error) { /* ... error handling ... */ throw error; }
};

export const getEmployeeById = async (employeeId) => {
  try {
    const response = await apiClient.get(`/api/ems/employees/${employeeId}/`);
    return response.data;
  } catch (error) { /* ... error handling ... */ throw error; }
};

export const createEmployee = async (employeeFormData) => { // Expects FormData
  try {
    const response = await apiClient.post('/api/ems/employees/', employeeFormData);
    return response.data;
  } catch (error) { /* ... error handling ... */ throw new Error(`Failed to create employee: ${JSON.stringify(error.response?.data)}`); }
};

export const updateEmployee = async (employeeId, employeeFormData) => { // Expects FormData
  try {
    const response = await apiClient.patch(`/api/ems/employees/${employeeId}/`, employeeFormData);
    return response.data;
  } catch (error) { /* ... error handling ... */ throw new Error(`Failed to update employee: ${JSON.stringify(error.response?.data)}`); }
};

export const deleteEmployee = async (employeeId) => {
  try {
    await apiClient.delete(`/api/ems/employees/${employeeId}/`);
  } catch (error) { /* ... error handling ... */ throw error; }
};

// --- Departments ---
export const getDepartments = async () => { // <-- Make sure this function exists
  try {
    const response = await apiClient.get('/api/ems/departments/');
    return response.data;
  } catch (error) {
    console.error('Error fetching departments:', error.response?.data || error.message);
    throw error; // Re-throw error to be handled by the component
  }
};