import { Command } from "commander";
import axios from "axios";
import fs from "fs";
import https from "https";

const command = new Command("passanalysis")
  .description("retrieve pass analysis data")
  .requiredOption("--stationop <stationOpID>", "Toll Station Operator ID")
  .requiredOption("--tagop <tagOpID>", "Tag Operator ID")
  .requiredOption("--from <date_from>", "Start date (YYYYMMDD)")
  .requiredOption("--to <date_to>", "End date (YYYYMMDD)")
  .option("--format <format>", "Output format (json or csv)", "csv")
  .action(async (options) => {
    try {
      const { stationop, tagop, from, to, format } = options;

      const tokenFilePath = ".auth_token";
      if (!fs.existsSync(tokenFilePath)) {
        console.error("You are not logged in.");
        return;
      }

      // Read the token from the file
      const token = fs.readFileSync(tokenFilePath, "utf-8").trim();

      const agent = new https.Agent({
        rejectUnauthorized: false, // Ignore self-signed cert
      });

      // Construct the URL with the parameters
      const url = `https://localhost:9115/api/passAnalysis/${stationop}/${tagop}/${from}/${to}`;

      // Make the API call
      const response = await axios.get(url, {
        params: { format },
        headers: {
          "X-OBSERVATORY-AUTH": token, // Include the token in the header
        },
        httpsAgent: agent,
      });

      if (response.status === 204) {
        console.log("No data found");
        return;
      }

      if (format === "json") {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(response.data);
      }
    } catch (error) {
      // Check if it's a response error
      if (error.response) {
        const { status, data } = error.response;
        // Ensure the error message is printed without extra spaces
        console.error(`Error ${status}: ${data.info}`);
      } else {
        // Catch unexpected errors
        console.error("Error:", error.message);
      }
    }
  });

export default command;
