import { Schema, model, Document } from "mongoose";
import { IPost } from "./post.interface";

export interface IPostDocument extends IPost, Document {}

const postSchema = new Schema<IPostDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

postSchema.index({ userId: 1 });

const Post = model<IPostDocument>("Post", postSchema);

export default Post;
