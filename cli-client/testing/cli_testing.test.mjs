import { describe, test, expect, jest } from "@jest/globals";
import { program } from "commander";
import fs from "fs";
import loginCommand from "../commands/login.js";
import healthcheckCommand from "../commands/healthcheck.js";
import chargesbyCommand from "../commands/chargesby.js";
import tollstationpassesCommand from "../commands/tollstationpasses.js";
import passAnalysisCommand from "../commands/passanalysis.js";
import passescostCommand from "../commands/passescost.js";
import resetStationsCommand from "../commands/resetstations.js";
import resetPassesCommand from "../commands/resetpasses.js";
import adminCommand from "../commands/admin.js";

program.addCommand(loginCommand);
program.addCommand(healthcheckCommand);
program.addCommand(chargesbyCommand);
program.addCommand(tollstationpassesCommand);
program.addCommand(passAnalysisCommand);
program.addCommand(passescostCommand);
program.addCommand(resetStationsCommand);
program.addCommand(resetPassesCommand);
program.addCommand(adminCommand);

describe("Login CLI Tests", () => {
  beforeEach(() => {
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(".auth_token")) {
      fs.unlinkSync(".auth_token");
    }
  });

  test("Login command should authenticate and store the token", async () => {
    const username = "egnatia";
    const password = "password";

    // Spy on console.error to capture any error messages
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    // Simulate CLI args
    const args = [
      "node", // Pretend to run via Node
      "se2408", // The CLI name
      "login", // The login command
      "--username",
      username, // The username option
      "--passwd",
      password, // The password option
    ];

    // Run the CLI command with the arguments
    await program.parseAsync(args); // This will execute the command

    // Check if the .auth_token file was created
    expect(fs.existsSync(".auth_token")).toBe(true);

    // Read the token from the file
    const token = fs.readFileSync(".auth_token", "utf8");

    // Verify that the token is not empty
    expect(token).toBeTruthy();

    // Check for error message related to invalid username (adjust based on your error handling)
    expect(consoleLogSpy).toHaveBeenCalledWith("Login successful!");
    consoleLogSpy.mockClear();
  });

  test("Login command should handle invalid credentials", async () => {
    // Invalid Username Case
    const invalidUsername = "wronguser";
    const password = "password";

    // Simulate CLI args with invalid username
    const argsWithInvalidUsername = [
      "node",
      "se2408",
      "login",
      "--username",
      invalidUsername,
      "--passwd",
      password,
    ];

    // Spy on console.error to capture any error messages
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Run the CLI command with the arguments
    await program.parseAsync(argsWithInvalidUsername); // This will execute the command

    // Check if the .auth_token file was NOT created
    expect(fs.existsSync(".auth_token")).toBe(false);

    // Check for error message related to invalid username (adjust based on your error handling)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Login failed:",
      "Invalid credentials"
    );

    // Clear console error spy for next checks
    consoleErrorSpy.mockClear();

    // Invalid Password Case
    const username = "admin";
    const invalidPassword = "wrongpass";

    // Simulate CLI args with invalid password
    const argsWithInvalidPassword = [
      "node",
      "se2408",
      "login",
      "--username",
      username,
      "--passwd",
      invalidPassword,
    ];

    // Run the CLI command with the arguments
    await program.parseAsync(argsWithInvalidPassword); // This will execute the command

    // Check if the .auth_token file was NOT created
    expect(fs.existsSync(".auth_token")).toBe(false);

    // Check for error message related to invalid password (adjust based on your error handling)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Login failed:",
      "Invalid credentials"
    );

    consoleErrorSpy.mockRestore(); // Clean up the spy
  });
});

describe("Healthcheck CLI Tests", () => {
  const validUsername = "admin";
  const validPassword = "kodikos";
  const unauthorizedUsername = "egnatia";
  const unauthorizedPassword = "password";
  const tokenFilePath = ".auth_token";

  beforeEach(() => {
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
  });

  test("should display an error when the user is not logged in", async () => {
    // Spy on console.error to capture the output
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Run the healthcheck command without a token
    const args = ["node", "se2408", "healthcheck"];
    await program.parseAsync(args);

    // Check if the correct error message was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");

    // Restore console.error after the test
    consoleErrorSpy.mockRestore();
  });

  test("should display an error for unauthorized execution", async () => {
    // Spy on console.log to suppress output during the test
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    // First, simulate login with unauthorized credentials
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      unauthorizedUsername,
      "--passwd",
      unauthorizedPassword,
    ];
    await program.parseAsync(loginArgs);

    // Spy on console.error to capture the output
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Execute the healthcheck command with an invalid token
    const args = ["node", "se2408", "healthcheck"];
    await program.parseAsync(args);

    // Ensure the correct error message is logged for invalid token
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 401: Not authorized action"
    );

    // Restore the original console methods after the test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("should successfully execute and return expected healthcheck data structure after admin login", async () => {
    // Spy on console.log to capture the output
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    // First, simulate login with valid credentials
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    // Execute the healthcheck command with a valid token
    const args = ["node", "se2408", "healthcheck"];
    await program.parseAsync(args);

    // Ensure the output structure is correct
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: expect.any(String),
        dbconnection: expect.any(String),
        n_stations: expect.any(Number),
        n_tags: expect.any(Number),
        n_passes: expect.any(Number),
      })
    );
    consoleLogSpy.mockRestore();
  });
});

