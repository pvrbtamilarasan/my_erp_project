// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, Navigate, Outlet } from 'react-router-dom';
import LoginForm from './components/LoginForm';
// We will create these page components next
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import NotFoundPage from './pages/NotFoundPage'; // Optional: for handling bad URLs
import './App.css';

// --- Protected Route Component ---
// Checks if user is authenticated, otherwise redirects to login
function ProtectedRoute({ isAuthenticated, children }) {
    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after login. (Optional)
        // You might want to use useLocation here if needed.
        return <Navigate to="/login" replace />;
    }
    // If authenticated, render the child components (Outlet or specific component)
    return children ? children : <Outlet />;
}

// --- Main App Component ---
function App() {
    // Keep auth state management here
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('authToken'));

    const handleLoginSuccess = (loginData) => {
        const token = loginData?.key;
        if (token) {
            localStorage.setItem('authToken', token);
            setAuthToken(token);
            setIsAuthenticated(true);
        } else {
            console.error("Login response did not contain key:", loginData);
        }
    };

    const handleLogout = () => {
        // TODO: Call backend logout endpoint if implemented in api.js
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setIsAuthenticated(false);
        // Optionally navigate to login page after logout
        // navigate('/login'); // Requires useNavigate hook if used here
    };

    // Effect to potentially verify token validity on load (optional advanced step)
    // useEffect(() => { ... }, []);

    return (
        <div className="App">
            {/* Define application routes */}
            <Routes>
                {/* Public Route: Login Page */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/employees" replace /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
                />

                {/* Protected Routes Wrapper */}
                <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
                    {/* Default route for authenticated users */}
                    <Route path="/" element={<Navigate to="/employees" replace />} />
                    {/* Employee List Page */}
                    <Route path="/employees" element={<EmployeeListPage onLogout={handleLogout} />} />
                    {/* Employee Detail Page */}
                    <Route path="/employees/:employeeId" element={<EmployeeDetailPage onLogout={handleLogout} />} />
                    {/* Add other protected routes here later */}
                </Route>

                {/* Optional: Catch-all route for 404 Not Found */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

export default App;