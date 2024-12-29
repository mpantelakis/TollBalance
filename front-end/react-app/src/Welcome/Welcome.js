import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('authToken');

    // Redirect to the login page
    navigate('/');
  };

  return (
    <div className="welcome-container">
      <h1>Welcome to the Dashboard!</h1>
      <p>You are successfully logged in.</p>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Welcome;
