import httpStatus from "http-status";
import { Types } from "mongoose";
import ApiError from "../../errors/ApiError";
import { paginationHelper } from "../../helpers/paginationHelper";
import Note from "./note.model";

const createNote = async (userId: string, payload: { title: string; content: string }) => {
  const note = await Note.create({ ...payload, userId: new Types.ObjectId(userId) });
  return note;
};

const getNotes = async (
  requesterId: string,
  requesterRole: string,
  options: { page?: number; limit?: number }
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const filter: Record<string, any> = { isDeleted: false };
  if (requesterRole !== "ADMIN") {
    filter.userId = new Types.ObjectId(requesterId);
  }

  const [notes, total] = await Promise.all([
    Note.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName email"),
    Note.countDocuments(filter),
  ]);

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: notes,
  };
};

const getNoteById = async (noteId: string, requesterId: string, requesterRole: string) => {
  if (!Types.ObjectId.isValid(noteId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid note ID.");
  }

  const filter: Record<string, any> = { _id: noteId, isDeleted: false };
  if (requesterRole !== "ADMIN") {
    filter.userId = new Types.ObjectId(requesterId);
  }

  const note = await Note.findOne(filter).populate("userId", "fullName email");
  if (!note) throw new ApiError(httpStatus.NOT_FOUND, "Note not found.");
  return note;
};

const updateNote = async (
  noteId: string,
  requesterId: string,
  requesterRole: string,
  payload: { title?: string; content?: string }
) => {
  if (!Types.ObjectId.isValid(noteId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid note ID.");
  }

  const filter: Record<string, any> = { _id: noteId, isDeleted: false };
  if (requesterRole !== "ADMIN") {
    filter.userId = new Types.ObjectId(requesterId);
  }

  const note = await Note.findOneAndUpdate(filter, { $set: payload }, { new: true, runValidators: true });
  if (!note) throw new ApiError(httpStatus.NOT_FOUND, "Note not found or unauthorized.");
  return note;
};

const deleteNote = async (noteId: string, requesterId: string, requesterRole: string) => {
  if (!Types.ObjectId.isValid(noteId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid note ID.");
  }

  const filter: Record<string, any> = { _id: noteId, isDeleted: false };
  if (requesterRole !== "ADMIN") {
    filter.userId = new Types.ObjectId(requesterId);
  }

  const note = await Note.findOneAndUpdate(filter, { $set: { isDeleted: true } }, { new: true });
  if (!note) throw new ApiError(httpStatus.NOT_FOUND, "Note not found or unauthorized.");
  return { message: "Note deleted successfully." };
};

export const NoteServices = { createNote, getNotes, getNoteById, updateNote, deleteNote };
