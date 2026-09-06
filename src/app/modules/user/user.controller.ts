import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { UserServices } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers({
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    search: req.query.search as string,
    role: req.query.role as string,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserById(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, message: "User retrieved successfully.", data: result });
});

const getMyProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await UserServices.getMyProfile(req.user.id);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Profile retrieved successfully.", data: result });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUser(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "User created successfully.", data: result });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.updateUser(req.params.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "User updated successfully.", data: result });
});

const updateMyProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await UserServices.updateUser(req.user.id, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Profile updated successfully.", data: result });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.deleteUser(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, message: "User deleted successfully.", data: result });
});

const getUsersGroupedByInterests = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserServices.getUsersGroupedByInterests();
  sendResponse(res, { statusCode: httpStatus.OK, message: "Users grouped by interests.", data: result });
});

const getUserWithPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserWithPosts(req.params.id);
  sendResponse(res, { statusCode: httpStatus.OK, message: "User posts retrieved successfully.", data: result });
});

export const UserControllers = {
  getAllUsers,
  getUserById,
  getMyProfile,
  createUser,
  updateUser,
  updateMyProfile,
  deleteUser,
  getUsersGroupedByInterests,
  getUserWithPosts,
};
