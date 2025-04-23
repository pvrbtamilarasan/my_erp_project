// frontend/src/App.jsx (Corrected Route Order)

import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, Navigate, Outlet, useLocation } from 'react-router-dom'; // Import useLocation if needed for redirect state
import LoginForm from './components/LoginForm';
// Import page components
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

// --- Protected Route Component ---
function ProtectedRoute({ isAuthenticated, children }) {
    let location = useLocation(); // Optional: Get current location

    if (!isAuthenticated) {
        // Redirect to login, optionally passing the intended destination
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // Render the component requested by the route
    return children ? children : <Outlet />; // Outlet renders nested routes
}

// --- Main App Component ---
function App() {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('authToken'));

    const handleLoginSuccess = (loginData) => {
        const token = loginData?.key;
        if (token) {
            localStorage.setItem('authToken', token);
            setAuthToken(token);
            setIsAuthenticated(true);
        } else { console.error("Login response did not contain key:", loginData); }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setIsAuthenticated(false);
        // No need for explicit navigate('/login') here, ProtectedRoute handles it
    };

    return (
        <div className="App">
            <Routes>
                {/* Public Route: Login Page */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/employees" replace /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
                />

                {/* Protected Routes Wrapper */}
                {/* Any route inside here requires isAuthenticated to be true */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                    {/* Default route redirects to employee list */}
                    <Route path="/" element={<Navigate to="/employees" replace />} />

                    {/* --- CORRECTED ORDER --- */}
                    {/* Employee Detail Page (More specific, needs to come first) */}
                    <Route path="/employees/:employeeId" element={<EmployeeDetailPage onLogout={handleLogout} />} />
                    {/* Employee List Page */}
                    <Route path="/employees" element={<EmployeeListPage onLogout={handleLogout} />} />
                    {/* ----------------------- */}

                    {/* Add other protected routes like Dashboard, Settings etc. here */}
                    {/* Example: <Route path="/dashboard" element={<DashboardPage />} /> */}
                </Route>

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

export default App;