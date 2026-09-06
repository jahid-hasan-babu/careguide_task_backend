import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import User from "../user/user.model";
import { IRegisterUser, IUserLogin } from "./auth.interface ";

const registerUser = async (payload: IRegisterUser) => {
  const email = payload.email.trim().toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists with this email.");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  const user = await User.create({
    fullName: payload.fullName,
    email,
    password: hashedPassword,
    role: payload.role || "USER",
    interests: payload.interests || [],
  });

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    accessToken,
  };
};

const loginUser = async (payload: IUserLogin) => {
  const email = payload.email.trim().toLowerCase();

  const user = await User.findOne({ email, isDeleted: false }).select("+password");
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  if (user.status === "BLOCKED") {
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is blocked.");
  }

  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect password.");
  }

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    accessToken,
  };
};

export const AuthServices = { registerUser, loginUser };
