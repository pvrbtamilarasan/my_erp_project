// frontend/src/main.jsx (Corrected)

import React from 'react';
import ReactDOM from 'react-dom/client'; // <-- *** THIS IMPORT WAS MISSING ***
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Get the root DOM element
const rootElement = document.getElementById('root');

// Ensure the root element exists before trying to render
if (rootElement) {
  // Create the React root
  const root = ReactDOM.createRoot(rootElement);

  // Render the application
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element with ID 'root'. Make sure it exists in your index.html.");
}