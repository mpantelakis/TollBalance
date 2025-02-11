import React, { useEffect, useState } from 'react';
import './NotSettled.css';

const NotSettled = () => {
  const [debts, setDebts] = useState([]);
  const [totalNotSettled, setTotalNotSettled] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchNotSettledData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // If no token, do not redirect automatically, just show the error
        setError('You are not authorized.');
        setLoading(false);
        return;
      }

      try {
        const { id } = JSON.parse(localStorage.getItem('userDetails'));

        const debtsResponse = await fetch(`https://localhost:9115/api/notsettled/${id}`, {
          headers: {
            'x-observatory-auth': token,
          },
        });

        if (debtsResponse.ok) {
          const debtsData = await debtsResponse.json();
          const debtsWithDropdown = debtsData.map((debt) => ({
            ...debt,
            history: [],
            isOpen: false,
          }));
          setDebts(debtsWithDropdown);
        } else {
          const errorData = await debtsResponse.json();
          setError(errorData.message || 'Failed to fetch unsettled debts.');
        }

        const totalResponse = await fetch(`https://localhost:9115/api/totalnotsettled/${id}`, {
          headers: {
            'x-observatory-auth': token,
          },
        });

        if (totalResponse.ok) {
          const totalData = await totalResponse.json();
          setTotalNotSettled(totalData[0]?.totalOwed || 0);
        } else {
          const errorData = await totalResponse.json();
          setError(errorData.message || 'Failed to fetch total unsettled debts.');
        }
      } catch (err) {
        setError('An error occurred while fetching unsettled debts.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotSettledData();
  }, []); // Removed 'navigate' from dependency array because it isn't needed in this case.

  const fetchDebtHistory = async (creditorId, debtorId, index) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You are not authorized.');
      return;
    }

    try {
      const { id: debtorId } = JSON.parse(localStorage.getItem('userDetails'));

      const response = await fetch(
        `https://localhost:9115/api/historydebt/${debtorId}/${creditorId}`,
        {
          headers: {
            'x-observatory-auth': token,
          },
        }
      );

      if (response.ok) {
        const historyData = await response.json();
        const debtHistory = historyData;
        setDebts((prevDebts) =>
          prevDebts.map((debt, i) =>
            i === index ? { ...debt, history: debtHistory } : debt
          )
        );
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch debt history.');
      }
    } catch (err) {
      setError('An error occurred while fetching debt history.');
    }
  };

  const toggleDropdown = (index) => {
    setDebts((prevDebts) =>
      prevDebts.map((debt, i) =>
        i === index ? { ...debt, isOpen: !debt.isOpen } : { ...debt, isOpen: false }
      )
    );

    const debt = debts[index];
    if (!debt.isOpen && debt.history.length === 0) {
      const { creditorId } = debt;
      const { id: debtorId } = JSON.parse(localStorage.getItem('userDetails'));
      fetchDebtHistory(creditorId, debtorId, index);
    }
  };

  const settleDebt = async (creditorId) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('You are not authorized.');
      return;
    }

    try {
      const { id: debtorId } = JSON.parse(localStorage.getItem('userDetails'));

      const response = await fetch(
        `https://localhost:9115/api/settledebt/${debtorId}/${creditorId}`,
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

        setDebts((prevDebts) =>
          prevDebts.map((debt) =>
            debt.creditorId === creditorId ? { ...debt, totalOwed: 0 } : debt
          )
        );

        const updatedDebts = debts.map((debt) =>
          debt.creditorId === creditorId ? { ...debt, totalOwed: 0 } : debt
        );
        const newTotal = updatedDebts.reduce((acc, debt) => acc + parseFloat(debt.totalOwed), 0);
        setTotalNotSettled(newTotal.toFixed(1));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to settle debt.');
      }
    } catch (err) {
      setError('An error occurred while settling the debt.');
    }
  };

  if (loading) {
    return <div>Loading unsettled debts...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (debts.length === 0) {
    return <div>No unsettled debts found.</div>;
  }

  return (
    <div className="not-settled-container">
      <div className="debt-wrapper">
        <h1 className="debt-title">Unsettled Debts</h1>
        <h2 className="total-debt">Total Amount: {totalNotSettled} €</h2>
        <div className="debt-list">
          {debts.map((debt, index) => (
            <div key={index} className="debt-card">
              <div className="debt-header">
                <div className="debt-info">
                  <strong>{debt.creditorName}</strong> is owed <strong>{debt.totalOwed}€</strong>
                </div>
                <div className="debt-actions">
                  <button
                    className="settle-button"
                    onClick={() => settleDebt(debt.creditorId)}
                    disabled={parseFloat(debt.totalOwed) === 0}
                  >
                    Settle
                  </button>
                  <button
                    className="dropdown-toggle"
                    onClick={() => toggleDropdown(index)}
                  >
                    {debt.isOpen ? 'Hide History' : 'Show History'}
                  </button>
                </div>
              </div>
              {debt.isOpen && (
                <div className="debt-dropdown">
                  <h4>Debt History:</h4>
                  <ul>
                    {debt.history && debt.history.length > 0 ? (
                      debt.history.map((entry, idx) => (
                        <li key={idx}>
                          {entry.month}: {entry.totalDebts} €
                        </li>
                      ))
                    ) : (
                      <li>No history available.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotSettled;
