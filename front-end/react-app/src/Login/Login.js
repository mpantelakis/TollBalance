import React, { useState, useEffect } from "react";
import styles from "./Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          // Only redirect if you're at login page and the token is valid
          navigate("/homepage", { replace: true });
        }
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:9115/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        // Decode the token
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        // Store the token and user details in localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userDetails", JSON.stringify(decodedToken));

        setSuccessMessage("Login successful!");
        onLogin(); // Notify parent component
        navigate("/homepage", { replace: true }); // Redirect and replace history
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        <h1 style={{ marginLeft: "60px" }}>Login</h1>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>
        <button type="submit">Login</button>
        {successMessage && (
          <div className={styles.success}>{successMessage}</div>
        )}
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </form>
    </div>
  );
};

export default Login;
