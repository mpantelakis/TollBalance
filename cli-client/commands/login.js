import { Command } from "commander";
import axios from "axios";
import qs from "qs";
import fs from "fs";

const API_BASE_URL = "http://localhost:9115/api";

const loginCommand = new Command("login")
  .description("Authenticate and log in to the system")
  .requiredOption("--username <username>", "Admin username")
  .requiredOption("--passwd <password>", "Admin password")
  .action(async (options) => {
    try {
      const { username, passwd } = options;

      // Κωδικοποίηση παραμέτρων σε URL-encoded format
      const data = qs.stringify({
        username,
        password: passwd,
      });

      // Αποστολή αιτήματος POST στο API
      const response = await axios.post(`${API_BASE_URL}/login`, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { token } = response.data;

      // Αποθήκευση token τοπικά
      fs.writeFileSync(".auth_token", token, { mode: 0o600 });

      console.log("Login successful!");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  });

export default loginCommand;
