// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Base URL for Django backend

// Create an Axios instance. Remove default JSON Content-Type for FormData compatibility.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // headers: { 'Content-Type': 'application/json', }, // Removed default
});

// Add a request interceptor to include the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    // Let Axios set Content-Type based on data
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fetches the list of employees from the API using the configured apiClient.
 */
export const getEmployees = async () => {
  try {
    const response = await apiClient.get('/api/ems/employees/');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error.response?.data || error.message);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error fetching employees.');
    }
    throw error;
  }
};

/**
 * Logs in a user via the API. Uses direct axios call, not apiClient.
 */
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, {
      username: username,
      password: password,
    });
    return response.data; // Should contain { key: '...' }
  } catch (error) {
    console.error('Error during login:', error.response?.data || error.message);
    if (error.response && error.response.status === 400) {
      throw new Error('Invalid username or password.');
    }
    throw new Error('Login failed. Please try again later.');
  }
};

/**
 * Creates a new employee via the API using FormData.
 */
export const createEmployee = async (employeeFormData) => { // Expects FormData
  try {
    const response = await apiClient.post('/api/ems/employees/', employeeFormData);
    return response.data;
  } catch (error) {
    console.error('Error creating employee:', error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Failed to create employee: ${errorDetail}`);
  }
};

/**
 * Deletes an employee via the API.
 */
export const deleteEmployee = async (employeeId) => {
  try {
    await apiClient.delete(`/api/ems/employees/${employeeId}/`);
  } catch (error) {
    console.error(`Error deleting employee ${employeeId}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Failed to delete employee: ${errorDetail}`);
  }
};

/**
 * Updates an existing employee via the API using PATCH with FormData.
 */
export const updateEmployee = async (employeeId, employeeFormData) => { // Expects FormData
  try {
    const response = await apiClient.patch(`/api/ems/employees/${employeeId}/`, employeeFormData);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee ${employeeId}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    throw new Error(`Failed to update employee: ${errorDetail}`);
  }
};

/**
 * Fetches a single employee by their ID from the API.
 */
export const getEmployeeById = async (employeeId) => {
  try {
    const response = await apiClient.get(`/api/ems/employees/${employeeId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${employeeId}:`, error.response?.data || error.message);
    const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    if (error.response && error.response.status === 404) {
        throw new Error(`Employee with ID ${employeeId} not found.`);
    }
    throw new Error(`Failed to fetch employee details: ${errorDetail}`);
  }
};

// TODO: Add logoutUser API call function...