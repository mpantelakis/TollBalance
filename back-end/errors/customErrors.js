class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }

  // Method to return the error response in the desired format
  toJSON() {
    return {
      status: "failed",
      info: this.message,
    };
  }
}

class NoContent extends CustomError {
  constructor(message = "No content") {
    super(message, 204);
  }
}

class BadRequest extends CustomError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

class NotAuthorized extends CustomError {
  constructor(message = "Not authorized") {
    super(message, 401);
  }
}

class InternalError extends CustomError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}

module.exports = {
  NoContent,
  BadRequest,
  NotAuthorized,
  InternalError,
};
