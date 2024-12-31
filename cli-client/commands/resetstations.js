import { Command } from "commander";
import axios from "axios";

const command = new Command("resetstations")
  .description("reset the toll stations data in the system")
  .action(async () => {
    try {
      const response = await axios.post(
        "http://localhost:9115/api/admin/resetstations"
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  });

export default command;