describe("ChargesBy CLI Tests", () => {
  const validUsername = "egnatia";
  const validPassword = "password";
  const tokenFilePath = ".auth_token";

  beforeEach(() => {
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
  });

  test("should display an error when not logged in", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "chargesby",
      "--opid",
      "AM",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");

    consoleErrorSpy.mockRestore();
  });

  test("should successfully execute chargesby in json format after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "chargesby",
      "--opid",
      "AM",
      "--from",
      "20220101",
      "--to",
      "20221231",
      "--format",
      "json",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0]; // Get the first logged argument
    const parsedOutput = JSON.parse(loggedOutput); // Convert string back to JSON

    expect(parsedOutput).toEqual(
      expect.objectContaining({
        tollOpID: expect.any(String),
        requestTimestamp: expect.any(String),
        periodFrom: expect.any(String),
        periodTo: expect.any(String),
        VOpList: expect.arrayContaining([
          expect.objectContaining({
            nPasses: expect.any(Number),
            passesCost: expect.any(Number),
            visitingOpID: expect.any(String),
          }),
        ]),
      })
    );

    consoleLogSpy.mockRestore();
  });

  test("should successfully execute chargesby in csv format after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "chargesby",
      "--opid",
      "AM",
      "--from",
      "20220101",
      "--to",
      "20220130",
      "--format",
      "csv",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0]; // Get the first logged argument

    // Split CSV into lines
    const csvLines = loggedOutput.trim().split("\n");

    // Expect at least two lines: header + one data row
    expect(csvLines.length).toBeGreaterThan(1);

    // Check that the first line contains the expected header fields
    const expectedCsvHeader =
      '"tollOpID","requestTimestamp","periodFrom","periodTo","VOpList"';
    expect(csvLines[0]).toBe(expectedCsvHeader);

    // Check that the second line follows CSV format (5 comma-separated values)
    const dataRowPattern = /^".*",".*",".*",".*",".*"$/;
    expect(csvLines[1]).toMatch(dataRowPattern);

    consoleLogSpy.mockRestore();
  });

  test("should return error for invalid operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "chargesby",
      "--opid",
      "A745M",
      "--from",
      "20220101",
      "--to",
      "20220130",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid station operator ID."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid 'date_to' format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);
    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "chargesby",
      "--opid",
      "AM",
      "--from",
      "20220101",
      "--to",
      "2022",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid 'date_from' format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);
    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "chargesby",
      "--opid",
      "AM",
      "--from",
      "2022",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return no content for non-existing operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "chargesby",
      "--opid",
      "XXX",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("No data found");

    consoleLogSpy.mockRestore();
  });
});

