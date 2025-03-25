interface IApiError {
    status: number;
    message: string;
    data: any | null;
    success: boolean;
    errors: Array<string>;
    stack?: string;
  }
  
  class ApiError extends Error implements IApiError {
    status: number;
    data: any | null;
    success: boolean;
    errors: string[];
  
    constructor(status = 500, message = "Internal Server Error", stack = "") {
      super();
      this.status = status;
      this.success = false;
      this.errors = [];
      this.stack = stack;
      this.message = message;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export default ApiError;