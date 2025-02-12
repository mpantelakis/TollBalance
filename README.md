# TollBalance

## Description

The TollBalance platform is designed to provide comprehensive solutions for managing debts and analyzing traffic and debt related data. The software will serve as a tool for companies to track and settle its debts, track amounts owed, and gain insights into traffic patterns, tolls usage, and revenue distribution by various charts and plots that will be offered. It will also provide historical data and analytics for better financial decision-making. The system will be accessible only to authorized company employees.

## Contributors

### Contributors

- **Antigoni Karanika**: The architect of the website’s API, Antigoni built a solid and scalable backend for the platform. She also crafted the comprehensive documentation, ensuring the API was both easy to use and well understood.

- **Giannis Dimoulas**: The database guru, Giannis handled the intricate details of data management, crafting complex queries that powered the API endpoints. His work ensured the platform’s data layer was optimized and highly reliable.

- **Iliana Maggiori**: The creative mastermind behind the frontend, Iliana brought the software to life with a dynamic and intuitive user interface. Her focus was on delivering a seamless user experience, making sure the platform was not only functional but also visually appealing.

- **Manolis Pantelakis**: The driving force behind the project’s organization and oversight. Manolis took charge of developing the functional API endpoints and the CLI, ensuring both were robust and efficient. He also led the testing efforts for both the functional API and CLI, while documenting the entire process with meticulous attention to detail.

The development of the UML diagrams and the SRS document was a true team effort, showcasing our collective commitment to building a solid foundation for the project.

## Features

