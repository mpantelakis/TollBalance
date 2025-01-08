import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './Login/Login';
import Logout from './Logout/Logout';
import NotSettled from './NotSettled/NotSettled';
import NotVerified from './NotVerified/NotVerified';
import Homepage from './Homepage/Homepage';
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if a valid token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);

        // Check if the token has expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          handleLogout(); // Logout if token is expired
        }
      } catch (error) {
        console.error('Invalid token:', error);
        handleLogout(); // Logout if decoding fails
      }
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userDetails');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={<Login onLogin={handleLogin} />}
          />
          <Route 
            path="/homepage" 
            element={
              // Apply conditional rendering here
              isAuthenticated ? (
                <div className="page-container">
                  {" "}
                  {/* Add a container for each page */}
                  <Logout /> {/* Show Logout on this route */}
                  <Homepage />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/notsettled"
            element={isAuthenticated ? (
              <div className="page-container">
              {" "}
              {/* Add a container for each page */}
              <Logout /> {/* Show Logout on this route */}
              <div className="main-container">
                {/* Add a container */}
                <NotSettled onLogout={handleLogout} />
                <NotVerified onLogout={handleLogout} />
              </div>
            </div>
          ) : (
            <Navigate to="/" />
          )}
        />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
