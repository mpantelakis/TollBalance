import React from "react";
import { useNavigate } from "react-router-dom";
import "./ChooseDiagramButton.css"; // Import CSS file

const ChooseDiagramButton = () => {
  const navigate = useNavigate();

  return (
    <button id="choose-diagram-button" onClick={() => navigate("/selectdiagram")}>
      Choose Another Diagram
    </button>
  );
};

export default ChooseDiagramButton;
