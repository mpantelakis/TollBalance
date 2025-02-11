import React, { useState, useRef  } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DateCalendarViews from '../DateCalendarViews/DateCalendarViews.js';
import ChooseDiagramButton from '../ChooseDiagramButton/ChooseDiagramButton.js';
import Download from '../DownloadButton/DownloadButton.js';

export default function TrafficVariationChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  const fetchTrafficData = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const { id } = JSON.parse(localStorage.getItem("userDetails"));

      // Log selected values before making the API call
      console.log("Connected company id: ", id);
      console.log("Start Date: ", startDate);
      console.log("End Date: ", endDate);

      const url = `https://localhost:9115/api/trafficvariation/${id}/${startDate}/${endDate}`;

      console.log("API URL: ", url);

      const response = await fetch(url, {
        headers: { "x-observatory-auth": token },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      


      const data = await response.json();
      console.log("API Response Data: ", data);

      if (!Array.isArray(data)) {
        setError("Invalid data format received.");
        return;
      }

      setTrafficData(data);

      const formattedData = {
        name: "Total Toll Passes",
        data: data.sort((a, b) => (a.month > b.month ? 1 : -1)).map((item) => item.totalPasses),
      };

      setChartOptions({
        title: { text: 'Traffic Variation' },
        xAxis: {
          categories: data.sort((a, b) => (a.month > b.month ? 1 : -1)).map((item) => item.month),
          title: { text: 'Months' },
        },
        yAxis: {
          title: { text: 'Total Passes' },
        },
        series: [formattedData],
      });

    } catch (err) {
      setError(err.message);
      console.log("Error in fetchTrafficData: ", err.message);
    }
  };

  return (
    <div>
      <ChooseDiagramButton />
      <h2>Traffic Variation Chart</h2>

      {/* Date Selection */}
      <DateCalendarViews onDateChange={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }} />

      {/* Generate Chart Button */}
      <button onClick={fetchTrafficData} disabled={!startDate || !endDate}>
        Generate Chart
      </button>

      {/* Error message */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Display Chart if data is available */}
      {chartOptions && (
        <div>
          <HighchartsReact ref={chartRef} highcharts={Highcharts} options={chartOptions} />
          <Download chartRef={chartRef} filename="traffic_distribution_across_roads" />
        </div>
      )}
    </div>
  );
}
