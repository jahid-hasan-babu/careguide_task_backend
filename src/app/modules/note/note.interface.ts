import { Types } from "mongoose";

export interface INote {
  title: string;
  content: string;
  userId: Types.ObjectId;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
