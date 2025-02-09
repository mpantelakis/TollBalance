import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './SelectDiagram.css';

function SelectDiagram() {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleDiagramClick = (diagramName) => {
    console.log(`Navigating to diagram: ${diagramName}`);

    if (diagramName === 'Diagram 1') {
      navigate('/traffic-variation-for-road'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 3') {
      navigate('/traffic-variation-over-time'); // Navigate to the calendar page when Diagram 1 is clicked
    }
    if (diagramName === 'Diagram 5') {
      navigate('/debt-history-over-time'); // Navigate to the calendar page when Diagram 1 is clicked
    }
  };

  return (
    <div className="select-diagram-wrapper">
      <div className="select-diagram-container">
        <h1>Select a Diagram</h1>
        <div className="buttons-container">
          {/* Diagram 1 */}
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 1')}>
            Traffic Variation for a Specific Road Over Time
              <p className="diagram-button-description">
              This diagram visualizes the traffic flow on a specific road segment for a selected time range.  {/*It allows you to analyze traffic patterns and identify peak hours, congestion periods, and periods of low traffic volume*/}
              </p>
            </button>
          </div>

          {/* Diagram 2 */}
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 2')}>
              Diagram 2
              <p className="diagram-button-description">
                Description for Diagram 2.
              </p>
            </button>
          </div>

          {/* Diagram 3 */}
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 3')}>
              Traffic Variation Over Time
              <p className="diagram-button-description">
              This diagram visualises an overall trend of traffic variation across all monitored roads over a given time period. {/*Companies can analyze traffic patterns and detect seasonal or time-based fluctuations.*/}
              </p>
            </button>
          </div>
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 4')}>
              Diagram 3
              <p className="diagram-button-description">
                Description for Diagram 4.
              </p>
            </button>
          </div>
          <div className="button-container">
            <button className="diagram-button" onClick={() => handleDiagramClick('Diagram 5')}>
            Debt History Over Time
              <p className="diagram-button-description">
                This diagram visualizes a historical trend of company debts, showing how debts owed have evolved over time.
              </p>
            </button>
          </div>
          {/* Add remaining diagrams */}
        </div>
      </div>
    </div>
  );
}

export default SelectDiagram;
