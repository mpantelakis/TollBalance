import { Command } from "commander";
import axios from "axios";
import fs from "fs";
import https from "https";

const command = new Command("healthcheck")
  .description("Check if the server connection is established")
  .action(async () => {
    try {
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

      // Make the request with the token in the X-OBSERVATORY-AUTH header
      const response = await axios.get(
        "https://localhost:9115/api/admin/healthcheck",
        {
          headers: {
            "X-OBSERVATORY-AUTH": token, // Pass the token here
          },
          httpsAgent: agent,
        }
      );

      console.log(response.data);
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
