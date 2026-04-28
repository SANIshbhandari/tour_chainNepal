export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "not_found", message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, "unauthorized", message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", public details?: unknown) {
    super(400, "validation_error", message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(409, "conflict", message);
    this.name = "ConflictError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, "forbidden", message);
    this.name = "ForbiddenError";
  }
}
