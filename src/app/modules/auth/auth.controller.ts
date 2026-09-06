import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { AuthServices } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "User registered successfully.",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Login successful.",
    data: result,
  });
});

/**
 * POST /auth/refresh
 *
 * Accepts a refresh token in the request body and issues a new access token.
 * The system remains stateless — no session is created or checked.
 */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.refreshAccessToken(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Access token refreshed successfully.",
    data: result,
  });
});

/**
 * POST /auth/logout
 *
 * Stateless logout — the server holds no session state.
 * The client is responsible for deleting both tokens from storage.
 *
 * Security note: the access token remains technically valid until expiration
 * (~15 min). Keep the TTL short to minimise this window.
 */
const logout = catchAsync(async (_req: Request, res: Response) => {
  const result = AuthServices.logout();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: { instructions: result.instructions },
  });
});

export const AuthControllers = { registerUser, loginUser, refreshToken, logout };
