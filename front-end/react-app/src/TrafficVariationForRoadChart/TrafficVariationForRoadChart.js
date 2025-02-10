import React, { useState, useRef  } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DateCalendarViews from '../DateCalendarViews/DateCalendarViews.js';
import RoadsPerOperator from '../RoadsPerOperator/RoadsPerOperator.js';
import ChooseDiagramButton from '../ChooseDiagramButton/ChooseDiagramButton.js';
import Download from '../DownloadButton/DownloadButton.js';

export default function TrafficVariationForRoadChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState('');
  const [trafficData, setTrafficData] = useState([]);
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  //console.log("Selected road", selectedRoad);
  const fetchTrafficData = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    if (!selectedRoad) {
      setError("Please select a road.");
      return;
    }
  
    // Log selected values before making the API call
    console.log("Selected Road: ", selectedRoad);
    console.log("Start Date: ", startDate);
    console.log("End Date: ", endDate);
  
    setError(null); // Clear previous error
    try {
      const token = localStorage.getItem("authToken");
      const { id } = JSON.parse(localStorage.getItem("userDetails"));
      console.log("id: ", id);
      // Ensure the road name is encoded properly
      //const encodedRoad = encodeURIComponent(selectedRoad);
      const url = `http://localhost:9115/api/trafficvariationperroad/${id}/${selectedRoad}/${startDate}/${endDate}`;
  
      console.log("API URL: ", url);  // Log the full URL being called
  
      const response = await fetch(url, {
        headers: {
          "x-observatory-auth": token,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      // Log the raw response text
      const responseText = await response.text();
      console.log("Raw Response Text: ", responseText);  // Log the raw response body
  
      // If the response is empty, log that as well
      if (!responseText) {
        console.log("The API response is empty.");
        setError("The API response is empty.");
        return;
      }
  
      // Try parsing the response as JSON and log the parsed data
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Parsed API Response Data: ", data);  // Log the parsed JSON response
      } catch (parseError) {
        console.log("Failed to parse response as JSON: ", parseError);
        setError("Failed to parse response as JSON.");
        return;
      }
  
      // Ensure the data is in the correct format
      if (!Array.isArray(data)) {
        setError("Invalid data format received from the API.");
        console.log("Invalid data format received from the API:", data);
        return;
      }
  
      setTrafficData(data);
  
      const formattedData = {
        name: `Toll Passes for Selected Road`,
        data: data
          .sort((a, b) => (a.month > b.month ? 1 : -1)) // Sort by month in ascending order
          .map((item) => item.totalPasses), // Map the total passes after sorting
      };
      
      setChartOptions({
        title: { text: 'Traffic Variation Per Road' },
        xAxis: {
          categories: data
            .sort((a, b) => (a.month > b.month ? 1 : -1)) // Sort months in ascending order
            .map((item) => item.month), // Map the months after sorting
          title: { text: 'Months' },
        },
        yAxis: {
          title: { text: 'Total Passes' },
        },
        series: [formattedData], // Ensure only one line series is present
      });
      
  
    } catch (err) {
      setError(err.message);
      console.log("Error in fetchTrafficData: ", err.message);  // Log the error message
    }
  };



  return (
    <div>
      <ChooseDiagramButton />
      <h2>Traffic Variation Per Road Chart</h2>
      
      
      {/* Road Selection Component */}
      <RoadsPerOperator setSelectedRoad={setSelectedRoad} />

      {/* Date Selection using DateCalendarViews */}
      <DateCalendarViews onDateChange={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }} />

      {/* Generate Chart Button */}
      <button onClick={fetchTrafficData} disabled={!startDate || !endDate || !selectedRoad}>
        Generate Chart
      </button>

      {/* Error message */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Display Chart if data is available */}
      {chartOptions && (
        <div>
          <HighchartsReact ref={chartRef} highcharts={Highcharts} options={chartOptions} />
          <Download chartRef={chartRef} filename="traffic_variation_chart" />
        </div>
      )}
    </div>
  );
}