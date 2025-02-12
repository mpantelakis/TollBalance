module.exports = {
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest", // Use Babel to transpile JavaScript and TypeScript files
  },
  testEnvironment: "node", // Use the Node.js environment for testing CLI applications
  moduleFileExtensions: ["js", "mjs", "json", "node"], // Support for different file extensions
};