describe("Toll Station Passes CLI Tests", () => {
  const validUsername = "egnatia";
  const validPassword = "password";
  const tokenFilePath = ".auth_token";

  beforeEach(() => {
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
  });

  test("should display an error when not logged in", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "tollstationpasses",
      "--station",
      "EG01",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");

    consoleErrorSpy.mockRestore();
  });

  test("should successfully execute tollstationpasses in json format after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "tollstationpasses",
      "--station",
      "EG45",
      "--from",
      "20220101",
      "--to",
      "20221231",
      "--format",
      "json",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0];
    const parsedOutput = JSON.parse(loggedOutput);

    expect(parsedOutput).toEqual(
      expect.objectContaining({
        stationID: expect.any(String),
        stationOperator: expect.any(String),
        requestTimestamp: expect.any(String),
        periodFrom: expect.any(String),
        periodTo: expect.any(String),
        nPasses: expect.any(Number),
        passList: expect.arrayContaining([
          expect.objectContaining({
            tagID: expect.any(String),
            passID: expect.any(Number),
            passType: expect.any(String),
            passIndex: expect.any(Number),
            timestamp: expect.any(String),
            passCharge: expect.any(Number),
            tagProvider: expect.any(String),
          }),
        ]),
      })
    );

    consoleLogSpy.mockRestore();
  });

  test("should successfully execute tollstationpasses in csv format after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "tollstationpasses",
      "--station",
      "EG14",
      "--from",
      "20220108",
      "--to",
      "20220122",
      "--format",
      "csv",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0];

    // Split the CSV output into lines
    const outputLines = loggedOutput.split("\n");

    // Check the headers in the first line, remove surrounding quotes
    const headers = outputLines[0]
      .split(",")
      .map((header) => header.replace(/^"|"$/g, ""));
    expect(headers).toEqual(
      expect.arrayContaining([
        "stationID",
        "stationOperator",
        "requestTimestamp",
        "periodFrom",
        "periodTo",
        "nPasses",
        "passList",
      ])
    );

    consoleLogSpy.mockRestore();
  });

  test("should return error for invalid station ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "tollstationpasses",
      "--station",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid toll station ID."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid date_from format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "tollstationpasses",
      "--station",
      "EG01",
      "--from",
      "2022",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid date_to format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "tollstationpasses",
      "--station",
      "EG01",
      "--from",
      "20220101",
      "--to",
      "2022",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return no content for a non-existing station ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "tollstationpasses",
      "--station",
      "XYZ123",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("No data found");

    consoleLogSpy.mockRestore();
  });
});

describe("Pass Analysis CLI Tests", () => {
  const validUsername = "egnatia";
  const validPassword = "password";
  const tokenFilePath = ".auth_token";

  beforeEach(() => {
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
  });

  test("should display an error when not logged in", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");

    consoleErrorSpy.mockRestore();
  });

  test("should successfully execute passanalysis in json format after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
      "--format",
      "json",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0];
    const parsedOutput = JSON.parse(loggedOutput);

    expect(parsedOutput).toEqual(
      expect.objectContaining({
        stationOpID: expect.any(String),
        tagOpID: expect.any(String),
        requestTimestamp: expect.any(String),
        periodFrom: expect.any(String),
        periodTo: expect.any(String),
        nPasses: expect.any(Number),
        passList: expect.arrayContaining([
          expect.objectContaining({
            tagID: expect.any(String),
            passID: expect.any(Number),
            passIndex: expect.any(Number),
            stationID: expect.any(String),
            timestamp: expect.any(String),
            passCharge: expect.any(Number),
          }),
        ]),
      })
    );

    consoleLogSpy.mockRestore();
  });

  test("should successfully execute passanalysis in csv format after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
      "--format",
      "csv",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0];

    // Split the CSV output into lines
    const outputLines = loggedOutput.split("\n");

    // Check the headers in the first line, remove surrounding quotes
    const headers = outputLines[0]
      .split(",")
      .map((header) => header.replace(/^"|"$/g, ""));
    expect(headers).toEqual(
      expect.arrayContaining([
        "stationOpID",
        "tagOpID",
        "requestTimestamp",
        "periodFrom",
        "periodTo",
        "nPasses",
        "passList",
      ])
    );

    consoleLogSpy.mockRestore();
  });

  test("should return error for invalid station operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO462",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid station operator ID."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid tag operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO",
      "--tagop",
      "EG532",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid tag operator ID."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid date_from format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "2022",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid date_to format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "2022",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return no content for a non-existing station operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "MAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("No data found");

    consoleLogSpy.mockRestore();
  });

  test("should return no content for a non-existing tag operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passanalysis",
      "--stationop",
      "NAO",
      "--tagop",
      "MAO",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("No data found");

    consoleLogSpy.mockRestore();
  });
});

