import { Command } from "commander";
import axios from "axios";
import fs from "fs";

const command = new Command("resetpasses")
  .description("reset the toll passes data in the system")
  .action(async () => {
    try {
      const tokenFilePath = ".auth_token";
      if (!fs.existsSync(tokenFilePath)) {
        console.error("You are not logged in.");
        return;
      }

      // Read the token from the file
      const token = fs.readFileSync(tokenFilePath, "utf-8").trim();

      // Construct the headers with the token
      const headers = {
        "X-OBSERVATORY-AUTH": token,
      };

      const response = await axios.post(
        "https://localhost:9115/api/admin/resetpasses",
        {}, // No body needed, just an empty object
        {
          headers: {
            "x-observatory-auth": token, // Include the token in the header
          },
        }
      );

      console.log(response.data.status);
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
