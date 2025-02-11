import React, { useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DateCalendarViews from '../DateCalendarViews/DateCalendarViews.js';
import ChooseDiagramButton from '../ChooseDiagramButton/ChooseDiagramButton.js';
import Download from '../DownloadButton/DownloadButton.js';

export default function OwedAmountsChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  const fetchOwedAmountsData = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const { id } = JSON.parse(localStorage.getItem("userDetails"));

      const url = `https://localhost:9115/api/owedamountschart/${id}/${startDate}/${endDate}`;

      const response = await fetch(url, {
        headers: {
          "x-observatory-auth": token,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const rawData = await response.json();

      // Extract only the first element (actual data)
      const data = rawData[0];
      if (!Array.isArray(data) || data.length === 0) {
        setError("No owed amounts data found.");
        return;
      }

      console.log("Processed API Data:", data);

      // Extract months (x-axis)
      const months = data.map(item => item.month).reverse(); // Reverse to show in chronological order

      // Extract companies (keys excluding 'date')
      const companies = Object.keys(data[0]).filter(key => key !== "date");

      // Generate series data
      const seriesData = companies.map(company => ({
        name: company,
        data: data.map(item => item[company] || 0).reverse(), // Reverse to match date order
      }));

      setChartOptions({
        chart: { type: "line" },
        title: { text: "Owed Amounts Over Time" },
        xAxis: {
            categories: months,
            title: { text: "Months" },
        },
        yAxis: {
          title: { text: "Owed Amount (€)" },
        },
        series: seriesData,
        tooltip: {
          shared: true,
          valueSuffix: " €",
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <ChooseDiagramButton />
      <h2>Owed Amounts Over Time</h2>
      <DateCalendarViews onDateChange={(start, end) => {
        setStartDate(start);
        setEndDate(end);
      }} />
      <button onClick={fetchOwedAmountsData} disabled={!startDate || !endDate}>
        Generate Chart
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {chartOptions && (
        <div>
        <HighchartsReact ref={chartRef} highcharts={Highcharts} options={chartOptions} />
        <Download chartRef={chartRef} filename="owed_amounts_chart" />
        </div>
      )}
    </div>
  );
}