describe("Passes Cost CLI Tests", () => {
  const validUsername = "egnatia";
  const validPassword = "password";
  const tokenFilePath = ".auth_token";

  beforeEach(() => {
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
  });

  test("should display an error when not logged in", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");

    consoleErrorSpy.mockRestore();
  });

  test("should successfully execute passescost after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
      "--format",
      "json",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0]; // Get the first logged argument
    const parsedOutput = JSON.parse(loggedOutput); // Convert string back to JSON

    expect(parsedOutput).toEqual(
      expect.objectContaining({
        tollOpID: expect.any(String),
        tagOpID: expect.any(String),
        requestTimestamp: expect.any(String),
        periodFrom: expect.any(String),
        periodTo: expect.any(String),
        nPasses: expect.any(Number),
        passesCost: expect.any(Number),
      })
    );

    consoleLogSpy.mockRestore();
  });

  test("should successfully execute passescost in csv format after authorized login", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
      "--format",
      "csv",
    ];
    await program.parseAsync(args);
    const loggedOutput = consoleLogSpy.mock.calls[0][0];

    // Split the CSV output into lines
    const outputLines = loggedOutput.split("\n");

    // Check the headers in the first line, remove surrounding quotes
    const headers = outputLines[0]
      .split(",")
      .map((header) => header.replace(/^"|"$/g, ""));
    expect(headers).toEqual(
      expect.arrayContaining([
        "tollOpID",
        "tagOpID",
        "requestTimestamp",
        "periodFrom",
        "periodTo",
        "nPasses",
        "passesCost",
      ])
    );
    consoleLogSpy.mockRestore();
  });

  test("should return error for invalid toll operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "XYZ463",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid toll operator ID."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid tag operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "NAO",
      "--tagop",
      "XYZ634",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid tag operator ID."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid 'date_to' format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);
    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "2022",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_to' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return error for invalid 'date_from' format", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);
    consoleLogSpy.mockRestore();

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "NAO",
      "--tagop",
      "EG",
      "--from",
      "2022",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Invalid 'date_from' parameter. It should be in YYYYMMDD format."
    );

    consoleErrorSpy.mockRestore();
  });

  test("should return no content for non-existing toll operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "XXX",
      "--tagop",
      "EG",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("No data found");

    consoleLogSpy.mockRestore();
  });

  test("should return no content for non-existing tag operator ID", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    expect(fs.existsSync(tokenFilePath)).toBe(true);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "passescost",
      "--stationop",
      "NAO",
      "--tagop",
      "XXX",
      "--from",
      "20220101",
      "--to",
      "20221231",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("No data found");

    consoleLogSpy.mockRestore();
  });
});

describe("Admin CLI Tests - addpasses", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(".auth_token")) {
      fs.unlinkSync(".auth_token");
    }
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test("should return an error when user is not logged in", async () => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const args = [
      "node",
      "se2408",
      "admin",
      "--addpasses",
      "--source",
      "/some/path/to/file.csv",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");
    consoleErrorSpy.mockRestore();
  });

  test("should return an error when a file does not exist", async () => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "admin",
      "--passwd",
      "kodikos",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "admin",
      "--addpasses",
      "--source",
      "nonexistent.csv",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: File does not exist."
    );
    consoleErrorSpy.mockRestore();
  });

  test("should return an error when file is not a valid CSV", async () => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "admin",
      "--passwd",
      "kodikos",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "admin",
      "--addpasses",
      "--source",
      "index.js",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: The file is not a valid CSV file."
    );
    consoleErrorSpy.mockRestore();
  });

  test("should add passes successfully with a valid CSV file", async () => {
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "admin",
      "--passwd",
      "kodikos",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "admin",
      "--addpasses",
      "--source",
      "../back-end/files/small_sample.csv",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("Passes added successfully!");
  });
});

describe("Admin CLI Tests - users", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(".auth_token")) {
      fs.unlinkSync(".auth_token");
    }
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("should return an error when user is not logged in", async () => {
    const args = ["node", "se2408", "admin", "--users"];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");
  });
  test("should return a valid user list when admin is logged in", async () => {
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "admin",
      "--passwd",
      "kodikos",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    const args = ["node", "se2408", "admin", "--users"];
    await program.parseAsync(args);

    const loggedOutput = consoleLogSpy.mock.calls[0]?.[0];

    let parsedOutput;

    try {
      parsedOutput = JSON.parse(loggedOutput); // Ensure we parse the JSON correctly
    } catch (error) {
      parsedOutput = eval(loggedOutput); // If JSON parsing fails, evaluate the string as JS
    }

    // Check if the output is an array
    expect(Array.isArray(parsedOutput)).toBe(true);

    // Check if all items in the array are strings (usernames)
    expect(parsedOutput.every((item) => typeof item === "string")).toBe(true);
  });
});

describe("Admin CLI Tests - usermod", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(".auth_token")) {
      fs.unlinkSync(".auth_token");
    }
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("should return an error when user is not logged in", async () => {
    const args = [
      "node",
      "se2408",
      "admin",
      "--usermod",
      "--username",
      "username",
      "--passw",
      "password",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");
  });

  test("should return an authorization error when logged in as a non-admin user", async () => {
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "gefyra",
      "--passwd",
      "password",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "admin",
      "--usermod",
      "--username",
      "username",
      "--passw",
      "password",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 401: Not authorized action"
    );
  });

  test("should return an error when modifying an invalid username", async () => {
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "admin",
      "--passwd",
      "kodikos",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "admin",
      "--usermod",
      "--username",
      "invalid",
      "--passw",
      "password",
    ];
    await program.parseAsync(args);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error 400: Invalid username");
  });

  test("should modify a user successfully when logged in as admin", async () => {
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "admin",
      "--passwd",
      "kodikos",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    const args = [
      "node",
      "se2408",
      "admin",
      "--usermod",
      "--username",
      "egnatia",
      "--passw",
      "kodikos",
    ];
    await program.parseAsync(args);

    expect(consoleLogSpy).toHaveBeenCalledWith("success");
  });
});

