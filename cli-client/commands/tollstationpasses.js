import { Command } from "commander";
import axios from "axios";
import fs from "fs";

// Custom error class to simulate status codes
class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const command = new Command("tollstationpasses")
  .description("retrieve toll station passes")
  .requiredOption("--station <station>", "Toll Station ID")
  .requiredOption("--from <from>", "Start date (YYYYMMDD)")
  .requiredOption("--to <to>", "End date (YYYYMMDD)")
  .option("--format <format>", "Output format (json or csv)", "csv")
  .action(async (options) => {
    try {
      const { station, from, to, format } = options;

      const tokenFilePath = ".auth_token";
      if (!fs.existsSync(tokenFilePath)) {
        // Throw a 401 Unauthorized error if the token file does not exist
        throw new CustomError(401, "You are not logged in.");
      }

      // Read the token from the file
      const token = fs.readFileSync(tokenFilePath, "utf-8").trim();

      // Construct the URL with the parameters
      const url = `http://localhost:9115/api/tollStationPasses/${station}/${from}/${to}`;

      // Make the API call
      const response = await axios.get(url, {
        params: { format },
        headers: {
          "X-OBSERVATORY-AUTH": token, // Include the token in the header
        },
      });

      if (format === "json") {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error:", error.response?.data.info || error.message);
    }
  });

export default command;
