import React, { useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DateCalendarViews from '../DateCalendarViews/DateCalendarViews.js';
import ChooseDiagramButton from '../ChooseDiagramButton/ChooseDiagramButton.js';
import Download from '../DownloadButton/DownloadButton.js';


export default function RevenueDistributionAcrossRoads() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  const fetchRevenueData = async () => {
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

      const url = `https://localhost:9115/api/revenuedistribution/${id}/${startDate}/${endDate}`;

      console.log("API URL:", url);

      const response = await fetch(url, {
        headers: { "x-observatory-auth": token },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API Response Data:", data);

      if (!Array.isArray(data)) {
        setError("Invalid data format received.");
        return;
      }

      const formattedData = data.map((item) => ({
        name: item.road,
        y: item.totalRevenues,
      }));

      setChartOptions({
        chart: { type: 'pie' },
        title: { text: 'Revenue Distribution Across Roads' },
        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
        accessibility: {
          point: { valueSuffix: '%' },
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '{point.name}: €{point.y}',
            },
          },
        },
        series: [{ name: 'Revenue (€)', colorByPoint: true, data: formattedData }],
      });

    } catch (err) {
      setError(err.message);
      console.log("Error in fetchRevenueData:", err.message);
    }
  };

  return (
    <div>
      <ChooseDiagramButton />
      <h2>Revenue Distribution Across Roads</h2>

      {/* Date Selection */}
      <DateCalendarViews onDateChange={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }} />

      {/* Generate Chart Button */}
      <button onClick={fetchRevenueData} disabled={!startDate || !endDate}>
        Generate Chart
      </button>

      {/* Error message */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Display Chart if data is available */}
      {chartOptions && (
        <div>
          <HighchartsReact ref={chartRef} highcharts={Highcharts} options={chartOptions} />
          <Download chartRef={chartRef} filename="revenue_distribution_across_roads" />
        </div>
      )}
    </div>
  );
}