describe("Reset Stations, Passes CLI Tests", () => {
  const validUsername = "admin";
  const validPassword = "kodikos";
  const unauthorizedUsername = "gefyra";
  const unauthorizedPassword = "password";
  const tokenFilePath = ".auth_token";

  beforeEach(() => {
    // Ensure the .auth_token file does not exist before each test
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(tokenFilePath)) {
      fs.unlinkSync(tokenFilePath);
    }
  });

  test("resetstations should display an error when the user is not logged in", async () => {
    // Spy on console.error to capture the output
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Run the healthcheck command without a token
    const args = ["node", "se2408", "resetstations"];
    await program.parseAsync(args);

    // Check if the correct error message was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");

    // Restore console.error after the test
    consoleErrorSpy.mockRestore();
  });

  test("resetpasses should display an error when the user is not logged in", async () => {
    // Spy on console.error to capture the output
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Run the healthcheck command without a token
    const args = ["node", "se2408", "resetpasses"];
    await program.parseAsync(args);

    // Check if the correct error message was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith("You are not logged in.");

    // Restore console.error after the test
    consoleErrorSpy.mockRestore();
  });

  test("resetstations should display an error for unauthorized execution", async () => {
    // Spy on console.log to suppress output during the test
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    // First, simulate login with unauthorized credentials
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      unauthorizedUsername,
      "--passwd",
      unauthorizedPassword,
    ];
    await program.parseAsync(loginArgs);

    // Spy on console.error to capture the output
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Execute the healthcheck command with an invalid token
    const args = ["node", "se2408", "resetstations"];
    await program.parseAsync(args);

    // Ensure the correct error message is logged for invalid token
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 401: Not authorized action"
    );

    // Restore the original console methods after the test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("resetstations should display an error for unauthorized execution", async () => {
    // Spy on console.log to suppress output during the test
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    // First, simulate login with unauthorized credentials
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      unauthorizedUsername,
      "--passwd",
      unauthorizedPassword,
    ];
    await program.parseAsync(loginArgs);

    // Spy on console.error to capture the output
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Execute the healthcheck command with an invalid token
    const args = ["node", "se2408", "resetpasses"];
    await program.parseAsync(args);

    // Ensure the correct error message is logged for invalid token
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 401: Not authorized action"
    );

    // Restore the original console methods after the test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("resetstations should fail if executed before resetpasses", async () => {
    // Spy on console.log to suppress output during the test
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    // First, simulate login with unauthorized credentials
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    // Spy on console.error to capture the output
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Execute the healthcheck command with an invalid token
    const args = ["node", "se2408", "resetstations"];
    await program.parseAsync(args);

    // Ensure the correct error message is logged for invalid token
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error 400: Cannot reset toll stations. Toll passes must be reset first."
    );

    // Restore the original console methods after the test
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test("resetpasses should successfully execute and return OK status after admin login", async () => {
    // Spy on console.log to capture the output
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    // First, simulate login with valid credentials
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      validUsername,
      "--passwd",
      validPassword,
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    // Execute the healthcheck command with a valid token
    const args = ["node", "se2408", "resetpasses"];
    await program.parseAsync(args);

    // Ensure the output structure is correct
    expect(consoleLogSpy).toHaveBeenCalledWith("OK");
    consoleLogSpy.mockRestore();
  });

  test("resetstations should successfully execute and return OK status after resetpasses execution and admin login", async () => {
    // Spy on console.log to capture the output
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    // First, simulate login with valid credentials
    const loginArgs = [
      "node",
      "se2408",
      "login",
      "--username",
      "admin",
      "--passwd",
      "freepasses4all",
    ];
    await program.parseAsync(loginArgs);

    consoleLogSpy.mockClear();

    // Execute the healthcheck command with a valid token
    const args = ["node", "se2408", "resetpasses"];
    await program.parseAsync(args);

    // Ensure the output structure is correct
    expect(consoleLogSpy).toHaveBeenCalledWith("OK");
    consoleLogSpy.mockRestore();
  });
});
