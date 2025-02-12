import { Command } from "commander";
import fs from "fs";
import axios from "axios";
import https from "https";

const API_BASE_URL = "https://localhost:9115/api";

const logoutCommand = new Command("logout")
  .description("Log out from the system")
  .action(async () => {
    try {
      // Check if the token file exists
      if (!fs.existsSync(".auth_token")) {
        console.log("You are not logged in.");
        return;
      }

      // Read the token from the file
      const token = fs.readFileSync(".auth_token", "utf-8").trim();

      const agent = new https.Agent({
        rejectUnauthorized: false, // Ignore self-signed cert
      });

      // Call the API endpoint to log out
      const response = await axios.post(
        `${API_BASE_URL}/logout`,
        {}, // No body needed for logout
        {
          headers: {
            "X-OBSERVATORY-AUTH": token,
          },
          httpsAgent: agent,
        }
      );

      // If successful, delete the token file
      fs.unlinkSync(".auth_token");
      console.log("Logged out successfully!");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("You are not logged in or your session has expired.");
      } else {
        console.error(
          "An error occurred during logout:",
          error.response?.data || error.message
        );
      }
    }
  });

export default logoutCommand;
