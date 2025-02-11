import React, { useState, useEffect, useRef  } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ChooseDiagramButton from '../ChooseDiagramButton/ChooseDiagramButton';
import Download from '../DownloadButton/DownloadButton.js';

export default function MostPopularTollBooths() {
  const [chartOptions, setChartOptions] = useState(null);
  const [error, setError] = useState(null);

  const chartRef = useRef(null);

  useEffect(() => {
    fetchTollBoothData();
  }, []);

  const fetchTollBoothData = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const { id } = JSON.parse(localStorage.getItem("userDetails"));
      const url = `https://localhost:9115/api/mostpopulartollbooths/${id}`;

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

      const categories = data.map((item) => item.tollBooth);
      const passCounts = data.map((item) => item.totalPasses);

      setChartOptions({
        chart: { type: 'column', height: 500, width: 900 },
        title: { text: 'Top 5 Most Popular Toll Booths' },
        xAxis: {
          categories: categories,
          crosshair: true,
          title: { text: 'Toll Booths' },
        },
        yAxis: {
          min: 0,
          title: { text: 'Total Passes' },
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y} passes</b>',
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [{ name: 'Passes', data: passCounts, color: '#007bff' }],
      });

    } catch (err) {
      setError(err.message);
      console.log("Error in fetchTollBoothData:", err.message);
    }
  };

  return (
    <div>
      <ChooseDiagramButton />
      <h2>Most Popular Toll Booths</h2>

      {/* Error message */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Display Chart if data is available */}
      {chartOptions && (
        <div>
          <HighchartsReact ref={chartRef} highcharts={Highcharts} options={chartOptions} />
          <Download chartRef={chartRef} filename="most_popular_toll_booths" />
        </div>
      )}
    </div>
  );
}
