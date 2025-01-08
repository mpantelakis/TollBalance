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
    console.log('Button 2 clicked!');
  };

  return (
    <div>
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
          </button>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
