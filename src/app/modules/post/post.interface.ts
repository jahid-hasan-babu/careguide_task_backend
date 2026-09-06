import { Types } from "mongoose";

export interface IPost {
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
