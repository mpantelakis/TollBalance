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
