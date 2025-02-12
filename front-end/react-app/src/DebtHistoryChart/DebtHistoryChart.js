import React, { useState, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import DateCalendarViews from "../DateCalendarViews/DateCalendarViews.js";
import ChooseDiagramButton from "../ChooseDiagramButton/ChooseDiagramButton.js";
import Download from "../DownloadButton/DownloadButton.js";

export default function DebtHistoryChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  const fetchDebtData = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const { id } = JSON.parse(localStorage.getItem("userDetails"));

      const url = `http://localhost:9115/api/debthistorychart/${id}/${startDate}/${endDate}`;

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
        setError("No debt history data found.");
        return;
      }

      console.log("Processed API Data:", data);

      // Extract months (x-axis)
      const months = data.map((item) => item.month).reverse(); // Reverse to show in chronological order

      // Extract companies (keys excluding 'month')
      const companies = Object.keys(data[0]).filter((key) => key !== "month");

      // Generate series data
      const seriesData = companies.map((company) => ({
        name: company,
        data: data.map((item) => item[company] || 0).reverse(), // Reverse to match month order
      }));

      setChartOptions({
        title: { text: "Debt History Over Time" },
        xAxis: {
          categories: months,
          title: { text: "Months" },
        },
        yAxis: {
          title: { text: "Debt Amount (€)" },
        },
        series: seriesData,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <ChooseDiagramButton />
      <h2>Debt History Over Time</h2>
      <DateCalendarViews
        onDateChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
      <button onClick={fetchDebtData} disabled={!startDate || !endDate}>
        Generate Chart
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {chartOptions && (
        <div>
          <HighchartsReact
            ref={chartRef}
            highcharts={Highcharts}
            options={chartOptions}
          />
          <Download chartRef={chartRef} filename="debt_history_chart" />
        </div>
      )}
    </div>
  );
}
