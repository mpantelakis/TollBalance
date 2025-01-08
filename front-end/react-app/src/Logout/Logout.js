import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Logout.css'


const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('You are not logged in.');
        navigate('/');
        return;
      }

      const response = await fetch('http://localhost:9115/api/logout', {
        method: 'POST',
        headers: {
          'X-OBSERVATORY-AUTH': token,
        },
      });

      if (response.ok) {
        // Clear localStorage and navigate to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('userDetails');
        navigate('/', { replace: true });
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <button id="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;
