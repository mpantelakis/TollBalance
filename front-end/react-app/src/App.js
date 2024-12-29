import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login/Login';
import Welcome from './Welcome';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to handle successful login and update authentication state
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            {/* Login Route */}
            <Route
              path="/"
              element={<Login onLogin={handleLogin} />} // Pass handleLogin to Login
            />

            {/* Welcome Route */}
            <Route
              path="/welcome"
              element={isAuthenticated ? <Welcome /> : <Navigate to="/" />} // Redirect to login if not authenticated
            />

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
