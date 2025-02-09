import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';


function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/', { replace: true }); // Redirect to login if no token
    }
  }, [navigate]);

  const handleButton1Click = () => {
    navigate('/notsettled');
  };

  const handleButton2Click = () => {
    // navigate('/calendar'); 
    navigate('/selectdiagram');
    console.log('Button 2 clicked!');
  };

  return (
    <div className="homepage-container"> {/* Add the wrapper class */}
      {/* <h1>Welcome!</h1> */}
      <div className="buttons-container">
        <div className="button-container">
          <button className="path-button" onClick={handleButton1Click}>
            Manage Company Debts
            <p className="path-button-description">
              View and settle your company's debts, explore debt history, 
              and verify payments from other companies. 
            </p>
          </button>
        </div>

        <div className="button-container">
          <button className="path-button" onClick={handleButton2Click}>
            View Analytics Chart
            <p className="path-button-description">
            View a variety of analytics charts that provide insights into traffic, 
            tolls usage, revenue distribution, and debt trends.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
