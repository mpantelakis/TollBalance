import { Command } from "commander";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import jwt from "jsonwebtoken"; // Add the jsonwebtoken package

// Custom error class to simulate status codes
class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const API_BASE_URL = "http://localhost:9115/api";

const adminCommand = new Command("admin")
  .description("administrative commands for the application")
  .option("--username <username>", "specify the username")
  .option("--passw <password>", "set a new password for a user")
  .option("--usermod", "modify user details (requires --username and --passw)")
  .option("--users", "list all users")
  .option("--addpasses", "upload a CSV file to add new passes")
  .option("--source <file>", "path to the CSV file for the --addpasses option")
  .action(async (options) => {
    try {
      const tokenFilePath = ".auth_token";
      if (!fs.existsSync(tokenFilePath)) {
        // Throw a 401 Unauthorized error if the token file does not exist
        throw new CustomError(401, "You are not logged in.");
      }

      // Read the token from the file
      const token = fs.readFileSync(tokenFilePath, "utf-8").trim();

      const decodedToken = jwt.decode(token);

      if (!decodedToken || decodedToken.username !== "admin") {
        throw new CustomError(401, "Not authorized action.");
      }

      // Construct the headers with the token
      const headers = {
        "X-OBSERVATORY-AUTH": token,
      };

      if (options.usermod) {
        if (!options.username || !options.passw) {
          console.error(
            "Error: --username and --passw are required when using --usermod."
          );
          return;
        }

        const response = await axios.post(
          `${API_BASE_URL}/admin/usermod`,
          {
            username: options.username,
            password: options.passw,
          },
          { headers }
        );
        console.log(response.data.message);
      } else if (options.users) {
        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
          headers,
        });
        console.log(
          "Users:",
          response.data.map((user) => user.username)
        );
      } else if (options.addpasses) {
        if (!options.source) {
          console.error(
            "Error: --source <file> is required when using --addpasses."
          );
          return;
        }

        const file = options.source;

        if (!fs.existsSync(file)) {
          console.error("Error: File does not exist.");
          return;
        }

        const formData = new FormData();
        formData.append("csvFile", fs.createReadStream(file));

        const response = await axios.post(
          `${API_BASE_URL}/admin/addpasses`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              ...headers,
            },
          }
        );

        console.log("Passes added successfully!");
      } else {
        console.log(
          "No valid admin option specified. Use --help for available options."
        );
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  });

export default adminCommand;
