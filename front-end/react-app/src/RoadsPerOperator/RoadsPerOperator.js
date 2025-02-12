import React, { useState, useEffect } from "react";

export default function RoadsPerOperator({ setSelectedRoad }) {
  const [roads, setRoads] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoads = async () => {
      const token = localStorage.getItem("authToken");
      const { id } = JSON.parse(localStorage.getItem("userDetails"));

      try {
        const url = `http://localhost:9115/api/roadsperoperator/${id}`; // Adjust API endpoint if needed
        const response = await fetch(url, {
          headers: {
            "x-observatory-auth": token,
          },
        });

        if (!response.ok)
          throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        console.log("Road from api:", data); // Inspect the response from the API
        setRoads(data); // Save the roads data
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRoads();
  }, []); // Empty dependency array to run once when component mounts

  const handleRoadChange = (event) => {
    const selectedRoad = JSON.parse(event.target.value); // Parse the JSON string
    console.log("Selected Road ID:", selectedRoad.id);
    console.log("Selected Road Name:", selectedRoad.name);
    setSelectedRoad(selectedRoad.id); // Set the road ID instead of name
  };

  return (
    <div>
      <label>Select Road: </label>
      <select onChange={handleRoadChange}>
        <option value="">--Select Road--</option>
        {roads.map((road) => (
          <option
            key={road.id}
            value={JSON.stringify({ id: road.id, name: road.name })}
          >
            {road.name}
          </option>
        ))}
      </select>

      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
