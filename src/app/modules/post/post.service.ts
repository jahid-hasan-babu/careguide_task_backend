import { Types } from "mongoose";
import { paginationHelper } from "../../helpers/paginationHelper";
import Post from "./post.model";

const createPost = async (userId: string, payload: { title: string; content: string }) => {
  const post = await Post.create({ ...payload, userId: new Types.ObjectId(userId) });
  return post;
};

const getAllPosts = async (options: { page?: number; limit?: number }) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email"),
    Post.countDocuments(),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: posts,
  };
};

export const PostServices = { createPost, getAllPosts };
