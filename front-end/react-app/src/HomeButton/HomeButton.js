import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomeButton.css"

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button id="home-button" onClick={() => navigate("/homepage")}>
      Home
    </button>
  );
};

export default HomeButton;