- **Frontend**: Built with React, providing a dynamic and interactive user interface.
- **Backend**: Powered by Express.js, handling all API requests and server-side logic.
- **Database**: MySQL is used for managing and storing application data.
- **CLI Tool**: A JavaScript-based CLI tool to interact with the application programmatically.
- **Testing**: Includes functional testing for CLI functionality and Postman API testing to ensure reliable backend endpoints.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [MySQL](https://dev.mysql.com/downloads/)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
- [Postman](https://www.postman.com/downloads/) (for API testing)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ntua/softeng24-08.git
cd softeng24-08
```

### 2. Set up the Backend

#### 1. Install dependencies:

```bash
cd back-end
npm install
```

#### 2. Set up MySQL database:

- Locate `DDL.sql` and `DML.sql` files in back-end/database directory.
- Run the `DDL` script to create the necessary tables by sourcing the SQL script:

```bash
mysql -u your-username -p your-password
source path/to/DDL.sql;
```

- After running the DDL script, run the `DML` script to populate the database with initial data:

```bash
source path/to/DML.sql;
```

### 3. Set up the Frontend

#### Install dependencies:

```bash
cd front-end/react-app
npm install
```

### 4. Set up the CLI Client

```bash
cd cli-client
npm install
```

### 5. Set Up Environment Variables

#### 1. Create the `.env` File in the Backend Directory

In the `back-end` directory, create a `.env` file.

#### 2. Configure the `.env` File with the Following Variables

You need to configure the `.env` file with the necessary environment variables for your database, JWT authentication, and SSL setup:

```text
DB_HOST: The host of your MySQL database
DB_USER: The username for your database
DB_PASSWORD: The password for your database
DB_NAME: The name of the database to use
JWT_SECRET: A secret key for JWT authentication
```

The contents of the .env file should look like the following example:

```text
# Database Configuration
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=toll_balance

# JWT Secret for Authentication
JWT_SECRET=
```

#### 3. Replace Placeholders with the Appropriate Values

Replace `DB_HOST`, `DB_USER` and `DB_PASSWORD` with your MySQL database connection details.

## Running the Application

### 1. Start the Backend Server

Once the backend is set up, you can start the server. Make sure you're in the `back-end` directory, then run the following command:

```bash
node app.js
```

This will start the backend server on https://localhost:9115. If you have configured the .env file correctly, the server should run without any issues.

### 2. Start the Frontend Application

Once the frontend is set up, you can start the React application. Navigate to the front-end/react-app directory and run:

```bash
npm start
```

This will start the frontend application on https://localhost:3000.

### 3. Run the CLI Tool

After setting up the CLI client, you can use the command-line tool to interact with the backend programmatically. To run the CLI tool, navigate to the cli-client directory and use the following command:

```bash
chmod +x index.js
npm link
```

To view all the available options for the CLI tool, run the following command:

```bash
se2408 -h
```

This will display a list of all available commands and options for interacting with the backend.

## Testing

## API Functional Testing with Postman

The tests focus on:

- **Expected Status Code Responses**: Ensures the API returns the correct HTTP status codes, indicating the success or failure of the request.
- **Response Structure**: Verifies that the structure of the API response matches the expected object format or data type, such as JSON or CSV.
- **Content-Type Verification**: Confirms that the response includes the correct Content-Type header, ensuring the response format is as expected.
- **Strict Data Validation**: Ensures the response body adheres to a predefined JSON schema or CSV format, validating the structure of individual objects and arrays.

### Using the Postman Collection

To facilitate testing the API endpoints, a Postman collection is available for download from the project repository. This collection includes predefined requests for all the main API operations, such as authentication, health checks, and data retrieval.

### Using the Postman Collection

### 1. Download the Collection:

- Go to the documentation directory in the project repo.
- Download the Postman_Collection.json file.
- Import into Postman:

### 2. Import the Collection

- Go to File in Postman and import the collection by uploading the downloaded Postman_Collection.json.

### 3. Authenticate:

- Use the POST /auth/login endpoint to get a JWT token for authorized requests.

### 4. Make Requests and Review Responses:

- Select a request from the collection and click Send to execute.
- Check the response in the Postman window.

## CLI Testing

This suite of tests ensures that the command-line interface (CLI) behaves as expected in various scenarios. The tests focus on:

### Authentication:

- Verifying that users need to be authenticated before accessing any commands.
- Checking that invalid credentials result in an error.

### Command Execution:

- Testing that commands execute successfully when the user is properly authenticated.
- Ensuring the system handles expected output correctly.

### Authorization Handling:

- Ensuring that users without valid authentication cannot access restricted commands.
- Verifying that appropriate error messages are shown for unauthorized access.

### Input Validation:

- Ensuring that invalid or improperly formatted inputs are caught and result in meaningful error messages.

### Edge Cases:

- Verifying that the system behaves appropriately when no data is found or when unexpected scenarios occur.

These tests help ensure that the CLI commands function securely, handle errors gracefully, and provide accurate feedback.

## Running CLI Tests

To ensure the correctness of the CLI commands, Jest is used for testing.

Navigate to the cli-client folder:

```bash
cd cli-client
```

Execute the following command inside the cli-client directory to run all CLI tests:

```bash
npm test
```

By following these steps, you can efficiently test the CLI commands to ensure they function correctly and handle various scenarios as expected.

## AI Assistance Logs

### Overview:

Throughout our development process, we have integrated AI tools to support various project phases. The AI_logs folder in our repository serves as a dedicated space for recording these interactions. Each AI-generated response, along with the corresponding prompt, is systematically stored for future reference and analysis.

### Contents of the AI Logs:

The AI_logs folder contains multiple ZIP files, each corresponding to an AI interaction related to a specific aspect of the project. The naming convention for these files is:

`YYYY-MM-DD-[phase]-[id].zip`

Where:

- YYYY-MM-DD → Represents the date of the interaction
- [phase] → Indicates the project phase (design, architecture, testing, or requirements)
- [id] → A numerical identifier

#### Inside Each ZIP File we find:

- **A Text File (.txt) - User Prompt** → This file contains the exact query or request submitted to the AI tool. It provides context for the AI's response.
- **JSON File (.json)** → This file provides a structured summary of the interaction, detailing the context, tools used, time invested, and the perceived quality and impact of the AI's assistance.

For instance, a zip file could contain:

1. `2025-01-10_architecture_1.txt` - The text of our query about architectural decision-making and the responses of the AI tool.
2. `questionnaire.json` - The summary of the interaction with the AI toold for the dialog provided in the .txt file.

### Example JSON Record:

Each AI interaction is documented in a structured JSON format like the following:

```json
{
  "answers": {
    "phase": "architecture",
    "action": "architectural decision",
    "scope": "frontend",
    "action experience": 2,
    "language": "n/a",
    "other language": "<fill in>",
    "aimodel": "chatgpt",
    "aimodel version": "GPT-4o",
    "open source aimodel": "<fill in>",
    "tool option": "online free",
    "experience with tool": 4,
    "time allocated (h)": "1",
    "time saved estimate (h)": "2",
    "quality of ai help": 4,
    "knowledge acquired": 4,
    "generic feeling - now": 4,
    "generic feeling - future": 4,
    "threat level": 4,
    "notes": "<fill in>"
  }
}
```

This structured format ensures consistency in documenting AI interactions and helps in assessing the impact of AI tools on our development process.

### Purpose and Use

The AI log serves as a structured record of our interactions with AI tools throughout the development process. Its key objectives include:

- **Documenting AI Interactions:** This log provides a transparent and organized account of how AI tools contributed to different phases of the project, ensuring traceability and accountability.
- **Assessing AI's Effectiveness:** By analyzing these records, we can evaluate the impact of AI assistance, measuring efficiency gains, knowledge acquisition, and overall usefulness in software development.
- **Guiding Future Projects:** These logs serve as a valuable resource for future teams, offering insights into best practices, potential challenges, and the evolving role of AI in engineering workflows.

By systematically capturing these interactions, we aim to refine our understanding of AI’s capabilities, identify areas for improvement, and explore its long-term potential in software development.
