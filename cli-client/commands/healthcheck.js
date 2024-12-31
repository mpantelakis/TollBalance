import { Command } from "commander";
import axios from "axios";

const command = new Command("healthcheck")
  .description("check if the server connection is established")
  .action(async () => {
    try {
      const response = await axios.get(
        "http://localhost:9115/api/admin/healthcheck"
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  });

export default command;
