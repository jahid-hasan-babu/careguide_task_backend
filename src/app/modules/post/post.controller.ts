import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { PostServices } from "./post.service";

const createPost = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const result = await PostServices.createPost(req.user.id, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Post created successfully.", data: result });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getAllPosts({
    page: Number(req.query.page),
    limit: Number(req.query.limit),
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Posts retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

export const PostControllers = { createPost, getAllPosts };
