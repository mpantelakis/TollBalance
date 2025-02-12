import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './SelectDiagram.css';
import HomeButton from '../HomeButton/HomeButton';

function SelectDiagram() {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleDiagramClick = (diagramName) => {
    console.log(`Navigating to diagram: ${diagramName}`);

    if (diagramName === 'Diagram 1') {
      navigate('/traffic-variation-for-road'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 2') {
      navigate('/traffic-distribution-over-time'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 3') {
      navigate('/traffic-variation-over-time'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 4') {
      navigate('/most-popular-toll-booths'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 5') {
      navigate('/debt-history-over-time'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 6') {
      navigate('/amounts-owed-by-other-companies-over-time'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 7') {
      navigate('/revenue-distribution-over-time'); // Navigate to the calendar page when Diagram 1 is clicked
    }
  };

  return (
  <div>
    <HomeButton />
    <div className="select-diagram-wrapper">
      <div className="select-diagram-container">
      <h1 style={{ color: 'white', fontSize: '36px' }}>Select a Diagram</h1>
        <div className="buttons-container">
          {/* Diagram 1 */}
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 1')}>
            Traffic Variation for a Specific Road Over Time
              <p className="diagram-button-description">
              The traffic flow on a specific road segment for a selected time range.  {/*It allows you to analyze traffic patterns and identify peak hours, congestion periods, and periods of low traffic volume*/}
              </p>
            </button>
          </div>

          {/* Diagram 2 */}
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 2')}>
              Traffic Distribution Across Roads for a Specific Time Window
              <p className="diagram-button-description">
              The proportion of traffic distributed across different roads within a defined time window.
              </p>
            </button>
          </div>

          {/* Diagram 3 */}
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 3')}>
              Traffic Variation Over Time
              <p className="diagram-button-description">
              An overall trend of traffic variation across all monitored roads over a given time period. {/*Companies can analyze traffic patterns and detect seasonal or time-based fluctuations.*/}
              </p>
            </button>
          </div>
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 4')}>
              Most Popular Toll Booths
              <p className="diagram-button-description">
              The 5 most frequently used toll booths based on the number of vehicle crossings.
              </p>
            </button>
          </div>
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 5')}>
            Debt History Over Time
              <p className="diagram-button-description">
                A historical trend of company debts, showing how debts owed have evolved over time.
              </p>
            </button>
          </div>
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 6')}>
            Amounts Owed by other Companies Over Time
              <p className="diagram-button-description">
                A historical trend of the amounts owed to the company by other companies over a selected time period. 
              </p>
            </button>
          </div>
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 7')}>
            Revenue Distribution Across Roads for a Specific Time Window
              <p className="diagram-button-description">
                The distribution of revenues across different roads during a specified time window.
              </p>
            </button>
          </div>
          {/* Add remaining diagrams */}
        </div>
      </div>
    </div>
  </div>
  );
}

export default SelectDiagram;

