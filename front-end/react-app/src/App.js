import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './Login/Login';
import Logout from './Logout/Logout';
import NotSettled from './NotSettled/NotSettled';
import NotVerified from './NotVerified/NotVerified';
import Homepage from './Homepage/Homepage';
import DateCalendarViews from './DateCalendarViews/DateCalendarViews';
import SelectDiagram from './SelectDiagram/SelectDiagram';
import TrafficVariationForRoadChart from './TrafficVariationForRoadChart/TrafficVariationForRoadChart';
import DebtHistoryChart from './DebtHistoryChart/DebtHistoryChart';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);  // Add a loading state to wait for token check

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log("Token from localStorage:", token); // Debugging: Check the token value

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // Debugging: Check the decoded token

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
    } else {
      setIsAuthenticated(false); // Ensure the user is logged out if no token exists
    }

    setLoading(false);  // Set loading state to false once the token validation is done
  }, []);

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate('/', { replace: true });
  //   }
  // }, [isAuthenticated, navigate]);
  

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userDetails');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;  // Show a loading screen while checking authentication
  }

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/homepage"
            element={
              isAuthenticated ? (
                <>
                  <div className="logout-container">
                    <Logout />
                  </div>
                  <Homepage />
                </>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/notsettled"
            element={
              isAuthenticated ? (
                <>
                  <div className="logout-container">
                    <Logout />
                  </div>
                  <div className="main-container">
                    <NotSettled onLogout={handleLogout} />
                    <NotVerified onLogout={handleLogout} />
                  </div>
                </>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />

          <Route 
            path="/calendar" 
            element={isAuthenticated ? <DateCalendarViews /> : <Navigate to="/" replace />} 
          />
          <Route 
              path="/selectdiagram" 
              element={
                isAuthenticated ? (
                  <>
                    <div className="logout-container">
                      <Logout />
                    </div>
                    <SelectDiagram />
                  </>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />

            <Route 
              path="/traffic-variation-for-road" 
              element={
                isAuthenticated ? (
                  <>
                    <div className="logout-container">
                      <Logout />
                    </div>
                    <TrafficVariationForRoadChart />
                  </>
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
            path="/traffic-variation-over-time" 
            element={isAuthenticated ? <DebtHistoryChart/> : <Navigate to="/" replace />} 
           />
            <Route 
            path="/debt-history-over-time" 
            element={isAuthenticated ? <DebtHistoryChart/> : <Navigate to="/" replace />} 
           />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
