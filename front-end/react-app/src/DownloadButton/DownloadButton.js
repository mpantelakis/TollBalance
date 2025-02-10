import React from "react";
import Highcharts from "highcharts";
import exporting from "highcharts/modules/exporting";
import exportData from "highcharts/modules/export-data";
import offlineExporting from "highcharts/modules/offline-exporting";

// ✅ Ensure modules are loaded only once
if (!Highcharts.Chart.prototype.exportChart) {
  exporting(Highcharts);
  exportData(Highcharts);
  offlineExporting(Highcharts);  // ✅ Enables local exporting
}

export default function DownloadButton({ chartRef, filename = "chart" }) {
  const downloadChart = () => {
    if (chartRef?.current?.chart) {
      chartRef.current.chart.exportChartLocal({
        type: "image/png", // You can change to "image/jpeg", "application/pdf", "image/svg+xml"
        filename: filename,
      });
    } else {
      console.error("Chart reference is invalid.");
    }
  };

  return (
    <button onClick={downloadChart} style={{ marginTop: "10px" }}>
      Download Chart
    </button>
  );
}
