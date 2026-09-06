import { CookieOptions, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { AuthServices } from "./auth.service";

const REFRESH_COOKIE_NAME = "refreshToken";

const getCookieOptions = (): CookieOptions => {
  const isProduction = config.env === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching JWT_REFRESH_EXPIRES_IN
    path: "/",
  };
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Registration successful. Please verify the OTP sent to your email.",
    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyOtp(req.body);

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Email verified successfully.",
    data: result,
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.resendOtp(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: { email: result.email },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Login successful.",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Refresh token is required.");
  }

  const result = await AuthServices.refreshAccessToken({ refreshToken: token });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Access token refreshed successfully.",
    data: result,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  const isProduction = config.env === "production";
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  const result = AuthServices.logout();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: {
      instructions: result.instructions,
    },
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

const verifyResetOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.verifyResetOtp(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Reset code verified successfully.",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const isProduction = config.env === "production";
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  const result = await AuthServices.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required.");
  }

  const isProduction = config.env === "production";
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });

  const result = await AuthServices.changePassword(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: result.message,
    data: null,
  });
});

export const AuthControllers = {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  refreshToken,
  logout,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
};

