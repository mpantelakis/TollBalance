import React, { useEffect, useState } from 'react';
import './TotalNotSettled.css';

const TotalNotSettled = () => {
  const [totalDebts, setTotalDebts] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalDebts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('You are not authorized.');
          return;
        }

        const response = await fetch('http://localhost:9115/api/totalnotsettled', {
          headers: {
            'x-observatory-auth': token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTotalDebts(data[0].totalOwed); // Assuming data is [{ totalOwed: 250.5 }]
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch total debts.');
        }
      } catch (err) {
        setError('An error occurred while fetching total debts.');
      } finally {
        setLoading(false);
      }
    };

    fetchTotalDebts();
  }, []);

  if (loading) {
    return <div className="total-debts-loading">Loading total debts...</div>;
  }

  if (error) {
    return <div className="total-debts-error">{error}</div>;
  }

  return (
    <div className="total-debts-card">
      <h2>Total Debts</h2>
      <p>{totalDebts} €</p>
    </div>
  );
};

export default TotalNotSettled;
