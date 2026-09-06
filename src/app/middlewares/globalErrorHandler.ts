import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import config from "../../config";
import ApiError from "../errors/ApiError";

const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR as number;
  let message = "Something went wrong";
  let errorMessages: { path: string; message: string }[] = [];

  if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorMessages = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessages = [{ path: "", message: error.message }];
  } else if (
    typeof error === "object" &&
    error !== null &&
    ("statusCode" in error || "status" in error)
  ) {
    const err = error as { status?: number; statusCode?: number; type?: string; message?: string };
    statusCode = err.statusCode || err.status || httpStatus.INTERNAL_SERVER_ERROR;
    message =
      err.type === "entity.too.large"
        ? "Payload size exceeds permitted limit (50kb)"
        : err.message || "Request error";
    errorMessages = [{ path: "", message }];
  } else if (error instanceof Error) {
    message = error.message || "Unexpected error";
    errorMessages = [{ path: "", message: error.message }];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    ...(config.env !== "production" && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};

export default globalErrorHandler;
