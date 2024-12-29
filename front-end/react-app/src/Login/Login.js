import React, { useState } from 'react';
import styles from './Login.css'; 
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  // Define state variables for username, password, and error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

   // Hook for navigation
   const navigate = useNavigate();

  // Handle the form submit event
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset error message
    setErrorMessage('');

    // Logging username and password values
    console.log(username); 
    console.log(password);  
    
    try {
      console.log("I entered try");
      // API call to the backend for login
      const response = await fetch('http://localhost:9115/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      // Check if the response was successful
      if (response.ok) {

        const data = await response.json();
        const token = data.token;

        // Store the token in localStorage
        localStorage.setItem('authToken', token);

        console.log('Login is successful');
        // Call onLogin to update authentication state in App.js
        onLogin(); // Inform the parent component (App.js) that the user is logged in

        // Redirect to the /welcome page
        navigate('/welcome');

      } else {
        console.log("first error");
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.log("second error");
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className='wrapper'>
      <form onSubmit={handleSubmit}>  {/* Corrected to use onSubmit */}
        <h1>Login</h1>

        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}  // Bind input value to username state
            onChange={(e) => setUsername(e.target.value)}  // Update state on change
          />
          <FaUser className='icon'/>
        </div>

        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            required
            value={password}  // Bind input value to password state
            onChange={(e) => setPassword(e.target.value)}  // Update state on change
          />
          <FaLock className='icon'/>
        </div>

        <button type="submit">Login</button> {/* Submit button triggers handleSubmit */}
        
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </form>
    </div>
  );
};

export default Login;

