import { Schema, model, Document, Types } from "mongoose";
import { INote } from "./note.interface";

export interface INoteDocument extends INote, Document {}

const noteSchema = new Schema<INoteDocument>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ _id: 1, userId: 1 });

const Note = model<INoteDocument>("Note", noteSchema);

export default Note;
