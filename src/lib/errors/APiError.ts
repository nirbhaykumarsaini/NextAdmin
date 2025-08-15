export default class ApiError extends Error {
  status: boolean;
  statusCode: number; // Add statusCode for HTTP status

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.status = false;
    this.statusCode = statusCode;
    
    Error.captureStackTrace(this, this.constructor);
  }
}