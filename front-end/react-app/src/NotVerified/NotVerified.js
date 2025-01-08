import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotVerified.css' 


const NotVerified = () => {
  const [payments, setPayments] = useState([]);
  const [totalNotVerified, setTotalNotVerified] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotVerifiedData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('You are not authorized.');
          navigate('/');
          return;
        }

        const { id } = JSON.parse(localStorage.getItem('userDetails'));

        // Fetch unverified payments
        const paymentsResponse = await fetch(`http://localhost:9115/api/notverified/${id}`, {
          headers: {
            'x-observatory-auth': token,
          },
        });

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          setPayments(paymentsData);
        } else {
          const errorData = await paymentsResponse.json();
          setError(errorData.message || 'Failed to fetch unverified payments.');
          return;
        }

        // Fetch total unverified payments
        const totalResponse = await fetch(`http://localhost:9115/api/totalnotverified/${id}`, {
          headers: {
            'x-observatory-auth': token,
          },
        });

        if (totalResponse.ok) {
          const totalData = await totalResponse.json();
          setTotalNotVerified(totalData[0]?.totalSettled || 0);
        } else {
          const errorData = await totalResponse.json();
          setError(errorData.message || 'Failed to fetch total unverified payments.');
        }
      } catch (err) {
        setError('An error occurred while fetching unverified payments.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotVerifiedData();
  }, [navigate]);


  const verifyPayment = async (debtorId) => {
    try {
      const token = localStorage.getItem('authToken');
      const { id: creditorId } = JSON.parse(localStorage.getItem('userDetails')); 

      if (!token) {
        setError('You are not authorized.');
        navigate('/'); 
        return;
      }

      const response = await fetch(
        `http://localhost:9115/api/verifypayment/${creditorId}/${debtorId}`,
        {
          method: 'POST',
          headers: {
            'x-observatory-auth': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message); 

        // Update the payments list
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment.debtorId === debtorId ? { ...payment, totalSettled: 0 } : payment
          )
        );
      // Recalculate the total unverified amount (using the updated payments array)
      const updatedPayments = payments.map((payment) =>
        payment.debtorId === debtorId ? { ...payment, totalSettled: 0 } : payment
      );
      const newTotal = updatedPayments.reduce((acc, payment) => acc + parseFloat(payment.totalSettled), 0);
      setTotalNotVerified(newTotal.toFixed(1));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to verify payment.');
      }
    } catch (err) {
      setError('An error occurred while verifying the payment.');
    }
  };

  if (loading) {
    return <div>Loading unverified payments...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (payments.length === 0) {
    return <div>No unverified payments found.</div>;
  }

  return (
    <div className="not-settled-container"> {/* Reusing the class */}
      <div className="debt-wrapper">
        <h1 className="debt-title">Unverified Payments</h1>
        <h2 className="total-debt">Total Unverified Payments: {totalNotVerified} €</h2>
        <div className="debt-list">
          {payments.map((payment, index) => (
            <div key={index} className="debt-card">
              <div className="debt-header">
                <div className="debt-info">
                  <strong>{payment.debtorName}</strong> initiate a payment of <strong>{payment.totalSettled}€</strong>
                </div>
                <div className="debt-actions">
                  <button 
                    className="settle-button" 
                    onClick={() => verifyPayment(payment.debtorId)}
                    disabled={parseFloat(payment.totalSettled) === 0}
                  >
                    Verify
                  </button> 
                  {/* No need for dropdown here */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotVerified;