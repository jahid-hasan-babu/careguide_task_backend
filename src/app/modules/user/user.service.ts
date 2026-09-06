import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Types } from "mongoose";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import User from "./user.model";

const getAllUsers = async (options: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const filter: Record<string, any> = { isDeleted: false };
  if (options.role) filter.role = options.role;
  if (options.search) {
    filter.$or = [
      { fullName: { $regex: options.search, $options: "i" } },
      { email: { $regex: options.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: users,
  };
};

const getUserById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID.");
  }
  const user = await User.findOne({ _id: id, isDeleted: false }).select("-password");
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  return user;
};

const getMyProfile = async (id: string) => {
  const user = await User.findOne({ _id: id, isDeleted: false, status: "ACTIVE" }).select("-password");
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  return user;
};

const createUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
  role?: "USER" | "ADMIN";
  interests?: string[];
}) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) throw new ApiError(httpStatus.CONFLICT, "User already exists with this email.");

  const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    password: hashedPassword,
    role: payload.role || "USER",
    interests: payload.interests || [],
  });

  const result = user.toObject() as any;
  delete result.password;
  return result;
};

const updateUser = async (id: string, payload: {
  fullName?: string;
  interests?: string[];
  status?: "ACTIVE" | "BLOCKED";
}) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID.");
  }

  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: payload },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  return user;
};

const deleteUser = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID.");
  }

  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  return { message: "User deleted successfully." };
};

const getUsersGroupedByInterests = async () => {
  const result = await User.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: "$interests" },
    {
      $group: {
        _id: "$interests",
        users: { $push: { _id: "$_id", fullName: "$fullName", email: "$email" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $project: { interest: "$_id", users: 1, count: 1, _id: 0 } },
  ]);
  return result;
};

const getUserWithPosts = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user ID.");
  }

  const result = await User.aggregate([
    { $match: { _id: new Types.ObjectId(userId), isDeleted: false } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },
    { $project: { password: 0 } },
  ]);

  if (!result.length) throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  return result[0];
};

export const UserServices = {
  getAllUsers,
  getUserById,
  getMyProfile,
  createUser,
  updateUser,
  deleteUser,
  getUsersGroupedByInterests,
  getUserWithPosts,
};
